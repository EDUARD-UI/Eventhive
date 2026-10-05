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
export default function BeeParticles({ mousePos }) {
  const containerRef = useRef(null);

  // Estado inicial de las 5 abejas dispersas por el hero
  const [bees, setBees] = useState([
    { id: 1, x: 240, y: 130, angle: 15, size: 34, isLeader: true, trail: [] },
    { id: 2, x: 750, y: 100, angle: -20, size: 26, isLeader: false, trail: [] },
    { id: 3, x: 980, y: 160, angle: 25, size: 28, isLeader: false, trail: [] },
    { id: 4, x: 420, y: 220, angle: -10, size: 24, isLeader: false, trail: [] },
    { id: 5, x: 120, y: 80, angle: 30, size: 22, isLeader: false, trail: [] },
  ]);

  useEffect(() => {
    let animId;
    let t = 0;

    // Física de simulación para cada una de las 5 abejas
    const state = [
      { x: 240, y: 130, vx: 0, vy: 0, baseX: 260, baseY: 130, speed: 0.015, radiusX: 75, radiusY: 45, size: 34, trail: [] },
      { x: 750, y: 100, vx: 0, vy: 0, baseX: 780, baseY: 100, speed: 0.020, radiusX: 55, radiusY: 35, size: 26, trail: [] },
      { x: 980, y: 160, vx: 0, vy: 0, baseX: 960, baseY: 160, speed: 0.017, radiusX: 65, radiusY: 40, size: 28, trail: [] },
      { x: 420, y: 220, vx: 0, vy: 0, baseX: 440, baseY: 210, speed: 0.019, radiusX: 55, radiusY: 35, size: 24, trail: [] },
      { x: 120, y: 80, vx: 0, vy: 0, baseX: 140, baseY: 85, speed: 0.022, radiusX: 45, radiusY: 30, size: 22, trail: [] },
    ];

    const loop = () => {
      t += 1;
      const targetMouse = mousePos?.current;
      const hasMouse = targetMouse && targetMouse.x > 0 && targetMouse.y > 0;

      const updated = state.map((b, idx) => {
        // Movimiento natural orbital en lemniscata (8 suave)
        const orbitX = b.baseX + Math.sin(t * b.speed + idx * 1.8) * b.radiusX;
        const orbitY = b.baseY + Math.cos(t * b.speed * 1.5 + idx * 1.2) * b.radiusY;

        let destX = orbitX;
        let destY = orbitY;

        // Si el cursor interactúa en el hero:
        if (hasMouse) {
          if (idx === 0) {
            // Líder: curiosidad directa hacia el cursor
            destX = orbitX * 0.45 + targetMouse.x * 0.55;
            destY = orbitY * 0.45 + targetMouse.y * 0.55 - 45;
          } else if (idx === 1) {
            destX = orbitX * 0.65 + (targetMouse.x + 90) * 0.35;
            destY = orbitY * 0.65 + (targetMouse.y - 25) * 0.35;
          } else if (idx === 2) {
            destX = orbitX * 0.70 + (targetMouse.x + 130) * 0.30;
            destY = orbitY * 0.70 + (targetMouse.y + 35) * 0.30;
          } else if (idx === 3) {
            destX = orbitX * 0.75 + (targetMouse.x - 85) * 0.25;
            destY = orbitY * 0.75 + (targetMouse.y + 45) * 0.25;
          } else {
            destX = orbitX * 0.80 + (targetMouse.x - 120) * 0.20;
            destY = orbitY * 0.80 + (targetMouse.y - 40) * 0.20;
          }
        }

        // Amortiguación / física suave
        b.vx = (destX - b.x) * 0.055;
        b.vy = (destY - b.y) * 0.055;
        b.x += b.vx;
        b.y += b.vy;

        // Ángulo de orientación hacia la dirección del movimiento
        let targetAngle = 0;
        if (hasMouse && idx === 0) {
          const dx = targetMouse.x - b.x;
          const dy = targetMouse.y - b.y;
          targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        } else {
          targetAngle = Math.atan2(b.vy, b.vx) * (180 / Math.PI) + 90;
        }

        // Estela dorada de miel
        if (t % 3 === 0) {
          b.trail.unshift({ x: b.x, y: b.y + 10, alpha: 0.85, size: idx === 0 ? 5 : 3.5 });
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
  }, [mousePos]);

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
