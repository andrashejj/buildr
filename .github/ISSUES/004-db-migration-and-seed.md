# 004 — Create database migration & minimal seed (dev)

Priority: P0
Estimate: 0.5d

Status: Not implemented

Description

Create an initial migration and a deterministic seed script that inserts a dev owner user, a dev pro user, and an example project with one room. This enables quick local testing.

Acceptance criteria

- Migration files exist under `api/prisma/migrations`.
- `pnpm prisma migrate dev` applies locally.
- `pnpm prisma db seed` populates minimal data for local testing.

Next actions

- Add a `prisma/seed.ts` script under `api/prisma/` that uses the generated Prisma client.
- Document migration and seed steps in `docs/README.md`.
