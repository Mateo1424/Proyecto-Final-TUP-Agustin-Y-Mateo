// Configuración de rangos por juego para filtros de equipos (crear/editar/unión pública).
// Valores canónicos enviados al backend; el backend valida/normaliza.

const VALORANT_TIERS = ['Hierro', 'Bronce', 'Plata', 'Oro', 'Platino', 'Diamante', 'Ascendente', 'Inmortal'];
const VALORANT_DIVS = ['1', '2', '3'];
const LOL_TIERS_DIV = ['Hierro', 'Bronce', 'Plata', 'Oro', 'Platino', 'Esmeralda', 'Diamante'];
const LOL_DIVS = ['1', '2', '3', '4'];
const LOL_TOP = ['Maestro', 'Gran Maestro', 'Retador'];
const RL_TIERS_DIV = ['Bronce', 'Plata', 'Oro', 'Platino', 'Diamante', 'Campeón', 'Gran Campeón'];
const RL_DIVS = ['I', 'II', 'III'];
const RL_TOP = ['Leyenda Supersónica'];

function tieredOptions(tiers, divs, top = []) {
  const opts = [];
  for (const t of tiers) for (const d of divs) opts.push(`${t} ${d}`);
  for (const t of top) opts.push(t);
  return opts;
}

export function getRankPickerSpec(gameName) {
  const g = (gameName || '').trim().toLowerCase();
  if (g === 'valorant') {
    return {
      kind: 'tiered',
      label: 'Rango (Valorant)',
      options: [...tieredOptions(VALORANT_TIERS, VALORANT_DIVS), 'Radiante'],
      help: 'Hierro–Inmortal: 1 a 3. Radiante es el rango máximo.'
    };
  }
  if (g === 'counter-strike 2' || g === 'cs:go' || g === 'cs2' || g === 'counter strike 2') {
    return {
      kind: 'numeric',
      label: 'Puntos Premier',
      min: 1000,
      step: 50,
      placeholder: 'Ej: 10000',
      help: 'Mínimo 1000 puntos Premier (subida libre).'
    };
  }
  if (g === 'ea fc 27' || g === 'ea fc' || g === 'fifa' || g.includes('fc 2')) {
    return {
      kind: 'select',
      label: 'División Rivals',
      options: ['División 9', 'División 8', 'División 7', 'División 6', 'División 5', 'División 4', 'División 3', 'División 2', 'División 1'],
      help: 'División 9 es la más baja; División 1 es la más alta.'
    };
  }
  if (g === 'league of legends' || g === 'lol') {
    return {
      kind: 'tiered',
      label: 'Rango (LoL)',
      options: tieredOptions(LOL_TIERS_DIV, LOL_DIVS, LOL_TOP),
      help: 'Hierro–Esmeralda/Diamante: divisiones 1 a 4 (1 es la mejor; se sube con 100 LP). Maestro, Gran Maestro y Retador no tienen divisiones (LP abierto).'
    };
  }
  if (g === 'rocket league') {
    return {
      kind: 'tiered',
      label: 'Rango (Rocket League)',
      options: tieredOptions(RL_TIERS_DIV, RL_DIVS, RL_TOP),
      help: 'Bronce–Gran Campeón: I, II, III. Leyenda Supersónica (SSL) es el rango máximo sin subdivisiones.'
    };
  }
  return { kind: 'text', label: 'Rango', placeholder: 'Ej: Oro, Platino...', help: 'Escribí el rango tal como figura en tu perfil.' };
}

export function canonicalRankValue(gameName, spec, raw) {
  if (!raw && raw !== 0) return '';
  if (spec.kind === 'numeric') {
    const n = parseInt(String(raw).replace(/[^\d]/g, ''), 10);
    if (!Number.isFinite(n)) return '';
    return `Premier ${n}`;
  }
  return String(raw).trim();
}

export function parseRankValueForForm(gameName, spec, stored) {
  if (!stored) return '';
  if (spec.kind === 'numeric') {
    const m = String(stored).match(/(\d+)/);
    return m ? m[1] : '';
  }
  return String(stored);
}

export function ensureOptionValue(spec, value) {
  if (!value) return '';
  if (spec.kind !== 'tiered' && spec.kind !== 'select') return value;
  if (spec.options.includes(value)) return value;
  // tolerar variaciones simples (case/espacios)
  const norm = String(value).trim().toLowerCase();
  const found = spec.options.find(o => o.toLowerCase() === norm);
  return found || value;
}
