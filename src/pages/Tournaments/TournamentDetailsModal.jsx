import { lazy, Suspense, useEffect, useRef } from 'react';
import { useNavigate } from '../../routing/navigation.js';
import TournamentsPage from './TournamentsPage.jsx';
import './tournament-details.css';

const Details = lazy(() => import('./TournamentDetailsPage.jsx'));

export default function TournamentDetailsModal() {
  const dialog = useRef(null);
  const navigate = useNavigate();
  const close = () => navigate('/tournaments', { replace: true });
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => {
      element.close();
      const heading = document.getElementById('tournaments-heading');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    };
  }, []);
  return <>
    <TournamentsPage />
    <dialog ref={dialog} aria-label="Detalles del torneo"
      onCancel={event => { event.preventDefault(); close(); }}
      className="arena-details-dialog">
      <div className="detail-dialog-bar">
        <span>Detalles del torneo</span>
        <button autoFocus type="button" onClick={close} className="arena-button">Cerrar detalles</button>
      </div>
      <Suspense fallback={<p role="status" className="arena-state">Cargando detalles...</p>}>
        <Details onClose={close} />
      </Suspense>
    </dialog>
  </>;
}
