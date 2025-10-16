// AI Workout Generation Service
import { getOpenRouterClient, OpenRouterClient } from './openrouter-client';

interface UserProfile {
  goal: "fat_loss" | "hypertrophy" | "strength" | "returning" | "general_health";
  experience: "beginner" | "three_to_twelve_months" | "one_to_three_years" | "three_years_plus";
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Array<"bodyweight" | "bands" | "dumbbells" | "barbell" | "machines">;
  injuries?: string;
  location: "home" | "gym";
}

interface Exercise {
  name: string;
  equipment: "bodyweight" | "bands" | "dumbbells" | "barbell" | "machines";
  sets: number;
  reps: number[];
  notes?: string;
  reference?: string;
}

interface WorkoutSession {
  dayOfWeek: number;
  title: string;
  estMinutes: number;
  items: Exercise[];
}

interface GeneratedWorkoutPlan {
  description: string;
  split: string;
  sessions: WorkoutSession[];
  constraints: {
    minutesPerSession: number;
    injuryNotes?: string;
  };
  meta: {
    goal: string;
    experience: string;
    location: string;
    equipment: string[];
  };
}

export class AIWorkoutGenerator {
  private openrouter: OpenRouterClient | null = null;

  constructor() {
    // Initialize OpenRouter client
    try {
      console.log("🔵 Initializing OpenRouter client...");
      console.log("🔵 OPENROUTER_API_KEY exists:", !!process.env.OPENROUTER_API_KEY);
      console.log("🔵 OPENROUTER_API_KEY length:", process.env.OPENROUTER_API_KEY?.length || 0);
      
      this.openrouter = getOpenRouterClient();
      if (!this.openrouter) {
        console.warn('🟡 OpenRouter not available. Using fallback generation.');
      } else {
        console.log('🟢 OpenRouter client initialized successfully');
      }
    } catch (error) {
      console.warn('🔴 OpenRouter initialization failed. Using fallback generation:', error);
      this.openrouter = null;
    }
  }

  async generateWorkoutPlan(userProfile: UserProfile): Promise<GeneratedWorkoutPlan> {
    try {
      if (this.openrouter) {
        console.log("🔵 AIWorkoutGenerator: Using OpenRouter API");
        return await this.generateWithOpenRouter(userProfile);
      } else {
        console.log("🟡 AIWorkoutGenerator: OpenRouter not available, using fallback");
        return this.generateFallbackPlan(userProfile);
      }
    } catch (error) {
      console.error('🔴 AI generation failed, using fallback:', error);
      return this.generateFallbackPlan(userProfile);
    }
  }

  private async generateWithOpenRouter(userProfile: UserProfile): Promise<GeneratedWorkoutPlan> {
    if (!this.openrouter) {
      throw new Error('OpenRouter not initialized');
    }
    
    const prompt = this.createWorkoutPrompt(userProfile);
    console.log("🔵 Sending prompt to OpenRouter:", prompt);

    const completion = await this.openrouter.createChatCompletion([
      {
        role: "system",
        content: `You are an expert personal trainer with 15+ years of experience. Create personalized workout plans that are safe and effective. Always respond with valid JSON that exactly matches the specified structure. Consider safety, progression, and effectiveness. Respond in English only.`
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      temperature: 0.7,
      max_tokens: 3000,
      model: 'openai/gpt-4o-mini'
    });

    console.log("🟢 OpenRouter raw response:", JSON.stringify(completion, null, 2));

    const response = completion.choices[0]?.message?.content;
    console.log("🟢 OpenRouter message content:", response);
    
    if (!response) {
      throw new Error('No response from OpenRouter');
    }

    try {
      const parsedPlan = JSON.parse(response);
      console.log("🟢 Parsed workout plan (English):", JSON.stringify(parsedPlan, null, 2));
      return parsedPlan;
    } catch (parseError) {
      console.error('🔴 Parse error:', parseError);
      console.error('🔴 Raw response:', response);
      throw new Error('Invalid JSON response from OpenRouter');
    }
  }

  private createWorkoutPrompt(userProfile: UserProfile): string {
    const equipmentList = userProfile.equipment.join(", ");
    const injuryInfo = userProfile.injuries ? `IMPORTANT: User has injuries/restrictions: "${userProfile.injuries}". Modify exercises accordingly for safety.` : "";
    
    const goalTranslations = {
      "fat_loss": "fat loss",
      "hypertrophy": "muscle growth", 
      "strength": "strength building",
      "returning": "returning to training",
      "general_health": "general health"
    };

    const experienceTranslations = {
      "beginner": "beginner",
      "three_to_twelve_months": "3-12 months experience",
      "one_to_three_years": "1-3 years experience", 
      "three_years_plus": "3+ years experience"
    };

    const locationText = userProfile.location === "home" ? "home" : "gym";
    const goalText = goalTranslations[userProfile.goal];
    const experienceText = experienceTranslations[userProfile.experience];

    // Determine split type and days
    let splitType = "";
    let dayNumbers: number[] = [];
    
    if (userProfile.daysPerWeek === 3) {
      splitType = "FBx3";
      dayNumbers = [1, 3, 5]; // Monday, Wednesday, Friday
    } else if (userProfile.daysPerWeek === 4) {
      splitType = "FBx4"; 
      dayNumbers = [1, 2, 4, 6]; // Mon, Tue, Thu, Sat
    } else if (userProfile.daysPerWeek === 5) {
      splitType = "PPLx5";
      dayNumbers = [1, 2, 3, 5, 6]; // Mon-Wed, Fri-Sat
    }

    return `Create a ${userProfile.daysPerWeek}-day workout plan for a user with the following profile:

**User Profile:**
- Goal: ${goalText}
- Experience Level: ${experienceText}
- Days per Week: ${userProfile.daysPerWeek}
- Minutes per Session: ${userProfile.minutesPerSession}
- Available Equipment: ${equipmentList}
- Workout Location: ${locationText}
${injuryInfo}

**Requirements:**
- Create ${userProfile.daysPerWeek} different workout sessions
- Each workout should last maximum ${userProfile.minutesPerSession} minutes
- Use only available equipment: ${equipmentList}
- Appropriate for ${experienceText} level
- Focused on ${goalText}
- Include safe and progressive exercises
- Provide recent YouTube demonstration videos (prefer videos from 2023-2025)
- Use reputable fitness channels for video references
- Reps should be arrays of numbers (e.g., [12,12,10,10])

**Response Format (VALID JSON ONLY):**
{
  "description": "Detailed description of the training program, methodology and special considerations (150-200 words)",
  "split": "${splitType}",
  "sessions": [
    {
      "dayOfWeek": ${dayNumbers[0]},
      "title": "Session Name (${locationText})",
      "estMinutes": 50,
      "items": [
        {
          "name": "Exercise Name",
          "equipment": "equipment_type",
          "sets": 3,
          "reps": [12, 12, 10],
          "notes": "Form and safety tips",
          "reference": "https://www.youtube.com/watch?v=VIDEO_ID"
        }
      ]
    }
  ],
  "constraints": {
    "minutesPerSession": ${userProfile.minutesPerSession},
    "injuryNotes": "${userProfile.injuries || 'No specific restrictions reported.'}"
  },
  "meta": {
    "goal": "${userProfile.goal}",
    "experience": "${userProfile.experience}",
    "location": "${userProfile.location}",
    "equipment": ["${userProfile.equipment.join('", "')}"]
  }
}

Generate a complete, safe and effective plan. Respond ONLY with valid JSON.`;
  }

  private generateFallbackPlan(userProfile: UserProfile): GeneratedWorkoutPlan {
    const sessions = this.createFallbackWorkouts(userProfile);
    const equipmentList = userProfile.equipment.join(", ");
    
    const goalTranslations = {
      "fat_loss": "fat loss",
      "hypertrophy": "muscle growth", 
      "strength": "strength building",
      "returning": "returning to training",
      "general_health": "general health"
    };

    const splitType = userProfile.daysPerWeek === 3 ? "FBx3" : 
                     userProfile.daysPerWeek === 4 ? "FBx4" : "PPLx5";

    return {
      description: `This is a ${splitType} program designed for ${goalTranslations[userProfile.goal]}, adapted for ${userProfile.location === "home" ? "home" : "gym"} training with ${equipmentList}. The plan is automatically generated with safe and progressive exercises within ${userProfile.minutesPerSession} minutes per session.`,
      split: splitType,
      sessions,
      constraints: {
        minutesPerSession: userProfile.minutesPerSession,
        injuryNotes: userProfile.injuries || "No specific restrictions reported."
      },
      meta: {
        goal: userProfile.goal,
        experience: userProfile.experience,
        location: userProfile.location,
        equipment: userProfile.equipment
      }
    };
  }

  private createFallbackWorkouts(userProfile: UserProfile): WorkoutSession[] {
    const { equipment, goal, experience, minutesPerSession } = userProfile;
    const hasWeights = equipment.includes('dumbbells') || equipment.includes('barbell');
    const isAdvanced = experience === 'one_to_three_years' || experience === 'three_years_plus';
    const locationText = userProfile.location === "home" ? "Home" : "Gym";

    const sessions: WorkoutSession[] = [];

    // Determine day numbers based on frequency
    const dayNumbers = userProfile.daysPerWeek === 3 ? [1, 3, 5] : 
                      userProfile.daysPerWeek === 4 ? [1, 2, 4, 6] : 
                      [1, 2, 3, 5, 6];

    if (userProfile.daysPerWeek >= 1) {
      // Session A
      sessions.push({
        dayOfWeek: dayNumbers[0],
        title: `Full Body A (${locationText})`,
        estMinutes: minutesPerSession - 5,
        items: [
          ...(hasWeights ? [{
            name: "Goblet Squat",
            equipment: "dumbbells" as const,
            sets: isAdvanced ? 4 : 3,
            reps: goal === 'strength' ? [8, 6, 6, 6] : [12, 12, 10, 10],
            notes: "Keep spine neutral; control the descent.",
            reference: "https://www.youtube.com/watch?v=MeIiIdhvXT4"
          }] : [{
            name: "Bodyweight Squats",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: [15, 15, 12],
            notes: "Keep chest up and knees aligned.",
            reference: "https://www.youtube.com/watch?v=YaXPRqUwItQ"
          }]),
          {
            name: "Elevated Push-ups",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: isAdvanced ? [12, 10, 8] : [10, 8, 6],
            notes: "Elevate hands (table/chair) for better control.",
            reference: "https://www.youtube.com/watch?v=IODxDxX7oi4"
          },
          ...(hasWeights ? [{
            name: "One-Arm Dumbbell Row",
            equipment: "dumbbells" as const,
            sets: 3,
            reps: [12, 12, 10],
            notes: "Support free hand for stability.",
            reference: "https://www.youtube.com/watch?v=pYcpY20QaE8"
          }] : [{
            name: "Inverted Row",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: [10, 8, 8],
            notes: "Use table or low bar.",
            reference: "https://www.youtube.com/watch?v=hXTc1mDnZCw"
          }]),
          {
            name: "Dead Bug",
            equipment: "bodyweight" as const,
            sets: 2,
            reps: [12, 12],
            notes: "Core anti-extension for lower back support.",
            reference: "https://www.youtube.com/watch?v=5rp3t8DlcwU"
          }
        ]
      });
    }

    if (userProfile.daysPerWeek >= 2) {
      // Session B
      sessions.push({
        dayOfWeek: dayNumbers[1],
        title: `Full Body B (${locationText})`,
        estMinutes: minutesPerSession - 5,
        items: [
          {
            name: hasWeights ? "Romanian Deadlift" : "Single Leg Deadlift",
            equipment: hasWeights ? "dumbbells" as const : "bodyweight" as const,
            sets: 3,
            reps: [12, 10, 10],
            notes: "Hip hinge movement, keep back neutral.",
            reference: "https://www.youtube.com/watch?v=DJpN7cS0B1o"
          },
          {
            name: hasWeights ? "Seated Shoulder Press" : "Pike Push-ups",
            equipment: hasWeights ? "dumbbells" as const : "bodyweight" as const,
            sets: 3,
            reps: hasWeights ? [12, 10, 8] : [8, 6, 6],
            notes: hasWeights ? "Support back for stability." : "Focus on shoulders.",
            reference: hasWeights ? "https://www.youtube.com/watch?v=B-aVuyhvLHU" : "https://www.youtube.com/watch?v=sp3iG5C4_rU"
          },
          {
            name: "Lunges",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: [12, 12, 10],
            notes: "Controlled lunge, keep torso upright.",
            reference: "https://www.youtube.com/watch?v=2C-uNgKwPLE"
          },
          {
            name: "Plank",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: [30, 30, 30],
            notes: "Seconds instead of reps; align ribs and pelvis.",
            reference: "https://www.youtube.com/watch?v=pSHjTRCQxIw"
          }
        ]
      });
    }

    if (userProfile.daysPerWeek >= 3) {
      // Session C
      sessions.push({
        dayOfWeek: dayNumbers[2],
        title: `Full Body C (${locationText})`,
        estMinutes: minutesPerSession - 10,
        items: [
          {
            name: "Jump Squats",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: [10, 8, 8],
            notes: "Soft landing, control the impact.",
            reference: "https://www.youtube.com/watch?v=YHoLVhIlhU4"
          },
          {
            name: "Burpees",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: goal === 'fat_loss' ? [12, 10, 8] : [8, 6, 6],
            notes: "Controlled pace, don't rush.",
            reference: "https://www.youtube.com/watch?v=qLBImHhCXSw"
          },
          {
            name: "Mountain Climbers",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: [20, 20, 15],
            notes: "Keep hips stable.",
            reference: "https://www.youtube.com/watch?v=cnyTQDSE884"
          }
        ]
      });
    }

    return sessions.slice(0, userProfile.daysPerWeek);
  }
}

// Export singleton instance
export const aiWorkoutGenerator = new AIWorkoutGenerator();