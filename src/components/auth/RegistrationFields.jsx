const groups = [
  { title: 'Tu cuenta', fields: [
    { name: 'username', label: 'Nombre de usuario', autoComplete: 'username', placeholder: 'Tu nombre en Nexus Arena' },
    { name: 'email', label: 'Correo electrónico', type: 'email', autoComplete: 'email', placeholder: 'tu@correo.com' },
  ] },
  { title: 'Tu perfil competitivo', fields: [
    { name: 'game', label: 'Juego principal', options: ['Valorant', 'CS:GO', 'League of Legends', 'Rocket League'] },
    { name: 'inGameName', label: 'ID o nombre en el juego', autoComplete: 'off', placeholder: 'Ej.: Player#1234' },
  ] },
  { title: 'Tu contraseña', fields: [
    { name: 'password', label: 'Contraseña', type: 'password', autoComplete: 'new-password', hint: 'Entre 8 y 128 caracteres.' },
    { name: 'confirmPassword', label: 'Confirmar contraseña', type: 'password', autoComplete: 'new-password' },
  ] },
];

export default function RegistrationFields({ register, errors, disabled }) {
  return groups.map(group => <fieldset key={group.title} disabled={disabled} className="arena-register-group">
    <legend>{group.title}</legend>
    <div className="arena-register-fields">{group.fields.map(field => {
      const id = `register-${field.name}`;
      const error = errors[field.name];
      const description = [field.hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
      const props = { id, className: 'arena-auth-input', 'aria-invalid': Boolean(error), 'aria-describedby': description, ...register(field.name) };
      return <div key={field.name} className="min-w-0">
        <label htmlFor={id} className="arena-auth-label">{field.label}</label>
        {field.options ? <select {...props}>{field.options.map(game => <option key={game} value={game}>{game}</option>)}</select>
          : <input {...props} type={field.type ?? 'text'} autoComplete={field.autoComplete} placeholder={field.placeholder} required />}
        {field.hint && <p id={`${id}-hint`} className="arena-register-hint">{field.hint}</p>}
        {error && <p id={`${id}-error`} role="alert" className="arena-auth-field-error">{error.message}</p>}
      </div>;
    })}</div>
  </fieldset>);
}
