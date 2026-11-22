import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Router } from 'wouter';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('prototype layout keeps destinations and cards expose real accessible detail links', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'arena-layout-'));
  const server = await createServer({ cacheDir, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { default: Layout } = await server.ssrLoadModule('/src/components/layout/MainLayout.jsx');
    const { default: Card } = await server.ssrLoadModule('/src/components/tournaments/TournamentCard.jsx');
    const render = child => renderToStaticMarkup(createElement(Router, { ssrPath: '/tournaments' }, child));
    const layout = render(createElement(Layout, null, 'Page content'));
    for (const path of ['dashboard','profile','teams','team-invitations','tournaments','tournament-enrollments','rankings','rewards']) assert.ok(layout.includes(`href="/${path}"`), path);
    assert.match(layout, /aria-expanded="false"/); assert.match(layout, /aria-controls="arena-navigation"/);
    assert.match(layout, /Saltar al contenido/); assert.match(layout, /Page content/);
    assert.match(layout, /<header[^>]*>[\s\S]*<nav[^>]*aria-label="Navegación principal"[\s\S]*<\/header>/);
    assert.doesNotMatch(layout, /<aside|arena-sidebar/);
    assert.match(layout, /aria-current="page"[^>]*>Torneos/);
    const event = { id: 'abc', title: 'Copa <real>', gameName: 'Rocket League', status: 'Próximo', entryPoints: 250, prizePool: 2000, maxParticipants: 8, participants: [], startDate: 'invalid' };
    const card = render(createElement(Card, { tournament: event }));
    assert.match(card, /href="\/tournaments\/abc"/); assert.match(card, /Ver detalles de Copa &lt;real&gt;/);
    assert.match(card, /250 pts/); assert.match(card, /2.000 pts/); assert.match(card, /Fecha sin informar/); assert.doesNotMatch(card, /<img/);
    const free = render(createElement(Card, { tournament: { ...event, isFree: true, bannerUrl: '/banner.jpg' } }));
    assert.match(free, /Gratis/); assert.match(free, /Por participación válida/); assert.match(free, /width="640"/);
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true, maxRetries: 5 }); }
});
