import { useCallback, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import InputField from '../components/common/InputField.jsx';
import useForm from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { session, normalizeRole } from '../services/session.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { showSuccessAlert, showAuthErrorAlert, showWarningAlert } from '../utils/alertUtils.js';

export default function InicioSesion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('session_expired') === 'true';
  const { t } = useLanguage();

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
    submitError,
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

      // Redirección por rol: Clientes van a Home (/), Organizadores a /organizacion, etc.
      let destination = '/';
      if (userRole === 'REPRESENTANTE' || userRole === 'ORGANIZADOR') {
        destination = '/organizacion';
      } else if (userRole === 'OPERADOR') {
        destination = '/';
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
    <AuthLayout
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      errorBanner={null}
    >
      <div className="space-y-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <InputField
            id="email"
            name="email"
            type="email"
            label={t('auth.emailLabel')}
            placeholder={t('auth.emailPlaceholder')}
            icon={FiMail}
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            required
            autoComplete="email"
          />

          <InputField
            id="password"
            name="password"
            type="password"
            label={t('auth.passwordLabel')}
            placeholder="••••••••"
            icon={FiLock}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-end pt-0.5">
            <Link
              to="/recuperar-contrasena"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>{t('auth.loggingIn')}</span>
              </>
            ) : (
              t('auth.loginButton')
            )}
          </button>
        </form>
        <div className="flex justify-end items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
          <span>{t('auth.noAccount')}</span>
          <Link to="/registro" className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
            {t('auth.registerLink')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
