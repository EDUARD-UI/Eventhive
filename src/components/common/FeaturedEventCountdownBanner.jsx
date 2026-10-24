import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar } from 'react-icons/fi';
import cartagenaHeroPoster from '../../assets/cartagena-hero.jpg';
import { formatDisplayDate, formatDisplayTime } from '../../services/eventService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * FeaturedEventCountdownBanner
 * Banner cinemático panorámico en dorado ámbar con temporizador de alta visibilidad,
 * números en blanco, barra de progreso azul oscuro, e imagen a toda la altura con degradado integrador.
 *
 * @param {Object} props
 * @param {Object} props.event - Evento destacado más próximo a la fecha actual.
 * @param {boolean} [props.isLoading] - Estado de carga opcional.
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

  // Evento activo con respaldo en caso de retraso en la red
  const activeEvent = useMemo(() => {
    if (event) return event;
    return {
      id: 2,
      title: 'Vallenato Fest Cartagena',
      fecha: '2026-12-12',
      hora: '19:00',
      date: 'Sáb · Dic 12',
      description: 'Gran noche de vallenato en el corazón de Cartagena de Indias.',
      photo: cartagenaHeroPoster,
    };
  }, [event]);

  // Función robusta para interpretar la fecha exacta del evento sin errores de parseo
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

  // Calcular fecha destino del evento
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

  if (isLoading && !event) {
    return (
      <div className="w-full my-3 rounded-2xl bg-amber-500/20 border border-amber-400/30 p-4 sm:p-5 animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl bg-amber-500/30 shrink-0" />
          <div className="space-y-2">
            <div className="w-48 sm:w-64 h-6 bg-amber-500/30 rounded" />
            <div className="w-36 h-3 bg-amber-500/30 rounded" />
          </div>
        </div>
        <div className="w-40 h-10 bg-amber-500/30 rounded-xl hidden sm:block" />
      </div>
    );
  }

  const isLive = timeLeft.totalMs <= 0;

  // Barra de progreso dinámica que compara la fecha del evento con la fecha actual
  const progressRatio = useMemo(() => {
    if (isLive) return 100;
    if (!targetDate) return 0;

    const remainingMs = timeLeft.totalMs;

    // Si el evento tiene fecha de registro o creación oficial
    const createdDate = activeEvent.createdAt || activeEvent.creadoEn || activeEvent.fechaCreacion;
    if (createdDate) {
      const startMs = new Date(createdDate).getTime();
      if (!Number.isNaN(startMs) && startMs < targetDate.getTime()) {
        const totalDuration = targetDate.getTime() - startMs;
        const elapsed = Date.now() - startMs;
        return Math.max(5, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
      }
    }

    // Ventana de referencia proporcional de 30 días
    const referenceWindowMs = 30 * 24 * 60 * 60 * 1000;
    if (remainingMs > referenceWindowMs) {
      return Math.max(8, Math.min(25, Math.round((1 - remainingMs / (90 * 24 * 60 * 60 * 1000)) * 25)));
    }

    const elapsed = referenceWindowMs - remainingMs;
    return Math.max(10, Math.min(100, Math.round((elapsed / referenceWindowMs) * 100)));
  }, [isLive, targetDate, timeLeft.totalMs, activeEvent]);

  const displayImage =
    activeEvent.photo ||
    activeEvent.url_imagen_destacado ||
    activeEvent.url_imagen_promocionado ||
    activeEvent.imagenPromocional ||
    cartagenaHeroPoster;

  const formattedDate = formatDisplayDate(activeEvent.fecha, activeEvent.hora) || activeEvent.date;
  const formattedTime = formatDisplayTime(activeEvent.hora, activeEvent.fecha);

  return (
    <div className="w-full my-3 sm:my-4 transition-all duration-300">
      <Link
        to={`/eventos/${activeEvent.id}`}
        aria-label={`Ver evento destacado: ${activeEvent.title}`}
        className="group relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-400/90 dark:border-amber-400/80 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
      >
        <div className="relative flex flex-col md:flex-row items-stretch justify-between w-full min-h-[140px] sm:min-h-[150px]">
          
          {/* LADO IZQUIERDO: Imagen que ocupa toda la altura del componente con degradado ámbar derecho */}
          <div className="relative w-full md:w-56 lg:w-72 xl:w-80 shrink-0 self-stretch min-h-[160px] md:min-h-[150px] overflow-hidden">
            <img
              src={displayImage}
              alt={activeEvent.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {/* Degradado dorado ámbar desde la derecha (y desde abajo en mobile) para integrarse perfectamente */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-amber-500/40 to-amber-500 pointer-events-none"
            />
            {isLive && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#0B132B] text-white shadow-md animate-pulse">
                {timeLabels.live}
              </span>
            )}
          </div>

          {/* CENTRO: Título del Evento y Fecha/Hora */}
          <div className="relative z-10 flex-1 flex flex-col justify-center text-left px-5 py-4 sm:px-6 min-w-0">
            <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-slate-950 tracking-tight leading-snug line-clamp-2 drop-shadow-xs group-hover:text-black transition-colors">
              {activeEvent.title}
            </h2>

            {formattedDate && (
              <p className="text-xs sm:text-sm font-bold text-amber-950/90 truncate mt-1 flex items-center gap-1.5">
                <FiCalendar size={13} className="text-slate-950 shrink-0" />
                <span>
                  {formattedDate} {formattedTime ? `• ${formattedTime}` : ''}
                </span>
              </p>
            )}
          </div>

          {/* LADO DERECHO: Contador dinámico con números en blanco y barra en azul oscuro */}
          <div className="relative z-10 shrink-0 flex flex-col items-center md:items-end justify-center px-5 py-4 sm:px-6">
            {isLive ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B132B] text-white shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-sm font-black uppercase tracking-widest">{timeLabels.live}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center md:items-end w-full max-w-[320px]">
                {/* Números del contador en blanco */}
                <div className="flex items-baseline justify-center md:justify-end gap-1.5 sm:gap-2 font-mono font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight select-none">
                  <div className="flex flex-col items-center">
                    <span className="tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-white/90 -mt-0.5">
                      {timeLabels.days}
                    </span>
                  </div>

                  <span className="text-white/80 font-bold -mt-2 animate-pulse">:</span>

                  <div className="flex flex-col items-center">
                    <span className="tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-white/90 -mt-0.5">
                      {timeLabels.hours}
                    </span>
                  </div>

                  <span className="text-white/80 font-bold -mt-2 animate-pulse">:</span>

                  <div className="flex flex-col items-center">
                    <span className="tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-white/90 -mt-0.5">
                      {timeLabels.mins}
                    </span>
                  </div>

                  <span className="text-white/80 font-bold -mt-2 animate-pulse">:</span>

                  <div className="flex flex-col items-center">
                    <span className="tabular-nums text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-white/90 -mt-0.5">
                      {timeLabels.secs}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso en azul oscuro con indicador */}
                <div className="w-full mt-2.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-950/80 mb-1">
                    <span>{isEn ? 'Event Countdown' : 'Progreso al Evento'}</span>
                    <span className="font-mono font-bold text-slate-950">{progressRatio}%</span>
                  </div>
                  <div className="w-full bg-[#070D1E]/20 border border-[#0B132B]/35 rounded-full h-2.5 overflow-hidden p-[1px] shadow-inner">
                    <div
                      className="h-full rounded-full bg-[#0B132B] shadow-sm transition-all duration-1000 ease-linear"
                      style={{ width: `${progressRatio}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </Link>
    </div>
  );
}

