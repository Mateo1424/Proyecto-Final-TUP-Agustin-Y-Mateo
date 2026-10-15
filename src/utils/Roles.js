// Usuario guardado al iniciar sesión (el token va en la cookie)
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Moderadores y administradores pueden gestionar torneos (el backend lo valida igual)
export const isModerator = (user) => user?.role === 'Moderator' || user?.role === 'Admin';