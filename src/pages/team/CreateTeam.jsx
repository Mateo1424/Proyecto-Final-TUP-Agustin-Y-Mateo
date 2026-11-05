import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../config';
import { canonicalRankValue, getRankPickerSpec } from '../../utils/teamRanks';

const GAME_OPTIONS = ['Valorant', 'League of Legends', 'Counter-Strike 2', 'EA FC 27', 'Rocket League', 'CS:GO'];

export default function CreateTeam() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    logoUrl: '',
    gameName: 'Valorant',
    joinPolicy: 'InviteOnly',
    rankFilterType: 'None',
    rankFilterValue: ''
  });
  const [saving, setSaving] = useState(false);

  const rankSpec = useMemo(() => getRankPickerSpec(formData.gameName), [formData.gameName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'gameName') next.rankFilterValue = '';
      if (name === 'joinPolicy' && value === 'InviteOnly') {
        next.rankFilterType = 'None';
        next.rankFilterValue = '';
      }
      if (name === 'rankFilterType' && value === 'None') next.rankFilterValue = '';
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!localStorage.getItem('user')) {
      alert('Debes iniciar sesión para crear un equipo.');
      navigate('/login');
      return;
    }

    const needsRank = formData.joinPolicy === 'Open' && formData.rankFilterType !== 'None';
    const rankValue = needsRank ? canonicalRankValue(formData.gameName, rankSpec, formData.rankFilterValue) : null;
    if (needsRank && !rankValue) {
      alert('Seleccioná o indicá el rango para el filtro.');
      return;
    }
    if (needsRank && rankSpec.kind === 'numeric') {
      const n = parseInt(String(formData.rankFilterValue).replace(/[^\d]/g, ''), 10);
      if (!Number.isFinite(n) || n < rankSpec.min) {
        alert(`Indicá al menos ${rankSpec.min} puntos.`);
        return;
      }
    }

    const payload = {
      name: formData.name,
      tag: formData.tag,
      logoUrl: formData.logoUrl,
      gameName: formData.gameName,
      joinPolicy: formData.joinPolicy,
      rankFilterType: formData.joinPolicy === 'Open' ? formData.rankFilterType : 'None',
      rankFilterValue: rankValue
    };

    setSaving(true);
    try {
      const response = await apiFetch('/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    } finally {
      setSaving(false);
    }
  };

  const isOpen = formData.joinPolicy === 'Open';
  const needsRankValue = isOpen && formData.rankFilterType !== 'None';

  const renderRankValueInput = () => {
    const common = "w-full p-2.5 bg-[#0d1117] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none";
    if (rankSpec.kind === 'numeric') {
      return (
        <input
          type="number"
          name="rankFilterValue"
          min={rankSpec.min}
          step={rankSpec.step}
          value={formData.rankFilterValue}
          onChange={handleChange}
          className={common}
          placeholder={rankSpec.placeholder}
          required={needsRankValue}
        />
      );
    }
    if (rankSpec.kind === 'tiered' || rankSpec.kind === 'select') {
      return (
        <select name="rankFilterValue" value={formData.rankFilterValue} onChange={handleChange} className={common} required={needsRankValue}>
          <option value="">Seleccionar...</option>
          {rankSpec.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    return (
      <input
        type="text"
        name="rankFilterValue"
        value={formData.rankFilterValue}
        onChange={handleChange}
        className={common}
        placeholder={rankSpec.placeholder || 'Ej: Oro, Platino...'}
        required={needsRankValue}
      />
    );
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
            value={formData.name}
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
            value={formData.tag}
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
            value={formData.logoUrl}
            onChange={handleChange}
            className="w-full p-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none"
            placeholder="https://..."
          />
        </div>

        <div className="bg-[#161b22] border border-gray-800 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-bold text-white">Acceso al equipo</h3>
          <div>
            <label className="block text-sm font-semibold mb-1">¿Cómo se unen los jugadores?</label>
            <select
              name="joinPolicy"
              value={formData.joinPolicy}
              onChange={handleChange}
              className="w-full p-2.5 bg-[#0d1117] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none"
            >
              <option value="InviteOnly">Solo por invitación</option>
              <option value="Open">Público (cualquiera puede unirse)</option>
            </select>
          </div>

          {isOpen && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1">Filtro de rango</label>
                <select
                  name="rankFilterType"
                  value={formData.rankFilterType}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-[#0d1117] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none"
                >
                  <option value="None">Sin mínimo de rango</option>
                  <option value="Minimum">Mínimo de rango</option>
                  <option value="Fixed">Rango fijo</option>
                </select>
              </div>
              {needsRankValue && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    {formData.rankFilterType === 'Minimum' ? `Mínimo: ${rankSpec.label} *` : `Requerido: ${rankSpec.label} *`}
                  </label>
                  {renderRankValueInput()}
                  <p className="text-xs text-gray-500 mt-1">
                    {rankSpec.help} {formData.rankFilterType === 'Minimum' ? 'Debe cumplir o superar el valor.' : 'Debe coincidir exactamente.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <button type="submit" disabled={saving} className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white rounded-lg font-bold transition shadow-lg shadow-purple-900/40">
          {saving ? 'Creando...' : 'Guardar y Crear Equipo'}
        </button>
      </form>
    </div>
  );
}
