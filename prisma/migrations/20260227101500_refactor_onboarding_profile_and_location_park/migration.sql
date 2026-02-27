-- Add new enum value for outdoor training
DO $$
BEGIN
  ALTER TYPE "Location" ADD VALUE 'park';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure profile baseline fields exist on onboarding answers
ALTER TABLE "OnboardingAnswers"
  ADD COLUMN IF NOT EXISTS "currentWeight" DOUBLE PRECISION NOT NULL DEFAULT 150.0,
  ADD COLUMN IF NOT EXISTS "height" DOUBLE PRECISION NOT NULL DEFAULT 5.5,
  ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Remove legacy age field if present
ALTER TABLE "OnboardingAnswers"
  DROP COLUMN IF EXISTS "age";
