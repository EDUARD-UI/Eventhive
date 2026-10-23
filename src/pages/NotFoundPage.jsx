import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiCompass, FiArrowLeft, FiLifeBuoy, FiArrowRight } from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import HexagonalHivePattern from '../components/common/HexagonalHivePattern.jsx';
import FloatingDotsBackground from '../components/common/FloatingDotsBackground.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useLenisScroll } from '../hooks/useLenisScroll.js';

export default function NotFoundPage() {
  useLenisScroll();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  // Actualizar título de la pestaña para SEO y accesibilidad
  useEffect(() => {
    const prevTitle = document.title;
    document.title = '404 - Oops! | EventHive';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#070D1B] text-slate-900 dark:text-white transition-colors duration-200 overflow-x-hidden selection:bg-amber-400 selection:text-slate-950 font-body">
      <Navbar />
      <main className="flex-1 relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 transition-opacity">
          <HexagonalHivePattern variant="hero" />
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
          <FloatingDotsBackground />
        </div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-gradient-to-tr from-amber-400/20 via-orange-400/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="relative z-10 max-w-2xl w-full text-center space-y-5 sm:space-y-6 my-auto">
          <div className="relative w-full max-w-[480px] sm:max-w-[540px] mx-auto select-none">
            <style>{`
              @keyframes gearSpinSlow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes gearSpinReverse {
                from { transform: rotate(0deg); }
                to { transform: rotate(-360deg); }
              }
              @keyframes beeHeadScratch {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(3deg); }
              }
              @keyframes dizzyTwinkle {
                0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
                50% { transform: scale(1.15) rotate(180deg); opacity: 0.5; }
              }
              @keyframes sparkFlash {
                0%, 100% { opacity: 0.2; transform: scale(0.9); }
                50% { opacity: 1; transform: scale(1.2); }
              }
              .animate-gear-slow {
                transform-origin: center;
                animation: gearSpinSlow 18s linear infinite;
              }
              .animate-gear-rev {
                transform-origin: center;
                animation: gearSpinReverse 14s linear infinite;
              }
              .animate-bee-head {
                transform-origin: 270px 225px;
                animation: beeHeadScratch 4s ease-in-out infinite;
              }
              .animate-dizzy-star {
                transform-origin: center;
                animation: dizzyTwinkle 3s ease-in-out infinite;
              }
              .animate-spark {
                transform-origin: center;
                animation: sparkFlash 1.5s ease-in-out infinite;
              }
            `}</style>

            <svg
              viewBox="0 0 540 465"
              className="w-full h-auto drop-shadow-sm overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Degradado ámbar corporativo para la abejita */}
                <linearGradient id="beeGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>

                {/* Sombra suave de suelo */}
                <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0B1B3D" stopOpacity={isDark ? '0.6' : '0.2'} />
                  <stop offset="100%" stopColor="#0B1B3D" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* ─── FONDO DECORATIVO: Ladrillos sutiles tipo muro colonial ─── */}
              <g stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)'} strokeWidth="1.2">
                <rect x="40" y="25" width="40" height="16" rx="2" fill="none" />
                <rect x="90" y="15" width="35" height="16" rx="2" fill="none" />
                <rect x="430" y="25" width="40" height="16" rx="2" fill="none" />
                <rect x="480" y="15" width="35" height="16" rx="2" fill="none" />
                <rect x="25" y="65" width="45" height="16" rx="2" fill="none" />
                <rect x="475" y="70" width="40" height="16" rx="2" fill="none" />
              </g>

              <text
                x="270"
                y="46"
                textAnchor="middle"
                className="font-display font-black text-4xl sm:text-5xl tracking-tight select-none"
                fill={isDark ? '#F8FAFC' : '#0B1B3D'}
                style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900 }}
              >
                Oops!
              </text>

              <g
                fill={isDark ? '#1E293B' : '#0B1B3D'}
                stroke={isDark ? '#475569' : '#0B1B3D'}
                strokeWidth="2.5"
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 900,
                  fontSize: '165px',
                  letterSpacing: '-2px',
                }}
              >
           
                <text x="120" y="165" textAnchor="middle">
                  4
                </text>
         
                <text x="270" y="165" textAnchor="middle">
                  0
                </text>
            
                <text x="420" y="165" textAnchor="middle">
                  4
                </text>
              </g>

              {/* ─── ENGRANAJES Y ESPIRALES FLOTANTES ALREDEDOR DEL 404 ─── */}
              <g transform="translate(62, 78)" className="animate-gear-slow">
                <circle cx="0" cy="0" r="14" fill={isDark ? '#28364F' : '#1E293B'} stroke={isDark ? '#475569' : '#0B1B3D'} strokeWidth="2.5" />
                <circle cx="0" cy="0" r="5" fill="#F8FAFC" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                  <rect
                    key={ang}
                    x="-2.5"
                    y="-17"
                    width="5"
                    height="5"
                    fill={isDark ? '#28364F' : '#1E293B'}
                    stroke={isDark ? '#475569' : '#0B1B3D'}
                    strokeWidth="1.5"
                    transform={`rotate(${ang})`}
                  />
                ))}
              </g>

              <path
                d="M74,78 C88,55 102,95 116,68 C124,54 136,78 146,64"
                fill="none"
                stroke={isDark ? '#94A3B8' : '#0B1B3D'}
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              <g transform="translate(440, 68)" className="animate-gear-rev">
                <circle cx="0" cy="0" r="12" fill={isDark ? '#28364F' : '#1E293B'} stroke={isDark ? '#475569' : '#0B1B3D'} strokeWidth="2.5" />
                <circle cx="0" cy="0" r="4" fill="#F8FAFC" />
                {[0, 60, 120, 180, 240, 300].map((ang) => (
                  <rect
                    key={ang}
                    x="-2.5"
                    y="-15"
                    width="4"
                    height="4"
                    fill={isDark ? '#28364F' : '#1E293B'}
                    stroke={isDark ? '#475569' : '#0B1B3D'}
                    strokeWidth="1.5"
                    transform={`rotate(${ang})`}
                  />
                ))}
              </g>
              <path
                d="M395,78 C410,54 425,90 438,64 C448,48 460,70 472,55"
                fill="none"
                stroke={isDark ? '#94A3B8' : '#0B1B3D'}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <g transform="translate(30, 265)">
                <path
                  d="M10,85 L4,135 C3,142 9,148 16,148 L36,148 C43,148 49,142 48,135 L42,85 Z"
                  fill="#F59E0B"
                  stroke="#0B1B3D"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
             
                <rect
                  x="7"
                  y="77"
                  width="38"
                  height="10"
                  rx="3"
                  fill="#D97706"
                  stroke="#0B1B3D"
                  strokeWidth="3"
                />

           
                <path d="M22,77 Q12,50 6,32" fill="none" stroke="#0B1B3D" strokeWidth="2.5" />
                <path
                  d="M6,32 C-2,28 -3,14 6,10 C15,14 14,28 6,32 Z"
                  fill="#FBBF24"
                  stroke="#0B1B3D"
                  strokeWidth="2.5"
                />
                <circle cx="6" cy="22" r="3" fill="#D97706" />

            
                <path d="M26,77 Q26,38 28,15" fill="none" stroke="#0B1B3D" strokeWidth="2.5" />
                <path
                  d="M28,15 C20,11 19,-3 28,-7 C37,-3 36,11 28,15 Z"
                  fill="#FBBF24"
                  stroke="#0B1B3D"
                  strokeWidth="2.5"
                />
                <circle cx="28" cy="4" r="3.5" fill="#D97706" />

                <path d="M30,77 Q40,55 46,38" fill="none" stroke="#0B1B3D" strokeWidth="2.5" />
                <path
                  d="M46,38 C38,34 39,20 48,16 C57,20 56,34 46,38 Z"
                  fill="#FBBF24"
                  stroke="#0B1B3D"
                  strokeWidth="2.5"
                />
                <circle cx="48" cy="27" r="3" fill="#D97706" />
              </g>
              <ellipse cx="270" cy="442" rx="200" ry="16" fill="url(#groundShadow)" />

              <g transform="translate(0, 40)">
              
                <g transform="translate(200, 195) rotate(-22)">
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="38"
                    ry="20"
                    fill="rgba(255, 255, 255, 0.92)"
                    stroke="#0B1B3D"
                    strokeWidth="3.2"
                  />
                  {/* Vena decorativa del ala */}
                  <path d="M-28,0 Q0,-4 25,0" fill="none" stroke="#F59E0B" strokeWidth="2" />
                  <path d="M-6,-2 Q10,-12 20,-8" fill="none" stroke="#F59E0B" strokeWidth="1.6" />
                </g>

                {/* Ala derecha caída/abierta */}
                <g transform="translate(340, 195) rotate(22)">
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="38"
                    ry="20"
                    fill="rgba(255, 255, 255, 0.92)"
                    stroke="#0B1B3D"
                    strokeWidth="3.2"
                  />
                  {/* Vena decorativa del ala */}
                  <path d="M-25,0 Q0,-4 28,0" fill="none" stroke="#F59E0B" strokeWidth="2" />
                  <path d="M-20,-8 Q-10,-12 6,-2" fill="none" stroke="#F59E0B" strokeWidth="1.6" />
                </g>
                {/* CUERPO DE LA ABEJITA */}
                <path d="M264,360 L270,378 L276,360 Z" fill="#0B1B3D" stroke="#0B1B3D" strokeWidth="2" />
                <rect
                  x="200"
                  y="248"
                  width="140"
                  height="115"
                  rx="26"
                  fill="url(#beeGoldGrad)"
                  stroke="#0B1B3D"
                  strokeWidth="4"
                />

                {/* Rayas corporativas */}
                <path
                  d="M201,280 L339,280"
                  stroke="#0B1B3D"
                  strokeWidth="11"
                  strokeLinecap="round"
                />
                <path
                  d="M203,318 L337,318"
                  stroke="#0B1B3D"
                  strokeWidth="11"
                  strokeLinecap="round"
                />

                {/* Compartimento frontal abierto con engranajes visibles */}
                <rect
                  x="235"
                  y="262"
                  width="70"
                  height="50"
                  rx="10"
                  fill="#D97706"
                  stroke="#0B1B3D"
                  strokeWidth="3"
                />
  
                <polygon
                  points="305,262 332,274 332,324 305,312"
                  fill="#FDE68A"
                  stroke="#0B1B3D"
                  strokeWidth="3"
                />

                {/* Engranajes visibles dentro del compartimento */}
                <g transform="translate(258, 287)" className="animate-gear-slow">
                  <circle cx="0" cy="0" r="10" fill="#FBBF24" stroke="#0B1B3D" strokeWidth="2" />
                  <circle cx="0" cy="0" r="3.5" fill="#0B1B3D" />
                </g>
                <g transform="translate(278, 295)" className="animate-gear-rev">
                  <circle cx="0" cy="0" r="7.5" fill="#F8FAFC" stroke="#0B1B3D" strokeWidth="1.8" />
                  <circle cx="0" cy="0" r="2.5" fill="#0B1B3D" />
                </g>

                {/* CUELLO DE RESORTE TIPO ROBOT */}
                <g stroke="#0B1B3D" strokeWidth="3">
                  <line x1="248" y1="237" x2="292" y2="237" />
                  <line x1="252" y1="243" x2="288" y2="243" />
                  <line x1="250" y1="249" x2="290" y2="249" />
                </g>

                {/* PIERNAS SENTADAS HACIA ADELANTE */}
                {/* Pierna y bota izquierda estirada hacia afuera */}
                <g transform="translate(138, 322)">
                  <circle cx="68" cy="38" r="7" fill="#FBBF24" stroke="#0B1B3D" strokeWidth="3" />
                  <rect
                    x="2"
                    y="18"
                    width="55"
                    height="45"
                    rx="12"
                    fill="#F59E0B"
                    stroke="#0B1B3D"
                    strokeWidth="4"
                    transform="rotate(6, 30, 40)"
                  />
                  <line x1="6" y1="62" x2="52" y2="67" stroke="#0B1B3D" strokeWidth="4" strokeLinecap="round" />
                </g>

                <g transform="translate(332, 322)">
                  <circle cx="7" cy="38" r="7" fill="#FBBF24" stroke="#0B1B3D" strokeWidth="3" />
                  <rect
                    x="20"
                    y="18"
                    width="55"
                    height="45"
                    rx="12"
                    fill="#F59E0B"
                    stroke="#0B1B3D"
                    strokeWidth="4"
                    transform="rotate(-6, 45, 40)"
                  />
                  <line x1="22" y1="67" x2="68" y2="62" stroke="#0B1B3D" strokeWidth="4" strokeLinecap="round" />
                </g>

                <g transform="translate(162, 235)">
                  <path
                    d="M44,38 C25,25 15,48 6,65"
                    fill="none"
                    stroke="#0B1B3D"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10,54 C-5,58 -6,78 8,82 C3,74 4,62 10,54 Z"
                    fill="#FBBF24"
                    stroke="#0B1B3D"
                    strokeWidth="3.2"
                  />
                </g>

                {/* Brazo derecho caído al suelo */}
                <g transform="translate(334, 258)">
                  <path
                    d="M4,15 C24,20 48,32 64,55"
                    fill="none"
                    stroke="#0B1B3D"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M62,48 C76,46 88,58 84,72 C78,64 68,60 62,48 Z"
                    fill="#FBBF24"
                    stroke="#0B1B3D"
                    strokeWidth="3.2"
                  />
                </g>

                {/* CABEZA DE LA ABEJITA (Inclinada y con animación de balanceo sutil) */}
                <g className="animate-bee-head">
                  <rect
                    x="185"
                    y="130"
                    width="170"
                    height="115"
                    rx="26"
                    fill="url(#beeGoldGrad)"
                    stroke="#0B1B3D"
                    strokeWidth="4.2"
                  />
                  <path
                    d="M230,130 C225,108 215,95 210,80"
                    fill="none"
                    stroke="#0B1B3D"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="208" cy="78" r="8" fill="#FBBF24" stroke="#0B1B3D" strokeWidth="3" />

                  {/* Antena derecha: cable suelto con chispa de error */}
                  <path
                    d="M310,130 C315,105 328,112 332,88 C334,80 342,84 346,74"
                    fill="none"
                    stroke="#0B1B3D"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <polygon
                    points="346,74 353,68 349,76 357,72 350,80"
                    fill="#F59E0B"
                    className="animate-spark"
                  />

             
                  <g transform="translate(236, 185)">
                    <circle cx="0" cy="0" r="23" fill="#0B1B3D" stroke="#0B1B3D" strokeWidth="2" />
                    <path
                      d="M-11,-11 L11,11 M11,-11 L-11,11"
                      stroke="#FBBF24"
                      strokeWidth="6"
                      strokeLinecap="square"
                    />
                  </g>

                  <g transform="translate(304, 185)">
                    <circle cx="0" cy="0" r="23" fill="#0B1B3D" stroke="#0B1B3D" strokeWidth="2" />
                    <circle cx="0" cy="4" r="14" fill="#FBBF24" />
                    <circle cx="0" cy="6" r="6" fill="#0B1B3D" />
                    <path
                      d="M-23,-4 Q0,-12 23,-4 L23,-23 L-23,-23 Z"
                      fill="#D97706"
                      stroke="#0B1B3D"
                      strokeWidth="2.5"
                    />
                  </g>

                  {/* BOCA TRISTE / CONFUNDIDA */}
                  <path
                    d="M260,222 Q270,214 280,222"
                    fill="none"
                    stroke="#0B1B3D"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                  />

                  {/* Pequeño engranaje atascado en la cabeza */}
                  <g transform="translate(322, 150)" className="animate-gear-slow">
                    <circle cx="0" cy="0" r="9" fill={isDark ? '#28364F' : '#1E293B'} stroke={isDark ? '#475569' : '#0B1B3D'} strokeWidth="2" />
                    <circle cx="0" cy="3" fill="#F8FAFC" />
                    {[0, 60, 120, 180, 240, 300].map((ang) => (
                      <rect
                        key={ang}
                        x="-2"
                        y="-12"
                        width="4"
                        height="4"
                        fill={isDark ? '#28364F' : '#1E293B'}
                        stroke={isDark ? '#475569' : '#0B1B3D'}
                        strokeWidth="1.2"
                        transform={`rotate(${ang})`}
                      />
                    ))}
                  </g>
                </g>

                {/* ─── BOCADILLO DE DIÁLOGO "ERROR" ─── */}
                <g transform="translate(376, 178)">
                  <path
                    d="M10,0 L85,0 C93,0 100,7 100,15 L100,35 C100,43 93,50 85,50 L30,50 L10,64 L16,50 L10,50 C2,50 -5,43 -5,35 L-5,15 C-5,7 2,0 10,0 Z"
                    fill="#FFFFFF"
                    stroke="#0B1B3D"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                  <text
                    x="46"
                    y="32"
                    textAnchor="middle"
                    fill="#0B1B3D"
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 900,
                      fontSize: '17px',
                      letterSpacing: '1px',
                    }}
                  >
                    ERROR
                  </text>
                </g>

                {/* ─── PIEZAS Y ENGRANAJES SUELTOS EN EL SUELO ─── */}
                {/* Engranaje caído a la izquierda con cable suelto */}
                <g transform="translate(156, 368)">
                  <path
                    d="M-12,-8 C-25,-18 -32,5 -44,-4"
                    fill="none"
                    stroke="#0B1B3D"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <g className="animate-gear-slow">
                    <circle cx="0" cy="0" r="10" fill={isDark ? '#28364F' : '#1E293B'} stroke={isDark ? '#475569' : '#0B1B3D'} strokeWidth="2.2" />
                    <circle cx="0" cy="3.5" fill="#FBBF24" />
                    {[0, 90, 180, 270].map((ang) => (
                      <rect
                        key={ang}
                        x="-2"
                        y="-13"
                        width="4"
                        height="4"
                        fill={isDark ? '#28364F' : '#1E293B'}
                        stroke={isDark ? '#475569' : '#0B1B3D'}
                        strokeWidth="1.2"
                        transform={`rotate(${ang})`}
                      />
                    ))}
                  </g>
                </g>

                {/* Engranaje desprendido a la derecha con chispas */}
                <g transform="translate(338, 305)">
                  <line x1="-16" y1="-12" x2="-24" y2="-18" stroke={isDark ? '#94A3B8' : '#0B1B3D'} strokeWidth="2" strokeLinecap="round" />
                  <line x1="0" y1="-18" x2="0" y2="-26" stroke={isDark ? '#94A3B8' : '#0B1B3D'} strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="-12" x2="24" y2="-18" stroke={isDark ? '#94A3B8' : '#0B1B3D'} strokeWidth="2" strokeLinecap="round" />
                  <line x1="18" y1="4" x2="26" y2="6" stroke={isDark ? '#94A3B8' : '#0B1B3D'} strokeWidth="2" strokeLinecap="round" />

                  <g className="animate-gear-rev">
                    <circle cx="0" cy="0" r="12" fill={isDark ? '#28364F' : '#1E293B'} stroke={isDark ? '#475569' : '#0B1B3D'} strokeWidth="2.5" />
                    <circle cx="0" cy="4" fill="#F8FAFC" />
                    {[0, 60, 120, 180, 240, 300].map((ang) => (
                      <rect
                        key={ang}
                        x="-2"
                        y="-15"
                        width="4"
                        height="4"
                        fill={isDark ? '#28364F' : '#1E293B'}
                        stroke={isDark ? '#475569' : '#0B1B3D'}
                        strokeWidth="1.2"
                        transform={`rotate(${ang})`}
                      />
                    ))}
                  </g>
                </g>

                {/* Estrellitas de mareo flotando */}
                <g transform="translate(200, 120)" className="animate-dizzy-star">
                  <polygon
                    points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2"
                    fill="#F59E0B"
                  />
                </g>
                <g transform="translate(345, 110)" className="animate-dizzy-star" style={{ animationDelay: '1.2s' }}>
                  <polygon
                    points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2"
                    fill="#FBBF24"
                  />
                </g>
              </g>
            </svg>
          </div>

          {/* Textos descriptivos principales */}
          <div className="space-y-3 pt-1">
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] dark:text-white tracking-tight leading-tight">
              {t('¡Te has desviado de la colmena!')}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              {t(
                'La experiencia cultural o página que estás buscando no existe, ha cambiado de lugar o fue retirada de la plataforma.'
              )}
            </p>
          </div>

          {/* Botones de acción principales */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            >
              <FiArrowLeft size={16} />
              <span>{t('Regresar')}</span>
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <FiHome size={16} />
              <span>{t('Ir al Inicio')}</span>
            </Link>

            <Link
              to="/buscar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0B1B3D] hover:bg-[#07132B] text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer border border-amber-500/20"
            >
              <FiCompass size={16} />
              <span>{t('Explorar Eventos')}</span>
            </Link>
          </div>

          {/* ─── MÓDULO DE ASISTENCIA / REPORTE ─── */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 dark:border-amber-400/15 text-left flex items-start gap-3.5 shadow-xs backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <FiLifeBuoy size={16} />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {t('¿Necesitas ayuda adicional?')}
              </p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {t(
                  'Si crees que esto es un error del sistema o un enlace roto dentro de la plataforma, por favor contáctanos para solucionarlo.'
                )}
              </p>
              <div className="pt-1">
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold hover:underline"
                >
                  <span>{t('Contactar soporte')}</span>
                  <FiArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Pie de Página Oficial de EventHive */}
      <Footer />
    </div>
  );
}
