import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

// Portadas oficiales garantizadas con enlaces estables
const AVAILABLE_GAMES = [
  { 
    id: 'valorant', 
    name: 'Valorant', 
    logo: 'https://tse-mm.bing.com/th?q=Is%20Valorant%20Free%20On%20Epic%20Games%20apk' 
  },
  { 
    id: 'cs2', 
    name: 'Counter-Strike 2', 
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkDcI7i9tjZi5-HotgteoLq1kbXJSOHkrWH1ljMkTbqfiEFUviRptY-CM&s=10' 
  },
  { 
    id: 'lol', 
    name: 'League of Legends', 
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA8c_f1NJwqS5sQI8B1wG6d5KvdX9iMhxKEomW_DNqOg&s=10' 
  },
  { 
    id: 'eafc27', 
    name: 'EA FC 27', 
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzVePMddak4LGngyCU9nWoLCdopSHPgZvCP7g1ogvB5Q&s=10' 
  }
];

export default function CreateTournament() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    gameName: 'Valorant', // Valor por defecto
    description: '',
    startDate: '',
    endDate: '',
    maxParticipants: 16,
    rules: '',
    bannerUrl: '',
    rankConditions: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGameSelect = (gameName) => {
    setFormData({ ...formData, gameName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Debes iniciar sesión para crear un torneo.');
      return;
    }

    // Si el banner se deja en blanco, asigna automáticamente la portada del juego seleccionado
    const finalBannerUrl = formData.bannerUrl.trim() !== '' 
      ? formData.bannerUrl 
      : (AVAILABLE_GAMES.find(g => g.name === formData.gameName)?.logo || "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1000&auto=format&fit=crop");

    const payload = {
      ...formData,
      bannerUrl: finalBannerUrl
    };

    try {
      const response = await fetch(`${API_URL}/tournaments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('¡Torneo creado con éxito!');
        navigate('/tournaments');
      } else {
        const errorData = await response.json();
        alert(`Error al crear el torneo: ${errorData.message || 'Verifica los datos'}`);
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 tracking-wide">Crear Nuevo Torneo</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Selección Visual de Juegos con Portadas Estables */}
        <div>
          <label className="block text-sm font-semibold mb-3">Selecciona el Juego</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AVAILABLE_GAMES.map((game) => {
              const isSelected = formData.gameName === game.name;
              return (
                <div
                  key={game.id}
                  onClick={() => handleGameSelect(game.name)}
                  className={`cursor-pointer border rounded-xl overflow-hidden flex flex-col justify-between transition relative group ${
                    isSelected 
                      ? 'border-purple-500 ring-2 ring-purple-500/50 bg-purple-950/30' 
                      : 'border-gray-800 bg-[#161b22] hover:border-gray-600'
                  }`}
                >
                  {/* Portada del juego */}
                  <div className="h-32 w-full relative overflow-hidden bg-gray-900">
                    <img 
                      src={game.logo} 
                      alt={game.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    />
                    {/* Check / Radio visual de selección */}
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full border border-white/80 flex items-center justify-center bg-black/60 shadow">
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>}
                    </div>
                  </div>

                  {/* Nombre del juego */}
                  <div className="p-3 text-center bg-[#161b22]">
                    <span className={`text-xs font-bold ${isSelected ? 'text-purple-400' : 'text-gray-300'}`}>
                      {game.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Título del Torneo</label>
          <input name="title" onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="Ej: Nexus Arena Championship" required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Descripción</label>
          <textarea name="description" onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="Breve descripción del evento..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Fecha de Inicio</label>
            <input type="datetime-local" name="startDate" onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Fecha de Fin</label>
            <input type="datetime-local" name="endDate" onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Máx. Participantes</label>
            <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold mb-1">URL del Banner <span className="text-gray-500 font-normal">(Opcional)</span></label>
            <input name="bannerUrl" onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="Si lo dejas vacío, usará la portada del juego seleccionado" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Reglas Clave</label>
          <textarea name="rules" onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="Ej: Puntualidad, formato de partidas..." required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Condiciones de Rango</label>
          <input name="rankConditions" onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="Ej: Libre para todos los rangos / Solo Diamante+" required />
        </div>

        <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition shadow-lg shadow-purple-900/40">
          Guardar y Crear Torneo
        </button>
      </form>
    </div>
  );
}