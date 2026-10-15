import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../../config';
import LoadingScreen from './LoadingScreen';

const linkBase = 'block px-3 py-2 rounded-lg hover:bg-[#21262d] transition';

// Link resaltado con LED cuando la ruta está activa (/teams también marca /teams/123)
const navClass = ({ isActive }) =>
  `${linkBase} ${isActive ? 'led-nav-active text-white font-semibold' : 'text-purple-300 hover:text-white'}`;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigating, setNavigating] = useState(false);

  // Barra de progreso breve en cada cambio de página
  useEffect(() => {
    setNavigating(true);
    const timer = setTimeout(() => setNavigating(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Pide al backend que borre la cookie de sesión y limpia los datos locales
  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor:', err);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="flex h-screen text-white overflow-hidden">
      {navigating && <div key={location.pathname} className="led-progress" />}

      {/* Sidebar / Barra lateral */}
      <aside className="w-64 bg-[#161b22] border-r border-gray-800 flex flex-col justify-between">
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
            <NavLink to="/tournaments" className={navClass}>
              Torneos
            </NavLink>
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
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default MainLayout;