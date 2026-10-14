import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Carga de datos del usuario autenticado y detalles del equipo
  const fetchTeamAndUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const profileRes = await fetch('https://localhost:7039/api/profile/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCurrentUserId(profileData.id || profileData.userId);
        }
      }

      const response = await fetch(`${API_URL}/teams/${id}`);
      if (!response.ok) throw new Error('No se pudo cargar la información del equipo.');
      const data = await response.json();
      setTeam(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAndUser();
  }, [id]);

  // Manejo de la acción para unirse al equipo
  const handleJoinTeam = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para unirte a un equipo.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/teams/${id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('¡Te has unido al equipo correctamente!');
        fetchTeamAndUser();
      } else {
        alert(data.message || 'Error al unirse al equipo.');
      }
    } catch (err) {
      console.error('Error de red:', err);
      alert('Error de conexión con el servidor.');
    }
  };

  // Manejo de la acción para abandonar el equipo
  const handleLeaveTeam = async () => {
    if (!window.confirm("¿Estás seguro de que deseas abandonar este equipo?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/teams/${id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        navigate('/teams');
      } else {
        const data = await response.json();
        alert(data.message || "Error al abandonar el equipo");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando detalles del equipo...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!team) return <div className="p-8 text-white">Equipo no encontrado.</div>;

  // Verificaciones de estado del usuario actual en relación al equipo
  const isMember = team.members?.some(m => m.userId === currentUserId || m.UserId === currentUserId);
  const isCaptain = team.captainId === currentUserId || team.CaptainId === currentUserId;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 text-white">
      {/* Cabecera del equipo */}
      <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-6 relative">
        <img 
          src={team.logoUrl} 
          alt={team.name} 
          className="w-24 h-24 object-cover rounded-full border-2 border-purple-500 bg-gray-900 shadow-lg" 
        />
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-wide">{team.name}</h1>
            <span className="bg-purple-950 text-purple-400 px-3 py-1 rounded-full font-mono text-sm border border-purple-800">
              [{team.tag}]
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Administrado por el Capitán del clan. ¡Participa en torneos y compite con tu roster oficial!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isMember ? (
            <>
              <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 px-5 py-3 rounded-xl font-bold text-sm shadow">
                ✓ Miembro Oficial
              </div>
              {!isCaptain && (
                <button 
                  onClick={handleLeaveTeam}
                  className="px-4 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition font-medium text-sm border border-red-500/40 cursor-pointer"
                >
                  Abandonar
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={handleJoinTeam}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Unirse al Equipo
            </button>
          )}
        </div>
      </div>

      {/* Roster de integrantes */}
      <section className="bg-[#161b22] rounded-xl p-6 border border-gray-800 space-y-4">
        <h3 className="text-xl font-bold mb-4">Roster de Integrantes ({team.members?.length || 0})</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {team.members?.map((member, index) => {
            const lastActiveTime = member.lastActive ? new Date(member.lastActive).getTime() : 0;
            const now = new Date().getTime();
            const isOnline = (now - lastActiveTime) < 3 * 60 * 1000;

            const isCurrentUser = (member.userId === currentUserId || member.UserId === currentUserId);
            const isMemberCaptain = member.role === 'Captain' || member.Role === 'Captain';

            return (
              <div key={index} className={`p-4 rounded-xl border flex items-center justify-between ${isCurrentUser ? 'bg-[#1f242d] border-purple-500/60' : 'bg-[#0d1117] border-gray-800'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center font-bold text-purple-300 border border-purple-700">
                    {member.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      {member.username} 
                      {isCurrentUser && <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded">Tú</span>}
                    </h4>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      {isMemberCaptain ? '(capitán)' : '(miembro)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-gray-500'}`}></span>
                  <span className="text-xs text-gray-400 font-medium">
                    {isOnline ? 'En línea' : 'Desconectado'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}