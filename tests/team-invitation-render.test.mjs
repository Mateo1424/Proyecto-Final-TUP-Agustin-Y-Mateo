import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Render the actual JSX without adding a DOM or test framework dependency.
test('los controles renderizados respetan destinatario, capitán y estados terminales', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'team-render-'));
  const server = await createServer({
    cacheDir,
    optimizeDeps: { noDiscovery: true, include: [] },
    root: fileURLToPath(new URL('..', import.meta.url)),
    configFile: false,
    server: { middlewareMode: true, watch: null, hmr: false, ws: false },
    appType: 'custom',
  });
  try {
    const { default: InvitationList } = await server.ssrLoadModule('/src/components/team/InvitationList.jsx');
    const invitation = {
      id: 'invitation', teamId: 'team', teamName: 'Equipo de prueba',
      senderUsername: 'Capitán', recipientUsername: 'Jugador',
      status: 'Pending', expiresAt: '2099-01-01T00:00:00Z',
    };
    function render(overrides = {}, sent = false, busy = '') {
      return renderToStaticMarkup(createElement(MemoryRouter, null,
        createElement(InvitationList, { invitations: [{ ...invitation, ...overrides }], sent, busy, onAction() {} })));
    }
    const received = render();
    assert.match(received, /Aceptar/);
    assert.match(received, /Rechazar/);
    assert.doesNotMatch(received, /Cancelar invitación/);
    const sent = render({}, true);
    assert.match(sent, /Cancelar invitación/);
    assert.doesNotMatch(sent, /Aceptar|Rechazar/);
    for (const status of ['Accepted', 'Rejected', 'Cancelled', 'Expired']) {
      assert.doesNotMatch(render({ status }), /<button/);
    }
    assert.doesNotMatch(render({ expiresAt: '2020-01-01T00:00:00Z' }), /<button/);
    assert.match(render({}, false, 'invitation'), /disabled=""/);
    assert.match(received, /href="\/teams\/team"/);
  } finally {
    await server.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
});
