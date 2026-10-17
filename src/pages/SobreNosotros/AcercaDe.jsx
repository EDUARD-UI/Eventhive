import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTarget,
  FiEye,
  FiHeart,
  FiShield,
  FiUsers,
  FiZap,
  FiArrowRight,
  FiCalendar,
  FiStar,
  FiMapPin,
} from 'react-icons/fi';
import Navbar from '../../components/usersComponets/Navbar.jsx';
import Footer from '../../components/usersComponets/Footer.jsx';
import FloatingDotsBackground from '../../components/common/FloatingDotsBackground.jsx';
import CityRhythmPreFooter from '../../components/home/CityRhythmPreFooter.jsx';

/* ─── Datos estáticos ───────────────────────────────────────────────── */
const VALUES = [
  {
    icon: FiHeart,
    title: 'Cultura Local',
    description:
      'Celebramos la identidad caribeña: el vallenato, el porro, la gastronomía y la arquitectura colonial de Cartagena son nuestro ADN.',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  },
  {
    icon: FiShield,
    title: 'Transparencia',
    description:
      'Información clara sobre precios, aforos y organizadores. Sin letra pequeña, sin sorpresas en la puerta del evento.',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  },
  {
    icon: FiUsers,
    title: 'Comunidad',
    description:
      'Conectamos asistentes, artistas, organizadores y turistas en un ecosistema vivo donde cada voz importa.',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  },
  {
    icon: FiZap,
    title: 'Innovación',
    description:
      'Tecnología ágil: QR de acceso seguro, mapas interactivos, recomendaciones personalizadas y métricas en tiempo real.',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  },
];

const METRICS = [
  { icon: FiCalendar, value: '500+', label: 'Eventos publicados', suffix: '' },
  { icon: FiUsers, value: '10K+', label: 'Asistentes conectados', suffix: '' },
  { icon: FiMapPin, value: '100%', label: 'Sabor caribeño', suffix: '' },
  { icon: FiStar, value: '4.9', label: 'Calificación promedio', suffix: '★' },
];

/* ─── Contador animado que va aumentando de 1 al número final ──────── */
function AnimatedCounter({ value, label, icon: Icon, suffix = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(1);

  // Extraer número objetivo y sufijo (ej: 500+, 10K+, 100%, 4.9)
  const isDecimal = value.includes('.');
  const numericTarget = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const customSuffix = value.replace(/[0-9.]/g, '') + suffix;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let startTime = null;
    const duration = 1600;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Función de aceleración suave (easeOutExpo)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = 1 + (numericTarget - 1) * ease;

      if (isDecimal) {
        setDisplayValue(current.toFixed(1));
      } else {
        setDisplayValue(Math.floor(current));
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(isDecimal ? numericTarget.toFixed(1) : numericTarget);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [visible, numericTarget, isDecimal]);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-3 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-400/30 shadow-xs">
        <Icon size={24} className="text-amber-500" />
      </div>
      <span className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
        {displayValue}
        <span className="text-amber-500">{customSuffix}</span>
      </span>
      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center">{label}</span>
    </div>
  );
}

/* ─── Componente principal AcercaDe ─────────────────────────────────── */
export default function AcercaDe() {
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-body relative transition-colors duration-200">
      <FloatingDotsBackground />
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden bg-gradient-to-b from-[#0B132B] via-[#0E1A38] to-[#070D1B] text-white py-20 sm:py-28 px-6 sm:px-12 lg:px-20 text-center border-b border-slate-800"
          aria-labelledby="hero-heading"
        >
          {/* Resplandores ambientales cálidos */}
          <div aria-hidden className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div aria-hidden className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-6 shadow-xs">
              ¿Quiénes somos?
            </span>
            <h1
              id="hero-heading"
              className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6 text-white uppercase"
            >
              Conectando la vibrante{' '}
              <span className="text-amber-400 drop-shadow-sm">escena cultural</span> de Cartagena
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
              En EventHive somos el puente entre creadores, organizadores, locales y turistas
              para descubrir y vivir las mejores experiencias del Caribe colombiano.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/buscar"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all"
              >
                <span>Explorar cartelera</span>
                <FiArrowRight size={15} />
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-white/20 hover:border-amber-400 text-white font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-white/5 transition-all active:scale-95"
              >
                Ser organizador
              </Link>
            </div>
          </div>
        </section>

        {/* ── MISIÓN Y VISIÓN ──────────────────────────────────────── */}
        <section
          className="py-16 sm:py-24 px-6 sm:px-12 lg:px-20"
          aria-labelledby="mv-heading"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 mb-3">
                Propósito
              </span>
              <h2
                id="mv-heading"
                className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase"
              >
                Misión y Visión
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Misión */}
              <article className="group relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0B1428]/80 p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-6">
                  <FiTarget size={26} aria-hidden />
                </div>
                <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase mb-3">Nuestra Misión</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  Impulsar la economía creativa y facilitar el acceso a la cultura, el arte,
                  la gastronomía y el deporte en Cartagena de Indias, conectando a comunidades
                  locales y visitantes con experiencias auténticas del Caribe colombiano.
                </p>
              </article>

              {/* Visión */}
              <article className="group relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0B1428]/80 p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-6">
                  <FiEye size={26} aria-hidden />
                </div>
                <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase mb-3">Nuestra Visión</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  Convertirnos en la plataforma de referencia para eventos en el Caribe colombiano,
                  ofreciendo tecnología ágil, accesible y segura tanto para asistentes como
                  para organizadores de cualquier escala.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── VALORES ──────────────────────────────────────────────── */}
        <section
          className="py-16 sm:py-24 px-6 sm:px-12 lg:px-20 border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B132B]/40"
          aria-labelledby="values-heading"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 mb-3">
                Lo que nos guía
              </span>
              <h2
                id="values-heading"
                className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase"
              >
                Nuestros Valores
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
                Principios que definen cada decisión en EventHive, desde el diseño de experiencias
                hasta la atención a nuestros usuarios.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val) => {
                const Icon = val.icon;
                return (
                  <article
                    key={val.title}
                    className="group rounded-2xl bg-white dark:bg-[#0B1428] border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-amber-400/60 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl ${val.badgeBg} flex items-center justify-center mb-5`}>
                      <Icon size={22} aria-hidden />
                    </div>
                    <h3 className="text-base font-black text-slate-950 dark:text-white uppercase mb-2">{val.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{val.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── MÉTRICAS CON CONTADOR ANIMADO QUE AUMENTA DESDE 1 ───────── */}
        <section
          className="py-16 sm:py-24 px-6 sm:px-12 lg:px-20 bg-white/70 dark:bg-[#0B1428]/70 border-b border-slate-200 dark:border-slate-800"
          aria-labelledby="metrics-heading"
        >
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 mb-4">
              Impacto real
            </span>
            <h2
              id="metrics-heading"
              className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase mb-14"
            >
              Números que hablan por sí solos
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              {METRICS.map((m) => (
                <AnimatedCounter key={m.label} {...m} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────── */}
        <section
          className="py-16 sm:py-20 px-6 sm:px-12 lg:px-20"
          aria-labelledby="cta-heading"
        >
          <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-[#0B1428] border border-slate-200 dark:border-slate-800 p-8 sm:p-14 text-center shadow-md relative overflow-hidden">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 mb-4">
              Únete a la comunidad
            </span>
            <h2
              id="cta-heading"
              className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight uppercase mb-4"
            >
              ¿Listo para vivir Cartagena?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
              Descubre la cartelera cultural de Cartagena o publica tu evento y llega a miles
              de asistentes y turistas cada semana.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/buscar"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                <span>Ver cartelera semanal</span>
                <FiArrowRight size={15} />
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95"
              >
                Ser organizador
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Pre-Footer y Footer */}
      <CityRhythmPreFooter />
      <Footer />
    </div>
  );
}
