import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const MainLayout = () => {
  const navigate = useNavigate();

  // Maneja la limpieza de credenciales y redirección al login
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-white overflow-hidden">
      {/* Sidebar / Barra lateral */}
      <aside className="w-64 bg-[#161b22] border-r border-gray-800 flex flex-col justify-between">
        <div>
          <div className="p-5 font-bold text-xl tracking-wider text-purple-400">
            NEXUS ARENA
          </div>
          <nav className="flex-1 px-4 space-y-2 text-gray-300">
            <Link 
              to="/dashboard" 
              className="block px-3 py-2 rounded-lg hover:bg-[#21262d] transition"
            >
              Inicio
            </Link>
            
            <Link 
              to="/profile" 
              className="block px-3 py-2 rounded-lg hover:bg-[#21262d] transition text-purple-300 hover:text-white"
            >
              Mi Perfil
            </Link>

            <Link 
              to="/teams" 
              className="block px-3 py-2 rounded-lg hover:bg-[#21262d] transition text-purple-300 hover:text-white font-semibold"
            >
              Equipos
            </Link>

            <Link 
              to="/tournaments" 
              className="block px-3 py-2 rounded-lg hover:bg-[#21262d] transition text-purple-300 hover:text-white"
            >
              Torneos
            </Link>
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
      
      {/* Contenedor principal donde se renderizan las páginas dinámicamente */}
      <main className="flex-1 overflow-y-auto bg-[#0d1117]">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;