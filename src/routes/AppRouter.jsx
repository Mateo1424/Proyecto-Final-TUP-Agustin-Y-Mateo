import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import '../theme.css';
import LedBackground from '../components/layout/LedBackground';
import LoadingScreen from '../components/layout/LoadingScreen';
import { getStoredUser, isModerator } from '../utils/Roles';

import MainLayout from '../components/layout/MainLayout';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const UserProfilePage = lazy(() => import('../pages/profile/UserProfilePage'));
const TournamentsPage = lazy(() => import('../pages/Tournaments/TournamentsPage'));
const TournamentDetailPage = lazy(() => import('../pages/Tournaments/TournamentDetailsPage'));
const CreateTournament = lazy(() => import('../pages/Tournaments/CreateTournament'));
const MatchDetailPage = lazy(() => import('../pages/Tournaments/MatchDetailsPage'));
const TeamsPage = lazy(() => import('../pages/team/TeamsPage'));
const CreateTeam = lazy(() => import('../pages/team/CreateTeam'));
const TeamDetailPage = lazy(() => import('../pages/team/TeamDetailpage'));
const Leaderboard = lazy(() => import('../components/layout/Rankings/Leaderboard'));

const ProtectedRoute = () => {
  const user = localStorage.getItem('user');
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const ModeratorRoute = () => {
  return isModerator(getStoredUser()) ? <Outlet /> : <Navigate to="/tournaments" replace />;
};

const PublicOnlyRoute = () => {
  const user = localStorage.getItem('user');
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const AppRouter = () => {
  return (
    <Router>
      <LedBackground />

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/users/:id" element={<UserProfilePage />} />

              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route element={<ModeratorRoute />}>
                <Route path="/tournaments/create" element={<CreateTournament />} />
              </Route>
              <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
              <Route path="/tournaments/:id/matches/:matchId" element={<MatchDetailPage />} />

              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/create" element={<CreateTeam />} />
              <Route path="/teams/:id" element={<TeamDetailPage />} />

              <Route path="/rankings" element={<Leaderboard />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;