# 003 — Define Prisma schema for core models

Priority: P0
Estimate: 0.5d

Status: Partially implemented

Description

A Prisma setup already exists under `api/prisma/schema/` (see `schema.prisma`, `user.prisma`, `project.prisma`). Update or extend the schema to add missing models (Proposal, PortfolioItem, Room, Message, Task) and run `prisma generate`.

Acceptance criteria

- Schema compiles and `prisma generate` completes.
- New models added with relations and timestamps.

Next actions

- Add missing model files to `api/prisma/schema/` and run migration.
- Ensure zod/json generators are configured for generated types.
