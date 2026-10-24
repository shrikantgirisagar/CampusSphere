# CampusSphere — Sanitized Public & Demo Dataset

## Overview

This directory (`data/sanitized/`) contains a sanitized snapshot of the CampusSphere system records generated automatically by `services/fileSyncService.js`.

### Purpose
- **Public & Demo Sharing**: Provides a safe, distributable dataset that can be shared, demonstrated, or committed to public version control without exposing sensitive authentication credentials or private secrets.
- **Operational Data Isolation**: Completely decoupled from operational runtime files (`data/database.json` and `data/users.json`), ensuring operational source data is never altered or corrupted.
- **Disaster Recovery Safety**: Prevents test fixtures or sanitized files from accidentally overwriting operational database records.

---

## Dataset Contents

| File | Purpose | Sensitive Fields Excluded & Transformations |
| :--- | :--- | :--- |
| `data/sanitized/users.json` | Sanitized user accounts (Students, Faculty, Administrators) | Strict allowlist: `passwordHash`, `password`, `token`, `sessionToken`, `secret`, `authToken`, `resetToken`, `__v`, `_id`, and `profilePic` excluded. Real names and emails replaced with synthetic demo identities (`Demo Student`, `user@demo.campussphere.local`). |
| `data/sanitized/database.json` | Full academic database snapshot (Counts, AcademicStore, Divisions, Timetables, Syllabi) | Strict allowlist: user credentials and PII replaced with synthetic demo data. Individual student mark profiles (`students`), daily attendance records (`dailyAttendance`), submissions, and server filesystem paths (`storagePath`) redacted. |

---

## Security Guarantees

1. **Zero Credential Exposure**:
   - All password hashes, raw passwords, authentication tokens, session secrets, reset tokens, and internal database identifiers (`_id`, `__v`) are completely excluded.
2. **Strict Schema Allowlist & Synthetic Demo Identities**:
   - An explicit, schema-aware allowlist is enforced; unexpected or unknown fields are discarded.
   - Real personal names and real institutional email addresses are replaced with synthetic demo identities (`Demo Student X`, `${username}@demo.campussphere.local`).
3. **Academic PII Redaction**:
   - Individual student mark profiles, daily attendance logs, and personal submissions are redacted from academic snapshots.
   - System catalog configurations (curricula, subjects, divisions, timetables, syllabi metadata) remain preserved for sandbox testing.
4. **Schema & Relationship Preservation**:
   - User `id`, `username`, `role`, `courseYear`, `semester`, `division`, `subject`, and `department` fields remain structurally consistent.
   - Cross-collection references are maintained for demo UI functionality.
5. **Operational Data Isolation**:
   - `services/fileSyncService.js` maintains this sanitized dataset using independent atomic file writes.
   - Operational runtime files (`data/database.json` and `data/users.json`) remain strictly decoupled and intact.

---

## Usage Instructions

### For Public Repository Demos
To bundle sample data with a public release without exposing operational hashes:
```bash
# Verify sanitized dataset integrity
node -e "const u = require('./data/sanitized/users.json'); console.log('Users:', u.length, 'Hashes exposed:', u.some(x => x.passwordHash));"
```

### Loading into an Isolated Sandbox Environment
If importing into an isolated local demo database:
1. Ensure `MONGODB_URI` points to a dedicated local or test database instance.
2. Ensure accounts in the sanitized dataset are assigned local passwords via the administration portal or test seeding scripts before attempting login (since credentials have been removed).
