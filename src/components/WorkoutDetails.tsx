'use client';

interface WorkoutDetailsProps {
  workoutName: string;
  workoutGoal: string;
}

export default function WorkoutDetails({ workoutName, workoutGoal }: WorkoutDetailsProps) {
  
  // Generate workout description based on goal
  const getWorkoutDescription = (goal: string) => {
    const goalLower = goal.toLowerCase();
    
    if (goalLower.includes('strength') || goalLower.includes('muscle')) {
      return {
        description: "Build lean muscle mass and increase your overall strength with this comprehensive resistance training program.",
        benefits: "Increases metabolism, improves bone density, and enhances functional movement patterns for daily activities."
      };
    } else if (goalLower.includes('weight') || goalLower.includes('fat') || goalLower.includes('lose')) {
      return {
        description: "Torch calories and accelerate fat loss with this high-intensity workout designed for maximum results.",
        benefits: "Boosts metabolism for hours after exercise, improves cardiovascular health, and helps achieve sustainable weight management."
      };
    } else if (goalLower.includes('cardio') || goalLower.includes('endurance')) {
      return {
        description: "Enhance your cardiovascular fitness and build endurance with this dynamic conditioning program.",
        benefits: "Strengthens heart and lungs, increases stamina, and improves overall energy levels throughout the day."
      };
    } else if (goalLower.includes('tone') || goalLower.includes('definition')) {
      return {
        description: "Sculpt and define your physique with this balanced approach combining strength and conditioning.",
        benefits: "Creates lean muscle definition, improves body composition, and enhances overall physical appearance."
      };
    } else {
      return {
        description: "A well-rounded fitness program designed to improve your overall health and wellness.",
        benefits: "Enhances strength, endurance, and flexibility while promoting better sleep and stress management."
      };
    }
  };

  const workoutInfo = getWorkoutDescription(workoutGoal);

  return (
    <div className="flex items-start justify-between bg-gray-50 rounded-3xl p-6 mb-6">
      {/* Left Icon */}
      <div className="flex items-start">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4 flex-shrink-0">
          <svg 
            className="w-6 h-6 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M13 10V3L4 14h7v7l9-11h-7z" 
            />
          </svg>
        </div>
        
        {/* Workout Details */}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-black mb-2">
            {workoutName}
          </h1>
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
            {workoutInfo.description}
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-medium">Why it's perfect for you:</span> {workoutInfo.benefits}
          </p>
        </div>
      </div>
    </div>
  );
}