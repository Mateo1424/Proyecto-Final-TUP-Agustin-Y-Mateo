// Reglas visuales por videojuego. La victoria automática real la aplica el backend (GameRules.cs):
// mantené winScore igual en los dos lados.
const GAME_RULES = {
  'Valorant': { unit: 'Rondas', winScore: 13 },
  'Counter-Strike 2': { unit: 'Rondas', winScore: 13 },
  'CS:GO': { unit: 'Rondas', winScore: null },
  'Rocket League': { unit: 'Goles', winScore: null },
  'EA FC 27': { unit: 'Goles', winScore: null },
  'League of Legends': { unit: 'Puntos', winScore: null },
};

export const getGameRules = (gameName) => GAME_RULES[gameName] || { unit: 'Puntos', winScore: null };
