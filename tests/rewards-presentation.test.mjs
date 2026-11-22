import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Router } from 'wouter';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('rewards presentation retains costs, compatibility, eligibility and fictitious codes', async () => {
  const cacheDir=await mkdtemp(join(tmpdir(),'rewards-presentation-'));
  const server=await createServer({cacheDir,configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,watch:null,hmr:false,ws:false},appType:'custom'});
  try {
    const {default:Catalog}=await server.ssrLoadModule('/src/components/rewards/RewardCatalog.jsx');
    const {Receipt,MovementRow}=await server.ssrLoadModule('/src/components/rewards/RewardLists.jsx');
    const product={id:'test-us',platform:'Steam',product:'Steam Wallet',region:'US',currency:'USD',faceValue:10,costPoints:20000,available:true,compatibility:'Sólo cuentas US',sourceUrl:'https://example.com/product'};
    const render=(Component,props)=>renderToStaticMarkup(createElement(Router,{ssrPath:'/rewards'},createElement(Component,props)));
    const html=render(Catalog,{items:[product],balance:22500});
    assert.match(html,/Steam Wallet/);assert.match(html,/Sólo cuentas US/);assert.match(html,/20.000 pts/);assert.match(html,/USD/);assert.match(html,/href="https:\/\/example.com\/product"/);
    assert.match(html,/Canjear puntos/);assert.doesNotMatch(html,/disabled=""/);
    for(const props of [{balance:null},{balance:10},{pending:{productId:'other'}},{storageError:'Almacenamiento no disponible'},{busy:true}])assert.match(render(Catalog,{items:[product],balance:22500,...props}),/disabled=""/);
    assert.match(render(Catalog,{items:[{...product,available:false,unavailableReason:'Sin stock'}],balance:22500}),/Sin stock/);
    assert.match(render(Catalog,{items:[product],balance:10}),/Puntos insuficientes/);
    const receipt=render(Receipt,{receipt:{id:'receipt-long-reference',product,code:'DEMO-TEST-ONLY',costPoints:20000,createdAt:'2026-11-22T12:00:00Z'}});
    assert.match(receipt,/No funciona en ninguna plataforma/);assert.match(receipt,/Copiar código de prueba/);assert.match(receipt,/DEMO-TEST-ONLY/);assert.match(receipt,/receipt-long-reference/);assert.match(receipt,/reward-code/);
    const item={reason:'tournament_entry',reference:'6aff5cd8b91da39b6c63319d',amount:-250,createdAt:'2026-11-22T12:00:00Z'};
    assert.match(render(MovementRow,{item}),/href="\/tournaments\/6aff5cd8b91da39b6c63319d"/);
    assert.match(render(MovementRow,{item:{...item,reason:'tournament_prize',amount:1000}}),/\+1.000 pts/);
    for(const reason of ['refund','welcome','reward_redemption'])assert.doesNotMatch(render(MovementRow,{item:{...item,reason}}),/href=/);
    assert.doesNotMatch(render(MovementRow,{item:{...item,reference:'receipt:long-reference'}}),/href=/);
  } finally{await server.close();await rm(cacheDir,{recursive:true,force:true});}
});
