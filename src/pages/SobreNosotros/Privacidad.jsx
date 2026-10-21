import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import Navbar from '../../components/usersComponets/Navbar.jsx';
import Footer from '../../components/usersComponets/Footer.jsx';
import FloatingDotsBackground from '../../components/common/FloatingDotsBackground.jsx';
import CityRhythmPreFooter from '../../components/home/CityRhythmPreFooter.jsx';

/* ─── Estructura de secciones ───────────────────────────────────────── */
const SECTIONS = [
  { id: 'responsable', title: '1. Responsable del Tratamiento' },
  { id: 'informacion', title: '2. Información que Recopilamos' },
  { id: 'finalidad', title: '3. Finalidad del Tratamiento' },
  { id: 'derechos', title: '4. Derechos del Usuario' },
  { id: 'cookies', title: '5. Cookies y Tecnologías de Rastreo' },
  { id: 'vigencia', title: '6. Vigencia y Actualización' },
];

/* ─── Componente de sección legal ───────────────────────────────────── */
function LegalSection({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-28 mb-12" aria-labelledby={`${id}-heading`}>
      <h2
        id={`${id}-heading`}
        className="text-lg sm:text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4 pb-3 border-b border-slate-200/80 dark:border-slate-800"
      >
        {title}
      </h2>
      <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed space-y-4 font-normal">
        {children}
      </div>
    </section>
  );
}

/* ─── Componente principal ──────────────────────────────────────────── */
export default function Privacidad() {
  const [activeSection, setActiveSection] = useState('responsable');

  const handleNavClick = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-body relative transition-colors duration-200">
      <FloatingDotsBackground />
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* ── ENCABEZADO ────────────────────────────────────────────── */}
        <header className="bg-gradient-to-b from-[#0B132B] via-[#0E1A38] to-[#070D1B] text-white py-14 sm:py-20 px-6 sm:px-12 lg:px-20 border-b border-slate-800 text-center">
          <div className="max-w-4xl mx-auto">
            
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4">
              Política de Privacidad
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              En EventHive protegemos tus datos personales conforme a la{' '}
              <strong className="text-white">Ley 1581 de 2012 (Habeas Data)</strong> y sus
              decretos reglamentarios. Te explicamos con claridad qué recopilamos, para qué y
              cómo ejercer tus derechos.
            </p>
            <p className="text-xs text-slate-400 mt-4 font-medium">
              Última actualización:{' '}
              <time dateTime="2026-09-01" className="text-amber-400 font-semibold">
                Septiembre de 2026
              </time>
            </p>
          </div>
        </header>

        {/* ── LAYOUT: SIDEBAR + CUERPO ──────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-8 py-12 sm:py-16 flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
          {/* Sidebar de navegación interna */}
          <aside
            className="lg:w-64 w-full shrink-0"
            aria-label="Índice de secciones"
          >
            <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-[#0B1428]/90 p-5 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
                Contenido
              </h3>
              <nav>
                <ul className="space-y-1.5" role="list">
                  {SECTIONS.map((sec) => (
                    <li key={sec.id}>
                      <button
                        type="button"
                        onClick={() => handleNavClick(sec.id)}
                        className={`w-full text-left text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all font-bold cursor-pointer ${
                          activeSection === sec.id
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        aria-current={activeSection === sec.id ? 'true' : undefined}
                      >
                        {sec.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  ¿Dudas sobre tu privacidad?{' '}
                  <Link to="/contacto" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
                    Contáctanos
                  </Link>
                </p>
              </div>
            </div>
          </aside>

          {/* Cuerpo de lectura */}
          <article className="flex-1 max-w-3xl min-w-0">
            <LegalSection id="responsable" title="1. Responsable del Tratamiento">
              <p>
                <strong className="text-slate-900 dark:text-white">EventHive Cartagena S.A.S.</strong> es la empresa
                responsable del tratamiento de los datos personales recopilados a través del sitio
                web y sus aplicaciones asociadas.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>NIT: 901.845.120-3</li>
                <li>Domicilio principal: Cartagena de Indias, Bolívar, Colombia</li>
                <li>Correo de contacto: privacidad@eventhive.co</li>
              </ul>
            </LegalSection>

            <LegalSection id="informacion" title="2. Información que Recopilamos">
              <p>
                Recopilamos la información estrictamente necesaria para garantizar la operación
                segura de la plataforma y la emisión válida de boletos para eventos en Cartagena:
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B1428]/80 p-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase mb-1">
                    Datos de registro y perfil
                  </h4>
                  <p className="text-xs sm:text-sm">
                    Nombre completo, correo electrónico, documento de identidad (cuando lo exige la ley),
                    número telefónico y credenciales de acceso seguras.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B1428]/80 p-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase mb-1">
                    Datos de compra y transacción
                  </h4>
                  <p className="text-xs sm:text-sm">
                    Historial de órdenes, boletos adquiridos, eventos asistidos y preferencias de categorías.
                    No almacenamos números completos de tarjetas de crédito; los pagos son procesados
                    por pasarelas certificadas PCI-DSS.
                  </p>
                </div>
              </div>
            </LegalSection>

            <LegalSection id="finalidad" title="3. Finalidad del Tratamiento">
              <p>Tus datos son tratados exclusivamente para:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Generar y validar códigos QR de acceso a eventos.</li>
                <li>Notificar cambios de fecha, lugar, cancelaciones o reprogramaciones.</li>
                <li>Prevenir fraudes, duplicidad de boletas y suplantación de identidad.</li>
                <li>Cumplir con requerimientos tributarios y normativos ante las autoridades colombianas.</li>
              </ul>
            </LegalSection>

            <LegalSection id="derechos" title="4. Derechos del Usuario">
              <p>
                Conforme al artículo 8 de la Ley 1581 de 2012, tienes derecho a conocer, actualizar,
                rectificar y solicitar la supresión de tus datos personales en cualquier momento.
              </p>
              <div className="rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                Para radicar un requerimiento de Habeas Data, escribe a{' '}
                <a href="mailto:privacidad@eventhive.co" className="font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  privacidad@eventhive.co
                </a>{' '}
                adjuntando copia de tu documento de identidad. Daremos respuesta en un plazo no mayor a 10 días hábiles.
              </div>
            </LegalSection>

            <LegalSection id="cookies" title="5. Cookies y Tecnologías de Rastreo">
              <p>
                Utilizamos cookies técnicas necesarias para mantener tu sesión activa, recordar tus
                preferencias de tema (claro/oscuro) y asegurar el flujo de compra.
              </p>
              <p className="text-xs sm:text-sm">
                Puedes gestionar o deshabilitar las cookies en la configuración de privacidad de tu navegador.
              </p>
            </LegalSection>

            <LegalSection id="vigencia" title="6. Vigencia y Actualización">
              <p>
                Esta política entra en vigencia a partir de su última actualización (septiembre de 2026).
                Cualquier modificación sustancial será comunicada a los usuarios registrados mediante correo electrónico.
              </p>
              <div className="rounded-2xl bg-white dark:bg-[#0B1428] border border-slate-200 dark:border-slate-800 p-4 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs mt-6">
                <span className="font-medium text-slate-700 dark:text-slate-300">¿Preguntas sobre esta política?</span>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold hover:underline text-xs uppercase tracking-wider shrink-0"
                >
                  <span>Ir a Contacto</span>
                  <FiExternalLink size={13} />
                </Link>
              </div>
            </LegalSection>
          </article>
        </div>
      </main>

      <CityRhythmPreFooter />
      <Footer />
    </div>
  );
}
