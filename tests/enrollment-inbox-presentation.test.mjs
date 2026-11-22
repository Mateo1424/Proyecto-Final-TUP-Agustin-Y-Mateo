import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { Router } from 'wouter';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('inbox exposes server states, own confirmation and accessible filter/pagination', async () => {
  const cacheDir=await mkdtemp(join(tmpdir(),'enrollment-inbox-'));
  const server=await createServer({cacheDir,configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,watch:null,hmr:false,ws:false},appType:'custom'});
  try {
    const {default:View}=await server.ssrLoadModule('/src/components/tournaments/EnrollmentInbox.jsx');
    const item={requestId:'request',tournamentId:'t',teamId:'team',teamName:'Mi equipo',title:'Copa de prueba',status:'Pending',tournamentStatus:'Próximo',gameName:'Valorant',startDate:'2099-01-01T12:00:00Z',maxParticipants:8,participants:[],entryPoints:250,players:[{userId:'me',username:'Yo',confirmed:false},{userId:'other',username:'Otro titular',confirmed:true}]};
    const render=(items=[item],overrides={})=>renderToStaticMarkup(createElement(Router,{ssrPath:'/tournament-enrollments'},createElement(View,{items,userId:'me',filter:{status:'',page:1},observedAt:Date.parse('2099-01-01T11:45:00Z'),loading:false,error:'',message:'',busy:false,hasMore:true,onFilter(){},onPrevious(){},onNext(){},load(){},act(){},...overrides})));
    const html=render();
    assert.match(html,/Mis inscripciones/);
    assert.match(html,/for="enrollments-status"/);
    assert.match(html,/aria-label="Páginas de solicitudes"/);
    assert.match(html,/1 de 5/);
    assert.match(html,/no reserva plaza/);
    assert.match(html,/Confirmar mi presencia/);
    assert.match(html,/href="\/tournaments\/t"/);
    assert.doesNotMatch(render([item],{userId:'other'}),/Confirmar mi presencia/);
    assert.doesNotMatch(render([item],{userId:'outsider'}),/Confirmar mi presencia|Cancelar solicitud y devolver pagos/);
    assert.match(render([{...item,status:'Admitted'}]),/Inscripto|cupo confirmado/);
    assert.doesNotMatch(render([{...item,status:'Admitted'}]),/Confirmar mi presencia/);
    assert.match(render([{...item,status:'Cancelled'}]),/Cancelado|Reembolso/);
    assert.doesNotMatch(render([{...item,closedAt:'closed'}]),/Confirmar mi presencia|Cancelar solicitud y devolver pagos/);
    assert.match(render([]),/No hay solicitudes/);
    assert.match(render([],{loading:true}),/Cargando solicitudes/);
    assert.match(render([],{error:'Error de consulta'}),/role="alert"/);
    assert.doesNotMatch(render([],{error:'Error de consulta'}),/No hay solicitudes/);
  } finally {await server.close();await rm(cacheDir,{recursive:true,force:true});}
});
