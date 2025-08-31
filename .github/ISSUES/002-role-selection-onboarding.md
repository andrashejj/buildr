# 002 — Role-selection onboarding (homeowner vs pro)

Priority: P0
Estimate: 0.5d

Status: Not yet implemented (backend support present)

Description

Role selection UI is not present in the codebase, but the backend user model supports storing role (see `api/prisma/schema/user.prisma` which includes Clerk sync fields and `api/modules/user` contains helpers). Implement a lightweight role-selection screen and persist role to the user's record.

Acceptance criteria

- Add a role selection step after first sign-in and persist `role` to the user record.
- Ensure role can be updated in profile settings.

Next actions

- Add a small UI screen in the onboarding flow with two buttons (homeowner/pro) and a POST to update user role via TRPC.
