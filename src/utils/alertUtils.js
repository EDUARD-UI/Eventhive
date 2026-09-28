import Swal from 'sweetalert2';
import mascotaImg from '../assets/mascota.jpg';

/**
 * Alerta reutilizable con la imagen de la mascota para solicitar inicio de sesión.
 */
export const showLoginAlert = ({
  title = 'Inicia sesión',
  text = 'Inicia sesión para poder hacer esto.',
  confirmButtonText = 'Iniciar sesión',
  cancelButtonText = 'Cancelar',
  showCancelButton = true,
  navigate = null,
} = {}) => {
  return Swal.fire({
    title,
    text,
    imageUrl: mascotaImg,
    imageWidth: 160,
    imageHeight: 185,
    imageAlt: 'Mascota EventHive',
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#007BFF',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    width: '460px',
    padding: '2rem 1.75rem',
    customClass: {
      popup: 'rounded-3xl shadow-2xl border border-slate-100',
      title: 'text-[#0a1838] font-black text-2xl mb-2',
      htmlContainer: 'text-slate-600 text-base leading-relaxed',
      confirmButton: 'rounded-xl px-6 py-3 font-bold text-base shadow-md',
      cancelButton: 'rounded-xl px-5 py-3 font-semibold text-base',
      image: 'object-contain my-3 drop-shadow-md',
    },
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
 * Alerta con la mascota para pedir activación de ubicación.
 */
export const showLocationPromptAlert = ({
  title = 'Activa tu ubicación',
  text = 'Para encontrar eventos cercanos a la distancia seleccionada, necesitamos acceder a tu ubicación actual.',
  confirmButtonText = 'Activar ubicación',
  cancelButtonText = 'Cancelar',
} = {}) => {
  return Swal.fire({
    title,
    text,
    imageUrl: mascotaImg,
    imageWidth: 160,
    imageHeight: 185,
    imageAlt: 'Mascota EventHive',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#007BFF',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    width: '460px',
    padding: '2rem 1.75rem',
    customClass: {
      popup: 'rounded-3xl shadow-2xl border border-slate-100',
      title: 'text-[#0a1838] font-black text-2xl mb-2',
      htmlContainer: 'text-slate-600 text-base leading-relaxed',
      confirmButton: 'rounded-xl px-6 py-3 font-bold text-base shadow-md',
      cancelButton: 'rounded-xl px-5 py-3 font-semibold text-base',
      image: 'object-contain my-3 drop-shadow-md',
    },
  });
};

export default {
  showLoginAlert,
  showLocationPromptAlert,
};
