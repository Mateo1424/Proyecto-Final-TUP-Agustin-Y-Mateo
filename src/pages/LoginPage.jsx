import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Petición real al backend de .NET
      const response = await fetch('https://localhost:7039/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Si el backend rechaza la contraseña o el usuario no existe (ej. 400 o 401)
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales inválidas.');
      }

      const data = await response.json();
      
      // Guardamos el token JWT y el nombre de usuario que devuelve tu backend
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user && data.user.username) {
        localStorage.setItem('username', data.user.username);
      }

      // Si todo es correcto, redirigimos al dashboard de forma segura
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