import Swal from 'sweetalert2';

const defaultCustomClass = {
  popup: 'rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800',
  actions: 'flex items-center justify-center gap-3 mt-4 w-full',
  confirmButton:
    'inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-amber-500/25 active:scale-95 transition-all duration-200 cursor-pointer',
  cancelButton:
    'inline-flex items-center justify-center py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all duration-200 cursor-pointer',
};

const renderCardHtml = ({
  iconSvg,
  iconBoxClasses = 'bg-gradient-to-br from-[#0D1527] to-[#1c2a4d] border border-amber-400/30 text-amber-400 shadow-[#0D1527]/25',
  badgeText = '',
  badgeClasses = 'text-amber-700 bg-amber-50 border border-amber-200/80',
  title = '',
  text = '',
}) => `
  <div class="flex flex-col items-center text-center px-1 pt-1">
    <div class="w-16 h-16 rounded-2xl ${iconBoxClasses} flex items-center justify-center shadow-lg mb-4">
      ${iconSvg}
    </div>
    ${
      badgeText
        ? `<span class="inline-block text-[10px] font-black uppercase tracking-widest ${badgeClasses} px-2.5 py-0.5 rounded-full mb-2">
            ${badgeText}
           </span>`
        : ''
    }
    <h3 class="text-xl sm:text-2xl font-black text-[#0B172C] tracking-tight mb-2">
      ${title}
    </h3>
    <p class="text-slate-600 text-sm leading-relaxed max-w-sm mb-1">
      ${text}
    </p>
  </div>
`;

/**
 * Normaliza los parámetros para admitir tanto (title, text) como ({ title, text, badge, ... })
 */
const normalizeAlertOptions = (titleOrOptions, maybeText, defaultTitle, defaultBadge) => {
  if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
    return {
      title: titleOrOptions.title ?? defaultTitle,
      text: titleOrOptions.text ?? '',
      badge: titleOrOptions.badge ?? defaultBadge,
      confirmButtonText: titleOrOptions.confirmButtonText,
      cancelButtonText: titleOrOptions.cancelButtonText,
      showConfirmButton: titleOrOptions.showConfirmButton ?? true,
      timer: titleOrOptions.timer,
      customClass: titleOrOptions.customClass,
      ...titleOrOptions,
    };
  }
  return {
    title: titleOrOptions ?? defaultTitle,
    text: maybeText ?? '',
    badge: defaultBadge,
    showConfirmButton: true,
  };
};

/**
 * Alerta de éxito con diseño personalizado de tarjeta EventHive
 */
export const showSuccessAlert = (titleOrOptions = '¡Éxito!', maybeText = '') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, '¡Éxito!', 'Operación Exitosa');

  return Swal.fire({
    html: renderCardHtml({
      iconSvg: `
        <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      `,
      iconBoxClasses: 'bg-gradient-to-br from-[#082216] to-[#0f3825] border border-emerald-500/30 text-emerald-400 shadow-emerald-950/20',
      badgeText: opts.badge,
      badgeClasses: 'text-emerald-700 bg-emerald-50 border border-emerald-200/80',
      title: opts.title,
      text: opts.text,
    }),
    confirmButtonText: opts.confirmButtonText || 'Aceptar',
    showConfirmButton: opts.showConfirmButton,
    timer: opts.timer,
    width: '440px',
    padding: '2rem 1.75rem',
    background: '#ffffff',
    buttonsStyling: false,
    customClass: opts.customClass || defaultCustomClass,
  });
};

/**
 * Alerta de error con diseño personalizado de tarjeta EventHive
 */
export const showErrorAlert = (titleOrOptions = 'Error', maybeText = 'Ocurrió un error inesperado.') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Error', 'Ocurrió un Error');

  return Swal.fire({
    html: renderCardHtml({
      iconSvg: `
        <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5" />
        </svg>
      `,
      iconBoxClasses: 'bg-gradient-to-br from-[#1e0f14] to-[#361320] border border-rose-500/30 text-rose-500 shadow-rose-950/20',
      badgeText: opts.badge,
      badgeClasses: 'text-rose-700 bg-rose-50 border border-rose-200/80',
      title: opts.title,
      text: opts.text,
    }),
    confirmButtonText: opts.confirmButtonText || 'Entendido',
    showConfirmButton: opts.showConfirmButton,
    timer: opts.timer,
    width: '440px',
    padding: '2rem 1.75rem',
    background: '#ffffff',
    buttonsStyling: false,
    customClass: opts.customClass || defaultCustomClass,
  });
};

/**
 * Alerta de error de autenticación / credenciales con diseño personalizado EventHive
 */
export const showAuthErrorAlert = (
  titleOrOptions = 'Credenciales incorrectas',
  maybeText = 'El correo electrónico o la contraseña ingresada no son válidos. Por favor, verifica tus datos e inténtalo nuevamente.'
) => {
  const opts = normalizeAlertOptions(
    titleOrOptions,
    maybeText,
    'Credenciales incorrectas',
    'Error de Acceso'
  );

  return Swal.fire({
    html: renderCardHtml({
      iconSvg: `
        <svg class="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      `,
      iconBoxClasses: 'bg-gradient-to-br from-[#1a0c12] to-[#33111e] border border-rose-500/40 text-rose-400 shadow-rose-950/25',
      badgeText: opts.badge || 'Credenciales Inválidas',
      badgeClasses: 'text-rose-700 bg-rose-50 border border-rose-200/80',
      title: opts.title,
      text: opts.text,
    }),
    confirmButtonText: opts.confirmButtonText || 'Reintentar',
    showConfirmButton: true,
    width: '440px',
    padding: '2rem 1.75rem',
    background: '#ffffff',
    buttonsStyling: false,
    customClass: opts.customClass || defaultCustomClass,
  });
};

/**
 * Alerta de advertencia con diseño personalizado de tarjeta EventHive
 */
export const showWarningAlert = (titleOrOptions = 'Atención', maybeText = '') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Atención', 'Advertencia');

  return Swal.fire({
    html: renderCardHtml({
      iconSvg: `
        <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.5" />
        </svg>
      `,
      iconBoxClasses: 'bg-gradient-to-br from-[#1f1609] to-[#38260e] border border-amber-500/30 text-amber-400 shadow-amber-950/20',
      badgeText: opts.badge,
      badgeClasses: 'text-amber-700 bg-amber-50 border border-amber-200/80',
      title: opts.title,
      text: opts.text,
    }),
    confirmButtonText: opts.confirmButtonText || 'Aceptar',
    showConfirmButton: opts.showConfirmButton,
    timer: opts.timer,
    width: '440px',
    padding: '2rem 1.75rem',
    background: '#ffffff',
    buttonsStyling: false,
    customClass: opts.customClass || defaultCustomClass,
  });
};

/**
 * Alerta informativa con diseño personalizado de tarjeta EventHive
 */
export const showInfoAlert = (titleOrOptions = 'Información', maybeText = '') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Información', 'Aviso Importante');

  return Swal.fire({
    html: renderCardHtml({
      iconSvg: `
        <svg class="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2.5" />
        </svg>
      `,
      iconBoxClasses: 'bg-gradient-to-br from-[#0D1527] to-[#1c2a4d] border border-sky-400/30 text-sky-400 shadow-sky-950/20',
      badgeText: opts.badge,
      badgeClasses: 'text-sky-700 bg-sky-50 border border-sky-200/80',
      title: opts.title,
      text: opts.text,
    }),
    confirmButtonText: opts.confirmButtonText || 'Entendido',
    showConfirmButton: opts.showConfirmButton,
    timer: opts.timer,
    width: '440px',
    padding: '2rem 1.75rem',
    background: '#ffffff',
    buttonsStyling: false,
    customClass: opts.customClass || defaultCustomClass,
  });
};

/**
 * Alerta de confirmación con diseño personalizado de tarjeta EventHive
 */
export const showConfirmAlert = ({
  title = '¿Estás seguro?',
  text = 'Esta acción no se puede deshacer.',
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  badge = 'Confirmación',
  isDanger = false,
} = {}) => {
  return Swal.fire({
    html: renderCardHtml({
      iconSvg: isDanger
        ? `
          <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.5" />
          </svg>
        `
        : `
          <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.5" />
          </svg>
        `,
      iconBoxClasses: isDanger
        ? 'bg-gradient-to-br from-[#1e0f14] to-[#361320] border border-rose-500/30 text-rose-500 shadow-rose-950/20'
        : 'bg-gradient-to-br from-[#0D1527] to-[#1c2a4d] border border-amber-400/30 text-amber-400 shadow-[#0D1527]/25',
      badgeText: badge || (isDanger ? 'Acción Irreversible' : 'Confirmación Requerida'),
      badgeClasses: isDanger
        ? 'text-rose-700 bg-rose-50 border border-rose-200/80'
        : 'text-amber-700 bg-amber-50 border border-amber-200/80',
      title,
      text,
    }),
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    width: '440px',
    padding: '2rem 1.75rem',
    background: '#ffffff',
    customClass: {
      ...defaultCustomClass,
      confirmButton: isDanger
        ? 'inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all duration-200 cursor-pointer'
        : defaultCustomClass.confirmButton,
    },
    buttonsStyling: false,
  });
};

/**
 * Mensaje exacto requerido cuando la organización está en PENDIENTE_REVISION:
 * "Su evento ha sido creado como borrador, por favor adjunte su RUT para verificación de su organización."
 */
export const showPendingRutAlert = () => {
  return Swal.fire({
    html: renderCardHtml({
      iconSvg: `
        <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      `,
      iconBoxClasses: 'bg-gradient-to-br from-[#0D1527] to-[#1c2a4d] border border-amber-400/30 text-amber-400 shadow-[#0D1527]/25',
      badgeText: 'Organización en Revisión',
      badgeClasses: 'text-amber-700 bg-amber-50 border border-amber-200/80',
      title: 'Validación de RUT requerida',
      text: 'Su evento ha sido creado como borrador, por favor adjunte su RUT para verificación de su organización.',
    }),
    confirmButtonText: 'Entendido',
    width: '440px',
    padding: '2rem 1.75rem',
    background: '#ffffff',
    customClass: defaultCustomClass,
    buttonsStyling: false,
  });
};

/**
 * Alerta profesional para solicitar inicio de sesión con icono SVG moderno y estilo EventHive.
 */
export const showLoginAlert = ({
  title = 'Inicia sesión',
  text = 'Inicia sesión para interactuar con eventos, guardar tus favoritos y adquirir entradas.',
  confirmButtonText = 'Iniciar sesión',
  cancelButtonText = 'Cancelar',
  showCancelButton = true,
  navigate = null,
} = {}) => {
  return Swal.fire({
    html: renderCardHtml({
      iconSvg: `
        <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      `,
      iconBoxClasses: 'bg-gradient-to-br from-[#0D1527] to-[#1c2a4d] border border-amber-400/30 text-amber-400 shadow-lg shadow-[#0D1527]/25',
      badgeText: 'Acceso Requerido',
      badgeClasses: 'text-amber-700 bg-amber-50 border border-amber-200/80',
      title,
      text,
    }),
    showCancelButton,
    confirmButtonText: `
      <span class="inline-flex items-center gap-2">
        <span>${confirmButtonText}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </span>
    `,
    cancelButtonText,
    reverseButtons: true,
    width: '440px',
    padding: '2rem 1.75rem',
    background: '#ffffff',
    buttonsStyling: false,
    customClass: defaultCustomClass,
  }).then((result) => {
    if (result.isConfirmed) {
      if (typeof navigate === 'function') {
        navigate('/iniciosesion');
      } else {
        window.location.href = '/iniciosesion';
      }
    }
    return result;
  });
};

/**
 * Alerta profesional para solicitar activación de ubicación.
 */
export const showLocationPromptAlert = ({
  title = 'Activa tu ubicación',
  text = 'Para encontrar eventos cercanos a la distancia seleccionada, necesitamos acceder a tu ubicación actual en Cartagena.',
  confirmButtonText = 'Activar ubicación',
  cancelButtonText = 'Cancelar',
} = {}) => {
  return Swal.fire({
    html: renderCardHtml({
      iconSvg: `
        <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      `,
      iconBoxClasses: 'bg-gradient-to-br from-[#0D1527] to-[#1c2a4d] border border-amber-400/30 text-amber-400 shadow-lg shadow-[#0D1527]/25',
      badgeText: 'Geolocalización',
      badgeClasses: 'text-amber-700 bg-amber-50 border border-amber-200/80',
      title,
      text,
    }),
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    width: '440px',
    padding: '2rem 1.75rem',
    background: '#ffffff',
    buttonsStyling: false,
    customClass: defaultCustomClass,
  });
};

export default {
  showAlert: Swal.fire,
  showSuccessAlert,
  showErrorAlert,
  showAuthErrorAlert,
  showWarningAlert,
  showInfoAlert,
  showConfirmAlert,
  showPendingRutAlert,
  showLoginAlert,
  showLocationPromptAlert,
};

