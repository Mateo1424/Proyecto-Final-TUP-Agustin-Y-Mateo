// Formato de equipo por juego: titulares/suplentes por defecto y límites.
// Valorant/CS/LoL juegan 5+2; Rocket League va de 1v1 a 3v3; EA FC de 1v1 a 11v11.
export const teamFormatForGame = (gameName) => {
  const game = (gameName || '').toLowerCase();
  if (game.includes('rocket')) {
    return { starters: 3, substitutes: 0, maxStarters: 3, fixedStarters: false };
  }
  if (game.includes('ea fc') || game.includes('fifa')) {
    return { starters: 11, substitutes: 7, maxStarters: 11, fixedStarters: false };
  }
  if (
    game.includes('valorant') ||
    game.includes('counter') ||
    game.includes('cs:go') ||
    game.includes('csgo') ||
    game.includes('cs2') ||
    game.includes('league') ||
    game.includes('lol')
  ) {
    return { starters: 5, substitutes: 2, maxStarters: 5, fixedStarters: true };
  }
  return { starters: 5, substitutes: 2, maxStarters: 11, fixedStarters: false };
};

// El backend exige este margen mínimo para que los equipos puedan inscribirse.
export const MIN_REGISTRATION_MINUTES = 30;
