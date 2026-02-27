"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

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

interface WorkoutPlanData {
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

interface PlanSummary {
  goal?: string;
  daysPerWeek?: number;
  minutes?: number;
  split?: string;
  description?: string;
}

interface WorkoutPlan {
  id: string;
  summary: PlanSummary;
  days: WorkoutPlanData;
  schedule: number[];
  weeks: number;
  createdAt: Date;
}

interface WorkoutDetailsClientProps {
  plan: WorkoutPlan;
  selectedDay: number;
}

// Day Header Component
function DayHeader({
  session,
  isOpen,
  onToggle,
  completionStatus,
}: {
  session: WorkoutSession;
  isOpen: boolean;
  onToggle: () => void;
  completionStatus: "red" | "yellow" | "green";
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
        return "bg-gray-400";
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return `Day ${dayOfWeek}`;
  };

  return (
    <button
      onClick={onToggle}
      className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
    >
      <div className="flex items-center space-x-4">
        <div
          className={`w-12 h-12 ${getStatusColor()} rounded-full flex items-center justify-center`}
        >
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-black">
            {getDayName(session.dayOfWeek)}
          </h3>
          <p className="text-gray-600 text-sm">{session.title}</p>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-sm text-gray-500">
              {session.items.length} exercises
            </span>
            <span className="text-sm text-gray-500">
              ~{session.estMinutes} min
            </span>
          </div>
        </div>
      </div>

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
  );
}

// Exercise Item Component
function ExerciseItem({
  exercise,
  exerciseIndex,
  sessionIndex,
  isCompleted,
  onToggle,
  onVideoClick,
  onSubstitute,
  exerciseSubstitutions,
}: {
  exercise: Exercise;
  exerciseIndex: number;
  sessionIndex: number;
  isCompleted: boolean;
  onToggle: () => void;
  onVideoClick: (exerciseName: string, videoUrl: string) => void;
  onSubstitute: (sessionIndex: number, exerciseIndex: number) => void;
  exerciseSubstitutions: Record<string, number>;
}) {
  const formatReps = (reps: number[]) => {
    if (reps.length === 1) return `${reps[0]} reps`;
    return reps.join(" / ") + " reps";
  };

  // Get current exercise (original or substitution)
  const substitutionKey = `${sessionIndex}-${exerciseIndex}`;
  const currentSubstitution = exerciseSubstitutions[substitutionKey] || 0;
  const currentExercise = currentSubstitution === 0 ? exercise : exercise.similarExercises?.[currentSubstitution - 1] || exercise;

  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-black">{currentExercise.name}</h4>
              <p className="text-sm text-gray-600 capitalize">
                {currentExercise.equipment.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-2">
            <span className="text-sm font-medium text-gray-700">
              {exercise.sets} sets × {formatReps(exercise.reps)}
            </span>
          </div>

          {currentExercise.notes && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                {currentExercise.notes}
              </p>
              
              {/* Watch Demo button at bottom of notes */}
              {currentExercise.reference && (
                <div className="mt-2">
                  <button
                    onClick={() => onVideoClick(currentExercise.name, currentExercise.reference!)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                  >
                    Watch Demo
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Watch Demo button when no notes */}
          {!currentExercise.notes && currentExercise.reference && (
            <div className="mb-3">
              <button
                onClick={() => onVideoClick(currentExercise.name, currentExercise.reference!)}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
              >
                Watch Demo
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          {/* Exercise Substitution Icon */}
          {exercise.similarExercises && exercise.similarExercises.length > 0 && (
            <button
              onClick={() => onSubstitute(sessionIndex, exerciseIndex)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              title="Switch exercise"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </button>
          )}

          {/* Completion Checkbox */}
          <button
            onClick={onToggle}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
              isCompleted
                ? "bg-green-500 border-green-500"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            {isCompleted && (
              <svg
                className="w-5 h-5 text-white"
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
  );
}

// Session Component
function WorkoutSessionComponent({
  session,
  sessionIndex,
  isOpen,
  onToggle,
  exerciseCompletion,
  onExerciseToggle,
  onVideoClick,
  onSubstitute,
  exerciseSubstitutions,
}: {
  session: WorkoutSession;
  sessionIndex: number;
  isOpen: boolean;
  onToggle: () => void;
  exerciseCompletion: Record<string, boolean>;
  onExerciseToggle: (sessionIndex: number, exerciseIndex: number) => void;
  onVideoClick: (exerciseName: string, videoUrl: string) => void;
  onSubstitute: (sessionIndex: number, exerciseIndex: number) => void;
  exerciseSubstitutions: Record<string, number>;
}) {
  const getCompletionStatus = () => {
    if (!session.items || session.items.length === 0) return "red";

    const completedCount = session.items.filter(
      (_, exerciseIndex) =>
        exerciseCompletion[`${sessionIndex}-${exerciseIndex}`]
    ).length;

    if (completedCount === 0) return "red";
    if (completedCount === session.items.length) return "green";
    return "yellow";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <DayHeader
        session={session}
        isOpen={isOpen}
        onToggle={onToggle}
        completionStatus={getCompletionStatus()}
      />

      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="space-y-4 mt-4">
            {session.items.map((exercise, exerciseIndex) => (
              <ExerciseItem
                key={exerciseIndex}
                exercise={exercise}
                exerciseIndex={exerciseIndex}
                sessionIndex={sessionIndex}
                isCompleted={
                  exerciseCompletion[`${sessionIndex}-${exerciseIndex}`] ||
                  false
                }
                onToggle={() => onExerciseToggle(sessionIndex, exerciseIndex)}
                onVideoClick={onVideoClick}
                onSubstitute={onSubstitute}
                exerciseSubstitutions={exerciseSubstitutions}
              />
            ))}

            {(!session.items || session.items.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No exercises found for this session</p>
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
}: WorkoutDetailsClientProps) {
  const router = useRouter();
  const [openSessions, setOpenSessions] = useState<Set<number>>(
    new Set([selectedDay])
  );
  const [exerciseCompletion, setExerciseCompletion] = useState<
    Record<string, boolean>
  >({});
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    exerciseName: string;
    videoUrl: string;
  }>({ isOpen: false, exerciseName: "", videoUrl: "" });
  const [exerciseSubstitutions, setExerciseSubstitutions] = useState<
    Record<string, number>
  >({});
  const [celebrationModal, setCelebrationModal] = useState<{
    isOpen: boolean;
    type: "daily" | "all";
    sessionTitle?: string;
  }>({ isOpen: false, type: "daily" });

  // Load saved exercise completion from localStorage on component mount
  React.useEffect(() => {
    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem(`workout_progress_${plan.id}`);
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setExerciseCompletion(progress);
      } catch (error) {
        console.error("Error loading saved progress:", error);
      }
    }

    // Load saved exercise substitutions
    const savedSubstitutions = localStorage.getItem(`exercise_substitutions_${plan.id}`);
    if (savedSubstitutions) {
      try {
        const substitutions = JSON.parse(savedSubstitutions);
        setExerciseSubstitutions(substitutions);
      } catch (error) {
        console.error("Error loading saved substitutions:", error);
      }
    }
  }, [plan]);

  // Save exercise completion to localStorage whenever it changes
  React.useEffect(() => {
    if (Object.keys(exerciseCompletion).length > 0) {
      localStorage.setItem(`workout_progress_${plan.id}`, JSON.stringify(exerciseCompletion));
    }
  }, [exerciseCompletion, plan.id]);

  // Save exercise substitutions to localStorage whenever they change
  React.useEffect(() => {
    if (Object.keys(exerciseSubstitutions).length > 0) {
      localStorage.setItem(`exercise_substitutions_${plan.id}`, JSON.stringify(exerciseSubstitutions));
    }
  }, [exerciseSubstitutions, plan.id]);

  const toggleExerciseCompletion = (
    sessionIndex: number,
    exerciseIndex: number
  ) => {
    const key = `${sessionIndex}-${exerciseIndex}`;
    const newCompletion = {
      ...exerciseCompletion,
      [key]: !exerciseCompletion[key],
    };
    
    setExerciseCompletion(newCompletion);

    // Check if this session is now completed
    if (!exerciseCompletion[key]) { // Only check when marking as complete
      const session = plan.days.sessions[sessionIndex];
      if (session && session.items) {
        const sessionCompletedCount = session.items.filter(
          (_, idx) => newCompletion[`${sessionIndex}-${idx}`]
        ).length;
        
        // If all exercises in this session are now completed
        if (sessionCompletedCount === session.items.length) {
          setCelebrationModal({
            isOpen: true,
            type: "daily",
            sessionTitle: session.title
          });
          
          // Check if all sessions are now completed
          setTimeout(() => {
            const allSessionsCompleted = plan.days.sessions.every((sess, sessIdx) =>
              sess.items.every((_, exIdx) => newCompletion[`${sessIdx}-${exIdx}`])
            );
            
            if (allSessionsCompleted) {
              setCelebrationModal({
                isOpen: true,
                type: "all"
              });
            }
          }, 2000); // Show daily completion first, then check for all
        }
      }
    }
  };

  const toggleSession = (sessionIndex: number) => {
    const newOpenSessions = new Set(openSessions);
    if (newOpenSessions.has(sessionIndex)) {
      newOpenSessions.delete(sessionIndex);
    } else {
      newOpenSessions.add(sessionIndex);
    }
    setOpenSessions(newOpenSessions);
  };

  const openVideoModal = (exerciseName: string, videoUrl: string) => {
    setVideoModal({
      isOpen: true,
      exerciseName,
      videoUrl
    });
  };

  const closeVideoModal = () => {
    setVideoModal({
      isOpen: false,
      exerciseName: "",
      videoUrl: ""
    });
  };

  const closeCelebrationModal = () => {
    setCelebrationModal({
      isOpen: false,
      type: "daily"
    });
  };

  const substituteExercise = (sessionIndex: number, exerciseIndex: number) => {
    const key = `${sessionIndex}-${exerciseIndex}`;
    const currentSubstitution = exerciseSubstitutions[key] || 0;
    
    // Cycle through alternatives (0 = original, 1-3 = alternatives)
    const nextSubstitution = (currentSubstitution + 1) % 4;
    
    setExerciseSubstitutions(prev => ({
      ...prev,
      [key]: nextSubstitution
    }));
  };

  const getGoalDisplay = () => {
    const goal = plan.days?.meta?.goal || plan.summary?.goal || "fitness";
    switch (goal) {
      case "fat_loss":
        return "Fat Loss";
      case "hypertrophy":
        return "Muscle Building";
      case "strength":
        return "Strength Building";
      case "returning":
        return "Return to Training";
      case "general_health":
        return "General Health";
      default:
        return goal;
    }
  };

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}

      {/* Workout Plan Info - Toggle List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Toggle Header */}
          <button
            onClick={() => setIsOverviewOpen(!isOverviewOpen)}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              {/* Document Icon */}
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Plan Overview
                </h2>
                <p className="text-sm text-gray-500">
                  {isOverviewOpen ? "Hide details" : "View plan details"}
                </p>
              </div>
            </div>

            {/* Toggle Arrow */}
            <div
              className={`transform transition-transform duration-200 ${
                isOverviewOpen ? "rotate-180" : ""
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
          {isOverviewOpen && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium text-black mb-2">Description</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {plan.days.description}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center bg-gray-50 rounded-xl p-3">
                    <div className="text-xl font-bold text-black">
                      {plan.days.sessions.length}
                    </div>
                    <div className="text-xs text-gray-500">Sessions</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-xl p-3">
                    <div className="text-xl font-bold text-black">
                      ~{plan.days.constraints.minutesPerSession}
                    </div>
                    <div className="text-xs text-gray-500">Minutes</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-xl p-3">
                    <div className="text-xl font-bold text-black">
                      {String(plan.days.meta.location).toLowerCase().includes("park")
                        ? "Park"
                        : String(plan.days.meta.location).toLowerCase().includes("gym")
                        ? "Gym"
                        : "Home"}
                    </div>
                    <div className="text-xs text-gray-500">Location</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-xl p-3">
                    <div className="text-xl font-bold text-black">
                      {plan.days.meta.equipment.length}
                    </div>
                    <div className="text-xs text-gray-500">Equipment Types</div>
                  </div>
                </div>

                {/* Injury Notes */}
                {plan.days.constraints.injuryNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-4 h-4 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-1">
                          Important Note
                        </h4>
                        <p className="text-sm text-yellow-700">
                          {plan.days.constraints.injuryNotes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Workout Sessions */}
        <div className="space-y-4">
          {plan.days.sessions.map((session, index) => (
            <WorkoutSessionComponent
              key={index}
              session={session}
              sessionIndex={index}
              isOpen={openSessions.has(index)}
              onToggle={() => toggleSession(index)}
              exerciseCompletion={exerciseCompletion}
              onExerciseToggle={toggleExerciseCompletion}
              onVideoClick={openVideoModal}
              onSubstitute={substituteExercise}
              exerciseSubstitutions={exerciseSubstitutions}
            />
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black">
                How to perform this exercise?
              </h2>
              <button
                onClick={closeVideoModal}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-black mb-4">{videoModal.exerciseName}</h3>
              
              {/* Video Embed */}
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                {videoModal.videoUrl ? (
                  <iframe
                    src={videoModal.videoUrl.replace('watch?v=', 'embed/')}
                    title={`${videoModal.exerciseName} demonstration`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Video not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {celebrationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
            {/* Modal Content */}
            <div className="p-8 text-center">
              {celebrationModal.type === "daily" ? (
                <>
                  {/* Daily Completion */}
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">Congratulations!</h2>
                  <p className="text-gray-600 mb-6">
                    You have completed your workout for the day
                    {celebrationModal.sessionTitle && `: ${celebrationModal.sessionTitle}`}
                  </p>
                  <button
                    onClick={closeCelebrationModal}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    Keep Moving
                  </button>
                </>
              ) : (
                <>
                  {/* All Sessions Completion */}
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">Amazing!</h2>
                  <p className="text-gray-600 mb-6">
                    You have completed all your workout sessions! You're crushing your fitness goals!
                  </p>
                  <button
                    onClick={closeCelebrationModal}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all"
                  >
                    Keep Moving
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
