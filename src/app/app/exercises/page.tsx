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
          Biblioteca de Ejercicios
        </h1>
        
        <div className="space-y-6">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar ejercicios..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
              <option value="">Todas las categorías</option>
              <option value="chest">Pecho</option>
              <option value="back">Espalda</option>
              <option value="legs">Piernas</option>
              <option value="shoulders">Hombros</option>
              <option value="arms">Brazos</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Push-ups</h3>
              <p className="text-sm text-gray-600 mb-3">Ejercicio de peso corporal para pecho y brazos</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Pecho
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  Ver más
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Squats</h3>
              <p className="text-sm text-gray-600 mb-3">Ejercicio fundamental para piernas y glúteos</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Piernas
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  Ver más
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Pull-ups</h3>
              <p className="text-sm text-gray-600 mb-3">Ejercicio de peso corporal para espalda y bíceps</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Espalda
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  Ver más
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Dumbbell Press</h3>
              <p className="text-sm text-gray-600 mb-3">Ejercicio con mancuernas para hombros</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Hombros
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  Ver más
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Bicep Curls</h3>
              <p className="text-sm text-gray-600 mb-3">Ejercicio aislado para bíceps</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  Brazos
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  Ver más
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-black mb-2">Deadlifts</h3>
              <p className="text-sm text-gray-600 mb-3">Ejercicio compuesto para cuerpo completo</p>
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  Completo
                </span>
                <button className="text-black hover:bg-gray-200 px-3 py-1 rounded transition-colors">
                  Ver más
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}