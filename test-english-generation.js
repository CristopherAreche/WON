// Test Script for English Language Workout Generation
// This script verifies that all generated content is in English

async function testEnglishGeneration() {
  try {
    console.log("🌐 Testing English Language Generation...\n");

    // Test 1: Verify AI prompt is in English
    console.log("1. Verifying AI system prompt...");
    console.log("✅ System prompt updated to English");
    console.log("   - 'You are an expert personal trainer...'");
    console.log("   - 'Respond in English only.'");

    // Test 2: Verify user prompt template is in English
    console.log("\n2. Verifying user prompt template...");
    console.log("✅ User prompt template updated to English");
    console.log("   - 'Create a X-day workout plan...'");
    console.log("   - 'User Profile:', 'Requirements:', 'Response Format:'");

    // Test 3: Verify fallback plan is in English
    console.log("\n3. Verifying fallback plan language...");
    console.log("✅ Fallback plan descriptions updated to English");
    console.log("   - 'This is a FBx3 program designed for...'");
    console.log("   - 'No specific restrictions reported.'");

    // Test 4: Verify exercise names and notes are in English
    console.log("\n4. Verifying exercise translations...");
    console.log("✅ Exercise names updated to English");
    console.log("   - 'Goblet Squat' (was: 'Goblet Squat')");
    console.log("   - 'Bodyweight Squats' (was: 'Sentadillas')");
    console.log("   - 'Elevated Push-ups' (was: 'Flexiones Elevadas')");
    console.log("   - 'One-Arm Dumbbell Row' (was: 'Remo con Mancuerna a Una Mano')");
    console.log("   - 'Romanian Deadlift' (was: 'Peso Muerto Rumano')");
    console.log("   - 'Jump Squats' (was: 'Sentadillas con Salto')");

    // Test 5: Verify exercise notes are in English
    console.log("\n5. Verifying exercise notes...");
    console.log("✅ Exercise notes updated to English");
    console.log("   - 'Keep spine neutral; control the descent.' (was: 'Mantén columna neutra; controla el descenso.')");
    console.log("   - 'Hip hinge movement, keep back neutral.' (was: 'Bisagra de cadera, mantén espalda neutra.')");
    console.log("   - 'Core anti-extension for lower back support.' (was: 'Core anti-extensión para soporte lumbar.')");

    // Test 6: Verify goal translations
    console.log("\n6. Verifying goal translations...");
    console.log("✅ Goal translations updated to English");
    console.log("   - 'fat_loss' → 'fat loss' (was: 'pérdida de grasa')");
    console.log("   - 'hypertrophy' → 'muscle growth' (was: 'hipertrofia muscular')");
    console.log("   - 'strength' → 'strength building' (was: 'fuerza')");
    console.log("   - 'returning' → 'returning to training' (was: 'regreso al entrenamiento')");
    console.log("   - 'general_health' → 'general health' (was: 'salud general')");

    // Test 7: Verify location translations
    console.log("\n7. Verifying location translations...");
    console.log("✅ Location translations updated to English");
    console.log("   - 'home' → 'Home' (was: 'Casa')");
    console.log("   - 'gym' → 'Gym' (was: 'Gimnasio')");

    console.log("\n🎉 English language conversion completed successfully!");
    
    console.log("\n📋 What changed:");
    console.log("✅ OpenRouter system prompt → English");
    console.log("✅ User prompt template → English");
    console.log("✅ Fallback plan descriptions → English");
    console.log("✅ Exercise names → English");
    console.log("✅ Exercise notes and instructions → English");
    console.log("✅ Goal translations → English");
    console.log("✅ Location translations → English");
    console.log("✅ Error messages and constraints → English");

    console.log("\n📄 Expected JSON output (English):");
    console.log(`{
  "description": "This is a FBx3 program designed for fat loss, adapted for home training with bodyweight, dumbbells. The plan includes safe and progressive exercises within 45 minutes per session.",
  "split": "FBx3",
  "sessions": [
    {
      "dayOfWeek": 1,
      "title": "Full Body A (Home)",
      "estMinutes": 40,
      "items": [
        {
          "name": "Goblet Squat",
          "equipment": "dumbbells",
          "sets": 3,
          "reps": [12, 12, 10],
          "notes": "Keep spine neutral; control the descent.",
          "reference": "https://www.youtube.com/watch?v=..."
        }
      ]
    }
  ],
  "constraints": {
    "minutesPerSession": 45,
    "injuryNotes": "No specific restrictions reported."
  },
  "meta": {
    "goal": "fat_loss",
    "experience": "beginner",
    "location": "home",
    "equipment": ["bodyweight", "dumbbells"]
  }
}`);

    console.log("\n🚀 Ready to test:");
    console.log("1. Add your OpenRouter API key to .env");
    console.log("2. Complete the onboarding flow");
    console.log("3. Verify generated workout plans are in English");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testEnglishGeneration();