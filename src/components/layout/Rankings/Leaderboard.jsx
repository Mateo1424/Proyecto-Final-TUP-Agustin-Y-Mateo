import { useCallback, useState } from 'react';
import { getRankings } from '../../../api/rankings';
import { useEloRequest } from '../../../hooks/useEloRequest';
import { getStoredUser } from '../../../utils/Roles';
import RankingsView from '../../rankings/RankingsView';

export default function Leaderboard() {
  const [kind, setKind] = useState('players');
  const [game, setGame] = useState('Valorant');
  const [page, setPage] = useState(1);
  const load = useCallback(signal => getRankings(kind, game, page, signal), [kind, game, page]);
  const { data, loading, error, refresh } = useEloRequest(load, `${kind}:${game}:${page}`);
  const items = data?.items ?? [];
  const currentUser = getStoredUser();
  return <RankingsView kind={kind} game={game} page={page} items={items} currentUserId={currentUser?.id} loading={loading} error={error} refresh={refresh} onKind={value => { setKind(value); setPage(1); }} onGame={value => { setGame(value); setPage(1); }} onPage={setPage} />;
}
