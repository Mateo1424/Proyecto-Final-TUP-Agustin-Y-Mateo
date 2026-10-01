import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts y Páginas
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/profile/ProfilePage'; // <--- 1. Importamos el componente de perfil

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas (Auth) */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Privadas / Con Layout Principal (Sidebar) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} /> {/* <--- 2. Agregamos la ruta protegida */}
        </Route>

        {/* Redirección inicial: Empieza obligatoriamente en el Registro */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* Ruta comodín para cualquier URL desconocida */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;