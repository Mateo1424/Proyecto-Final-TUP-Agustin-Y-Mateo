import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/teams`)
      .then((res) => res.json())
      .then((data) => {
        setTeams(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar equipos:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-white text-center">Cargando equipos...</div>;
  }

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold tracking-wide">Equipos Registrados</h2>
        <Link 
          to="/teams/create" 
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition shadow-lg shadow-purple-900/40"
        >
          + Crear Equipo
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 bg-[#161b22] border border-gray-800 rounded-xl">
          <p className="text-gray-400 mb-4">No hay equipos creados todavía.</p>
          <Link to="/teams/create" className="text-purple-400 hover:underline font-semibold">
            ¡Crea el primero ahora!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link to={`/teams/${team.id}`} key={team.id} className="block group">
              <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden flex flex-col justify-between p-5 shadow-md group-hover:border-purple-500 transition">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={team.logoUrl} 
                    alt={team.name} 
                    className="w-14 h-14 object-cover rounded-full border border-purple-500/50 bg-gray-900" 
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">{team.name}</h3>
                    <span className="text-xs bg-purple-950 text-purple-400 px-2 py-0.5 rounded font-mono border border-purple-800">
                      [{team.tag}]
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-3 flex justify-between items-center text-xs text-gray-400">
                  <span>Miembros: <strong className="text-white">{team.members?.length || 0}</strong></span>
                  <span className="text-purple-400 font-medium group-hover:underline">Ver detalles →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}