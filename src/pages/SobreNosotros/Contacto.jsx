import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail,
  FiMapPin,
  FiClock,
  FiHelpCircle,
  FiUser,
  FiMessageSquare,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronDown,
} from 'react-icons/fi';
import Navbar from '../../components/usersComponets/Navbar.jsx';
import Footer from '../../components/usersComponets/Footer.jsx';

/* ─── Tipos de consulta ─────────────────────────────────────────────── */
const QUERY_TYPES = [
  { value: '', label: 'Selecciona el tipo de consulta' },
  { value: 'asistencia', label: 'Asistencia a un evento' },
  { value: 'soporte-organizador', label: 'Soporte organizador' },
  { value: 'prensa', label: 'Prensa / Alianzas' },
  { value: 'otro', label: 'Otro' },
];

/* ─── FAQ rápida ────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: '¿Cómo compro un boleto?',
    a: 'Busca el evento, selecciona "Comprar entrada" y sigue el proceso de pago seguro. Recibirás tu QR por correo.',
  },
  {
    q: '¿Puedo solicitar reembolso?',
    a: 'Los reembolsos dependen de la política de cada organizador. Contáctanos con tu número de orden.',
  },
  {
    q: '¿Cómo publico mi evento?',
    a: 'Registra tu organización, completa el asistente de creación de evento y espera la revisión de nuestro equipo.',
  },
];

/* ─── Card de contacto ──────────────────────────────────────────────── */
function ContactCard({ icon: Icon, title, children, href, color }) {
  const Tag = href ? 'a' : 'div';
  return (
    <Tag
      href={href}
      className={`group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 ${
        href ? 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : ''
      }`}
      {...(href ? { target: href.startsWith('mailto') ? '_self' : '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" aria-hidden />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
        <div className="text-xs sm:text-sm text-slate-500 leading-relaxed">{children}</div>
      </div>
    </Tag>
  );
}

/* ─── FAQ Accordion ─────────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        <FiChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

/* ─── Estado inicial del formulario ────────────────────────────────── */
const INITIAL_FORM = {
  nombre: '',
  correo: '',
  tipoConsulta: '',
  asunto: '',
  mensaje: '',
  aceptaPrivacidad: false,
};

const INITIAL_ERRORS = {
  nombre: '',
  correo: '',
  tipoConsulta: '',
  asunto: '',
  mensaje: '',
  aceptaPrivacidad: '',
};

/* ─── Validación ────────────────────────────────────────────────────── */
function validate(fields) {
  const errors = { ...INITIAL_ERRORS };
  if (!fields.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
  if (!fields.correo.trim()) {
    errors.correo = 'El correo es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.correo)) {
    errors.correo = 'Ingresa un correo válido.';
  }
  if (!fields.tipoConsulta) errors.tipoConsulta = 'Selecciona el tipo de consulta.';
  if (!fields.asunto.trim()) errors.asunto = 'El asunto es obligatorio.';
  if (!fields.mensaje.trim()) {
    errors.mensaje = 'El mensaje es obligatorio.';
  } else if (fields.mensaje.trim().length < 20) {
    errors.mensaje = 'El mensaje debe tener al menos 20 caracteres.';
  }
  if (!fields.aceptaPrivacidad)
    errors.aceptaPrivacidad = 'Debes aceptar la política de privacidad.';
  return errors;
}

function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

/* ─── Componente principal ──────────────────────────────────────────── */
export default function Contacto() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Limpiar error al escribir
    if (touched[name]) {
      const newErrors = validate({ ...form, [name]: type === 'checkbox' ? checked : value });
      setErrors((prev) => ({ ...prev, [name]: newErrors[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const newErrors = validate(form);
    setErrors((prev) => ({ ...prev, [name]: newErrors[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Marcar todos como tocados y validar
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const newErrors = validate(form);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    setStatus('loading');
    // Simulación de envío (reemplazar con llamada real al API)
    await new Promise((r) => setTimeout(r, 1800));
    setStatus('success');
    setForm(INITIAL_FORM);
    setTouched({});
  };

  /* ── Helpers de campo ─ */
  const fieldClass = (name) =>
    `w-full rounded-xl border bg-white text-sm text-ink transition-all outline-none placeholder:text-slate-400 pl-10 pr-3.5 py-2.5 ${
      touched[name] && errors[name]
        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
        : 'border-borderc hover:border-slate-300 focus:border-brand focus:ring-2 focus:ring-brand/15'
    }`;

  const selectClass = (name) =>
    `w-full rounded-xl border bg-white text-sm text-ink transition-all outline-none pl-10 pr-3.5 py-2.5 appearance-none cursor-pointer ${
      touched[name] && errors[name]
        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
        : 'border-borderc hover:border-slate-300 focus:border-brand focus:ring-2 focus:ring-brand/15'
    }`;

  const FieldError = ({ name }) =>
    touched[name] && errors[name] ? (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 font-medium" role="alert">
        <FiAlertCircle size={12} className="shrink-0" aria-hidden />
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="w-full min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <header
          className="bg-[#0a1838] text-white py-14 sm:py-20 px-6 sm:px-12 lg:px-20 relative overflow-hidden"
          aria-labelledby="contact-heading"
        >
          <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest bg-accent/20 text-accent border border-accent/30 mb-5">
              Estamos aquí
            </span>
            <h1 id="contact-heading" className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Hablemos
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              ¿Tienes dudas, sugerencias o necesitas soporte con tu evento? Nuestro equipo en
              Cartagena está listo para ayudarte.
            </p>
          </div>
        </header>

        {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* ── COLUMNA IZQUIERDA: Datos y canales ──────────────── */}
            <aside className="lg:col-span-2 space-y-6" aria-label="Canales de contacto">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-5">
                  Canales directos
                </h2>
                <div className="space-y-4">
                  <ContactCard
                    icon={FiMail}
                    title="Soporte General"
                    href="mailto:soporte@eventhive.co"
                    color="bg-brand"
                  >
                    <a
                      href="mailto:soporte@eventhive.co"
                      className="text-brand font-semibold hover:underline"
                    >
                      soporte@eventhive.co
                    </a>
                    <br />
                    <a
                      href="mailto:contacto@eventhive.co"
                      className="text-brand font-semibold hover:underline"
                    >
                      contacto@eventhive.co
                    </a>
                  </ContactCard>

                  <ContactCard
                    icon={FiMapPin}
                    title="Ubicación"
                    color="bg-emerald-600"
                  >
                    Cartagena de Indias, Bolívar, Colombia
                  </ContactCard>

                  <ContactCard
                    icon={FiClock}
                    title="Horario de Atención"
                    color="bg-amber-500"
                  >
                    Lunes a Viernes
                    <br />
                    <strong className="text-slate-700">8:00 AM – 6:00 PM</strong> (COT)
                  </ContactCard>

                  <ContactCard
                    icon={FiHelpCircle}
                    title="Centro de Ayuda"
                    color="bg-indigo-600"
                  >
                    Consulta nuestras guías y preguntas frecuentes.{' '}
                    <Link to="/buscar" className="text-brand font-semibold hover:underline">
                      Ver más →
                    </Link>
                  </ContactCard>
                </div>
              </div>

              {/* FAQ rápida */}
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-4">
                  Preguntas frecuentes
                </h2>
                <div className="space-y-2">
                  {FAQS.map((faq) => (
                    <FaqItem key={faq.q} {...faq} />
                  ))}
                </div>
              </div>
            </aside>

            {/* ── COLUMNA DERECHA: Formulario ───────────────────────── */}
            <section
              className="lg:col-span-3"
              aria-labelledby="form-heading"
            >
              <div className="rounded-3xl border border-slate-200 bg-white shadow-card p-8 sm:p-10">
                <h2
                  id="form-heading"
                  className="text-xl font-black text-[#0a1838] mb-1"
                >
                  Envíanos un mensaje
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mb-8">
                  Respondemos en un plazo de{' '}
                  <strong className="text-slate-700">1–2 días hábiles</strong>.
                </p>

                {/* Toast de éxito */}
                {status === 'success' && (
                  <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800"
                  >
                    <FiCheckCircle size={20} className="shrink-0 mt-0.5 text-emerald-600" aria-hidden />
                    <div>
                      <p className="font-bold text-sm">¡Mensaje enviado con éxito!</p>
                      <p className="text-xs mt-0.5">
                        Pronto nos pondremos en contacto contigo. Revisa tu bandeja de entrada.
                      </p>
                    </div>
                  </div>
                )}

                {status !== 'success' && (
                  <form onSubmit={handleSubmit} noValidate aria-label="Formulario de contacto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Nombre */}
                      <div className="sm:col-span-1">
                        <label
                          htmlFor="nombre"
                          className="block text-xs font-semibold text-ink mb-1.5"
                        >
                          Nombre completo <span className="text-rose-500" aria-hidden>*</span>
                        </label>
                        <div className="relative flex items-center">
                          <FiUser
                            size={15}
                            className={`absolute left-3.5 pointer-events-none ${
                              touched.nombre && errors.nombre ? 'text-rose-500' : 'text-slate-400'
                            }`}
                            aria-hidden
                          />
                          <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            value={form.nombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Juan Pérez"
                            autoComplete="name"
                            className={fieldClass('nombre')}
                            aria-required="true"
                            aria-invalid={touched.nombre && !!errors.nombre}
                            aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                          />
                        </div>
                        <FieldError name="nombre" />
                      </div>

                      {/* Correo */}
                      <div className="sm:col-span-1">
                        <label
                          htmlFor="correo"
                          className="block text-xs font-semibold text-ink mb-1.5"
                        >
                          Correo electrónico <span className="text-rose-500" aria-hidden>*</span>
                        </label>
                        <div className="relative flex items-center">
                          <FiMail
                            size={15}
                            className={`absolute left-3.5 pointer-events-none ${
                              touched.correo && errors.correo ? 'text-rose-500' : 'text-slate-400'
                            }`}
                            aria-hidden
                          />
                          <input
                            id="correo"
                            name="correo"
                            type="email"
                            value={form.correo}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="juan@ejemplo.com"
                            autoComplete="email"
                            className={fieldClass('correo')}
                            aria-required="true"
                            aria-invalid={touched.correo && !!errors.correo}
                          />
                        </div>
                        <FieldError name="correo" />
                      </div>

                      {/* Tipo de consulta */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="tipoConsulta"
                          className="block text-xs font-semibold text-ink mb-1.5"
                        >
                          Tipo de consulta <span className="text-rose-500" aria-hidden>*</span>
                        </label>
                        <div className="relative flex items-center">
                          <FiMessageSquare
                            size={15}
                            className={`absolute left-3.5 pointer-events-none z-10 ${
                              touched.tipoConsulta && errors.tipoConsulta ? 'text-rose-500' : 'text-slate-400'
                            }`}
                            aria-hidden
                          />
                          <FiChevronDown
                            size={15}
                            className="absolute right-3.5 pointer-events-none text-slate-400"
                            aria-hidden
                          />
                          <select
                            id="tipoConsulta"
                            name="tipoConsulta"
                            value={form.tipoConsulta}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={selectClass('tipoConsulta')}
                            aria-required="true"
                            aria-invalid={touched.tipoConsulta && !!errors.tipoConsulta}
                          >
                            {QUERY_TYPES.map(({ value, label }) => (
                              <option key={value} value={value} disabled={!value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <FieldError name="tipoConsulta" />
                      </div>

                      {/* Asunto */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="asunto"
                          className="block text-xs font-semibold text-ink mb-1.5"
                        >
                          Asunto <span className="text-rose-500" aria-hidden>*</span>
                        </label>
                        <div className="relative flex items-center">
                          <FiMessageSquare
                            size={15}
                            className={`absolute left-3.5 pointer-events-none ${
                              touched.asunto && errors.asunto ? 'text-rose-500' : 'text-slate-400'
                            }`}
                            aria-hidden
                          />
                          <input
                            id="asunto"
                            name="asunto"
                            type="text"
                            value={form.asunto}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Resumen breve de tu consulta"
                            className={fieldClass('asunto')}
                            aria-required="true"
                            aria-invalid={touched.asunto && !!errors.asunto}
                          />
                        </div>
                        <FieldError name="asunto" />
                      </div>

                      {/* Mensaje */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="mensaje"
                          className="block text-xs font-semibold text-ink mb-1.5"
                        >
                          Mensaje <span className="text-rose-500" aria-hidden>*</span>
                        </label>
                        <textarea
                          id="mensaje"
                          name="mensaje"
                          rows={5}
                          value={form.mensaje}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Describe tu consulta con el mayor detalle posible..."
                          className={`w-full rounded-xl border bg-white text-sm text-ink transition-all outline-none placeholder:text-slate-400 px-4 py-3 resize-none ${
                            touched.mensaje && errors.mensaje
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                              : 'border-borderc hover:border-slate-300 focus:border-brand focus:ring-2 focus:ring-brand/15'
                          }`}
                          aria-required="true"
                          aria-invalid={touched.mensaje && !!errors.mensaje}
                        />
                        <div className="flex items-center justify-between mt-1">
                          <FieldError name="mensaje" />
                          <span className="text-xs text-slate-400 ml-auto">
                            {form.mensaje.length} / 1000
                          </span>
                        </div>
                      </div>

                      {/* Checkbox de privacidad */}
                      <div className="sm:col-span-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            name="aceptaPrivacidad"
                            checked={form.aceptaPrivacidad}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="mt-0.5 w-4 h-4 rounded border-borderc text-brand focus:ring-brand/30 cursor-pointer"
                            aria-required="true"
                            aria-invalid={touched.aceptaPrivacidad && !!errors.aceptaPrivacidad}
                          />
                          <span className="text-xs text-slate-500 leading-relaxed">
                            He leído y acepto la{' '}
                            <Link
                              to="/privacidad"
                              className="text-brand font-semibold hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Política de Privacidad
                            </Link>{' '}
                            de EventHive. Autorizo el tratamiento de mis datos personales
                            conforme a la Ley 1581 de 2012.
                            <span className="text-rose-500 ml-1" aria-hidden>*</span>
                          </span>
                        </label>
                        <FieldError name="aceptaPrivacidad" />
                      </div>
                    </div>

                    {/* Botón de envío */}
                    <div className="mt-7">
                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand hover:bg-brand-dark disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wide shadow-md transition-all active:scale-95 duration-200"
                        aria-busy={status === 'loading'}
                      >
                        {status === 'loading' ? (
                          <>
                            <span
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                              aria-hidden
                            />
                            Enviando mensaje...
                          </>
                        ) : (
                          <>
                            <FiSend size={15} aria-hidden />
                            Enviar mensaje
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
