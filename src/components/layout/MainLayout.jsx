import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from '../../routing/navigation';
import { useWalletStore } from '../../store/wallet';
import { useSessionStore } from '../../store/session';
import { points } from '../../utils/format';
import { apiFetch } from '../../config';
import LoadingScreen from './LoadingScreen';
import './arena.css';

const destinations = [['/dashboard','Inicio'],['/profile','Mi perfil'],['/teams','Equipos'],['/team-invitations','Mis invitaciones'],['/tournaments','Torneos'],['/tournament-enrollments','Mis inscripciones'],['/rankings','Rankings'],['/rewards','Recompensas']];

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [leaving, setLeaving] = useState(false);
  const menuButton = useRef(null);
  const balance = useWalletStore(state => state.balance);
  const walletError = useWalletStore(state => state.error);
  useEffect(() => {
    const refresh = () => { if (!document.hidden) void useWalletStore.getState().refresh(); };
    refresh(); window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  useEffect(() => {
    if (!open) return;
    const escape = event => { if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);
  async function logout() {
    if (leaving) return;
    setLeaving(true); setLogoutError('');
    try {
      const response = await apiFetch('/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('No se pudo cerrar la sesión. Volvé a intentarlo.');
      useSessionStore.getState().accept(null); navigate('/login');
    } catch { setLogoutError('No se pudo cerrar la sesión. Volvé a intentarlo.'); setLeaving(false); }
  }
  return <div className="arena-shell">
    <a className="arena-skip" href="#arena-content">Saltar al contenido</a>
    <header className="arena-header">
      <div className="arena-header-row">
      <Link to="/dashboard" className="arena-brand" aria-label="Nexus Arena, inicio"><span className="arena-mark" aria-hidden="true">N</span><span>NEXUS <span className="arena-muted">ARENA</span></span></Link>
      <div className="arena-header-actions">
        <div className="arena-header-wallet" aria-live="polite"><span className="arena-label">Puntos de recompensa</span><strong>{balance === null ? 'Sin consultar' : points(balance)}</strong></div>
        <button ref={menuButton} type="button" className="arena-menu-button arena-button" aria-expanded={open} aria-controls="arena-navigation" onClick={() => setOpen(value => !value)}>{open ? 'Cerrar menú' : 'Menú'}</button>
      </div>
      </div>
      <div id="arena-navigation" className={`arena-navigation ${open ? 'is-open' : ''}`}>
        <nav aria-label="Navegación principal" className="arena-nav-links">
          {destinations.map(([to,label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({isActive}) => `arena-nav-link ${isActive ? 'is-active' : ''}`}>{label}</NavLink>)}
        </nav>
        <div className="arena-account">
          {walletError && <div role="alert" className="mb-4 text-sm"><p>No se pudo actualizar el saldo.</p><button className="arena-text-action" onClick={() => useWalletStore.getState().refresh()}>Reintentar saldo</button></div>}
          {logoutError && <p role="alert" className="mb-3 text-sm">{logoutError}</p>}
          <button type="button" disabled={leaving} onClick={logout} className="arena-text-action">{leaving ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>
        </div>
      </div>
    </header>
      <main id="arena-content" tabIndex={-1} className="arena-content"><Suspense fallback={<LoadingScreen fullScreen={false} />}>{children}</Suspense></main>
  </div>;
}
