import React, { useState } from 'react';

export default function TorneosBoceto() {
  const [juegoSeleccionado, setJuegoSeleccionado] = useState('Valorant');
  const [vistaActiva, setVistaActiva] = useState('brackets'); // 'torneos' o 'brackets'

  // Datos simulados de torneos basados en la documentación
  const torneos = [
    { id: 1, nombre: 'Open Cup #4', juego: 'Valorant', formato: 'Eliminación Simple', estado: 'En curso', rangoReq: 'Platino - Immortal' },
    { id: 2, nombre: 'CS2 Pro Series', juego: 'Counter-Strike', formato: 'Eliminación Simple', estado: 'Inscripciones abiertas', rangoReq: 'Global Elite / LEM' },
    { id: 3, nombre: 'LoL Summoners Clash', juego: 'League of Legends', formato: 'Doble Eliminación', estado: 'Próximamente', rangoReq: 'Oro - Diamante' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 1. BARRA DE NAVEGACIÓN */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-black tracking-wider text-indigo-400">ESPORTS ARENA</span>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">Proyecto TUP</span>
        </div>
        <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-300">
          <button onClick={() => setVistaActiva('torneos')} className={`hover:text-indigo-400 transition ${vistaActiva === 'torneos' ? 'text-indigo-400 font-bold' : ''}`}>Torneos</button>
          <button onClick={() => setVistaActiva('brackets')} className={`hover:text-indigo-400 transition ${vistaActiva === 'brackets' ? 'text-indigo-400 font-bold' : ''}`}>Brackets (Llaves)</button>
          <button className="hover:text-indigo-400 transition">Equipos</button>
          <button className="hover:text-indigo-400 transition">Rankings</button>
          <button className="hover:text-indigo-400 transition">Recompensas (Pts)</button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-md font-semibold">
            🏆 1,450 Pts
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm">
            AE
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* VISTA 1: LISTADO DE TORNEOS */}
        {vistaActiva === 'torneos' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold">Torneos Disponibles</h1>
                <p className="text-sm text-slate-400">Inscribite de forma individual o con tu equipo validando tus rangos.</p>
              </div>
              {/* Filtros de Videojuegos */}
              <div className="flex space-x-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                {['Valorant', 'Counter-Strike', 'League of Legends'].map((juego) => (
                  <button
                    key={juego}
                    onClick={() => setJuegoSeleccionado(juego)}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${juegoSeleccionado === juego ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {juego}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Torneos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {torneos.map((t) => (
                <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/50 transition">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-indigo-300">{t.juego}</span>
                      <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">{t.estado}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">{t.nombre}</h3>
                    <p className="text-xs text-slate-400 mb-4">Formato: {t.formato}</p>
                    <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800/60 mb-6">
                      <span className="text-slate-500 block mb-0.5">Requisito de Rango:</span>
                      {t.rangoReq}
                    </div>
                  </div>
                  <button 
                    onClick={() => setVistaActiva('brackets')}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 rounded-lg transition shadow-lg shadow-indigo-600/20"
                  >
                    Ver Brackets / Detalles
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 2: BRACKETS / LLAVES AUTOMÁTICAS (Núcleo del Torneo) */}
        {vistaActiva === 'brackets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setVistaActiva('torneos')} className="text-xs text-indigo-400 hover:underline">← Volver a torneos</button>
                  <span className="text-slate-600">/</span>
                  <span className="text-xs text-slate-400">Valorant Open Cup #4</span>
                </div>
                <h1 className="text-2xl font-bold mt-1">Brackets del Torneo (Llaves Automáticas)</h1>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-indigo-300">
                Moderador: <span className="text-white font-semibold">Admin_Agustin</span>
              </div>
            </div>

            {/* Contenedor del Bracket Estilo Árbol */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 overflow-x-auto">
              <div className="flex space-x-12 min-w-[800px] justify-between items-center">
                
                {/* Cuartos de Final */}
                <div className="space-y-6 flex-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Cuartos de Final</h4>
                  
                  {/* Partido 1 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow">
                    <div className="flex justify-between items-center text-sm py-1 border-b border-slate-800">
                      <span className="font-medium text-slate-200">KRÜ Esports</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold">2</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1 text-slate-400">
                      <span>Leviatán</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold">0</span>
                    </div>
                  </div>

                  {/* Partido 2 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow">
                    <div className="flex justify-between items-center text-sm py-1 border-b border-slate-800">
                      <span className="font-medium text-slate-400">Furia Esports</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold">1</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1 text-slate-200">
                      <span className="font-semibold text-indigo-400">LOUD</span>
                      <span className="bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded text-xs font-bold border border-indigo-500/30">2</span>
                    </div>
                  </div>
                </div>

                {/* Semifinales */}
                <div className="space-y-12 flex-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Semifinales</h4>
                  
                  <div className="bg-slate-900 border border-indigo-500/40 rounded-lg p-3 shadow-lg shadow-indigo-950">
                    <div className="flex justify-between items-center text-sm py-1 border-b border-slate-800">
                      <span className="font-semibold text-indigo-400">KRÜ Esports</span>
                      <span className="bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded text-xs font-bold border border-indigo-500/30">2</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1 text-slate-400">
                      <span>LOUD</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold">1</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center">
                      <span className="text-[10px] text-emerald-400 font-medium">● Finalizado por Moderador</span>
                    </div>
                  </div>
                </div>

                {/* Gran Final */}
                <div className="space-y-6 flex-1">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">🏆 Gran Final</h4>
                  
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-amber-500/40 rounded-lg p-4 shadow-xl">
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-800">
                      <span className="font-bold text-amber-300">KRÜ Esports</span>
                      <span className="text-xs text-slate-500">Pendiente</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5 text-slate-400">
                      <span>Ganador Semi 2</span>
                      <span className="text-xs text-slate-500">Pendiente</span>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-2">Panel de Moderación:</span>
                      <button className="w-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-1.5 rounded transition text-indigo-300 border border-slate-700">
                        Registrar Resultados / Avanzar
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}