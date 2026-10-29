import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { apiFetch, GOOGLE_LOGIN_URL } from '../config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(() => {
    const err = searchParams.get('error');
    if (!err) return '';
    return err === 'missing_email'
      ? 'No se pudo obtener el email desde Google.'
      : 'Error al iniciar sesión con Google. Intentá nuevamente.';
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Credenciales inválidas.');
      }

      const data = await response.json();

      // El token viaja en una cookie HttpOnly; acá solo guardamos los datos del usuario
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('username', data.user.username);
      }
      localStorage.removeItem('token'); // limpieza del esquema anterior

      navigate('/dashboard');

    } catch (err) {
      setError(err.message || 'Credenciales inválidas o error de conexión con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-xl">
        
        {/* Cabecera */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-purple-400 tracking-wider">NEXUS ARENA</h1>
          <p className="text-gray-400 text-sm mt-2">Accede a tu cuenta para continuar</p>
        </div>

        {/* Mensaje de error si ocurre */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg transition text-sm mt-2 shadow-lg shadow-purple-900/20"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-800"></div>
          <span className="text-xs text-gray-500">O</span>
          <div className="flex-1 h-px bg-gray-800"></div>
        </div>

        <button
          type="button"
          onClick={() => { window.location.href = GOOGLE_LOGIN_URL; }}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
          Continuar con Google
        </button>

        {/* Enlace alternativo */}
        <div className="text-center mt-6 text-sm text-gray-400">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-purple-400 hover:underline font-medium">
            Regístrate aquí
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
