# Database Migration Instructions

## Enhanced Onboarding Fields Migration

The onboarding form has been enhanced with new user physical data fields. To complete the implementation, you need to run the database migration when the database connection is available.

### New Fields Added:
- `currentWeight` (Float) - User's weight in pounds
- `height` (Float) - User's height in decimal feet (e.g., 5.5 for 5'6")
- `age` (Int) - User's age in years
- `location` - Changed from single value to array to support multiple locations

### Migration Steps:

1. **Ensure database connectivity** - Make sure you can connect to your Supabase database

2. **Run the migration**:
   ```bash
   npx prisma migrate dev --name add-user-physical-data
   ```

3. **Update the API** - After migration succeeds, update `/src/app/api/onboarding/route.ts` to use the new fields:
   
   Replace the temporary compatibility code with:
   ```typescript
   const saved = await prisma.onboardingAnswers.upsert({
     where: { userId },
     update: {
       goal,
       experience,
       daysPerWeek,
       minutesPerSession,
       equipment,
       injuries,
       location, // Now supports array
       currentWeight,
       height,
       age,
     },
     create: {
       userId,
       goal,
       experience,
       daysPerWeek,
       minutesPerSession,
       equipment,
       injuries,
       location, // Now supports array
       currentWeight,
       height,
       age,
     },
   });
   ```

4. **Update validation** - Restore the strict validation for new fields:
   ```typescript
   if (
     !userId ||
     !goal ||
     !experience ||
     !daysPerWeek ||
     !minutesPerSession ||
     !equipment ||
     !location ||
     currentWeight === undefined ||
     height === undefined ||
     age === undefined
   ) {
     return NextResponse.json({ error: "INVALID_INPUT - Missing required fields" }, { status: 400 });
   }
   ```

### Current Status:
- ✅ Frontend form updated with new fields
- ✅ Database schema updated in `schema.prisma`
- ✅ AI prompts enhanced to use new user data
- ✅ Temporary compatibility mode enabled
- ⏳ Database migration pending (requires database connectivity)
- ⏳ Full API integration pending (after migration)

### Notes:
- The form currently works but saves only the original fields to the database
- New fields (weight, height, age) are collected but not persisted until migration
- AI generation may use default values for missing physical data
- Location field temporarily uses only the first selected location

Once the migration is complete, the enhanced onboarding will provide much more personalized workout recommendations based on the user's complete physical profile.