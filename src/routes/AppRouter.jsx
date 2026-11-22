import { Suspense, lazy } from 'react';
import { Router, Switch, Route, Redirect } from 'wouter';
import '../theme.css';
import LoadingScreen from '../components/layout/LoadingScreen';
import { isModerator } from '../utils/Roles';
import { useSessionStore } from '../store/session';
import MainLayout from '../components/layout/MainLayout';
import SessionRoute from '../components/SessionRoute';
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const UserProfilePage = lazy(() => import('../pages/profile/UserProfilePage'));
const TournamentsPage = lazy(() => import('../pages/Tournaments/TournamentsPage'));
const TournamentDetailPage = lazy(() => import('../pages/Tournaments/TournamentDetailsModal'));
const CreateTournament = lazy(() => import('../pages/Tournaments/CreateTournament'));
const MatchDetailPage = lazy(() => import('../pages/Tournaments/MatchDetailsPage'));
const TeamsPage = lazy(() => import('../pages/team/TeamsPage'));
const TeamInvitationsPage = lazy(() => import('../pages/team/TeamInvitationsPage'));
const CreateTeam = lazy(() => import('../pages/team/CreateTeam'));
const TeamDetailPage = lazy(() => import('../pages/team/TeamDetailpage'));
const Leaderboard = lazy(() => import('../components/layout/Rankings/Leaderboard'));
const RewardsPage = lazy(() => import('../pages/rewards/RewardsPage'));
const MyEnrollmentsPage = lazy(() => import('../pages/Tournaments/MyEnrollmentsPage'));
function AuthorizedContent({ children, staff }) {
  const user = useSessionStore(state => state.user);
  return staff && !isModerator(user) ? <Redirect to="/tournaments" replace /> : <MainLayout>{children}</MainLayout>;
}
function Private({ children, staff = false }) {
  return <SessionRoute authenticated><AuthorizedContent staff={staff}>{children}</AuthorizedContent></SessionRoute>;
}
export default function AppRouter() {
  return <Router><Suspense fallback={<LoadingScreen />}><Switch>
    <Route path="/login"><SessionRoute authenticated={false}><LoginPage /></SessionRoute></Route>
    <Route path="/register"><SessionRoute authenticated={false}><RegisterPage /></SessionRoute></Route>
    <Route path="/dashboard"><Private><DashboardPage /></Private></Route>
    <Route path="/profile"><Private><ProfilePage /></Private></Route>
    <Route path="/users/:id"><Private><UserProfilePage /></Private></Route>
    <Route path="/tournaments/create"><Private staff><CreateTournament /></Private></Route>
    <Route path="/tournaments/:id/matches/:matchId"><Private><MatchDetailPage /></Private></Route>
    <Route path="/tournaments/:id"><Private><TournamentDetailPage /></Private></Route>
    <Route path="/tournaments"><Private><TournamentsPage /></Private></Route>
    <Route path="/tournament-enrollments"><Private><MyEnrollmentsPage /></Private></Route>
    <Route path="/team-invitations"><Private><TeamInvitationsPage /></Private></Route>
    <Route path="/teams/create"><Private><CreateTeam /></Private></Route>
    <Route path="/teams/:id"><Private><TeamDetailPage /></Private></Route>
    <Route path="/teams"><Private><TeamsPage /></Private></Route>
    <Route path="/rankings"><Private><Leaderboard /></Private></Route>
    <Route path="/rewards"><Private><RewardsPage /></Private></Route>
    <Route><Redirect to="/register" replace /></Route>
  </Switch></Suspense></Router>;
}
