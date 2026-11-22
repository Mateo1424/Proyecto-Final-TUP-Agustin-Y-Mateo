import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { Router } from 'wouter';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('floating detail separates participant information from moderation and definitive closure', async () => {
  const cacheDir=await mkdtemp(join(tmpdir(),'detail-presentation-'));
  const server=await createServer({cacheDir,configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,watch:null,hmr:false,ws:false},appType:'custom'});
  try {
    const {TournamentContent}=await server.ssrLoadModule('/src/pages/Tournaments/TournamentDetailsPage.jsx');
    const tournament={id:'fixture',title:'Copa Rocket',gameName:'Rocket League',tournamentType:'Individual',status:'Finalizado',participants:[],maxParticipants:8,entryPoints:250,prizePool:2000,championPoints:1000,runnerUpPoints:600,semifinalPoints:200,startDate:'2026-01-01T12:00:00Z',endDate:'2026-01-01T13:00:00Z',rules:'Mejor de tres'};
    const render=(isModerator,closedAt=null,matches=[])=>renderToStaticMarkup(createElement(Router,{ssrPath:'/tournaments/fixture'},createElement(TournamentContent,{tournament:{...tournament,closedAt},id:'fixture',matches,userTeams:[],enrollments:[],busy:'',now:Date.now(),load(){},mutate(){},navigate(){},isModerator,user:{id:'me'}})));
    const staff=render(true);
    assert.match(staff,/aria-label="Moderación del torneo"/);
    assert.match(staff,/Cerrar definitivamente/);
    assert.match(staff,/Finalizado/);
    assert.match(staff,/aria-label="Inscripción al torneo"/);
    assert.match(staff,/arena-bracket-region/);
    assert.doesNotMatch(render(false),/Cancelar torneo y devolver puntos|Eliminar torneo definitivamente|Cerrar definitivamente y liquidar/);
    const closed=render(true,'2026-01-01T14:00:00Z');
    assert.match(closed,/Cerrado definitivamente/);
    assert.doesNotMatch(closed,/Eliminar torneo definitivamente|Cerrar definitivamente y liquidar|Cancelar torneo y devolver puntos/);
    assert.match(closed,/Resultados bloqueados/);
    const matches=[{id:'match',tournamentId:'fixture',round:1,position:0,playerA:{userId:'a',username:'Jugador A'},playerB:{userId:'b',username:'Jugador B'},scoreA:0,scoreB:0}];
    const bracket=render(true,null,matches);
    assert.match(bracket,/aria-label="Rondas del torneo" tabindex="0"/);
    assert.match(bracket,/aria-label="Sumar uno a Jugador A"/);
    assert.doesNotMatch(render(true,'closed',matches),/aria-label="Sumar uno|Editar resultado/);
  } finally {await server.close();await rm(cacheDir,{recursive:true,force:true});}
});
