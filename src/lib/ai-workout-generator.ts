// AI Workout Generation Service

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
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

interface WorkoutDay {
  id: string;
  title: string;
  focus: string;
  estimatedDuration: number;
  blocks: Exercise[];
}

interface GeneratedWorkoutPlan {
  summary: {
    daysPerWeek: number;
    minutes: number;
    goal: string;
  };
  weeks: number;
  schedule: string[];
  days: WorkoutDay[];
}

export class AIWorkoutGenerator {
  private openai: any;

  constructor() {
    // Only initialize OpenAI if the API key exists
    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = require('openai');
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      } catch (error) {
        console.warn('OpenAI not available. Using fallback generation.');
      }
    }
  }

  async generateWorkoutPlan(userProfile: UserProfile): Promise<GeneratedWorkoutPlan> {
    try {
      if (this.openai) {
        return await this.generateWithAI(userProfile);
      } else {
        return this.generateFallbackPlan(userProfile);
      }
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      return this.generateFallbackPlan(userProfile);
    }
  }

  private async generateWithAI(userProfile: UserProfile): Promise<GeneratedWorkoutPlan> {
    const prompt = this.createWorkoutPrompt(userProfile);

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model
      messages: [
        {
          role: "system",
          content: `You are an expert fitness trainer with 15+ years of experience. Create personalized workout plans based on user profiles. Always respond with valid JSON format matching the specified structure. Consider safety, progression, and effectiveness.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    try {
      return JSON.parse(response);
    } catch (parseError) {
      throw new Error('Invalid JSON response from AI');
    }
  }

  private createWorkoutPrompt(userProfile: UserProfile): string {
    const equipmentList = userProfile.equipment.join(", ");
    const injuryInfo = userProfile.injuries ? `IMPORTANT: User has injuries/restrictions: "${userProfile.injuries}". Modify exercises accordingly for safety.` : "";

    return `Create a ${userProfile.daysPerWeek}-day workout plan for a user with the following profile:

**User Profile:**
- Goal: ${userProfile.goal}
- Experience Level: ${userProfile.experience}  
- Days per Week: ${userProfile.daysPerWeek}
- Minutes per Session: ${userProfile.minutesPerSession}
- Available Equipment: ${equipmentList}
- Workout Location: ${userProfile.location}
${injuryInfo}

**Requirements:**
- Create ${userProfile.daysPerWeek} different workout days
- Each workout should fit within ${userProfile.minutesPerSession} minutes
- Use only the available equipment: ${equipmentList}
- Appropriate for ${userProfile.experience} level
- Focus on ${userProfile.goal}

**Response Format (JSON only):**
{
  "summary": {
    "daysPerWeek": ${userProfile.daysPerWeek},
    "minutes": ${userProfile.minutesPerSession},
    "goal": "${userProfile.goal}"
  },
  "weeks": 4,
  "schedule": [${userProfile.daysPerWeek === 3 ? '"mon", "wed", "fri"' : '"mon", "tue", "thu", "sat"'}],
  "days": [
    {
      "id": "day1",
      "title": "Workout Name",
      "focus": "Muscle groups/focus",
      "estimatedDuration": ${userProfile.minutesPerSession},
      "blocks": [
        {
          "exerciseId": "ex_exercise_name",
          "name": "Exercise Name",
          "sets": 3,
          "reps": "8-12",
          "rest": "60s",
          "notes": "Form tips if needed"
        }
      ]
    }
  ]
}

Generate a complete, safe, and effective workout plan.`;
  }

  private generateFallbackPlan(userProfile: UserProfile): GeneratedWorkoutPlan {
    // Smart fallback based on user preferences
    const schedule = userProfile.daysPerWeek === 3 
      ? ["mon", "wed", "fri"] 
      : userProfile.daysPerWeek === 4 
      ? ["mon", "tue", "thu", "sat"]
      : ["mon", "tue", "wed", "fri", "sat"];

    const days = this.createFallbackWorkouts(userProfile);

    return {
      summary: {
        daysPerWeek: userProfile.daysPerWeek,
        minutes: userProfile.minutesPerSession,
        goal: userProfile.goal,
      },
      weeks: 4,
      schedule,
      days,
    };
  }

  private createFallbackWorkouts(userProfile: UserProfile): WorkoutDay[] {
    const { equipment, goal, experience, minutesPerSession } = userProfile;
    const hasWeights = equipment.includes('dumbbells') || equipment.includes('barbell');
    const isAdvanced = experience === 'one_to_three_years' || experience === 'three_years_plus';

    // Base exercises by equipment and goal
    const workouts: WorkoutDay[] = [];

    if (userProfile.daysPerWeek >= 3) {
      // Full Body A
      workouts.push({
        id: "day1",
        title: "Full Body Strength A",
        focus: "Compound movements - Upper & Lower",
        estimatedDuration: minutesPerSession,
        blocks: [
          ...(hasWeights ? [{
            exerciseId: "ex_goblet_squat",
            name: "Goblet Squats",
            sets: isAdvanced ? 4 : 3,
            reps: goal === 'strength' ? '5-8' : '8-12',
            rest: "60-90s",
            notes: "Control the descent"
          }] : [{
            exerciseId: "ex_bodyweight_squat",
            name: "Bodyweight Squats",
            sets: 3,
            reps: goal === 'strength' ? '12-15' : '15-20',
            rest: "45s",
          }]),
          {
            exerciseId: "ex_pushup",
            name: equipment.includes('bodyweight') ? "Push-ups" : "Dumbbell Press",
            sets: 3,
            reps: isAdvanced ? '8-12' : '6-10',
            rest: "60s",
            notes: "Modify on knees if needed"
          },
          ...(hasWeights ? [{
            exerciseId: "ex_bent_over_row",
            name: "Bent Over Row",
            sets: 3,
            reps: '8-12',
            rest: "60s"
          }] : [{
            exerciseId: "ex_bodyweight_row",
            name: "Bodyweight Rows",
            sets: 3,
            reps: '8-12',
            rest: "45s"
          }]),
          {
            exerciseId: "ex_plank",
            name: "Plank Hold",
            sets: 3,
            reps: "30-60s",
            rest: "45s"
          }
        ]
      });

      // Full Body B
      workouts.push({
        id: "day2", 
        title: "Full Body Strength B",
        focus: "Different movement patterns",
        estimatedDuration: minutesPerSession,
        blocks: [
          {
            exerciseId: "ex_lunge",
            name: hasWeights ? "Dumbbell Lunges" : "Bodyweight Lunges",
            sets: 3,
            reps: goal === 'strength' ? '6-8 each leg' : '10-12 each leg',
            rest: "60s"
          },
          {
            exerciseId: "ex_pike_pushup",
            name: "Pike Push-ups",
            sets: 3,
            reps: '5-8',
            rest: "60s",
            notes: "Targets shoulders"
          },
          {
            exerciseId: "ex_glute_bridge",
            name: hasWeights ? "Weighted Glute Bridge" : "Glute Bridge",
            sets: 3,
            reps: '12-15',
            rest: "45s"
          },
          {
            exerciseId: "ex_mountain_climber",
            name: "Mountain Climbers", 
            sets: 3,
            reps: "20-30",
            rest: "45s"
          }
        ]
      });

      // Add third day if needed
      if (userProfile.daysPerWeek >= 3) {
        workouts.push({
          id: "day3",
          title: "Full Body Power",
          focus: "Power and conditioning",
          estimatedDuration: minutesPerSession,
          blocks: [
            {
              exerciseId: "ex_jump_squat",
              name: "Jump Squats",
              sets: 4,
              reps: '8-12',
              rest: "60s"
            },
            {
              exerciseId: "ex_burpee",
              name: "Burpees",
              sets: 3,
              reps: goal === 'fat_loss' ? '10-15' : '5-8',
              rest: "90s"
            },
            {
              exerciseId: "ex_deadbug", 
              name: "Dead Bug",
              sets: 3,
              reps: '8-10 each side',
              rest: "45s"
            }
          ]
        });
      }
    }

    return workouts.slice(0, userProfile.daysPerWeek);
  }
}

// Export singleton instance
export const aiWorkoutGenerator = new AIWorkoutGenerator();