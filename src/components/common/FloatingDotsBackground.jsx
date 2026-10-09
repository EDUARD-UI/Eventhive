import { useEffect, useRef } from 'react';

/**
 * FloatingDotsBackground
 * Fondo interactivo de puntos negros brillantes flotando sobre fondo blanco:
 * - Basado fielmente en la referencia visual (dispersión abundante de puntos oscuros nítidos).
 * - Renderizado en canvas acelerado por hardware a 60 FPS sin carga en el DOM.
 * - Efecto "brillante" (twinkle): oscilación de opacidad y micro-resplandor dinámico.
 * - Efecto "flotando": deriva vertical ascendente suave con balanceo lateral sinusoidal.
 * - Soporte Retina / HiDPI con devicePixelRatio para nitidez cristalina.
 * - Ubicado a nivel z-0 con pointer-events-none para interacción transparente.
 */
export default function FloatingDotsBackground({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = window.innerWidth || 1200;
    let height = window.innerHeight || 800;
    let particles = [];
    let isVisible = true;

    // Paleta de tonos negros y pizarra oscura para máxima nitidez y profundidad
    const darkPalette = [
      'rgba(0, 0, 0, ',       // Negro puro
      'rgba(2, 6, 23, ',      // Slate 950
      'rgba(11, 19, 43, ',    // Navy EventHive
      'rgba(15, 23, 42, ',    // Slate 900
      'rgba(30, 41, 59, ',    // Slate 800
    ];

    const createParticle = (initialY = null) => {
      const rand = Math.random();
      let radius;
      if (rand < 0.45) {
        radius = Math.random() * 0.4 + 0.4; // 0.4px - 0.8px (finos)
      } else if (rand < 0.85) {
        radius = Math.random() * 0.4 + 0.8; // 0.8px - 1.2px (medianos)
      } else {
        radius = Math.random() * 0.4 + 1.2; // 1.2px - 1.6px (destacados)
      }

      const isGlint = Math.random() > 0.6; // ~40% con destello brillante

      return {
        x: Math.random() * width,
        y: initialY !== null ? initialY : Math.random() * height,
        radius,
        colorPrefix: darkPalette[Math.floor(Math.random() * darkPalette.length)],
        baseAlpha: Math.random() * 0.3 + 0.65, // 0.65 a 0.95 (alta visibilidad)
        twinkleSpeed: Math.random() * 0.04 + 0.018,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleAmp: Math.random() * 0.3 + 0.15,
        speedY: -(Math.random() * 0.32 + 0.14), // Deriva ascendente suave
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayAmp: Math.random() * 0.45 + 0.2,
        swayPhase: Math.random() * Math.PI * 2,
        isGlint,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth || document.documentElement.clientWidth || 1200;
      height = window.innerHeight || document.documentElement.clientHeight || 800;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Cantidad de partículas adaptada para replicar fielmente la densidad de la imagen
      const targetCount = Math.max(120, Math.min(280, Math.floor((width * height) / 6500)));

      if (particles.length === 0) {
        particles = Array.from({ length: targetCount }, () => createParticle());
      } else if (particles.length < targetCount) {
        const diff = targetCount - particles.length;
        for (let i = 0; i < diff; i++) {
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

      // Fondo blanco puro sólido
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      const timeSec = currentTime * 0.001;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Movimiento vertical continuo
        p.y += p.speedY * dt;

        // Balanceo horizontal
        p.x += Math.sin(timeSec * 2 * Math.PI * p.swaySpeed + p.swayPhase) * p.swayAmp * dt;

        // Reaparición cíclica
        if (p.y < -12) {
          p.y = height + Math.random() * 15;
          p.x = Math.random() * width;
        } else if (p.y > height + 25) {
          p.y = -5;
          p.x = Math.random() * width;
        }

        if (p.x < -12) p.x = width + 5;
        if (p.x > width + 12) p.x = -5;

        // Cálculo de brillo
        const twinkleSine = Math.sin(timeSec * 2 * Math.PI * p.twinkleSpeed + p.twinklePhase);
        const currentAlpha = Math.max(0.35, Math.min(1.0, p.baseAlpha + twinkleSine * p.twinkleAmp));

        // Dibujar el punto negro
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${currentAlpha.toFixed(3)})`;
        ctx.fill();

        // Destello brillante en su pico
        if (p.isGlint && twinkleSine > 0.55) {
          const haloAlpha = ((twinkleSine - 0.55) * 0.4).toFixed(3);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(15, 23, 42, ${haloAlpha})`;
          ctx.fill();
        }
      }
    };

    // Dibujar inmediatamente el primer frame sincronizado
    drawFrame(performance.now());

    const loop = (currentTime) => {
      if (isVisible) {
        drawFrame(currentTime);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
      }
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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}
      className={`select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
