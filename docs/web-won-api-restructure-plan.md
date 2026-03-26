# Web to `won-api` Restructure Plan

## Objective

Convert `WON` into a pure web client that consumes `won-api` as the only backend source of truth, while removing domain, database, and auth coupling from the web repo.

Target outcome:

- `won-api` owns backend logic, Prisma, migrations, auth verification, AI generation, email, storage, and business rules.
- `WON` owns web UI, routing, SSR/CSR rendering, and client-side state orchestration only.
- `won-mobile` and `WON` consume the same contracts and the same backend behavior.

## Current State Summary

### `WON`

`WON` is still a monolith. It mixes:

- Next.js web UI
- NextAuth-based auth
- direct Prisma access from server components and layouts
- internal route handlers in `src/app/api/*`

Main coupling points found:

- direct Prisma reads in pages/layouts
- local route handlers for onboarding, AI generation, profile, auth, and workouts
- duplicated validation and DTO definitions
- local auth session model tied to NextAuth

### `won-api`

`won-api` already covers most of the required backend surface:

- auth
- onboarding
- plans list/detail/delete/generate
- user home/profile/me
- profile image management
- password reset flows
- bridge support for Supabase auth
- compatibility routes for the old web API shape

This repo is the correct place to become the system backend.

### `won-mobile`

`won-mobile` already uses the right boundary pattern:

- typed API client
- transport layer
- auth provider
- feature hooks
- no Prisma or backend logic in screens

Its structure should be reused as the web migration reference.

## Non-Negotiable Decisions

1. `won-api` becomes the only owner of Prisma schema and migrations.
2. `WON` must stop importing Prisma and stop reading the database directly.
3. `WON` must stop owning domain route handlers in `src/app/api/*`.
4. Shared contracts must come from the backend, not be handwritten independently in each client.
5. Final auth target should be `Supabase Auth + won-api bootstrap`, not permanent `NextAuth + local Prisma`.

## Recommended Target Architecture

### Repo responsibilities

| Repo | Responsibility |
| --- | --- |
| `won-api` | canonical backend, domain logic, DB, auth verification, AI generation, email, storage, rate limits, contracts |
| `WON` | web routes, UI, SSR/CSR rendering, feature hooks, API consumption, session orchestration |
| `won-mobile` | mobile UI, local device storage, feature hooks, API consumption |

### Auth model

Recommended final model:

- `won-api` runs with `AUTH_PROVIDER=supabase`
- web and mobile authenticate with Supabase directly
- both apps call `POST /api/auth/bootstrap` to link or create the internal `User`
- `won-api` verifies bearer tokens and maps them to internal app users

Why this is the best final state:

- it aligns web and mobile on one auth system
- it removes `NextAuth` from the web repo
- it keeps `won-api` stateless regarding browser sessions
- it matches the bridge already implemented in `won-api` and `won-mobile`

Bridge option if needed:

- temporarily keep `won-api` in `legacy` auth mode for an earlier cutover
- migrate the web app to backend-issued bearer tokens first
- then move both clients to Supabase

This is acceptable only as a transition, not as the final architecture.

### Contract model

Recommended contract ownership:

- backend schemas are defined in `won-api`
- backend publishes OpenAPI or generated TypeScript contracts
- web and mobile consume generated types, not handwritten duplicates

Minimum acceptable fallback:

- a small shared `contracts` package sourced from `won-api`

## Workstreams

### Workstream A: Backend Canonicalization

Goal:

- make `won-api` the only backend truth

### Workstream B: Web Client Foundation

Goal:

- create the same client-side API architecture already used in `won-mobile`

### Workstream C: Web Auth Migration

Goal:

- remove `NextAuth` and move to the shared auth strategy

### Workstream D: Web Read Path Migration

Goal:

- replace all server-side Prisma reads with backend consumption

### Workstream E: Web Write Path Migration

Goal:

- replace all local route handlers and raw mutations with backend requests

### Workstream F: Deletion and Cleanup

Goal:

- remove internal backend code from `WON`

### Workstream G: Verification and Rollout

Goal:

- cut over safely without regressions

## Phase Plan

## Phase 0: Architecture Freeze and Ownership

### Tasks

- Declare `won-api` as the only owner of Prisma schema, migrations, and database-level business logic.
- Freeze new backend feature work in `WON`.
- Decide final auth target. Recommended: Supabase.
- Create an env matrix for all repos.
- Define deprecation policy for local `WON` route handlers.

### Deliverables

- architecture decision record
- env matrix
- migration sequence approved

### Acceptance Criteria

- no new domain endpoint is added to `WON`
- all backend changes are planned against `won-api`
- auth target is explicitly approved

## Phase 1: Harden `won-api` as the Canonical Backend

### Tasks

- Review every endpoint used by `WON` and `won-mobile` and map it to a canonical backend contract.
- Normalize payload and response shapes across:
  - `/api/auth/signup`
  - `/api/auth/signin`
  - `/api/auth/bootstrap`
  - `/api/auth/change-password`
  - `/api/auth/delete-account`
  - `/api/auth/forgot-password`
  - `/api/auth/verify-reset-code`
  - `/api/auth/reset-password`
  - `/api/auth/forgot-password-token`
  - `/api/auth/security-token`
  - `/api/onboarding`
  - `/api/user/me`
  - `/api/user/home`
  - `/api/user/profile`
  - `/api/user/profile-image`
  - `/api/plans`
  - `/api/plans/:planId`
  - `/api/plans/generate`
- Add or keep compatibility aliases only as a bridge, not as the primary shape.
- Add backend contract tests for the endpoints above.
- Add structured error codes and verify they are stable.
- Decide whether `won-api` will expose OpenAPI or a generated contract artifact.

### Important Technical Notes

- `won-api` schema already contains Supabase bridge fields not present in `WON`.
- That drift must end immediately.
- `won-api` should be the only place where schema evolution happens.

### Deliverables

- canonical API contract
- backend tests
- contract publication strategy

### Acceptance Criteria

- every required web/mobile feature has a backend endpoint
- response shapes are documented and stable
- `won-api` is the schema owner

## Phase 2: Introduce Shared Contracts

### Tasks

- Generate TypeScript types from backend contracts or export a shared contracts package.
- Replace duplicated local interfaces in `WON`.
- Replace duplicated local interfaces in `won-mobile` where possible.
- Add a contract update workflow so backend changes fail CI unless clients are updated.

### Deliverables

- shared contract consumption in web and mobile

### Acceptance Criteria

- web and mobile compile against backend-owned types
- no handwritten duplicate DTOs remain for the main backend flows

## Phase 3: Build the New Web API Layer in `WON`

### Tasks

- Create an API client structure in `WON` equivalent to the one in `won-mobile`.
- Introduce:
  - `src/api/http.ts`
  - `src/api/remote.ts`
  - `src/api/client.ts`
  - feature hooks for home, workouts, profile, onboarding, generate, auth
- Add React Query provider at the app root.
- Create server-side fetch helpers for SSR pages that need preloaded data.
- Remove ad hoc `fetch("/api/...")` from components and move requests behind the API layer.

### Recommended File Targets in `WON`

- `src/app/layout.tsx`
- `src/components/Providers.tsx`
- new `src/api/*`
- new feature hooks under `src/features/*` or `src/lib/*`

### Acceptance Criteria

- no route component performs raw backend calls directly
- all backend access flows through a typed client
- web has one transport strategy and one cache strategy

## Phase 4: Migrate Web Auth

### Tasks

- Remove the dependency on `NextAuth` as the source of authenticated identity.
- Introduce Supabase web auth and backend bootstrap flow.
- Add a web auth provider similar in role to `won-mobile/src/features/auth/AuthProvider.tsx`.
- Migrate:
  - login
  - signup
  - logout
  - auth bootstrap
  - password reset entry flow
  - callback/recovery handling
- Replace auth guards that currently depend on `getServerSession` or `withAuth`.

### Recommended File Targets in `WON`

- `src/lib/auth.ts`
- `src/middleware.ts`
- `src/app/auth/login/LoginForm.tsx`
- `src/app/auth/signup/page.tsx`
- `src/app/reset-password/ResetPasswordForm.tsx`
- `src/app/auth/forgot-password/page.tsx`
- `src/app/auth/reset-password-token/page.tsx`
- `src/app/verify-reset-code/page.tsx`

### Acceptance Criteria

- web auth uses the same identity system as mobile
- route protection no longer depends on `NextAuth`
- authenticated backend calls work for both SSR and client navigation

## Phase 5: Migrate Web Read Paths

### Tasks

- Replace server-side Prisma reads with backend fetches for:
  - app layout user bootstrap
  - home
  - profile
  - workouts
  - workout detail
  - generate defaults
  - onboarding redirect logic
- Prefer SSR fetch helpers where SEO or first-render experience matters.
- Use React Query for client-side cache reuse and invalidation.

### Recommended File Targets in `WON`

- `src/app/app/layout.tsx`
- `src/app/app/home/page.tsx`
- `src/app/app/profile/page.tsx`
- `src/app/app/workouts/page.tsx`
- `src/app/app/workout/[planId]/page.tsx`
- `src/app/app/generate/page.tsx`
- `src/app/onboarding/page.tsx`

### Acceptance Criteria

- no page or layout imports `@/lib/db`
- no page or layout imports Prisma types for runtime data access
- all read data comes from `won-api`

## Phase 6: Migrate Web Write Paths

### Tasks

- Replace local web write flows with backend-driven operations:
  - signup
  - onboarding save
  - generate plan
  - profile update
  - profile image upload/delete
  - change password
  - delete account
  - delete plan
  - forgot password
  - verify reset code
  - reset password
  - forgot-password-token flow
- Move all mutation state handling behind feature hooks.
- Standardize cache invalidation after writes.

### Recommended File Targets in `WON`

- `src/app/onboarding/_client.tsx`
- `src/app/app/generate/GenerateClient.tsx`
- `src/app/app/profile/ProfileClient.tsx`
- `src/app/app/change-password/page.tsx`
- `src/components/DeleteAccountButton.tsx`
- `src/components/SecurityTokenDisplay.tsx`

### Acceptance Criteria

- no mutation hits local domain route handlers
- all write flows go to `won-api`
- cache invalidation is predictable and centralized

## Phase 7: Remove the Internal Backend from `WON`

### Tasks

- Delete business route handlers from `src/app/api/*`.
- Remove `src/lib/db.ts`.
- Remove `src/lib/auth.ts` and `NextAuth` integration if Supabase is already active.
- Remove `src/middleware.ts` if it only exists for NextAuth protection.
- Remove Prisma from `WON` dependencies and scripts.
- Remove `prisma/` from `WON`.
- Remove backend-only env vars from `WON`.

### Bridge Exception

If a minimal web auth callback handler is still required for Supabase browser flows, it may remain, but it must not contain domain logic, Prisma, or backend business rules.

### Acceptance Criteria

- `WON` has no Prisma dependency
- `WON` has no domain route handlers
- `WON` does not own backend env vars beyond client/session needs

## Phase 8: Rollout and Verification

### Tasks

- Stand up staging with:
  - `WON` pointed at staging `won-api`
  - `won-mobile` pointed at the same staging `won-api`
- Run end-to-end verification for:
  - signup
  - login
  - onboarding
  - generate plan
  - home refresh
  - workouts list/detail/delete
  - profile update
  - profile image update
  - change password
  - delete account
  - password reset
- Run schema drift checks.
- Run contract regression checks.
- Cut over in production behind a feature flag or staged env switch.

### Acceptance Criteria

- both clients operate against the same backend and same database
- no feature still depends on the old local backend path
- rollback path is documented

## First Sprint Recommendation

This is the highest-value first implementation slice:

1. Approve final auth target: Supabase.
2. Freeze Prisma ownership in `won-api`.
3. Add contract publication or generated type flow from `won-api`.
4. Build the new API layer inside `WON`.
5. Migrate web read paths first:
   - app layout
   - home
   - workouts
   - workout detail
   - profile
6. Only after read paths are stable, migrate auth and mutations.

Why this order:

- read-path migration breaks the Prisma coupling fastest
- contract-first work reduces rewrite churn
- auth migration is easier once the web app already consumes the backend everywhere

## Suggested Execution Order by Repo

### First in `won-api`

- contract normalization
- schema ownership freeze
- auth target finalization
- missing endpoint parity checks
- tests

### Then in `WON`

- API client foundation
- read-path migration
- auth migration
- write-path migration
- cleanup

### Then in `won-mobile`

- consume shared contracts
- adjust to any finalized backend shape changes
- remove any remaining contract duplication

## Risks

### Risk 1: Auth migration causes the longest critical path

Mitigation:

- finalize auth target before writing client migration code
- keep bridge mode only if needed

### Risk 2: Schema drift continues between repos

Mitigation:

- immediately stop maintaining Prisma schema in `WON`

### Risk 3: DTO drift between web and mobile

Mitigation:

- make backend-generated contracts the source of truth

### Risk 4: Hidden server-side dependencies in `WON`

Mitigation:

- remove imports of `@/lib/db`
- remove imports of `getServerSession`
- remove route-local business logic progressively with explicit checklists

## Definition of Done

The migration is complete only when all of the following are true:

- `won-api` is the only backend source of truth
- `WON` does not import Prisma
- `WON` does not own business route handlers
- `WON` does not use `NextAuth` as app identity
- `won-mobile` and `WON` use the same backend contracts
- both clients point to the same backend and same database in production

