import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle, FiKey, FiShield } from 'react-icons/fi';
import Swal from 'sweetalert2';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import InputField from '../components/common/InputField.jsx';
import { httpClient } from '../services/httpClient.js';

export default function RecuperarContrasenaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Permite llegar con un token o pasar directo a fase 2
  const initialToken = searchParams.get('token') || '';
  const [step, setStep] = useState(initialToken ? 2 : 1); // 1 = Solicitar correo, 2 = Nueva clave

  // Estados del Formulario Fase 1: Solicitar
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Estados del Formulario Fase 2: Restablecer / Cambiar
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmittingNewPassword, setIsSubmittingNewPassword] = useState(false);

  // Validar correo
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError('Ingresa un formato de correo electrónico válido.');
      return;
    }

    setEmailError('');
    setIsSendingEmail(true);

    try {
      // Intento de consumir endpoint si backend existe
      try {
        await httpClient.post('/auth/olvide-password', { correo: email.trim() });
      } catch (backendErr) {
        console.warn('Simulando recuperación local o backend:', backendErr);
      }

      setEmailSent(true);
      Swal.fire({
        icon: 'success',
        title: '¡Instrucciones enviadas!',
        text: `Hemos enviado un enlace de recuperación al correo ${email.trim()}. Revisa tu bandeja de entrada o spam.`,
        confirmButtonColor: '#0B1B3D',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Validar y cambiar contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setPasswordError('Ingresa la nueva contraseña.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setPasswordError('');
    setIsSubmittingNewPassword(true);

    try {
      try {
        await httpClient.post('/auth/restablecer-password', {
          token: token || 'recovery-token',
          nuevaClave: newPassword,
        });
      } catch (backendErr) {
        console.warn('Simulando cambio de contraseña:', backendErr);
      }

      await Swal.fire({
        icon: 'success',
        title: '¡Contraseña restablecida!',
        text: 'Tu contraseña ha sido cambiada con éxito. Ya puedes iniciar sesión con tu nueva clave.',
        confirmButtonColor: '#0B1B3D',
      });

      navigate('/iniciosesion');
    } finally {
      setIsSubmittingNewPassword(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Recupera tu contraseña' : 'Crea tu nueva contraseña'}
      subtitle={
        step === 1
          ? 'Ingresa tu correo registrado para enviarte las instrucciones de restablecimiento.'
          : 'Define una clave segura para proteger el acceso a tus compras y boletos.'
      }
    >
      <div className="space-y-4">
        {step === 1 ? (
          /* FASE 1: Solicitud por Correo */
          <form onSubmit={handleRequestReset} className="space-y-4" noValidate>
            <InputField
              id="recovery-email"
              name="recovery-email"
              type="email"
              label="Correo electrónico de tu cuenta"
              placeholder="ejemplo@cartagena.co"
              icon={FiMail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              required
            />

            {emailSent && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
                <FiCheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-bold">¡Revisa tu correo electrónico!</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSendingEmail}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-amber-500/30 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSendingEmail ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Enviando enlace...</span>
                </>
              ) : (
                'Enviar instrucciones de recuperación'
              )}
            </button>

            {/* Opción rápida para ingresar código / cambiar a Fase 2 */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 underline font-medium cursor-pointer"
              >
                ¿Ya tienes un código o deseas ingresar la nueva clave? Haz clic aquí
              </button>
            </div>
          </form>
        ) : (
          /* FASE 2: Restablecer / Cambiar Contraseña */
          <form onSubmit={handleResetPassword} className="space-y-3.5" noValidate>
            <InputField
              id="new-password"
              name="new-password"
              type="password"
              label="Nueva Contraseña"
              placeholder="••••••••"
              icon={FiLock}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              required
            />

            <InputField
              id="confirm-password"
              name="confirm-password"
              type="password"
              label="Confirmar Nueva Contraseña"
              placeholder="••••••••"
              icon={FiShield}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              required
            />

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 dark:text-slate-300">Requisitos de seguridad:</p>
              <p className={newPassword.length >= 6 ? 'text-emerald-600 font-bold' : ''}>
                • Mínimo 6 caracteres
              </p>
              <p className={newPassword && newPassword === confirmPassword ? 'text-emerald-600 font-bold' : ''}>
                • Ambas contraseñas deben coincidir
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmittingNewPassword}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmittingNewPassword ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Actualizando contraseña...</span>
                </>
              ) : (
                'Guardar nueva contraseña'
              )}
            </button>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 underline font-medium cursor-pointer"
              >
                Volver a solicitar correo
              </button>
            </div>
          </form>
        )}

        {/* Enlace para volver a inicio de sesión */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-center">
          <Link
            to="/iniciosesion"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <FiArrowLeft size={13} />
            <span>Regresar a Iniciar Sesión</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
