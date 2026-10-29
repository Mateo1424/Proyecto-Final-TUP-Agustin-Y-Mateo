import { apiFetch } from '../config.js';

// La cookie es la fuente de autenticación; localStorage solo conserva datos de UI.
export async function fetchCurrentUser(signal) {
  const response = await apiFetch('/auth/me', { signal, cache: 'no-store' });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('No se pudo verificar la sesión.');

  const { user } = await response.json();
  if (!user?.id || !user?.username || !user?.role) {
    throw new Error('La respuesta de sesión no es válida.');
  }
  return user;
}
