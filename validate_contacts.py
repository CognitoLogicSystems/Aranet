#!/usr/bin/env python3
"""Validate outreach records before they can be committed."""

import csv
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


REQUIRED_FIELDS = {
    "company_name",
    "trade_type",
    "phone",
    "email_or_contact_route",
    "verified_source_url",
    "verified_by",
    "verified_timestamp",
    "status",
}
APPROVED_DOMAINS = {
    "har-con.com",
    "repipesolutionsinc.com",
    "sayeplumbing.com",
    "traditionservices.com",
    "members.ghba.org",
    "members.texasbuilders.org",
    "bbb.org",
}
ROUTE_VALUES = {"phone_only", "web_form"}
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_PATTERN = re.compile(r"\d{3}.*\d{3}.*\d{4}")


def approved_source(url):
    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower().removeprefix("www.")
    return parsed.scheme in {"http", "https"} and any(
        hostname == domain or hostname.endswith(f".{domain}")
        for domain in APPROVED_DOMAINS
    )


def validate(path):
    errors = []
    with path.open(newline="", encoding="utf-8") as stream:
        reader = csv.DictReader(stream, skipinitialspace=True)
        headers = {header.strip() for header in reader.fieldnames or []}
        missing = REQUIRED_FIELDS - headers
        if missing:
            errors.append(f"missing required columns: {', '.join(sorted(missing))}")

        for line_number, row in enumerate(reader, start=2):
            row = {key.strip(): (value or "").strip() for key, value in row.items()}
            company = row.get("company_name", "") or f"line {line_number}"
            row_errors = []

            for field in REQUIRED_FIELDS:
                if not row.get(field):
                    row_errors.append(f"{company} line {line_number}: {field} is required")

            source_url = row.get("verified_source_url", "")
            if source_url and not approved_source(source_url):
                row_errors.append(f"{company} line {line_number}: source URL is not approved: {source_url}")

            route = row.get("email_or_contact_route", "")
            if route in ROUTE_VALUES:
                pass
            elif not EMAIL_PATTERN.fullmatch(route):
                row_errors.append(
                    f"{company} line {line_number}: contact route must be a real email, phone_only, or web_form"
                )

            if row.get("phone") and not PHONE_PATTERN.search(row["phone"]):
                row_errors.append(f"{company} line {line_number}: phone number is malformed")

            if row.get("verified_by", "").lower() in {"ai", "gemini", "assistant", "system"}:
                row_errors.append(f"{company} line {line_number}: AI cannot be the verifier")

            if row.get("status", "").upper() == "SENT" and row_errors:
                row_errors.append(f"{company} line {line_number}: SENT row failed verification")

            errors.extend(row_errors)

    return errors


if __name__ == "__main__":
    target = Path(sys.argv[1] if len(sys.argv) > 1 else "outreach_tracker.csv")
    failures = validate(target)
    if failures:
        print("[-] Outreach verification gate failed:")
        print("\n".join(f"  - {failure}" for failure in failures))
        raise SystemExit(1)
    print(f"[+] Outreach verification gate passed: {target}")