import React, { useEffect, useRef } from 'react';

/**
 * MapDynamicBackground
 * Fondo dinámico de alta fidelidad para el contenedor oscuro del Mapa (#0A1325):
 * - Partículas de polvo de oro/polen de colmena flotando suavemente a 60 FPS.
 * - Destellos sutiles (twinkle) con micro-resplandores dorados (#F59E0B y #FBBF24).
 * - Gradientes de luz ambiental profunda integrados.
 * - Estricto pointer-events-none y z-0 para no interferir con Leaflet ni sus controles.
 * - Pausa automática cuando la ventana está oculta para conservar batería y GPU.
 */
export default function MapDynamicBackground({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.parentElement?.clientHeight || 600;
    let particles = [];
    let isVisible = true;

    // Paleta dorada y azul-noche de EventHive
    const goldPalette = [
      'rgba(245, 158, 11, ',  // Amber 500
      'rgba(251, 191, 36, ',  // Amber 400
      'rgba(252, 211, 77, ',  // Amber 300
      'rgba(56, 189, 248, ',  // Sky 400 (micro-reflejos)
    ];

    const createParticle = () => {
      const isGold = Math.random() > 0.15;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.5, // 0.5px a 1.7px
        colorPrefix: isGold
          ? goldPalette[Math.floor(Math.random() * (goldPalette.length - 1))]
          : goldPalette[goldPalette.length - 1],
        baseAlpha: Math.random() * 0.4 + 0.2, // 0.2 a 0.6
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleAmp: Math.random() * 0.25 + 0.15,
        speedY: -(Math.random() * 0.28 + 0.08), // Flotación ascendente lenta
        swaySpeed: Math.random() * 0.018 + 0.008,
        swayAmp: Math.random() * 0.5 + 0.2,
        swayPhase: Math.random() * Math.PI * 2,
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

      const targetCount = Math.max(35, Math.min(75, Math.floor((width * height) / 18000)));
      if (particles.length === 0) {
        particles = Array.from({ length: targetCount }, createParticle);
      } else if (particles.length < targetCount) {
        for (let i = particles.length; i < targetCount; i++) {
          particles.push(createParticle());
        }
      } else if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
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
        const alpha = Math.max(0.1, Math.min(0.85, p.baseAlpha + twinkle * p.twinkleAmp));

        // Partícula dorada brillante
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${alpha.toFixed(3)})`;
        ctx.fill();

        // Halo tenue para las partículas más vivas
        if (twinkle > 0.6) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${(alpha * 0.18).toFixed(3)})`;
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
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
    >
      {/* Resplandor radial tenue ambiental centralizado */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% 25%, rgba(245, 158, 11, 0.07) 0%, rgba(10, 19, 37, 0) 80%), radial-gradient(circle 350px at 85% 80%, rgba(14, 165, 233, 0.05) 0%, transparent 70%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}
