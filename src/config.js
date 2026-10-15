export const API_URL = "https://localhost:7039/api";

// fetch que envía la cookie de sesión (access_token) en cada petición
export const apiFetch = (path, options = {}) =>
  fetch(`${API_URL}${path}`, { ...options, credentials: 'include' });