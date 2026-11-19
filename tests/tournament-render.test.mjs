import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { Router } from 'wouter';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
test('actual roster panel only renders own payment actions and distinguishes pending from admitted',async()=>{
 const cacheDir=await mkdtemp(join(tmpdir(),'tournament-ui-'));console.log('SCRATCH',cacheDir);
 const server=await createServer({cacheDir,optimizeDeps:{noDiscovery:true,include:[]},root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,server:{middlewareMode:true,watch:null,hmr:false,ws:false},appType:'custom'});
 try{
  const {default:Card}=await server.ssrLoadModule('/src/components/tournaments/EnrollmentCard.jsx');
  const item={id:'req',teamId:'team',teamName:'Cinco',status:'Pending',entryPoints:250,players:[{userId:'captain',username:'Capitán',confirmed:true},{userId:'me',username:'Yo',confirmed:false}]};
  const render=(who='me',status='Pending',frozen=false)=>renderToStaticMarkup(createElement(Card,{item:{...item,status},userId:who,frozen,onConfirm(){},onCancel(){}}));
  const pending=render();assert.match(pending,/Confirmar mi presencia/);assert.match(pending,/2|1 de 5/);assert.match(pending,/no reserva plaza/);assert.doesNotMatch(pending,/Inscripción admitida/);
  assert.doesNotMatch(render('captain'),/Confirmar mi presencia/);assert.doesNotMatch(render('outsider'),/<button/);
  assert.doesNotMatch(render('me','Admitted'),/<button/);assert.match(render('me','Admitted'),/cupo confirmado/);
  assert.doesNotMatch(render('me','Cancelled'),/<button/);assert.match(render('me','Cancelled'),/Movimientos/);assert.doesNotMatch(render('me','Pending',true),/<button/);
  const {default:Economy}=await server.ssrLoadModule('/src/components/tournaments/TournamentEconomy.jsx');
  const paid=renderToStaticMarkup(createElement(Economy,{tournament:{entryPoints:250,championPoints:1000,runnerUpPoints:600,semifinalPoints:200,tournamentType:'Equipo'}}));assert.match(paid,/250 pts/);assert.doesNotMatch(paid,/€/);
  const free=renderToStaticMarkup(createElement(Economy,{tournament:{isFree:true,closedAt:'yes'}}));assert.match(free,/Gratis/);assert.match(free,/200/);assert.match(free,/Cierre definitivo/);assert.doesNotMatch(free,/€/);
  const {default:Bracket}=await server.ssrLoadModule('/src/pages/Tournaments/TournamentBracket.jsx');
  const closedBracket=renderToStaticMarkup(createElement(Router,{ssrPath:'/'},createElement(Bracket,{matches:[{id:'m',tournamentId:'t',round:1,position:0,playerA:{userId:'a',username:'A'},playerB:{userId:'b',username:'B'},scoreA:0,scoreB:0,status:'Pendiente'}],canManage:true,closedAt:'yes'})));
  assert.doesNotMatch(closedBracket,/Modo moderador|Editar resultado|<input/);
  const api=await server.ssrLoadModule('/src/api/tournaments.js');const {client}=await server.ssrLoadModule('/src/api/client.js');const calls=[];
  client.defaults.adapter=async config=>{calls.push(config);return{data:{status:'Admitted'},status:200,statusText:'OK',headers:{},config};};
  await api.confirmEnrollment('t','req');await api.cancelEnrollment('t','req');await api.closeTournament('t');await api.cancelTournament('t');await api.getMyEnrollments({status:'Pending',page:1,pageSize:10});
  assert.deepEqual(calls.slice(0,4).map(x=>[x.method,x.url]),[['post','/tournaments/t/enrollments/req/confirm'],['post','/tournaments/t/enrollments/req/cancel'],['post','/tournaments/t/close'],['post','/tournaments/t/cancel']]);
  assert.equal(calls[0].data,undefined);assert.equal(calls[4].params.userId,undefined);assert.equal(calls[4].params.status,'Pending');
  for(const file of ['CreateTournament','TournamentDetailsPage','MatchDetailsPage','TournamentBracket','TournamentsPage','MyEnrollmentsPage'])await server.ssrLoadModule(`/src/pages/Tournaments/${file}.jsx`);
 }finally{await server.close();}
});
