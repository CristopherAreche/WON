# WON - Project Context Handoff (2026-02-27)

## Snapshot
- Date: 2026-02-27
- Branch: `main`
- Last pushed commit: `0abe008`
- Remote: `origin https://github.com/CristopherAreche/WON.git`

## What was implemented

### 1) Onboarding split + recurrent generation flow
- `/onboarding` refactored as initial setup flow (3 steps).
- `/app/generate` added as recurrent plan generation flow (2 steps), using dynamic overrides only.
- Strict gate in app shell: users without onboarding are redirected to `/onboarding`.
- `Location` support extended to include `park`.

Key files:
- `src/app/onboarding/_client.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/app/generate/page.tsx`
- `src/app/app/generate/GenerateClient.tsx`
- `src/app/app/layout.tsx`
- `src/app/api/onboarding/route.ts`
- `src/app/api/ai/generate-plan/route.ts`
- `src/lib/ai-workout-generator.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260227101500_refactor_onboarding_profile_and_location_park/migration.sql`

---

### 2) Navigation and layout simplification
- Removed right slide sidebar flow and hamburger usage in app shell.
- Top app bar now uses notifications icon (visual placeholder).
- Bottom navbar updated:
  - Removed Calendar tab
  - Added Profile tab (`/app/profile`)
- Legacy `/app/calendar` route now redirects to `/app/profile` for compatibility.

Key files:
- `src/components/NavigationLayout.tsx`
- `src/components/GlobalAppHeader.tsx`
- `src/components/BottomNavbar.tsx`
- `src/app/app/calendar/page.tsx`
- `src/components/Header.tsx` (legacy cleanup)
- `src/components/WelcomeHeader.tsx` (legacy cleanup)
- `src/components/Sidebar.tsx` (removed)

---

### 3) Profile redesign + persistent profile photo
- Profile page redesigned with Stitch-inspired structure.
- Omitted `Linked Devices` section as requested.
- Contact info scope kept to email only.
- Added profile photo upload/remove flow:
  - client-side validation (type + size)
  - client-side crop/resize/compress to square image
  - persistence in DB as Data URL
- Home top app bar avatar now prioritizes user uploaded profile photo.

Key files:
- `src/app/app/profile/page.tsx`
- `src/app/app/profile/ProfileClient.tsx`
- `src/app/api/user/profile-image/route.ts`
- `src/app/app/layout.tsx`
- `src/components/GlobalAppHeader.tsx`
- `prisma/schema.prisma` (`User.profileImageDataUrl`)
- `prisma/migrations/20260227144500_add_user_profile_image_data_url/migration.sql`

---

### 4) Security hardening applied
- Auth-bound ownership checks in onboarding and generate APIs (rejecting mismatched `userId`).
- Rate limits added/extended in critical API endpoints.
- Stronger password validation in auth flows.
- Constant-time comparison for security token validation in password change.
- Debug routes restricted in production unless explicitly enabled.
- Security token display masked.
- Open redirect mitigation on login callback URL.
- Reduced sensitive logging in several flows.

Representative files:
- `src/app/api/onboarding/route.ts`
- `src/app/api/ai/generate-plan/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/app/api/auth/forgot-password-token/route.ts`
- `src/app/api/auth/security-token/route.ts`
- `src/app/auth/login/LoginForm.tsx`
- `src/lib/auth.ts`
- `src/lib/rate-limit.ts`
- `src/lib/password-reset.ts`
- `src/lib/audit.ts`
- `src/lib/email.ts`
- `next.config.js`

---

### 5) Performance-oriented updates
- Reduced query payload and capped plan list in home page.
- Added DB index for frequent plan query pattern:
  - `WorkoutPlan @@index([userId, createdAt(sort: Desc)])`
- Added timeout handling for OpenRouter requests.

Key files:
- `src/app/app/home/page.tsx`
- `src/lib/openrouter-client.ts`
- `prisma/schema.prisma`

## API/Schema changes summary
- Prisma:
  - `Location` enum includes `park`.
  - `OnboardingAnswers.age` replaced by `dateOfBirth`.
  - `User.profileImageDataUrl` added.
- New API:
  - `PUT /api/user/profile-image`
  - `DELETE /api/user/profile-image`
- Generate API:
  - accepts dynamic overrides and merges with onboarding baseline.
  - computes age from `dateOfBirth` at runtime.

## Important assumptions used
- Profile photo persistence via DB Data URL (no Cloudinary/S3 in this phase).
- Notifications icon is UI-only (no notifications backend).
- Calendar is intentionally removed from nav; route kept only as redirect compatibility.
- No phone model/field added in this phase.

## Known environment issue
- Local Node runtime has ICU linking issue:
  - `dyld: Symbol not found ... icu ...`
- Because of this, lint/build/typecheck could not be fully executed in terminal during this phase.

## Recommended commands after opening in another IDE
1. `npx prisma migrate dev`
2. `npx prisma generate`
3. `npm run lint`
4. `npm run build`

If the Node ICU error persists, fix local Node/ICU first, then re-run commands.

## Notes for next iteration
- Move profile photo storage from DB Data URL to object storage/CDN when needed.
- Add real notifications (API + list/panel + read state).
- Introduce Redis-based rate limiting for multi-instance deployment.
- Optionally hash `securityToken` at rest and migrate token flows.
