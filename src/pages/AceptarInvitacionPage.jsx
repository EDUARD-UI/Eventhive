import { useState, useEffect } from 'react';
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
import AuthLayout from '../components/auth/AuthLayout.jsx';
import InputField from '../components/common/InputField.jsx';
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
    <AuthLayout
      title={validating ? 'Verificando invitación' : validationError ? 'Invitación no válida' : 'Completa tu registro'}
      subtitle={
        validating
          ? 'Estamos validando la autenticidad y vigencia del enlace recibido.'
          : validationError
            ? 'El enlace de invitación no está disponible.'
            : 'Activa tu cuenta para comenzar a colaborar con EventHive.'
      }
    >
      {validating ? (
        <div className="py-10 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-600 dark:text-slate-300">Verificando invitación...</p>
        </div>
      ) : validationError ? (
        <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center dark:border-rose-900/70 dark:bg-rose-950/30">
          <FiAlertCircle size={28} className="mx-auto mb-3 text-rose-600 dark:text-rose-400" />
          <p className="text-sm text-rose-800 dark:text-rose-200">{validationError}</p>
          <div className="pt-5 flex justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <FiHome size={14} />
              <span>Ir al Inicio</span>
            </Link>
            <Link
              to="/iniciosesion"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-2 dark:border-amber-500/25 dark:bg-amber-500/10">
            <div className="flex items-start gap-2 text-xs">
              <FiCheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="min-w-0">
                <p className="font-semibold text-slate-700 dark:text-slate-200">Invitación oficial verificada</p>
                <p className="mt-1 flex items-center gap-1.5 break-all text-slate-600 dark:text-slate-400">
                  <FiMail size={13} className="shrink-0" />
                  {invitacionData?.correo || invitacionData?.correoInvitado || '—'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-600 dark:text-slate-400">Rol asignado:</span>
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/80 bg-amber-100 px-2 py-0.5 font-bold text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-200">
                <FiShield size={11} />
                {invitacionData?.rol || invitacionData?.rolDestino || 'COLABORADOR'}
              </span>
            </div>
            {invitacionData?.organizacionNombre && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Organización:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {invitacionData.organizacionNombre}
                </strong>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <FiAlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <InputField
              id="nombre"
              name="nombre"
              type="text"
              label="Nombre completo"
              placeholder="Ej: Carlos Silva"
              icon={FiUser}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoComplete="name"
            />
            <InputField
              id="telefono"
              name="telefono"
              type="tel"
              label="Teléfono móvil"
              placeholder="10 dígitos numéricos"
              icon={FiPhone}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              maxLength={10}
              autoComplete="tel"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                id="clave"
                name="clave"
                type="password"
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                icon={FiLock}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <InputField
                id="confirmarClave"
                name="confirmarClave"
                type="password"
                label="Confirmar contraseña"
                placeholder="Repite la contraseña"
                icon={FiLock}
                value={confirmarClave}
                onChange={(e) => setConfirmarClave(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2.5 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Activando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Aceptar invitación</span>
                  <FiArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="mt-5 flex justify-end items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
        <span>¿Tienes dudas sobre esta invitación?</span>
        <a href="mailto:soporte@eventhive.live" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">
          Contáctanos
        </a>
      </div>
    </AuthLayout>
  );
}
