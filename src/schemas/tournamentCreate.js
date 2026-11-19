import { z } from 'zod';
export const tournamentCreateSchema = z.object({
  title: z.string().trim().min(3, 'Ingresá un título de al menos 3 caracteres.').max(120),
  gameName: z.enum(['Valorant', 'CS:GO', 'League of Legends', 'Rocket League']),
  tournamentType: z.enum(['Individual', 'Equipo']),
  isFree: z.boolean(),
  maxParticipants: z.literal(8),
  startDate: z.string().min(1, 'Elegí el inicio.').refine(value => Number.isFinite(Date.parse(value)), 'Fecha inválida.'),
  endDate: z.string().min(1, 'Elegí el fin.').refine(value => Number.isFinite(Date.parse(value)), 'Fecha inválida.'),
  rules: z.string().trim().min(1, 'Ingresá las reglas.'),
  rankConditions: z.string().trim().refine(value => !value || /^(Sin restricci[oó]n|M[ií]nimo:\s*\S.+)$/i.test(value), 'Usá «Sin restricción» o «Mínimo: Oro 1».'),
  bannerUrl: z.string().trim().refine(value => !value || /^https?:\/\//i.test(value), 'Usá una URL http o https.'),
}).refine(value => Date.parse(value.endDate) >= Date.parse(value.startDate), {path:['endDate'],message:'La fecha de fin debe ser posterior al inicio.'})
.refine(value => Date.parse(value.startDate) > Date.now(), {path:['startDate'],message:'El inicio debe estar en el futuro.'});
export const createTournamentPayload = data => ({...data, prizePool:0, rankConditions:data.rankConditions || 'Sin restricción', startDate:new Date(data.startDate).toISOString(), endDate:new Date(data.endDate).toISOString()});
