import { useState } from 'react';
import { useFormState } from 'react-hook-form';
import { useNavigate, Link } from '../routing/navigation';
import { GOOGLE_LOGIN_URL } from '../config';
import { request } from '../api/client';
import { useSchemaForm } from '../hooks/useSchemaForm';
import { registerSchema } from '../schemas/auth';
import { useSessionStore } from '../store/session';
import RegistrationFields from '../components/auth/RegistrationFields.jsx';
import '../components/layout/arena.css';
import './auth.css';

export default function RegisterPage() {
  // Subscribe directly to RHF state with React Compiler active, as in login.
  'use no memo';
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, submit, control } = useSchemaForm(registerSchema, { username: '', email: '', password: '', confirmPassword: '', game: 'Valorant', inGameName: '' });
  const { errors, isSubmitting } = useFormState({ control });

  const handleRegister = submit(async values => {
    setError('');
    const { game, inGameName, ...account } = values;
    try { const data = await request('/auth/register', { method: 'POST', data: { ...account, games: [{ gameName: game, inGameName, rank: 'Unranked' }] } }); useSessionStore.getState().accept(data.user); navigate('/dashboard'); }
    catch (failure) { setError(failure.message); }
  });

  return <div className="arena-shell arena-auth arena-register">
    <header className="arena-auth-header"><div className="arena-brand"><span className="arena-mark" aria-hidden="true">N</span><span>NEXUS <span className="arena-muted">ARENA</span></span></div></header>
    <main className="arena-auth-content">
      <section className="arena-auth-intro" aria-label="Tu perfil de Nexus Arena">
        <p className="arena-eyebrow">Sumate a la arena</p>
        <p className="arena-auth-title">Tu juego.<br />Tu equipo.<br /><span>Tu próxima copa.</span></p>
        <p className="arena-muted">Creá tu perfil, elegí tu juego y encontrá torneos para competir.</p>
      </section>
      <section className="arena-auth-form" aria-labelledby="register-heading">
        <div className="mb-8"><h1 id="register-heading">Creá tu cuenta</h1><p className="arena-muted mt-3">Completá tus datos y tu perfil competitivo.</p></div>
        {error && <div role="alert" className="arena-auth-error mb-5">{error}</div>}
        <form noValidate onSubmit={handleRegister} aria-busy={isSubmitting}>
          <RegistrationFields register={register} errors={errors} disabled={isSubmitting} />
          <button type="submit" disabled={isSubmitting} className="arena-button arena-button-primary w-full">{isSubmitting ? 'Creando cuenta…' : 'Registrarse y entrar'}</button>
        </form>
        <div className="arena-auth-divider" aria-hidden="true">O</div>
        <button type="button" disabled={isSubmitting} onClick={() => { window.location.href = GOOGLE_LOGIN_URL; }} className="arena-button arena-auth-google w-full gap-3">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
          Registrarse con Google
        </button>
        <p className="mt-7 text-sm arena-muted">¿Ya tenés cuenta? <Link to="/login" className="arena-detail-link">Iniciá sesión acá</Link></p>
      </section>
    </main>
  </div>;
}
