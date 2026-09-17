import { useState, useRef, useEffect } from "react";
import { FiX, FiSend, FiMessageCircle, FiCalendar, FiHelpCircle, FiChevronRight } from "react-icons/fi";
import { getUpcomingEvents } from "../services/eventService.js";
import { MOCK_EVENTS } from "../constants/mockEvents.js";
import { useNavigate } from "react-router-dom";

const INITIAL_MESSAGE = {
  id: 1,
  from: "bot",
  text: "¡Hola! 👋 Soy el chatbot de EventHive. Puedo mostrarte los próximos eventos o resolver tus dudas.",
};

export default function HelpChatWidget({ isOpen, onClose }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setMessages([INITIAL_MESSAGE]);
      setDraft("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const pushBotMessage = (payload) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), from: "bot", ...payload }]);
  };

  const pushUserMessage = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text }]);
    setDraft("");

    setTimeout(() => {
      pushBotMessage({ text: "Gracias por tu mensaje. Muy pronto tendrás una respuesta." });
    }, 900);
  };

  const showUpcomingEvents = async () => {
    pushUserMessage("Ver eventos próximos");
    setLoadingEvents(true);
    try {
      const events = await getUpcomingEvents();
      const list = events?.length ? events : MOCK_EVENTS.slice(0, 4);
      pushBotMessage({ text: "Estos son los próximos eventos:", events: list });
    } catch {
      pushBotMessage({ text: "Estos son los próximos eventos:", events: MOCK_EVENTS.slice(0, 4) });
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    pushUserMessage(draft);
  };

  return (
    <div className="fixed z-[9999] bottom-5 right-5 w-[92vw] max-w-[370px] h-[560px] max-h-[82vh] bg-white rounded-[20px] shadow-2xl ring-1 ring-black/5 border border-borderc flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-4 bg-gradient-to-br from-brand to-brand-dark text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0 ring-1 ring-white/25">
            <FiMessageCircle size={19} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-brand" />
          </div>
          <div>
            <p className="font-display font-bold text-[14.5px] leading-tight">
              Chat EventHive
            </p>
            <p className="text-[11px] text-white/75 leading-tight mt-0.5">
              Chatbot · en línea
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar chat"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-bg"
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.from === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[82%] px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                m.from === "user"
                  ? "bg-brand text-white rounded-2xl rounded-br-sm"
                  : "bg-white text-ink border border-borderc rounded-2xl rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>

            {m.events && (
              <div className="mt-2 flex flex-col gap-2 w-full max-w-[85%]">
                {m.events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/eventos/${event.id}`)}
                    className="group flex items-center gap-3 text-left bg-white border border-borderc rounded-xl px-3 py-2.5 shadow-sm hover:border-brand hover:shadow-md transition"
                  >
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-brand-light text-brand flex items-center justify-center">
                      <FiCalendar size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-ink truncate">{event.title}</p>
                      <p className="text-[11px] text-muted truncate">{event.date}</p>
                    </div>
                    <FiChevronRight size={14} className="text-muted shrink-0 group-hover:text-brand transition" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-col gap-2 mt-1">
            <button
              onClick={showUpcomingEvents}
              disabled={loadingEvents}
              className="w-full flex items-center gap-3 text-left bg-white border border-borderc rounded-xl px-3.5 py-3 shadow-sm hover:border-brand hover:bg-brand-light/40 transition disabled:opacity-50"
            >
              <div className="w-8 h-8 shrink-0 rounded-full bg-brand-light text-brand flex items-center justify-center">
                <FiCalendar size={15} />
              </div>
              <span className="text-[13px] font-semibold text-ink">
                {loadingEvents ? "Cargando eventos..." : "Ver eventos próximos"}
              </span>
            </button>
            <button
              onClick={() => pushUserMessage("Tengo una pregunta")}
              className="w-full flex items-center gap-3 text-left bg-white border border-borderc rounded-xl px-3.5 py-3 shadow-sm hover:border-brand hover:bg-brand-light/40 transition"
            >
              <div className="w-8 h-8 shrink-0 rounded-full bg-brand-light text-brand flex items-center justify-center">
                <FiHelpCircle size={15} />
              </div>
              <span className="text-[13px] font-semibold text-ink">
                Tengo una pregunta
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3.5 py-3.5 border-t border-borderc bg-white shrink-0"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 px-4 py-2.5 rounded-full border border-borderc text-[13.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition"
        />
        <button
          type="submit"
          aria-label="Enviar mensaje"
          className="w-10 h-10 shrink-0 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-dark transition disabled:opacity-40"
          disabled={!draft.trim()}
        >
          <FiSend size={16} />
        </button>
      </form>
    </div>
  );
}