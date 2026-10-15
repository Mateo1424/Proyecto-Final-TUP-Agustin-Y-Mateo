import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import '../theme.css';
import LedBackground from '../components/layout/LedBackground';
import LoadingScreen from '../components/layout/LoadingScreen';

// El layout se carga normal para que el menú lateral no desaparezca al navegar
import MainLayout from '../components/layout/MainLayout';

// Páginas con carga diferida (lazy loading)
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const UserProfilePage = lazy(() => import('../pages/profile/UserProfilePage'));
const TournamentsPage = lazy(() => import('../pages/Tournaments/TournamentsPage'));
const TournamentDetailPage = lazy(() => import('../pages/Tournaments/TournamentDetailsPage'));
const CreateTournament = lazy(() => import('../pages/Tournaments/CreateTournament'));
const TeamsPage = lazy(() => import('../pages/team/TeamsPage'));
const CreateTeam = lazy(() => import('../pages/team/CreateTeam'));
const TeamDetailPage = lazy(() => import('../pages/team/TeamDetailpage'));

// Si no hay usuario guardado, manda al login.
// La validación real de la sesión la hace el backend con la cookie.
const ProtectedRoute = () => {
  const user = localStorage.getItem('user');
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Si ya hay sesión, evita volver a mostrar login o registro
const PublicOnlyRoute = () => {
  const user = localStorage.getItem('user');
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const AppRouter = () => {
  return (
    <Router>
      {/* Fondo animado que queda detrás de toda la app */}
      <LedBackground />

      {/* Fallback para las páginas fuera del layout (login y registro) */}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Rutas Públicas (Auth) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Rutas Privadas / Con Layout Principal (Sidebar) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/users/:id" element={<UserProfilePage />} />

              {/* Rutas de Torneos */}
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/tournaments/create" element={<CreateTournament />} />
              <Route path="/tournaments/:id" element={<TournamentDetailPage />} />

              {/* Rutas de Equipos */}
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/create" element={<CreateTeam />} />
              <Route path="/teams/:id" element={<TeamDetailPage />} />
            </Route>
          </Route>

          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/register" replace />} />

          {/* Ruta comodín para cualquier URL desconocida */}
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;