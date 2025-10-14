// Mock workout plans seeding script
// Run with: node scripts/seed-mock-workouts.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mockWorkoutPlans = [
  {
    onboarding: {
      goal: "fat_loss",
      experience: "beginner",
      daysPerWeek: 3,
      minutesPerSession: 45,
      equipment: ["dumbbells", "bands"],
      location: "home",
    },
    summary: {
      goal: "Fat Loss",
      daysPerWeek: 3,
      minutes: 45,
    },
    weeks: 8,
    schedule: ["Monday", "Wednesday", "Friday"],
    days: [
      {
        id: "day1",
        title: "Full Body Circuit",
        focus: "Fat Burning & Conditioning",
        estimatedDuration: 45,
        blocks: [
          {
            exerciseId: "burpees",
            name: "Burpees",
            sets: 3,
            reps: "10-12",
            rest: "60s",
            notes: "Focus on form over speed",
          },
          {
            exerciseId: "mountain_climbers",
            name: "Mountain Climbers",
            sets: 3,
            reps: "20",
            rest: "45s",
            notes: "Keep core tight throughout",
          },
          {
            exerciseId: "jumping_jacks",
            name: "Jumping Jacks",
            sets: 4,
            reps: "30",
            rest: "30s",
            notes: "High intensity intervals",
          },
        ],
      },
      {
        id: "day2",
        title: "HIIT Cardio",
        focus: "High Intensity Fat Burn",
        estimatedDuration: 45,
        blocks: [
          {
            exerciseId: "squat_jumps",
            name: "Squat Jumps",
            sets: 4,
            reps: "15",
            rest: "45s",
            notes: "Land softly, full squat depth",
          },
          {
            exerciseId: "high_knees",
            name: "High Knees",
            sets: 3,
            reps: "30s",
            rest: "30s",
            notes: "Drive knees up to chest level",
          },
        ],
      },
      {
        id: "day3",
        title: "Active Recovery",
        focus: "Light Movement & Stretching",
        estimatedDuration: 30,
        blocks: [
          {
            exerciseId: "walking",
            name: "Brisk Walking",
            sets: 1,
            reps: "20 min",
            rest: "0s",
            notes: "Maintain steady pace",
          },
          {
            exerciseId: "stretching",
            name: "Dynamic Stretching",
            sets: 1,
            reps: "10 min",
            rest: "0s",
            notes: "Focus on major muscle groups",
          },
        ],
      },
    ],
    createdDaysAgo: 5,
  },
  {
    onboarding: {
      goal: "hypertrophy",
      experience: "one_to_three_years",
      daysPerWeek: 4,
      minutesPerSession: 60,
      equipment: ["barbell", "dumbbells", "machines"],
      location: "gym",
    },
    summary: {
      goal: "Muscle Building",
      daysPerWeek: 4,
      minutes: 60,
    },
    weeks: 12,
    schedule: ["Monday", "Tuesday", "Thursday", "Friday"],
    days: [
      {
        id: "day1",
        title: "Chest & Triceps",
        focus: "Push Muscles",
        estimatedDuration: 60,
        blocks: [
          {
            exerciseId: "bench_press",
            name: "Bench Press",
            sets: 4,
            reps: "8-10",
            rest: "2-3 min",
            notes: "Focus on controlled negatives",
          },
          {
            exerciseId: "incline_press",
            name: "Incline Dumbbell Press",
            sets: 3,
            reps: "10-12",
            rest: "2 min",
            notes: "Squeeze at the top",
          },
          {
            exerciseId: "tricep_dips",
            name: "Tricep Dips",
            sets: 3,
            reps: "12-15",
            rest: "90s",
            notes: "Full range of motion",
          },
        ],
      },
      {
        id: "day2",
        title: "Back & Biceps",
        focus: "Pull Muscles",
        estimatedDuration: 60,
        blocks: [
          {
            exerciseId: "deadlifts",
            name: "Deadlifts",
            sets: 4,
            reps: "6-8",
            rest: "3 min",
            notes: "Keep back straight, engage core",
          },
          {
            exerciseId: "pull_ups",
            name: "Pull-ups",
            sets: 3,
            reps: "8-12",
            rest: "2 min",
            notes: "Use assistance if needed",
          },
        ],
      },
      {
        id: "day3",
        title: "Legs",
        focus: "Lower Body Power",
        estimatedDuration: 60,
        blocks: [
          {
            exerciseId: "squats",
            name: "Barbell Squats",
            sets: 4,
            reps: "8-10",
            rest: "3 min",
            notes: "Go below parallel",
          },
          {
            exerciseId: "leg_press",
            name: "Leg Press",
            sets: 3,
            reps: "12-15",
            rest: "2 min",
            notes: "Control the descent",
          },
        ],
      },
      {
        id: "day4",
        title: "Shoulders & Abs",
        focus: "Shoulders & Core",
        estimatedDuration: 50,
        blocks: [
          {
            exerciseId: "shoulder_press",
            name: "Overhead Press",
            sets: 4,
            reps: "8-10",
            rest: "2 min",
            notes: "Keep core tight",
          },
          {
            exerciseId: "planks",
            name: "Planks",
            sets: 3,
            reps: "60s",
            rest: "90s",
            notes: "Maintain straight line",
          },
        ],
      },
    ],
    createdDaysAgo: 12,
  },
  {
    onboarding: {
      goal: "strength",
      experience: "three_years_plus",
      daysPerWeek: 5,
      minutesPerSession: 75,
      equipment: ["barbell", "dumbbells", "machines"],
      location: "gym",
    },
    summary: {
      goal: "Build Strength",
      daysPerWeek: 5,
      minutes: 75,
    },
    weeks: 16,
    schedule: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
    days: [
      {
        id: "day1",
        title: "Heavy Deadlifts",
        focus: "Posterior Chain Strength",
        estimatedDuration: 75,
        blocks: [
          {
            exerciseId: "deadlifts",
            name: "Conventional Deadlifts",
            sets: 5,
            reps: "3-5",
            rest: "4-5 min",
            notes: "Work up to 85-90% 1RM",
          },
          {
            exerciseId: "rows",
            name: "Bent Over Rows",
            sets: 4,
            reps: "6-8",
            rest: "3 min",
            notes: "Focus on squeezing shoulder blades",
          },
        ],
      },
      {
        id: "day2",
        title: "Heavy Bench",
        focus: "Upper Body Strength",
        estimatedDuration: 75,
        blocks: [
          {
            exerciseId: "bench_press",
            name: "Competition Bench Press",
            sets: 5,
            reps: "3-5",
            rest: "4-5 min",
            notes: "Pause on chest, work to 90% 1RM",
          },
        ],
      },
      {
        id: "day3",
        title: "Heavy Squats",
        focus: "Lower Body Strength",
        estimatedDuration: 75,
        blocks: [
          {
            exerciseId: "squats",
            name: "Back Squats",
            sets: 5,
            reps: "3-5",
            rest: "4-5 min",
            notes: "Full depth, work to 85-90% 1RM",
          },
        ],
      },
      {
        id: "day4",
        title: "Accessory Work",
        focus: "Weak Point Training",
        estimatedDuration: 60,
        blocks: [
          {
            exerciseId: "close_grip_bench",
            name: "Close Grip Bench Press",
            sets: 4,
            reps: "8-10",
            rest: "2-3 min",
            notes: "Focus on tricep engagement",
          },
        ],
      },
      {
        id: "day5",
        title: "Conditioning",
        focus: "Work Capacity",
        estimatedDuration: 45,
        blocks: [
          {
            exerciseId: "farmers_walks",
            name: "Farmers Walks",
            sets: 4,
            reps: "40m",
            rest: "2 min",
            notes: "Heavy weights, maintain posture",
          },
        ],
      },
    ],
    createdDaysAgo: 20,
  },
  {
    onboarding: {
      goal: "general_health",
      experience: "beginner",
      daysPerWeek: 3,
      minutesPerSession: 30,
      equipment: ["bodyweight"],
      location: "home",
    },
    summary: {
      goal: "General Health",
      daysPerWeek: 3,
      minutes: 30,
    },
    weeks: 6,
    schedule: ["Monday", "Wednesday", "Friday"],
    days: [
      {
        id: "day1",
        title: "Gentle Movement",
        focus: "Mobility & Light Cardio",
        estimatedDuration: 30,
        blocks: [
          {
            exerciseId: "walking_place",
            name: "Marching in Place",
            sets: 3,
            reps: "2 min",
            rest: "1 min",
            notes: "Lift knees to comfortable height",
          },
          {
            exerciseId: "arm_circles",
            name: "Arm Circles",
            sets: 2,
            reps: "10 each direction",
            rest: "30s",
            notes: "Start small, gradually increase size",
          },
        ],
      },
      {
        id: "day2",
        title: "Basic Strength",
        focus: "Functional Movement",
        estimatedDuration: 30,
        blocks: [
          {
            exerciseId: "wall_pushups",
            name: "Wall Push-ups",
            sets: 2,
            reps: "8-10",
            rest: "90s",
            notes: "Keep body straight, controlled movement",
          },
          {
            exerciseId: "chair_squats",
            name: "Chair-Assisted Squats",
            sets: 2,
            reps: "8-10",
            rest: "90s",
            notes: "Use chair for support if needed",
          },
        ],
      },
      {
        id: "day3",
        title: "Flexibility",
        focus: "Stretching & Recovery",
        estimatedDuration: 25,
        blocks: [
          {
            exerciseId: "gentle_stretching",
            name: "Full Body Stretching",
            sets: 1,
            reps: "15 min",
            rest: "0s",
            notes: "Hold each stretch for 30 seconds",
          },
          {
            exerciseId: "breathing",
            name: "Deep Breathing",
            sets: 1,
            reps: "10 min",
            rest: "0s",
            notes: "Focus on relaxation",
          },
        ],
      },
    ],
    createdDaysAgo: 2,
  },
];

async function seedMockWorkouts() {
  console.log("Starting to seed mock workout plans...");

  try {
    // Get the first user (you'll need to adjust this for your specific user)
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("No user found. Please create a user first.");
      return;
    }

    console.log(`Found user: ${user.email}`);

    // Delete existing workout plans for clean testing
    await prisma.workoutPlan.deleteMany({
      where: { userId: user.id },
    });
    console.log("Cleared existing workout plans");

    // Create each mock workout plan
    for (const mockPlan of mockWorkoutPlans) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - mockPlan.createdDaysAgo);

      const workoutPlan = await prisma.workoutPlan.create({
        data: {
          userId: user.id,
          summary: mockPlan.summary,
          weeks: mockPlan.weeks,
          schedule: mockPlan.schedule,
          days: mockPlan.days,
          onboarding: mockPlan.onboarding,
          source: "fallback", // or 'ai'
          createdAt: createdAt,
        },
      });

      console.log(
        `Created workout plan: ${mockPlan.summary.goal} (ID: ${workoutPlan.id})`
      );
    }

    console.log("✅ Successfully seeded mock workout plans!");
  } catch (error) {
    console.error("Error seeding workout plans:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMockWorkouts();
