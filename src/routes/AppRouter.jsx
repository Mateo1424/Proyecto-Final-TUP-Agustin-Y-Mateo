import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts y Páginas
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/profile/ProfilePage';
import TournamentsPage from '../pages/Tournaments/TournamentsPage';
import TournamentDetailPage from '../pages/Tournaments/TournamentDetailsPage';
import CreateTournament from '../pages/Tournaments/CreateTournament';
import TeamsPage from '../pages/team/TeamsPage';
import CreateTeam from '../pages/team/CreateTeam';
import TeamDetailPage from '../pages/team/TeamDetailpage'; 

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
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Rutas de Torneos */}
          <Route path="/tournaments" element={<TournamentsPage />} /> 
          <Route path="/tournaments/create" element={<CreateTournament />} /> 
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} /> 

          {/* Rutas de Equipos */}
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/create" element={<CreateTeam />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} /> {/* Ruta dinámica de detalles del equipo */}
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