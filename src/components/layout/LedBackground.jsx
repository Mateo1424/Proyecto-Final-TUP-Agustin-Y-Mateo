import React from 'react';

const COLS = 16;
const ROWS = 9;

// Cada "tecla" tiene un retraso distinto, así la luz viaja en diagonal
const keys = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return { id: i, delay: col * 0.22 + row * 0.4 };
});

const LedBackground = () => (
  <div className="led-bg" aria-hidden="true">
    <div className="led-glow" />
    <div className="led-grid" style={{ '--cols': COLS, '--rows': ROWS }}>
      {keys.map((k) => (
        <span key={k.id} className="led-key" style={{ animationDelay: `-${k.delay}s` }} />
      ))}
    </div>
    <div className="led-vignette" />
  </div>
);

export default React.memo(LedBackground);