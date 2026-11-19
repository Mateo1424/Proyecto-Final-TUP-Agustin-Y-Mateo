import { Suspense, useEffect } from 'react';
import { NavLink, useNavigate } from '../../routing/navigation';
import { useWalletStore } from '../../store/wallet';
import { useSessionStore } from '../../store/session';
import { points } from '../../utils/format';
import { apiFetch } from '../../config';
import LoadingScreen from './LoadingScreen';

const linkBase = 'block px-3 py-2 rounded-lg hover:bg-[#21262d] transition';

// Link resaltado con LED cuando la ruta está activa (/teams también marca /teams/123)
const navClass = ({ isActive }) =>
  `${linkBase} ${isActive ? 'led-nav-active text-white font-semibold' : 'text-purple-300 hover:text-white'}`;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const balance = useWalletStore(state => state.balance);
  const walletError = useWalletStore(state => state.error);
  useEffect(() => {
    const refresh = () => { if (!document.hidden) void useWalletStore.getState().refresh(); };
    refresh(); window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // Pide al backend que borre la cookie de sesión y limpia los datos locales
  const handleLogout = async () => {
    try {
      const response = await apiFetch('/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('No se pudo cerrar la sesión.');
      useSessionStore.getState().accept(null);
    } catch (error) { window.alert(error.message); return; }

    navigate('/login');
  };

  return (
    <div className="flex h-screen text-white overflow-hidden">


      {/* Sidebar / Barra lateral */}
      <aside className="w-40 sm:w-64 shrink-0 bg-[#161b22] border-r border-gray-800 flex flex-col justify-between">
        <div>
          <div className="p-5 font-bold text-xl tracking-wider text-purple-400 led-text">
            NEXUS ARENA
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <NavLink to="/dashboard" className={navClass}>
              Inicio
            </NavLink>
            <NavLink to="/profile" className={navClass}>
              Mi Perfil
            </NavLink>
            <NavLink to="/teams" className={navClass}>
              Equipos
            </NavLink>
            <NavLink to="/team-invitations" className={navClass}>
              Mis invitaciones
            </NavLink>
            <NavLink to="/tournaments" className={navClass}>
              Torneos
            </NavLink>
            <NavLink to="/rankings" className={navClass}>Rankings</NavLink>
            <NavLink to="/tournament-enrollments" className={navClass}>Mis inscripciones</NavLink>
            <NavLink to="/rewards" className={navClass}>Recompensas</NavLink>
            <div className="px-3 py-2 text-sm" aria-live="polite">
              <span className="block text-gray-400">Puntos de recompensa</span>
              <span>{balance === null ? '—' : points(balance)}</span>
              {walletError && <button type="button" className="block underline text-red-300" onClick={() => useWalletStore.getState().refresh()}>Reintentar saldo</button>}
            </div>
          </nav>
        </div>

        {/* Sección inferior de la barra lateral con el botón de salida */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 transition text-sm font-medium text-left"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenedor principal: mientras carga la página se muestra el loader */}
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<LoadingScreen fullScreen={false} />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
};

export default MainLayout;