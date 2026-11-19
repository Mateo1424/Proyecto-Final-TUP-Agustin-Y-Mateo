import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { tournamentCreateSchema, createTournamentPayload } from '../../schemas/tournamentCreate.js';
import { request } from '../../api/client.js';
import { useNavigate } from '../../routing/navigation.js';


// Portadas oficiales garantizadas con enlaces estables
const AVAILABLE_GAMES = [
  {
    id: 'valorant',
    name: 'Valorant',
    logo: 'https://tse-mm.bing.com/th?q=Is%20Valorant%20Free%20On%20Epic%20Games%20apk'
  },
  {
    id: 'cs2',
    name: 'CS:GO',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkDcI7i9tjZi5-HotgteoLq1kbXJSOHkrWH1ljMkTbqfiEFUviRptY-CM&s=10'
  },
  {
    id: 'lol',
    name: 'League of Legends',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA8c_f1NJwqS5sQI8B1wG6d5KvdX9iMhxKEomW_DNqOg&s=10'
  },
  {
    id: 'rocketleague',
    name: 'Rocket League',
    logo: ''
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
  const [serverError, setServerError] = useState('');
  const {register, control, setValue, handleSubmit: submitForm, setError, formState:{errors,isSubmitting}} = useForm({defaultValues:{title:'',gameName:'Valorant',tournamentType:'Individual',startDate:'',endDate:'',maxParticipants:8,rules:'',bannerUrl:'',rankConditions:'Sin restricción',isFree:false}});
  const formData = useWatch({control});
  const setFormData = next => { for(const [name,value] of Object.entries(next)) setValue(name,value,{shouldDirty:true}); };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGameSelect = (gameName) => {
    setFormData({ ...formData, gameName });
  };

  // Atajo para pruebas: inicio dentro de N minutos y fin una hora después
  const setQuickStart = (minutes) => {
    const start = new Date(Date.now() + minutes * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setFormData({
      ...formData,
      startDate: toLocalInputValue(start),
      endDate: toLocalInputValue(end)
    });
  };

  const handleSubmit = submitForm(async values => {
    const parsed = tournamentCreateSchema.safeParse(values);
    if (!parsed.success) { for (const issue of parsed.error.issues) setError(issue.path[0] || 'root', {message:issue.message}); return; }
    setServerError('');
    try { await request('/tournaments',{method:'POST',data:createTournamentPayload(parsed.data)}); navigate('/tournaments'); }
    catch (error) { setServerError(error.message); }
  });

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 tracking-wide">Crear Nuevo Torneo</h2>
      {serverError && <p role="alert" className="mb-4 text-red-300">{serverError}</p>}
      <form noValidate onSubmit={handleSubmit} className="space-y-6">

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
              <div className="text-xs text-gray-400">5 titulares fijos; cada uno confirma y paga su entrada</div>
            </div>
          </div>
        </div>

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
                    {game.logo ? <img
                      src={game.logo}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    /> : <div className="flex h-full items-center justify-center px-4 text-lg font-bold text-gray-300">{game.name}</div>}
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
          <input {...register('title')} onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="Ej: Nexus Arena Championship" required />
        </div>



        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Fecha y Hora de Inicio</label>
              <input
                type="datetime-local"
                {...register('startDate')}
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
                {...register('endDate')}
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

          {/* Atajos para probar rápido las llaves automáticas */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setQuickStart(2)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-purple-500/50 text-purple-300 hover:bg-purple-950/40 transition cursor-pointer"
            >
              Empezar en 2 minutos
            </button>
            <button
              type="button"
              onClick={() => setQuickStart(5)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-purple-500/50 text-purple-300 hover:bg-purple-950/40 transition cursor-pointer"
            >
              Empezar en 5 minutos
            </button>
            <span className="text-xs text-gray-500">
              Atajo para pruebas: completa el inicio y pone el fin una hora después.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Máx. Participantes</label>
            <input type="number" {...register('maxParticipants',{valueAsNumber:true})} readOnly value={8} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold mb-1">URL del Banner <span className="text-gray-500 font-normal">(Opcional)</span></label>
            <input {...register('bannerUrl')} onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="Si lo dejas vacío, usará la portada del juego seleccionado" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Reglas Clave</label>
          <textarea {...register('rules')} onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="Ej: Puntualidad, formato de partidas..." required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Condiciones de Rango</label>
          <input {...register('rankConditions')} onChange={handleChange} className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="Sin restricción / Mínimo: Oro 1" required />
        </div>

        <label className="flex items-center gap-3"><input type="checkbox" {...register('isFree')} /> Torneo gratuito</label>
        <p className="text-sm text-gray-300">Ocho {formData.tournamentType === 'Equipo' ? 'equipos de cinco titulares' : 'jugadores'}. {formData.isFree ? 'Entrada gratis; 50 puntos por completar y 100 adicionales al ganar, con límite diario de 200.' : 'Entrada: 250 puntos por jugador. Premios individuales: 1.000 / 600 / 200 puntos para campeón, subcampeón y semifinalistas.'} Los valores los fija el backend.</p>
        {Object.entries(errors).map(([name,error]) => <p role="alert" key={name} className="text-sm text-red-300">{error.message}</p>)}
        <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition shadow-lg shadow-purple-900/40 cursor-pointer">
          {isSubmitting ? 'Creando…' : 'Guardar y Crear Torneo'}
        </button>
      </form>
    </div>
  );
}
