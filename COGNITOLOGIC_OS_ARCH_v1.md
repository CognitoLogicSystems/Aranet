
## Data Governance & Ingestion Gates

### Outreach & Lead Verification Gate
All external business and prospect records stored in `outreach_tracker.csv` must pass programmatic validation prior to ingestion or repository commit.

- **Mandatory Verification Attributes:**
  - `verified_source_url`: Official association or registered corporate web endpoint.
  - `verified_timestamp`: ISO-8601 UTC execution timestamp.
  - `verified_by`: Identity or verified system ID of the human operator.
- **Enforcement Mechanism:**
  - Local `.git/hooks/pre-commit` invokes `validate_contacts.py`.
  - Commits containing malformed phones, unverified routes, or missing metadata are rejected automatically.
  - Rows may only advance to `SENT` if strictly verified.
