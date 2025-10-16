// AI Workout Generation Service
import { getOpenRouterClient, OpenRouterClient } from "./openrouter-client";

interface UserProfile {
  goal:
    | "fat_loss"
    | "hypertrophy"
    | "strength"
    | "returning"
    | "general_health";
  experience:
    | "beginner"
    | "three_to_twelve_months"
    | "one_to_three_years"
    | "three_years_plus";
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Array<
    "bodyweight" | "bands" | "dumbbells" | "barbell" | "machines"
  >;
  injuries?: string;
  location: Array<"home" | "gym">;
  currentWeight: number;
  height: number;
  age: number;
}

interface Exercise {
  name: string;
  equipment: "bodyweight" | "bands" | "dumbbells" | "barbell" | "machines";
  sets: number;
  reps: number[];
  notes?: string;
  reference?: string;
  similarExercises?: Array<{
    name: string;
    equipment: "bodyweight" | "bands" | "dumbbells" | "barbell" | "machines";
    notes?: string;
    reference?: string;
  }>;
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
      console.log(
        "🔵 OPENROUTER_API_KEY exists:",
        !!process.env.OPENROUTER_API_KEY
      );
      console.log(
        "🔵 OPENROUTER_API_KEY length:",
        process.env.OPENROUTER_API_KEY?.length || 0
      );

      this.openrouter = getOpenRouterClient();
      if (!this.openrouter) {
        console.warn("🟡 OpenRouter not available. Using fallback generation.");
      } else {
        console.log("🟢 OpenRouter client initialized successfully");
      }
    } catch (error) {
      console.warn(
        "🔴 OpenRouter initialization failed. Using fallback generation:",
        error
      );
      this.openrouter = null;
    }
  }

  async generateWorkoutPlan(
    userProfile: UserProfile
  ): Promise<GeneratedWorkoutPlan> {
    try {
      if (this.openrouter) {
        console.log("🔵 AIWorkoutGenerator: Using OpenRouter API");
        return await this.generateWithOpenRouter(userProfile);
      } else {
        console.log(
          "🟡 AIWorkoutGenerator: OpenRouter not available, using fallback"
        );
        return this.generateFallbackPlan(userProfile);
      }
    } catch (error) {
      console.error("🔴 AI generation failed, using fallback:", error);
      return this.generateFallbackPlan(userProfile);
    }
  }

  private async generateWithOpenRouter(
    userProfile: UserProfile
  ): Promise<GeneratedWorkoutPlan> {
    if (!this.openrouter) {
      throw new Error("OpenRouter not initialized");
    }

    const prompt = this.createWorkoutPrompt(userProfile);
    console.log("🔵 Sending prompt to OpenRouter:", prompt);

    const completion = await this.openrouter.createChatCompletion(
      [
        {
          role: "system",
          content: `You are an expert personal trainer with 15+ years of experience. Create personalized workout plans that are safe and effective. Always respond with valid JSON that exactly matches the specified structure. Consider safety, progression, and effectiveness. Respond in English only.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 0.7,
        max_tokens: 3000,
        model: "openai/gpt-4o-mini",
      }
    );

    console.log(
      "🟢 OpenRouter raw response:",
      JSON.stringify(completion, null, 2)
    );

    const response = completion.choices[0]?.message?.content;
    console.log("🟢 OpenRouter message content:", response);

    if (!response) {
      throw new Error("No response from OpenRouter");
    }

    try {
      const parsedPlan = JSON.parse(response);
      console.log(
        "🟢 Parsed workout plan (English):",
        JSON.stringify(parsedPlan, null, 2)
      );
      return parsedPlan;
    } catch (parseError) {
      console.error("🔴 Parse error:", parseError);
      console.error("🔴 Raw response:", response);
      throw new Error("Invalid JSON response from OpenRouter");
    }
  }

  private createWorkoutPrompt(userProfile: UserProfile): string {
    const equipmentList = userProfile.equipment.join(", ");
    const injuryInfo = userProfile.injuries
      ? `IMPORTANT: User has injuries/restrictions: "${userProfile.injuries}". Modify exercises accordingly for safety.`
      : "";

    const goalTranslations = {
      fat_loss: "fat loss",
      hypertrophy: "muscle growth",
      strength: "strength building",
      returning: "returning to training",
      general_health: "general health",
    };

    const experienceTranslations = {
      beginner: "beginner",
      three_to_twelve_months: "3-12 months experience",
      one_to_three_years: "1-3 years experience",
      three_years_plus: "3+ years experience",
    };

    const locationText = userProfile.location.join(" and ");
    const goalText = goalTranslations[userProfile.goal];
    const experienceText = experienceTranslations[userProfile.experience];
    
    // Calculate BMI for additional context
    const heightInFeet = userProfile.height;
    const heightInInches = heightInFeet * 12;
    const heightInMeters = heightInInches * 0.0254;
    const weightInKg = userProfile.currentWeight * 0.453592;
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    
    let bmiCategory = "";
    if (bmi < 18.5) bmiCategory = "underweight";
    else if (bmi < 25) bmiCategory = "normal weight";
    else if (bmi < 30) bmiCategory = "overweight";
    else bmiCategory = "obese";
    
    let ageCategory = "";
    if (userProfile.age < 25) ageCategory = "young adult";
    else if (userProfile.age < 40) ageCategory = "adult";
    else if (userProfile.age < 60) ageCategory = "middle-aged adult";
    else ageCategory = "older adult";

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

    return `Create a ${
      userProfile.daysPerWeek
    }-day workout plan for a user with the following profile:

**User Profile:**
- Goal: ${goalText}
- Experience Level: ${experienceText}
- Age: ${userProfile.age} years (${ageCategory})
- Current Weight: ${userProfile.currentWeight} lb
- Height: ${userProfile.height.toFixed(2)} ft
- BMI: ${bmi.toFixed(1)} (${bmiCategory})
- Days per Week: ${userProfile.daysPerWeek}
- Minutes per Session: ${userProfile.minutesPerSession}
- Available Equipment: ${equipmentList}
- Workout Location: ${locationText}
${injuryInfo}

**Requirements:**
- Create ${userProfile.daysPerWeek} different workout sessions
- Each workout should last maximum ${userProfile.minutesPerSession} minutes
- Use only available equipment: ${equipmentList}
- Appropriate for ${experienceText} level and ${ageCategory}
- Focused on ${goalText}
- Consider user's BMI (${bmi.toFixed(1)} - ${bmiCategory}) for exercise intensity and modifications
- Age-appropriate exercises for ${userProfile.age}-year-old ${ageCategory}
- Weight considerations for ${userProfile.currentWeight} lb individual
- Include safe and progressive exercises
- Provide recent YouTube demonstration videos (prefer videos from 2023-2025)
- Use reputable fitness channels for video references
- Reps should be arrays of numbers (e.g., [12,12,10,10])
- For each exercise, provide 3 similar alternative exercises with different equipment options

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
          "reference": "https://www.youtube.com/watch?v=VIDEO_ID",
          "similarExercises": [
            {
              "name": "Alternative Exercise 1",
              "equipment": "different_equipment",
              "notes": "Alternative form tips",
              "reference": "https://www.youtube.com/watch?v=ALT_VIDEO_1"
            },
            {
              "name": "Alternative Exercise 2", 
              "equipment": "another_equipment",
              "notes": "Another alternative tips",
              "reference": "https://www.youtube.com/watch?v=ALT_VIDEO_2"
            },
            {
              "name": "Alternative Exercise 3",
              "equipment": "third_equipment", 
              "notes": "Third alternative tips",
              "reference": "https://www.youtube.com/watch?v=ALT_VIDEO_3"
            }
          ]
        }
      ]
    }
  ],
  "constraints": {
    "minutesPerSession": ${userProfile.minutesPerSession},
    "injuryNotes": "${
      userProfile.injuries || "No specific restrictions reported."
    }"
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
      fat_loss: "fat loss",
      hypertrophy: "muscle growth",
      strength: "strength building",
      returning: "returning to training",
      general_health: "general health",
    };

    const splitType =
      userProfile.daysPerWeek === 3
        ? "FBx3"
        : userProfile.daysPerWeek === 4
        ? "FBx4"
        : "PPLx5";

    return {
      description: `This is a ${splitType} program designed for ${
        goalTranslations[userProfile.goal]
      }, adapted for ${
        userProfile.location.join(" and ")
      } training with ${equipmentList}. The plan is automatically generated with safe and progressive exercises within ${
        userProfile.minutesPerSession
      } minutes per session. Customized for a ${userProfile.age}-year-old individual weighing ${userProfile.currentWeight} lb.`,
      split: splitType,
      sessions,
      constraints: {
        minutesPerSession: userProfile.minutesPerSession,
        injuryNotes:
          userProfile.injuries || "No specific restrictions reported.",
      },
      meta: {
        goal: userProfile.goal,
        experience: userProfile.experience,
        location: userProfile.location,
        equipment: userProfile.equipment,
      },
    };
  }

  private createFallbackWorkouts(userProfile: UserProfile): WorkoutSession[] {
    const { equipment, goal, experience, minutesPerSession } = userProfile;
    const hasWeights =
      equipment.includes("dumbbells") || equipment.includes("barbell");
    const isAdvanced =
      experience === "one_to_three_years" || experience === "three_years_plus";
    const locationText = userProfile.location.map(loc => loc === "home" ? "Home" : "Gym").join("/");

    const sessions: WorkoutSession[] = [];

    // Determine day numbers based on frequency
    const dayNumbers =
      userProfile.daysPerWeek === 3
        ? [1, 3, 5]
        : userProfile.daysPerWeek === 4
        ? [1, 2, 4, 6]
        : [1, 2, 3, 5, 6];

    if (userProfile.daysPerWeek >= 1) {
      // Session A
      sessions.push({
        dayOfWeek: dayNumbers[0],
        title: `Full Body A (${locationText})`,
        estMinutes: minutesPerSession - 5,
        items: [
          ...(hasWeights
            ? [
                {
                  name: "Goblet Squat",
                  equipment: "dumbbells" as const,
                  sets: isAdvanced ? 4 : 3,
                  reps: goal === "strength" ? [8, 6, 6, 6] : [12, 12, 10, 10],
                  notes: "Keep spine neutral; control the descent.",
                  reference: "https://www.youtube.com/watch?v=MeIiIdhvXT4",
                  similarExercises: [
                    {
                      name: "Bodyweight Squats",
                      equipment: "bodyweight" as const,
                      notes: "No weights needed, focus on form.",
                      reference: "https://www.youtube.com/watch?v=YaXPRqUwItQ"
                    },
                    {
                      name: "Split Squats",
                      equipment: "bodyweight" as const,
                      notes: "Single leg focus, better balance.",
                      reference: "https://www.youtube.com/watch?v=2C-uNgKwPLE"
                    },
                    {
                      name: "Wall Sits",
                      equipment: "bodyweight" as const,
                      notes: "Isometric hold, great for endurance.",
                      reference: "https://www.youtube.com/watch?v=y-wV4Venusw"
                    }
                  ]
                },
              ]
            : [
                {
                  name: "Bodyweight Squats",
                  equipment: "bodyweight" as const,
                  sets: 3,
                  reps: [15, 15, 12],
                  notes: "Keep chest up and knees aligned.",
                  reference: "https://www.youtube.com/watch?v=YaXPRqUwItQ",
                  similarExercises: [
                    {
                      name: "Jump Squats",
                      equipment: "bodyweight" as const,
                      notes: "Add explosive power, land softly.",
                      reference: "https://www.youtube.com/watch?v=YHoLVhIlhU4"
                    },
                    {
                      name: "Sumo Squats",
                      equipment: "bodyweight" as const,
                      notes: "Wider stance, targets inner thighs.",
                      reference: "https://www.youtube.com/watch?v=wmC6VZkKGbA"
                    },
                    {
                      name: "Single Leg Squats",
                      equipment: "bodyweight" as const,
                      notes: "Advanced, use assistance if needed.",
                      reference: "https://www.youtube.com/watch?v=t7Oj8-8Htyw"
                    }
                  ]
                },
              ]),
          {
            name: "Elevated Push-ups",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: isAdvanced ? [12, 10, 8] : [10, 8, 6],
            notes: "Elevate hands (table/chair) for better control.",
            reference: "https://www.youtube.com/watch?v=IODxDxX7oi4",
            similarExercises: [
              {
                name: "Standard Push-ups",
                equipment: "bodyweight" as const,
                notes: "Classic push-up, harder than elevated.",
                reference: "https://www.youtube.com/watch?v=IODxDxX7oi4"
              },
              {
                name: "Knee Push-ups",
                equipment: "bodyweight" as const,
                notes: "Easier variation, knees on ground.",
                reference: "https://www.youtube.com/watch?v=jWxvty2KROs"
              },
              {
                name: "Wall Push-ups",
                equipment: "bodyweight" as const,
                notes: "Beginner-friendly, standing against wall.",
                reference: "https://www.youtube.com/watch?v=M2rwvNhTOu0"
              }
            ]
          },
          ...(hasWeights
            ? [
                {
                  name: "One-Arm Dumbbell Row",
                  equipment: "dumbbells" as const,
                  sets: 3,
                  reps: [12, 12, 10],
                  notes: "Support free hand for stability.",
                  reference: "https://www.youtube.com/watch?v=pYcpY20QaE8",
                  similarExercises: [
                    {
                      name: "Bent-Over Two-Arm Row",
                      equipment: "dumbbells" as const,
                      notes: "Use both arms simultaneously.",
                      reference: "https://www.youtube.com/watch?v=roCP6wCXPqo"
                    },
                    {
                      name: "Inverted Row",
                      equipment: "bodyweight" as const,
                      notes: "Use table or low bar for bodyweight.",
                      reference: "https://www.youtube.com/watch?v=hXTc1mDnZCw"
                    },
                    {
                      name: "Band Rows",
                      equipment: "bands" as const,
                      notes: "Use resistance bands if available.",
                      reference: "https://www.youtube.com/watch?v=3e3VALGAAW8"
                    }
                  ]
                },
              ]
            : [
                {
                  name: "Inverted Row",
                  equipment: "bodyweight" as const,
                  sets: 3,
                  reps: [10, 8, 8],
                  notes: "Use table or low bar.",
                  reference: "https://www.youtube.com/watch?v=hXTc1mDnZCw",
                  similarExercises: [
                    {
                      name: "Superman",
                      equipment: "bodyweight" as const,
                      notes: "Lying on stomach, lift chest and arms.",
                      reference: "https://www.youtube.com/watch?v=z6PJMT2y8GQ"
                    },
                    {
                      name: "Reverse Fly",
                      equipment: "bodyweight" as const,
                      notes: "Standing, arms out to sides.",
                      reference: "https://www.youtube.com/watch?v=ea7u2XnCMbA"
                    },
                    {
                      name: "Door Pull",
                      equipment: "bodyweight" as const,
                      notes: "Use sturdy door for pulling motion.",
                      reference: "https://www.youtube.com/watch?v=hXTc1mDnZCw"
                    }
                  ]
                },
              ]),
          {
            name: "Dead Bug",
            equipment: "bodyweight" as const,
            sets: 2,
            reps: [12, 12],
            notes: "Core anti-extension for lower back support.",
            reference: "https://www.youtube.com/watch?v=5rp3t8DlcwU",
            similarExercises: [
              {
                name: "Bird Dog",
                equipment: "bodyweight" as const,
                notes: "On hands and knees, opposite arm/leg.",
                reference: "https://www.youtube.com/watch?v=wiFNA3sqjCA"
              },
              {
                name: "Modified Plank",
                equipment: "bodyweight" as const,
                notes: "Plank with arm/leg lifts.",
                reference: "https://www.youtube.com/watch?v=pSHjTRCQxIw"
              },
              {
                name: "Glute Bridge",
                equipment: "bodyweight" as const,
                notes: "Hip thrust motion, glute activation.",
                reference: "https://www.youtube.com/watch?v=OUgsJ8-Vi0E"
              }
            ]
          },
        ],
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
            equipment: hasWeights
              ? ("dumbbells" as const)
              : ("bodyweight" as const),
            sets: 3,
            reps: [12, 10, 10],
            notes: "Hip hinge movement, keep back neutral.",
            reference: "https://www.youtube.com/watch?v=DJpN7cS0B1o",
            similarExercises: [
              {
                name: "Good Mornings",
                equipment: hasWeights ? "dumbbells" as const : "bodyweight" as const,
                notes: "Hip hinge with weight on shoulders.",
                reference: "https://www.youtube.com/watch?v=YA-h3n9L4YU"
              },
              {
                name: "Hip Hinge",
                equipment: "bodyweight" as const,
                notes: "Practice the movement pattern.",
                reference: "https://www.youtube.com/watch?v=cmjgmi-dPbQ"
              },
              {
                name: "Glute Bridge",
                equipment: "bodyweight" as const,
                notes: "Alternative hip strengthening.",
                reference: "https://www.youtube.com/watch?v=OUgsJ8-Vi0E"
              }
            ]
          },
          {
            name: hasWeights ? "Seated Shoulder Press" : "Pike Push-ups",
            equipment: hasWeights
              ? ("dumbbells" as const)
              : ("bodyweight" as const),
            sets: 3,
            reps: hasWeights ? [12, 10, 8] : [8, 6, 6],
            notes: hasWeights
              ? "Support back for stability."
              : "Focus on shoulders.",
            reference: hasWeights
              ? "https://www.youtube.com/watch?v=B-aVuyhvLHU"
              : "https://www.youtube.com/watch?v=sp3iG5C4_rU",
            similarExercises: [
              {
                name: "Standing Shoulder Press",
                equipment: hasWeights ? "dumbbells" as const : "bodyweight" as const,
                notes: "Standing variation for core engagement.",
                reference: "https://www.youtube.com/watch?v=2yjwXTZQDDI"
              },
              {
                name: "Handstand Push-ups",
                equipment: "bodyweight" as const,
                notes: "Advanced variation against wall.",
                reference: "https://www.youtube.com/watch?v=tQhrk6WMcKw"
              },
              {
                name: "Lateral Raises",
                equipment: hasWeights ? "dumbbells" as const : "bodyweight" as const,
                notes: "Side shoulder isolation movement.",
                reference: "https://www.youtube.com/watch?v=3VcKaXpzqRo"
              }
            ]
          },
          {
            name: "Lunges",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: [12, 12, 10],
            notes: "Controlled lunge, keep torso upright.",
            reference: "https://www.youtube.com/watch?v=2C-uNgKwPLE",
            similarExercises: [
              {
                name: "Reverse Lunges",
                equipment: "bodyweight" as const,
                notes: "Step backward instead of forward.",
                reference: "https://www.youtube.com/watch?v=xWdOZtEJGpw"
              },
              {
                name: "Side Lunges",
                equipment: "bodyweight" as const,
                notes: "Lateral movement, targets different muscles.",
                reference: "https://www.youtube.com/watch?v=8F43YmKJUkY"
              },
              {
                name: "Step-ups",
                equipment: "bodyweight" as const,
                notes: "Use chair or step for elevation.",
                reference: "https://www.youtube.com/watch?v=dQqApCGd5Ss"
              }
            ]
          },
          {
            name: "Plank",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: [30, 30, 30],
            notes: "Seconds instead of reps; align ribs and pelvis.",
            reference: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
            similarExercises: [
              {
                name: "Side Plank",
                equipment: "bodyweight" as const,
                notes: "Target obliques and lateral core.",
                reference: "https://www.youtube.com/watch?v=XeN4pEZZHy8"
              },
              {
                name: "Modified Plank",
                equipment: "bodyweight" as const,
                notes: "Knees down for easier variation.",
                reference: "https://www.youtube.com/watch?v=pSHjTRCQxIw"
              },
              {
                name: "Plank to Downward Dog",
                equipment: "bodyweight" as const,
                notes: "Dynamic plank variation.",
                reference: "https://www.youtube.com/watch?v=Dd2e-ZISF2c"
              }
            ]
          },
        ],
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
            reference: "https://www.youtube.com/watch?v=YHoLVhIlhU4",
            similarExercises: [
              {
                name: "Squat to Calf Raise",
                equipment: "bodyweight" as const,
                notes: "Lower impact alternative.",
                reference: "https://www.youtube.com/watch?v=en1DKnApFNc"
              },
              {
                name: "Squat Pulses",
                equipment: "bodyweight" as const,
                notes: "Stay low, small up and down pulses.",
                reference: "https://www.youtube.com/watch?v=Z8LM7kRwDZE"
              },
              {
                name: "Regular Squats",
                equipment: "bodyweight" as const,
                notes: "Basic squat without jumping.",
                reference: "https://www.youtube.com/watch?v=YaXPRqUwItQ"
              }
            ]
          },
          {
            name: "Burpees",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: goal === "fat_loss" ? [12, 10, 8] : [8, 6, 6],
            notes: "Controlled pace, don't rush.",
            reference: "https://www.youtube.com/watch?v=qLBImHhCXSw",
            similarExercises: [
              {
                name: "Modified Burpees",
                equipment: "bodyweight" as const,
                notes: "Step back instead of jumping.",
                reference: "https://www.youtube.com/watch?v=JZQA08SlJnM"
              },
              {
                name: "Squat Thrusts",
                equipment: "bodyweight" as const,
                notes: "Burpee without the jump up.",
                reference: "https://www.youtube.com/watch?v=8LSWfQHGjYk"
              },
              {
                name: "Bear Crawl",
                equipment: "bodyweight" as const,
                notes: "Crawl forward and backward.",
                reference: "https://www.youtube.com/watch?v=B296mZDhrP4"
              }
            ]
          },
          {
            name: "Mountain Climbers",
            equipment: "bodyweight" as const,
            sets: 3,
            reps: [20, 20, 15],
            notes: "Keep hips stable.",
            reference: "https://www.youtube.com/watch?v=cnyTQDSE884",
            similarExercises: [
              {
                name: "High Knees",
                equipment: "bodyweight" as const,
                notes: "Standing, lift knees to chest.",
                reference: "https://www.youtube.com/watch?v=8opcQdC-V-U"
              },
              {
                name: "Running in Place",
                equipment: "bodyweight" as const,
                notes: "Simple cardio alternative.",
                reference: "https://www.youtube.com/watch?v=vr24Ym4Yh9E"
              },
              {
                name: "Plank Jacks",
                equipment: "bodyweight" as const,
                notes: "Jump feet in and out in plank.",
                reference: "https://www.youtube.com/watch?v=maP68vZFw5s"
              }
            ]
          },
        ],
      });
    }

    return sessions.slice(0, userProfile.daysPerWeek);
  }
}

// Export singleton instance
export const aiWorkoutGenerator = new AIWorkoutGenerator();
