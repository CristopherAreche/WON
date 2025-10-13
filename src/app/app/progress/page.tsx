import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-lg">
        <h1 className="text-2xl font-semibold text-black mb-6 text-center">
          Mi Progreso
        </h1>
        
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h3 className="text-2xl font-bold text-black">28</h3>
              <p className="text-sm text-gray-600">Entrenamientos</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h3 className="text-2xl font-bold text-black">12</h3>
              <p className="text-sm text-gray-600">Semanas</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h3 className="text-2xl font-bold text-black">5.2kg</h3>
              <p className="text-sm text-gray-600">Peso Perdido</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h3 className="text-2xl font-bold text-black">85%</h3>
              <p className="text-sm text-gray-600">Consistencia</p>
            </div>
          </div>

          {/* Weight Progress */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-black mb-4">Progreso de Peso</h2>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Peso Inicial: 80kg</span>
                <span className="text-sm text-gray-600">Peso Actual: 74.8kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full w-2/3"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Meta: 70kg</p>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-black mb-4">Actividad Semanal</h2>
            <div className="grid grid-cols-7 gap-2">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-gray-600 mb-2">{day}</p>
                  <div className={`w-full h-12 rounded ${
                    index < 5 ? 'bg-green-200' : 'bg-gray-200'
                  }`}></div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">5 de 7 días completados esta semana</p>
          </div>

          {/* Personal Records */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-black mb-4">Records Personales</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white rounded-lg p-3 border">
                <div>
                  <h3 className="font-medium text-black">Push-ups</h3>
                  <p className="text-sm text-gray-600">Máximo consecutivo</p>
                </div>
                <span className="text-xl font-bold text-green-600">45</span>
              </div>
              
              <div className="flex justify-between items-center bg-white rounded-lg p-3 border">
                <div>
                  <h3 className="font-medium text-black">Plank</h3>
                  <p className="text-sm text-gray-600">Tiempo máximo</p>
                </div>
                <span className="text-xl font-bold text-green-600">3:20</span>
              </div>
              
              <div className="flex justify-between items-center bg-white rounded-lg p-3 border">
                <div>
                  <h3 className="font-medium text-black">Squats</h3>
                  <p className="text-sm text-gray-600">Máximo consecutivo</p>
                </div>
                <span className="text-xl font-bold text-green-600">60</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}