import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import Swal from 'sweetalert2';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import InputField from '../components/common/InputField.jsx';
import SocialAuthButton from '../components/common/SocialAuthButton.jsx';
import useForm from '../hooks/useForm.js';

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

  const {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    setSubmitError,
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
    // Simulación de autenticación (integración preparada para Bearer token con httpClient)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Si todo es correcto, almacenar token simulado y redirigir
    localStorage.setItem('eventhive_token', 'demo_jwt_token_' + Date.now());
    localStorage.setItem('eventhive_user', JSON.stringify({
      email: formValues.email,
      name: formValues.email.split('@')[0],
      role: formValues.email.includes('admin') ? 'ADMIN' : formValues.email.includes('organizador') ? 'ORGANIZADOR' : 'CLIENTE',
    }));

    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido de nuevo!',
      text: 'Has iniciado sesión correctamente.',
      timer: 1500,
      showConfirmButton: false,
    });

    if (formValues.email.includes('admin')) {
      navigate('/admin');
    } else if (formValues.email.includes('organizador')) {
      navigate('/organizador');
    } else {
      navigate('/');
    }
  };

  const handleGoogleLogin = () => {
    Swal.fire({
      icon: 'info',
      title: 'Conexión con Google',
      text: 'El proveedor de Google OAuth se vinculará con tu cuenta al completar la configuración.',
    });
  };

  return (
    <AuthLayout
      title="Inicia sesión en EventHive"
      subtitle="Accede a tus eventos guardados, compras y organizadores favoritos."
      topPromptText="¿Aún no tienes cuenta?"
      topActionText="Regístrate gratis"
      topActionHref="/registro"
      errorBanner={submitError}
    >
      <div className="space-y-4">
        <SocialAuthButton
          onClick={handleGoogleLogin}
          text="Continuar con Google"
        />

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-borderc w-full" />
          <span className="bg-bg px-3 text-xs text-muted uppercase font-semibold">
            o con tu correo
          </span>
        </div>

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
                className="w-4 h-4 rounded border-borderc text-brand focus:ring-brand/20 accent-brand rounded-sm cursor-pointer"
              />
              <span>Recordar sesión</span>
            </label>

            <button
              type="button"
              onClick={() => Swal.fire('Recuperar contraseña', 'Te enviaremos un correo de restablecimiento.', 'info')}
              className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm shadow-md hover:shadow-lg shadow-brand/20 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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