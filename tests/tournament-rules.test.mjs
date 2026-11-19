import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canConfirmEnrollment, canCancelEnrollment, canEditTournament, registrationState, statusLabel } from '../src/utils/tournamentRules.js';
import { tournamentCreateSchema, createTournamentPayload } from '../src/schemas/tournamentCreate.js';
test('only the unconfirmed snapshot player can confirm a pending request',()=>{
 const item={status:'Pending',players:[{userId:'me',confirmed:false},{userId:'captain',confirmed:true}]};
 assert.equal(canConfirmEnrollment(item,'me'),true);
 for(const who of ['captain','outsider',undefined])assert.equal(canConfirmEnrollment(item,who),false);
 for(const status of ['Cancelled','Admitted'])assert.equal(canConfirmEnrollment({...item,status},'me'),false);
 assert.equal(canCancelEnrollment(item,'me'),true);assert.equal(canCancelEnrollment(item,'outsider'),false);
 assert.equal(statusLabel('Pending'),'Pendiente');assert.equal(statusLabel('Admitted'),'Inscripto');
});
test('closed tournaments never allow moderator results',()=>{
 assert.equal(canEditTournament({status:'Finalizado'},true),true);
 assert.equal(canEditTournament({status:'Finalizado',closedAt:'2026-01-01'},true),false);
 assert.equal(canEditTournament({status:'En curso'},false),false);
 assert.equal(canEditTournament({status:'Cancelado'},true),false);
});
test('registration enforces clock window, full field and definitive status',()=>{
 const t={startDate:'2026-11-19T12:00:00Z',status:'Próximo',participants:[],maxParticipants:8};
 assert.equal(registrationState(t,Date.parse('2026-11-19T11:29:00Z')),'early');
 assert.equal(registrationState(t,Date.parse('2026-11-19T11:30:00Z')),'open');
 assert.equal(registrationState(t,Date.parse('2026-11-19T12:00:00Z')),'closed');
 assert.equal(registrationState({...t,participants:Array(8).fill({})},Date.parse('2026-11-19T11:45:00Z')),'full');
 assert.equal(registrationState({...t,closedAt:'yes'},0),'closed');
});
test('free and paid creation validate fixed capacity and canonical games',()=>{
 const values={title:'Prueba',gameName:'Valorant',tournamentType:'Equipo',isFree:true,maxParticipants:8,startDate:'2099-12-01T12:00',endDate:'2099-12-01T13:00',rules:'Reglas',bannerUrl:'',rankConditions:'Sin restricción'};
 assert.equal(tournamentCreateSchema.safeParse(values).success,true);
 assert.equal(tournamentCreateSchema.safeParse({...values,isFree:false}).success,true);
 assert.equal(tournamentCreateSchema.safeParse({...values,maxParticipants:16}).success,false);
 assert.equal(tournamentCreateSchema.safeParse({...values,gameName:'EA FC 27'}).success,false);
 assert.equal(tournamentCreateSchema.safeParse({...values,endDate:'2099-11-01T12:00'}).success,false);
 const payload=createTournamentPayload(values);assert.equal(payload.isFree,true);assert.equal(payload.maxParticipants,8);assert.equal(payload.prizePool,0);assert.match(payload.startDate,/Z$/);
});
