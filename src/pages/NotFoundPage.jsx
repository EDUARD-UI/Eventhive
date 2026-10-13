import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch, FiArrowLeft, FiCompass, FiMapPin } from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import HexagonalHivePattern from '../components/common/HexagonalHivePattern.jsx';
import FloatingDotsBackground from '../components/common/FloatingDotsBackground.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#070D1B] text-slate-900 dark:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1 relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-hidden">
        {/* Fondo interactivo y hexagonal */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
          <HexagonalHivePattern />
          <FloatingDotsBackground count={20} />
        </div>

        {/* Resplandor cálido central */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-400/20 to-orange-500/10 blur-3xl pointer-events-none -z-10" />

        <div className="relative z-10 max-w-xl w-full text-center space-y-6">
          {/* Badge 404 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-300">
              Error 404 · Ruta no encontrada
            </span>
          </div>

          {/* Gráfico grande 404 */}
          <div className="relative select-none py-2">
            <span className="font-display font-black text-8xl sm:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-amber-400 via-amber-500 to-[#0B1B3D] dark:to-slate-900 leading-none tracking-tighter">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-bounce">🐝</span>
            </div>
          </div>

          {/* Texto explicativo */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-[#0B1B3D] dark:text-white tracking-tight">
              ¡Te has desviado de la colmena!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              La experiencia cultural o página que estás buscando no existe, ha cambiado de lugar o fue retirada de la plataforma.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <FiArrowLeft size={14} />
              <span>Regresar</span>
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <FiHome size={14} />
              <span>Ir al Inicio</span>
            </Link>

            <Link
              to="/buscar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0B1B3D] hover:bg-slate-900 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <FiSearch size={14} />
              <span>Explorar Eventos</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
