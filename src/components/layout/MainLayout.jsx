import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-[#0d1117] text-white overflow-hidden">
      {/* Sidebar / Barra lateral */}
      <aside className="w-64 bg-[#161b22] border-r border-gray-800 flex flex-col">
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

          {/* 🌟 Nuevo enlace agregado para Torneos */}
          <Link 
            to="/tournaments" 
            className="block px-3 py-2 rounded-lg hover:bg-[#21262d] transition text-purple-300 hover:text-white"
          >
            Torneos
          </Link>
        </nav>
      </aside>
      
      {/* Contenedor principal donde se renderizan las páginas dinámicamente */}
      <main className="flex-1 overflow-y-auto bg-[#0d1117]">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;