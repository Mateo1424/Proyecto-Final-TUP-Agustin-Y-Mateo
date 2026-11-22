import { z } from 'zod';

export const TEAM_GAME_OPTIONS=['League of Legends','Valorant','CS:GO','Rocket League'];
export const teamCreateSchema=z.object({
  name:z.string().min(2,'Ingresá un nombre de al menos 2 caracteres.').max(40,'El nombre admite hasta 40 caracteres.').refine(value=>value.trim().length>0,'Ingresá el nombre del equipo.'),
  tag:z.string().min(2,'Ingresá un tag de al menos 2 caracteres.').max(6,'El tag admite hasta 6 caracteres.').refine(value=>value.trim().length>0,'Ingresá el tag del equipo.'),
  logoUrl:z.string(),
  gameName:z.enum(TEAM_GAME_OPTIONS,{error:'Elegí uno de los videojuegos disponibles.'}),
  isPrivate:z.boolean(),
});
