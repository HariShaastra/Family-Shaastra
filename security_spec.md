# Security Specification - Family Shaastra

## Data Invariants
1. A **Memory** must always be associated with a valid `userId` matching the creator and have a valid date.
2. A **FamilyMember** must belong to the user's personal lineage (`userId` match).
3. An **Invitation** can only be created by the sender and read by either the sender or the recipient (via email match).
4. A **TimeCapsule** is sealed until its `openingDate`. Only the owner can manage it, but its presence is public (or shared). Actually, for privacy, only the owner should see it until it's open? The current app logic shows it to the owner.
5. An **Event** belongs to a `userId` and must have a valid status and date.
6. User profiles are private to the user themselves, though others can read them if they have the ID (e.g. for invitations)? Actually, `isAuthenticated()` can read users is fine for finding people, but we should be careful with PII.

## The "Dirty Dozen" Payloads (Red Team Payloads)

1. **Identity Spoofing (Memory)**: Attempt to create a memory for another user.
   ```json
   { "userId": "victim_uid", "title": "Stolen Memory", "date": "2023-01-01" }
   ```
2. **State Shortcutting (Event)**: Attempt to update an event directly to 'executed' without being the owner.
   ```json
   { "status": "executed" }
   ```
3. **Resource Poisoning (FamilyMember)**: Inject extremely large string into name.
   ```json
   { "name": "A".repeat(10000), "relation": "Brother" }
   ```
4. **Identity Poisoning (TimeCapsule)**: Create a capsule with a malicious ID containing script tags.
   ```json
   // Document ID: <script>alert(1)</script>
   ```
5. **PII Leak (User)**: Attempt to read another user's profile if not authorized.
6. **Ghost Field Injection**: Add `isAdmin: true` to a memory document.
   ```json
   { "userId": "my_uid", "title": "Memory", "date": "2023-01-01", "isAdmin": true }
   ```
7. **Bypassing Seal (TimeCapsule)**: Attempt to read `description` of a locked capsule as a non-owner.
8. **Orphaned Write (FamilyMember)**: Create a member with a non-existent `parentId`.
9. **Email Spoofing (Invitation)**: Create an invitation using another user's email as sender name.
10. **Terminal State Lock Bypass**: Attempt to edit an 'executed' event.
11. **Massive Array Attack**: Create a memory with 10,000 tags.
12. **Timestamp Fraud**: Provide a client-side `createdAt` date from the past/future.

## Test Runner (firestore.rules.test.ts)
(To be implemented to verify these rejections)
