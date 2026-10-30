import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * MapDynamicBackground
 * Fondo interactivo de puntos flotantes (Floating Dots) + destellos dorados
 * diseñado específicamente para el contenedor de la sección del Mapa de Eventos.
 * - Adapta los puntos flotantes al modo claro (puntos oscuros y ámbar) y modo oscuro (puntos blancos y dorados).
 * - Incluye ondas de radar concéntricas sutiles que refuerzan la temática de geolocalización en vivo.
 * - Renderizado a 60 FPS en Canvas con pointer-events-none para no interferir con Leaflet.
 */
export default function MapDynamicBackground({ className = '' }) {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.parentElement?.clientHeight || 700;
    let particles = [];
    let isVisible = true;

    const darkModePalette = [
      'rgba(255, 255, 255, ', // Blanco puro (Floating dots)
      'rgba(248, 250, 252, ', // Slate 50
      'rgba(245, 158, 11, ',  // Amber 500
      'rgba(251, 191, 36, ',  // Amber 400
      'rgba(253, 230, 138, ', // Amber 200
    ];

    const lightModePalette = [
      'rgba(15, 23, 42, ',    // Slate 900 (Floating dots en modo claro)
      'rgba(30, 41, 59, ',    // Slate 800
      'rgba(217, 119, 6, ',   // Amber 600
      'rgba(245, 158, 11, ',  // Amber 500
    ];

    const activePalette = isDark ? darkModePalette : lightModePalette;

    const createParticle = () => {
      const rand = Math.random();
      const radius = rand < 0.5 ? Math.random() * 0.6 + 0.6 : Math.random() * 0.9 + 1.1;
      const isGlint = Math.random() > 0.55;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        colorPrefix: activePalette[Math.floor(Math.random() * activePalette.length)],
        baseAlpha: Math.random() * 0.35 + 0.5,
        twinkleSpeed: Math.random() * 0.035 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleAmp: Math.random() * 0.3 + 0.15,
        speedY: -(Math.random() * 0.32 + 0.12),
        swaySpeed: Math.random() * 0.02 + 0.008,
        swayAmp: Math.random() * 0.45 + 0.2,
        swayPhase: Math.random() * Math.PI * 2,
        isGlint,
      };
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const targetCount = Math.max(90, Math.min(200, Math.floor((width * height) / 7000)));
      if (particles.length === 0) {
        particles = Array.from({ length: targetCount }, createParticle);
      } else {
        particles = Array.from({ length: targetCount }, createParticle);
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let lastTime = performance.now();

    const drawFrame = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 16.666, 2.5);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      const timeSec = currentTime * 0.001;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.speedY * dt;
        p.x += Math.sin(timeSec * 2 * Math.PI * p.swaySpeed + p.swayPhase) * p.swayAmp * dt;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 15) {
          p.y = -5;
          p.x = Math.random() * width;
        }

        if (p.x < -10) p.x = width + 5;
        if (p.x > width + 10) p.x = -5;

        const twinkle = Math.sin(timeSec * 2 * Math.PI * p.twinkleSpeed + p.twinklePhase);
        const alpha = Math.max(0.25, Math.min(0.95, p.baseAlpha + twinkle * p.twinkleAmp));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${alpha.toFixed(3)})`;
        ctx.fill();

        if (p.isGlint && twinkle > 0.55) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? `rgba(251, 191, 36, ${(alpha * 0.25).toFixed(3)})`
            : `rgba(217, 119, 6, ${(alpha * 0.2).toFixed(3)})`;
          ctx.fill();
        }
      }
    };

    const loop = (currentTime) => {
      if (isVisible) {
        drawFrame(currentTime);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDark]);

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
    >
      {/* Resplandores ambientales y anillos de radar concéntricos detrás del mapa */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(245, 158, 11, 0.09) 0%, rgba(10, 19, 37, 0) 75%)'
            : 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(245, 158, 11, 0.12) 0%, rgba(248, 250, 252, 0) 75%)',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] sm:w-[760px] sm:h-[760px] rounded-full border border-amber-500/10 dark:border-amber-400/10 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] sm:w-[1040px] sm:h-[1040px] rounded-full border border-slate-300/40 dark:border-white/[0.04]" />

      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}
