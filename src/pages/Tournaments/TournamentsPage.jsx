import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../config';
import { getStoredUser, isModerator } from '../../utils/Roles';

const STATUS_OPTIONS = ['', 'Próximo', 'En curso', 'Finalizado', 'Cancelado'];
const GAME_OPTIONS = ['', 'Valorant', 'Counter-Strike 2', 'League of Legends', 'EA FC 27', 'Rocket League', 'CS:GO'];

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ gameName: '', status: '', fromDate: '', toDate: '' });
  const navigate = useNavigate();

  const canCreate = isModerator(getStoredUser());

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (filters.gameName) params.set('gameName', filters.gameName);
    if (filters.status) params.set('status', filters.status);
    if (filters.fromDate) params.set('fromDate', new Date(filters.fromDate).toISOString());
    if (filters.toDate) params.set('toDate', new Date(filters.toDate).toISOString());
    const qs = params.toString();

    apiFetch(`/tournaments${qs ? `?${qs}` : ''}`)
      .then(response => {
        if (!response.ok) throw new Error('Error al cargar los torneos');
        return response.json();
      })
      .then(data => {
        setTournaments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const statusBadge = (status) => {
    if (status === 'En curso') return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
    if (status === 'Finalizado') return 'text-gray-300 bg-gray-900/40 border-gray-700';
    if (status === 'Cancelado') return 'text-red-400 bg-red-950/40 border-red-800/50';
    return 'text-amber-300 bg-amber-950/30 border-amber-800/40';
  };

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-wide">Torneos Activos</h1>
        {canCreate && (
          <button
            onClick={() => navigate('/tournaments/create')}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition shadow-lg shadow-purple-900/40 cursor-pointer"
          >
            + Nuevo Torneo
          </button>
        )}
      </div>

      {/* RF-19: filtros */}
      <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select value={filters.gameName} onChange={e=>setFilters(f=>({...f, gameName:e.target.value}))} style={{colorScheme:'dark'}} className="p-2 bg-[#0d1117] border border-gray-800 rounded-lg text-sm">
          {GAME_OPTIONS.map(g => <option key={g||'all'} value={g}>{g || 'Todos los juegos'}</option>)}
        </select>
        <select value={filters.status} onChange={e=>setFilters(f=>({...f, status:e.target.value}))} style={{colorScheme:'dark'}} className="p-2 bg-[#0d1117] border border-gray-800 rounded-lg text-sm">
          {STATUS_OPTIONS.map(s => <option key={s||'all'} value={s}>{s || 'Todos los estados'}</option>)}
        </select>
        <input type="date" value={filters.fromDate} onChange={e=>setFilters(f=>({...f, fromDate:e.target.value}))} style={{colorScheme:'dark'}} className="p-2 bg-[#0d1117] border border-gray-800 rounded-lg text-sm" title="Desde" />
        <input type="date" value={filters.toDate} onChange={e=>setFilters(f=>({...f, toDate:e.target.value}))} style={{colorScheme:'dark'}} className="p-2 bg-[#0d1117] border border-gray-800 rounded-lg text-sm" title="Hasta" />
        <button onClick={()=>setFilters({gameName:'',status:'',fromDate:'',toDate:''})} className="p-2 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-800">Limpiar filtros</button>
      </div>

      {loading ? (
        <div className="text-center text-gray-300">Cargando torneos...</div>
      ) : error ? (
        <div className="text-center text-red-400 py-10 border border-red-900/30 bg-red-950/20 rounded-lg">Error: {error}</div>
      ) : tournaments.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border border-gray-800 bg-[#161b22] rounded-lg">
          <p className="text-lg mb-2">No hay torneos con esos filtros.</p>
          {canCreate && <p className="text-sm">¡Creá el primero haciendo clic en "Nuevo Torneo"!</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tourney) => (
            <div key={tourney.id} className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:border-purple-500/50 transition flex flex-col">
              <img
                src={tourney.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"}
                alt={tourney.gameName}
                className="h-40 w-full object-cover"
              />
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="bg-purple-600/20 text-purple-400 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-purple-500/30 shrink-0">
                    {tourney.gameName}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusBadge(tourney.status)}`}>
                    {tourney.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">{tourney.title}</h3>
                <p className="text-sm text-gray-400 mb-1">Tipo: <span className="text-gray-200">{tourney.tournamentType || 'Individual'}</span></p>
                <p className="text-sm text-gray-400 mb-4">
                  Cupos: <span className="text-gray-200 font-medium">{tourney.participants?.length || 0} / {tourney.maxParticipants}</span>
                </p>
                <p className="text-xs text-gray-500 mb-4">Inicio: {new Date(tourney.startDate).toLocaleString()}</p>
                <div className="mt-auto pt-4 border-t border-gray-800">
                  <button
                    onClick={() => navigate(`/tournaments/${tourney.id}`)}
                    className="w-full bg-purple-600/20 hover:bg-purple-600 hover:text-white text-purple-400 font-semibold py-2 px-4 rounded-lg transition border border-purple-500/30 cursor-pointer"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
