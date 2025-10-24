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

    if (userProfile.daysPerWeek === 1) {
      splitType = "FB1";
      dayNumbers = [1];
    } else if (userProfile.daysPerWeek === 2) {
      splitType = "FB2";
      dayNumbers = [1, 2];
    } else if (userProfile.daysPerWeek === 3) {
      splitType = "FBx3";
      dayNumbers = [1, 2, 3];
    } else if (userProfile.daysPerWeek === 4) {
      splitType = "FBx4";
      dayNumbers = [1, 2, 3, 4];
    } else if (userProfile.daysPerWeek === 5) {
      splitType = "PPLx5";
      dayNumbers = [1, 2, 3, 4, 5];
    } else if (userProfile.daysPerWeek === 6) {
      splitType = "PPLPPLx6";
      dayNumbers = [1, 2, 3, 4, 5, 6];
    } else if (userProfile.daysPerWeek === 7) {
      splitType = "Daily7";
      dayNumbers = [1, 2, 3, 4, 5, 6, 7];
    } else {
      // Fallback for any other number of days
      splitType = `Custom${userProfile.daysPerWeek}`;
      dayNumbers = Array.from({length: userProfile.daysPerWeek}, (_, i) => i + 1);
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
${dayNumbers.map((dayNum, index) => `    {
      "dayOfWeek": ${dayNum},
      "title": "Day ${dayNum} Session (${locationText})",
      "estMinutes": ${userProfile.minutesPerSession - 5},
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
    }${index < dayNumbers.length - 1 ? ',' : ''}`).join('\n')}
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

    let splitType = "";
    if (userProfile.daysPerWeek === 1) {
      splitType = "FB1";
    } else if (userProfile.daysPerWeek === 2) {
      splitType = "FB2";
    } else if (userProfile.daysPerWeek === 3) {
      splitType = "FBx3";
    } else if (userProfile.daysPerWeek === 4) {
      splitType = "FBx4";
    } else if (userProfile.daysPerWeek === 5) {
      splitType = "PPLx5";
    } else if (userProfile.daysPerWeek === 6) {
      splitType = "PPLPPLx6";
    } else if (userProfile.daysPerWeek === 7) {
      splitType = "Daily7";
    } else {
      splitType = `Custom${userProfile.daysPerWeek}`;
    }

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
        location: userProfile.location.join(", "), // Convert array to string
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

    // Always use consecutive day numbers
    const dayNumbers = Array.from({length: userProfile.daysPerWeek}, (_, i) => i + 1);

    // Create exactly the number of sessions requested
    for (let i = 0; i < userProfile.daysPerWeek; i++) {
      const sessionType = this.getSessionType(i, userProfile.daysPerWeek);
      const session = this.createWorkoutSession(
        i,
        dayNumbers[i],
        sessionType,
        hasWeights,
        isAdvanced,
        goal,
        locationText,
        minutesPerSession
      );
      sessions.push(session);
    }

    return sessions;
  }

  private getSessionType(sessionIndex: number, totalDays: number): string {
    // Determine session type based on position and total days
    if (totalDays === 1) {
      return "full_body";
    } else if (totalDays === 2) {
      return sessionIndex === 0 ? "upper_body" : "lower_body";
    } else if (totalDays <= 4) {
      const types = ["full_body", "upper_body", "lower_body", "cardio"];
      return types[sessionIndex % types.length];
    } else if (totalDays <= 6) {
      const types = ["push", "pull", "legs", "upper", "lower", "cardio"];
      return types[sessionIndex % types.length];
    } else {
      // 7 days
      const types = ["push", "pull", "legs", "upper", "lower", "cardio", "recovery"];
      return types[sessionIndex % types.length];
    }
  }

  private createWorkoutSession(
    sessionIndex: number,
    dayOfWeek: number,
    sessionType: string,
    hasWeights: boolean,
    isAdvanced: boolean,
    goal: string,
    locationText: string,
    minutesPerSession: number
  ): WorkoutSession {
    const sessionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const sessionLabel = sessionLabels[sessionIndex] || String.fromCharCode(65 + sessionIndex);
    
    switch (sessionType) {
      case "full_body":
        return this.createFullBodySession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
      case "upper_body":
        return this.createUpperBodySession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
      case "lower_body":
        return this.createLowerBodySession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
      case "push":
        return this.createPushSession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
      case "pull":
        return this.createPullSession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
      case "legs":
        return this.createLegsSession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
      case "cardio":
        return this.createCardioSession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
      case "recovery":
        return this.createRecoverySession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
      default:
        return this.createFullBodySession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
    }
  }

  private createFullBodySession(sessionLabel: string, dayOfWeek: number, hasWeights: boolean, isAdvanced: boolean, goal: string, locationText: string, minutesPerSession: number): WorkoutSession {
    return {
      dayOfWeek,
      title: `Full Body ${sessionLabel} (${locationText})`,
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
          name: "Push-ups",
          equipment: "bodyweight" as const,
          sets: 3,
          reps: isAdvanced ? [12, 10, 8] : [10, 8, 6],
          notes: "Keep body straight and controlled movement.",
          reference: "https://www.youtube.com/watch?v=IODxDxX7oi4",
          similarExercises: [
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
            },
            {
              name: "Diamond Push-ups",
              equipment: "bodyweight" as const,
              notes: "Advanced variation, hands in diamond shape.",
              reference: "https://www.youtube.com/watch?v=J0DnG1_S92I"
            }
          ]
        },
        {
          name: "Plank",
          equipment: "bodyweight" as const,
          sets: 3,
          reps: [30, 30, 30],
          notes: "Hold for seconds, maintain straight body line.",
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
        }
      ]
    };
  }

  private createUpperBodySession(sessionLabel: string, dayOfWeek: number, hasWeights: boolean, isAdvanced: boolean, goal: string, locationText: string, minutesPerSession: number): WorkoutSession {
    return {
      dayOfWeek,
      title: `Upper Body ${sessionLabel} (${locationText})`,
      estMinutes: minutesPerSession - 5,
      items: [
        {
          name: hasWeights ? "Dumbbell Chest Press" : "Push-ups",
          equipment: hasWeights ? ("dumbbells" as const) : ("bodyweight" as const),
          sets: 3,
          reps: hasWeights ? [12, 10, 8] : [10, 8, 6],
          notes: hasWeights ? "Control the weight, full range of motion." : "Keep body straight and controlled movement.",
          reference: hasWeights ? "https://www.youtube.com/watch?v=VmB1G1K7v94" : "https://www.youtube.com/watch?v=IODxDxX7oi4",
          similarExercises: [
            {
              name: "Push-ups",
              equipment: "bodyweight" as const,
              notes: "Classic push-up variation.",
              reference: "https://www.youtube.com/watch?v=IODxDxX7oi4"
            },
            {
              name: "Wide-Grip Push-ups",
              equipment: "bodyweight" as const,
              notes: "Wider hand position, targets chest more.",
              reference: "https://www.youtube.com/watch?v=rr6GF8pBnLs"
            },
            {
              name: "Incline Push-ups",
              equipment: "bodyweight" as const,
              notes: "Hands elevated, easier variation.",
              reference: "https://www.youtube.com/watch?v=IODxDxX7oi4"
            }
          ]
        },
        {
          name: hasWeights ? "Bent-Over Row" : "Superman",
          equipment: hasWeights ? ("dumbbells" as const) : ("bodyweight" as const),
          sets: 3,
          reps: [12, 10, 10],
          notes: hasWeights ? "Keep back straight, pull to ribs." : "Lying down, lift chest and arms.",
          reference: hasWeights ? "https://www.youtube.com/watch?v=roCP6wCXPqo" : "https://www.youtube.com/watch?v=z6PJMT2y8GQ",
          similarExercises: [
            {
              name: "Reverse Fly",
              equipment: "bodyweight" as const,
              notes: "Arms out to sides, squeeze shoulder blades.",
              reference: "https://www.youtube.com/watch?v=ea7u2XnCMbA"
            },
            {
              name: "Y-Raises",
              equipment: "bodyweight" as const,
              notes: "Arms in Y position, strengthen rear delts.",
              reference: "https://www.youtube.com/watch?v=KkzF_hBGpAo"
            },
            {
              name: "Band Pull-Aparts",
              equipment: "bands" as const,
              notes: "Use resistance band if available.",
              reference: "https://www.youtube.com/watch?v=0tn8K_LFstg"
            }
          ]
        }
      ]
    };
  }

  private createLowerBodySession(sessionLabel: string, dayOfWeek: number, hasWeights: boolean, isAdvanced: boolean, goal: string, locationText: string, minutesPerSession: number): WorkoutSession {
    return {
      dayOfWeek,
      title: `Lower Body ${sessionLabel} (${locationText})`,
      estMinutes: minutesPerSession - 5,
      items: [
        {
          name: hasWeights ? "Romanian Deadlift" : "Single Leg Deadlift",
          equipment: hasWeights ? ("dumbbells" as const) : ("bodyweight" as const),
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
        }
      ]
    };
  }

  private createPushSession(sessionLabel: string, dayOfWeek: number, hasWeights: boolean, isAdvanced: boolean, goal: string, locationText: string, minutesPerSession: number): WorkoutSession {
    return this.createUpperBodySession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
  }

  private createPullSession(sessionLabel: string, dayOfWeek: number, hasWeights: boolean, isAdvanced: boolean, goal: string, locationText: string, minutesPerSession: number): WorkoutSession {
    return {
      dayOfWeek,
      title: `Pull ${sessionLabel} (${locationText})`,
      estMinutes: minutesPerSession - 5,
      items: [
        {
          name: hasWeights ? "Bent-Over Row" : "Superman",
          equipment: hasWeights ? ("dumbbells" as const) : ("bodyweight" as const),
          sets: 3,
          reps: [12, 10, 10],
          notes: hasWeights ? "Keep back straight, pull to ribs." : "Lying down, lift chest and arms.",
          reference: hasWeights ? "https://www.youtube.com/watch?v=roCP6wCXPqo" : "https://www.youtube.com/watch?v=z6PJMT2y8GQ",
          similarExercises: [
            {
              name: "Reverse Fly",
              equipment: "bodyweight" as const,
              notes: "Arms out to sides, squeeze shoulder blades.",
              reference: "https://www.youtube.com/watch?v=ea7u2XnCMbA"
            },
            {
              name: "Y-Raises",
              equipment: "bodyweight" as const,
              notes: "Arms in Y position, strengthen rear delts.",
              reference: "https://www.youtube.com/watch?v=KkzF_hBGpAo"
            },
            {
              name: "Band Pull-Aparts",
              equipment: "bands" as const,
              notes: "Use resistance band if available.",
              reference: "https://www.youtube.com/watch?v=0tn8K_LFstg"
            }
          ]
        }
      ]
    };
  }

  private createLegsSession(sessionLabel: string, dayOfWeek: number, hasWeights: boolean, isAdvanced: boolean, goal: string, locationText: string, minutesPerSession: number): WorkoutSession {
    return this.createLowerBodySession(sessionLabel, dayOfWeek, hasWeights, isAdvanced, goal, locationText, minutesPerSession);
  }

  private createCardioSession(sessionLabel: string, dayOfWeek: number, hasWeights: boolean, isAdvanced: boolean, goal: string, locationText: string, minutesPerSession: number): WorkoutSession {
    return {
      dayOfWeek,
      title: `Cardio ${sessionLabel} (${locationText})`,
      estMinutes: minutesPerSession - 10,
      items: [
        {
          name: "HIIT Circuit",
          equipment: "bodyweight" as const,
          sets: 4,
          reps: [30, 30, 30, 30],
          notes: "30 seconds work, 15 seconds rest. High intensity.",
          reference: "https://www.youtube.com/watch?v=IODxDxX7oi4",
          similarExercises: [
            {
              name: "Tabata Protocol",
              equipment: "bodyweight" as const,
              notes: "20 seconds work, 10 seconds rest.",
              reference: "https://www.youtube.com/watch?v=ExkGFQ_mGl4"
            },
            {
              name: "Steady State Cardio",
              equipment: "bodyweight" as const,
              notes: "Moderate intensity for longer duration.",
              reference: "https://www.youtube.com/watch?v=g8KmR7nP_Rs"
            },
            {
              name: "Circuit Training",
              equipment: "bodyweight" as const,
              notes: "Move between exercises with minimal rest.",
              reference: "https://www.youtube.com/watch?v=M2rwvNhTOu0"
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
        }
      ]
    };
  }

  private createRecoverySession(sessionLabel: string, dayOfWeek: number, hasWeights: boolean, isAdvanced: boolean, goal: string, locationText: string, minutesPerSession: number): WorkoutSession {
    return {
      dayOfWeek,
      title: `Recovery ${sessionLabel} (${locationText})`,
      estMinutes: minutesPerSession - 15,
      items: [
        {
          name: "Dynamic Stretching Flow",
          equipment: "bodyweight" as const,
          sets: 2,
          reps: [10, 10],
          notes: "Focus on mobility and flexibility.",
          reference: "https://www.youtube.com/watch?v=FSSDLDhbacc",
          similarExercises: [
            {
              name: "Static Stretching",
              equipment: "bodyweight" as const,
              notes: "Hold stretches for 30+ seconds.",
              reference: "https://www.youtube.com/watch?v=L_xrDAtykMI"
            },
            {
              name: "Yoga Flow",
              equipment: "bodyweight" as const,
              notes: "Gentle yoga sequence.",
              reference: "https://www.youtube.com/watch?v=v7AYKMP6rOE"
            },
            {
              name: "Foam Rolling",
              equipment: "bodyweight" as const,
              notes: "Self-massage for recovery.",
              reference: "https://www.youtube.com/watch?v=_5j8-1wKUeE"
            }
          ]
        },
        {
          name: "Light Movement",
          equipment: "bodyweight" as const,
          sets: 1,
          reps: [15],
          notes: "Easy pace, focus on movement quality.",
          reference: "https://www.youtube.com/watch?v=g8KmR7nP_Rs",
          similarExercises: [
            {
              name: "Walking",
              equipment: "bodyweight" as const,
              notes: "Low-intensity outdoor activity.",
              reference: "https://www.youtube.com/watch?v=9YXqhJyIlsc"
            },
            {
              name: "Gentle Swimming",
              equipment: "bodyweight" as const,
              notes: "Low-impact full-body movement.",
              reference: "https://www.youtube.com/watch?v=xqvTQx2-ZFU"
            },
            {
              name: "Tai Chi",
              equipment: "bodyweight" as const,
              notes: "Slow, controlled movements.",
              reference: "https://www.youtube.com/watch?v=M0oHp_0HeMw"
            }
          ]
        }
      ]
    };
  }

}

// Export singleton instance
export const aiWorkoutGenerator = new AIWorkoutGenerator();
