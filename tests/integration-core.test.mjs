import { test } from 'node:test';
import assert from 'node:assert/strict';
import { client, request } from '../src/api/client.js';
import { useWalletStore } from '../src/store/wallet.js';
import { loginSchema, registerSchema } from '../src/schemas/auth.js';
import { getCurrentElo, getRankings } from '../src/api/rankings.js';
const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
test('Axios uses cookies and forwards cancellable game-specific requests', async t => {
  const original = client.defaults.adapter; t.after(() => { client.defaults.adapter = original; });
  const signal = new AbortController().signal; const seen = [];
  client.defaults.adapter = async config => { seen.push(config); return reply(config, { items: [] }); };
  await getRankings('teams', 'Valorant', 2, signal); await getCurrentElo('players', 'actor', 'CS:GO', signal);
  assert.equal(seen[0].withCredentials, true); assert.equal(seen[0].params.gameName, 'Valorant'); assert.equal(seen[0].params.page, 2); assert.equal(seen[0].signal, signal);
  assert.equal(seen[1].url, '/rankings/players/actor'); assert.equal(seen[1].params.gameName, 'CS:GO');
});
test('stale wallet responses and responses after logout cannot restore an old balance', async t => {
  const original = client.defaults.adapter; t.after(() => { client.defaults.adapter = original; useWalletStore.getState().reset(); });
  const pending = []; client.defaults.adapter = config => new Promise(resolve => pending.push(data => resolve(reply(config, data))));
  const first = useWalletStore.getState().refresh(); const next = useWalletStore.getState().refresh();
  pending[1]({ balance: 750 }); await next; pending[0]({ balance: 1000 }); await first;
  assert.equal(useWalletStore.getState().balance, 750);
  const late = useWalletStore.getState().refresh(); useWalletStore.getState().reset(); pending[2]({ balance: 22500 }); await late;
  assert.equal(useWalletStore.getState().balance, null);
});
test('auth schemas match backend limits and report confirmation on its field', () => {
  assert.equal(loginSchema.safeParse({ email: 'bad', password: 'short' }).success, false);
  const result = registerSchema.safeParse({ username: 'player', email: 'player@example.invalid', password: 'password8', confirmPassword: 'different', game: 'Valorant', inGameName: 'Player#1' });
  assert.equal(result.success, false); assert.deepEqual(result.error.issues[0].path, ['confirmPassword']);
  assert.equal(registerSchema.safeParse({ username: 'player', email: 'player@example.invalid', password: 'password8', confirmPassword: 'password8', game: 'CS:GO', inGameName: 'Player' }).success, true);
});
test('API failures preserve machine error codes', async t => {
  const original = client.defaults.adapter; t.after(() => { client.defaults.adapter = original; });
  client.defaults.adapter = async () => { throw { response: { status: 409, data: { code: 'balance_unavailable', message: 'Saldo insuficiente.' } } }; };
  await assert.rejects(request('/rewards/redemptions'), error => error.code === 'balance_unavailable' && error.status === 409);
});
