import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import Navbar from '../../components/usersComponets/Navbar.jsx';
import Footer from '../../components/usersComponets/Footer.jsx';

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
    <section id={id} className="scroll-mt-24 mb-12" aria-labelledby={`${id}-heading`}>
      <h2
        id={`${id}-heading`}
        className="text-lg sm:text-xl font-black text-[#0a1838] mb-4 pb-3 border-b border-slate-200"
      >
        {title}
      </h2>
      <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-4">
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
    <div className="w-full min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>
        {/* ── ENCABEZADO ────────────────────────────────────────────── */}
        <header className="bg-[#0a1838] text-white py-14 sm:py-20 px-6 sm:px-12 lg:px-20">
          <div className="max-w-5xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest bg-accent/20 text-accent border border-accent/30 mb-5">
              Marco Legal
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Términos y Condiciones
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              El acceso y uso de la plataforma EventHive implica la aceptación plena de los
              presentes términos y condiciones de servicio. Léalos detenidamente antes de
              utilizar nuestros servicios.
            </p>
            <p className="text-xs text-slate-400 mt-4 font-medium">
              Última actualización:{' '}
              <time dateTime="2026-09-01" className="text-slate-300">
                Septiembre de 2026
              </time>
            </p>
          </div>
        </header>

        {/* ── LAYOUT: SIDEBAR + CUERPO ──────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-8 py-14 sm:py-20 flex flex-col lg:flex-row gap-12">
          {/* Sidebar de navegación interna */}
          <aside className="lg:w-64 shrink-0" aria-label="Índice de secciones">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-4">
                Cláusulas
              </h3>
              <nav>
                <ul className="space-y-1" role="list">
                  {SECTIONS.map((sec) => (
                    <li key={sec.id}>
                      <button
                        type="button"
                        onClick={() => handleNavClick(sec.id)}
                        className={`w-full text-left text-xs sm:text-sm px-3 py-2 rounded-xl transition-colors font-medium ${
                          activeSection === sec.id
                            ? 'bg-brand text-white font-semibold'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                        aria-current={activeSection === sec.id ? 'true' : undefined}
                      >
                        {sec.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-6 pt-5 border-t border-slate-200">
                <Link
                  to="/privacidad"
                  className="text-xs text-brand font-semibold hover:underline"
                >
                  Ver Política de Privacidad →
                </Link>
              </div>
            </div>
          </aside>

          {/* Cuerpo de lectura */}
          <article className="flex-1 max-w-3xl">
            {/* Aviso legal */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-10 text-amber-900 text-sm leading-relaxed">
              <strong>Aviso importante:</strong> Estos términos constituyen un acuerdo legal
              vinculante entre usted y EventHive Cartagena S.A.S. Al crear una cuenta, comprar
              un boleto o publicar un evento, usted declara haber leído, entendido y aceptado
              todas las cláusulas aquí contenidas.
            </div>

            <LegalSection id="aceptacion" title="1. Aceptación de los Términos">
              <p>
                Los presentes Términos y Condiciones (en adelante, "los Términos") regulan el
                acceso y uso de la plataforma web y servicios digitales de{' '}
                <strong className="text-slate-800">EventHive Cartagena S.A.S.</strong> (en
                adelante, "EventHive"), disponibles en{' '}
                <a href="https://eventhive.co" className="text-brand hover:underline font-semibold">
                  eventhive.co
                </a>{' '}
                y sus subdominios.
              </p>
              <p>
                Los Términos aplican a todos los usuarios, ya sean{' '}
                <strong className="text-slate-800">Asistentes</strong> (personas que buscan,
                siguen y compran boletos de eventos) u{' '}
                <strong className="text-slate-800">Organizadores</strong> (personas naturales o
                jurídicas que publican y gestionan eventos en la plataforma).
              </p>
              <p>
                Si no está de acuerdo con alguna de estas cláusulas, por favor absténgase de
                usar la plataforma. El uso continuado de EventHive tras la publicación de
                modificaciones implica la aceptación de los nuevos términos.
              </p>
            </LegalSection>

            <LegalSection id="cuentas" title="2. Cuentas de Usuario">
              <p>
                Para acceder a las funcionalidades completas de EventHive, deberá crear una
                cuenta proporcionando información veraz, completa y actualizada. Usted es el
                único responsable de la custodia de sus credenciales de acceso.
              </p>
              <div className="space-y-3">
                {[
                  {
                    title: '2.1 Requisitos de Registro',
                    text: 'Debe ser mayor de 14 años. Los menores de edad requieren autorización de sus padres o representantes legales para usar la plataforma.',
                  },
                  {
                    title: '2.2 Veracidad de la Información',
                    text: 'Queda prohibido proporcionar información falsa, usurpar identidades o crear cuentas con datos de terceros sin su autorización. EventHive podrá suspender o eliminar cuentas que incumplan esta cláusula.',
                  },
                  {
                    title: '2.3 Seguridad de la Cuenta',
                    text: 'Usted es responsable de todas las actividades realizadas desde su cuenta. Si detecta acceso no autorizado, deberá notificarnos de inmediato a soporte@eventhive.co.',
                  },
                  {
                    title: '2.4 Suspensión y Cancelación',
                    text: 'EventHive se reserva el derecho de suspender o cancelar cuentas que violen estos Términos, la Política de Privacidad o las normas de convivencia de la comunidad.',
                  },
                ].map(({ title, text }) => (
                  <div key={title} className="rounded-xl border border-slate-200 p-4">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{title}</h4>
                    <p className="text-sm text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </LegalSection>

            <LegalSection id="eventos" title="3. Publicación y Gestión de Eventos (Organizadores)">
              <p>
                Los Organizadores son los únicos responsables del contenido, logística y
                ejecución de los eventos que publiquen en la plataforma. EventHive actúa como
                intermediario tecnológico y no es coproductor de ningún evento.
              </p>
              <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 pl-2">
                <li>
                  <strong className="text-slate-800">Veracidad del contenido:</strong> Los datos
                  del evento (fecha, lugar, precio, aforo y artistas) deben ser precisos y
                  actualizados. Información falsa o engañosa es motivo de suspensión inmediata.
                </li>
                <li>
                  <strong className="text-slate-800">Cancelaciones y modificaciones:</strong> Ante
                  cualquier cambio o cancelación, el Organizador debe notificar a EventHive con
                  al menos <strong>48 horas de anticipación</strong> para gestionar la
                  comunicación con los asistentes y, de ser el caso, los reembolsos.
                </li>
                <li>
                  <strong className="text-slate-800">Autorizaciones municipales:</strong> El
                  Organizador es responsable de obtener los permisos, licencias y autorizaciones
                  requeridos por el Distrito de Cartagena de Indias (Alcaldía, ICULTUR, Policía
                  Metropolitana, entre otras entidades), así como el cumplimiento de la
                  normatividad de aforo y seguridad.
                </li>
                <li>
                  <strong className="text-slate-800">Comisión por servicio:</strong> EventHive
                  aplica una tarifa de servicio por cada transacción procesada a través de la
                  plataforma, según la tabla de tarifas vigente disponible en el panel del
                  Organizador.
                </li>
                <li>
                  <strong className="text-slate-800">Propiedad del contenido:</strong> El
                  Organizador garantiza que las imágenes, videos y textos publicados son de su
                  autoría o cuenta con las licencias necesarias para su uso.
                </li>
              </ol>
            </LegalSection>

            <LegalSection id="boletos" title="4. Boletos y Códigos QR">
              <p>
                EventHive emite entradas digitales con un código QR único e intransferible
                vinculado al comprador y al evento. Su uso inadecuado podrá resultar en la
                anulación del acceso sin derecho a reembolso.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Validez', text: 'Cada código QR es de un solo uso y se invalida automáticamente al escanear en puerta.' },
                  { label: 'Transferencia', text: 'Los boletos no son transferibles salvo que el Organizador habilite explícitamente esta opción.' },
                  { label: 'Duplicados', text: 'EventHive no es responsable de pérdidas derivadas de compartir el código QR con terceros.' },
                  { label: 'Reembolsos', text: 'Las políticas de reembolso son definidas por cada Organizador. EventHive gestiona la mediación según lo pactado.' },
                  { label: 'Reventa', text: 'Queda prohibida la reventa de boletos adquiridos en EventHive a precios superiores al valor facial (anti-scalping).' },
                  { label: 'Formato', text: 'Los boletos se entregan en formato digital (PDF o pantalla). No se emiten físicos salvo indicación del Organizador.' },
                ].map(({ label, text }) => (
                  <div key={label} className="rounded-xl border border-slate-200 p-4">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{label}</h4>
                    <p className="text-xs text-slate-500">{text}</p>
                  </div>
                ))}
              </div>
            </LegalSection>

            <LegalSection id="propiedad" title="5. Propiedad Intelectual">
              <p>
                Todos los elementos que conforman la identidad visual y el contenido propio de
                EventHive —incluyendo el logotipo, la marca "EventHive", la interfaz gráfica,
                el código fuente, los textos editoriales y los algoritmos de recomendación—
                son propiedad exclusiva de EventHive Cartagena S.A.S. y están protegidos por
                la legislación colombiana de propiedad intelectual (Ley 23 de 1982 y normas
                concordantes).
              </p>
              <p>
                Queda estrictamente prohibido reproducir, modificar, distribuir, vender o
                crear obras derivadas de cualquier elemento propiedad de EventHive sin
                autorización escrita previa. Las infracciones serán perseguidas conforme a la
                ley colombiana.
              </p>
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 text-slate-700 text-sm">
                El contenido generado por los Organizadores (fotos, descripciones, logos de
                eventos) sigue siendo propiedad de su respectivo autor. No obstante, al
                publicarlo en EventHive, el Organizador otorga a EventHive una licencia
                no exclusiva, gratuita y mundial para mostrarlo en la plataforma.
              </div>
            </LegalSection>

            <LegalSection id="responsabilidad" title="6. Limitación de Responsabilidad">
              <p>
                EventHive actúa exclusivamente como plataforma tecnológica de intermediación.
                En consecuencia, no asume responsabilidad por:
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  'Cancelación de eventos por decisión unilateral del Organizador o por causas de fuerza mayor (fenómenos climáticos, actos de terceros, disposiciones gubernamentales, etc.).',
                  'Calidad artística o gastronómica de los eventos publicados por terceros.',
                  'Lesiones, pérdidas materiales o daños que ocurran durante el desarrollo de un evento.',
                  'Fallas en la conectividad del usuario que impidan la descarga o visualización del boleto digital.',
                  'Uso fraudulento del código QR derivado del extravío o divulgación del boleto por parte del usuario.',
                  'Incumplimiento de las condiciones de acceso impuestas por el recinto o el Organizador (aforo, restricciones de edad, vestuario, etc.).',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                La responsabilidad máxima de EventHive ante cualquier reclamación estará
                limitada al valor del boleto adquirido a través de la plataforma para el
                evento en cuestión.
              </p>
            </LegalSection>

            <LegalSection id="ley" title="7. Ley Aplicable y Jurisdicción">
              <p>
                Los presentes Términos se rigen por las leyes de la República de Colombia. Para
                cualquier controversia derivada de su interpretación o ejecución, las partes se
                someten a la jurisdicción de los jueces y tribunales competentes de la ciudad
                de Cartagena de Indias, Bolívar, renunciando a cualquier otro fuero que pudiera
                corresponderles.
              </p>
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 text-slate-700 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>¿Tienes preguntas sobre estos términos?</span>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-1.5 text-brand font-bold hover:underline text-sm shrink-0"
                >
                  Contactar soporte <FiExternalLink size={13} />
                </Link>
              </div>
            </LegalSection>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
