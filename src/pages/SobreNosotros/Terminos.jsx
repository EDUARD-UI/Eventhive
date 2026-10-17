import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import Navbar from '../../components/usersComponets/Navbar.jsx';
import Footer from '../../components/usersComponets/Footer.jsx';
import FloatingDotsBackground from '../../components/common/FloatingDotsBackground.jsx';
import CityRhythmPreFooter from '../../components/home/CityRhythmPreFooter.jsx';

/* ─── Estructura de secciones ───────────────────────────────────────── */
const SECTIONS = [
  { id: 'aceptacion', title: '1. Aceptación de los Términos' },
  { id: 'cuentas', title: '2. Cuentas de Usuario' },
  { id: 'eventos', title: '3. Publicación y Gestión de Eventos' },
  { id: 'boletos', title: '4. Boletos y Códigos QR' },
  { id: 'propiedad', title: '5. Propiedad Intelectual' },
  { id: 'responsabilidad', title: '6. Limitación de Responsabilidad' },
  { id: 'ley', title: '7. Ley Aplicable' },
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
export default function Terminos() {
  const [activeSection, setActiveSection] = useState('aceptacion');

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
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-5 shadow-xs">
              Marco Legal
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              El acceso y uso de la plataforma EventHive implica la aceptación plena de los
              presentes términos y condiciones de servicio. Léalos detenidamente antes de
              utilizar nuestros servicios en Cartagena.
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
          <aside className="lg:w-64 w-full shrink-0" aria-label="Índice de secciones">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-[#0B1428]/90 p-5 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
                Cláusulas
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
                <Link
                  to="/privacidad"
                  className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline block"
                >
                  Ver Política de Privacidad →
                </Link>
              </div>
            </div>
          </aside>

          {/* Cuerpo de lectura */}
          <article className="flex-1 max-w-3xl min-w-0">
            <LegalSection id="aceptacion" title="1. Aceptación de los Términos">
              <p>
                Al acceder, navegar o utilizar la plataforma EventHive (en adelante, la "Plataforma"),
                usted declara que es mayor de edad o cuenta con la debida autorización legal, y que
                acepta sujetarse a estos Términos y Condiciones, así como a nuestra Política de Privacidad.
              </p>
              <p>
                Si no está de acuerdo con alguno de los términos aquí estipulados, debe abstenerse
                de utilizar la Plataforma y sus servicios.
              </p>
            </LegalSection>

            <LegalSection id="cuentas" title="2. Cuentas de Usuario">
              <p>
                Para acceder a determinadas funciones (compra de entradas, registro de organizador,
                panel de métricas), es necesario crear una cuenta de usuario proporcionando información
                veraz, exacta y actualizada.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Usted es el único responsable de mantener la confidencialidad de sus credenciales.</li>
                <li>Cualquier actividad realizada bajo su cuenta se presumirá efectuada por usted.</li>
                <li>EventHive se reserva el derecho de suspender cuentas que vulneren estas normas.</li>
              </ul>
            </LegalSection>

            <LegalSection id="eventos" title="3. Publicación y Gestión de Eventos">
              <p>
                Los organizadores son los únicos responsables de la veracidad, legalidad, licencias,
                aforos, derechos de autor y seguridad de los eventos que publiquen en EventHive.
              </p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B1428]/80 p-4 text-xs sm:text-sm">
                EventHive actúa como intermediario tecnológico para la difusión y boletería digital,
                y no asume responsabilidad directa por la cancelación o modificación de espectáculos
                por causas imputables al organizador o de fuerza mayor.
              </div>
            </LegalSection>

            <LegalSection id="boletos" title="4. Boletos y Códigos QR">
              <p>
                Cada boleto emitido incluye un código QR único e intransferible. El código QR es
                el único comprobante válido para el ingreso al evento.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>No comparta su código QR en redes sociales o con terceros para evitar duplicidades.</li>
                <li>El escaneo en la puerta del evento registrará el primer ingreso como válido.</li>
              </ul>
            </LegalSection>

            <LegalSection id="propiedad" title="5. Propiedad Intelectual">
              <p>
                Todo el contenido, marcas, isotipos, logotipos, diseños de interfaz, código fuente
                y arquitectura de EventHive son propiedad exclusiva de EventHive Cartagena S.A.S.
                o de sus respectivos licenciantes, protegidos por las leyes de propiedad intelectual de Colombia.
              </p>
            </LegalSection>

            <LegalSection id="responsabilidad" title="6. Limitación de Responsabilidad">
              <p>
                EventHive realiza sus mejores esfuerzos por mantener la disponibilidad ininterrumpida
                de los servicios, pero no garantiza la ausencia total de errores técnicos o caídas
                temporales de servidores de terceros.
              </p>
            </LegalSection>

            <LegalSection id="ley" title="7. Ley Aplicable y Jurisdicción">
              <p>
                Estos Términos y Condiciones se rigen e interpretan conforme a las leyes de la
                República de Colombia. Cualquier controversia será resuelta ante los jueces competentes
                del Distrito Judicial de Cartagena de Indias.
              </p>
              <div className="rounded-2xl bg-white dark:bg-[#0B1428] border border-slate-200 dark:border-slate-800 p-4 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs mt-6">
                <span className="font-medium text-slate-700 dark:text-slate-300">¿Tienes preguntas sobre los términos legales?</span>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold hover:underline text-xs uppercase tracking-wider shrink-0"
                >
                  <span>Contáctanos</span>
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
