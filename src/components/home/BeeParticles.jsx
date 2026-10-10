import { useEffect, useRef, useState } from 'react';

/**
 * BeeSvg: Vector realista y estilizado de abeja EventHive (dorado y negro)
 */
export function BeeSvg({ size = 32, angle = 0, isLeader = false }) {
  return (
    <div
      style={{
        transform: `rotate(${angle}deg)`,
        transition: 'transform 0.15s ease-out',
        width: size,
        height: size,
      }}
      className="relative flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]"
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Ala Izquierda */}
        <ellipse
          cx="17"
          cy="15"
          rx="11"
          ry="6"
          fill="rgba(255, 255, 255, 0.75)"
          stroke="#FCD34D"
          strokeWidth="1.2"
          className="animate-wing-left origin-[22px_20px]"
        />

        {/* Ala Derecha */}
        <ellipse
          cx="31"
          cy="15"
          rx="11"
          ry="6"
          fill="rgba(255, 255, 255, 0.75)"
          stroke="#FCD34D"
          strokeWidth="1.2"
          className="animate-wing-right origin-[26px_20px]"
        />

        {/* Aguijón sutil */}
        <polygon points="24,42 22,37 26,37" fill="#0F172A" />

        {/* Cuerpo / Abdomen con franjas doradas y negras */}
        <ellipse cx="24" cy="28" rx="10" ry="12" fill="#F59E0B" />
        {/* Franjas oscuras */}
        <path d="M15 24 C19 26, 29 26, 33 24" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M16 29 C20 31, 28 31, 32 29" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M19 34 C21 35.5, 27 35.5, 29 34" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" />

        {/* Cabeza */}
        <circle cx="24" cy="16" r="6" fill="#0F172A" />

        {/* Ojos brillantes */}
        <circle cx="22" cy="15" r="1.3" fill="#FFFFFF" />
        <circle cx="26" cy="15" r="1.3" fill="#FFFFFF" />

        {/* Antenas */}
        <path d="M22 11 Q19 7 17 8" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="17" cy="8" r="1" fill="#FCD34D" />
        <path d="M26 11 Q29 7 31 8" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="31" cy="8" r="1" fill="#FCD34D" />

        {/* Corona sutil de néctar para la abeja líder */}
        {isLeader && (
          <path
            d="M21 9 L24 6 L27 9"
            stroke="#FDE047"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
}

/**
 * BeeParticles
 * Exactamente 5 abejas estilizadas con estela dorada (honey trail)
 * y comportamiento interactivo con el cursor sobre fondo blanco.
 */
export default function BeeParticles() {
  const containerRef = useRef(null);

  // Estado inicial de las 5 abejas dispersas por el hero
  const [bees, setBees] = useState([
    { id: 1, x: 280, y: 140, angle: 15, size: 34, isLeader: true, trail: [] },
    { id: 2, x: 720, y: 110, angle: -20, size: 26, isLeader: false, trail: [] },
    { id: 3, x: 920, y: 220, angle: 25, size: 28, isLeader: false, trail: [] },
    { id: 4, x: 440, y: 280, angle: -10, size: 24, isLeader: false, trail: [] },
    { id: 5, x: 140, y: 210, angle: 30, size: 22, isLeader: false, trail: [] },
  ]);

  useEffect(() => {
    let animId;
    let t = 0;

    // Simulación autónoma y orgánica para cada una de las 5 abejas (se mueven a placer)
    const state = [
      { x: 280, y: 140, vx: 0, vy: 0, baseX: 300, baseY: 160, speedX: 0.012, speedY: 0.009, radiusX: 180, radiusY: 90, size: 34, trail: [] },
      { x: 720, y: 110, vx: 0, vy: 0, baseX: 700, baseY: 140, speedX: 0.015, speedY: 0.011, radiusX: 160, radiusY: 100, size: 26, trail: [] },
      { x: 920, y: 220, vx: 0, vy: 0, baseX: 850, baseY: 260, speedX: 0.011, speedY: 0.014, radiusX: 200, radiusY: 110, size: 28, trail: [] },
      { x: 440, y: 280, vx: 0, vy: 0, baseX: 460, baseY: 290, speedX: 0.013, speedY: 0.016, radiusX: 150, radiusY: 80, size: 24, trail: [] },
      { x: 140, y: 210, vx: 0, vy: 0, baseX: 160, baseY: 220, speedX: 0.017, speedY: 0.012, radiusX: 120, radiusY: 95, size: 22, trail: [] },
    ];

    const loop = () => {
      t += 1;

      const updated = state.map((b, idx) => {
        // Vuelo libre y ondulante multidireccional (a placer)
        const destX = b.baseX + Math.sin(t * b.speedX + idx * 1.5) * b.radiusX + Math.sin(t * 0.025 + idx) * 20;
        const destY = b.baseY + Math.cos(t * b.speedY + idx * 2.1) * b.radiusY + Math.cos(t * 0.02 + idx) * 15;

        // Amortiguación fluida
        b.vx = (destX - b.x) * 0.04;
        b.vy = (destY - b.y) * 0.04;
        b.x += b.vx;
        b.y += b.vy;

        // Ángulo de orientación natural hacia la trayectoria
        const targetAngle = Math.atan2(b.vy, b.vx) * (180 / Math.PI) + 90;

        // Estela dorada de miel
        if (t % 3 === 0) {
          b.trail.unshift({ x: b.x, y: b.y + 10, alpha: 0.8, size: idx === 0 ? 5 : 3.5 });
          if (b.trail.length > 7) b.trail.pop();
        }

        b.trail.forEach((p) => {
          p.alpha *= 0.88;
        });

        return {
          id: idx + 1,
          x: b.x,
          y: b.y,
          angle: targetAngle,
          size: b.size,
          isLeader: idx === 0,
          trail: [...b.trail],
        };
      });

      setBees(updated);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none"
    >
      {/* Estelas de miel (Honey trails) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="honeyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {bees.map((bee) =>
          bee.trail.map((pt, i) => (
            <circle
              key={`${bee.id}-pt-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={pt.size * (1 - i / (bee.trail.length || 1))}
              fill="#F59E0B"
              opacity={pt.alpha}
              filter="url(#honeyGlow)"
            />
          ))
        )}
      </svg>

      {/* 5 Abejas renderizadas en sus coordenadas calculadas */}
      {bees.map((bee) => (
        <div
          key={bee.id}
          className="absolute pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(${bee.x - bee.size / 2}px, ${bee.y - bee.size / 2}px, 0)`,
          }}
        >
          <BeeSvg size={bee.size} angle={bee.angle} isLeader={bee.isLeader} />
        </div>
      ))}
    </div>
  );
}
