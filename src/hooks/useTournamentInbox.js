import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyEnrollments, confirmEnrollment, cancelEnrollment } from '../api/tournaments.js';
import { isAborted } from '../api/client.js';
import { getStoredUser } from '../utils/Roles.js';
import { useWalletStore } from '../store/wallet.js';
export function useTournamentInbox(userId, status, page) {
  const [state,setState] = useState({items:[],hasMore:false,loading:true,error:'',message:'',query:'', observedAt:0});
  const [busy,setBusy] = useState(false);
  const abort = useRef(null); const lock = useRef(false); const alive = useRef(false);
  const query = `${userId}:${status}:${page}`;
  const activeQuery=useRef(query);
  const load = useCallback(async () => {
    abort.current?.abort(); const controller=new AbortController(); abort.current=controller;
    try { const response=await getMyEnrollments({page,pageSize:10,...(status?{status}:{})},controller.signal); if(!controller.signal.aborted) setState(old=>({...old,...response,loading:false,error:'',query,observedAt:Date.now()})); }
    catch(error) { if(!isAborted(error)) setState(old=>({...old,items:[],loading:false,error:error.message,query})); }
  },[page,status,query]);
  useEffect(()=>{
    alive.current=true; activeQuery.current=query; void load(); const focus=()=>{if(document.visibilityState==='visible')void load();};window.addEventListener('focus',focus);
    return ()=>{alive.current=false;abort.current?.abort();window.removeEventListener('focus',focus);};
  },[load,query]);
  const pending=state.items.some(x=>x.status==='Pending');
  useEffect(()=>{if(!pending)return;const timer=setInterval(()=>{if(document.visibilityState==='visible')void load();},15000);return()=>clearInterval(timer);},[pending,load]);
  const act = async (type,item) => {
    if(lock.current)return;
    const message=type==='confirm'?`Confirmás tu presencia y tu propio pago (${item.isFree?'gratis':`${item.entryPoints} puntos`})?`:'Cancelar la solicitud devuelve los pagos de todos los titulares. ¿Continuar?';
    if(!window.confirm(message))return;
    lock.current=true;setBusy(true);const queryAtStart=query;
    try{await (type==='confirm'?confirmEnrollment:cancelEnrollment)(item.tournamentId,item.requestId);if(alive.current&&activeQuery.current===queryAtStart){await load();setState(old=>({...old,message:'Estado actualizado desde el servidor.'}));}}
    catch(error){if(alive.current&&activeQuery.current===queryAtStart)setState(old=>({...old,error:error.message,message:''}));}
    finally{if(getStoredUser()?.id===userId)await useWalletStore.getState().refresh();lock.current=false;if(alive.current)setBusy(false);}
  };
  return {...state,items:state.query===query?state.items:[],loading:state.loading||state.query!==query,busy,load,act};
}
