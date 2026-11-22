import { useEffect, useState } from 'react';
import { Link } from '../../routing/navigation.js';
import { request, isAborted } from '../../api/client.js';
import { getStoredUser, isModerator } from '../../utils/Roles';
import { visibleTournaments } from '../../utils/visibleTournaments.js';
import TournamentCard from '../../components/tournaments/TournamentCard.jsx';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const canCreate = isModerator(getStoredUser());
  useEffect(() => {
    const abort = new AbortController();
    request('/tournaments', { signal: abort.signal }).then(data => {
      if (!abort.signal.aborted) { setTournaments(visibleTournaments(data)); setLoading(false); }
    }).catch(failure => { if (!abort.signal.aborted && !isAborted(failure)) { setError(failure.message); setLoading(false); } });
    return () => abort.abort();
  }, [revision]);
  function retry() { setLoading(true); setError(''); setRevision(value => value + 1); }
  return <section className="arena-tournaments" aria-labelledby="tournaments-heading">
    <header className="arena-page-heading"><div><p className="arena-eyebrow">Elegí tu próxima competencia</p><h1 id="tournaments-heading" className="arena-title">Torneos</h1><p className="arena-muted m-0 max-w-xl">Consultá el juego, los cupos y la entrada antes de inscribirte.</p></div>{canCreate && <Link to="/tournaments/create" className="arena-button arena-button-primary">Crear torneo</Link>}</header>
    {loading ? <p role="status" className="arena-state">Cargando torneos…</p> : error ? <div role="alert" className="arena-state"><p>{error}</p><button onClick={retry} className="arena-button mt-4">Reintentar</button></div> : tournaments.length === 0 ? <div className="arena-state"><h2 className="mb-2 text-xl font-bold text-white">Todavía no hay torneos disponibles</h2><p className="m-0">Cuando se publique una competencia, podrás consultar sus detalles acá.</p></div> : <div className="arena-tournament-grid">{tournaments.map(tournament => <TournamentCard key={tournament.id} tournament={tournament} />)}</div>}
  </section>;
}
