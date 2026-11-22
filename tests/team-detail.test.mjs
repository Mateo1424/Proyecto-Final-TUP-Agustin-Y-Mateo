import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { Router } from 'wouter';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('team details distinguish captain, member and visitor actions without changing roster rules', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'team-detail-'));
  const server = await createServer({ cacheDir, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { TeamIdentity, TeamRoster } = await server.ssrLoadModule('/src/components/teams/TeamDetails.jsx');
    const { default: TeamEditDialog } = await server.ssrLoadModule('/src/components/teams/TeamEditDialog.jsx');
    const members = [{ userId: 'captain', username: 'Capitana', role: 'Captain', isStarter: true }, { userId: 'member', username: 'Jugador', role: 'Member', isStarter: false }];
    const team = { id: 'team', name: 'Equipo de prueba', tag: 'EQP', captainId: 'captain', gameName: 'Valorant', isPrivate: false, members };
    const render = (Component, props) => renderToStaticMarkup(createElement(Router, { ssrPath: '/teams/team' }, createElement(Component, props)));
    const captain = render(TeamIdentity, { team, members, isCaptain: true, isMember: true });
    assert.match(captain, /<h1[^>]*>Equipo de prueba<\/h1>/);
    assert.match(captain, /Valorant/); assert.match(captain, /Capitana/);
    assert.match(captain, /Editar equipo/); assert.doesNotMatch(captain, /Abandonar equipo|Unirse al equipo/);
    assert.match(captain, /Inicial de Equipo de prueba/);
    const member = render(TeamIdentity, { team, members, isCaptain: false, isMember: true, leaving: true });
    assert.match(member, /disabled=""[^>]*>Saliendo/); assert.doesNotMatch(member, /Editar equipo|Unirse al equipo/);
    const visitor = render(TeamIdentity, { team, members, isCaptain: false, isMember: false });
    assert.match(visitor, /Unirse al equipo/); assert.doesNotMatch(visitor, /Editar equipo|Abandonar equipo/);
    const privateVisitor = render(TeamIdentity, { team: { ...team, isPrivate: true }, members, isMember: false });
    assert.match(privateVisitor, /Necesitás una invitación/); assert.match(privateVisitor, /href="\/team-invitations"/);
    assert.doesNotMatch(privateVisitor, /Unirse al equipo/);
    const roster = render(TeamRoster, { team, members, user: { id: 'captain' }, isCaptain: true });
    assert.match(roster, /Titulares/); assert.match(roster, /Suplentes/);
    assert.equal((roster.match(/>Expulsar</g) || []).length, 1);
    assert.match(roster, /Cambiar a Titular/); assert.doesNotMatch(roster, /Cambiar a Suplente/);
    assert.doesNotMatch(render(TeamRoster, { team, members, user: { id: 'member' }, isCaptain: false }), /Expulsar|Cambiar a/);
    assert.match(render(TeamRoster, { team, members: [], isCaptain: false }), /No hay integrantes/);
    const edit = render(TeamEditDialog, { form: { name: team.name, tag: team.tag, logoUrl: '', isPrivate: true }, setForm() {}, saving: false });
    assert.match(edit, /<dialog[^>]+aria-labelledby="team-edit-heading"/);
    for (const id of ['team-edit-name', 'team-edit-tag', 'team-edit-logo', 'team-edit-privacy']) assert.match(edit, new RegExp(`for="${id}"`));
    assert.match(edit, /value="true" selected=""/); assert.doesNotMatch(edit, /minlength|maxlength/);
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
