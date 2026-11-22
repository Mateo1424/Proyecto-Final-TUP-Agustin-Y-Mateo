import { useState } from 'react';
import { useFormState } from 'react-hook-form';
import { useNavigate, Link, useSearchParams } from '../routing/navigation';
import { GOOGLE_LOGIN_URL } from '../config';
import { request } from '../api/client';
import { useSchemaForm } from '../hooks/useSchemaForm';
import { loginSchema } from '../schemas/auth';
import { useSessionStore } from '../store/session';
import '../components/layout/arena.css';
import './auth.css';

const LoginPage = () => {
  // React Hook Form manages subscriptions outside React Compiler memoization.
  'use no memo';
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(() => {
    const err = searchParams.get('error');
    if (!err) return '';
    return err === 'missing_email'
      ? 'No se pudo obtener el email desde Google.'
      : 'Error al iniciar sesión con Google. Intentá nuevamente.';
  });
  const navigate = useNavigate();
  const { register, submit, control } = useSchemaForm(loginSchema, { identifier: '', password: '' });
  const { errors, isSubmitting } = useFormState({ control });

  const handleLogin = submit(async values => {
    setError('');
    try { const data = await request('/auth/login', { method: 'POST', data: values }); useSessionStore.getState().accept(data.user); navigate('/dashboard'); }
    catch (failure) { setError(failure.message); }
  });

  return (
    <div className="arena-shell arena-auth">
      <header className="arena-auth-header"><div className="arena-brand"><span className="arena-mark" aria-hidden="true">N</span><span>NEXUS <span className="arena-muted">ARENA</span></span></div></header>
      <main className="arena-auth-content">
        <section className="arena-auth-intro" aria-label="Tu cuenta de Nexus Arena">
          <p className="arena-eyebrow">Volvé a competir</p>
          <p className="arena-auth-title">Tu próxima<br />partida empieza<br /><span>acá.</span></p>
          <p className="arena-muted">Revisá tus inscripciones, seguí tu clasificación y encontrá tu próximo torneo.</p>
        </section>
      <section className="arena-auth-form" aria-labelledby="login-heading">
        
        {/* Cabecera */}
        <div className="mb-8">
          <h1 id="login-heading">Iniciá sesión</h1>
          <p className="arena-muted mt-3">Entrá con tu correo o usuario, o continuá con Google.</p>
        </div>

        {/* Mensaje de error si ocurre */}
        {error && (
          <div role="alert" className="arena-auth-error mb-5">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form noValidate onSubmit={handleLogin} aria-busy={isSubmitting} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="arena-auth-label">Correo electrónico o usuario</label>
            <input 
              id="login-email"
              autoComplete="username"
              spellCheck={false}
              aria-invalid={Boolean(errors.identifier)}
              aria-describedby={errors.identifier ? 'login-email-error' : undefined}
              type="text"
              {...register('identifier')}
              placeholder="Tu correo o nombre de usuario"
              className="arena-auth-input"
              required
            />
            {errors.identifier && <p id="login-email-error" role="alert" className="arena-auth-field-error">{errors.identifier.message}</p>}
          </div>

          <div>
            <label htmlFor="login-password" className="arena-auth-label">Contraseña</label>
            <input 
              id="login-password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              type="password" 
              {...register('password')}
              placeholder="••••••••"
              className="arena-auth-input"
              required
            />
            {errors.password && <p id="login-password-error" role="alert" className="arena-auth-field-error">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="arena-button arena-button-primary w-full"
          >
            {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="arena-auth-divider" aria-hidden="true">O</div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => { window.location.href = GOOGLE_LOGIN_URL; }}
          className="arena-button arena-auth-google w-full gap-3"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
          Continuar con Google
        </button>

        {/* Enlace alternativo */}
        <div className="mt-7 text-sm arena-muted">
          ¿Todavía no tenés cuenta?{' '}
          <Link to="/register" className="arena-detail-link">
            Registrate acá
          </Link>
        </div>

      </section>
      </main>
    </div>
  );
};

export default LoginPage;
