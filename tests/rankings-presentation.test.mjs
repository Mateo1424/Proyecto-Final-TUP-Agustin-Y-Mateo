import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { Router } from 'wouter';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('ranking presentation preserves filters, positions, destinations and separate Elo', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'ranking-presentation-'));
  const server = await createServer({ cacheDir, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { default: View } = await server.ssrLoadModule('/src/components/rankings/RankingsView.jsx');
    const base = { kind: 'players', game: 'Valorant', page: 3, loading: false, error: '', currentUserId: 'me', items: [{ entityId: 'me', name: 'Mi cuenta', rating: 1234, matchesPlayed: 4, matchesWon: 3, matchesLost: 1, points: 999999 }, { entityId: 'other', name: 'Otra cuenta', rating: 1100, matchesPlayed: 0, matchesWon: 0, matchesLost: 0 }], refresh() {}, onKind() {}, onGame() {}, onPage() {} };
    const render = props => renderToStaticMarkup(createElement(Router, { ssrPath: '/rankings' }, createElement(View, { ...base, ...props })));
    const html = render();
    assert.match(html, /<h1[^>]*>Rankings<\/h1>/);
    assert.match(html, /aria-label="Tipo de clasificación"/); assert.match(html, /aria-pressed="true"/);
    assert.match(html, /for="rankings-game"/); assert.match(html, /id="rankings-game"/);
    for (const game of ['League of Legends', 'Valorant', 'CS:GO', 'Rocket League']) assert.ok(html.includes(game));
    assert.match(html, /href="\/profile"/); assert.match(html, /href="\/users\/other"/);
    assert.match(html, />41</); assert.match(html, />42</); assert.match(html, /75%/); assert.match(html, /0%/);
    assert.match(html, /1234/); assert.doesNotMatch(html, /999999|pts/);
    assert.match(html, /Página 3/); assert.match(html, /ranking-table/);
    const teams = render({ kind: 'teams', items: [{ ...base.items[0], entityId: 'team' }] });
    assert.match(teams, /href="\/teams\/team"/); assert.doesNotMatch(teams, />Tú</);
    const empty = render({ items: [] }); assert.match(empty, /No hay registros/); assert.doesNotMatch(empty, /<tbody|>41</);
    const unrated = render({ items: [{ ...base.items[0], rating: null }] }); assert.match(unrated, /Sin clasificación/); assert.doesNotMatch(unrated, /1234/);
    const loading = render({ loading: true }); assert.match(loading, /role="status"/); assert.doesNotMatch(loading, /Mi cuenta/);
    const error = render({ error: 'Sin conexión' }); assert.match(error, /role="alert"/); assert.match(error, /Reintentar/); assert.doesNotMatch(error, /Mi cuenta/);
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
