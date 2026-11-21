import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visibleTournaments } from '../src/utils/visibleTournaments.js';

test('list hides cancelled tournaments while preserving other statuses and order', () => {
  const tournaments = ['Próximo', 'Cancelado', 'En curso', 'Finalizado'].map((status, id) => ({ id, status }));
  assert.deepEqual(visibleTournaments(tournaments), [tournaments[0], tournaments[2], tournaments[3]]);
  assert.equal(tournaments.length, 4);
  assert.deepEqual(visibleTournaments([{ status: 'Cancelado' }]), []);
});
