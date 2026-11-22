import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Router } from 'wouter';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('personal dashboard shows owned activity, honest states and separate wallet/Elo', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'dashboard-test-'));
  const server = await createServer({ cacheDir, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { ActivityPreview, WalletSummary, EloValue } = await server.ssrLoadModule('/src/components/dashboard/DashboardSections.jsx');
    const render = (Component, props) => renderToStaticMarkup(createElement(Router, { ssrPath: '/dashboard' }, createElement(Component, props)));
    const now = Date.parse('2026-11-21T12:00:00Z');
    const entry = { tournamentId: 'mine', requestId: 'request', title: 'Mi copa', gameName: 'Rocket League', status: 'Pending', tournamentStatus: 'Próximo', startDate: '2026-11-22T12:00:00Z', players: [{ userId: 'me', confirmed: false }] };
    const ready = data => ({ data, loading: false, error: '', refresh() {} });
    const pending = render(ActivityPreview, { kind: 'pending', userId: 'me', now, resource: ready({ items: [entry], hasMore: true }) });
    assert.match(pending, /Mi copa/); assert.match(pending, /Tu confirmación pendiente/);
    assert.match(pending, /href="\/tournament-enrollments"/);
    assert.doesNotMatch(pending, /Void Runners|2,840|71%|Circuito Nocturno/);
    const waiting = render(ActivityPreview, { kind: 'pending', userId: 'me', now, resource: ready({ items: [{ ...entry, players: [{ userId: 'me', confirmed: true }] }] }) });
    assert.match(waiting, /Esperando al equipo/);
    const active = render(ActivityPreview, { kind: 'active', now, resource: ready({ items: [{ ...entry, status: 'Admitted' }, { ...entry, status: 'Admitted', tournamentId: 'closed', title: 'Cerrado oculto', closedAt: '2026-11-20' }, { ...entry, status: 'Admitted', tournamentId: 'cancelled', title: 'Cancelado oculto', tournamentStatus: 'Cancelado' }] }) });
    assert.match(active, /href="\/tournaments\/mine"/); assert.doesNotMatch(active, /Cerrado oculto|Cancelado oculto/);
    const invites = render(ActivityPreview, { kind: 'invitations', now, resource: ready([{ id: 'i', teamName: 'Equipo real', status: 'Pending', expiresAt: '2026-11-22' }, { id: 'expired', teamName: 'Vencido oculto', status: 'Pending', expiresAt: '2026-11-20' }]) });
    assert.match(invites, /Equipo real/); assert.doesNotMatch(invites, /Vencido oculto/);
    assert.match(render(ActivityPreview, { kind: 'active', resource: ready({ items: [] }) }), /No hay torneos/);
    assert.match(render(ActivityPreview, { kind: 'pending', resource: { loading: true } }), /role="status"/);
    const failed = render(ActivityPreview, { kind: 'pending', resource: { error: 'Sin conexión', refresh() {} } });
    assert.match(failed, /Sin conexión/); assert.match(failed, /Reintentar/);
    assert.match(render(WalletSummary, { balance: 750 }), /750 pts/);
    assert.doesNotMatch(render(WalletSummary, { balance: null }), /0 pts/);
    assert.match(render(EloValue, { current: { rating: null } }), /Sin clasificación/);
    const elo = render(EloValue, { current: { rating: 1048, position: 2 } });
    assert.match(elo, /1048/); assert.match(elo, /#2/); assert.doesNotMatch(elo, /pts/);
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
