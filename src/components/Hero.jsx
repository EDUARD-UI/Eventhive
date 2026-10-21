import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';
import BeeParticles from './home/BeeParticles.jsx';
import CartagenaHiveSkyline from './home/CartagenaHiveSkyline.jsx';
import HexagonalHivePattern from './common/HexagonalHivePattern.jsx';
import promocionalVideo from '../assets/promocional.mp4';
import cartagenaHeroPoster from '../assets/cartagena-hero.jpg';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

/**
 * 4-point sparkle star matching the reference design (vector limpio, sin emojis)
 */
function SparkleStar({ className = 'w-5 h-5 text-amber-400' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
    </svg>
  );
}

// Ruta SVG normalizada (0 a 1) para recorte orgánico y contorno idéntico a la referencia
const HERO_SHAPE_PATH =
  'M 0,0.22 C 0,0.16 0.03,0.13 0.08,0.13 L 0.36,0.13 C 0.46,0.13 0.48,0.0 0.58,0.0 L 0.92,0.0 C 0.97,0.0 1.0,0.03 1.0,0.08 L 1.0,0.72 C 1.0,0.77 0.97,0.80 0.92,0.80 L 0.76,0.80 C 0.68,0.80 0.65,1.0 0.55,1.0 L 0.08,1.0 C 0.03,1.0 0,0.97 0,0.92 Z';

export default function Hero() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef(null);

  // Animación de entrada inicial suave
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Garantizar reproducción automática, fluida y en bucle sin requerir interacción del usuario a 0.75x
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = 0.75;
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoReady(true);
          })
          .catch(() => {
            // Reintentar asegurando estado silenciado para políticas de autoplay
            video.muted = true;
            video.playbackRate = 0.75;
            video.play().then(() => setIsVideoReady(true)).catch(() => {});
          });
      }
    }
  }, []);

  // Transición suave de scroll fluido
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Progreso de desplazamiento normalizado
  const scrollProgress = Math.min(1, Math.max(0, scrollY / 550));
  const scale = 1 - scrollProgress * 0.04;
  const opacity = 1 - scrollProgress * 0.35;
  const translateY = scrollProgress * 20;

  // Clase de estilo dinámico para destellos y chispas según tema
  const sparkleClass = isDark
    ? 'text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
    : 'text-amber-500/40';

  return (
    <section
      id="hero"
      className={`relative overflow-visible select-none min-h-[64vh] sm:min-h-[70vh] lg:min-h-[74vh] max-h-[800px] pb-12 sm:pb-16 lg:pb-20 flex flex-col justify-between transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-b from-[#0F172A] via-[#090D1A] to-[#05070F] text-white'
          : 'bg-gradient-to-b from-[#EDF4F9] via-[#F8FAFC] to-[#F1F5F9] text-slate-900 border-b border-slate-200/60'
      }`}
    >
      {/* Definición SVG del clipPath para la silueta orgánica asimétrica del video */}
      <svg width="0" height="0" className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="heroMediaShape" clipPathUnits="objectBoundingBox">
            <path d={HERO_SHAPE_PATH} />
          </clipPath>
        </defs>
      </svg>

      {/* Contenedor ambiental: Colmena ascendente, Partículas y Silueta Muralla */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <HexagonalHivePattern variant="hero" />
        <BeeParticles />
        <CartagenaHiveSkyline />
      </div>

      {/* Contenido Principal con Transición de Scroll y Entrada Cinemática */}
      <div
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity,
          willChange: 'transform, opacity',
        }}
        className="relative z-10 mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12 py-5 sm:py-6 lg:py-8 my-auto flex-1 flex flex-col justify-center transition-all duration-75"
      >
        {/* =========================================================
            VISTA RESPONSIVE PARA DISPOSITIVOS PEQUEÑOS (< lg):
            Video integrado como fondo dinámico de alto impacto con poster inmediato
           ========================================================= */}
        <div
          className={`lg:hidden relative rounded-3xl overflow-hidden border border-white/10 dark:border-white/10 shadow-2xl p-6 sm:p-10 text-left bg-slate-950 flex flex-col justify-end min-h-[400px] sm:min-h-[460px] max-h-[540px] transform transition-all duration-700 ease-out ${
            isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.98]'
          }`}
        >
          {/* Fondo multimedia: Imagen póster de respaldo inmediata + Video con fade-in */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
            <img
              src={cartagenaHeroPoster}
              alt="Cartagena de Indias"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-out ${
                isVideoReady ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <video
              src={promocionalVideo}
              poster={cartagenaHeroPoster}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setIsVideoReady(true)}
              onCanPlay={() => setIsVideoReady(true)}
              onPlaying={() => setIsVideoReady(true)}
              className={`w-full h-full object-cover object-center transition-opacity duration-700 ease-out ${
                isVideoReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {/* Gradiente oscuro cinematográfico que garantiza legibilidad óptima de los textos */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/40 pointer-events-none" />
          </div>

          {/* Contenido en primer plano con tamaño equilibrado */}
          <div className="relative z-10 flex flex-col items-start space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
              <FiMapPin className="text-amber-400 shrink-0" size={14} />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl leading-[1.08] text-white tracking-tight drop-shadow-md">
              {t('hero.titleLine1')} <br />
              <span className="text-amber-400 drop-shadow-sm">{t('hero.titleLine2')}</span>
            </h1>

            <p className="text-xs sm:text-base text-slate-200 leading-relaxed max-w-lg font-normal drop-shadow-xs">
              {t('hero.subtitleMobile')}
            </p>

            <div className="pt-1">
              <Link
                to="/buscar"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all"
              >
                <span>{t('hero.cta')}</span>
                <span className="w-6 h-6 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xs">
                  <FiArrowRight size={13} strokeWidth={2.8} />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================
            VISTA DESKTOP (>= lg):
            Diseño en 2 columnas con tipografía y video compactados elegantemente
           ========================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Columna Izquierda: Textos y Botón Ver Catálogo con Entrada Staggered */}
          <div className="lg:col-span-5 flex flex-col items-start text-left relative z-20">

            {/* Ubicación y Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 border transition-all duration-700 delay-100 ease-out transform ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
              } ${
                isDark
                  ? 'bg-slate-900/80 border-white/10 text-slate-300 shadow-none'
                  : 'bg-white/95 border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              <FiMapPin className="text-amber-600 dark:text-amber-400 shrink-0" size={14} />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Título Principal Compactado */}
            <h1
              className={`font-display font-black text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] leading-[1.05] tracking-tight mb-4 drop-shadow-xs transition-all duration-700 delay-200 ease-out transform ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              } ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {t('hero.titleLine1')} <br />
              <span className="text-amber-600 dark:text-amber-400 drop-shadow-xs">
                {t('hero.titleLine2')}
              </span>
            </h1>

            {/* Subtítulo descriptivo */}
            <p
              className={`max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed font-normal mb-6 sm:mb-8 text-slate-600 dark:text-slate-300 transition-all duration-700 delay-300 ease-out transform ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              {t('hero.subtitle')}
            </p>

            {/* Botón Ver Catálogo */}
            <div
              className={`relative flex items-center transition-all duration-700 delay-400 ease-out transform ${
                isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'
              }`}
            >
              <Link
                to="/buscar"
                className="group relative inline-flex items-center gap-3.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-xl dark:shadow-amber-500/15 hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              >
                <span>{t('hero.cta')}</span>
                <span className="w-7 h-7 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform duration-200">
                  <FiArrowRight size={15} strokeWidth={2.8} />
                </span>
              </Link>

              {/* Destello decorativo inferior derecho del botón */}
              <div className="absolute -bottom-5 left-52 sm:left-64 pointer-events-none">
                <SparkleStar className={`w-4 h-4 ${sparkleClass}`} />
              </div>

              {/* Chispa sutil superior izquierda del botón */}
              <div className="absolute -top-3 left-44 sm:left-52 pointer-events-none">
                <SparkleStar className={`w-3 h-3 ${sparkleClass}`} />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Video con Silueta Orgánica y Carga Inmediata */}
          <div
            className={`lg:col-span-7 flex justify-center lg:justify-end relative h-full w-full lg:translate-x-4 xl:translate-x-8 transition-all duration-1000 delay-200 ease-out transform ${
              isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.96]'
            }`}
          >
            <div className="relative w-full max-w-[480px] sm:max-w-[560px] lg:max-w-[660px] xl:max-w-[740px] h-full group mx-auto lg:mr-0">
              
              {/* Destellos festivos flotantes alrededor de la tarjeta */}
              <div className="absolute -top-4 -left-3 sm:-top-5 sm:-left-4 z-30 pointer-events-none">
                <SparkleStar className={`w-5 h-5 sm:w-6 sm:h-6 ${sparkleClass}`} />
              </div>
              <div className="absolute -top-3 right-12 sm:right-20 z-30 pointer-events-none">
                <SparkleStar className={`w-4 h-4 ${sparkleClass}`} />
              </div>
              <div className="absolute -bottom-5 -left-2 sm:-bottom-6 sm:-left-3 z-30 pointer-events-none">
                <SparkleStar className={`w-4 h-4 sm:w-5 sm:h-5 ${sparkleClass}`} />
              </div>
              <div className="absolute top-1/3 -right-3 sm:-right-5 z-30 pointer-events-none">
                <SparkleStar className={`w-3.5 h-3.5 ${sparkleClass}`} />
              </div>

              {/* Contenedor con Silueta Orgánica / Asimétrica del Video Compactado */}
              <div className="relative w-full h-[300px] sm:h-[360px] md:h-[420px] lg:h-[470px] xl:h-[530px] filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_25px_50px_rgba(0,0,0,0.65)]">
                
                {/* Elemento recortado con la silueta curva */}
                <div
                  style={{ clipPath: 'url(#heroMediaShape)' }}
                  className="relative w-full h-full overflow-hidden bg-slate-950 transition-all duration-500 ease-out"
                >
                  {/* Póster de alta calidad inmediato para eliminar por completo la pantalla en negro */}
                  <img
                    src={cartagenaHeroPoster}
                    alt="Cartagena de Indias"
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-out pointer-events-none ${
                      isVideoReady ? 'opacity-0' : 'opacity-100'
                    }`}
                  />

                  {/* Video con transición de fade-in cuando los datos estén listos */}
                  <video
                    ref={videoRef}
                    src={promocionalVideo}
                    poster={cartagenaHeroPoster}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onLoadedData={() => setIsVideoReady(true)}
                    onCanPlay={() => setIsVideoReady(true)}
                    onPlaying={() => setIsVideoReady(true)}
                    onLoadedMetadata={(e) => {
                      e.currentTarget.playbackRate = 0.75;
                      setIsVideoReady(true);
                    }}
                    className={`w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-all duration-700 ease-out ${
                      isVideoReady ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Sombra ambiental cinematográfica para contraste */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/15 pointer-events-none" />

                  {/* Badge sutil inferior izquierdo dentro del video: La Heroica */}
                  <div className="absolute bottom-4 left-5 sm:bottom-5 sm:left-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md">
                    <FiMapPin size={13} className="shrink-0" />
                    <span>La Heroica</span>
                  </div>
                </div>

                {/* Borde vectorial continuo SVG que sigue exactamente la silueta recortada */}
                <svg
                  viewBox="0 0 1 1"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                >
                  <path
                    d={HERO_SHAPE_PATH}
                    fill="none"
                    stroke={isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(255, 255, 255, 0.9)'}
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

