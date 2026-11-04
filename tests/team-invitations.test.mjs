import assert from 'node:assert/strict';
import { test } from 'node:test';
import { invitationStatus, teamRequest } from '../src/utils/teamInvitations.js';

test('una invitación vencida no ofrece acciones aunque el estado aún sea Pending', () => {
  const now = Date.parse('2026-11-03T12:00:00Z');
  assert.equal(invitationStatus({ status: 'Pending', expiresAt: '2026-11-03T12:00:00Z' }, now), 'Expired');
  assert.equal(invitationStatus({ status: 'Pending', expiresAt: '2026-11-04T12:00:00Z' }, now), 'Pending');
  for (const status of ['Accepted', 'Rejected', 'Cancelled', 'Expired']) {
    assert.equal(invitationStatus({ status, expiresAt: '2026-01-01T00:00:00Z' }, now), status);
  }
});

test('enviar una invitación envía sólo el destinatario y usa la cookie de sesión', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://localhost:7039/api/teams/team/invitations');
    assert.equal(options.credentials, 'include');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { recipientId: 'recipient' });
    return Response.json({ id: 'invitation', status: 'Pending' });
  });
  assert.equal((await teamRequest('/teams/team/invitations', { method: 'POST', body: { recipientId: 'recipient' } })).status, 'Pending');
});

test('aceptar no confía en un identificador propio enviado desde el cliente', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://localhost:7039/api/team-invitations/invitation/accept');
    assert.equal(options.method, 'POST');
    assert.equal(options.body, undefined);
    return new Response(null, { status: 204 });
  });
  assert.equal(await teamRequest('/team-invitations/invitation/accept', { method: 'POST' }), null);
});

test('permisos, duplicados y vencimiento preservan el mensaje de la API', async (t) => {
  for (const status of [403, 409, 410]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json({ message: `Error ${status}` }, { status }));
    await assert.rejects(teamRequest('/team-invitations/id/accept', { method: 'POST' }), new RegExp(`Error ${status}`));
    t.mock.restoreAll();
  }
});

test('sesión vencida y errores sin JSON siguen siendo visibles', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 401 }));
  await assert.rejects(teamRequest('/team-invitations'), /sesión expiró/);
  t.mock.restoreAll();
  t.mock.method(globalThis, 'fetch', async () => new Response('Unavailable', { status: 503 }));
  await assert.rejects(teamRequest('/team-invitations'), /503/);
});
