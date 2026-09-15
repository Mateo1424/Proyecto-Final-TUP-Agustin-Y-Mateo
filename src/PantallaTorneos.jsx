import React, { useState } from 'react';

export default function PantallaTorneos() {
  const [juegoSeleccionado, setJuegoSeleccionado] = useState('Valorant');
  const [vistaActiva, setVistaActiva] = useState('torneos'); // 'torneos', 'brackets', 'equipos', 'rankings', 'recompensas'
  const [recompensaSeleccionada, setRecompensaSeleccionada] = useState(null);
  const [puntosUsuario, setPuntosUsuario] = useState(9000);
  const [equipoSeleccionadoParaVer, setEquipoSeleccionadoParaVer] = useState(null);
const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);

  // Datos simulados basados en la documentación
  const torneos = [
    { id: 1, nombre: 'Open Cup #4', juego: 'Valorant', formato: 'Eliminación Simple', estado: 'En curso', rangoReq: 'Platino - Immortal' },
    { id: 2, nombre: 'CS2 Pro Series', juego: 'Counter-Strike', formato: 'Eliminación Simple', estado: 'Inscripciones abiertas', rangoReq: 'Global Elite / LEM' },
    { id: 3, nombre: 'LoL Summoners Clash', juego: 'League of Legends', formato: 'Doble Eliminación', estado: 'Próximamente', rangoReq: 'Oro - Diamante' },
  ];

  const equiposSimulados = [
  { 
    id: 1, 
    nombre: 'KRÜ Esports', 
    juego: 'Valorant', 
    capitan: 'SAADHAK',
    miembros: [
      { alias: 'SAADHAK', nombreCompleto: 'Matias Delipetro', edad: 29, nacionalidad: 'Argentino', rol: 'Player / Capitán' },
      { alias: 'DANTEDEU5', nombreCompleto: 'Jesús Federico Larrosa', edad: 19, nacionalidad: 'Argentino', rol: 'Player' },
      { alias: 'MWZERA', nombreCompleto: 'Leonardo Da Silva Serrati', edad: 25, nacionalidad: 'Brasileño', rol: 'Player' },
      { alias: 'LESS', nombreCompleto: 'Felipe De Loyola Basso', edad: 21, nacionalidad: 'Brasileño', rol: 'Player' },
      { alias: 'HEAT', nombreCompleto: 'Olavo Lemes', edad: 23, nacionalidad: 'Brasileño', rol: 'Player' },
      { alias: 'ZONIK', nombreCompleto: 'Nicolas Carboni', edad: 30, nacionalidad: 'Chileno', rol: 'Head Coach' },
      { alias: 'FADEOUT', nombreCompleto: 'Alexander Brian Argüello', edad: 28, nacionalidad: 'Argentino', rol: 'Coach' }
    ]
  },
  { 
    id: 2, 
    nombre: 'Leviatán', 
    juego: 'Valorant', 
    capitan: 'Mateo',
    miembros: [
      {alias: 'kiNgg', nombreCompleto: 'Francisco Alberto Arabena', edad: 24, nacionalidad: 'Chileno', rol: 'Player / Capitán'},
      {alias: 'Sato', nombreCompleto: 'Eduardo Kenzo Nagahama Sato', edad: 19, nacionalidad: 'Brasileño', rol: 'Player'},
      {alias: 'blowz', nombreCompleto: 'Guilherme Oliveira', edad: 18, nacionalidad: 'Brasileño', rol: 'Player'},
      {alias: 'Neon', nombreCompleto: 'Bruno Rodriguez', edad: 18, nacionalidad: 'Argentino', rol: 'Player'},
      {alias: 'spikeziN', nombreCompleto: 'Rodrigo Lombardi', edad: 19, nacionalidad: 'Brasileño', rol: 'Player'},
      {alias: 'Onur', nombreCompleto: 'Rodrigo Milton Dalmagro', edad: 39, nacionalidad: 'Argentino', rol: 'Head Coach'},
      {alias: 'Jhein', nombreCompleto: 'Cristian Camaño', edad: 32, nacionalidad: 'Argentino', rol: 'Coach'},
    ] // Podés agregar los demás equipos después si querés
    
  },
  { 
    id: 3, 
    nombre: 'LOUD', 
    juego: 'Counter-Strike', 
    capitan: 'ScreaM',
    miembros: [
      {alias: 'zmb', nombreCompleto: 'Leonardo Toledo', edad: 27, nacionalidad: 'Brasileño', rol: 'Player / capitán'},
      {alias: 'Alisson', nombreCompleto: 'Alisson Farias', edad: 23, nacionalidad: 'Brasileño', rol: 'Player'},
      {alias: 'Leomonster', nombreCompleto: 'Leonardo Enrique de Souza', edad: 23, nacionalidad: 'Brasileño', rol: 'Player'},
      {alias: 'divine', nombreCompleto: 'Gustavo Santicioli Altapini', edad: 21, nacionalidad: 'Brasileño', rol: 'Player'},
      {alias: 'happ', nombreCompleto: 'Guilherme Bento', edad: 24, nacionalidad: 'Brasileño', rol: 'Player'},
      {alias: 'disturbed', nombreCompleto: 'Pablo Fernandes', edad: 32, nacionalidad: 'Brasileño', rol: 'Head Coach'},
      {alias: 'reg1no', nombreCompleto: 'Regino Trinade', edad: 26, nacionalidad: 'Brasileño', rol: 'Coach'},
    ]
  },
];

  const rankingJugadores = [
    { puesto: 1, nombre: 'Agustin_99', juego: 'Valorant', puntos: 1450 },
    { puesto: 2, nombre: 'MateoEsc', juego: 'Valorant', puntos: 1320 },
    { puesto: 3, nombre: 'ZekkenFan', juego: 'League of Legends', puntos: 1100 },
  ];

  const recompensasCatalogo = [
    { id: 1, titulo: 'Skin de Arma Exclusiva', costo: 1000, desc: 'Canjeá puntos por skins para CS2 o Valorant.' },
    { id: 2, titulo: 'Rol VIP en Discord', costo: 500, desc: 'Acceso a canales exclusivos y sorteos de la plataforma.' },
    { id: 3, titulo: 'Pase de Batalla', costo: 2500, desc: 'Participá por un battle pass para tu juego favorito.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 1. BARRA DE NAVEGACIÓN FUNCIONAL */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setVistaActiva('torneos')}>
          <span className="text-xl font-black tracking-wider text-indigo-400">ESPORTS ARENA</span>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">Proyecto TUP</span>
        </div>
        
        <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-300">
          <button onClick={() => setVistaActiva('torneos')} className={`hover:text-indigo-400 transition ${vistaActiva === 'torneos' ? 'text-indigo-400 font-bold' : ''}`}>Torneos</button>
          <button onClick={() => setVistaActiva('brackets')} className={`hover:text-indigo-400 transition ${vistaActiva === 'brackets' ? 'text-indigo-400 font-bold' : ''}`}>Brackets</button>
          <button onClick={() => setVistaActiva('equipos')} className={`hover:text-indigo-400 transition ${vistaActiva === 'equipos' ? 'text-indigo-400 font-bold' : ''}`}>Equipos</button>
          <button onClick={() => setVistaActiva('rankings')} className={`hover:text-indigo-400 transition ${vistaActiva === 'rankings' ? 'text-indigo-400 font-bold' : ''}`}>Rankings</button>
          <button onClick={() => setVistaActiva('recompensas')} className={`hover:text-indigo-400 transition ${vistaActiva === 'recompensas' ? 'text-indigo-400 font-bold' : ''}`}>Recompensas</button>
        </div>

        <div className="flex items-center space-x-4">
          <div onClick={() => setVistaActiva('recompensas')} className="cursor-pointer text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-md font-semibold hover:bg-amber-500/20 transition">
            🏆 {puntosUsuario} pts.
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm">
            AE
          </div>
        </div>
      </nav>

      {/* CONTENIDO DINÁMICO SEGÚN LA NAVEGACIÓN */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* VISTA 1: TORNEOS */}
        {vistaActiva === 'torneos' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold">Torneos Disponibles</h1>
                <p className="text-sm text-slate-400">Inscribite de forma individual o con tu equipo validando tus rangos.</p>
              </div>
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

        {/* VISTA 2: BRACKETS */}
        {vistaActiva === 'brackets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Brackets del Torneo (Llaves Automáticas)</h1>
                <p className="text-sm text-slate-400">Visualización de llaves de eliminación directa[cite: 1].</p>
              </div>
              <button onClick={() => setVistaActiva('torneos')} className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-indigo-300 hover:bg-slate-800">
                ← Volver a Torneos
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 overflow-x-auto">
              <div className="flex space-x-12 min-w-[800px] justify-between items-center">
                <div className="space-y-6 flex-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Cuartos de Final</h4>
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
                </div>

                <div className="space-y-12 flex-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Semifinales</h4>
                  <div className="bg-slate-900 border border-indigo-500/40 rounded-lg p-3 shadow-lg">
                    <div className="flex justify-between items-center text-sm py-1 border-b border-slate-800">
                      <span className="font-semibold text-indigo-400">KRÜ Esports</span>
                      <span className="bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded text-xs font-bold border border-indigo-500/30">2</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1 text-slate-400">
                      <span>LOUD</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold">1</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">🏆 Gran Final</h4>
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-amber-500/40 rounded-lg p-4 shadow-xl">
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-800">
                      <span className="font-bold text-amber-300">KRÜ Esports</span>
                      <span className="text-xs text-emerald-400 font-semibold">Campeón 🥇</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 3: EQUIPOS (Módulo 2 de la documentación) */}
       {vistaActiva === 'equipos' && (
  <div>
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Equipos</h1>
        <p className="text-sm text-slate-400">Creá tu roster, invitá jugadores y asigná roles de titulares y suplentes.</p>
      </div>
      <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow">
        + Crear Nuevo Equipo
      </button>
    </div>

    {/* SI NO HAY NINGÚN EQUIPO SELECCIONADO, MOSTRAMOS LA LISTA GENERAL */}
    {!equipoSeleccionadoParaVer ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {equiposSimulados.map((eq) => (
    <div key={eq.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-indigo-300">{eq.juego}</span>
        <h3 className="text-lg font-bold mt-3 mb-1">{eq.nombre}</h3>
        <p className="text-xs text-slate-400 mb-4">Capitán: {eq.capitan}</p>
        <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded border border-slate-800/60 mb-4">
          Integrantes cargados: <span className="text-indigo-400 font-bold">{eq.miembros ? eq.miembros.length : 0}</span> miembros
        </div>
      </div>
      
      {/* BOTONES SEPARADOS POR ROLES */}
      <div className="space-y-2">
        {/* Botón para cualquier usuario: Ver el equipo y sus jugadores */}
        <button 
          onClick={() => setEquipoSeleccionadoParaVer(eq)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg transition shadow-sm cursor-pointer"
        >
          Ver Equipo / Roster
        </button>

        {/* Botón exclusivo para Moderadores / Capitanes */}
        <button 
          onClick={() => alert("Acceso restringido: Solo para moderadores o capitanes del equipo.")}
          className="w-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-1.5 rounded-lg transition text-slate-400 border border-slate-700 cursor-pointer"
        >
          ⚙️ Administrar Roster (Mod)
        </button>
      </div>
    </div>
  ))}
</div>
    ) : (
      /* SI SE SELECCIONÓ UN EQUIPO, MOSTRAMOS SU DETALLE Y SUS JUGADORES */
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300">{equipoSeleccionadoParaVer.juego}</span>
            <h2 className="text-2xl font-bold mt-2">{equipoSeleccionadoParaVer.nombre}</h2>
            <p className="text-xs text-slate-400 mt-1">Capitán general: {equipoSeleccionadoParaVer.capitan}</p>
          </div>
          <button 
            onClick={() => setEquipoSeleccionadoParaVer(null)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
          >
            ← Volver a Equipos
          </button>
        </div>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Roster de Integrantes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipoSeleccionadoParaVer.miembros && equipoSeleccionadoParaVer.miembros.length > 0 ? (
            equipoSeleccionadoParaVer.miembros.map((jugador, index) => (
              <div 
                key={index} 
                onClick={() => setJugadorSeleccionado(jugador)}
                className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-lg cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-white text-base">{jugador.alias}</span>
                    <span className="text-[10px] bg-slate-900 text-indigo-300 px-2 py-0.5 rounded border border-slate-800">{jugador.rol}</span>
                  </div>
                  <p className="text-xs text-slate-400">{jugador.nombreCompleto}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between text-[11px] text-slate-500">
                  <span>{jugador.edad} años</span>
                  <span>{jugador.nacionalidad}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 col-span-full py-8 text-center">No hay miembros cargados para este equipo todavía.</p>
          )}
        </div>
      </div>
    )}
  </div>
)}

        {/* VISTA 4: RANKINGS (Módulo 5 de la documentación) */}
        {vistaActiva === 'rankings' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Rankings Globales</h1>
              <p className="text-sm text-slate-400">Posiciones de jugadores y equipos basadas en puntos obtenidos en torneos[cite: 1].</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase bg-slate-950/50">
                    <th className="p-4">Puesto</th>
                    <th className="p-4">Usuario / Jugador</th>
                    <th className="p-4">Videojuego</th>
                    <th className="p-4 text-right">Puntos Totales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {rankingJugadores.map((rank) => (
                    <tr key={rank.puesto} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-indigo-400">#{rank.puesto}</td>
                      <td className="p-4 font-semibold text-white">{rank.nombre}</td>
                      <td className="p-4 text-slate-400">{rank.juego}</td>
                      <td className="p-4 text-right font-bold text-amber-400">{rank.puntos} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA 5: RECOMPENSAS (Módulo 7 de la documentación) */}
        {vistaActiva === 'recompensas' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Catálogo de Recompensas</h1>
                <p className="text-sm text-slate-400">Canjeá tus puntos acumulados por participación y victorias[cite: 1].</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-400 font-bold text-sm">
                Saldo Disponible: {puntosUsuario} pts
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recompensasCatalogo.map((rec) => (
  <div key={rec.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
    <div>
      <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
        {rec.costo} Pts
      </span>
      <h3 className="text-lg font-bold mt-3 mb-2">{rec.titulo}</h3>
      <p className="text-xs text-slate-400 mb-6">{rec.desc}</p>
    </div>
    
    {/* ACÁ ESTÁ EL BOTÓN MODIFICADO CON EL onClick */}
    <button 
      onClick={() => setRecompensaSeleccionada(rec)}
      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-lg transition shadow-lg shadow-amber-500/10 cursor-pointer"
    >
      Canjear Recompensa
    </button>
  </div>
))}
            </div>
          </div>
        )}

      </main>
      {recompensaSeleccionada && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-amber-400 mb-2">Confirmar Canje</h3>
            <p className="text-sm text-slate-300 mb-4">
              Estás a punto de canjear: <span className="font-semibold text-white">{recompensaSeleccionada.titulo}</span>
            </p>
            
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 mb-6">
              <p className="font-medium text-slate-300 mb-1">Detalles:</p>
              {recompensaSeleccionada.desc}
              <div className="mt-2 text-amber-400 font-bold">
                Costo: {recompensaSeleccionada.costo} Pts
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
  onClick={() => {
    // 1. Verificamos si al usuario le alcanzan los puntos
    if (puntosUsuario >= recompensaSeleccionada.costo) {
      // 2. Restamos los puntos del costo
      setPuntosUsuario(puntosUsuario - recompensaSeleccionada.costo);
      alert(`¡Canje exitoso de: ${recompensaSeleccionada.titulo}!`);
    } else {
      // 3. Si no le alcanza, mostramos una alerta
      alert("No tenés suficientes puntos para esta recompensa.");
    }
    // 4. Cerramos el modal
    setRecompensaSeleccionada(null);
  }}
  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition cursor-pointer"
>
  Sí, estoy seguro
</button>
              <button 
                onClick={() => setRecompensaSeleccionada(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2.5 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================== */}
      {/* MODAL DE PERFIL DE JUGADOR */}
{jugadorSeleccionado && (
  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-6 max-w-sm w-full shadow-2xl relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30 uppercase font-bold">
            {jugadorSeleccionado.rol}
          </span>
          <h3 className="text-2xl font-black text-white mt-2">{jugadorSeleccionado.alias}</h3>
        </div>
        <button 
          onClick={() => setJugadorSeleccionado(null)}
          className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 mb-6">
        <div>
          <span className="text-slate-500 block mb-0.5">Nombre Completo:</span>
          <span className="font-semibold text-white text-sm">{jugadorSeleccionado.nombreCompleto}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-slate-900">
          <div>
            <span className="text-slate-500 block mb-0.5">Edad:</span>
            <span className="font-semibold text-white">{jugadorSeleccionado.edad} años</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Nacionalidad:</span>
            <span className="font-semibold text-white">{jugadorSeleccionado.nacionalidad}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setJugadorSeleccionado(null)}
        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 rounded-lg transition cursor-pointer"
      >
        Cerrar Perfil
      </button>
    </div>
  </div>
)}
    </div>
  );
}