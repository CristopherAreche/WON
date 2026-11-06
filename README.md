# WON — Workout planning for web

WON is a personal project for creating workout plans around training goals, experience, available equipment, and weekly schedules. This repository contains the Next.js web client; `won-api` contains the shared Hono API and `won-mobile` contains the Expo / React Native client. They are complementary applications, not competing versions.

## Explore without an account

The public `/demo` route uses a fixed, clearly labeled example week. Visitors can switch between sessions, mark exercises complete, view the weekly completion percentage, and reset the demo. Demo interactions stay in browser memory and make no API calls. The example is not a personalized or AI-generated recommendation.

Real account and workout flows remain separate: Supabase authentication, onboarding, plan generation through the API, saved workouts, and profile management.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · React Hook Form · Zod · Supabase Auth

## Run locally

Use Node.js 22 or later.

```sh
npm ci
cp .env.example .env.local
npm run dev -- --port 3002
```

Open `http://localhost:3002` or `http://localhost:3002/demo`.

Landing and demo pages do not need API access. Authentication requires a configured Supabase project; account linking, onboarding, and saved plans also require the separate `won-api` service.

Required configuration for real account flows:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public Supabase client key.
- `NEXT_PUBLIC_API_BASE_URL`: browser-accessible `won-api` URL.
- `WON_API_BASE_URL`: server-side `won-api` URL. Keep it aligned with the public API origin.

For local API development, run `won-api` separately on port 4000 and allow the web origin in its CORS configuration. Never point the API base URL back to this Next.js app. Never place a service-role key or AI provider key in a `NEXT_PUBLIC_` variable.

## Validation

```sh
npx tsc --noEmit
npm run build
```

Check the landing, demo, sign-in, and sign-up screens at mobile, tablet, and desktop widths. In the demo, marking one of nine exercises should display 11%; switching sessions should preserve the current page's progress; reset should return to Monday and 0%.

Authenticated routes require a real test session and a reachable backend to validate end to end. A successful frontend build does not verify database connectivity, OAuth redirect settings, email delivery, or AI plan generation.

## Deployment

The existing Vercel project is `won`; the separate backend project is `won-api`. Reuse those projects rather than creating duplicate deployments.

- The frontend build command is `next build`, also declared in `vercel.json`. It does not run Prisma migrations or generate a Prisma client; Prisma belongs to the API.
- Set frontend environment variables for the target environment to the deployed API and Supabase project, not localhost.
- Add the final frontend origin to the API CORS configuration and Supabase allowed redirect URLs.
- Keep backend database, email, AI, and service-role credentials in the API project.
- Verify public access to `/` and `/demo` in a signed-out browser. Verify sign-up, sign-in, account linking, onboarding, and plan generation separately before describing those flows as production-ready.

No database migration is needed for responsive layouts or the public demo.
