import { useState } from 'react';
import {
  FiMapPin,
  FiCalendar,
  FiStar,
  FiBookmark,
  FiEdit2,
  FiMail,
} from 'react-icons/fi';
import Navbar from '../../components/usersComponets/Navbar.jsx';

const TABS = [
  { id: 'guardados', label: 'Guardados' },
  { id: 'proximos', label: 'Próximos' },
  { id: 'historial', label: 'Historial' },
];

const EVENTOS_DEMO = [
  {
    id: 1,
    category: 'MÚSICA',
    title: 'Festival Cartagena Jazz',
    date: '15 sep',
    location: 'Cartagena',
    gradient: 'from-sky-500 to-blue-600',
    estado: 'guardados',
  },
  {
    id: 2,
    category: 'DEPORTES',
    title: 'Valery Playa Baseguardia',
    date: '18 sep',
    location: 'Cartagena',
    gradient: 'from-emerald-500 to-teal-600',
    estado: 'guardados',
  },
  {
    id: 3,
    category: 'CULTURA',
    title: 'Feria del Almendra Cartagena',
    date: '22 sep',
    location: 'Cartagena',
    gradient: 'from-violet-500 to-indigo-600',
    estado: 'proximos',
  },
  {
    id: 4,
    category: 'MÚSICA',
    title: 'Festival Cartagena Jazz',
    date: '29 sep',
    location: 'Cartagena',
    gradient: 'from-sky-500 to-blue-600',
    estado: 'proximos',
  },
  {
    id: 5,
    category: 'DEPORTES',
    title: 'Valery Playa Baseguardia',
    date: '3 oct',
    location: 'Cartagena',
    gradient: 'from-emerald-500 to-teal-600',
    estado: 'historial',
  },
  {
    id: 6,
    category: 'CULTURA',
    title: 'Feria del Almendra Cartagena',
    date: '10 oct',
    location: 'Cartagena',
    gradient: 'from-violet-500 to-indigo-600',
    estado: 'historial',
  },
];

const USUARIO_DEMO = {
  nombreCompleto: 'Gustavo R.',
  correo: 'gustavo.r@email.com',
  avatarGradient: 'from-amber-400 via-orange-400 to-sky-500',
  eventosGuardados: 6,
  eventosAsistidos: 4,
  resenas: 2,
};

export default function PerfilCliente() {
  const [activeTab, setActiveTab] = useState('guardados');
  const eventosVisibles = EVENTOS_DEMO.filter((evento) => evento.estado === activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />

      {/* Banner de marca */}
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
        <div className="relative z-10 flex justify-center mt-6 mb-6">
          <div className="bg-white border border-borderc rounded-card shadow-sm p-1.5 flex gap-1.5 w-fit max-w-full overflow-x-auto">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${active
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-muted hover:text-brand hover:bg-brand-light'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-[300px] shrink-0">
            <div className="bg-white border border-borderc rounded-card shadow-lg p-7 text-center">
              <div className="relative w-24 h-24 mx-auto">
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-br ${USUARIO_DEMO.avatarGradient} ring-4 ring-white shadow-md`}
                />
              </div>
              <h2 className="font-display font-bold text-xl mt-4">
                {USUARIO_DEMO.nombreCompleto}
              </h2>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted mt-1.5">
                <FiMail size={12} /> {USUARIO_DEMO.correo}
              </p>

              <button className="w-full mt-5 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold border border-borderc hover:border-brand hover:text-brand hover:bg-brand-light transition-colors">
                <FiEdit2 size={14} />
                Editar perfil
              </button>
            </div>

            <div className="bg-white border border-borderc rounded-card shadow-sm p-6 mt-5">
              <p className="text-[11px] font-bold tracking-wide text-muted mb-4">
                RESUMEN
              </p>

              <div className="flex items-center gap-3.5 text-sm text-slate-700 mb-4">
                <span className="w-9 h-9 rounded-lg bg-brand-light text-brand flex items-center justify-center shrink-0">
                  <FiBookmark size={15} />
                </span>
                <span>
                  <strong className="block font-display font-bold text-base leading-none text-ink">
                    {USUARIO_DEMO.eventosGuardados}
                  </strong>
                  <span className="text-xs text-muted">eventos guardados</span>
                </span>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-slate-700 mb-4">
                <span className="w-9 h-9 rounded-lg bg-brand-light text-brand flex items-center justify-center shrink-0">
                  <FiCalendar size={15} />
                </span>
                <span>
                  <strong className="block font-display font-bold text-base leading-none text-ink">
                    {USUARIO_DEMO.eventosAsistidos}
                  </strong>
                  <span className="text-xs text-muted">eventos asistidos</span>
                </span>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-slate-700">
                <span className="w-9 h-9 rounded-lg bg-brand-light text-brand flex items-center justify-center shrink-0">
                  <FiStar size={15} />
                </span>
                <span>
                  <strong className="block font-display font-bold text-base leading-none text-ink">
                    {USUARIO_DEMO.resenas}
                  </strong>
                  <span className="text-xs text-muted">reseñas</span>
                </span>
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {eventosVisibles.map((evento) => (
                <article
                  key={evento.id}
                  className="bg-white border border-borderc rounded-card overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className={`relative h-32 bg-gradient-to-br ${evento.gradient}`}>
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle, transparent 20%, rgba(255,255,255,.6) 21%, rgba(255,255,255,.6) 22%, transparent 23%)',
                        backgroundSize: '18px 18px',
                      }}
                    />
                    <span className="absolute left-3 top-3 text-[11px] font-bold bg-white/95 text-ink px-2.5 py-1 rounded-md shadow-sm">
                      {evento.category}
                    </span>
                    <button
                      aria-label="Guardar evento"
                      className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center text-slate-700 hover:text-brand shadow-sm transition-colors"
                    >
                      <FiBookmark size={15} />
                    </button>
                  </div>

                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand mb-1.5">
                      {evento.category}
                    </p>
                    <h3 className="font-display text-[16px] font-semibold leading-snug mb-2.5 text-slate-900">
                      {evento.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600 mb-1">
                      <FiCalendar className="text-brand shrink-0" /> {evento.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600">
                      <FiMapPin className="text-brand shrink-0" /> {evento.location}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

    </div>
  );
}