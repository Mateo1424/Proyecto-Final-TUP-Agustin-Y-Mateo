import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../config';

const GAME_OPTIONS = ['League of Legends', 'Valorant', 'CS:GO', 'Rocket League'];

export default function CreateTeam() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    logoUrl: '',
    gameName: 'Valorant'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!localStorage.getItem('user')) {
      alert('Debes iniciar sesión para crear un equipo.');
      navigate('/login');
      return;
    }

    try {
      const response = await apiFetch('/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('¡Equipo creado con éxito!');
        navigate('/teams');
      } else if (response.status === 401) {
        alert('Tu sesión expiró. Volvé a iniciar sesión.');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error al crear el equipo: ${errorData.message || 'Verifica los datos'}`);
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 tracking-wide">Crear Nuevo Equipo</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Videojuego *</label>
          <select
            name="gameName"
            value={formData.gameName}
            onChange={handleChange}
            className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none"
            required
          >
            {GAME_OPTIONS.map((game) => (
              <option key={game} value={game}>{game}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Debés tener este juego asociado a tu perfil con nombre y rango para crear el equipo.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Nombre del Equipo</label>
          <input 
            name="name" 
            onChange={handleChange} 
            className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" 
            placeholder="Ej: KRÜ Esports" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Tag / Siglas</label>
          <input 
            name="tag" 
            onChange={handleChange} 
            className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" 
            placeholder="Ej: KRU" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">URL del Logo <span className="text-gray-500 font-normal">(Opcional)</span></label>
          <input 
            name="logoUrl" 
            onChange={handleChange} 
            className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" 
            placeholder="https://..." 
          />
        </div>

        <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition shadow-lg shadow-purple-900/40">
          Guardar y Crear Equipo
        </button>
      </form>
    </div>
  );
}