import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import cartagenaHeroPoster from '../../assets/cartagena-hero.jpg';
import { formatDisplayDate, formatDisplayTime } from '../../services/eventService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * FeaturedEventCountdownBanner
 * Rediseño Apple Design + Emil Kowalski:
 * - Superficie sólida en dorado ámbar (#F59E0B) sin degradados.
 * - Imagen a sangre al 100% de la altura sin bordes ni márgenes.
 * - Sin badges decorativos ni barras de progreso.
 * - Título en azul oscuro/negro con jerarquía tipográfica contundente.
 * - Fecha y hora limpia sin íconos.
 * - Reloj regresivo tabular de gran escala con números en blanco puro y unidades en azul oscuro con tracking amplio.
 */
export default function FeaturedEventCountdownBanner({ event, isLoading = false }) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const timeLabels = {
    days: isEn ? 'Days' : 'Días',
    hours: isEn ? 'Hours' : 'Horas',
    mins: isEn ? 'Mins' : 'Mins',
    secs: isEn ? 'Secs' : 'Segs',
    live: isEn ? 'Live Now!' : '¡En Vivo Ahora!',
  };

  // Evento activo obtenido del backend
  const activeEvent = useMemo(() => {
    if (!event) return null;
    return {
      ...event,
      id: event.id,
      title: event.nombre || event.titulo || event.title || 'Evento Destacado',
      fechaCreacion: event.fechaCreacion || event.createdAt || event.creadoEn || null,
      fecha: event.fecha || '',
      hora: event.hora || '',
      photo:
        event.urlImagen ||
        event.foto ||
        event.photo ||
        event.url_imagen_destacado ||
        event.url_imagen_promocionado ||
        event.imagenPromocional ||
        cartagenaHeroPoster,
    };
  }, [event]);

  // Interpretar la fecha y hora exacta de ejecución del evento
  const parseTargetDate = (ev) => {
    if (!ev) return null;

    if (ev.startsAt) {
      const d = new Date(ev.startsAt);
      if (!Number.isNaN(d.getTime())) return d;
    }

    if (ev.fechaInicio) {
      const d = new Date(ev.fechaInicio);
      if (!Number.isNaN(d.getTime())) return d;
    }

    if (ev.fecha) {
      const dateStr = String(ev.fecha).split('T')[0];
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        let hours = 0;
        let minutes = 0;

        if (ev.hora) {
          const rawHora = String(ev.hora).trim();
          const isPM = /pm/i.test(rawHora);
          const isAM = /am/i.test(rawHora);
          const digits = rawHora.replace(/[^0-9:]/g, '');
          const timeParts = digits.split(':');
          hours = parseInt(timeParts[0] || '0', 10);
          minutes = parseInt(timeParts[1] || '0', 10);
          if (isPM && hours < 12) hours += 12;
          if (isAM && hours === 12) hours = 0;
        }

        const d = new Date(year, month, day, hours, minutes);
        if (!Number.isNaN(d.getTime())) return d;
      }
    }

    return null;
  };

  // Calcular fecha destino de ejecución del evento
  const targetDate = useMemo(() => {
    return parseTargetDate(activeEvent);
  }, [activeEvent]);

  // Estado del contador en tiempo real
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    const diff = targetDate.getTime() - Date.now();
    return {
      days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
      minutes: Math.max(0, Math.floor((diff / (1000 * 60)) % 60)),
      seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
      totalMs: diff,
    };
  });

  useEffect(() => {
    if (!targetDate) return;

    const updateCountdown = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        totalMs: diff,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isLive = Boolean(activeEvent) && timeLeft.totalMs <= 0;

  if (isLoading && !activeEvent) {
    return (
      <div className="w-full my-3 sm:my-4 rounded-2xl bg-[#F59E0B]/20 p-4 animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-[#F59E0B]/30 shrink-0" />
          <div className="space-y-2">
            <div className="w-48 sm:w-64 h-5 bg-[#F59E0B]/30 rounded" />
            <div className="w-32 sm:w-40 h-4 bg-[#F59E0B]/30 rounded" />
          </div>
        </div>
        <div className="w-32 sm:w-48 h-10 bg-[#F59E0B]/30 rounded-xl hidden sm:block" />
      </div>
    );
  }

  // Si no hay evento ni está cargando, no se muestra nada
  if (!activeEvent) {
    return null;
  }

  const displayImage = activeEvent.photo;
  const formattedDate = formatDisplayDate(activeEvent.fecha, activeEvent.hora) || activeEvent.date;
  const formattedTime = formatDisplayTime(activeEvent.hora, activeEvent.fecha);

  return (
    <div className="w-full my-3 sm:my-4 transition-all duration-300">
      <Link
        to={`/eventos/${activeEvent.id}`}
        aria-label={`Ver evento: ${activeEvent.title}`}
        className="group relative block w-full overflow-hidden rounded-2xl bg-[#F59E0B] shadow-md hover:shadow-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F59E0B]/50"
      >
        <div className="relative flex flex-col md:flex-row items-stretch justify-between w-full min-h-[110px] sm:min-h-[120px]">
          
          {/* LADO IZQUIERDO: Imagen a sangre ocupando el 100% del alto sin bordes ni márgenes */}
          <div className="relative w-full md:w-52 lg:w-60 xl:w-68 shrink-0 self-stretch min-h-[140px] md:min-h-full overflow-hidden bg-[#0B132B]">
            <img
              src={displayImage}
              alt={activeEvent.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
          </div>

          {/* CENTRO: Jerarquía tipográfica pura (Título grande en azul oscuro/negro + Fecha/Hora limpia sin íconos) */}
          <div className="relative z-10 flex-1 flex flex-col justify-center text-left px-5 py-4 sm:px-6 sm:py-5 min-w-0">
            <h2 className="font-display font-extrabold text-lg sm:text-xl lg:text-2xl text-[#0B132B] tracking-[-0.02em] leading-snug line-clamp-2">
              {activeEvent.title}
            </h2>

            {formattedDate && (
              <p className="text-xs sm:text-sm font-semibold text-[#0B132B]/75 mt-1.5 truncate">
                {formattedDate} {formattedTime ? `• ${formattedTime}` : ''}
              </p>
            )}
          </div>

          {/* LADO DERECHO: Reloj tabular de gran escala con números en blanco puro y unidades en azul oscuro */}
          <div className="relative z-10 shrink-0 flex flex-col items-center md:items-end justify-center px-5 py-4 sm:px-6 sm:py-5">
            {isLive ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B132B] text-white shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-ping" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest">{timeLabels.live}</span>
              </div>
            ) : (
              <div className="flex items-baseline justify-center md:justify-end gap-2 sm:gap-3 select-none">
                {/* DÍAS */}
                <div className="flex flex-col items-center">
                  <span className="font-mono font-black text-2xl sm:text-3xl lg:text-4xl text-white leading-none tabular-nums">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.1em] text-[#0B132B] uppercase mt-1">
                    {timeLabels.days}
                  </span>
                </div>

                <span className="text-white/80 font-bold text-xl sm:text-2xl leading-none -mt-3.5">:</span>

                {/* HORAS */}
                <div className="flex flex-col items-center">
                  <span className="font-mono font-black text-2xl sm:text-3xl lg:text-4xl text-white leading-none tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.1em] text-[#0B132B] uppercase mt-1">
                    {timeLabels.hours}
                  </span>
                </div>

                <span className="text-white/80 font-bold text-xl sm:text-2xl leading-none -mt-3.5">:</span>

                {/* MINUTOS */}
                <div className="flex flex-col items-center">
                  <span className="font-mono font-black text-2xl sm:text-3xl lg:text-4xl text-white leading-none tabular-nums">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.1em] text-[#0B132B] uppercase mt-1">
                    {timeLabels.mins}
                  </span>
                </div>

                <span className="text-white/80 font-bold text-xl sm:text-2xl leading-none -mt-3.5">:</span>

                {/* SEGUNDOS */}
                <div className="flex flex-col items-center">
                  <span className="font-mono font-black text-2xl sm:text-3xl lg:text-4xl text-white leading-none tabular-nums">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.1em] text-[#0B132B] uppercase mt-1">
                    {timeLabels.secs}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </Link>
    </div>
  );
}
