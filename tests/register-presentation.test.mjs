import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Router } from 'wouter';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('registration exposes labelled identity, game and password groups with existing access links', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'register-view-'));
  const server = await createServer({ cacheDir, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { default: Register } = await server.ssrLoadModule('/src/pages/RegisterPage.jsx');
    const html = renderToStaticMarkup(createElement(Router, { ssrPath: '/register' }, createElement(Register)));
    for (const field of ['username', 'email', 'game', 'inGameName', 'password', 'confirmPassword']) {
      assert.match(html, new RegExp(`<label[^>]*for="register-${field}"`));
      assert.match(html, new RegExp(`<(input|select)[^>]*id="register-${field}"`));
    }
    assert.equal((html.match(/<fieldset/g) ?? []).length, 3);
    assert.equal((html.match(/autoComplete="new-password"/g) ?? []).length, 2);
    for (const game of ['Valorant', 'CS:GO', 'League of Legends', 'Rocket League']) assert.ok(html.includes(`value="${game}"`));
    assert.match(html, /href="\/login"/); assert.match(html, /Registrarse con Google/);
    assert.match(html, /arena-auth/); assert.match(html, /type="submit"/);
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
