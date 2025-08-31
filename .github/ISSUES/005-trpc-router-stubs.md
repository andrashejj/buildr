# 005 — Implement TRPC router stubs for core CRUD endpoints

Priority: P0
Estimate: 0.5d

Status: Partially implemented

Description

TRPC core infra is implemented (`api/controllers/trpc/*`) and `project` and `user` routers exist and are mounted. Remaining routers to add: `proposals`, `portfolio`, `messages`. Implement zod validation and wire to Prisma.

Acceptance criteria

- New routers (`proposals`, `portfolio`, `messages`) are added and mounted in `appRouter`.
- Each route validates input with zod and enforces auth for protected routes.

Next actions

- Implement basic CRUD for proposals, portfolio items, and message threads using Prisma and protectedProcedure.
