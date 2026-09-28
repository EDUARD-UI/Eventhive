import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import Navbar from '../../components/usersComponets/Navbar.jsx';
import Footer from '../../components/usersComponets/Footer.jsx';

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
export default function Privacidad() {
  const [activeSection, setActiveSection] = useState('responsable');

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
              Política de Privacidad
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              En EventHive protegemos tus datos personales conforme a la{' '}
              <strong className="text-white">Ley 1581 de 2012 (Habeas Data)</strong> y sus
              decretos reglamentarios. Te explicamos con claridad qué recopilamos, para qué y
              cómo ejercer tus derechos.
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
          <aside
            className="lg:w-64 shrink-0"
            aria-label="Índice de secciones"
          >
            <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-4">
                Contenido
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
                <p className="text-xs text-slate-500 leading-relaxed">
                  ¿Dudas sobre tu privacidad?{' '}
                  <Link to="/contacto" className="text-brand font-semibold hover:underline">
                    Contáctanos
                  </Link>
                </p>
              </div>
            </div>
          </aside>

          {/* Cuerpo de lectura */}
          <article className="flex-1 max-w-3xl">
            <LegalSection id="responsable" title="1. Responsable del Tratamiento">
              <p>
                <strong className="text-slate-800">EventHive Cartagena S.A.S.</strong> es la empresa
                responsable del tratamiento de sus datos personales. Puede contactarnos a través
                de los siguientes canales:
              </p>
              <ul className="list-none space-y-2 pl-0">
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                  <span><strong>Correo:</strong> privacidad@eventhive.co</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                  <span><strong>Dirección:</strong> Cartagena de Indias, Bolívar, Colombia</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                  <span><strong>NIT:</strong> 900.XXX.XXX-X (en proceso de constitución formal)</span>
                </li>
              </ul>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-blue-900 text-sm">
                Esta política aplica a todos los usuarios que interactúen con la plataforma
                web y aplicación móvil de EventHive, sin importar si están registrados o
                navegan de manera anónima.
              </div>
            </LegalSection>

            <LegalSection id="informacion" title="2. Información que Recopilamos">
              <p>
                Recopilamos información necesaria para brindarte una experiencia segura y
                personalizada. Los datos que tratamos incluyen:
              </p>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 p-5">
                  <h4 className="font-bold text-slate-800 text-sm mb-2">
                    2.1 Datos de Registro
                  </h4>
                  <p className="text-sm text-slate-600">
                    Nombre completo, correo electrónico, número de teléfono, contraseña
                    cifrada y rol (asistente u organizador). Estos datos son obligatorios
                    para crear una cuenta.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-5">
                  <h4 className="font-bold text-slate-800 text-sm mb-2">
                    2.2 Información de Compras y Boletos
                  </h4>
                  <p className="text-sm text-slate-600">
                    Historial de entradas adquiridas, códigos QR generados, eventos
                    favoritos y métodos de pago. Los datos de tarjeta son procesados por
                    pasarelas certificadas PCI-DSS; EventHive no almacena números de
                    tarjeta completos.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-5">
                  <h4 className="font-bold text-slate-800 text-sm mb-2">
                    2.3 Geolocalización (Opcional)
                  </h4>
                  <p className="text-sm text-slate-600">
                    Con tu autorización expresa, usamos tu ubicación en tiempo real para
                    mostrar eventos cercanos en el mapa interactivo. Puedes revocar este
                    permiso en cualquier momento desde la configuración de tu navegador.
                    No almacenamos coordenadas de forma persistente.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-5">
                  <h4 className="font-bold text-slate-800 text-sm mb-2">
                    2.4 Datos de Uso y Navegación
                  </h4>
                  <p className="text-sm text-slate-600">
                    Dirección IP, tipo de navegador, sistema operativo, páginas visitadas y
                    tiempo de sesión. Esta información es recopilada de forma agregada y
                    anónima con fines estadísticos.
                  </p>
                </div>
              </div>
            </LegalSection>

            <LegalSection id="finalidad" title="3. Finalidad del Tratamiento">
              <p>
                Sus datos personales son tratados con las siguientes finalidades, todas ellas
                amparadas bajo la base legal de ejecución del contrato de servicio o el
                consentimiento informado:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 pl-2">
                <li>
                  <strong className="text-slate-800">Notificaciones de eventos:</strong> Envío de
                  recordatorios, actualizaciones de cartelera y alertas de eventos de interés
                  según las categorías que hayas seleccionado.
                </li>
                <li>
                  <strong className="text-slate-800">Generación de códigos QR de acceso seguro:</strong>{' '}
                  Emisión de entradas digitales con código único para validación en puerta.
                </li>
                <li>
                  <strong className="text-slate-800">Personalización de recomendaciones:</strong>{' '}
                  Algoritmo de sugerencias basado en tu historial de asistencia y categorías
                  favoritas.
                </li>
                <li>
                  <strong className="text-slate-800">Soporte y atención al cliente:</strong> Gestión
                  de solicitudes, quejas y reclamos a través de nuestros canales oficiales.
                </li>
                <li>
                  <strong className="text-slate-800">Cumplimiento legal:</strong> Respuesta a
                  requerimientos de autoridades competentes en Colombia conforme a la ley.
                </li>
              </ol>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-900 text-sm">
                <strong>Importante:</strong> No vendemos, alquilamos ni cedemos sus datos
                personales a terceros con fines comerciales sin su consentimiento explícito.
              </div>
            </LegalSection>

            <LegalSection id="derechos" title="4. Derechos del Usuario">
              <p>
                Como titular de datos personales, conforme al Artículo 8 de la Ley 1581 de
                2012, usted tiene los siguientes derechos:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { right: 'Acceso', desc: 'Conocer qué datos suyos tenemos almacenados y cómo los usamos.' },
                  { right: 'Rectificación', desc: 'Solicitar la corrección de datos inexactos o incompletos.' },
                  { right: 'Supresión', desc: 'Pedir la eliminación de sus datos cuando no exista obligación legal de conservarlos.' },
                  { right: 'Portabilidad', desc: 'Recibir sus datos en formato estructurado y legible por máquina.' },
                  { right: 'Oposición', desc: 'Oponerse al tratamiento con fines de marketing o perfilamiento.' },
                  { right: 'Revocación', desc: 'Revocar el consentimiento otorgado para finalidades específicas.' },
                ].map(({ right, desc }) => (
                  <div key={right} className="rounded-xl border border-slate-200 p-4">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{right}</h4>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm">
                Para ejercer cualquiera de estos derechos, envíe su solicitud a{' '}
                <a
                  href="mailto:privacidad@eventhive.co"
                  className="text-brand font-semibold hover:underline inline-flex items-center gap-1"
                >
                  privacidad@eventhive.co <FiExternalLink size={12} />
                </a>{' '}
                o acceda a la sección <strong>"Mis Datos"</strong> dentro de su perfil. Dará
                respuesta en un plazo máximo de{' '}
                <strong>diez (10) días hábiles</strong> para consultas y{' '}
                <strong>quince (15) días hábiles</strong> para reclamos.
              </p>
            </LegalSection>

            <LegalSection id="cookies" title="5. Cookies y Tecnologías de Rastreo">
              <p>
                EventHive utiliza cookies y tecnologías similares para mejorar la experiencia
                de usuario. A continuación se describen los tipos que usamos:
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 font-bold text-slate-700">Tipo</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Propósito</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { type: 'Esenciales', purpose: 'Autenticación, sesión y seguridad.', duration: 'Sesión' },
                      { type: 'Preferencias', purpose: 'Idioma, modo de vista y filtros guardados.', duration: '1 año' },
                      { type: 'Analíticas', purpose: 'Estadísticas de uso anónimas para mejorar el servicio.', duration: '2 años' },
                      { type: 'Marketing', purpose: 'Solo con consentimiento explícito, para eventos recomendados.', duration: '6 meses' },
                    ].map((row) => (
                      <tr key={row.type} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{row.type}</td>
                        <td className="px-4 py-3 text-slate-600">{row.purpose}</td>
                        <td className="px-4 py-3 text-slate-500">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                Puedes gestionar o deshabilitar las cookies no esenciales en la configuración
                de privacidad de tu navegador. La desactivación de cookies esenciales puede
                afectar el funcionamiento de la plataforma.
              </p>
            </LegalSection>

            <LegalSection id="vigencia" title="6. Vigencia y Actualización">
              <p>
                Esta política entra en vigencia a partir de su última actualización (septiembre
                de 2026) y permanecerá válida hasta que sea reemplazada por una versión
                posterior. Nos reservamos el derecho de modificarla para adaptarla a cambios
                normativos o mejoras de producto.
              </p>
              <p>
                Cualquier modificación sustancial será comunicada a los usuarios registrados
                mediante correo electrónico con al menos <strong>15 días de anticipación</strong>.
                El uso continuado de la plataforma tras la notificación implica la aceptación
                de los cambios.
              </p>
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 text-slate-700 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>¿Preguntas sobre esta política?</span>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-1.5 text-brand font-bold hover:underline text-sm shrink-0"
                >
                  Ir a Contacto <FiExternalLink size={13} />
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
