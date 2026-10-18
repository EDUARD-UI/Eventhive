import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiBriefcase, FiPhone, FiFileText } from 'react-icons/fi';
import Swal from 'sweetalert2';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import InputField from '../components/common/InputField.jsx';
import useForm from '../hooks/useForm.js';
import { authService } from '../services/authService.js';
import { session, normalizeRole } from '../services/session.js';
import { sanitizeText, sanitizePhone, sanitizeEmail } from '../utils/sanitizer.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Registro() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const validateRegister = useCallback(
    (values) => {
      const errors = {};
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

      if (values.role === 'organizador') {
        if (!values.razonSocial?.trim()) {
          errors.razonSocial = t('auth.errRazonSocial');
        }

        if (!values.nit?.trim()) {
          errors.nit = t('auth.errNitReq');
        } else if (values.nit.trim().length < 6) {
          errors.nit = t('auth.errNitMin');
        }

        if (!values.correoEmpresarial?.trim()) {
          errors.correoEmpresarial = t('auth.errBusinessEmailReq');
        } else if (!emailRegex.test(values.correoEmpresarial)) {
          errors.correoEmpresarial = t('auth.errBusinessEmailInvalid');
        }

        if (!values.nombreCompleto?.trim()) {
          errors.nombreCompleto = t('auth.errRepNameReq');
        }

        if (!values.correoUsuario?.trim()) {
          errors.correoUsuario = t('auth.errRepEmailReq');
        } else if (!emailRegex.test(values.correoUsuario)) {
          errors.correoUsuario = t('auth.errEmailInvalid');
        }
      } else {
        if (!values.name?.trim()) {
          errors.name = t('auth.errNameReq');
        }

        if (!values.email?.trim()) {
          errors.email = t('auth.errEmailReq');
        } else if (!emailRegex.test(values.email)) {
          errors.email = t('auth.errEmailInvalid');
        }

        const cleanPhone = sanitizePhone(values.phone);
        if (!cleanPhone) {
          errors.phone = t('auth.errPhoneReq');
        } else if (cleanPhone.length < 7) {
          errors.phone = t('auth.errPhoneMin');
        } else if (cleanPhone.length > 10 || (values.phone || '').length > 10) {
          errors.phone = t('auth.errPhoneMax');
        }
      }

      if (!values.password) {
        errors.password = t('auth.errPasswordReq');
      } else if (values.password.length < 6) {
        errors.password = t('auth.errPasswordMin');
      }

      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = t('auth.errPasswordMatch');
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
      icon: 'success',
      title: t('auth.accountCreatedTitle'),
      text: isOrganizer || userRole === 'REPRESENTANTE' || userRole === 'OPERADOR'
        ? t('auth.accountCreatedOrgText')
        : t('auth.accountCreatedUserText'),
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
      navigate('/');
    }
  };

  return (
    <AuthLayout
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      errorBanner={submitError}
    >
      <div className="space-y-3">
        {/* Selector de Rol Asistente vs Organización con Segmented Control */}
        <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs flex gap-1 mb-2">
          <button
            type="button"
            onClick={() => setFieldValue('role', 'usuario')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              !isOrganizer
                ? 'bg-[#0B132B] dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#0B132B] dark:hover:text-white font-medium'
            }`}
          >
            {t('auth.roleAttendee')}
          </button>
          <button
            type="button"
            onClick={() => setFieldValue('role', 'organizador')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              isOrganizer
                ? 'bg-[#0B132B] dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#0B132B] dark:hover:text-white font-medium'
            }`}
          >
            {t('auth.roleOrganizer')}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5" noValidate>
          {isOrganizer ? (
            <div className="space-y-2.5 animate-fade-in">
              <div className="flex items-center gap-2 pt-0.5 pb-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-800">
                <FiBriefcase className="text-amber-500" size={13} />
                <span>{t('auth.orgSectionTitle')}</span>
              </div>

              <InputField
                id="razonSocial"
                name="razonSocial"
                type="text"
                label={t('auth.razonSocialLabel')}
                placeholder={t('auth.razonSocialPlaceholder')}
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
                  label={t('auth.nitLabel')}
                  placeholder={t('auth.nitPlaceholder')}
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
                  label={t('auth.businessEmailLabel')}
                  placeholder={t('auth.businessEmailPlaceholder')}
                  icon={FiMail}
                  value={values.correoEmpresarial}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correoEmpresarial}
                  touched={touched.correoEmpresarial}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2 pb-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-800">
                <FiUser className="text-amber-500" size={13} />
                <span>{t('auth.repSectionTitle')}</span>
              </div>

              <InputField
                id="nombreCompleto"
                name="nombreCompleto"
                type="text"
                label={t('auth.repNameLabel')}
                placeholder={t('auth.repNamePlaceholder')}
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
                label={t('auth.repEmailLabel')}
                placeholder={t('auth.repEmailPlaceholder')}
                icon={FiMail}
                value={values.correoUsuario}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.correoUsuario}
                touched={touched.correoUsuario}
                required
                helperText={t('auth.repEmailHelper')}
                autoComplete="email"
              />
            </div>
          ) : (
            <div className="space-y-3.5 animate-fade-in">
              <InputField
                id="name"
                name="name"
                type="text"
                label={t('auth.fullNameLabel')}
                placeholder={t('auth.fullNamePlaceholder')}
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
                id="phone"
                name="phone"
                type="tel"
                label={t('auth.phoneLabel')}
                placeholder={t('auth.phonePlaceholder')}
                icon={FiPhone}
                value={values.phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFieldValue('phone', cleaned);
                }}
                maxLength={10}
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
              label={t('auth.passwordLabel')}
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
              label={t('auth.confirmPasswordLabel')}
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
            className="w-full mt-2.5 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>{t('auth.creatingAccount')}</span>
              </>
            ) : isOrganizer ? (
              t('auth.registerOrgBtn')
            ) : (
              t('auth.createFreeAccountBtn')
            )}
          </button>
        </form>
        <div className="flex justify-end items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
          <span>{t('auth.alreadyHaveAccount')}</span>
          <Link
            to="/iniciosesion"
            className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            {t('auth.loginLink')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}