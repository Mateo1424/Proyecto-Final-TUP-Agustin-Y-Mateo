import { buildRankCondition, getRankPickerSpec, parseRankCondition } from '../utils/teamRanks';

// Constructor de condiciones de rango para torneos (RF-20 / RF-22).
// Componente controlado: el texto canónico vive en el formulario padre.
export default function RankConditionBuilder({ gameName, value, onChange, disabled = false }) {
  const parsed = parseRankCondition(gameName, value);
  const spec = getRankPickerSpec(gameName);
  const mode = parsed.mode;
  const rank = parsed.rank;

  const selectClass =
    'w-full p-2 bg-[#0d1117] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50';
  const inputClass = selectClass;

  const hasCurrent = rank && (spec.kind === 'tiered' || spec.kind === 'select') && !spec.options.includes(rank);

  const renderRankInput = () => {
    if (spec.kind === 'numeric') {
      const numericValue = String(rank ?? '').replace(/[^\d]/g, '');
      return (
        <input
          type="number"
          min={spec.min}
          step={spec.step}
          value={numericValue}
          disabled={disabled}
          onChange={(e) => onChange(buildRankCondition(mode, e.target.value))}
          placeholder={spec.placeholder}
          className={inputClass}
        />
      );
    }

    if (spec.kind === 'tiered' || spec.kind === 'select') {
      return (
        <select
          value={rank}
          disabled={disabled}
          onChange={(e) => onChange(buildRankCondition(mode, e.target.value))}
          className={selectClass}
        >
          <option value="">Seleccionar rango...</option>
          {hasCurrent && <option value={rank}>{rank} (actual)</option>}
          {spec.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        value={rank}
        disabled={disabled}
        onChange={(e) => onChange(buildRankCondition(mode, e.target.value))}
        placeholder={spec.placeholder || 'Ej: Oro, Platino...'}
        className={inputClass}
      />
    );
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] text-gray-400 mb-1">Restricción de rango</label>
          <select
            value={mode}
            disabled={disabled}
            onChange={(e) => onChange(buildRankCondition(e.target.value, rank))}
            className={selectClass}
          >
            <option value="none">Sin restricción</option>
            <option value="minimum">Mínimo de rango</option>
            <option value="fixed">Rango fijo (exacto)</option>
          </select>
        </div>
        {mode !== 'none' && (
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">
              {mode === 'fixed' ? 'Rango exigido' : 'Rango mínimo'}
            </label>
            {renderRankInput()}
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-500">
        {mode === 'none'
          ? 'Cualquier jugador con el videojuego asociado puede inscribirse. El moderador puede verificar rangos manualmente (RF-22).'
          : spec.help}
      </p>

      {parsed.legacy && (
        <p className="text-[11px] text-amber-300/90">
          Condición actual en texto libre: «{parsed.raw}». Se conservará hasta que elijas un modo y un rango.
        </p>
      )}

      {mode !== 'none' && !String(rank ?? '').trim() ? (
        <p className="text-[11px] text-amber-300">Elegí un rango para guardar la restricción.</p>
      ) : (
        <p className="text-[11px] text-purple-300">
          Se guardará como: <span className="font-mono">{buildRankCondition(mode, rank)}</span>
        </p>
      )}
    </div>
  );
}
