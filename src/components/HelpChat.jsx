import { useState, useRef, useEffect } from "react";
import {
  FiX,
  FiSend,
  FiCalendar,
  FiChevronRight,
} from "react-icons/fi";
import { API_BASE_URL } from "../config/api.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

/**
 * HelpChat (Conectado a Spring Boot + Groq Llama 3.1)
 * Widget de chat flotante institucional para EventHive.
 * Botón estático ubicado en el lateral derecho, entre la esquina inferior y el centro vertical.
 * Solo aparece en las vistas principales ('home', 'buscar', 'organizaciones', 'perfil').
 */
export default function HelpChat({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpen: controlledOnOpen,
}) {
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Restricción de rutas: solo vistas principales y perfil de usuario
  const isAllowedPath = (() => {
    const path = (location?.pathname || '').toLowerCase();
    if (path === '/' || path === '') return true;
    if (path === '/buscar' || path.startsWith('/buscar')) return true;
    if (path.startsWith('/organizaciones') || path.startsWith('/organizacion')) return true;
    if (path.startsWith('/perfil')) return true;
    return false;
  })();

  const [internalOpen, setInternalOpen] = useState(Boolean(controlledIsOpen));
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      from: "bot",
      text: t("helpChat.initialMessage"),
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Limpiar posición previa guardada de drag & drop si existiera
  useEffect(() => {
    try {
      localStorage.removeItem("eventhive_chat_bubble_pos");
    } catch (e) {}
  }, []);

  // Actualizar el saludo inicial cuando cambia el idioma si el usuario no ha enviado mensajes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 1) {
        return [{ id: 1, from: "bot", text: t("helpChat.initialMessage") }];
      }
      return prev;
    });
  }, [language, t]);

  // Sincronizar estado interno si controlledIsOpen cambia desde fuera
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setInternalOpen(Boolean(controlledIsOpen));
    }
  }, [controlledIsOpen]);

  const isOpen = controlledIsOpen !== undefined ? (Boolean(controlledIsOpen) || internalOpen) : internalOpen;

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([{ id: 1, from: "bot", text: t("helpChat.initialMessage") }]);
      }
      setDraft("");
      // Enfocar automáticamente el input para que el usuario pueda escribir directamente
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleToggle = () => {
    if (isOpen) {
      setInternalOpen(false);
      if (controlledOnClose) controlledOnClose();
    } else {
      setInternalOpen(true);
      if (controlledOnOpen) controlledOnOpen();
    }
  };

  const handleClose = () => {
    setInternalOpen(false);
    if (controlledOnClose) controlledOnClose();
  };

  const pushBotMessage = (payload) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), from: "bot", ...payload },
    ]);
  };

  // Envío de mensajes conectado al backend de Spring Boot + Groq
  const pushUserMessage = async (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text }]);
    setDraft("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/mensaje`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en servidor: ${response.status}`);
      }

      const data = await response.json();
      const botReply =
        data?.data?.respuesta ||
        data?.mensaje ||
        "¡Hola! ¿En qué más puedo orientarte sobre EventHive?";

      setIsTyping(false);
      pushBotMessage({ text: botReply });
    } catch (err) {
      console.warn("Fallo endpoint del chatbot, usando respuesta de contingencia:", err);
      setIsTyping(false);

      const lower = text.toLowerCase();
      if (lower.includes("boleto") || lower.includes("compra") || lower.includes("entrada")) {
        pushBotMessage({
          text: "Para comprar boletos, explora el catálogo de eventos, selecciona tu evento favorito y haz clic en 'Comprar boletos'. Recibirás tus entradas con código QR digital.",
        });
      } else if (lower.includes("pago") || lower.includes("tarjeta") || lower.includes("nequi")) {
        pushBotMessage({
          text: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard), transferencias PSE, Nequi y Daviplata con verificación 100% segura.",
        });
      } else if (lower.includes("organizar") || lower.includes("publicar") || lower.includes("crear")) {
        pushBotMessage({
          text: "¡Genial! Puedes registrarte o cambiar tu rol a Organización desde tu Perfil para publicar y gestionar eventos en EventHive.",
        });
      } else {
        pushBotMessage({
          text: "¡Hola! En EventHive estamos para ayudarte con tus eventos y boletos. ¿En qué podemos orientarte hoy?",
        });
      }
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    pushUserMessage(draft);
  };

  // Solo mostrar si está en una ruta permitida o si se encuentra abierto
  if (!isAllowedPath && !isOpen) {
    return null;
  }

  return (
    <>
      {/* 1. VENTANA DEL CHAT FLOTANTE */}
      {isOpen && (
        <aside
          aria-label="Ventana de chat de ayuda EventHive"
          className="fixed z-[9999] left-4 sm:left-auto sm:right-6 bottom-20 sm:bottom-24 w-[calc(100vw-2rem)] max-w-[360px] sm:max-w-[375px] h-[520px] max-h-[65vh] flex flex-col rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-black/10 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0B132B] transition-all animate-fade-in"
          style={{
            boxShadow: "0 20px 40px -15px rgba(11, 19, 43, 0.35), 0 0 1px 1px rgba(0,0,0,0.06)",
          }}
        >
          {/* Cabecera Azul Marino (#0B132B) */}
          <div className="relative flex items-center justify-between px-5 py-4 bg-[#0B132B] text-white shrink-0 select-none">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-[#132047] border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <img
                  src="/LOGO32x32.png"
                  alt="Isotipo EventHive"
                  className="w-5 h-5 object-contain drop-shadow-xs"
                />
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0B132B]"
                  title="En línea"
                  aria-label="Estado en línea"
                />
              </div>

              <div className="text-left">
                <h3 className="font-display font-bold text-[15px] sm:text-base leading-tight text-white tracking-tight">
                  HiveBot
                </h3>
                <p className="text-[11.5px] text-slate-300 font-normal leading-tight mt-0.5 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Asistente de IA</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              aria-label="Cerrar chat de ayuda"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Cuerpo de Mensajes */}
          <div
            ref={scrollRef}
            className={`flex-1 p-4 overflow-y-auto space-y-3.5 text-sm transition-colors ${
              isDark ? "bg-[#0A1024]" : "bg-slate-50/80"
            }`}
          >
            {messages.map((m) => {
              const isUser = m.from === "user";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-xs leading-relaxed text-[13.5px] whitespace-pre-wrap break-words ${
                      isUser
                        ? "bg-amber-500 text-slate-950 font-medium rounded-br-xs shadow-amber-500/10"
                        : isDark
                        ? "bg-[#16223D] text-slate-100 border border-white/5 rounded-bl-xs shadow-slate-950/20"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-slate-200/40"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Renderizado de eventos sugeridos */}
                  {m.events && m.events.length > 0 && (
                    <div className="w-full mt-2.5 space-y-1.5">
                      {m.events.slice(0, 3).map((event) => (
                        <div
                          key={event.id || event.eventoId}
                          onClick={() => {
                            const eventId = event.id || event.eventoId;
                            if (eventId) {
                              navigate(`/eventos/${eventId}`);
                              handleClose();
                            }
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                            isDark
                              ? "bg-[#121B33] border-white/10 hover:border-amber-400/50 hover:bg-[#182444]"
                              : "bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/30"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                            <FiCalendar size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-[12px] font-bold truncate ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {event.title || event.nombre}
                            </p>
                            <p className="text-[10.5px] text-slate-400 truncate">
                              {event.date || event.fecha || "Próximamente"}
                            </p>
                          </div>
                          <FiChevronRight size={14} className="text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Indicador de escritura */}
            {isTyping && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#16223D] border border-white/5 text-amber-400 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

          </div>

          {/* Barra Inferior con Input */}
          <form
            onSubmit={handleSubmit}
            className={`flex items-center gap-2.5 px-3.5 py-3 border-t shrink-0 select-none transition-colors ${
              isDark
                ? "bg-[#0B132B] border-white/10"
                : "bg-white border-slate-200/90"
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("helpChat.inputPlaceholder") || "Escribe tu pregunta..."}
              className={`flex-1 text-[13.5px] rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors ${
                isDark
                  ? "bg-[#131E3D] border-white/10 text-white placeholder-slate-400"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Enviar mensaje"
              className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 hover:bg-amber-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm shadow-amber-500/20"
            >
              <FiSend size={16} />
            </button>
          </form>
        </aside>
      )}

      {/* 2. BOTÓN FLOTANTE ESTÁTICO (Fijo entre esquina inferior derecha y centro vertical) */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? "Cerrar chat de ayuda" : "Abrir chat de ayuda"}
        className="fixed z-[9999] left-5 sm:left-auto sm:right-6 bottom-5 sm:bottom-6 w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#0B132B] border-2 border-amber-500 hover:border-amber-400 shadow-2xl shadow-slate-900/60 hover:shadow-amber-500/30 flex items-center justify-center transition-all select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer hover:scale-105 active:scale-95 duration-200"
      >
        <img
          src="/LOGO45x50.png"
          alt="EventHive Bot"
          className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm group-hover:rotate-6 transition-transform duration-200"
        />
      </button>
    </>
  );
}
