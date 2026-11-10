import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../config';
import RankConditionBuilder from '../../components/RankConditionBuilder';
import { isIncompleteRankCondition } from '../../utils/teamRanks';
import { teamFormatForGame, MIN_REGISTRATION_MINUTES } from '../../utils/teamFormat';

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
  },
  { 
    id: 'rocketleague', 
    name: 'Rocket League', 
    logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop' 
  },
  { 
    id: 'csgo', 
    name: 'CS:GO', 
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop' 
  }
];

// Convierte una fecha al formato que entiende <input type="datetime-local"> (hora local)
const toLocalInputValue = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Abre el calendario al hacer clic en cualquier parte del campo (no solo en el ícono)
const openPicker = (e) => {
  try {
    e.target.showPicker?.();
  } catch {
    // Algunos navegadores no lo permiten: queda el ícono nativo
  }
};

const dateInputClass =
  'w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none cursor-pointer';

export default function CreateTournament() {
  const navigate = useNavigate();
  const initialFormat = teamFormatForGame('Valorant');
  const [formData, setFormData] = useState({
    title: '',
    gameName: 'Valorant',
    tournamentType: 'Individual',
    description: '',
    startDate: '',
    endDate: '',
    maxParticipants: 16,
    rules: '',
    bannerUrl: '',
    rankConditions: 'Sin restricción',
    startersCount: initialFormat.starters,
    substitutesCount: initialFormat.substitutes
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGameSelect = (gameName) => {
    // Al cambiar de juego se resetean la condición de rango y el formato de equipo.
    const format = teamFormatForGame(gameName);
    setFormData({
      ...formData,
      gameName,
      rankConditions: 'Sin restricción',
      startersCount: format.starters,
      substitutesCount: format.substitutes
    });
  };

  // Atajo: inicio dentro de N minutos y fin una hora después.
  // El backend exige al menos 30 minutos de anticipación para inscribirse.
  const setQuickStart = (minutes) => {
    const start = new Date(Date.now() + minutes * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setFormData({
      ...formData,
      startDate: toLocalInputValue(start),
      endDate: toLocalInputValue(end)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!localStorage.getItem('user')) {
      alert('Debes iniciar sesión para crear un torneo.');
      navigate('/login');
      return;
    }

    // Validación de fechas en el cliente
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate < startDate) {
      alert('La fecha de finalización no puede ser anterior a la fecha de inicio.');
      return;
    }

    const minimumStart = Date.now() + MIN_REGISTRATION_MINUTES * 60 * 1000;
    if (startDate.getTime() < minimumStart) {
      alert(`La fecha de inicio debe ser al menos ${MIN_REGISTRATION_MINUTES} minutos posterior a la hora actual para que los equipos puedan inscribirse.`);
      return;
    }

    const maxParticipants = Number(formData.maxParticipants);
    if (!Number.isInteger(maxParticipants) || maxParticipants < 2) {
      alert('El torneo necesita al menos 2 participantes.');
      return;
    }

    const format = teamFormatForGame(formData.gameName);
    if (formData.tournamentType === 'Equipo') {
      const startersCount = Number(formData.startersCount);
      const substitutesCount = Number(formData.substitutesCount);
      if (!Number.isInteger(startersCount) || startersCount < 1 || startersCount > format.maxStarters) {
        alert(`La cantidad de titulares debe estar entre 1 y ${format.maxStarters} para ${formData.gameName}.`);
        return;
      }
      if (!Number.isInteger(substitutesCount) || substitutesCount < 0 || substitutesCount > 11) {
        alert('La cantidad de suplentes debe estar entre 0 y 11.');
        return;
      }
    }

    if (isIncompleteRankCondition(formData.rankConditions)) {
      alert('Elegí el rango de la restricción o seleccioná "Sin restricción".');
      return;
    }

    const finalBannerUrl = formData.bannerUrl.trim() !== '' 
      ? formData.bannerUrl 
      : (AVAILABLE_GAMES.find(g => g.name === formData.gameName)?.logo || "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1000&auto=format&fit=crop");

    // Las fechas se envían en UTC para que no dependan de la zona horaria del servidor
    const payload = {
      ...formData,
      maxParticipants,
      startersCount: Number(formData.startersCount) || format.starters,
      substitutesCount: Number(formData.substitutesCount) || 0,
      bannerUrl: finalBannerUrl,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString()
    };

    try {
      const response = await apiFetch('/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('¡Torneo creado con éxito!');
        navigate('/tournaments');
      } else if (response.status === 401) {
        alert('Tu sesión expiró. Volvé a iniciar sesión.');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error al crear el torneo: ${errorData.message || 'Verifica los datos'}`);
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  const teamFormat = teamFormatForGame(formData.gameName);

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 tracking-wide">Crear Nuevo Torneo</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="block text-sm font-semibold mb-3">Tipo de Torneo</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setFormData({ ...formData, tournamentType: 'Individual' })}
              className={`cursor-pointer border rounded-xl p-4 transition ${formData.tournamentType === 'Individual' ? 'border-purple-500 bg-purple-950/30' : 'border-gray-800 bg-[#161b22] hover:border-gray-600'}`}
            >
              <div className="font-bold">Individual</div>
              <div className="text-xs text-gray-400">Inscripción por jugador</div>
            </div>
            <div
              onClick={() => setFormData({ ...formData, tournamentType: 'Equipo' })}
              className={`cursor-pointer border rounded-xl p-4 transition ${formData.tournamentType === 'Equipo' ? 'border-purple-500 bg-purple-950/30' : 'border-gray-800 bg-[#161b22] hover:border-gray-600'}`}
            >
              <div className="font-bold">Por Equipos</div>
              <div className="text-xs text-gray-400">Formato configurable: 5+2, 3v3, 1v1... (solo capitán inscribe)</div>
            </div>
          </div>
        </div>

        {formData.tournamentType === 'Equipo' && (
          <div className="border border-gray-800 bg-[#161b22] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold">Formato de Equipo</label>
              <span className="text-xs text-gray-400">
                {teamFormat.fixedStarters
                  ? `${formData.gameName} juega con ${teamFormat.starters} titulares fijos`
                  : `Hasta ${teamFormat.maxStarters} titulares`}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Titulares</label>
                <input
                  type="number"
                  name="startersCount"
                  min={1}
                  max={teamFormat.maxStarters}
                  value={formData.startersCount}
                  onChange={handleChange}
                  disabled={teamFormat.fixedStarters}
                  className="w-full p-2.5 bg-[#0d1117] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Suplentes</label>
                <input
                  type="number"
                  name="substitutesCount"
                  min={0}
                  max={11}
                  value={formData.substitutesCount}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-[#0d1117] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Cada equipo debe presentar exactamente los titulares indicados y hasta la cantidad de suplentes configurada.
              Ejemplos: Valorant/CS2/LoL 5+2, Rocket League 3v3, EA FC de 1v1 a 11v11.
            </p>
          </div>
        )}

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
                  <div className="h-32 w-full relative overflow-hidden bg-gray-900">
                    <img 
                      src={game.logo} 
                      alt={game.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    />
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full border border-white/80 flex items-center justify-center bg-black/60 shadow">
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>}
                    </div>
                  </div>

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

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Fecha y Hora de Inicio</label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                onClick={openPicker}
                style={{ colorScheme: 'dark' }}
                className={dateInputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Fecha y Hora de Fin</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                min={formData.startDate || undefined}
                onChange={handleChange}
                onClick={openPicker}
                style={{ colorScheme: 'dark' }}
                className={dateInputClass}
                required
              />
            </div>
          </div>

          {/* Atajos: el backend exige al menos 30 minutos para inscribirse */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setQuickStart(30)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-purple-500/50 text-purple-300 hover:bg-purple-950/40 transition cursor-pointer"
            >
              Empezar en 30 minutos
            </button>
            <button
              type="button"
              onClick={() => setQuickStart(60)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-purple-500/50 text-purple-300 hover:bg-purple-950/40 transition cursor-pointer"
            >
              Empezar en 1 hora
            </button>
            <span className="text-xs text-gray-500">
              La inscripción se habilita 30 minutos antes del inicio y se cierra puntualmente al comenzar.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Máx. Participantes</label>
            <input type="number" name="maxParticipants" min={2} value={formData.maxParticipants} onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" />
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
          <RankConditionBuilder
            gameName={formData.gameName}
            value={formData.rankConditions}
            onChange={(value) => setFormData((prev) => ({ ...prev, rankConditions: value }))}
          />
        </div>

        <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition shadow-lg shadow-purple-900/40 cursor-pointer">
          Guardar y Crear Torneo
        </button>
      </form>
    </div>
  );
}