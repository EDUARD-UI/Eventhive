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

/* ─── Datos estáticos ───────────────────────────────────────────────── */
const VALUES = [
  {
    icon: FiHeart,
    title: 'Cultura Local',
    description:
      'Celebramos la identidad caribeña: el vallenato, el porro, la gastronomía y la arquitectura colonial de Cartagena son nuestro ADN.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
  },
  {
    icon: FiShield,
    title: 'Transparencia',
    description:
      'Información clara sobre precios, aforos y organizadores. Sin letra pequeña, sin sorpresas en la puerta del evento.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    icon: FiUsers,
    title: 'Comunidad',
    description:
      'Conectamos asistentes, artistas, organizadores y turistas en un ecosistema vivo donde cada voz importa.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    icon: FiZap,
    title: 'Innovación',
    description:
      'Tecnología ágil: QR de acceso seguro, mapas interactivos, recomendaciones personalizadas y métricas en tiempo real.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
];

const METRICS = [
  { icon: FiCalendar, value: '500+', label: 'Eventos publicados', suffix: '' },
  { icon: FiUsers, value: '10K+', label: 'Asistentes conectados', suffix: '' },
  { icon: FiMapPin, value: '100%', label: 'Sabor caribeño', suffix: '' },
  { icon: FiStar, value: '4.9', label: 'Calificación promedio', suffix: '★' },
];

/* ─── Contador animado ──────────────────────────────────────────────── */
function AnimatedCounter({ value, label, icon: Icon }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-3 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/25 shadow-inner">
        <Icon size={24} className="text-white" />
      </div>
      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{value}</span>
      <span className="text-sm text-slate-300 font-medium text-center">{label}</span>
    </div>
  );
}

/* ─── Componente principal ──────────────────────────────────────────── */
export default function AcercaDe() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden bg-[#0a1838] text-white py-24 sm:py-32 px-6 sm:px-12 lg:px-20"
          aria-labelledby="hero-heading"
        >
          {/* Decorative glows */}
          <div aria-hidden className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-brand/20 rounded-full blur-3xl pointer-events-none" />
          <div aria-hidden className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest bg-accent/20 text-accent border border-accent/30 mb-6">
              ¿Quiénes somos?
            </span>
            <h1
              id="hero-heading"
              className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6"
            >
              Conectando la vibrante{' '}
              <span className="text-accent">escena cultural</span> de Cartagena
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              En EventHive somos el puente entre creadores, organizadores, locales y turistas
              para descubrir y vivir las mejores experiencias del Caribe.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/buscar"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent hover:bg-accent-dark text-[#0a1838] font-bold text-sm uppercase tracking-wide shadow-md transition-all active:scale-95"
              >
                Explorar cartelera <FiArrowRight size={15} />
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/30 hover:border-white/60 text-white font-semibold text-sm transition-all active:scale-95"
              >
                Ser organizador
              </Link>
            </div>
          </div>
        </section>

        {/* ── MISIÓN Y VISIÓN ──────────────────────────────────────── */}
        <section
          className="py-20 sm:py-24 px-6 sm:px-12 lg:px-20 bg-white"
          aria-labelledby="mv-heading"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest bg-brand/10 text-brand mb-3">
                Propósito
              </span>
              <h2
                id="mv-heading"
                className="text-2xl sm:text-4xl font-extrabold text-[#0a1838] tracking-tight"
              >
                Misión y Visión
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Misión */}
              <article className="group relative rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                <div aria-hidden className="absolute -top-12 -right-12 w-40 h-40 bg-brand/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-6">
                  <FiTarget size={26} className="text-brand" aria-hidden />
                </div>
                <h3 className="text-xl font-black text-[#0a1838] mb-3">Nuestra Misión</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Impulsar la economía creativa y facilitar el acceso a la cultura, el arte,
                  la gastronomía y el deporte en Cartagena de Indias, conectando a comunidades
                  locales y visitantes con experiencias auténticas del Caribe colombiano.
                </p>
              </article>

              {/* Visión */}
              <article className="group relative rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                <div aria-hidden className="absolute -top-12 -right-12 w-40 h-40 bg-accent/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mb-6">
                  <FiEye size={26} className="text-amber-600" aria-hidden />
                </div>
                <h3 className="text-xl font-black text-[#0a1838] mb-3">Nuestra Visión</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
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
          className="py-20 sm:py-24 px-6 sm:px-12 lg:px-20 bg-slate-50 border-y border-slate-200/70"
          aria-labelledby="values-heading"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-700 mb-3">
                Lo que nos guía
              </span>
              <h2
                id="values-heading"
                className="text-2xl sm:text-4xl font-extrabold text-[#0a1838] tracking-tight"
              >
                Nuestros Valores
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
                Principios que definen cada decisión en EventHive, desde el diseño del producto
                hasta la atención a nuestros usuarios.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val) => {
                const Icon = val.icon;
                return (
                  <article
                    key={val.title}
                    className="group rounded-2xl bg-white border border-slate-200 p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl ${val.bg} flex items-center justify-center mb-5`}>
                      <Icon size={22} className={val.text} aria-hidden />
                    </div>
                    <h3 className="text-base font-black text-[#0a1838] mb-2">{val.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{val.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── MÉTRICAS ─────────────────────────────────────────────── */}
        <section
          className="py-20 sm:py-24 px-6 sm:px-12 lg:px-20 bg-gradient-to-r from-[#0a1838] via-[#0d2352] to-[#007bff] relative overflow-hidden"
          aria-labelledby="metrics-heading"
        >
          <div aria-hidden className="absolute -top-24 -left-24 w-96 h-96 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
          <div aria-hidden className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <span className="inline-block px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest bg-accent/20 text-accent border border-accent/30 mb-4">
              Impacto real
            </span>
            <h2
              id="metrics-heading"
              className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-14"
            >
              Números que hablan por sí solos
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
              {METRICS.map((m) => (
                <AnimatedCounter key={m.label} {...m} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────── */}
        <section
          className="py-20 sm:py-24 px-6 sm:px-12 lg:px-20 bg-white"
          aria-labelledby="cta-heading"
        >
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-50 border border-slate-200 p-10 sm:p-14 text-center shadow-card relative overflow-hidden">
            <div aria-hidden className="absolute -top-20 -right-20 w-64 h-64 bg-brand/5 rounded-full blur-2xl pointer-events-none" />
            <span className="inline-block px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest bg-brand/10 text-brand mb-4">
              Únete a la comunidad
            </span>
            <h2
              id="cta-heading"
              className="text-2xl sm:text-4xl font-extrabold text-[#0a1838] tracking-tight mb-4"
            >
              ¿Listo para vivir el Caribe?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
              Descubre la cartelera cultural de Cartagena o publica tu evento y llega a miles
              de asistentes y turistas cada semana.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/buscar"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-sm uppercase tracking-wide shadow-md transition-all active:scale-95"
              >
                Ver cartelera semanal <FiArrowRight size={14} />
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-borderc hover:border-brand text-slate-700 hover:text-brand font-semibold text-sm transition-all active:scale-95"
              >
                Ser organizador
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
