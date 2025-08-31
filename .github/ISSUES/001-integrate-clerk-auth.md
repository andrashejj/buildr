# 001 — Integrate Clerk auth for API + UI (email + social)

Priority: P0
Estimate: 1d

Status: Partially implemented in API

Description

Clerk is already integrated on the API side (see `api/server.ts` and `api/middleware/auth/index.ts`) and the API verifies sessions via `getAuth` and `clerkClient`. The remaining tasks are: wire Clerk into the UI, ensure social providers are configured, and confirm client-side session handling.

Acceptance criteria

- API validates Clerk sessions for protected TRPC routes (already implemented).
- UI sign-in/sign-up pages integrate Clerk (client SDK) and expose user session.
- Social providers configured in env and tested.

Next actions

- Add Clerk client SDK usage in the UI and a minimal sign-in/sign-up screen (or adapt existing sign-in components to use Clerk).
- Add required Clerk env vars to `config/envs/*` and document steps to create Clerk keys.
