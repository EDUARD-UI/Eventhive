import { useEffect, useRef } from 'react';

/**
 * HoneycombCanvas
 * Renderiza una malla hexagonal interactiva de alto rendimiento en tonos #0B1B3D
 * con bordes ámbar translúcidos y efecto "Glowing Honeycomb" al pasar el cursor.
 */
export default function HoneycombCanvas({ mousePos }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;

    // Configuración del hexágono
    const HEX_RADIUS = 32; // Radio del hexágono
    const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
    const HEX_HEIGHT = 2 * HEX_RADIUS;
    const VERTICAL_SPACING = (3 / 4) * HEX_HEIGHT;

    // Array de hexágonos con su intensidad de luz individual
    let hexagons = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Reconstruir la cuadrícula
      hexagons = [];
      const cols = Math.ceil(width / HEX_WIDTH) + 2;
      const rows = Math.ceil(height / VERTICAL_SPACING) + 2;

      for (let r = 0; r < rows; r++) {
        const y = r * VERTICAL_SPACING;
        const xOffset = (r % 2 === 1) ? HEX_WIDTH / 2 : 0;
        for (let c = 0; c < cols; c++) {
          const x = c * HEX_WIDTH + xOffset;
          hexagons.push({
            x,
            y,
            glow: 0, // 0 a 1
            ambientPulse: Math.random() * Math.PI * 2, // fase aleatoria
            pulseSpeed: 0.02 + Math.random() * 0.02,
          });
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Dibuja un hexágono con orientación horizontal
    const drawHexagon = (x, y, radius, fillStyle, strokeStyle, lineWidth = 1) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const targetX = mousePos?.current?.x ?? -9999;
      const targetY = mousePos?.current?.y ?? -9999;
      const GLOW_RADIUS = 160;

      for (let i = 0; i < hexagons.length; i++) {
        const hex = hexagons[i];

        // Calcular distancia al cursor
        const dx = hex.x - targetX;
        const dy = hex.y - targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Si está cerca del mouse, encender el brillo
        if (dist < GLOW_RADIUS) {
          const intensity = Math.pow(1 - dist / GLOW_RADIUS, 1.4);
          hex.glow = Math.max(hex.glow, intensity);
        } else {
          // Desvanecimiento suave
          hex.glow *= 0.94;
        }

        // Pulso ambiental sutil
        hex.ambientPulse += hex.pulseSpeed;
        const ambientGlow = (Math.sin(hex.ambientPulse) + 1) * 0.035;

        const effectiveGlow = Math.min(1, hex.glow + ambientGlow);

        // Colores: base en tonos #0B1B3D con bordes ámbar
        let strokeColor = 'rgba(245, 158, 11, 0.08)';
        let fillColor = 'rgba(11, 27, 61, 0.35)';

        if (effectiveGlow > 0.05) {
          const alphaStroke = 0.08 + effectiveGlow * 0.65;
          const alphaFill = 0.35 + effectiveGlow * 0.45;
          // Tono dorado/ámbar #F59E0B
          strokeColor = `rgba(245, 158, 11, ${alphaStroke.toFixed(3)})`;
          fillColor = `rgba(245, 158, 11, ${(alphaFill * 0.22).toFixed(3)})`;
        }

        drawHexagon(hex.x, hex.y, HEX_RADIUS - 1.5, fillColor, strokeColor, 1);

        // Si el resplandor es fuerte, añadir un núcleo de luz en el centro
        if (hex.glow > 0.3) {
          const coreAlpha = (hex.glow * 0.35).toFixed(3);
          const radGrad = ctx.createRadialGradient(hex.x, hex.y, 0, hex.x, hex.y, HEX_RADIUS);
          radGrad.addColorStop(0, `rgba(252, 211, 77, ${coreAlpha})`);
          radGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(hex.x, hex.y, HEX_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 block w-full h-full"
    />
  );
}
