# buildr — MVP TODO (founder single-person sprint)

This is a focused, prioritized list of tasks (≤20) for a single founder to deliver the MVP described in the product docs. Items are ordered: highest priority first. Each item includes a one-line acceptance check.

1. Integrate Clerk auth for API + UI (email + social) — Acceptance: users can sign up/sign in and session is validated.
2. Add role-selection onboarding (homeowner vs pro) and persist `user.role` — Acceptance: new users set role and see role-based redirect.
3. Define Prisma schema for core models (User, Project, Room, Proposal, PortfolioItem, Message, Task) — Acceptance: prisma generate succeeds.
4. Create database migration & minimal seed (dev user owner + pro + sample project) — Acceptance: seeds applied locally.
5. Implement TRPC router stubs for core CRUD endpoints (projects, proposals, portfolio, messages) — Acceptance: endpoints respond with validated shapes.
6. Implement project create backend (accept title, description, media refs, rooms, budget; validate ≥1 photo & ≥1 room) — Acceptance: project saved and returned.
7. Implement simple media upload flow (signed S3-compatible upload tokens or dev local upload) — Acceptance: client can upload and receive stable URLs.
8. Build a minimal multi-step Create Project UI (title → media → description → rooms → budget → publish) — Acceptance: owner can publish a project and it appears in their list.
9. Implement Pro profile update & portfolio CRUD backend — Acceptance: pro can create/update profile and portfolio items.
10. Create minimal Pro profile & portfolio UI (edit + gallery) — Acceptance: portfolio items visible to other users.
11. Implement send-lead endpoint: owner sends project to a selected pro → create Proposal record — Acceptance: Proposal exists for pro with status=open.
12. Implement proposals listing for pros (filter by status) — Acceptance: pro can view incoming proposals.
13. Implement messaging backend (threaded messages scoped to project/proposal) — Acceptance: messages persist and are retrievable per thread.
14. Build minimal messaging UI (thread view + send) — Acceptance: messages send and render in thread.
15. Add in-app notification records for events (new lead, new message) and a notifications list endpoint — Acceptance: recipient sees new notifications.
16. Add authorization checks to API (owners/pros only access their resources) — Acceptance: forbidden access returns 403.
17. Add TypeScript types and simple validation (zod) to TRPC inputs/outputs — Acceptance: invalid input rejected with clear errors.
18. Add 3 smoke tests (createProject, sendLead/createProposal, sendMessage) — Acceptance: tests run locally and pass.
19. Run CI-like quality gates locally: pnpm tsc, linter, and run tests — Acceptance: tsc & tests pass.
20. Create short README dev notes: how to run API, run migrations, seed, and quick manual QA steps — Acceptance: README added to `docs/` and is linkable.

Notes

- Keep each feature minimal and iteratively improve. Defer push notifications, payments, advanced AI parsing, maps, and SEO to post-MVP.
- If storage/S3 is not available, use dev-local uploads with clear replacement later.

If you'd like, I can convert these into GitHub issues (title + body + acceptance + estimate) starting with the top 5.
