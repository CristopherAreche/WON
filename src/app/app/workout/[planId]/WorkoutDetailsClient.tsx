"use client";

import { useState } from "react";
import WorkoutDetails from "@/components/WorkoutDetails";

interface Exercise {
  exerciseId?: string;
  name?: string;
  sets?: number;
  reps?: string;
  rest?: string;
  notes?: string;
}

interface PlanDay {
  id?: string;
  title?: string;
  focus?: string;
  estimatedDuration?: number;
  blocks?: Exercise[];
}

interface WorkoutPlan {
  id: string;
  summary: {
    daysPerWeek: number;
    minutes: number;
    goal: string;
  };
  days: PlanDay[];
  schedule: string[];
  weeks: number;
  createdAt: Date;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface WorkoutDetailsClientProps {
  plan: WorkoutPlan;
  selectedDay: number;
  user: User;
}

// Toggle component for individual workout days
function WorkoutDayToggle({
  day,
  isOpen,
  onToggle,
  dayNumber,
  completionStatus,
  exerciseCompletion,
  onExerciseToggle,
}: {
  day: PlanDay;
  isOpen: boolean;
  onToggle: () => void;
  dayNumber: number;
  completionStatus: "red" | "yellow" | "green";
  exerciseCompletion: Record<string, boolean>;
  onExerciseToggle: (exerciseIndex: number) => void;
}) {
  const getStatusColor = () => {
    switch (completionStatus) {
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-red-500";
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 ${getStatusColor()} rounded-full flex items-center justify-center`}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-black">
                DAY {dayNumber + 1}
              </h3>
              {day.focus && (
                <p className="text-gray-600 text-sm">{day.focus}</p>
              )}
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-500">
                  {day.blocks?.length || 0} exercises
                </span>
                {day.estimatedDuration && (
                  <span className="text-sm text-gray-500">
                    {day.estimatedDuration} min
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Icon */}
        <div
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="space-y-4 mt-4">
            {day.blocks?.map((exercise, exerciseIndex) => (
              <div
                key={exerciseIndex}
                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-black">
                          {exercise.name ||
                            exercise.exerciseId ||
                            `Exercise ${exerciseIndex + 1}`}
                        </span>
                        {exercise.sets && exercise.reps && (
                          <span className="text-sm text-gray-600 ml-2">
                            {exercise.sets} x {exercise.reps}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onExerciseToggle(exerciseIndex)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          exerciseCompletion[`${dayNumber}-${exerciseIndex}`]
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {exerciseCompletion[
                          `${dayNumber}-${exerciseIndex}`
                        ] && (
                          <svg
                            className="w-4 h-4 text-white"
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
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(!day.blocks || day.blocks.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No exercises found for this day</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkoutDetailsClient({
  plan,
  selectedDay,
}: Omit<WorkoutDetailsClientProps, "user">) {
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([selectedDay]));
  const [exerciseCompletion, setExerciseCompletion] = useState<
    Record<string, boolean>
  >({});

  const toggleExerciseCompletion = (
    dayIndex: number,
    exerciseIndex: number
  ) => {
    const key = `${dayIndex}-${exerciseIndex}`;
    setExerciseCompletion((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getDayCompletionStatus = (
    dayIndex: number,
    exercises: Exercise[] = []
  ) => {
    if (!exercises || exercises.length === 0) return "red";

    const completedCount = exercises.filter(
      (_, exerciseIndex) => exerciseCompletion[`${dayIndex}-${exerciseIndex}`]
    ).length;

    if (completedCount === 0) return "red";
    if (completedCount === exercises.length) return "green";
    return "yellow";
  };

  const toggleDay = (dayIndex: number) => {
    const newOpenDays = new Set(openDays);
    if (newOpenDays.has(dayIndex)) {
      newOpenDays.delete(dayIndex);
    } else {
      newOpenDays.add(dayIndex);
    }
    setOpenDays(newOpenDays);
  };

  return (
    <div className="bg-black p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Workout Details Header */}
        <div className="mb-6">
          <WorkoutDetails
            workoutName={plan.summary.goal || "Your Workout Plan"}
            workoutGoal={plan.summary.goal || "fitness"}
          />
        </div>

        {/* Workout Days List */}
        <div className="space-y-4">
          {plan.days.map((day, index) => (
            <WorkoutDayToggle
              key={index}
              day={day}
              dayNumber={index}
              isOpen={openDays.has(index)}
              onToggle={() => toggleDay(index)}
              completionStatus={getDayCompletionStatus(index, day.blocks)}
              exerciseCompletion={exerciseCompletion}
              onExerciseToggle={(exerciseIndex) =>
                toggleExerciseCompletion(index, exerciseIndex)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
