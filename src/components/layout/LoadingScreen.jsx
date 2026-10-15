import React from 'react';

// Pantalla de carga estilo teclado: cinco "teclas" que se encienden en secuencia
export default function LoadingScreen({ fullScreen = true, text = 'Cargando' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 ${
        fullScreen ? 'min-h-screen' : 'min-h-[60vh]'
      }`}
    >
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="led-loader-key"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-red-400 text-sm tracking-[0.3em] uppercase animate-pulse">
        {text}
      </p>
    </div>
  );
}