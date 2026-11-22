import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { Router } from 'wouter';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('team creation mirrors DTO limits without changing raw payload normalization or logo rules', async () => {
  const {teamCreateSchema}=await import('../src/schemas/teamCreate.js');
  const values={name:'Equipo',tag:'abc',logoUrl:'',gameName:'Valorant',isPrivate:false};
  assert.deepEqual(teamCreateSchema.parse(values),values);
  assert.equal(teamCreateSchema.safeParse({...values,name:'A'}).success,false);
  assert.equal(teamCreateSchema.safeParse({...values,name:'A'.repeat(41)}).success,false);
  assert.equal(teamCreateSchema.safeParse({...values,name:'  '}).success,false);
  assert.equal(teamCreateSchema.safeParse({...values,tag:'A'}).success,false);
  assert.equal(teamCreateSchema.safeParse({...values,tag:'A'.repeat(7)}).success,false);
  assert.equal(teamCreateSchema.safeParse({...values,gameName:'Otro'}).success,false);
  assert.equal(teamCreateSchema.safeParse({...values,isPrivate:'true'}).success,false);
  assert.equal(teamCreateSchema.safeParse({...values,logoUrl:'/existing-logo.png',isPrivate:true}).success,true);
  assert.equal(teamCreateSchema.parse({...values,name:' Equipo ',tag:' ab '}).tag,' ab ');
});

test('team creation labels identity/game/privacy, explains requirements and links back', async () => {
  const cacheDir=await mkdtemp(join(tmpdir(),'team-create-'));
  const server=await createServer({cacheDir,configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,watch:null,hmr:false,ws:false},appType:'custom'});
  try {
    const {default:Page}=await server.ssrLoadModule('/src/pages/team/CreateTeam.jsx');
    const html=renderToStaticMarkup(createElement(Router,{ssrPath:'/teams/create'},createElement(Page)));
    assert.match(html,/<h1[^>]*>Crear equipo<\/h1>/);
    for(const field of ['name','tag','logoUrl','gameName','isPrivate']){
      assert.match(html,new RegExp(`for="team-create-${field}"`));
      assert.match(html,new RegExp(`id="team-create-${field}"`));
    }
    assert.match(html,/no pertenecer a otro equipo/);
    assert.match(html,/href="\/profile"/);
    assert.match(html,/href="\/teams"/);
    assert.match(html,/Rocket League/);
    const {TeamCreationSummary}=await server.ssrLoadModule('/src/components/teams/TeamCreationFields.jsx');
    const privateHtml=renderToStaticMarkup(createElement(Router,{ssrPath:'/teams/create'},createElement(TeamCreationSummary,{gameName:'Rocket League',isPrivate:true})));
    assert.match(privateHtml,/invitación del capitán/);
    assert.match(privateHtml,/visible en el listado/);
  } finally {await server.close();await rm(cacheDir,{recursive:true,force:true});}
});
