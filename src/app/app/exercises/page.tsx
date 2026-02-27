import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ExercisesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-lg">
        <h1 className="text-2xl font-semibold text-black mb-6 text-center">
          Exercise Library
        </h1>
        
        <div className="space-y-6">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search exercises..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
              <option value="">All categories</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="legs">Legs</option>
              <option value="shoulders">Shoulders</option>
              <option value="arms">Arms</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Push-ups</h3>
              <p className="text-sm text-gray-600 mb-3">Bodyweight movement for chest and arms</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Chest
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  View More
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Squats</h3>
              <p className="text-sm text-gray-600 mb-3">Foundational movement for legs and glutes</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Legs
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  View More
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Pull-ups</h3>
              <p className="text-sm text-gray-600 mb-3">Bodyweight movement for back and biceps</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Back
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  View More
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Dumbbell Press</h3>
              <p className="text-sm text-gray-600 mb-3">Dumbbell exercise focused on shoulders</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Shoulders
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  View More
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Bicep Curls</h3>
              <p className="text-sm text-gray-600 mb-3">Isolation movement for biceps</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  Arms
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  View More
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Deadlifts</h3>
              <p className="text-sm text-gray-600 mb-3">Compound movement for full-body strength</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  Full Body
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  View More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
