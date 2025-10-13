import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-lg">
        <h1 className="text-2xl font-semibold text-black mb-6 text-center">
          Mis Entrenamientos
        </h1>
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-black mb-4">Entrenamientos Recientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-black">Full Body A</h3>
                <p className="text-sm text-gray-600 mt-1">45 minutos • Hoy</p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Completado
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-black">Upper Body</h3>
                <p className="text-sm text-gray-600 mt-1">40 minutos • Ayer</p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Programado
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-black mb-4">Próximos Entrenamientos</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white rounded-lg p-4 border">
                <div>
                  <h3 className="font-medium text-black">Lower Body</h3>
                  <p className="text-sm text-gray-600">Mañana • 50 minutos</p>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Iniciar
                </button>
              </div>
              
              <div className="flex justify-between items-center bg-white rounded-lg p-4 border">
                <div>
                  <h3 className="font-medium text-black">Full Body B</h3>
                  <p className="text-sm text-gray-600">En 2 días • 45 minutos</p>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}