import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { Router } from 'wouter';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('teams directory preserves destinations and displays available identity/game/privacy/member data', async () => {
  const cacheDir=await mkdtemp(join(tmpdir(),'teams-directory-'));
  const server=await createServer({cacheDir,configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,watch:null,hmr:false,ws:false},appType:'custom'});
  try {
    const {default:View}=await server.ssrLoadModule('/src/components/teams/TeamsDirectory.jsx');
    const teams=[{id:'private',name:'Equipo privado',tag:'PRV',gameName:'Valorant',isPrivate:true,members:[{userId:'one'},{userId:'two'}],logoUrl:''},{id:'public',name:'Equipo público',tag:'PUB',gameName:'Rocket League',isPrivate:false,members:[],logoUrl:'https://example.invalid/logo.png'},{id:'partial',name:'Sin datos adicionales'}];
    const render=props=>renderToStaticMarkup(createElement(Router,{ssrPath:'/teams'},createElement(View,{teams,loading:false,error:'',loadTeams(){},...props})));
    const html=render();
    assert.match(html,/<h1[^>]*>Equipos<\/h1>/);
    for(const path of ['/teams/create','/team-invitations','/teams/private','/teams/public'])assert.match(html,new RegExp(`href="${path}"`));
    assert.match(html,/Privado · Por invitación/);
    assert.match(html,/Público/);
    assert.match(html,/Valorant/);assert.match(html,/Rocket League/);
    assert.match(html,/2 integrantes/);assert.match(html,/0 integrantes/);
    assert.match(html,/Integrantes sin informar/);
    assert.match(html,/Privacidad sin informar/);
    assert.match(html,/aria-label="Inicial de Equipo privado"/);
    assert.doesNotMatch(html,/<img[^>]+src=""/);
    assert.match(html,/width="64" height="64"/);
    assert.match(render({teams:[]}),/No hay equipos creados todavía/);
    assert.match(render({loading:true}),/role="status"/);
    const error=render({teams:[],error:'Error de consulta'});
    assert.match(error,/role="alert"/);assert.match(error,/Reintentar/);
    assert.doesNotMatch(error,/No hay equipos creados todavía/);
  } finally {await server.close();await rm(cacheDir,{recursive:true,force:true});}
});
