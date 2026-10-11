import { useState, useRef, useEffect } from "react";
import {
  FiX,
  FiSend,
  FiCalendar,
  FiHelpCircle,
  FiChevronRight,
  FiInfo,
  FiTag,
  FiCreditCard,
} from "react-icons/fi";
import { getUpcomingEvents } from "../services/eventService.js";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

const INITIAL_MESSAGE = {
  id: 1,
  from: "bot",
  text: "¡Hola! 👋 Soy el chatbot de EventHive. Puedo mostrarte los próximos eventos o resolver tus dudas.",
};

const FAQ_OPTIONS = [
  { id: "tickets", text: "¿Cómo compro boletos?", icon: FiTag },
  { id: "payments", text: "¿Qué métodos de pago aceptan?", icon: FiCreditCard },
  { id: "organize", text: "¿Cómo publico mi propio evento?", icon: FiInfo },
];

/**
 * HelpChat
 * Widget de chat flotante moderno para EventHive (estilo Figma).
 * - Header: Fondo azul marino (#0B132B) con avatar de isotipo dorado de ticket,
 *   título en blanco, indicador verde "en línea" y botón cerrar.
 * - Cuerpo: Fondo limpio con burbujas de bienvenida y botones redondeados con acentos ámbar.
 * - Barra inferior: Campo de texto oscuro con botón de envío circular ámbar y flecha blanca.
 * - Botón Flotante (FAB): Botón circular azul marino con borde dorado e isotipo de ticket en el centro.
 * - Soporte calibrado para Modo Claro y Modo Oscuro.
 */
export default function HelpChat({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpen: controlledOnOpen,
}) {
  const { isDark } = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Si se controla externamente mediante props
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([INITIAL_MESSAGE]);
      }
      setDraft("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showFaq]);

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

  const pushUserMessage = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text }]);
    setDraft("");

    // Respuesta inteligente simulada
    setTimeout(() => {
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
          text: "¡Genial! Puedes registrarte con rol de Organización en la sección de Registro para publicar y gestionar eventos en Cartagena.",
        });
      } else {
        pushBotMessage({
          text: "¡Gracias por comunicarte con EventHive! Nuestro equipo de soporte o la organización del evento te responderán muy pronto.",
        });
      }
    }, 800);
  };

  const showUpcomingEvents = async () => {
    pushUserMessage("Ver eventos próximos");
    setLoadingEvents(true);
    setShowFaq(false);
    try {
      const events = await getUpcomingEvents();
      pushBotMessage(
        events?.length
          ? { text: "Estos son los próximos eventos en Cartagena:", events }
          : { text: "No hay próximos eventos disponibles en este momento. ¡Vuelve a consultar pronto!" }
      );
    } catch {
      pushBotMessage({
        text: "No fue posible cargar los próximos eventos. Por favor revisa el catálogo en unos momentos.",
      });
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleFaqClick = (faq) => {
    pushUserMessage(faq.text);
    setShowFaq(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    pushUserMessage(draft);
  };

  return (
    <>
      {/* ========================================================
          VENTANA DEL CHAT FLOTANTE (ESTILO FIGMA)
          ======================================================== */}
      {isOpen && (
        <aside
          aria-label="Ventana de chat de ayuda EventHive"
          className="fixed z-[9999] bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] max-w-[360px] sm:max-w-[375px] h-[540px] max-h-[78vh] flex flex-col rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-black/10 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0B132B] transition-all animate-fade-in"
          style={{
            boxShadow:
              "0 20px 40px -15px rgba(11, 19, 43, 0.35), 0 0 1px 1px rgba(0,0,0,0.06)",
          }}
        >
          {/* 1. Cabecera Azul Marino (#0B132B) con Avatar de Isotipo Dorado y Punto Verde */}
          <div className="relative flex items-center justify-between px-5 py-4 bg-[#0B132B] text-white shrink-0 select-none">
            <div className="flex items-center gap-3">
              {/* Avatar con isotipo hexagonal de ticket */}
              <div className="relative w-10 h-10 rounded-full bg-[#132047] border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <img
                  src="/LOGO 32x32.png"
                  alt="Isotipo EventHive"
                  className="w-5 h-5 object-contain drop-shadow-xs"
                />
                {/* Indicador verde activo "en línea" */}
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0B132B]"
                  title="En línea"
                  aria-label="Estado en línea"
                />
              </div>

              {/* Títulos de Cabecera */}
              <div className="text-left">
                <h3 className="font-display font-bold text-[15px] sm:text-base leading-tight text-white tracking-tight">
                  Chat EventHive
                </h3>
                <p className="text-[11.5px] text-slate-300 font-normal leading-tight mt-0.5 flex items-center gap-1.5">
                  <span>Chatbot · en línea</span>
                </p>
              </div>
            </div>

            {/* Botón Cerrar "X" */}
            <button
              onClick={handleClose}
              aria-label="Cerrar chat de ayuda"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* 2. Cuerpo del Chat: Fondo limpio en tonalidades suaves con máxima legibilidad */}
          <div
            ref={scrollRef}
            className={`flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3.5 transition-colors ${
              isDark ? "bg-[#090F1F]" : "bg-[#F8FAFC]"
            }`}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.from === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Burbuja de Mensaje */}
                <div
                  className={`max-w-[85%] px-4 py-3 text-[13px] sm:text-[13.5px] leading-relaxed shadow-xs ${
                    m.from === "user"
                      ? "bg-amber-500 text-slate-950 font-semibold rounded-2xl rounded-br-xs"
                      : isDark
                      ? "bg-[#16223D] text-slate-100 border border-white/10 rounded-2xl rounded-tl-xs"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-2xl rounded-tl-xs"
                  }`}
                >
                  {m.text}
                </div>

                {/* Lista de Eventos Próximos si aplica */}
                {m.events && (
                  <div className="mt-2.5 flex flex-col gap-2 w-full max-w-[92%]">
                    {m.events.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => navigate(`/eventos/${event.id}`)}
                        className={`group flex items-center gap-3 text-left rounded-xl p-2.5 border transition-all cursor-pointer ${
                          isDark
                            ? "bg-[#16223D] border-white/10 hover:border-amber-400/50 hover:bg-[#1E2E52]"
                            : "bg-white border-slate-200 hover:border-amber-400 hover:shadow-sm"
                        }`}
                      >
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
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
                          <p className="text-[11px] text-slate-400 truncate">
                            {event.date || event.fecha || "Próximamente"}
                          </p>
                        </div>
                        <FiChevronRight
                          size={14}
                          className="text-slate-400 group-hover:text-amber-500 transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Opciones de Acción Rápida (Solo en estado inicial) */}
            {messages.length === 1 && (
              <div className="flex flex-col gap-2.5 mt-1 pt-1">
                {/* Opción 1: Ver eventos próximos */}
                <button
                  onClick={showUpcomingEvents}
                  disabled={loadingEvents}
                  className={`w-full flex items-center gap-3 text-left rounded-2xl p-3.5 border transition-all cursor-pointer group shadow-xs ${
                    isDark
                      ? "bg-[#16223D] border-white/10 hover:border-amber-400/60 hover:bg-[#1E2E52]"
                      : "bg-white border-slate-200/90 hover:border-amber-400 hover:shadow-sm hover:bg-amber-50/30"
                  } disabled:opacity-50`}
                >
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                    <FiCalendar size={17} />
                  </div>
                  <span
                    className={`text-[13.5px] font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {loadingEvents ? "Buscando eventos..." : "Ver eventos próximos"}
                  </span>
                </button>

                {/* Opción 2: Tengo una pregunta */}
                <button
                  onClick={() => setShowFaq(!showFaq)}
                  className={`w-full flex items-center gap-3 text-left rounded-2xl p-3.5 border transition-all cursor-pointer group shadow-xs ${
                    isDark
                      ? "bg-[#16223D] border-white/10 hover:border-amber-400/60 hover:bg-[#1E2E52]"
                      : "bg-white border-slate-200/90 hover:border-amber-400 hover:shadow-sm hover:bg-amber-50/30"
                  }`}
                >
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                    <FiHelpCircle size={17} />
                  </div>
                  <span
                    className={`text-[13.5px] font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Tengo una pregunta
                  </span>
                </button>

                {/* Menú desplegable de preguntas frecuentes si se selecciona */}
                {showFaq && (
                  <div className="flex flex-col gap-1.5 pl-2 pt-1 animate-fade-in">
                    {FAQ_OPTIONS.map((faq) => {
                      const Icon = faq.icon;
                      return (
                        <button
                          key={faq.id}
                          onClick={() => handleFaqClick(faq)}
                          className={`text-left text-xs font-medium py-2 px-3 rounded-xl flex items-center gap-2 border transition-all cursor-pointer ${
                            isDark
                              ? "bg-[#121B33] border-white/5 text-slate-300 hover:text-amber-400 hover:border-amber-400/40"
                              : "bg-white/80 border-slate-200 text-slate-700 hover:text-amber-600 hover:border-amber-400/60"
                          }`}
                        >
                          <Icon size={13} className="text-amber-500 shrink-0" />
                          <span>{faq.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Barra Inferior: Campo de Texto Oscuro con Botón de Enviar en Amarillo Ámbar */}
          <form
            onSubmit={handleSubmit}
            className={`flex items-center gap-2.5 px-3.5 py-3 border-t shrink-0 select-none transition-colors ${
              isDark
                ? "bg-[#0B132B] border-white/10"
                : "bg-white border-slate-200/90"
            }`}
          >
            {/* Campo de texto oscuro tipo píldora como en el diseño de referencia */}
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-2.5 rounded-full bg-[#1E2538] text-white text-[13px] sm:text-sm placeholder:text-slate-400 outline-none border border-slate-700/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />

            {/* Botón circular de envío en Amarillo Ámbar con flecha blanca */}
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Enviar mensaje"
              className="w-10 h-10 shrink-0 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-white flex items-center justify-center shadow-md shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiSend size={15} className="translate-x-[-1px] translate-y-[1px]" />
            </button>
          </form>
        </aside>
      )}

      {/* ========================================================
          4. BOTÓN FLOTANTE (FAB): ESQUINA INFERIOR DERECHA
             Azul marino (#0B132B) + Borde dorado + Isotipo ticket
          ======================================================== */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? "Cerrar chat de ayuda" : "Abrir chat de ayuda"}
        title="Chat de ayuda EventHive"
        className="fixed z-[9999] bottom-5 right-5 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#0B132B] border-2 border-amber-500 hover:border-amber-400 shadow-2xl shadow-slate-900/60 hover:shadow-amber-500/30 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 select-none"
      >
        {/* Isotipo del Ticket Hexagonal de EventHive en Dorado */}
        <img
          src="/LOGO45x50.png"
          alt="EventHive"
          className="w-8 h-8 object-contain drop-shadow-[0_2px_6px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform duration-300"
        />

        {/* Punto de estado activo en línea en el FAB */}
        <span
          className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0B132B] shadow-xs"
          title="En línea"
          aria-hidden="true"
        />
      </button>
    </>
  );
}