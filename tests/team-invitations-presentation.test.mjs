import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { Router } from 'wouter';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('invitation inbox presents lifecycle, eligibility and only pending actions', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'invitation-inbox-'));
  const server = await createServer({ cacheDir, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { default: Inbox } = await server.ssrLoadModule('/src/components/teams/TeamInvitationsInbox.jsx');
    const base = { id: 'pending', teamId: 'team', teamName: 'Fénix', senderUsername: 'Capitana', expiresAt: '2099-12-01T12:00:00Z', status: 'Pending' };
    const render = props => renderToStaticMarkup(createElement(Router, { ssrPath: '/team-invitations' }, createElement(Inbox, { invitations: [base], loading: false, busy: '', error: '', success: '', load() {}, onAction() {}, ...props })));
    const html = render();
    assert.match(html, /Mis invitaciones/); assert.match(html, /Fénix/); assert.match(html, /Capitana/);
    assert.match(html, /href="\/teams\/team"/); assert.match(html, /href="\/profile"/);
    assert.match(html, /datetime="2099-12-01T12:00:00Z"/i); assert.match(html, /Pendiente/);
    assert.match(html, /Aceptar invitación de Fénix/); assert.match(html, /Rechazar invitación de Fénix/);
    for (const status of ['Accepted', 'Rejected', 'Cancelled', 'Expired']) {
      const terminal = render({ invitations: [{ ...base, status }] });
      assert.doesNotMatch(terminal, /Aceptar invitación|Rechazar invitación/);
    }
    assert.match(render({ invitations: [{ ...base, expiresAt: '2000-01-01T00:00:00Z' }] }), /Vencida/);
    assert.doesNotMatch(render({ invitations: [{ ...base, expiresAt: '2000-01-01T00:00:00Z' }] }), /Aceptar invitación/);
    const busy = render({ busy: base.id });
    assert.equal((busy.match(/disabled=""/g) || []).length, 3);
    assert.match(busy, /Procesando/);
    assert.match(render({ invitations: [] }), /No tenés invitaciones/);
    assert.match(render({ loading: true }), /role="status"/);
    const failed = render({ error: 'Error del servidor', invitations: [] });
    assert.match(failed, /role="alert"/); assert.match(failed, /Error del servidor/);
    assert.doesNotMatch(failed, /No tenés invitaciones/);
    const accepted = render({ success: 'Te uniste a Fénix.', acceptedTeam: 'team' });
    assert.match(accepted, /role="status"/); assert.match(accepted, /Te uniste a Fénix/); assert.match(accepted, /Ver equipo/);
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
