// Simple script to create multiple test workout plans
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const testWorkouts = [
  {
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
        title: "HIIT Cardio",
        focus: "Fat Burning",
        estimatedDuration: 45,
        blocks: [
          {
            exerciseId: "burpees",
            name: "Burpees",
            sets: 3,
            reps: "10",
            rest: "60s",
          },
          {
            exerciseId: "jumping_jacks",
            name: "Jumping Jacks",
            sets: 4,
            reps: "30",
            rest: "30s",
          },
        ],
      },
      {
        id: "day2",
        title: "Circuit Training",
        focus: "Full Body Burn",
        estimatedDuration: 45,
        blocks: [
          {
            exerciseId: "mountain_climbers",
            name: "Mountain Climbers",
            sets: 3,
            reps: "20",
            rest: "45s",
          },
        ],
      },
      {
        id: "day3",
        title: "Active Recovery",
        focus: "Light Movement",
        estimatedDuration: 30,
        blocks: [
          {
            exerciseId: "walking",
            name: "Walking",
            sets: 1,
            reps: "30 min",
            rest: "0s",
          },
        ],
      },
    ],
    createdDaysAgo: 5,
  },
  {
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
          },
          {
            exerciseId: "incline_press",
            name: "Incline Press",
            sets: 3,
            reps: "10-12",
            rest: "2 min",
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
          },
          {
            exerciseId: "pull_ups",
            name: "Pull-ups",
            sets: 3,
            reps: "8-12",
            rest: "2 min",
          },
        ],
      },
      {
        id: "day3",
        title: "Legs",
        focus: "Lower Body",
        estimatedDuration: 60,
        blocks: [
          {
            exerciseId: "squats",
            name: "Squats",
            sets: 4,
            reps: "8-10",
            rest: "3 min",
          },
        ],
      },
      {
        id: "day4",
        title: "Shoulders",
        focus: "Shoulders & Core",
        estimatedDuration: 50,
        blocks: [
          {
            exerciseId: "shoulder_press",
            name: "Shoulder Press",
            sets: 4,
            reps: "8-10",
            rest: "2 min",
          },
        ],
      },
    ],
    createdDaysAgo: 12,
  },
  {
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
        focus: "Strength",
        estimatedDuration: 75,
        blocks: [
          {
            exerciseId: "deadlifts",
            name: "Deadlifts",
            sets: 5,
            reps: "3-5",
            rest: "4-5 min",
          },
        ],
      },
      {
        id: "day2",
        title: "Heavy Bench",
        focus: "Upper Strength",
        estimatedDuration: 75,
        blocks: [
          {
            exerciseId: "bench_press",
            name: "Bench Press",
            sets: 5,
            reps: "3-5",
            rest: "4-5 min",
          },
        ],
      },
      {
        id: "day3",
        title: "Heavy Squats",
        focus: "Lower Strength",
        estimatedDuration: 75,
        blocks: [
          {
            exerciseId: "squats",
            name: "Squats",
            sets: 5,
            reps: "3-5",
            rest: "4-5 min",
          },
        ],
      },
      {
        id: "day4",
        title: "Accessory Work",
        focus: "Weak Points",
        estimatedDuration: 60,
        blocks: [
          {
            exerciseId: "close_grip_bench",
            name: "Close Grip Bench",
            sets: 4,
            reps: "8-10",
            rest: "2-3 min",
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
          },
        ],
      },
    ],
    createdDaysAgo: 20,
  },
];

async function createTestWorkouts() {
  console.log("Creating test workout plans...");

  try {
    // Get the first user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("No user found.");
      return;
    }

    console.log(`Creating workouts for user: ${user.email}`);

    // Create each test workout
    for (const workout of testWorkouts) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - workout.createdDaysAgo);

      const workoutPlan = await prisma.workoutPlan.create({
        data: {
          userId: user.id,
          summary: workout.summary,
          weeks: workout.weeks,
          schedule: workout.schedule,
          days: workout.days,
          source: "fallback",
          createdAt: createdAt,
        },
      });

      console.log(
        `✅ Created: ${workout.summary.goal} Plan (ID: ${workoutPlan.id})`
      );
    }

    console.log("\n🎉 Successfully created test workout plans!");
  } catch (error) {
    console.error("Error creating workout plans:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestWorkouts();
