import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { Router } from 'wouter';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('match presentation keeps game statistics, profile links and closure restrictions', async () => {
  const cacheDir=await mkdtemp(join(tmpdir(),'match-presentation-'));
  const server=await createServer({cacheDir,configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,watch:null,hmr:false,ws:false},appType:'custom'});
  try {
    const {default:View}=await server.ssrLoadModule('/src/components/matches/MatchPresentation.jsx');
    const detail={tournamentTitle:'Copa Rocket',tournamentId:'t',totalRounds:3,tournamentStatus:'En curso',match:{id:'m',round:1,status:'En curso',playerA:{userId:'me',username:'Jugador A'},playerB:{userId:'b',username:'Jugador B'},scoreA:2,scoreB:1},game:{name:'Rocket League',scoreUnit:'Goles',stats:[{key:'goals',label:'Goles',step:1},{key:'possession',label:'Posesión',step:1,max:100}]},statsA:{goals:2,possession:60},statsB:{goals:1,possession:40}};
    const render=(moderator=false,changes={})=>renderToStaticMarkup(createElement(Router,{ssrPath:'/tournaments/t/matches/m'},createElement(View,{detail:{...detail,...changes},id:'t',user:{id:'me'},moderator,saving:false,actionError:'',adjustScore(){},saveStat(){}})));
    const normal=render();
    assert.match(normal,/Detalle del partido/);
    assert.match(normal,/href="\/tournaments\/t"/);
    assert.match(normal,/href="\/profile"/);
    assert.match(normal,/href="\/users\/b"/);
    assert.match(normal,/60%/);
    assert.doesNotMatch(normal,/<input|Modo moderador/);
    const staff=render(true);
    assert.match(staff,/aria-label="Sumar uno al marcador de Jugador A"/);
    assert.match(staff,/Posesión de Jugador B/);
    const closed=render(true,{closedAt:'2026-11-21T12:00:00Z'});
    assert.match(closed,/Cerrado definitivamente/);
    assert.doesNotMatch(closed,/<input|Modo moderador|aria-label="Sumar uno/);
    const finished=render(true,{match:{...detail.match,status:'Finalizado',winnerUserId:'me'}});
    assert.match(finished,/Ganador/);
    assert.match(finished,/<input/);
    assert.doesNotMatch(finished,/aria-label="Sumar uno al marcador/);
    assert.match(render(false,{game:{...detail.game,stats:[]}}),/no tiene estadísticas configuradas/);
  } finally { await server.close(); await rm(cacheDir,{recursive:true,force:true}); }
});
