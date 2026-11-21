export const visibleTournaments = tournaments => tournaments.filter(tournament => tournament.status !== 'Cancelado');
