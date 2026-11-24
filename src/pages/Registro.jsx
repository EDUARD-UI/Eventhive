import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiBriefcase,
  FiFileText,
  FiSun,
  FiMoon,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import AuthVisualPanel from '../components/auth/AuthVisualPanel.jsx';
import DirectLanguagePillToggle from '../components/auth/DirectLanguagePillToggle.jsx';
import useForm from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { session, normalizeRole } from '../services/session.js';
import { sanitizeText, sanitizePhone, sanitizeEmail } from '../utils/sanitizer.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { showErrorAlert } from '../utils/alertUtils.js';

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

export default function Registro() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const handleReplayBrandAnimation = () => {
    setAnimKey((prev) => prev + 1);
  };

  const validateRegister = useCallback(
    (values) => {
      const errors = {};
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

      if (values.role === 'organizador') {
        if (!values.razonSocial?.trim()) {
          errors.razonSocial = 'La razón social es requerida.';
        }

        if (!values.nit?.trim()) {
          errors.nit = 'El NIT es requerido.';
        } else if (values.nit.trim().length < 9) {
          errors.nit = 'El NIT debe tener al menos 9 caracteres.';
        } else if (values.nit.trim().length > 12) {
          errors.nit = 'El NIT no debe superar los 12 caracteres.';
        }

        if (!values.correoEmpresarial?.trim()) {
          errors.correoEmpresarial = 'El correo empresarial es requerido.';
        } else if (!emailRegex.test(values.correoEmpresarial)) {
          errors.correoEmpresarial = 'Ingresa un correo empresarial válido.';
        }

        if (!values.nombreCompleto?.trim()) {
          errors.nombreCompleto = 'El nombre del representante es requerido.';
        }

        if (!values.correoUsuario?.trim()) {
          errors.correoUsuario = 'El correo del representante es requerido.';
        } else if (!emailRegex.test(values.correoUsuario)) {
          errors.correoUsuario = 'Ingresa un correo electrónico válido.';
        }
      } else {
        if (!values.name?.trim()) {
          errors.name = 'El nombre completo es requerido.';
        }

        if (!values.email?.trim()) {
          errors.email = 'El correo electrónico es requerido.';
        } else if (!emailRegex.test(values.email)) {
          errors.email = 'Ingresa un correo electrónico válido.';
        }

        const cleanPhone = sanitizePhone(values.phone);
        if (!cleanPhone) {
          errors.phone = 'El teléfono es requerido.';
        } else if (cleanPhone.length !== 10) {
          errors.phone = 'El teléfono debe tener 10 dígitos.';
        }
      }

      if (!values.password) {
        errors.password = 'La contraseña es requerida.';
      } else if (values.password.length < 6) {
        errors.password = 'Debe contener al menos 6 caracteres.';
      }

      if (!values.acceptTerms) {
        errors.acceptTerms = 'Debes aceptar los términos y condiciones.';
      }

      return errors;
    },
    []
  );

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
  } = useForm(
    {
      role: 'usuario',
      name: '',
      email: '',
      phone: '',
      razonSocial: '',
      nit: '',
      correoEmpresarial: '',
      nombreCompleto: '',
      correoUsuario: '',
      password: '',
      acceptTerms: false,
    },
    validateRegister
  );

  const isOrganizer = values.role === 'organizador';

  const onSubmit = async (formValues) => {
    try {
      if (isOrganizer) {
        await authService.registrarOrganizacion({
          razonSocial: sanitizeText(formValues.razonSocial),
          nit: sanitizeText(formValues.nit),
          correoEmpresarial: sanitizeEmail(formValues.correoEmpresarial),
          nombreCompleto: sanitizeText(formValues.nombreCompleto),
          correoUsuario: sanitizeEmail(formValues.correoUsuario),
          password: formValues.password,
        });
      } else {
        await authService.registrarCliente({
          nombre: sanitizeText(formValues.name),
          correo: sanitizeEmail(formValues.email),
          telefono: sanitizePhone(formValues.phone),
          clave: formValues.password,
        });
      }

      const user = session.getUser();
      const userRole = normalizeRole(user?.role || user?.rol);

      await Swal.fire({
        title: '¡Bienvenido a Event Hive!',
        text: 'Ya eres parte de la comunidad. Redirigiendo...',
        icon: 'success',
        timer: 2200,
        timerProgressBar: true,
        showConfirmButton: false,
        iconColor: '#F5B800',
        customClass: {
          popup: 'rounded-[16px] border border-[#CBD5E1]',
          timerProgressBar: 'bg-[#F5B800]',
        },
      });

      if (isOrganizer || userRole === 'REPRESENTANTE' || userRole === 'OPERADOR') {
        navigate('/organizacion', isOrganizer
          ? { state: { activeItem: 'perfil', organizationOnboarding: true } }
          : undefined);
      } else if (userRole === 'ADMINISTRADOR') {
        navigate('/admin');
      } else if (userRole === 'MODERADOR') {
        navigate('/moderador');
      } else {
        navigate('/');
      }
    } catch (err) {
      await showErrorAlert({
        title: 'Error en el registro',
        text: err?.message || 'No fue posible completar tu registro. Por favor verifica los datos ingresados.',
        confirmButtonText: 'Revisar datos',
      });
      throw err;
    }
  };

  return (
    <div className={`min-h-screen lg:h-screen lg:overflow-hidden w-full flex flex-col lg:flex-row font-body select-none transition-colors duration-300 ${
      isDark ? 'bg-[#091322] text-white' : 'bg-[#FFFFFF] text-[#0F2342]'
    }`}>
      {/* 1. Panel Visual Izquierdo (Oculto en móvil <1024px, Fijo y estático en Escritorio >=1024px) */}
      <AuthVisualPanel />

      {/* 2. Panel Derecho: Formulario con scroll independiente exclusivo en caso de desborde */}
      <div className={`w-full lg:w-[52%] xl:w-[52%] min-h-screen lg:h-screen lg:overflow-y-auto p-6 sm:p-10 lg:p-14 flex flex-col justify-between transition-colors duration-300 ${
        isDark ? 'bg-[#091322]' : 'bg-[#FFFFFF]'
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
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isDark
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
        <div className="my-auto py-6 sm:py-8 max-w-[420px] w-full mx-auto space-y-5">
          
          {/* EN MÓVIL (<1024px): La animación de letras EventHive reemplaza a "Crear cuenta" */}
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
                  key={`mobile-reg-brand-${animKey}`}
                  aria-hidden="true"
                  className="font-display text-4xl sm:text-5xl font-black leading-none tracking-tight inline-flex items-baseline"
                >
                  {BRAND_LETTERS.map(({ char, isHive }, index) => (
                    <span
                      key={`mob-reg-letter-${char}-${index}`}
                      style={{ animationDelay: `${index * 80}ms` }}
                      className={`inline-block animate-auth-letter ${
                        isHive
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
              Únete a Event Hive y empieza a vivir los mejores eventos en vivo.
            </p>
          </div>

          {/* EN ESCRITORIO (>=1024px): "Crear cuenta" CENTRADO */}
          <div className="hidden lg:block text-center space-y-1.5">
            <h1 className={`font-display text-3xl sm:text-4xl font-black tracking-tight text-center ${
              isDark ? 'text-white' : 'text-[#0F2342]'
            }`}>
              Crear cuenta
            </h1>
            <p className={`text-xs sm:text-sm leading-relaxed text-center ${
              isDark ? 'text-slate-300' : 'text-[#64748B]'
            }`}>
              Únete a Event Hive y empieza a vivir los mejores eventos en vivo.
            </p>
          </div>

          {/* Selector de Tipo de Cuenta tipo Segmento Redondeado (Píldora) */}
          <div className="p-1 rounded-full bg-[#F8F9FA] dark:bg-[#0F2342] border border-[#CBD5E1] dark:border-[#1E3A5F] flex gap-1">
            <button
              type="button"
              onClick={() => setFieldValue('role', 'usuario')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                !isOrganizer
                  ? 'bg-[#0F2342] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#0F2342] dark:hover:text-white'
              }`}
            >
              Asistente
            </button>
            <button
              type="button"
              onClick={() => setFieldValue('role', 'organizador')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                isOrganizer
                  ? 'bg-[#0F2342] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#0F2342] dark:hover:text-white'
              }`}
            >
              Organizador
            </button>
          </div>

          {/* Layout Vertical de Inputs (flex-col, gap-3.5, una sola columna sin campos lado a lado) */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5" noValidate>
            {isOrganizer ? (
              /* ==================== CAMPOS ORGANIZADOR (1 COLUMNA) ==================== */
              <div className="flex flex-col gap-3.5 animate-fade-in">
                <div className="space-y-1 text-left">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-[#0F2342]'
                  }`}>
                    Razón Social
                  </label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                    <input
                      id="razonSocial"
                      name="razonSocial"
                      type="text"
                      value={values.razonSocial}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: Producciones del Caribe S.A.S."
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${
                        errors.razonSocial && touched.razonSocial
                          ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                          : isDark
                          ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                      }`}
                    />
                  </div>
                  {errors.razonSocial && touched.razonSocial && (
                    <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.razonSocial}</p>
                  )}
                </div>

                <div className="space-y-1 text-left">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-[#0F2342]'
                  }`}>
                    NIT
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                    <input
                      id="nit"
                      name="nit"
                      type="text"
                      value={values.nit}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="901234567-8"
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${
                        errors.nit && touched.nit
                          ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                          : isDark
                          ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                      }`}
                    />
                  </div>
                  {errors.nit && touched.nit && (
                    <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.nit}</p>
                  )}
                </div>

                <div className="space-y-1 text-left">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-[#0F2342]'
                  }`}>
                    Correo Empresarial
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                    <input
                      id="correoEmpresarial"
                      name="correoEmpresarial"
                      type="email"
                      value={values.correoEmpresarial}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="contacto@productora.com"
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${
                        errors.correoEmpresarial && touched.correoEmpresarial
                          ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                          : isDark
                          ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                      }`}
                    />
                  </div>
                  {errors.correoEmpresarial && touched.correoEmpresarial && (
                    <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.correoEmpresarial}</p>
                  )}
                </div>

                <div className="space-y-1 text-left">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-[#0F2342]'
                  }`}>
                    Representante Legal
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                    <input
                      id="nombreCompleto"
                      name="nombreCompleto"
                      type="text"
                      value={values.nombreCompleto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Nombre y apellido"
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${
                        errors.nombreCompleto && touched.nombreCompleto
                          ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                          : isDark
                          ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                      }`}
                    />
                  </div>
                  {errors.nombreCompleto && touched.nombreCompleto && (
                    <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.nombreCompleto}</p>
                  )}
                </div>

                <div className="space-y-1 text-left">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-[#0F2342]'
                  }`}>
                    Correo Representante
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                    <input
                      id="correoUsuario"
                      name="correoUsuario"
                      type="email"
                      value={values.correoUsuario}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="representante@correo.com"
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${
                        errors.correoUsuario && touched.correoUsuario
                          ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                          : isDark
                          ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                      }`}
                    />
                  </div>
                  {errors.correoUsuario && touched.correoUsuario && (
                    <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.correoUsuario}</p>
                  )}
                </div>
              </div>
            ) : (
              /* ==================== CAMPOS ASISTENTE (1 COLUMNA) ==================== */
              <div className="flex flex-col gap-3.5 animate-fade-in">
                {/* 1. Nombre completo */}
                <div className="space-y-1 text-left">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-[#0F2342]'
                  }`}>
                    Nombre completo
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Tu nombre y apellido"
                      required
                      autoComplete="name"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${
                        errors.name && touched.name
                          ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                          : isDark
                          ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                      }`}
                    />
                  </div>
                  {errors.name && touched.name && (
                    <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.name}</p>
                  )}
                </div>

                {/* 2. Correo electrónico */}
                <div className="space-y-1 text-left">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-[#0F2342]'
                  }`}>
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="tunombre@correo.com"
                      required
                      autoComplete="email"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${
                        errors.email && touched.email
                          ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                          : isDark
                          ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                      }`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.email}</p>
                  )}
                </div>

                {/* 3. Teléfono */}
                <div className="space-y-1 text-left">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-[#0F2342]'
                  }`}>
                    Teléfono
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={values.phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFieldValue('phone', cleaned);
                      }}
                      onBlur={handleBlur}
                      placeholder="3001234567"
                      maxLength={10}
                      required
                      autoComplete="tel"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${
                        errors.phone && touched.phone
                          ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                          : isDark
                          ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                          : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                      }`}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* 4. Contraseña única (sin confirmar contraseña) */}
            <div className="space-y-1 text-left">
              <label className={`block text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-200' : 'text-[#0F2342]'
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
                  autoComplete="new-password"
                  required
                  className={`w-full pl-11 pr-11 py-3.5 rounded-[14px] text-xs sm:text-sm font-medium border outline-none transition-all ${
                    errors.password && touched.password
                      ? 'border-rose-500 bg-rose-50/20 text-rose-500'
                      : isDark
                      ? 'bg-[#0F2342] border-[#1E3A5F] text-white placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                      : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F2342] placeholder-slate-400 focus:border-[#F5B800] focus:ring-1 focus:ring-[#F5B800]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.password}</p>
              )}
            </div>

            {/* Checkbox Términos y Condiciones */}
            <div className="pt-0.5 text-left">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={values.acceptTerms}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded-[4px] border-slate-300 text-[#0F2342] focus:ring-[#F5B800]"
                />
                <span>
                  Acepto los{' '}
                  <Link to="/terminos" target="_blank" className="font-bold underline hover:text-[#0F2342] dark:hover:text-white">
                    Términos de Servicio
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacidad" target="_blank" className="font-bold underline hover:text-[#0F2342] dark:hover:text-white">
                    Política de Privacidad
                  </Link>.
                </span>
              </label>
              {errors.acceptTerms && touched.acceptTerms && (
                <p className="text-xs font-medium text-rose-500 mt-1">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Botón Principal Píldora en Ancho Completo: Crear cuenta */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#F5B800] hover:bg-[#e5ab00] text-[#0F2342] font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-[#F5B800]/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0F2342] border-t-transparent rounded-full animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Pie del Formulario: Centrado ¿Ya tienes una cuenta? Iniciar sesión */}
          <div className="pt-2 text-center text-xs sm:text-sm">
            <span className={isDark ? 'text-slate-300' : 'text-[#64748B]'}>
              ¿Ya tienes una cuenta?{' '}
            </span>
            <Link
              to="/iniciosesion"
              className="font-bold text-[#D97706] dark:text-[#F5B800] hover:underline transition-colors ml-1"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* Términos y privacidad en el pie */}
        <div className={`text-center text-[11px] py-2 ${
          isDark ? 'text-slate-500' : 'text-slate-400'
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