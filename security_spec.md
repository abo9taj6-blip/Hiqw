# Security Specification - Shirqat Guide

## Data Invariants
1. Most resources (doctors, taxis, restaurants, etc.) are read-only for public users and writeable only by admins.
2. AuditLog is writeable only by admins during their operations.
3. Alerts are read-only for public and writeable only by admins.
4. `User` profiles are only writeable by the user themselves (except for the `isAdmin` field which is only writeable by other admins or set via system).

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (Doctors):** Non-admin trying to create a doctor.
2. **Identity Spoofing (Admin):** User trying to set `isAdmin: true` on their own profile.
3. **Identity Spoofing (Gas Stations):** Non-admin trying to create a gas station.
4. **State Shortcutting:** User trying to bypass field immutability on sensitive items.
5. **Resource Poisoning:** Trying to set a doctor's name to a 1MB string.
6. **Orphaned Write:** Creating a banner with a `targetId` that doesn't exist (though rules limit DB lookups in some cases, we'll enforce schema).
7. **Unauthorized Deletion:** Non-admin trying to delete a restaurant.
8. **Shadow Update (Craftsmen):** Admin updating a craftsman with an extra hidden field `isVerified: true` (if not in schema).
9. **PII Leak:** Trying to list all users to see emails.
10. **Timestamp Fraud:** User trying to spoof system timestamps.
11. **ID Poisoning:** Trying to create a doctor with a massive junk ID.
12. **Recursive Attack:** Trying to trigger many document lookups in a list query.

## Test Strategy (to be implemented in firestore.rules.test.ts)
- Verify `PERMISSION_DENIED` for all "Dirty Dozen" attempts.
- Verify successful reads for public users.
- Verify successful writes for admin user (`9botaj7@gmail.com` logic).
