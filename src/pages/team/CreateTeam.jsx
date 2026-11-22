import { useRef, useState } from 'react';
import { useForm, useFormState, useWatch } from 'react-hook-form';
import { useNavigate, Link } from '../../routing/navigation';
import { apiFetch } from '../../config';
import { teamCreateSchema } from '../../schemas/teamCreate.js';
import TeamCreationFields, { TeamCreationSummary } from '../../components/teams/TeamCreationFields.jsx';
import './team-create.css';

const SERVER_FIELDS={name:'name',tag:'tag',logourl:'logoUrl',gamename:'gameName',isprivate:'isPrivate'};
export default function CreateTeam() {
  'use no memo';
  const navigate=useNavigate();
  const {register,control,handleSubmit:submitForm,setError,clearErrors}=useForm({defaultValues:{name:'',tag:'',logoUrl:'',gameName:'Valorant',isPrivate:false}});
  const {errors,isSubmitting}=useFormState({control});
  const values=useWatch({control});
  const [saving,setSaving]=useState(false);
  const [error,setErrorMessage]=useState('');
  const submitLock=useRef(false);
  const createTeam=async data => {
    if(submitLock.current)return;
    clearErrors();setErrorMessage('');
    const parsed=teamCreateSchema.safeParse(data);
    if(!parsed.success){for(const [index,issue] of parsed.error.issues.entries())setError(issue.path[0],{type:'validate',message:issue.message},{shouldFocus:index===0});return;}
    if(!localStorage.getItem('user')){alert('Debes iniciar sesión para crear un equipo.');navigate('/login');return;}
    submitLock.current=true;setSaving(true);
    try {
      const response=await apiFetch('/teams',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(parsed.data)});
      if(response.ok){alert('¡Equipo creado con éxito!');navigate('/teams');}
      else if(response.status===401){alert('Tu sesión expiró. Volvé a iniciar sesión.');localStorage.removeItem('user');navigate('/login');}
      else {
        const errorData=await response.json().catch(()=>({}));
        let hasFieldErrors=false;
        for(const [key,messages] of Object.entries(errorData.errors ?? {})){
          const field=SERVER_FIELDS[key.split('.').at(-1).toLowerCase()];
          if(field){setError(field,{type:'server',message:Array.isArray(messages)?messages[0]:String(messages)});hasFieldErrors=true;}
        }
        setErrorMessage(errorData.message || (hasFieldErrors?'Revisá los campos indicados.':'No se pudo crear el equipo. Verificá los datos.'));
      }
    } catch(failure){console.error('Error de red:',failure);setErrorMessage('Error de conexión con el servidor.');}
    finally{submitLock.current=false;setSaving(false);}
  };
  const handleSubmit=event=>submitForm(createTeam)(event);
  const busy=saving || isSubmitting;
  return <section className="arena-team-create" aria-labelledby="team-create-heading">
    <header className="arena-page-heading"><div><p className="arena-eyebrow">Competencia en equipo</p><h1 id="team-create-heading" className="arena-title">Crear equipo</h1><p className="team-create-intro">Definí la identidad, el juego y cómo se sumarán los demás integrantes.</p></div><Link to="/teams" className="arena-detail-link">Volver a equipos</Link></header>
    <form noValidate onSubmit={handleSubmit} className="team-create-layout" aria-busy={busy}>
      <TeamCreationFields register={register} errors={errors} disabled={busy} isPrivate={values.isPrivate} />
      <aside className="team-create-review" aria-label="Revisar nuevo equipo"><TeamCreationSummary gameName={values.gameName} isPrivate={values.isPrivate} />
        {error&&<p role="alert" className="team-create-error team-create-server-error">{error}</p>}
        <button disabled={busy} type="submit" className="arena-button arena-button-primary team-create-submit">{busy?'Creando...':'Guardar y crear equipo'}</button>
      </aside>
    </form>
  </section>;
}
