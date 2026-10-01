import React, { useState, useEffect } from 'react';

const ProfilePage = () => {
  const [username, setUsername] = useState('Usuario');
  const [joinDate, setJoinDate] = useState('Octubre 2026'); // O lo puedes extraer si guardas la fecha

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const userInitial = username ? username.charAt(0).toUpperCase() : 'U';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Cabecera del Perfil */}
      <header className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 font-black text-8xl text-purple-500 pointer-events-none">
          PERFIL
        </div>

        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center font-black text-4xl text-white shadow-lg shadow-purple-900/40 uppercase border-2 border-purple-400">
          {userInitial}
        </div>

        {/* Información Principal */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-wide">{username}</h1>
            <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/50 w-fit mx-auto md:mx-0">
              Competidor Verificado
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Miembro desde <span className="text-gray-200 font-medium">{joinDate}</span>
          </p>
        </div>

        {/* Estadísticas rápidas de cabecera */}
        <div className="flex gap-4 border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around">
          <div className="text-center">
            <span className="block text-2xl font-bold text-purple-400">144</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Partidas</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-emerald-400">71%</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Winrate</span>
          </div>
        </div>
      </header>

      {/* Grid de Secciones del Perfil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Juegos y Disciplinas */}
        <div className="space-y-6">
          <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Juegos Principales</h3>
            <div className="space-y-3">
              <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white text-sm">Valorant</h4>
                  <p className="text-xs text-purple-400 mt-0.5">Rango: Ascendant III</p>
                </div>
                <span className="text-xs bg-purple-950/60 text-purple-300 px-2.5 py-1 rounded border border-purple-800/40">
                  Principal
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Historial de Torneos y Partidas */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Historial de Torneos</h3>
            
            <div className="space-y-3">
              {/* Item de Torneo 1 */}
              <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="font-medium text-white text-sm">Nexus Masters: Circuito Nocturno</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Fase de Play-offs • Valorant</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-purple-950/80 text-purple-400 px-2.5 py-1 rounded border border-purple-800/50">
                    Top 8
                  </span>
                </div>
              </div>

              {/* Item de Torneo 2 */}
              <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="font-medium text-white text-sm">Copa de Invocador #24</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Fase de Grupos • Valorant</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-blue-950/80 text-blue-400 px-2.5 py-1 rounded border border-blue-800/50">
                    Completado
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;