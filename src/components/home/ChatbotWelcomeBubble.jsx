import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * ChatbotWelcomeBubble
 * Bocadillo de diálogo flotante estilo cómic / caricatura anclado
 * justo encima del botón del chatbot en el Home.
 * Invita al usuario a buscar planes o conciertos con un copy cercano.
 */
export default function ChatbotWelcomeBubble({ onOpenChat, isChatOpen }) {
  const { isDark } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '';

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Si no estamos en el Home o el chat ya está abierto, no mostrar
    if (!isHome || isChatOpen) {
      setVisible(false);
      return;
    }

    // Verificar si el usuario ya lo cerró en esta sesión
    const isDismissed = sessionStorage.getItem('eventhive_welcome_bubble_dismissed');
    if (isDismissed === 'true') {
      return;
    }

    // Aparece con animación suave 1.5s después de cargar el Home
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isHome, isChatOpen]);

  const handleClose = (e) => {
    e.stopPropagation();
    setVisible(false);
    sessionStorage.setItem('eventhive_welcome_bubble_dismissed', 'true');
  };

  const handleBubbleClick = () => {
    setVisible(false);
    sessionStorage.setItem('eventhive_welcome_bubble_dismissed', 'true');
    if (onOpenChat) onOpenChat();
  };

  if (!visible || !isHome || isChatOpen) return null;

  return (
    <div
      onClick={handleBubbleClick}
      className={`fixed z-[9999] right-6 bottom-24 sm:bottom-25 max-w-[265px] p-3.5 pr-8 rounded-[18px] border-2 cursor-pointer select-none transition-all duration-300 animate-in fade-in zoom-in-95 group ${
        isDark
          ? 'bg-[#0F2342] border-[#F5B800] text-white'
          : 'bg-[#FFFFFF] border-[#0F2342] text-[#0F2342]'
      }`}
      style={{
        boxShadow: '0 10px 25px rgba(15, 35, 66, 0.18)',
      }}
    >
      {/* Botón de cierre discreto */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Cerrar mensaje de bienvenida"
        className={`absolute top-2.5 right-2.5 p-1 rounded-full transition-colors cursor-pointer ${
          isDark
            ? 'text-slate-400 hover:text-white hover:bg-white/10'
            : 'text-slate-400 hover:text-[#0F2342] hover:bg-slate-100'
        }`}
      >
        <FiX size={13} />
      </button>

      {/* Texto de diálogo */}
      <p className="text-xs leading-snug">
        <strong className={isDark ? 'text-[#F5B800]' : 'text-[#0F2342]'}>
          ¿Buscas concierto o plan?{' '}
        </strong>
        Cuéntame qué música te gusta y te ayudo a encontrar eventos.
      </p>

      {/* Cola del bocadillo de caricatura (triángulo CSS) apuntando hacia abajo hacia el botón flotante */}
      <div
        aria-hidden="true"
        className={`absolute -bottom-2.5 right-6 w-0 h-0 border-solid border-t-[10px] border-l-[8px] border-r-[8px] border-b-0 border-l-transparent border-r-transparent ${
          isDark ? 'border-t-[#F5B800]' : 'border-t-[#0F2342]'
        }`}
      />
      <div
        aria-hidden="true"
        className={`absolute -bottom-[7px] right-[25px] w-0 h-0 border-solid border-t-[8px] border-l-[7px] border-r-[7px] border-b-0 border-l-transparent border-r-transparent ${
          isDark ? 'border-t-[#0F2342]' : 'border-t-[#FFFFFF]'
        }`}
      />
    </div>
  );
}