import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchCurrentUser } from '../src/utils/session.js';

test('recupera el usuario usando cookies, sin cache y con cancelación', async (t) => {
  const user = { id: '123', username: 'Jugador', role: 'User' };
  const controller = new AbortController();
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://localhost:7039/api/auth/me');
    assert.equal(options.credentials, 'include');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.signal, controller.signal);
    return Response.json({ user });
  });
  assert.deepEqual(await fetchCurrentUser(controller.signal), user);
});

test('una cookie ausente o vencida produce una sesión anónima', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 401 }));
  assert.equal(await fetchCurrentUser(), null);
});

test('un error del servidor no se interpreta como cierre de sesión', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 500 }));
  await assert.rejects(fetchCurrentUser(), /No se pudo verificar/);
});

test('una respuesta incompleta no autentica al usuario', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ user: {} }));
  await assert.rejects(fetchCurrentUser(), /no es válida/);
});

test('un fallo de red se propaga para permitir reintentar', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Network error'); });
  await assert.rejects(fetchCurrentUser(), /Network error/);
});
