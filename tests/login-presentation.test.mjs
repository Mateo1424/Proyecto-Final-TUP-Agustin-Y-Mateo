import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Router } from 'wouter';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('login preserves local and Google access with associated labels and password-manager hints', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'login-view-'));
  const server = await createServer({ cacheDir, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { default: Login } = await server.ssrLoadModule('/src/pages/LoginPage.jsx');
    const html = renderToStaticMarkup(createElement(Router, { ssrPath: '/login' }, createElement(Login)));
    assert.match(html, /<label[^>]*for="login-email"/);
    assert.match(html, /Correo electrónico o usuario/);
    assert.match(html, /id="login-email"[^>]*type="text"/);
    assert.match(html, /<input[^>]*id="login-email"[^>]*autoComplete="username"/);
    assert.match(html, /<label[^>]*for="login-password"/);
    assert.match(html, /<input[^>]*id="login-password"[^>]*autoComplete="current-password"/);
    assert.match(html, /type="password"/); assert.match(html, /type="submit"/);
    assert.match(html, /Continuar con Google/); assert.match(html, /href="\/register"/);
    assert.match(html, /arena-auth/); assert.match(html, /<main/);
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
