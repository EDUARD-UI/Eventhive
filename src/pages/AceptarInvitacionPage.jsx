import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiShield,
  FiUser,
  FiLock,
  FiPhone,
  FiArrowRight,
  FiHome,
} from 'react-icons/fi';
import { httpClient } from '../services/httpClient.js';
import HexagonalHivePattern from '../components/common/HexagonalHivePattern.jsx';
import { showSuccessAlert, showErrorAlert } from '../utils/alertUtils.js';

export default function AceptarInvitacionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [validating, setValidating] = useState(true);
  const [invitacionData, setInvitacionData] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Formulario de aceptación
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [clave, setClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Paso 1: Validar el token al cargar la pantalla
  useEffect(() => {
    if (!token) {
      setValidationError('No se proporcionó ningún token de invitación en el enlace.');
      setValidating(false);
      return;
    }

    const validarToken = async () => {
      try {
        setValidating(true);
        setValidationError(null);
        let res;
        try {
          res = await httpClient.get('/invitaciones/roles/validar', { token }, { skipAuth: true });
        } catch {
          // Fallback a ruta alternativa si aplica
          res = await httpClient.get('/invitaciones-rol/validar', { token }, { skipAuth: true });
        }
        setInvitacionData(res);
      } catch (err) {
        setValidationError(
          err?.message ||
            'Esta invitación no existe, ya fue utilizada o ha expirado. Solicita una nueva invitación.'
        );
      } finally {
        setValidating(false);
      }
    };

    validarToken();
  }, [token]);

  // Paso 2: Enviar formulario de aceptación
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const nombreTrim = nombre.trim();
    const telTrim = telefono.trim();
    const claveTrim = clave.trim();

    if (!nombreTrim) {
      setFormError('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!telTrim || telTrim.length < 7) {
      setFormError('Por favor ingresa un número de teléfono válido (mínimo 7 dígitos).');
      return;
    }

    if (claveTrim.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (claveTrim !== confirmarClave.trim()) {
      setFormError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        token,
        nombre: nombreTrim,
        telefono: telTrim,
        clave: claveTrim,
        password: claveTrim,
      };

      try {
        await httpClient.post('/invitaciones/roles/aceptar', payload, { skipAuth: true });
      } catch {
        await httpClient.post('/invitaciones-rol/aceptar', payload, { skipAuth: true });
      }

      await showSuccessAlert({
        title: '¡Invitación Aceptada!',
        text: 'Tu cuenta ha sido activada con éxito. Ya puedes iniciar sesión con tus credenciales.',
        badge: 'Bienvenido al Equipo',
        confirmButtonText: 'Iniciar Sesión',
      });

      navigate('/iniciosesion');
    } catch (err) {
      const msg =
        err?.message ||
        'Ocurrió un error al aceptar la invitación. Verifica los datos o solicita un nuevo enlace.';
      setFormError(msg);
      await showErrorAlert({
        title: 'Error al aceptar invitación',
        text: msg,
        badge: 'Invitación no válida',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-900 via-[#0B1B3D] to-slate-950 text-white flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden">
      {/* Fondo hexagonal decorativo */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <HexagonalHivePattern />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Cabecera de Marca */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg group-hover:scale-105 transition-transform">
              EH
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-white">
              Event<span className="text-amber-400">Hive</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400">
            Plataforma Integral de Eventos y Gestión Cultural
          </p>
        </div>

        {/* Tarjeta de Contenido */}
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden">
          {validating ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="font-bold text-base text-slate-900">
                Verificando invitación...
              </h3>
              <p className="text-xs text-slate-500">
                Estamos validando la autenticidad y vigencia del enlace recibido.
              </p>
            </div>
          ) : validationError ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                <FiAlertCircle size={28} />
              </div>
              <h3 className="font-display text-lg font-black text-slate-900">
                Enlace No Válido o Expirado
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {validationError}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FiHome size={14} />
                  <span>Ir al Inicio</span>
                </Link>
                <Link
                  to="/iniciosesion"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <span>Iniciar Sesión</span>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Encabezado de la invitación */}
              <div className="bg-[#0B1B3D] text-white p-6 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
                  <FiCheckCircle size={13} />
                  <span>Invitación Oficial Verificada</span>
                </div>
                <h2 className="font-display text-xl font-bold text-white leading-tight">
                  ¡Te han invitado a EventHive!
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Completa tus datos para activar tu cuenta y comenzar a colaborar.
                </p>
              </div>

              {/* Resumen del Rol e Invitación */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Correo electrónico:</span>
                  <strong className="text-slate-900 font-semibold flex items-center gap-1.5">
                    <FiMail size={13} className="text-slate-400" />
                    <span>{invitacionData?.correo || invitacionData?.correoInvitado || '—'}</span>
                  </strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Rol asignado:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[11px] border border-amber-300/80">
                    <FiShield size={11} className="text-amber-700" />
                    {invitacionData?.rol || invitacionData?.rolDestino || 'COLABORADOR'}
                  </span>
                </div>

                {invitacionData?.organizacionNombre && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Organización:</span>
                    <strong className="text-slate-900 font-bold">
                      {invitacionData.organizacionNombre}
                    </strong>
                  </div>
                )}
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <FiAlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nombre Completo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Carlos Silva"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Teléfono Móvil <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setTelefono(digits);
                      }}
                      onKeyDown={(e) => {
                        const allowed = ['Backspace', 'Tab', 'Enter', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
                        if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
                        if (!/^\d$/.test(e.key)) e.preventDefault();
                      }}
                      placeholder="10 dígitos numéricos (ej: 3001234567)"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Contraseña <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type="password"
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        required
                        minLength={8}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Confirmar Contraseña <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type="password"
                        value={confirmarClave}
                        onChange={(e) => setConfirmarClave(e.target.value)}
                        placeholder="Repite la contraseña"
                        required
                        minLength={8}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Activando cuenta...</span>
                      </>
                    ) : (
                      <>
                        <span>Aceptar Invitación y Entrar</span>
                        <FiArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          ¿Tienes dudas sobre esta invitación? Contáctanos a{' '}
          <a href="mailto:soporte@eventhive.live" className="text-amber-400 hover:underline font-semibold">
            soporte@eventhive.live
          </a>
        </div>
      </div>
    </div>
  );
}
