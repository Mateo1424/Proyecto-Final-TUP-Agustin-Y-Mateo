import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Router, Route } from 'wouter';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('tournament detail keeps null data behind its loading boundary and exposes a dialog close action', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'tournament-loading-'));
  const server = await createServer({ cacheDir, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  try {
    const { default: Details } = await server.ssrLoadModule('/src/pages/Tournaments/TournamentDetailsPage.jsx');
    const { default: Modal } = await server.ssrLoadModule('/src/pages/Tournaments/TournamentDetailsModal.jsx');
    const render = component => renderToStaticMarkup(createElement(Router, { ssrPath: '/tournaments/fixture' }, createElement(Route, { path: '/tournaments/:id' }, createElement(component))));
    assert.match(render(Details), /Cargando detalles/);
    const html = render(Modal);
    assert.match(html, /<dialog/);
    assert.match(html, /Detalles del torneo/);
    assert.match(html, /Cerrar detalles/);
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true, maxRetries: 5 }); }
});
