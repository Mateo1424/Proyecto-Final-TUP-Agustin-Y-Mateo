import { lazy, Suspense, useEffect, useRef } from 'react';
import { useNavigate } from '../../routing/navigation.js';
import TournamentsPage from './TournamentsPage.jsx';

const Details = lazy(() => import('./TournamentDetailsPage.jsx'));

export default function TournamentDetailsModal() {
  const dialog = useRef(null);
  const navigate = useNavigate();
  const close = () => navigate('/tournaments', { replace: true });
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => { element.close(); };
  }, []);
  return <>
    <TournamentsPage />
    <dialog ref={dialog} aria-label="Detalles del torneo"
      onCancel={event => { event.preventDefault(); close(); }}
      className="m-auto max-h-[90dvh] w-[min(76rem,94vw)] overflow-y-auto rounded-xl border border-gray-700 bg-[#0d1117] p-0 text-white backdrop:bg-black/75">
      <div className="sticky top-0 z-10 flex justify-end border-b border-gray-800 bg-[#0d1117] p-3">
        <button type="button" onClick={close} className="cursor-pointer rounded-lg border border-gray-600 px-4 py-2 hover:bg-gray-800 focus-visible:outline-2">Cerrar detalles</button>
      </div>
      <Suspense fallback={<p role="status" className="p-6">Cargando detalles...</p>}>
        <Details onClose={close} />
      </Suspense>
    </dialog>
  </>;
}
