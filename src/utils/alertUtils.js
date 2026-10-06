import Swal from 'sweetalert2';

const defaultCustomClass = {
  popup: 'rounded-3xl shadow-2xl border border-slate-100',
  actions: 'flex items-center justify-center gap-3 mt-4 w-full',
  confirmButton: 'inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-amber-500/25 active:scale-95 transition-all duration-200 cursor-pointer',
  cancelButton: 'inline-flex items-center justify-center py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all duration-200 cursor-pointer',
};

/**
 * Alerta de éxito con SweetAlert2
 */
export const showSuccessAlert = (title = '¡Éxito!', text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#F59E0B',
    customClass: defaultCustomClass,
    buttonsStyling: false,
  });
};

/**
 * Alerta de error con SweetAlert2
 */
export const showErrorAlert = (title = 'Error', text = 'Ocurrió un error inesperado.') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#0B1B3D',
    customClass: defaultCustomClass,
    buttonsStyling: false,
  });
};

/**
 * Alerta de advertencia con SweetAlert2
 */
export const showWarningAlert = (title = 'Atención', text = '') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#F59E0B',
    customClass: defaultCustomClass,
    buttonsStyling: false,
  });
};

/**
 * Alerta informativa con SweetAlert2
 */
export const showInfoAlert = (title = 'Información', text = '') => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#0B1B3D',
    customClass: defaultCustomClass,
    buttonsStyling: false,
  });
};

/**
 * Alerta de confirmación con SweetAlert2 (devuelve Promise que resuelve { isConfirmed })
 */
export const showConfirmAlert = ({
  title = '¿Estás seguro?',
  text = 'Esta acción no se puede deshacer.',
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  isDanger = false,
} = {}) => {
  return Swal.fire({
    icon: isDanger ? 'warning' : 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      ...defaultCustomClass,
      confirmButton: isDanger
        ? 'inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all duration-200 cursor-pointer'
        : defaultCustomClass.confirmButton,
    },
    buttonsStyling: false,
  });
};

/**
 * Mensaje exacto requerido según Requisito 5 cuando la organización está en PENDIENTE_REVISION:
 * "Su evento ha sido creado como borrador, por favor adjunte su RUT para verificación de su organización."
 */
export const showPendingRutAlert = () => {
  return Swal.fire({
    icon: 'info',
    title: 'Organización en revisión',
    text: 'Su evento ha sido creado como borrador, por favor adjunte su RUT para verificación de su organización.',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#0B1B3D',
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
    html: `
      <div class="flex flex-col items-center text-center px-1 pt-1">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D1527] to-[#1c2a4d] border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg shadow-[#0D1527]/25 mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </div>
        <span class="inline-block text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full mb-2">
          Acceso Requerido
        </span>
        <h3 class="text-xl sm:text-2xl font-black text-[#0B172C] tracking-tight mb-2">
          ${title}
        </h3>
        <p class="text-slate-600 text-sm leading-relaxed max-w-sm mb-1">
          ${text}
        </p>
      </div>
    `,
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
    html: `
      <div class="flex flex-col items-center text-center px-1 pt-1">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D1527] to-[#1c2a4d] border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg shadow-[#0D1527]/25 mb-4">
          <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <span class="inline-block text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full mb-2">
          Geolocalización
        </span>
        <h3 class="text-xl sm:text-2xl font-black text-[#0B172C] tracking-tight mb-2">
          ${title}
        </h3>
        <p class="text-slate-600 text-sm leading-relaxed max-w-sm mb-1">
          ${text}
        </p>
      </div>
    `,
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
  showWarningAlert,
  showInfoAlert,
  showConfirmAlert,
  showPendingRutAlert,
  showLoginAlert,
  showLocationPromptAlert,
};
