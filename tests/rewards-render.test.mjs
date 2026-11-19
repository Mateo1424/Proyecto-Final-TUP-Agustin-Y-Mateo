import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('componentes reales muestran carga/error/vacío, costo confirmado y código ficticio', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'rewards-render-'));
  const server = await createServer({ root: fileURLToPath(new URL('..', import.meta.url)), cacheDir, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { Receipt, DataState } = await server.ssrLoadModule('/src/components/rewards/RewardLists.jsx');
    const { default: Confirmation } = await server.ssrLoadModule('/src/components/rewards/RewardConfirmation.jsx');
    const product = { id: 'steam-usd-10', product: 'Steam Wallet', platform: 'Steam', region: 'US', currency: 'USD', faceValue: 10, costPoints: 20000, available: true, compatibility: 'US wallet' };
    const render = (Component, props) => renderToStaticMarkup(createElement(Component, props));
    assert.match(render(DataState, { loading: true }), /Cargando/);
    assert.match(render(DataState, { error: 'Sin conexión', reload() {} }), /Sin conexión.*Reintentar/);
    assert.match(render(DataState, { empty: true }), /Todavía no hay registros/);
    const receipt = render(Receipt, { receipt: { id: 'receipt-id', code: 'DEMO-STEAM-TEST', product, costPoints: 20000, createdAt: '2026-11-19T12:00:00Z' } });
    assert.match(receipt, /No funciona en ninguna plataforma/);
    assert.match(receipt, /DEMO-STEAM-TEST/); assert.match(receipt, /Copiar código de prueba/); assert.match(receipt, /20.000 pts/);
    const confirm = render(Confirmation, { product, balance: 22500 });
    assert.match(confirm, /2.500 pts/); assert.match(confirm, /Confirmar y gastar puntos/);
    assert.match(render(Confirmation, { product, balance: 10 }), /No tenés suficientes puntos/);
    const replay = render(Confirmation, { product, balance: 10, pending: { productId: product.id } });
    assert.match(replay, /Recuperar comprobante/); assert.doesNotMatch(replay, /No tenés suficientes/);
    const retired = render(Confirmation, { product: { ...product, faceValue: null, costPoints: null, available: false }, balance: 0, pending: { productId: product.id } });
    assert.match(retired, /Recuperar comprobante/); assert.doesNotMatch(retired, /Costo del catálogo/); assert.doesNotMatch(retired, /USD/);
  } finally { await server.close(); console.log(`Scratch for parent cleanup: ${cacheDir}`); }
});
