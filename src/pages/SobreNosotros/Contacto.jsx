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
import FloatingDotsBackground from '../../components/common/FloatingDotsBackground.jsx';
import CityRhythmPreFooter from '../../components/home/CityRhythmPreFooter.jsx';

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
    a: 'Busca el evento, selecciona "Comprar entrada" y sigue el proceso de pago seguro. Recibirás tu QR oficial de acceso.',
  },
  {
    q: '¿Puedo solicitar reembolso?',
    a: 'Los reembolsos dependen de la política de cada organizador. Contáctanos con tu número de orden y fecha de compra.',
  },
  {
    q: '¿Cómo publico mi evento?',
    a: 'Registra tu organización, completa el asistente de creación de evento y espera la revisión de nuestro equipo.',
  },
];

/* ─── Card de contacto ──────────────────────────────────────────────── */
function ContactCard({ icon: Icon, title, children, href, color = 'bg-amber-500/15 text-amber-500' }) {
  const Tag = href ? 'a' : 'div';
  return (
    <Tag
      href={href}
      className={`group flex items-start gap-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-[#0B1428]/90 p-5 shadow-xs transition-all duration-200 ${
        href ? 'hover:border-amber-400/60 dark:hover:border-amber-400/50 hover:-translate-y-0.5 cursor-pointer' : ''
      }`}
      {...(href ? { target: href.startsWith('mailto') ? '_self' : '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-amber-400/30 ${color}`}>
        <Icon size={20} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-extrabold uppercase tracking-tight text-slate-950 dark:text-white mb-1">{title}</h3>
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{children}</div>
      </div>
    </Tag>
  );
}

/* ─── FAQ Accordion ─────────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden bg-white/80 dark:bg-[#0B1428]/80">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <span>{q}</span>
        <FiChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-amber-500' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
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

export default function Contacto() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  const validate = (values) => {
    const errs = {};
    if (!values.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!values.correo.trim()) {
      errs.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.correo)) {
      errs.correo = 'Ingresa un correo válido';
    }
    if (!values.tipoConsulta) errs.tipoConsulta = 'Selecciona un tipo de consulta';
    if (!values.asunto.trim()) errs.asunto = 'El asunto es requerido';
    if (!values.mensaje.trim()) {
      errs.mensaje = 'El mensaje es requerido';
    } else if (values.mensaje.length < 15) {
      errs.mensaje = 'El mensaje debe tener al menos 15 caracteres';
    }
    if (!values.aceptaPrivacidad) errs.aceptaPrivacidad = 'Debes aceptar la política de privacidad';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setStatus('loading');
    await new Promise((r) => setTimeout(r, 1400));
    setStatus('success');
    setForm(INITIAL_FORM);
    setTouched({});
  };

  const fieldClass = (name) =>
    `w-full rounded-xl border bg-white dark:bg-[#070D1B] text-sm text-slate-900 dark:text-white transition-all outline-none placeholder:text-slate-400 pl-10 pr-3.5 py-2.5 ${
      touched[name] && errors[name]
        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
    }`;

  const selectClass = (name) =>
    `w-full rounded-xl border bg-white dark:bg-[#070D1B] text-sm text-slate-900 dark:text-white transition-all outline-none pl-10 pr-3.5 py-2.5 appearance-none cursor-pointer ${
      touched[name] && errors[name]
        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
    }`;

  const FieldError = ({ name }) =>
    touched[name] && errors[name] ? (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500 font-medium" role="alert">
        <FiAlertCircle size={12} className="shrink-0" aria-hidden />
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-body relative transition-colors duration-200">
      <FloatingDotsBackground />
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <header
          className="bg-gradient-to-b from-[#0B132B] via-[#0E1A38] to-[#070D1B] text-white py-16 sm:py-20 px-6 sm:px-12 lg:px-20 relative overflow-hidden border-b border-slate-800 text-center"
          aria-labelledby="contact-heading"
        >
          <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-5 shadow-xs">
              Estamos aquí
            </span>
            <h1 id="contact-heading" className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4">
              Hablemos
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              ¿Tienes dudas, sugerencias o necesitas soporte con tu evento en Cartagena? Nuestro equipo está listo para ayudarte.
            </p>
          </div>
        </header>

        {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-start">
            {/* ── COLUMNA IZQUIERDA: Datos y canales ──────────────── */}
            <aside className="lg:col-span-2 space-y-6" aria-label="Canales de contacto">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
                  Canales directos
                </h2>
                <div className="space-y-4">
                  <ContactCard
                    icon={FiMail}
                    title="Soporte General"
                    href="mailto:soporte@eventhive.co"
                  >
                    <span className="text-amber-600 dark:text-amber-400 font-bold block">
                      soporte@eventhive.co
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs block mt-0.5">
                      Atención en línea para asistentes
                    </span>
                  </ContactCard>

                  <ContactCard
                    icon={FiMapPin}
                    title="Ubicación"
                  >
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      Centro Histórico, Calle del Arsenal #10-45<br />
                      Cartagena de Indias, Bolívar, Colombia
                    </p>
                  </ContactCard>

                  <ContactCard
                    icon={FiClock}
                    title="Horarios de Atención"
                  >
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      Lunes a Viernes: 8:00 AM – 6:00 PM<br />
                      Sábados y festivos: 9:00 AM – 2:00 PM
                    </p>
                  </ContactCard>
                </div>
              </div>

              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <FiHelpCircle className="text-amber-500" size={15} />
                  <span>Preguntas frecuentes</span>
                </h2>
                <div className="space-y-2.5">
                  {FAQS.map((faq, i) => (
                    <FaqItem key={i} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            </aside>

            {/* ── COLUMNA DERECHA: Formulario ───────────────────────── */}
            <section
              className="lg:col-span-3"
              aria-labelledby="form-heading"
            >
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-[#0B1428]/90 shadow-sm p-6 sm:p-9">
                <h2
                  id="form-heading"
                  className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-1"
                >
                  Envíanos un mensaje
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8">
                  Respondemos en un plazo de{' '}
                  <strong className="text-slate-900 dark:text-slate-200 font-bold">1–2 días hábiles</strong>.
                </p>

                {/* Toast de éxito */}
                {status === 'success' && (
                  <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-800 dark:text-emerald-300"
                  >
                    <FiCheckCircle size={20} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    <div>
                      <p className="font-bold text-sm">¡Mensaje enviado con éxito!</p>
                      <p className="text-xs mt-0.5 text-emerald-700 dark:text-emerald-400">
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
                          className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
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
                          />
                        </div>
                        <FieldError name="nombre" />
                      </div>

                      {/* Correo */}
                      <div className="sm:col-span-1">
                        <label
                          htmlFor="correo"
                          className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
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
                          className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
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
                              <option key={value} value={value} disabled={!value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
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
                          className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
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
                          className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
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
                          className={`w-full rounded-xl border bg-white dark:bg-[#070D1B] text-sm text-slate-900 dark:text-white transition-all outline-none placeholder:text-slate-400 px-4 py-3 resize-none ${
                            touched.mensaje && errors.mensaje
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
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
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                            aria-required="true"
                            aria-invalid={touched.aceptaPrivacidad && !!errors.aceptaPrivacidad}
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            He leído y acepto la{' '}
                            <Link
                              to="/privacidad"
                              className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
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
                        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-70 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                        aria-busy={status === 'loading'}
                      >
                        {status === 'loading' ? (
                          <>
                            <span
                              className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"
                              aria-hidden
                            />
                            Enviando mensaje...
                          </>
                        ) : (
                          <>
                            <FiSend size={15} aria-hidden />
                            <span>Enviar mensaje</span>
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

      <CityRhythmPreFooter />
      <Footer />
    </div>
  );
}
