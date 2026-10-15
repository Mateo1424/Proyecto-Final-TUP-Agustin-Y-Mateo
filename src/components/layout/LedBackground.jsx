import { useEffect, useRef } from 'react';

// Fondo negro con ondas rojas estilo PS3 y efecto "breathing" de teclado LED
const BREATH_SECONDS = 6; // duración de un ciclo de prendido/apagado
const MIN_GLOW = 0.15;    // brillo mínimo (nunca se apaga del todo). Subilo para que sea más suave
const RED = '255, 20, 30'; // color LED (R, G, B)

const WAVES = [
    { yBase: 0.62, amp: 0.07, freq: 1.4, speed: 0.00011, phase: 0.0, alpha: 0.30, breathOffset: 0.0 },
    { yBase: 0.70, amp: 0.09, freq: 1.0, speed: 0.00008, phase: 2.0, alpha: 0.24, breathOffset: 0.8 },
    { yBase: 0.78, amp: 0.06, freq: 1.9, speed: 0.00014, phase: 4.1, alpha: 0.20, breathOffset: 1.6 },
    { yBase: 0.86, amp: 0.05, freq: 1.2, speed: 0.00009, phase: 5.3, alpha: 0.16, breathOffset: 2.4 },
];

export default function LedBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let width = 0;
        let height = 0;
        let frameId = 0;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        // Respiración suave entre MIN_GLOW y 1
        const breathe = (time, offset = 0) => {
            const t = (time / 1000 + offset) * ((Math.PI * 2) / BREATH_SECONDS);
            const wave = (Math.sin(t) + 1) / 2;
            return MIN_GLOW + (1 - MIN_GLOW) * wave;
        };

        const waveY = (x, w, time) => {
            const nx = x / width;
            return (
                height * w.yBase +
                Math.sin(nx * Math.PI * 2 * w.freq + time * w.speed * 6 + w.phase) * height * w.amp +
                Math.sin(nx * Math.PI * 2 * w.freq * 1.7 - time * w.speed * 4 + w.phase) * height * w.amp * 0.4
            );
        };

        const draw = (time) => {
            const glow = breathe(time);
            document.documentElement.style.setProperty('--led-glow', glow.toFixed(3));

            // Fondo negro con resplandor rojo que respira desde abajo
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);

            const radius = Math.max(width, height) * 0.9;
            const bg = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, radius);
            bg.addColorStop(0, `rgba(${RED}, ${0.28 * glow})`);
            bg.addColorStop(0.5, `rgba(${RED}, ${0.07 * glow})`);
            bg.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            // Ondas estilo PS3, cada una respira un poquito desfasada
            WAVES.forEach((w) => {
                const waveGlow = breathe(time, w.breathOffset);

                ctx.beginPath();
                ctx.moveTo(0, height);
                for (let x = 0; x <= width + 8; x += 8) {
                    ctx.lineTo(x, waveY(x, w, time));
                }
                ctx.lineTo(width, height);
                ctx.closePath();

                const grad = ctx.createLinearGradient(0, height * (w.yBase - w.amp), 0, height);
                grad.addColorStop(0, `rgba(${RED}, ${w.alpha * waveGlow})`);
                grad.addColorStop(1, `rgba(${RED}, 0)`);
                ctx.fillStyle = grad;
                ctx.fill();

                // Borde brillante fino en el borde superior de la onda
                ctx.beginPath();
                for (let x = 0; x <= width + 8; x += 8) {
                    const y = waveY(x, w, time);
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = `rgba(${RED}, ${0.35 * waveGlow})`;
                ctx.lineWidth = 1.2;
                ctx.shadowColor = `rgba(${RED}, ${0.8 * waveGlow})`;
                ctx.shadowBlur = 12;
                ctx.stroke();
                ctx.shadowBlur = 0;
            });
        };

        const loop = (time) => {
            draw(time);
            frameId = requestAnimationFrame(loop);
        };

        resize();
        window.addEventListener('resize', resize);

        if (reduceMotion) {
            draw(BREATH_SECONDS * 250); // un solo cuadro estático
        } else {
            frameId = requestAnimationFrame(loop);
        }

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    );
}