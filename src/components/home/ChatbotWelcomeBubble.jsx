import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * ChatbotWelcomeBubble
 * Bocadillo de diálogo estilo cómic anclado directamente dentro del
 * mismo contenedor relativo del botón flotante del chatbot.
 * Si el botón cambia de esquina en móvil, el globo viaja automáticamente con él.
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
      className={`absolute z-50 chatbot-welcome-bubble-anchor cursor-pointer select-none transition-all duration-300 animate-in fade-in zoom-in-95 group rounded-[18px] border-2 p-3.5 pr-8 ${
        isDark
          ? 'bg-[#0F2342] border-[#F5B800] text-white'
          : 'bg-[#FFFFFF] border-[#0F2342] text-[#0F2342]'
      }`}
      style={{
        boxShadow: '0 10px 25px rgba(15, 35, 66, 0.18)',
      }}
    >
      {/* Posicionamiento Responsivo Dinámico anclado:
          - Móvil (<768px): bottom: calc(100% + 12px), left: 0, right: auto, max-width: calc(100vw - 32px)
          - Escritorio (>=768px): bottom: calc(100% + 14px), right: 0, left: auto, max-width: 285px
      */}
      <style>{`
        .chatbot-welcome-bubble-anchor {
          bottom: calc(100% + 12px);
          left: 0;
          right: auto;
          max-width: calc(100vw - 32px);
          width: max-content;
        }
        @media (min-width: 768px) {
          .chatbot-welcome-bubble-anchor {
            bottom: calc(100% + 14px);
            left: auto;
            right: 0;
            max-width: 285px;
          }
        }
      `}</style>

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

      {/* Texto de diálogo directo según especificación */}
      <p className="text-xs leading-snug font-medium">
        <strong className={isDark ? 'text-[#F5B800]' : 'text-[#0F2342]'}>
          ¿Buscas concierto o plan?{' '}
        </strong>
        Dime qué música te gusta y te muestro los mejores eventos.
      </p>

      {/* Cola del bocadillo estilo cómic (triángulo CSS) apuntando hacia abajo hacia el botón flotante:
          - Móvil (<768px): left: 20px
          - Escritorio (>=768px): right: 20px
      */}
      {/* Borde exterior del triángulo */}
      <div
        aria-hidden="true"
        className={`absolute -bottom-[9px] left-[20px] md:left-auto md:right-[20px] w-0 h-0 border-solid border-t-[9px] border-l-[7px] border-r-[7px] border-b-0 border-l-transparent border-r-transparent ${
          isDark ? 'border-t-[#F5B800]' : 'border-t-[#0F2342]'
        }`}
      />
      {/* Relleno interior del triángulo */}
      <div
        aria-hidden="true"
        className={`absolute -bottom-[6.5px] left-[21px] md:left-auto md:right-[21px] w-0 h-0 border-solid border-t-[7px] border-l-[6px] border-r-[6px] border-b-0 border-l-transparent border-r-transparent ${
          isDark ? 'border-t-[#0F2342]' : 'border-t-[#FFFFFF]'
        }`}
      />
    </div>
  );
}