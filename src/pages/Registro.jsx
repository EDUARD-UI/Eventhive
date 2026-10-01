import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiBriefcase, FiPhone, FiFileText } from 'react-icons/fi';
import Swal from 'sweetalert2';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import InputField from '../components/common/InputField.jsx';
import useForm from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { session, normalizeRole } from '../services/session.js';

const validateRegister = (values) => {
  const errors = {};
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  if (values.role === 'organizador') {
    if (!values.razonSocial?.trim()) {
      errors.razonSocial = 'La razón social de la organización es obligatoria.';
    }

    if (!values.nit?.trim()) {
      errors.nit = 'El NIT es obligatorio.';
    } else if (values.nit.trim().length < 6) {
      errors.nit = 'Ingresa un NIT válido (mínimo 6 caracteres).';
    }

    if (!values.correoEmpresarial?.trim()) {
      errors.correoEmpresarial = 'El correo institucional o empresarial es obligatorio.';
    } else if (!emailRegex.test(values.correoEmpresarial)) {
      errors.correoEmpresarial = 'Ingresa un formato de correo empresarial válido.';
    }

    if (!values.nombreCompleto?.trim()) {
      errors.nombreCompleto = 'El nombre completo del representante legal es obligatorio.';
    }

    if (!values.correoUsuario?.trim()) {
      errors.correoUsuario = 'El correo de acceso del representante es obligatorio.';
    } else if (!emailRegex.test(values.correoUsuario)) {
      errors.correoUsuario = 'Ingresa un formato de correo válido.';
    }
  } else {
    if (!values.name?.trim()) {
      errors.name = 'Tu nombre completo es obligatorio.';
    }

    if (!values.email?.trim()) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!emailRegex.test(values.email)) {
      errors.email = 'Ingresa un formato de correo válido.';
    }

    if (!values.phone?.trim()) {
      errors.phone = 'El teléfono de contacto es obligatorio.';
    } else if (values.phone.trim().length < 7) {
      errors.phone = 'Ingresa un número de teléfono válido (mínimo 7 dígitos).';
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
      email: '',
      phone: '',
      razonSocial: '',
      nit: '',
      correoEmpresarial: '',
      nombreCompleto: '',
      correoUsuario: '',
      password: '',
      confirmPassword: '',
    },
    validateRegister
  );

  const isOrganizer = values.role === 'organizador';

  const onSubmit = async (formValues) => {
    if (isOrganizer) {
      await authService.registrarOrganizacion({
        razonSocial: formValues.razonSocial.trim(),
        nit: formValues.nit.trim(),
        correoEmpresarial: formValues.correoEmpresarial.trim(),
        nombreCompleto: formValues.nombreCompleto.trim(),
        correoUsuario: formValues.correoUsuario.trim(),
        password: formValues.password,
      });
    } else {
      await authService.registrarCliente({
        nombre: formValues.name.trim(),
        correo: formValues.email.trim(),
        telefono: formValues.phone.trim(),
        clave: formValues.password,
      });
    }

    const user = session.getUser();
    const userRole = normalizeRole(user?.role || user?.rol);

    await Swal.fire({
      icon: 'success',
      title: '¡Cuenta creada con éxito!',
      text: isOrganizer || userRole === 'REPRESENTANTE' || userRole === 'OPERADOR'
        ? 'Bienvenido como organización. Tu cuenta ha sido creada con éxito. Te redirigiremos a tu panel.'
        : 'Bienvenido a EventHive Cartagena. Te redirigiremos a tu perfil.',
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-3xl shadow-2xl border border-slate-100',
      },
    });

    if (isOrganizer || userRole === 'REPRESENTANTE' || userRole === 'OPERADOR') {
      navigate('/organizacion');
    } else if (userRole === 'ADMINISTRADOR') {
      navigate('/admin');
    } else if (userRole === 'MODERADOR') {
      navigate('/moderador');
    } else {
      navigate('/perfil');
    }
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
        {/* Selector de Rol Asistente vs Organización con Segmented Control */}
        <div className="p-1.5 rounded-2xl bg-slate-200/80 border border-slate-200 shadow-inner flex gap-1.5 mb-2">
          <button
            type="button"
            onClick={() => setFieldValue('role', 'usuario')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              !isOrganizer
                ? 'bg-white text-[#0a1838] shadow-sm'
                : 'text-slate-600 hover:text-[#0a1838]'
            }`}
          >
            Quiero asistir a eventos
          </button>
          <button
            type="button"
            onClick={() => setFieldValue('role', 'organizador')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              isOrganizer
                ? 'bg-[#0a1838] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0a1838]'
            }`}
          >
            Organización de eventos
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          {isOrganizer ? (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center gap-2 pt-1 pb-1 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-borderc">
                <FiBriefcase className="text-brand" size={14} />
                <span>Datos de la Organización</span>
              </div>

              <InputField
                id="razonSocial"
                name="razonSocial"
                type="text"
                label="Razón social de la organización"
                placeholder="Ej: Cartagena Live Producciones S.A.S."
                icon={FiBriefcase}
                value={values.razonSocial}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.razonSocial}
                touched={touched.razonSocial}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  id="nit"
                  name="nit"
                  type="text"
                  label="NIT"
                  placeholder="Ej: 900.123.456-7"
                  icon={FiFileText}
                  value={values.nit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nit}
                  touched={touched.nit}
                  required
                />

                <InputField
                  id="correoEmpresarial"
                  name="correoEmpresarial"
                  type="email"
                  label="Correo institucional / empresarial"
                  placeholder="contacto@organizacion.co"
                  icon={FiMail}
                  value={values.correoEmpresarial}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correoEmpresarial}
                  touched={touched.correoEmpresarial}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-3 pb-1 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-borderc">
                <FiUser className="text-brand" size={14} />
                <span>Datos del Representante (Acceso al Dashboard)</span>
              </div>

              <InputField
                id="nombreCompleto"
                name="nombreCompleto"
                type="text"
                label="Nombre completo del representante legal"
                placeholder="Ej: Carlos Pérez Martínez"
                icon={FiUser}
                value={values.nombreCompleto}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.nombreCompleto}
                touched={touched.nombreCompleto}
                required
                autoComplete="name"
              />

              <InputField
                id="correoUsuario"
                name="correoUsuario"
                type="email"
                label="Correo de acceso del usuario"
                placeholder="carlos@email.com"
                icon={FiMail}
                value={values.correoUsuario}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.correoUsuario}
                touched={touched.correoUsuario}
                required
                helperText="Este correo será tu usuario para iniciar sesión en tu panel."
                autoComplete="email"
              />
            </div>
          ) : (
            <div className="space-y-3.5 animate-fade-in">
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
                autoComplete="tel"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
            className="w-full mt-4 py-3.5 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-sm shadow-md hover:shadow-lg shadow-brand/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creando tu cuenta...</span>
              </>
            ) : isOrganizer ? (
              'Registrar Organización'
            ) : (
              'Crear mi cuenta gratis'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}