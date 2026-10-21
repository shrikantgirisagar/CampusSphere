# CampusSphere — Sanitized Public & Demo Dataset

## Overview

This directory (`data/sanitized/`) contains a sanitized snapshot of the CampusSphere system records generated automatically by `services/fileSyncService.js`.

### Purpose
- **Public & Demo Sharing**: Provides a safe, distributable dataset that can be shared, demonstrated, or committed to public version control without exposing sensitive authentication credentials or private secrets.
- **Operational Data Isolation**: Completely decoupled from operational runtime files (`data/database.json` and `data/users.json`), ensuring operational source data is never altered or corrupted.
- **Disaster Recovery Safety**: Prevents test fixtures or sanitized files from accidentally overwriting operational database records.

---

## Dataset Contents

| File | Purpose | Sensitive Fields Excluded |
| :--- | :--- | :--- |
| `data/sanitized/users.json` | Sanitized user accounts (Students, Faculty, Administrators) | `passwordHash`, `password`, `token`, `sessionToken`, `secret`, `__v` |
| `data/sanitized/database.json` | Full academic database snapshot (Counts, AcademicStore, Divisions, Timetables, Syllabi) | All user credentials & tokens stripped from `users` array |

---

## Security Guarantees

1. **Zero Credential Exposure**:
   - Every user record in this directory has `passwordHash` and `password` removed.
   - All session tokens, authentication secrets, and internal Mongoose version keys (`__v`) are stripped.
2. **Schema & Relationship Preservation**:
   - User `id`, `username`, `name`, `role`, `courseYear`, `semester`, `division`, `subject`, and `department` fields remain intact.
   - Cross-collection references (e.g. between timetables, notes, assignments, and user records) are preserved.
3. **Automated Synchronization**:
   - `services/fileSyncService.js` automatically maintains this sanitized dataset using atomic file writes.
   - Failed or interrupted write operations cannot leave orphaned temporary files or corrupt existing datasets.

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
