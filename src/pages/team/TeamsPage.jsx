import { useState, useEffect } from 'react';
import { apiFetch } from '../../config';
import TeamsDirectory from '../../components/teams/TeamsDirectory.jsx';
import './teams.css';

export default function TeamsPage() {
  const [teams,setTeams]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const loadTeams=async () => {
    setLoading(true); setError('');
    try {
      const response=await apiFetch('/teams');
      if(!response.ok) throw new Error(`No se pudieron cargar los equipos (error ${response.status}).`);
      const data=await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch(failure) {
      console.error('Error al cargar equipos:',failure);
      setError(failure instanceof TypeError ? 'No se pudo conectar con el servidor. Revisá tu conexión y reintentá.' : failure.message);
    } finally {setLoading(false);}
  };
  useEffect(() => {Promise.resolve().then(loadTeams);},[]);
  return <TeamsDirectory teams={teams} loading={loading} error={error} loadTeams={loadTeams} />;
}
