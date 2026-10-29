import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import LoadingScreen from './layout/LoadingScreen';
import { fetchCurrentUser } from '../utils/session.js';

export default function SessionRoute({ authenticated }) {
  const [session, setSession] = useState({ loading: true, user: null, error: false });

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    async function restoreSession() {
      try {
        const user = await fetchCurrentUser(controller.signal);
        if (ignore) return;

        localStorage.removeItem('token');
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('username', user.username);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('username');
        }
        setSession({ loading: false, user, error: false });
      } catch {
        if (!ignore) setSession({ loading: false, user: null, error: true });
      }
    }

    restoreSession();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  if (session.loading) return <LoadingScreen />;
  if (session.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white" role="alert">
        <p>No se pudo verificar tu sesión. Comprobá la conexión con el servidor.</p>
        <button className="px-4 py-2 rounded-lg bg-purple-600" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  if (authenticated && !session.user) return <Navigate to="/login" replace />;
  if (!authenticated && session.user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
