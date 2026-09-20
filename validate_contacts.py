import csv
import sys
import re

PHONE_REGEX = re.compile(r'^\(\d{3}\)\s\d{3}-\d{4}$')
REQUIRED_COLUMNS = [
    "Company", "Trade", "Phone", "Contacted_Date", "Status",
    "Session_Date", "Notes", "verified_source_url", "verified_timestamp", "verified_by"
]

def validate():
    errors = []
    try:
        with open("outreach_tracker.csv", mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            missing_cols = [col for col in REQUIRED_COLUMNS if col not in (reader.fieldnames or [])]
            if missing_cols:
                print(f"[REJECTED] Missing required columns: {missing_cols}")
                sys.exit(1)

            for idx, row in enumerate(reader, start=2):
                company = row.get("Company", f"Row {idx}")
                
                # Check Phone Format
                phone = row.get("Phone", "").strip()
                if not PHONE_REGEX.match(phone):
                    errors.append(f"Row {idx} [{company}]: Invalid phone format '{phone}'. Must match (XXX) XXX-XXXX")

                # Check Verification Fields
                if not row.get("verified_source_url", "").strip().startswith("http"):
                    errors.append(f"Row {idx} [{company}]: Missing or non-HTTP verified_source_url")

                if not row.get("verified_timestamp", "").strip():
                    errors.append(f"Row {idx} [{company}]: Missing verified_timestamp")

                if not row.get("verified_by", "").strip():
                    errors.append(f"Row {idx} [{company}]: Missing verified_by identifier")

                # Check Status Transition Gate
                status = row.get("Status", "").strip().upper()
                if status == "SENT" and not (row.get("verified_source_url") and row.get("verified_by")):
                    errors.append(f"Row {idx} [{company}]: Cannot set Status to SENT without complete verification metadata")

    except FileNotFoundError:
        print("[REJECTED] outreach_tracker.csv not found.")
        sys.exit(1)

    if errors:
        print(f"[FAILED] {len(errors)} validation error(s) detected:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)

    print("[PASSED] outreach_tracker.csv verification clean.")
    sys.exit(0)

if __name__ == "__main__":
    validate()
