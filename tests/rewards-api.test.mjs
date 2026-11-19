import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';
import { client } from '../src/api/client.js';
import { getCatalog, getBalance, getMovements, getRedemptions, redeemReward } from '../src/api/rewards.js';
import { beginAttempt, finishAttempt, loadAttempt, isDefiniteRejection } from '../src/utils/redemptionAttempt.js';

test('catálogo y paginación propia usan cookie y parámetros sin enviar identidad', async () => {
  const original = client.defaults.adapter;
  const calls = [];
  client.defaults.adapter = async config => { calls.push(config); return { data: { items: [] }, status: 200, headers: {}, config }; };
  try {
    await getCatalog(); await getBalance(); await getMovements(2); await getRedemptions(3);
    assert.deepEqual(calls.map(call => call.url), ['/rewards/catalog', '/users/me/points', '/users/me/points/history', '/rewards/redemptions']);
    assert.ok(calls.every(call => call.withCredentials === true && call.data === undefined));
    assert.deepEqual(calls[2].params, { page: 2, pageSize: 20 });
    assert.deepEqual(calls[3].params, { page: 3, pageSize: 20 });
  } finally { client.defaults.adapter = original; }
});

test('un timeout después del gasto recupera el recibo con la misma clave tras recargar', async () => {
  const original = client.defaults.adapter;
  const entries = new Map();
  const session = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
  let saved;
  let debits = 0;
  client.defaults.adapter = async config => {
    assert.equal(config.withCredentials, true);
    const payload = JSON.parse(config.data);
    assert.deepEqual(Object.keys(payload).sort(), ['idempotencyKey', 'productId']);
    if (!saved) { saved = { id: 'receipt', code: 'DEMO-STEAM-123', product: { id: payload.productId }, costPoints: 20000 }; debits++; throw new AxiosError('timeout', 'ECONNABORTED', config); }
    assert.equal(payload.idempotencyKey, 'same-after-reload');
    return { data: saved, status: 200, headers: {}, config };
  };
  try {
    const first = beginAttempt(session, 'alice', 'steam-usd-10', () => 'same-after-reload');
    await assert.rejects(redeemReward(first.productId, first.key), error => !isDefiniteRejection(error));
    const reloaded = loadAttempt(session, 'alice');
    assert.deepEqual(await redeemReward(reloaded.productId, reloaded.key), saved);
    assert.equal(debits, 1);
    finishAttempt(session, 'alice');
    assert.equal(loadAttempt(session, 'alice'), null);
  } finally { client.defaults.adapter = original; }
});

test('saldo insuficiente conserva código y mensaje de rechazo, sin éxito inventado', async () => {
  const original = client.defaults.adapter;
  client.defaults.adapter = async config => { throw new AxiosError('conflict', 'ERR_BAD_REQUEST', config, null, { status: 409, data: { code: 'insufficient_funds', message: 'Saldo insuficiente.' }, config, headers: {} }); };
  try { await assert.rejects(redeemReward('steam-usd-10', 'key'), error => error.status === 409 && error.code === 'insufficient_funds' && error.message === 'Saldo insuficiente.' && isDefiniteRejection(error)); }
  finally { client.defaults.adapter = original; }
});
