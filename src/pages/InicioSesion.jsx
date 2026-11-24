import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiSun, FiMoon, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import AuthVisualPanel from '../components/auth/AuthVisualPanel.jsx';
import DirectLanguagePillToggle from '../components/auth/DirectLanguagePillToggle.jsx';
import useForm from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { session, normalizeRole } from '../services/session.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { showSuccessAlert, showAuthErrorAlert, showWarningAlert } from '../utils/alertUtils.js';

const BRAND_LETTERS = [
  { char: 'E', isHive: false },
  { char: 'v', isHive: false },
  { char: 'e', isHive: false },
  { char: 'n', isHive: false },
  { char: 't', isHive: false },
  { char: 'H', isHive: true },
  { char: 'i', isHive: true },
  { char: 'v', isHive: true },
  { char: 'e', isHive: true },
];

export default function InicioSesion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('session_expired') === 'true';
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const handleReplayBrandAnimation = () => {
    setAnimKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (sessionExpired) {
      showWarningAlert({
        title: 'Sesión caducada',
        text: t('auth.sessionExpired'),
        badge: 'Acceso Requerido',
        confirmButtonText: 'Entendido',
      });
    }
  }, [sessionExpired, t]);

  const validateLogin = useCallback(
    (values) => {
      const errors = {};
      if (!values.email) {
        errors.email = t('auth.errEmailReq');
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = t('auth.errEmailInvalid');
      }

      if (!values.password) {
        errors.password = t('auth.errPasswordReq');
      } else if (values.password.length < 6) {
        errors.password = t('auth.errPasswordMin');
      }

      return errors;
    },
    [t]
  );

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(
    {
      email: '',
      password: '',
      remember: false,
    },
    validateLogin
  );

  const onSubmit = async (formValues) => {
    try {
      const data = await authService.login(formValues.email, formValues.password);

      await showSuccessAlert({
        title: t('auth.welcomeBackTitle'),
        text: t('auth.welcomeBackText'),
        timer: 1400,
        showConfirmButton: false,
        showCancelButton: false,
      });

      const user = session.getUser();
      const userRole = normalizeRole(
        data?.rol ||
        data?.role ||
        data?.rolNombre ||
        data?.usuario?.rol ||
        data?.usuario?.role ||
        data?.usuario?.rolNombre ||
        user?.role ||
        user?.rol ||
        user?.rolNombre
      );

      let destination = '/';
      if (userRole === 'REPRESENTANTE' || userRole === 'ORGANIZADOR') {
        destination = '/organizacion';
      } else if (userRole === 'OPERADOR') {
        destination = '/perfil';
      } else if (userRole === 'ADMINISTRADOR' || userRole === 'ADMIN') {
        destination = '/admin';
      } else if (userRole === 'MODERADOR') {
        destination = '/moderador';
      } else if (userRole === 'MARKETING') {
        destination = '/marketing';
      } else {
        destination = '/';
      }

      navigate(destination, { replace: true });
    } catch (err) {
      const status = err?.status;
      const isBadCredentials =
        status === 401 ||
        status === 400 ||
        /credencial|clave|contrase|usuario|no coincide|invalid/i.test(err?.message || '');

      await showAuthErrorAlert({
        title: isBadCredentials ? 'Credenciales incorrectas' : 'Error al iniciar sesión',
        text:
          err?.message ||
          'El correo electrónico o la contraseña ingresada no son válidos. Por favor, verifica tus datos e inténtalo nuevamente.',
        badge: isBadCredentials ? 'Credenciales Inválidas' : 'Error de Conexión',
        confirmButtonText: 'Intentar de nuevo',
      });

      throw err;
    }
  };

  return (
    <div className={`min-h-screen lg:h-screen lg:overflow-hidden w-full flex flex-col lg:flex-row font-body select-none transition-colors duration-300 ${isDark ? 'bg-[#091322] text-white' : 'bg-[#FFFFFF] text-[#0F2342]'
      }`}>
      {/* 1. Panel Visual Izquierdo (Oculto en móvil <1024px, Fijo y estático en Escritorio >=1024px) */}
      <AuthVisualPanel />

      {/* 2. Panel Derecho: Formulario con scroll independiente exclusivo en caso de desborde */}
      <div className={`w-full lg:w-[52%] xl:w-[52%] min-h-screen lg:h-screen lg:overflow-y-auto p-6 sm:p-10 lg:p-14 flex flex-col justify-between transition-colors duration-300 ${isDark ? 'bg-[#091322]' : 'bg-[#FFFFFF]'
        }`}>

        {/* Controles Superiores: Botón Volver a la izquierda + Idioma y Tema a la derecha */}
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Botón Volver al portal público / Home */}
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-[#F5B800]'
                : 'text-[#0F2342] hover:text-[#D97706]'
            }`}
          >
            <FiArrowLeft className="text-base" />
            <span>Volver</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Botón de Cambio de Idioma por Clic Directo */}
            <DirectLanguagePillToggle />

            {/* Botón de Cambio de Tema Circular con Tooltip */}
            <div className="relative group">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Cambiar tema"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${isDark
                    ? 'border-[#1E3A5F] bg-[#0F2342] text-[#F5B800] hover:bg-[#1E3A5F]'
                    : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#0F2342] hover:bg-slate-100 shadow-2xs'
                  }`}
              >
                {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
              </button>
              <div className="absolute right-0 -bottom-9 hidden group-hover:flex items-center px-2.5 py-1 rounded-[6px] bg-[#0F2342] text-white text-[11px] font-mono whitespace-nowrap shadow-xl border border-white/10 z-30 pointer-events-none">
                Cambiar tema
              </div>
            </div>
          </div>
        </div>

        {/* Bloque Central de Formulario (max-width: 420px, centrado) */}
        <div className="my-auto py-6 sm:py-8 max-w-[420px] w-full mx-auto space-y-6">

          {/* EN MÓVIL (<1024px): La animación de letras EventHive reemplaza al título "Iniciar sesión" */}
          <div className="lg:hidden flex flex-col items-center justify-center text-center">
            <div className="relative group">
              <Link
                to="/"
                onMouseEnter={handleReplayBrandAnimation}
                onFocus={handleReplayBrandAnimation}
                aria-label="EventHive"
                className="inline-flex items-baseline focus:outline-none cursor-pointer"
              >
                <span
                  key={`mobile-brand-${animKey}`}
                  aria-hidden="true"
                  className="font-display text-4xl sm:text-5xl font-black leading-none tracking-tight inline-flex items-baseline"
                >
                  {BRAND_LETTERS.map(({ char, isHive }, index) => (
                    <span
                      key={`mob-letter-${char}-${index}`}
                      style={{ animationDelay: `${index * 80}ms` }}
                      className={`inline-block animate-auth-letter ${isHive
                          ? 'text-[#F5B800]'
                          : isDark
                            ? 'text-white'
                            : 'text-[#0F2342]'
                        }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 hidden group-hover:flex items-center px-2.5 py-1 rounded-[6px] bg-[#0F2342] text-white text-[10px] font-mono whitespace-nowrap shadow-xl border border-white/10 z-30 pointer-events-none">
                Regresar al inicio
              </div>
            </div>
            <p className={`text-xs mt-2.5 text-center ${isDark ? 'text-slate-300' : 'text-[#64748B]'}`}>
              Ingresa tus datos para ver tus entradas y descubrir próximos conciertos.
            </p>
          </div>

          {/* EN ESCRITORIO (>=1024px): "Iniciar sesión" CENTRADO con su subtítulo */}
          <div className="hidden lg:block text-center space-y-1.5">
            <h1 className={`font-display text-3xl sm:text-4xl font-black tracking-tight text-center ${isDark ? 'text-white' : 'text-[#0F2342]'
              }`}>
              Iniciar sesión
            </h1>
            <p className={`text-xs sm:text-sm leading-relaxed text-center ${isDark ? 'text-slate-300' : 'text-[#64748B]'
              }`}>
              Ingresa tus datos para ver tus entradas y descubrir próximos conciertos.
            </p>
          </div>

          {/* Layout Vertical de Inputs (flex-col, gap-4) */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {/* 1. Correo electrónico */}
            <div className="space-y-1.5 text-left">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-[#0F2342]'
                }`}>
                Correo electrónico
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="ejemplo@cartagena.co"
                  autoComplete="email"
                  required
                  className={`w-full pl-11 pr-4 py-3.5 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${errors.email && touched.email
                      ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                      : isDark
                        ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                        : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                    }`}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-xs font-medium text-rose-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* 2. Contraseña con botón mostrar/ocultar */}
            <div className="space-y-1.5 text-left">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-[#0F2342]'
                }`}>
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={`w-full pl-11 pr-11 py-3.5 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${errors.password && touched.password
                      ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                      : isDark
                        ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                        : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-xs font-medium text-rose-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Botón Principal Píldora en Ancho Completo: Iniciar sesión */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#F5B800] hover:bg-[#e5ab00] text-[#0F2342] font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-[#F5B800]/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0F2342] border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Enlace Centrado Debajo del Botón Principal: ¿Olvidaste tu contraseña? */}
          <div className="text-center pt-1">
            <Link
              to="/recuperar-contrasena"
              className="text-xs font-bold text-[#D97706] hover:text-[#B45309] dark:text-[#F5B800] hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Pie del Formulario: Centrado ¿Aún no tienes cuenta? Regístrate */}
          <div className="pt-3 text-center text-xs sm:text-sm">
            <span className={isDark ? 'text-slate-300' : 'text-[#64748B]'}>
              ¿Aún no tienes cuenta?{' '}
            </span>
            <Link
              to="/registro"
              className="font-bold text-[#D97706] dark:text-[#F5B800] hover:underline transition-colors ml-1"
            >
              Regístrate
            </Link>
          </div>
        </div>

        {/* Términos y privacidad en el pie */}
        <div className={`text-center text-[11px] py-2 ${isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
          Al continuar, aceptas los{' '}
          <Link to="/terminos" className="underline hover:text-slate-600 dark:hover:text-slate-300">
            Términos de Servicio
          </Link>{' '}
          y la{' '}
          <Link to="/privacidad" className="underline hover:text-slate-600 dark:hover:text-slate-300">
            Política de Privacidad
          </Link>{' '}
          de EventHive.
        </div>

      </div>
    </div>
  );
}