# CircularCheck AI — Firestore Security Specification

## 1. Data Invariants
1. **Owner & Role Integrity**: A user document at `/users/{userId}` can only be created with `role == 'user'` unless the authenticated user matches the verified bootstrapped admin email (`abdullahalamin761740@gmail.com`). Users cannot elevate their own `role` or `status`.
2. **PII Isolation**: User email addresses reside exclusively in `/users/{userId}/private/info`, readable and writable only by the owner (`request.auth.uid == userId`) or a verified admin.
3. **Scan Ownership & Immutability**: A scan report at `/scans/{scanId}` must belong to `request.auth.uid`, enforce server timestamp `request.time` for `createdAt`/`updatedAt`, and restrict non-admin updates strictly to `['isSaved', 'updatedAt']`.
4. **Community Report Moderation**: New reports at `/communityReports/{reportId}` must enter with `moderationStatus == 'pending'` and `adminNotes == ''`. Only verified admins may change `moderationStatus` or `adminNotes`. Public listing/reads are strictly gated to `resource.data.moderationStatus == 'approved'` unless read by the owner or an admin.
5. **Verification Registry Governance**: `/verificationSources/{sourceId}` is publicly readable as a reference directory, while all mutations are strictly restricted to verified admins.
6. **Immutable Audit Trail**: `/activityLogs/{logId}` entries are append-only for verified signed-in users matching `userId`, readable only by admins, and never updatable or deletable.

## 2. Adversarial Test Payloads ("Dirty Dozen")
1. Self-privilege escalation on `/users/{uid}` creation (`role: 'admin'`). -> `PERMISSION_DENIED`
2. Non-admin updating `role` or `status` on `/users/{uid}`. -> `PERMISSION_DENIED`
3. Non-owner reading `/users/{otherUid}/private/info` PII document. -> `PERMISSION_DENIED`
4. Unverified email user writing a scan to `/scans/{id}`. -> `PERMISSION_DENIED`
5. Identity spoofing on `/scans/{id}` (`userId: 'other_uid'`). -> `PERMISSION_DENIED`
6. Forged client timestamp on `/scans/{id}` (`createdAt: '2020-01-01'`). -> `PERMISSION_DENIED`
7. Shadow field injection on `/scans/{id}` (`isVerified: true`). -> `PERMISSION_DENIED`
8. Non-admin mutating `riskScore` on an existing `/scans/{id}`. -> `PERMISSION_DENIED`
9. Submitting a community report pre-marked `moderationStatus: 'approved'`. -> `PERMISSION_DENIED`
10. Non-admin listing unapproved (`pending`/`rejected`) community reports. -> `PERMISSION_DENIED`
11. Path poisoning with oversized or invalid characters in document ID (`../../evil`). -> `PERMISSION_DENIED`
12. Non-admin mutating `/verificationSources/{id}` or deleting `/activityLogs/{id}`. -> `PERMISSION_DENIED`
