# WON - Workout Onboarding API

## Generate Workout Button Flow

When the "Generate Workout" button is clicked in the onboarding section, the application makes two sequential POST requests:

### 1. Save Onboarding Data
**Endpoint:** `POST /api/onboarding`

```json
{
  "userId": "user_123",
  "goal": "fat_loss",
  "experience": "beginner",
  "daysPerWeek": 3,
  "minutesPerSession": 60,
  "equipment": ["bodyweight", "dumbbells"],
  "injuries": "Lower back pain when bending",
  "location": "home"
}
```

### 2. Generate AI Workout Plan
**Endpoint:** `POST /api/ai/generate-plan`

```json
{
  "userId": "user_123"
}
```

## Field Definitions

### Goal Options
- `"fat_loss"` - Fat Loss
- `"hypertrophy"` - Muscle Growth
- `"strength"` - Strength
- `"returning"` - Return to Training
- `"general_health"` - General Health

### Experience Options
- `"beginner"` - Beginner
- `"three_to_twelve_months"` - 3–12 months
- `"one_to_three_years"` - 1–3 years
- `"three_years_plus"` - 3+ years

### Equipment Options
- `"bodyweight"` - Bodyweight
- `"bands"` - Resistance Bands
- `"dumbbells"` - Dumbbells
- `"barbell"` - Barbell
- `"machines"` - Machines

### Location Options
- `"home"` - Home
- `"gym"` - Gym

### Constraints
- `daysPerWeek`: Integer between 1-7
- `minutesPerSession`: Integer between 30-180 (increments of 15)
- `equipment`: Array with at least one item
- `injuries`: Optional string, max 500 characters, no emojis
- `userId`: Required string identifier

## Example Complete Request

```json
{
  "userId": "clx123abc456def",
  "goal": "hypertrophy",
  "experience": "one_to_three_years",
  "daysPerWeek": 4,
  "minutesPerSession": 75,
  "equipment": ["dumbbells", "barbell", "machines"],
  "injuries": "Previous knee injury, avoid deep squats",
  "location": "gym"
}
```

## Expected Response Structure (English)

The AI will generate workout plans in English with this structure:

```json
{
  "description": "This is a FBx4 program designed for muscle growth, adapted for gym training with dumbbells, barbell, machines. Each session includes compound movements and progressive overload within 75 minutes per session.",
  "split": "FBx4",
  "sessions": [
    {
      "dayOfWeek": 1,
      "title": "Upper Body Strength (Gym)",
      "estMinutes": 70,
      "items": [
        {
          "name": "Barbell Bench Press",
          "equipment": "barbell",
          "sets": 4,
          "reps": [8,8,6,6],
          "notes": "Control the descent, full range of motion.",
          "reference": "https://www.youtube.com/watch?v=VIDEO_ID"
        }
      ]
    }
  ],
  "constraints": {
    "minutesPerSession": 75,
    "injuryNotes": "Previous knee injury, avoid deep squats"
  },
  "meta": {
    "goal": "hypertrophy",
    "experience": "one_to_three_years",
    "location": "gym",
    "equipment": ["dumbbells", "barbell", "machines"]
  }
}
```

---

## Development Setup

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Inter](https://fonts.google.com/specimen/Inter), a font optimized for user interfaces.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
