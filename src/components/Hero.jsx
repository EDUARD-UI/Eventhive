import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import videoPromocionalMobile from '../assets/video promocional.mp4';
import videoPromocionalDesktop from '../assets/16x9.mp4';
import cartagenaHeroPoster from '../assets/cartagena-hero.jpg';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Hero() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef(null);

  // Detección responsive para servir el video óptimo según el dispositivo
  // Móviles (< 768px): video vertical 9:16 ("video promocional")
  // Pantallas mayores (>= 768px): video panorámico 16:9 ("16x9.mp4")
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 768px)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleMediaChange = (e) => {
      setIsDesktop(e.matches);
      setIsVideoReady(false);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const activeVideoSrc = isDesktop ? videoPromocionalDesktop : videoPromocionalMobile;

  // Animación de entrada inicial suave
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Inicialización y reproducción fluida a velocidad nativa (1.0x para máxima nitidez y sin pérdida de frames)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      video.playbackRate = 1.0;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoReady(true);
          })
          .catch(() => {
            video.muted = true;
            video
              .play()
              .then(() => setIsVideoReady(true))
              .catch(() => {});
          });
      }
    }
  }, [isDesktop]);

  return (
    <section
      id="hero"
      aria-label="Hero Section"
      className="relative w-full min-h-[85vh] sm:min-h-[88vh] lg:min-h-[820px] flex items-center justify-center overflow-hidden bg-slate-950 text-white select-none"
    >
      {/* =========================================================
          1. VIDEO BACKGROUND OPTIMIZADO PARA MÁXIMA NITIDEZ (GPU)
         ========================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950 pointer-events-none">
        {/* Imagen póster estática (se desvanece de inmediato al cargar el video) */}
        <img
          src={cartagenaHeroPoster}
          alt="Cartagena Hero Poster"
          className={`absolute inset-0 w-full h-full object-cover object-center transform-gpu [backface-visibility:hidden] transition-opacity duration-700 ${
            isVideoReady ? 'opacity-0 scale-100 pointer-events-none' : 'opacity-100 scale-100'
          }`}
          loading="eager"
        />

        {/* 
          Video en bucle optimizado por dispositivo:
          - Pantallas mayores: promocional4X3.mp4
          - Dispositivos móviles: video promocional.mp4
          - object-cover + object-center: llena el 100% sin deformar la relación de aspecto
          - transform-gpu + [backface-visibility:hidden]: aísla el video en una capa de composición GPU dedicada
          - [image-rendering:-webkit-optimize-contrast]: prioriza contraste y bordes definidos
          - opacity-100: sin pases intermedios de renderizado offscreen
        */}
        <video
          key={isDesktop ? 'desktop-video' : 'mobile-video'}
          ref={videoRef}
          src={activeVideoSrc}
          poster={cartagenaHeroPoster}
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onLoadedData={() => setIsVideoReady(true)}
          onCanPlay={() => setIsVideoReady(true)}
          onPlaying={() => setIsVideoReady(true)}
          onError={() => setIsVideoReady(false)}
          className={`absolute inset-0 w-full h-full object-cover object-center transform-gpu will-change-transform [backface-visibility:hidden] [image-rendering:-webkit-optimize-contrast] transition-opacity duration-700 ${
            isVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={activeVideoSrc} type="video/mp4" />
        </video>

        {/* Gradiente horizontal sutil para asegurar perfecta legibilidad de texto a la izquierda sin apagar el video */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent pointer-events-none" />

        {/* Desvanecimiento superior sutil para integrar el navbar */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#080E1C]/80 to-transparent pointer-events-none" />

        {/* Difusión inferior suave hacia la siguiente sección */}
        <div
          className={`absolute inset-x-0 bottom-0 h-36 pointer-events-none transition-colors duration-500 ${
            isDark
              ? 'bg-gradient-to-t from-[#070D1B] via-[#070D1B]/70 to-transparent'
              : 'bg-gradient-to-t from-slate-50 via-slate-950/40 to-transparent'
          }`}
        />
      </div>

      {/* =========================================================
          2. CONTENIDO PRINCIPAL: TÍTULO, SUBTÍTULO Y BOTÓN CTA
         ========================================================= */}
      <div className="relative z-10 w-full max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 lg:py-24 flex flex-col justify-center">
        <div
          className={`max-w-3xl flex flex-col items-start text-left transition-all duration-700 ease-out transform ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Titular Principal */}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-6 text-white drop-shadow-lg">
            <span>{t('hero.titleLine1', 'Tus Eventos al')} </span>
            <span className="block mt-2 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent font-black">
              {t('hero.titleLine2', 'Ritmo de la Ciudad')}
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-slate-100/95 font-normal leading-relaxed mb-8 sm:mb-10 drop-shadow-md">
            {t(
              'hero.subtitle',
              'Descubre festivales, conciertos, arte, gastronomía y vida nocturna en la mágica Cartagena de Indias. Vive cada momento al máximo.'
            )}
          </p>

          {/* Botón Explorar Cartelera */}
          <div>
            <Link
              to="/buscar"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl sm:rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.03] active:scale-98 transition-all cursor-pointer group"
            >
              <span>{t('hero.cta', 'Explorar Cartelera')}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
