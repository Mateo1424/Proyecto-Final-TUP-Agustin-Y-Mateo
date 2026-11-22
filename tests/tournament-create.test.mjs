import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { Router } from 'wouter';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('creation form exposes native labelled choices and fixed economy for both formats', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'tournament-create-'));
  const server = await createServer({ cacheDir, configFile:false, optimizeDeps:{noDiscovery:true,include:[]}, server:{middlewareMode:true,watch:null,hmr:false,ws:false}, appType:'custom' });
  try {
    const { default: Page } = await server.ssrLoadModule('/src/pages/Tournaments/CreateTournament.jsx');
    const html = renderToStaticMarkup(createElement(Router, {ssrPath:'/tournaments/create'}, createElement(Page)));
    assert.match(html, /<h1[^>]*>Crear torneo<\/h1>/);
    assert.equal((html.match(/type="radio"/g) || []).length, 6);
    for (const field of ['title','startDate','endDate','bannerUrl','rules','rankConditions']) {
      assert.match(html, new RegExp(`for="tournament-${field}"`));
      assert.match(html, new RegExp(`id="tournament-${field}"`));
    }
    assert.match(html, /Empezar en 2 minutos/);
    assert.match(html, /Empezar en 5 minutos/);
    assert.match(html, /250/);
    assert.match(html, /1.000/);
    assert.doesNotMatch(html, /name="(?:prizePool|entryPoints|championPoints)"/);
    const { default: Summary } = await server.ssrLoadModule('/src/components/tournaments/CreationSummary.jsx');
    const free = renderToStaticMarkup(createElement(Summary, {isFree:true,tournamentType:'Equipo',gameName:'Rocket League'}));
    assert.match(free, /8 equipos/);
    assert.match(free, /5 titulares/);
    assert.match(free, /50/);
    assert.match(free, /100/);
    assert.match(free, /200/);
    assert.doesNotMatch(free, /1.000/);
  } finally { await server.close(); await rm(cacheDir,{recursive:true,force:true}); }
});
