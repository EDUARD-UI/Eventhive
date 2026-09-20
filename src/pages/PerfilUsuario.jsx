import { useState } from 'react';
import {
  FiMapPin,
  FiCalendar,
  FiStar,
  FiBookmark,
  FiEdit2,
  FiMail,
  FiDownload,
  FiCheckCircle,
  FiLock,
  FiPhone,
  FiBell,
  FiX,
  FiExternalLink,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';

const TABS = [
  { id: 'guardados', label: 'Guardados' },
  { id: 'proximos', label: 'Próximos' },
  { id: 'historial', label: 'Historial' },
  { id: 'entradas', label: 'Mis Boletos / QR' },
  { id: 'seguridad', label: 'Ajustes y Cuenta' },
];

const EVENTOS_DEMO = [
  {
    id: 1,
    category: 'MÚSICA',
    title: 'Festival Cartagena Jazz',
    date: '15 sep · 7:00 PM',
    location: 'Plaza de la Aduana, Centro Histórico',
    gradient: 'from-sky-500 to-blue-600',
    estado: 'guardados',
  },
  {
    id: 2,
    category: 'DEPORTES',
    title: 'Torneo Vóley Playa Bocagrande',
    date: '18 sep · 8:00 AM',
    location: 'Playas de Bocagrande',
    gradient: 'from-emerald-500 to-teal-600',
    estado: 'guardados',
  },
  {
    id: 3,
    category: 'CULTURA',
    title: 'Feria del Libro y Arte Cartagena',
    date: '22 sep · 4:00 PM',
    location: 'Centro de Convenciones Cartagena',
    gradient: 'from-violet-500 to-indigo-600',
    estado: 'proximos',
  },
  {
    id: 4,
    category: 'MÚSICA',
    title: 'Noche de Boleros en la Muralla',
    date: '29 sep · 8:00 PM',
    location: 'Baluarte de Santo Domingo',
    gradient: 'from-sky-500 to-blue-600',
    estado: 'proximos',
  },
  {
    id: 5,
    category: 'DEPORTES',
    title: 'Media Maratón del Mar CTG',
    date: '3 oct · 5:30 AM',
    location: 'Bahía de las Ánimas',
    gradient: 'from-emerald-500 to-teal-600',
    estado: 'historial',
  },
  {
    id: 6,
    category: 'GASTRONOMÍA',
    title: 'Feria Gastronómica Sabores del Caribe',
    date: '10 oct · 12:00 PM',
    location: 'Plaza de los Coches',
    gradient: 'from-amber-500 to-orange-600',
    estado: 'historial',
  },
];

const ENTRADAS_DEMO = [
  {
    id: 'TKT-2026-8921',
    evento: 'Festival Cartagena Jazz 2026',
    fecha: 'Sábado, 20 Sep 2026',
    hora: '8:00 PM',
    lugar: 'Baluarte de San Ignacio, Cartagena',
    zona: 'VIP Frente a Tarima',
    asiento: 'Fila B - Asiento 12',
    titular: 'Gustavo R.',
    precio: '$160.000 COP',
    estado: 'Válido para ingreso',
    codigoQR: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TKT-2026-8921-GUSTAVO-R',
  },
  {
    id: 'TKT-2026-4412',
    evento: 'Noche de Boleros en la Muralla',
    fecha: 'Viernes, 29 Sep 2026',
    hora: '8:00 PM',
    lugar: 'Baluarte de Santo Domingo',
    zona: 'Entrada General',
    asiento: 'Acceso General Libre',
    titular: 'Gustavo R.',
    precio: '$60.000 COP',
    estado: 'Válido para ingreso',
    codigoQR: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TKT-2026-4412-GUSTAVO-R',
  },
];

export default function PerfilCliente() {
  const [activeTab, setActiveTab] = useState('guardados');
  const [ticketModal, setTicketModal] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [usuario, setUsuario] = useState({
    nombreCompleto: 'Gustavo R.',
    correo: 'gustavo.r@email.com',
    telefono: '+57 300 987 6543',
    ciudad: 'Cartagena de Indias',
    avatarGradient: 'from-amber-400 via-orange-400 to-sky-500',
    eventosGuardados: 6,
    eventosAsistidos: 4,
    resenas: 2,
    notifEmail: true,
    notifWhatsapp: true,
  });

  const eventosVisibles = EVENTOS_DEMO.filter((evento) => evento.estado === activeTab);

  const guardarPerfil = (e) => {
    e.preventDefault();
    setEditModal(false);
    alert('¡Perfil actualizado con éxito!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg font-body selection:bg-brand-light selection:text-brand">
      <Navbar />

      {/* Banner de marca — FONDO AZUL ESTRICTAMENTE PRESERVADO */}
      <div className="relative px-6 sm:px-10 pt-14 pb-24 text-white overflow-hidden bg-[radial-gradient(120%_140%_at_15%_-10%,#2b9dff_0%,#007BFF_45%,#0047a8_100%)]">
        <p className="text-xs font-bold tracking-wide text-sky-100/90 mb-2">
          TU CUENTA
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-[44px] leading-[1.05] tracking-tight max-w-lg">
          Perfil de cliente
        </h1>
        <p className="text-sm text-sky-100 mt-3 max-w-sm leading-relaxed">
          Tus eventos guardados, tu historial y tus datos, todo en un solo lugar.
        </p>

        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 w-72 h-72 opacity-[0.15]"
          style={{
            backgroundImage:
              'radial-gradient(circle, transparent 20%, rgba(255,255,255,.6) 21%, rgba(255,255,255,.6) 22%, transparent 23%)',
            backgroundSize: '26px 26px',
          }}
        />

        <div className="absolute left-0 right-0 -bottom-0.5 leading-[0]">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-[64px] block">
            <path
              d="M0,40 C240,80 480,0 720,30 C960,60 1200,10 1440,40 L1440,70 L0,70 Z"
              fill="#f5f7fa"
            />
          </svg>
        </div>
      </div>

      <main className="flex-1 px-6 sm:px-10 pb-12">
        {/* Navegación de Tabs */}
        <div className="relative z-10 flex justify-center mt-6 mb-8">
          <div className="bg-white border border-borderc rounded-2xl shadow-sm p-1.5 flex gap-1.5 w-fit max-w-full overflow-x-auto">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${active
                      ? 'bg-brand text-white shadow-md shadow-brand/20'
                      : 'text-muted hover:text-brand hover:bg-brand-light'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-[1400px] mx-auto">
          {/* Sidebar de Usuario */}
          <aside className="w-full lg:w-[320px] shrink-0 space-y-5">
            <div className="bg-white border border-borderc rounded-2xl shadow-sm p-7 text-center hover:shadow-md transition-shadow">
              <div className="relative w-24 h-24 mx-auto">
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-br ${usuario.avatarGradient} ring-4 ring-white shadow-md flex items-center justify-center text-white text-2xl font-bold font-display`}
                >
                  GR
                </div>
              </div>
              <h2 className="font-display font-bold text-xl mt-4 text-ink">
                {usuario.nombreCompleto}
              </h2>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted mt-1.5">
                <FiMail size={12} /> {usuario.correo}
              </p>
              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-1">
                <FiMapPin size={12} /> {usuario.ciudad}
              </p>


            </div>

            <div className="bg-white border border-borderc rounded-2xl shadow-sm p-6">
              <p className="text-[11px] font-bold tracking-wider text-muted mb-4 uppercase">
                Estadísticas de Asistencia
              </p>

              <div className="flex items-center gap-3.5 text-sm text-slate-700 mb-4">
                <span className="w-10 h-10 rounded-xl bg-brand-light text-brand flex items-center justify-center shrink-0">
                  <FiBookmark size={17} />
                </span>
                <div>
                  <strong className="block font-display font-bold text-lg leading-none text-ink">
                    {usuario.eventosGuardados}
                  </strong>
                  <span className="text-xs text-muted">eventos guardados</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-slate-700 mb-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FiCalendar size={17} />
                </span>
                <div>
                  <strong className="block font-display font-bold text-lg leading-none text-ink">
                    {usuario.eventosAsistidos}
                  </strong>
                  <span className="text-xs text-muted">eventos asistidos</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-slate-700">
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FiStar size={17} />
                </span>
                <div>
                  <strong className="block font-display font-bold text-lg leading-none text-ink">
                    {usuario.resenas}
                  </strong>
                  <span className="text-xs text-muted">reseñas compartidas</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Contenido Principal por Pestaña */}
          <section className="flex-1 min-w-0">
            {/* Pestaña: Mis Entradas con Código QR */}
            {activeTab === 'entradas' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-white p-5 rounded-2xl border border-borderc shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-ink">Mis Boletos Digitales</h3>
                    <p className="text-xs text-muted mt-0.5">Muestra tu código QR en la entrada del evento para escanear y acceder.</p>
                  </div>
                  <span className="text-xs font-semibold text-brand bg-brand-light px-3 py-1 rounded-full">
                    {ENTRADAS_DEMO.length} activos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {ENTRADAS_DEMO.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative"
                    >
                      {/* Cabecera del Boleto */}
                      <div className="p-5 bg-gradient-to-r from-brand to-sky-600 text-white relative">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-sky-100 mb-1">
                          <span>{ticket.id}</span>
                          <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white">
                            {ticket.zona}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-lg leading-tight mt-1">{ticket.evento}</h4>
                        <div className="mt-3 flex items-center gap-3 text-xs text-sky-100">
                          <span className="flex items-center gap-1"><FiCalendar size={13} /> {ticket.fecha}</span>
                          <span>·</span>
                          <span>{ticket.hora}</span>
                        </div>
                      </div>

                      {/* Cuerpo con detalles de acceso */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-2 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5"><FiMapPin className="text-brand shrink-0" size={14} /> {ticket.lugar}</p>
                          <p><strong>Ubicación:</strong> {ticket.asiento}</p>
                          <p><strong>Titular:</strong> {ticket.titular}</p>
                        </div>

                        {/* Código QR Miniatura y Acciones */}
                        <div className="mt-5 pt-4 border-t border-dashed border-slate-200 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={ticket.codigoQR}
                              alt="QR Boleto"
                              className="w-14 h-14 rounded-lg border p-1 bg-white shrink-0 shadow-sm"
                            />
                            <div>
                              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <FiCheckCircle size={12} /> {ticket.estado}
                              </p>
                              <p className="text-[10px] text-muted">ID: {ticket.id}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setTicketModal(ticket)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-brand hover:text-white text-xs font-semibold text-ink transition-all flex items-center gap-1.5"
                          >
                            <FiExternalLink size={13} /> Ver QR
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Pestaña: Seguridad y Cuenta */}
            {activeTab === 'seguridad' && (
              <div className="bg-white border border-borderc rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-display font-bold text-lg text-ink">Seguridad y Preferencias</h3>
                  <p className="text-xs text-muted mt-0.5">Controla tus credenciales de acceso y canales de contacto.</p>
                </div>

                <form onSubmit={guardarPerfil} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">Nombre completo</label>
                      <input
                        type="text"
                        value={usuario.nombreCompleto}
                        onChange={(e) => setUsuario({ ...usuario, nombreCompleto: e.target.value })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderc outline-none focus:border-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">Correo electrónico</label>
                      <input
                        type="email"
                        value={usuario.correo}
                        onChange={(e) => setUsuario({ ...usuario, correo: e.target.value })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderc outline-none focus:border-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">Teléfono / WhatsApp</label>
                      <input
                        type="tel"
                        value={usuario.telefono}
                        onChange={(e) => setUsuario({ ...usuario, telefono: e.target.value })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderc outline-none focus:border-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">Ciudad de residencia</label>
                      <input
                        type="text"
                        value={usuario.ciudad}
                        onChange={(e) => setUsuario({ ...usuario, ciudad: e.target.value })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderc outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="font-semibold text-sm text-ink mb-3">Notificaciones y Alertas</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={usuario.notifEmail}
                          onChange={(e) => setUsuario({ ...usuario, notifEmail: e.target.checked })}
                          className="w-4 h-4 rounded text-brand focus:ring-brand/20 accent-brand cursor-pointer"
                        />
                        <span className="text-xs text-slate-700">Recibir confirmaciones de boletos y cambios por correo electrónico.</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={usuario.notifWhatsapp}
                          onChange={(e) => setUsuario({ ...usuario, notifWhatsapp: e.target.checked })}
                          className="w-4 h-4 rounded text-brand focus:ring-brand/20 accent-brand cursor-pointer"
                        />
                        <span className="text-xs text-slate-700">Recibir recordatorios y boletos QR por WhatsApp 2 horas antes del evento.</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Pestañas: Guardados / Próximos / Historial */}
            {(activeTab === 'guardados' || activeTab === 'proximos' || activeTab === 'historial') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                {eventosVisibles.length === 0 ? (
                  <div className="col-span-2 bg-white rounded-2xl border border-borderc p-12 text-center text-muted shadow-sm">
                    <p className="font-semibold text-ink text-sm">No tienes eventos en esta sección.</p>
                    <p className="text-xs mt-1">Explora la cartelera en Cartagena y guarda tus favoritos.</p>
                  </div>
                ) : (
                  eventosVisibles.map((evento) => (
                    <article
                      key={evento.id}
                      className="bg-white border border-borderc rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col justify-between"
                    >
                      <div className={`relative h-36 bg-gradient-to-br ${evento.gradient} p-4 flex flex-col justify-between`}>
                        <div
                          aria-hidden
                          className="absolute inset-0 opacity-15 pointer-events-none"
                          style={{
                            backgroundImage:
                              'radial-gradient(circle, transparent 20%, rgba(255,255,255,.6) 21%, rgba(255,255,255,.6) 22%, transparent 23%)',
                            backgroundSize: '18px 18px',
                          }}
                        />
                        <div className="flex items-center justify-between relative z-10">
                          <span className="text-[11px] font-bold bg-white/95 text-ink px-2.5 py-1 rounded-lg shadow-sm">
                            {evento.category}
                          </span>
                          <button
                            aria-label="Guardar evento"
                            className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center text-slate-700 hover:text-brand shadow-sm transition-colors"
                          >
                            <FiBookmark size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-brand mb-1">
                            {evento.category}
                          </p>
                          <h3 className="font-display text-[15.5px] font-semibold leading-snug mb-2 text-slate-900 group-hover:text-brand transition-colors">
                            {evento.title}
                          </h3>

                          <div className="space-y-1 text-xs text-slate-600">
                            <p className="flex items-center gap-1.5"><FiCalendar className="text-brand shrink-0" size={13} /> {evento.date}</p>
                            <p className="flex items-center gap-1.5"><FiMapPin className="text-brand shrink-0" size={13} /> {evento.location}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-emerald-600">Entradas disponibles</span>
                          <button
                            type="button"
                            onClick={() => alert(`Redirigiendo al evento: ${evento.title}`)}
                            className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
                          >
                            Ver evento →
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal Digital Ticket QR */}
      {ticketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <button
              onClick={() => setTicketModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-ink transition-colors"
            >
              <FiX size={20} />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-light px-3 py-1 rounded-full">
              Pase Digital de Acceso
            </span>

            <h3 className="font-display font-bold text-lg text-ink mt-3">{ticketModal.evento}</h3>
            <p className="text-xs text-muted mt-0.5">{ticketModal.zona} · {ticketModal.asiento}</p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-block shadow-inner">
              <img src={ticketModal.codigoQR} alt="QR Code" className="w-48 h-48 mx-auto" />
              <p className="font-mono text-xs text-slate-500 font-bold mt-2">{ticketModal.id}</p>
            </div>

            <div className="text-xs text-slate-600 text-left bg-slate-50 p-3.5 rounded-xl mb-4 space-y-1">
              <p><strong>Fecha:</strong> {ticketModal.fecha} ({ticketModal.hora})</p>
              <p><strong>Lugar:</strong> {ticketModal.lugar}</p>
              <p><strong>Titular:</strong> {ticketModal.titular}</p>
            </div>

            <button
              onClick={() => alert('Generando PDF del boleto para impresión/descarga...')}
              className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <FiDownload size={14} /> Descargar Boleto PDF
            </button>
          </div>
        </div>
      )}

      {/* Modal Editar Perfil */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink">Editar Información del Perfil</h3>
              <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-ink"><FiX size={18} /></button>
            </div>

            <form onSubmit={guardarPerfil} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={usuario.nombreCompleto}
                  onChange={(e) => setUsuario({ ...usuario, nombreCompleto: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={usuario.correo}
                  onChange={(e) => setUsuario({ ...usuario, correo: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Ciudad</label>
                <input
                  type="text"
                  value={usuario.ciudad}
                  onChange={(e) => setUsuario({ ...usuario, ciudad: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-borderc outline-none focus:border-brand"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}