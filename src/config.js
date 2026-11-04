export const API_URL = "https://localhost:7039/api";
export const GOOGLE_LOGIN_URL = `${API_URL}/auth/external/google`;

// fetch que envía la cookie de sesión (access_token) en cada petición
export const apiFetch = (path, options = {}) =>
  fetch(`${API_URL}${path}`, { ...options, credentials: 'include' });
