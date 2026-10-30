import Swal from 'sweetalert2';

/**
 * Normaliza los parámetros para admitir tanto (title, text) como ({ title, text, ... })
 */
const normalizeAlertOptions = (titleOrOptions, maybeText, defaultTitle) => {
  if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
    return {
      title: titleOrOptions.title ?? defaultTitle,
      text: titleOrOptions.text ?? '',
      confirmButtonText: titleOrOptions.confirmButtonText,
      cancelButtonText: titleOrOptions.cancelButtonText,
      showConfirmButton: titleOrOptions.showConfirmButton ?? true,
      showCancelButton: titleOrOptions.showCancelButton ?? false,
      timer: titleOrOptions.timer,
      ...titleOrOptions,
    };
  }
  return {
    title: titleOrOptions ?? defaultTitle,
    text: maybeText ?? '',
    showConfirmButton: true,
  };
};

/**
 * Alerta de éxito estándar por defecto de SweetAlert2
 */
export const showSuccessAlert = (titleOrOptions = '¡Éxito!', maybeText = '') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, '¡Éxito!');
  return Swal.fire({
    icon: 'success',
    title: opts.title,
    text: opts.text,
    confirmButtonText: opts.confirmButtonText || 'Aceptar',
    confirmButtonColor: '#0B1B3D',
    timer: opts.timer,
  });
};

/**
 * Alerta de error estándar por defecto de SweetAlert2
 */
export const showErrorAlert = (titleOrOptions = 'Error', maybeText = 'Ocurrió un error inesperado.') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Error');
  return Swal.fire({
    icon: 'error',
    title: opts.title,
    text: opts.text,
    confirmButtonText: opts.confirmButtonText || 'Entendido',
    confirmButtonColor: '#0B1B3D',
  });
};

/**
 * Alerta de error de autenticación estándar por defecto de SweetAlert2
 */
export const showAuthErrorAlert = (
  titleOrOptions = 'Credenciales incorrectas',
  maybeText = 'El correo electrónico o la contraseña ingresada no son válidos. Por favor, verifica tus datos e inténtalo nuevamente.'
) => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Credenciales incorrectas');
  return Swal.fire({
    icon: 'error',
    title: opts.title,
    text: opts.text,
    confirmButtonText: opts.confirmButtonText || 'Reintentar',
    confirmButtonColor: '#0B1B3D',
  });
};

/**
 * Alerta de advertencia estándar por defecto de SweetAlert2
 */
export const showWarningAlert = (titleOrOptions = 'Atención', maybeText = '') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Atención');
  return Swal.fire({
    icon: 'warning',
    title: opts.title,
    text: opts.text,
    confirmButtonText: opts.confirmButtonText || 'Entendido',
    confirmButtonColor: '#0B1B3D',
  });
};

/**
 * Alerta informativa estándar por defecto de SweetAlert2
 */
export const showInfoAlert = (titleOrOptions = 'Información', maybeText = '') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Información');
  return Swal.fire({
    icon: 'info',
    title: opts.title,
    text: opts.text,
    confirmButtonText: opts.confirmButtonText || 'Aceptar',
    confirmButtonColor: '#0B1B3D',
    timer: opts.timer,
  });
};

/**
 * Alerta de confirmación estándar por defecto de SweetAlert2
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
    confirmButtonColor: isDanger ? '#e11d48' : '#0B1B3D',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
  }).then((res) => res.isConfirmed);
};

/**
 * Mensaje exacto requerido cuando la organización está en PENDIENTE_REVISION
 */
export const showPendingRutAlert = () => {
  return Swal.fire({
    icon: 'info',
    title: 'Validación de RUT requerida',
    text: 'Su evento ha sido creado como borrador, por favor adjunte su RUT para verificación de su organización.',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#0B1B3D',
  });
};

/**
 * Alerta para solicitar inicio de sesión con SweetAlert2 estándar
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
    icon: 'info',
    title,
    text,
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#0B1B3D',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
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
 * Alerta para solicitar activación de ubicación con SweetAlert2 estándar
 */
export const showLocationPromptAlert = ({
  title = 'Activa tu ubicación',
  text = 'Para encontrar eventos cercanos a la distancia seleccionada, necesitamos acceder a tu ubicación actual en Cartagena.',
  confirmButtonText = 'Activar ubicación',
  cancelButtonText = 'Cancelar',
} = {}) => {
  return Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#0B1B3D',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
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
