import Swal from 'sweetalert2';

/**
 * Escapa cadenas para prevenir inyecciones HTML en mensajes dinámicos
 */
const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Clases CSS base de EventHive para armonizar con temas claro y oscuro
 */
const BASE_SWAL_CLASSES = {
  container: 'eventhive-swal-container',
  popup: 'eventhive-swal-popup',
  title: 'eventhive-swal-title',
  htmlContainer: 'eventhive-swal-html',
  actions: 'eventhive-swal-actions',
  confirmButton: 'eventhive-btn-confirm',
  cancelButton: 'eventhive-btn-cancel',
  closeButton: 'swal2-close',
};

/**
 * Normaliza los parámetros para admitir tanto (title, text) como ({ title, text, ... })
 */
const normalizeAlertOptions = (titleOrOptions, maybeText, defaultTitle) => {
  if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
    return {
      title: titleOrOptions.title ?? defaultTitle,
      text: titleOrOptions.text ?? '',
      badge: titleOrOptions.badge,
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
 * Alerta de éxito con diseño EventHive adaptado a temas claro y oscuro
 */
export const showSuccessAlert = (titleOrOptions = '¡Éxito!', maybeText = '') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, '¡Éxito!');
  const swalConfig = {
    icon: 'success',
    title: opts.title,
    confirmButtonText: opts.confirmButtonText || 'Aceptar',
    timer: opts.timer,
    buttonsStyling: false,
    customClass: BASE_SWAL_CLASSES,
  };

  if (opts.badge) {
    swalConfig.html = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
        <span class="eventhive-pill-brand">${escapeHtml(opts.badge)}</span>
        <p class="eventhive-swal-text" style="margin: 0;">${escapeHtml(opts.text)}</p>
      </div>
    `;
  } else {
    swalConfig.text = opts.text;
  }

  return Swal.fire(swalConfig);
};

/**
 * Alerta de error con diseño EventHive adaptado a temas claro y oscuro
 */
export const showErrorAlert = (titleOrOptions = 'Error', maybeText = 'Ocurrió un error inesperado.') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Error');
  const swalConfig = {
    icon: 'error',
    title: opts.title,

    confirmButtonText: opts.confirmButtonText || 'Entendido',
    buttonsStyling: false,
    customClass: BASE_SWAL_CLASSES,
  };

  if (opts.badge) {
    swalConfig.html = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
        <span class="eventhive-pill-brand" style="background: rgba(239, 68, 68, 0.12); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">${escapeHtml(opts.badge)}</span>
        <p class="eventhive-swal-text" style="margin: 0;">${escapeHtml(opts.text)}</p>
      </div>
    `;
  } else {
    swalConfig.text = opts.text;
  }

  return Swal.fire(swalConfig);
};

/**
 * Alerta de error de autenticación con diseño EventHive adaptado a temas claro y oscuro
 */
export const showAuthErrorAlert = (
  titleOrOptions = 'Credenciales incorrectas',
  maybeText = 'El correo electrónico o la contraseña ingresada no son válidos. Por favor, verifica tus datos e inténtalo nuevamente.'
) => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Credenciales incorrectas');
  const swalConfig = {
    icon: 'error',
    title: opts.title,
    confirmButtonText: opts.confirmButtonText || 'Reintentar',
    buttonsStyling: false,
    customClass: BASE_SWAL_CLASSES,
  };

  if (opts.badge) {
    swalConfig.html = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
        <span class="eventhive-pill-brand" style="background: rgba(239, 68, 68, 0.12); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">${escapeHtml(opts.badge)}</span>
        <p class="eventhive-swal-text" style="margin: 0;">${escapeHtml(opts.text)}</p>
      </div>
    `;
  } else {
    swalConfig.text = opts.text;
  }

  return Swal.fire(swalConfig);
};

/**
 * Alerta de advertencia con diseño EventHive adaptado a temas claro y oscuro
 */
export const showWarningAlert = (titleOrOptions = 'Atención', maybeText = '') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Atención');
  return Swal.fire({
    icon: 'warning',
    title: opts.title,
    text: opts.text,
    confirmButtonText: opts.confirmButtonText || 'Entendido',
    buttonsStyling: false,
    customClass: BASE_SWAL_CLASSES,
  });
};

/**
 * Alerta informativa con diseño EventHive adaptado a temas claro y oscuro
 */
export const showInfoAlert = (titleOrOptions = 'Información', maybeText = '') => {
  const opts = normalizeAlertOptions(titleOrOptions, maybeText, 'Información');
  return Swal.fire({
    icon: 'info',
    title: opts.title,
    text: opts.text,
    confirmButtonText: opts.confirmButtonText || 'Aceptar',
    timer: opts.timer,
    buttonsStyling: false,
    customClass: BASE_SWAL_CLASSES,
  });
};

/**
 * Alerta de confirmación con diseño EventHive adaptado a temas claro y oscuro
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
    buttonsStyling: false,
    customClass: {
      ...BASE_SWAL_CLASSES,
      confirmButton: isDanger ? 'eventhive-btn-confirm eventhive-btn-danger' : 'eventhive-btn-confirm',
    },
  }).then((res) => res.isConfirmed === true);
};

/**
 * Mensaje requerido cuando la organización está en PENDIENTE_REVISION
 */
export const showPendingRutAlert = () => {
  return Swal.fire({
    icon: 'info',
    title: 'Validación de RUT requerida',
    text: 'El evento se guardó como borrador. Carga el RUT de tu organización para enviarlo a revisión.',
    confirmButtonText: 'Entendido',
    buttonsStyling: false,
    customClass: BASE_SWAL_CLASSES,
  });
};

/**
 * Alerta ultra personalizada para usuarios no autenticados en EventHive
 * Adapta dinámicamente colores, bordes, sombras y enlaces en Modo Claro y Modo Oscuro.
 */
export const showLoginAlert = ({
  title = 'Inicia sesión',
  text = 'Inicia sesión para interactuar con eventos, guardar tus favoritos y adquirir entradas.',
  confirmButtonText = 'Iniciar sesión',
  cancelButtonText = 'Cancelar',
  showCancelButton = true,
  navigate = null,
  redirectUrl = '/iniciosesion',
  registerUrl = '/registro',
} = {}) => {
  const safeTitle = escapeHtml(title);
  const safeText = escapeHtml(text);

  // Determinar beneficio contextual según el texto de la acción que intentaba hacer el usuario
  const lowerText = (text || '').toLowerCase();
  let benefitText = 'Accede a tus entradas, guarda favoritos y vive experiencias inolvidables.';
  if (lowerText.includes('favorito') || lowerText.includes('deseo') || lowerText.includes('guardar')) {
    benefitText = 'Guarda eventos en tu lista personal de favoritos.';
  } else if (lowerText.includes('organizador') || lowerText.includes('organización') || lowerText.includes('seguir')) {
    benefitText = 'Sigue a este organizador para recibir alertas tempranas de sus próximos lanzamientos.';
  } else if (lowerText.includes('entrada') || lowerText.includes('adquirir') || lowerText.includes('compra') || lowerText.includes('boleto')) {
    benefitText = 'Compra tus entradas de forma 100% segura y descárgalas al instante con código QR.';
  }

  const customHtml = `
    <div class="eventhive-login-header">
      <div class="eventhive-icon-badge">
        <div class="eventhive-icon-badge-glow"></div>
        <svg class="eventhive-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      </div>
    </div>

    <h2 class="swal2-title eventhive-swal-title">${safeTitle}</h2>

    <p class="eventhive-swal-text">${safeText}</p>

    <div class="eventhive-benefit-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span>${escapeHtml(benefitText)}</span>
    </div>

    <div class="eventhive-swal-footer">
      <span>¿No tienes una cuenta aún?</span>
      <a href="${registerUrl}" class="eventhive-swal-register-link" id="swal-register-link">
        Regístrate gratis
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </a>
    </div>
  `;

  return Swal.fire({
    html: customHtml,
    showCancelButton,
    showCloseButton: true,
    confirmButtonText,
    cancelButtonText,
    buttonsStyling: false,
    focusConfirm: true,
    reverseButtons: true,
    customClass: BASE_SWAL_CLASSES,
    didOpen: (popup) => {
      const registerLink = popup.querySelector('#swal-register-link');
      if (registerLink) {
        registerLink.addEventListener('click', (e) => {
          e.preventDefault();
          Swal.close();
          if (typeof navigate === 'function') {
            navigate(registerUrl);
          } else {
            window.location.href = registerUrl;
          }
        });
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      if (typeof navigate === 'function') {
        navigate(redirectUrl);
      } else {
        window.location.href = redirectUrl;
      }
    }
    return result;
  });
};

/**
 * Alerta para solicitar activación de ubicación con diseño EventHive adaptado a temas
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

    reverseButtons: true,
    buttonsStyling: false,
    customClass: BASE_SWAL_CLASSES,
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
