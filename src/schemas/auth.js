import { z } from 'zod';
const passwordSchema = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(128);
export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresá tu correo o usuario.'),
  password: passwordSchema,
}).transform(({ identifier, password }) => z.email().safeParse(identifier).success
  ? { email: identifier, password }
  : { username: identifier, password });
export const registerSchema = z.object({ email: z.email('Ingresá un correo válido.'), password: passwordSchema, username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres.').max(30), confirmPassword: z.string(), game: z.enum(['Valorant', 'League of Legends', 'CS:GO', 'Rocket League']), inGameName: z.string().trim().min(1, 'Ingresá tu nombre en el juego.') }).refine(data => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Las contraseñas no coinciden.' });
