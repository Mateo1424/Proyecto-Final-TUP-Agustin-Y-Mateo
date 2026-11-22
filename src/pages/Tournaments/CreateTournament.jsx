import { useState } from 'react';
import { useForm, useFormState, useWatch } from 'react-hook-form';
import { Link } from 'wouter';
import { tournamentCreateSchema, createTournamentPayload } from '../../schemas/tournamentCreate.js';
import { request } from '../../api/client.js';
import { useNavigate } from '../../routing/navigation.js';
import CreationSummary from '../../components/tournaments/CreationSummary.jsx';
import './create-tournament.css';

const GAMES = ['Valorant', 'CS:GO', 'League of Legends', 'Rocket League'];
const toLocalInputValue = date => {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const openPicker = event => {
  try { event.target.showPicker?.(); } catch { /* Native calendar remains available. */ }
};
const quickDates = minutes => {
  const start = new Date(Date.now() + minutes * 60000);
  return [toLocalInputValue(start), toLocalInputValue(new Date(start.getTime() + 3600000))];
};

export default function CreateTournament() {
  'use no memo';
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, control, setValue, handleSubmit, setError, clearErrors } = useForm({
    defaultValues:{title:'',gameName:'Valorant',tournamentType:'Individual',startDate:'',endDate:'',maxParticipants:8,rules:'',bannerUrl:'',rankConditions:'Sin restricción',isFree:false},
  });
  const { errors, isSubmitting } = useFormState({control});
  const values = useWatch({control});
  const fieldProps = name => ({...register(name),id:`tournament-${name}`,'aria-invalid':Boolean(errors[name]),'aria-describedby':errors[name] ? `tournament-${name}-error` : undefined});
  const errorFor = name => errors[name] && <p role="alert" id={`tournament-${name}-error`} className="creation-error">{errors[name].message}</p>;
  const setQuickStart = minutes => {
    const [start, end] = quickDates(minutes);
    setValue('startDate',start,{shouldDirty:true});
    setValue('endDate',end,{shouldDirty:true});
    clearErrors(['startDate','endDate']);
  };
  const submit = handleSubmit(async data => {
    clearErrors();
    setServerError('');
    const parsed = tournamentCreateSchema.safeParse(data);
    if (!parsed.success) {
      for (const [index,issue] of parsed.error.issues.entries()) setError(issue.path[0] || 'root',{type:'validate',message:issue.message},{shouldFocus:index === 0});
      return;
    }
    try {
      await request('/tournaments',{method:'POST',data:createTournamentPayload(parsed.data)});
      navigate('/tournaments');
    } catch (error) { setServerError(error.message); }
  });
  const field = (name,label,props = {}) => <div className="creation-field">
    <label htmlFor={`tournament-${name}`}>{label}</label>
    {name === 'rules' ? <textarea {...fieldProps(name)} rows={4} {...props} /> : <input {...fieldProps(name)} {...props} />}
    {errorFor(name)}
  </div>;

  return <div className="arena-creation">
    <header className="arena-page-heading">
      <div><p className="arena-eyebrow">Organización de torneos</p><h1 className="arena-title">Crear torneo</h1><p className="arena-muted">Definí la competencia. Los puntos y premios ya están establecidos.</p></div>
      <Link href="/tournaments" className="arena-detail-link">Volver a torneos</Link>
    </header>
    <form noValidate onSubmit={submit} className="creation-layout" aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="creation-fields">
        <legend className="sr-only">Configuración del torneo</legend>
        <section className="creation-section" aria-labelledby="creation-format">
          <h2 id="creation-format"><span>01</span> Competencia</h2>
          <fieldset className="creation-choice-group"><legend>Tipo de torneo</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[['Individual','Individual','Inscripción por jugador.'],['Equipo','Por equipos','Cinco titulares; cada uno confirma su entrada.']].map(([value,label,description]) => <label className="creation-choice" key={value}>
                <input type="radio" {...register('tournamentType')} value={value} /><span><strong>{label}</strong><small>{description}</small></span>
              </label>)}
            </div>{errorFor('tournamentType')}
          </fieldset>
          <fieldset className="creation-choice-group"><legend>Videojuego</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{GAMES.map(game => <label className="creation-choice" key={game}><input type="radio" {...register('gameName')} value={game} /><strong>{game}</strong></label>)}</div>
            {errorFor('gameName')}
          </fieldset>
          {field('title','Título del torneo',{maxLength:120,placeholder:'Ej: Copa Rocket League',required:true})}
        </section>
        <section className="creation-section" aria-labelledby="creation-schedule">
          <h2 id="creation-schedule"><span>02</span> Fechas</h2>
          <p className="creation-hint">Elegí el horario local de inicio y finalización.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {field('startDate','Fecha y hora de inicio',{type:'datetime-local',onClick:openPicker,required:true})}
            {field('endDate','Fecha y hora de fin',{type:'datetime-local',min:values.startDate || undefined,onClick:openPicker,required:true})}
          </div>
          <div className="creation-shortcuts"><span className="creation-hint">Atajos para pruebas</span>
            <div className="flex flex-wrap gap-2">{[2,5].map(minutes => <button key={minutes} type="button" className="arena-button" onClick={() => setQuickStart(minutes)}>Empezar en {minutes} minutos</button>)}</div>
            <p className="creation-hint">Completan el inicio y fijan el fin una hora después.</p>
          </div>
        </section>
        <section className="creation-section" aria-labelledby="creation-rules">
          <h2 id="creation-rules"><span>03</span> Reglas y presentación</h2>
          {field('rules','Reglas clave',{placeholder:'Formato de partidas, puntualidad y condiciones de juego…',required:true})}
          {field('rankConditions','Condiciones de rango',{placeholder:'Sin restricción / Mínimo: Oro 1'})}
          {field('bannerUrl','URL del banner (opcional)',{type:'url',placeholder:'https://…'})}
          <p className="creation-hint">Si dejás el banner vacío, se usará la portada del juego.</p>
          <label className="creation-free"><input type="checkbox" {...register('isFree')} /><span><strong>Torneo gratuito</strong><small>Sin costo de entrada. Los premios cambian según la modalidad.</small></span></label>
          {errorFor('isFree')}
        </section>
      </fieldset>
      <aside className="creation-review" aria-label="Resumen antes de crear">
        <CreationSummary isFree={values.isFree} tournamentType={values.tournamentType} gameName={values.gameName} />
        {errorFor('maxParticipants')}{errorFor('root')}
        {serverError && <p role="alert" className="creation-error">{serverError}</p>}
        <button disabled={isSubmitting} type="submit" className="arena-button arena-button-primary creation-submit">{isSubmitting ? 'Creando…' : 'Guardar y crear torneo'}</button>
        <p className="creation-hint">Revisá las fechas y reglas antes de publicar.</p>
      </aside>
    </form>
  </div>;
}
