"use client";

import { useState } from "react";

interface PlanSummary {
  goal?: string;
  daysPerWeek?: number;
  minutes?: number;
}

interface PlanDay {
  title?: string;
  blocks?: Array<{
    exerciseId?: string;
    sets?: number;
    reps?: string;
  }>;
}

interface Plan {
  id: string;
  summary: PlanSummary;
  days: PlanDay[];
  createdAt: Date;
}

interface WorkoutListProps {
  plan: Plan;
}

interface WorkoutCardProps {
  workout: PlanDay;
  index: number;
  onNameUpdate?: (newName: string, index: number) => void;
}

function WorkoutCard({ workout, index, onNameUpdate }: WorkoutCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(
    workout.title || `Workout ${index + 1}`
  );

  const handleSave = () => {
    if (!editName.trim()) return;
    onNameUpdate?.(editName.trim(), index);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(workout.title || `Workout ${index + 1}`);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Get workout image based on workout type or use default
  const getWorkoutImage = (title?: string) => {
    const workoutType = title?.toLowerCase() || "";

    if (workoutType.includes("full") || workoutType.includes("body")) {
      return "🏋️";
    } else if (workoutType.includes("cardio") || workoutType.includes("run")) {
      return "🏃";
    } else if (
      workoutType.includes("strength") ||
      workoutType.includes("weight")
    ) {
      return "💪";
    } else if (
      workoutType.includes("yoga") ||
      workoutType.includes("stretch")
    ) {
      return "🧘";
    } else if (workoutType.includes("upper")) {
      return "💪";
    } else if (workoutType.includes("lower") || workoutType.includes("leg")) {
      return "🦵";
    } else {
      return "🏃‍♂️";
    }
  };

  const getExerciseCount = () => {
    return workout.blocks?.length || 0;
  };

  // Mock duration for now - in a real app this would come from workout data
  const getDuration = () => {
    return "45 min"; // This should be calculated or come from workout data
  };

  // Mock goal for now - in a real app this would come from workout data
  const getGoal = () => {
    const workoutType = workout.title?.toLowerCase() || "";
    if (workoutType.includes("strength")) return "Build Strength";
    if (workoutType.includes("cardio")) return "Improve Cardio";
    if (workoutType.includes("full")) return "Full Body";
    return "General Fitness";
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      {/* Header with title and edit button */}
      <div className="flex items-start justify-between mb-4">
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-lg font-semibold text-black bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent flex-1"
              placeholder="Workout name"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={!editName.trim()}
              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-black">
              {workout.title || `Workout ${index + 1}`}
            </h3>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit workout name"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Content with image (50%) and details (50%) */}
      <div className="flex space-x-4 mb-6">
        {/* Workout Image - 50% width */}
        <div className="w-1/2">
          <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-4xl">
            {getWorkoutImage(workout.title)}
          </div>
        </div>

        {/* Workout Details - 50% width */}
        <div className="w-1/2 space-y-3">
          {/* Goal */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Goal</p>
              <p className="font-medium text-gray-900">{getGoal()}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium text-gray-900">{getDuration()}</p>
            </div>
          </div>

          {/* Exercises */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Exercises</p>
              <p className="font-medium text-gray-900">
                {getExerciseCount()} exercises
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Workout Button */}
      <button className="w-full bg-black text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors font-medium">
        Start Workout
      </button>
    </div>
  );
}

export default function WorkoutList({ plan }: WorkoutListProps) {
  const [workouts, setWorkouts] = useState(plan.days || []);

  const handleWorkoutNameUpdate = (newName: string, index: number) => {
    setWorkouts((prev) =>
      prev.map((workout, i) =>
        i === index ? { ...workout, title: newName } : workout
      )
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Your Workouts</h2>
        <div className="text-sm text-gray-300">
          {plan.summary?.daysPerWeek || workouts.length} workouts per week
        </div>
      </div>

      {/* Workout Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {workouts.map((workout, index) => (
          <WorkoutCard
            key={index}
            workout={workout}
            index={index}
            onNameUpdate={handleWorkoutNameUpdate}
          />
        ))}
      </div>
    </section>
  );
}
