import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadAttempt, beginAttempt, finishAttempt, isDefiniteRejection } from '../src/utils/redemptionAttempt.js';

const storage = () => {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
};
test('un intento incierto conserva producto y clave al recargar y no mezcla usuarios', () => {
  const session = storage();
  const first = beginAttempt(session, 'alice', 'steam-usd-10', () => 'stable-key');
  assert.deepEqual(loadAttempt(session, 'alice'), first);
  assert.deepEqual(beginAttempt(session, 'alice', 'steam-usd-10', () => 'other-key'), first);
  assert.throws(() => beginAttempt(session, 'alice', 'xbox-usd-10'), /pendiente/);
  assert.equal(loadAttempt(session, 'bob'), null);
  finishAttempt(session, 'alice');
  assert.equal(loadAttempt(session, 'alice'), null);
});
test('solo los rechazos definitivos permiten abandonar el intento', () => {
  for (const status of [400, 404, 409]) assert.equal(isDefiniteRejection({ status }), true);
  for (const status of [undefined, 401, 403, 500, 502]) assert.equal(isDefiniteRejection({ status }), false);
});
test('no se envía un gasto si no puede persistirse su clave', () => {
  const broken = { getItem: () => null, setItem: () => { throw new Error('disabled'); } };
  assert.throws(() => beginAttempt(broken, 'alice', 'steam-usd-10'), /guardar/);
});
