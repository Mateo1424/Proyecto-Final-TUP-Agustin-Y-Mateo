import { Link } from '../../routing/navigation.js';
import { TEAM_GAME_OPTIONS } from '../../schemas/teamCreate.js';

export default function TeamCreationFields({register,errors,disabled,isPrivate}) {
  const fieldProps=name=>({
    ...register(name,name==='isPrivate'?{setValueAs:value=>value===true || value==='true'}:undefined),
    id:`team-create-${name}`,'aria-invalid':Boolean(errors[name]),
    'aria-describedby':[`team-create-${name}-help`,errors[name]&&`team-create-${name}-error`].filter(Boolean).join(' '),
  });
  const errorFor=name=>errors[name]&&<p role="alert" id={`team-create-${name}-error`} className="team-create-error">{errors[name].message}</p>;
  return <fieldset disabled={disabled} className="team-create-fields"><legend className="sr-only">Datos del nuevo equipo</legend>
    <section className="team-create-section" aria-labelledby="team-create-identity"><h2 id="team-create-identity"><span>01</span> Identidad del equipo</h2>
      <div className="team-create-field"><label htmlFor="team-create-name">Nombre del equipo</label><input {...fieldProps('name')} maxLength={40} placeholder="Ej: Nexus Esports" required /><p id="team-create-name-help" className="team-create-hint">Entre 2 y 40 caracteres.</p>{errorFor('name')}</div>
      <div className="team-create-field"><label htmlFor="team-create-tag">Tag / Siglas</label><input {...fieldProps('tag')} maxLength={6} placeholder="Ej: NXS" required /><p id="team-create-tag-help" className="team-create-hint">Entre 2 y 6 caracteres. Se guardará en mayúsculas.</p>{errorFor('tag')}</div>
      <div className="team-create-field"><label htmlFor="team-create-logoUrl">URL del logo (opcional)</label><input {...fieldProps('logoUrl')} inputMode="url" placeholder="https://…" /><p id="team-create-logoUrl-help" className="team-create-hint">Si lo dejás vacío, se usará el logo predeterminado.</p>{errorFor('logoUrl')}</div>
    </section>
    <section className="team-create-section" aria-labelledby="team-create-access"><h2 id="team-create-access"><span>02</span> Juego y acceso</h2>
      <div className="team-create-field"><label htmlFor="team-create-gameName">Videojuego</label><select {...fieldProps('gameName')} required>{TEAM_GAME_OPTIONS.map(game=><option key={game} value={game}>{game}</option>)}</select><p id="team-create-gameName-help" className="team-create-hint">Debés tener este juego asociado a tu perfil con nombre de jugador y rango.</p>{errorFor('gameName')}</div>
      <div className="team-create-field"><label htmlFor="team-create-isPrivate">Privacidad</label><select {...fieldProps('isPrivate')}><option value="false">Público</option><option value="true">Privado</option></select><p id="team-create-isPrivate-help" className="team-create-hint">{isPrivate ? 'El equipo seguirá visible en el listado. Los demás necesitan una invitación del capitán para ingresar.' : 'Otros jugadores pueden unirse si cumplen los requisitos del equipo.'}</p>{errorFor('isPrivate')}</div>
    </section>
  </fieldset>;
}

export function TeamCreationSummary({gameName,isPrivate}) {
  return <section className="team-create-summary" aria-labelledby="team-create-summary-heading"><p className="arena-eyebrow">Antes de crear</p><h2 id="team-create-summary-heading">Tu nuevo equipo</h2>
    <dl><div><dt>Videojuego</dt><dd>{gameName}</dd></div><div><dt>Acceso</dt><dd>{isPrivate?'Privado':'Público'}</dd></div><div><dt>Tu rol inicial</dt><dd>Capitán y titular</dd></div></dl>
    <p className="team-create-hint">{isPrivate ? 'El equipo será visible en el listado. El ingreso requiere una invitación del capitán.' : 'El equipo será público. Otros jugadores pueden unirse si cumplen los requisitos.'}</p>
    <div className="team-create-requirements"><h3>Revisá tu perfil</h3><p className="team-create-hint">Necesitás el juego con nombre y rango, y no pertenecer a otro equipo.</p><Link to="/profile" className="arena-detail-link">Ver mi perfil</Link></div>
  </section>;
}
