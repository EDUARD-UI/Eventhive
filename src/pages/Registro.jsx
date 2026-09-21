import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiBriefcase, FiPhone } from 'react-icons/fi';
import Swal from 'sweetalert2';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import InputField from '../components/common/InputField.jsx';
import SocialAuthButton from '../components/common/SocialAuthButton.jsx';
import useForm from '../hooks/useForm.js';

const validateRegister = (values) => {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'Tu nombre completo es obligatorio.';
  }

  if (!values.email?.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Ingresa un formato de correo válido.';
  }

  if (values.role === 'organizador') {
    if (!values.orgName?.trim()) {
      errors.orgName = 'El nombre de la organización o marca es obligatorio.';
    }
    if (!values.phone?.trim()) {
      errors.phone = 'El teléfono de contacto es obligatorio.';
    }
  }

  if (!values.password) {
    errors.password = 'La contraseña es obligatoria.';
  } else if (values.password.length < 6) {
    errors.password = 'Debe tener al menos 6 caracteres.';
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  return errors;
};

export default function Registro() {
  const navigate = useNavigate();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
  } = useForm(
    {
      role: 'usuario',
      name: '',
      orgName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validateRegister
  );

  const isOrganizer = values.role === 'organizador';

  const onSubmit = async (formValues) => {
    // Simulación de registro preparado para backend REST
    await new Promise((resolve) => setTimeout(resolve, 900));

    localStorage.setItem('eventhive_token', 'demo_jwt_token_' + Date.now());
    localStorage.setItem(
      'eventhive_user',
      JSON.stringify({
        email: formValues.email,
        name: formValues.name,
        role: isOrganizer ? 'ORGANIZADOR' : 'CLIENTE',
        orgName: formValues.orgName,
      })
    );

    await Swal.fire({
      icon: 'success',
      title: '¡Cuenta creada con éxito!',
      text: isOrganizer
        ? 'Bienvenido como organización. Te redirigiremos a tu panel.'
        : 'Bienvenido a EventHive Cartagena. Ya puedes explorar eventos.',
      timer: 2000,
      showConfirmButton: false,
    });

    if (isOrganizer) {
      navigate('/organizacion');
    } else {
      navigate('/');
    }
  };

  const handleGoogleRegister = () => {
    Swal.fire({
      icon: 'info',
      title: 'Registro con Google',
      text: 'Se asociará tu cuenta de Google de forma automática.',
    });
  };

  return (
    <AuthLayout
      title="Crea tu cuenta en EventHive"
      subtitle="Únete a la mayor comunidad de eventos de Cartagena de Indias."
      topPromptText="¿Ya tienes una cuenta?"
      topActionText="Inicia sesión"
      topActionHref="/iniciosesion"
      errorBanner={submitError}
    >
      <div className="space-y-4">
        {/* Selector de Rol Asistente vs Organización */}
        <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex gap-1">
          <button
            type="button"
            onClick={() => setFieldValue('role', 'usuario')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isOrganizer
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            Quiero asistir a eventos
          </button>
          <button
            type="button"
            onClick={() => setFieldValue('role', 'organizador')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isOrganizer
                ? 'bg-brand text-white shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
              Soy una organización de eventos
          </button>
        </div>

        <SocialAuthButton
          onClick={handleGoogleRegister}
          text="Registrarse con Google"
        />

        <div className="relative flex items-center justify-center my-5">
          <div className="border-t border-borderc w-full" />
          <span className="bg-bg px-3 text-xs text-muted uppercase font-semibold">
            o completa tus datos
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          <InputField
            id="name"
            name="name"
            type="text"
            label="Nombre y apellido"
            placeholder="Ej: Sofia Vergara"
            icon={FiUser}
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            touched={touched.name}
            required
            autoComplete="name"
          />

          {isOrganizer && (
            <div className="space-y-3.5 pt-1 animate-fade-in">
              <InputField
                id="orgName"
                name="orgName"
                type="text"
                label="Nombre de la empresa u organización"
                placeholder="Ej: Cartagena Live Producciones"
                icon={FiBriefcase}
                value={values.orgName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.orgName}
                touched={touched.orgName}
                required
              />

              <InputField
                id="phone"
                name="phone"
                type="tel"
                label="Teléfono o WhatsApp de contacto"
                placeholder="+57 300 123 4567"
                icon={FiPhone}
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone}
                touched={touched.phone}
                required
              />
            </div>
          )}

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              autoComplete="new-password"
            />

            <InputField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmar contraseña"
              placeholder="••••••••"
              icon={FiLock}
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm shadow-md hover:shadow-lg shadow-brand/20 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creando tu cuenta...</span>
              </>
            ) : isOrganizer ? (
              'Crear cuenta de Organización'
            ) : (
              'Crear mi cuenta gratis'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}