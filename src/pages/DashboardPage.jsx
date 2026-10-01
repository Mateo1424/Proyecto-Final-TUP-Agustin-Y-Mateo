import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
  const [username, setUsername] = useState('Usuario');

  useEffect(() => {
    // Recuperamos el nombre del usuario logueado desde el localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Extraemos la primera letra para el avatar dinámico
  const userInitial = username ? username.charAt(0).toUpperCase() : 'U';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Cabecera del Dashboard */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161b22] p-6 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Buenas noches, {username}</h1>
          <p className="text-gray-400 text-sm mt-1">Tu próxima victoria empieza aquí.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#0d1117] px-4 py-2 rounded-lg border border-gray-800 flex items-center gap-2">
            <span className="text-purple-400 font-mono font-semibold">2,840 RP</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white uppercase">
            {userInitial}
          </div>
        </div>
      </header>

      {/* Contenido Principal en Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Principal Izquierda (Torneo Destacado y Actividad) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Torneo Destacado */}
          <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-purple-500 pointer-events-none">
              ARENA
            </div>
            <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold bg-purple-950/50 px-3 py-1 rounded-full border border-purple-800/50">
              Destacado
            </span>
            <h2 className="text-xl font-bold text-white mt-4">Nexus Masters: Circuito Nocturno</h2>
            <p className="text-gray-400 text-sm mt-2">
              Compite en el circuito nocturno de divisiones y escala puestos en el ranking de la comunidad.
            </p>
            <button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2.5 rounded-lg transition text-sm">
              Ver Detalles del Torneo
            </button>
          </section>

          {/* Mis Torneos Activos */}
          <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Mis Torneos Activos</h3>
            <div className="space-y-3">
              {/* Ejemplo de item de torneo */}
              <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-800/80 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-white text-sm">Copa de Invocador #24</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Reg. 01/02 • En Play-offs</p>
                </div>
                <span className="text-xs bg-emerald-950/80 text-emerald-400 px-2.5 py-1 rounded border border-emerald-800/50">
                  Activo
                </span>
              </div>
            </div>
          </section>

        </div>

        {/* Columna Secundaria Derecha (Estadísticas / Accesos Rápidos) */}
        <div className="space-y-6">
          <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Resumen Rápido</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-800/60">
                <span className="text-gray-400 text-sm">Escuadra Competitiva</span>
                <span className="text-white text-sm font-medium">Void Runners</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-800/60">
                <span className="text-gray-400 text-sm">Partidos Jugados</span>
                <span className="text-white text-sm font-medium">144</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Winrate Global</span>
                <span className="text-purple-400 text-sm font-semibold">71%</span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;