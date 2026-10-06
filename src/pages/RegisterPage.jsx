import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [game, setGame] = useState('Valorant');
  const [inGameName, setInGameName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('https://localhost:7039/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          confirmPassword: confirmPassword, 
          games: [
            {
              gameName: game,
              inGameName: inGameName, 
              rank: 'Unranked'
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || (errorData.errors ? Object.values(errorData.errors)[0][0] : 'Error al registrarse en el servidor.');
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user && data.user.username) {
        localStorage.setItem('username', data.user.username);
      } else {
        localStorage.setItem('username', username);
      }

      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-xl">
        
        {/* Cabecera */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-purple-400 tracking-wider">NEXUS ARENA</h1>
          <p className="text-gray-400 text-sm mt-2">Crea tu perfil y comienza a competir</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase mb-1">Nombre de usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="KaizenMX"
              className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
              required
            />
          </div>

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
            <label className="block text-xs font-medium text-gray-300 uppercase mb-1">Juego Principal</label>
            <select 
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
            >
              <option value="Valorant">Valorant</option>
              <option value="Counter-Strike 2">Counter-Strike 2</option>
              <option value="League of Legends">League of Legends</option>
              <option value="FC 25">FC 25</option>
            </select>
          </div>

          {/* 🌟 Nuevo campo requerido por el backend */}
          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase mb-1">ID / Nombre en el Juego</label>
            <input 
              type="text" 
              value={inGameName}
              onChange={(e) => setInGameName(e.target.value)}
              placeholder="Ej: Player#1234"
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

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase mb-1">Confirmar Contraseña</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg transition text-sm mt-2 shadow-lg shadow-purple-900/20"
          >
            Registrarse y Entrar
          </button>
        </form>

        {/* Enlace para ir al login */}
        <div className="text-center mt-6 text-sm text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-purple-400 hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;