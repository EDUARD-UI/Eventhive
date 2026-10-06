import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import Swal from 'sweetalert2';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import InputField from '../components/common/InputField.jsx';
import useForm from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { session, normalizeRole, getDashboardPathForRole } from '../services/session.js';

const validateLogin = (values) => {
  const errors = {};
  if (!values.email) {
    errors.email = 'El correo electrónico es requerido.';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Ingresa un formato de correo válido.';
  }

  if (!values.password) {
    errors.password = 'La contraseña es requerida.';
  } else if (values.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.';
  }

  return errors;
};

export default function InicioSesion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('session_expired') === 'true';

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
    const data = await authService.login(formValues.email, formValues.password);

    await Swal.fire({
      icon: 'success',
      title: '¡Bienvenido de nuevo!',
      text: 'Has iniciado sesión correctamente.',
      timer: 1200,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-3xl shadow-2xl border border-slate-100',
      },
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
    if (userRole === 'REPRESENTANTE' || userRole === 'OPERADOR' || userRole === 'ORGANIZADOR') {
      destination = '/organizacion';
    } else if (userRole === 'ADMINISTRADOR' || userRole === 'ADMIN') {
      destination = '/admin';
    } else if (userRole === 'MODERADOR') {
      destination = '/moderador';
    } else {
      // Cliente se direcciona a home
      destination = '/';
    }

    navigate(destination, { replace: true });
  };

  return (
    <AuthLayout
      title="Inicia sesión en EventHive"
      subtitle="Accede a tus eventos guardados, compras y organizaciones favoritas."
      topPromptText="¿Aún no tienes cuenta?"
      topActionText="Regístrate gratis"
      topActionHref="/registro"
      errorBanner={
        submitError ||
        (sessionExpired
          ? 'Tu sesión ha expirado o el token ya no es válido. Por favor, ingresa tus credenciales nuevamente.'
          : null)
      }
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <InputField
            id="email"
            name="email"
            type="email"
            label="Correo electrónico"
            placeholder="ejemplo@cartagena.co"
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
            label="Contraseña"
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
              <input
                type="checkbox"
                name="remember"
                checked={values.remember}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500/20 accent-amber-500 rounded-sm cursor-pointer"
              />
              <span>Recordar sesión</span>
            </label>

            <button
              type="button"
              onClick={() => Swal.fire('Recuperar contraseña', 'Te enviaremos un correo de restablecimiento.', 'info')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              'Ingresar a mi cuenta'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
