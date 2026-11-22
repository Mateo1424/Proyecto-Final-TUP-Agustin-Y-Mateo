import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Router } from 'wouter';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('public profile shares presentation without owner controls, email or private movements', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'public-profile-'));
  const server = await createServer({ cacheDir, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  const previousFetch = globalThis.fetch;
  try {
    const { PublicProfileContent } = await server.ssrLoadModule('/src/pages/profile/UserProfilePage.jsx');
    const profile = { id: 'other', username: 'Otro jugador', email: 'private@example.com', role: 'Moderator', stats: { matchesPlayed: 0, wins: 0, losses: 0, draws: 0, winrate: 0 }, games: [{ gameName: 'Rocket League', inGameName: 'Player', rank: 'Oro' }] };
    const render = data => renderToStaticMarkup(createElement(Router, { ssrPath: '/users/other' }, createElement(PublicProfileContent, { profile: data, teams: { data: [], loading: false } })));
    const html = render(profile);
    assert.match(html, /Otro jugador/); assert.match(html, /Rocket League/);
    assert.doesNotMatch(html, /Editar avatar|Editar estadísticas|Vincular juego|Eliminar Rocket League|private@example.com|Recompensas y saldo|Crear mi equipo/);
    assert.match(html, /Clasificación Elo/); assert.match(html, /arena-profile-elo/);
    assert.match(render({ ...profile, games: [] }), /Este jugador no tiene videojuegos vinculados/);
    const { getPlayerProfile } = await server.ssrLoadModule('/src/api/profile.js');
    const calls = [];
    globalThis.fetch = async (url, options) => { calls.push({ url, ...options }); return new Response(JSON.stringify(profile)); };
    await getPlayerProfile('other/id');
    assert.ok(calls[0].url.endsWith('/profile/other%2Fid')); assert.equal(calls[0].credentials, 'include'); assert.equal(calls[0].body, undefined);
    globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Usuario no encontrado.' }), { status: 404 });
    await assert.rejects(getPlayerProfile('missing'), error => error.status === 404 && error.message === 'Usuario no encontrado.');
  } finally { globalThis.fetch = previousFetch; await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
