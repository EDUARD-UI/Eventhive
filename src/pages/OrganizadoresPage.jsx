import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiPlusCircle,
  FiCheckCircle,
  FiShield,
  FiTrendingUp,
  FiSmartphone,
  FiArrowRight,
  FiCalendar,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';

// Colectivos y Organizaciones locales de Cartagena
const CARTAGENA_ORGANIZERS = [
  {
    id: 'org-1',
    name: 'Fundación Cultural Caribe',
    category: 'Festivales & Tradición',
    verified: true,
    rating: '4.9',
    eventsCount: 14,
    followers: 1250,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    description: 'Gestores de festivales de danza, poesía y tambores en el Centro Histórico y Murallas.',
    targetCategory: 'Cultural',
  },
  {
    id: 'org-2',
    name: 'Muralla Sounds & Beats',
    category: 'Conciertos & Festivales',
    verified: true,
    rating: '4.8',
    eventsCount: 9,
    followers: 2100,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    description: 'Producción de grandes conciertos de jazz, salsa y música electrónica frente al mar Caribe.',
    targetCategory: 'Música',
  },
  {
    id: 'org-3',
    name: 'Sabores de la Heroica',
    category: 'Rutas Gastronómicas',
    verified: true,
    rating: '5.0',
    eventsCount: 8,
    followers: 980,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    description: 'Colectivo de chefs y artesanos culinarios promoviendo la gastronomía caribeña y catas de café.',
    targetCategory: 'Gastronómico',
  },
  {
    id: 'org-4',
    name: 'Getsemaní Arte Urbano',
    category: 'Cultura & Comunidad',
    verified: true,
    rating: '4.9',
    eventsCount: 6,
    followers: 1450,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    description: 'Rutas de murales, exposiciones fotográficas al aire libre y talleres artísticos en el barrio histórico.',
    targetCategory: 'Cultural',
  },
];

export default function OrganizadoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('directorio'); // 'directorio' | 'informacion'

  const filteredOrganizers = useMemo(() => {
    if (!searchTerm.trim()) return CARTAGENA_ORGANIZERS;
    const term = searchTerm.toLowerCase();
    return CARTAGENA_ORGANIZERS.filter(
      (org) =>
        org.name.toLowerCase().includes(term) ||
        org.category.toLowerCase().includes(term) ||
        org.description.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Encabezado: Mockup Exacto */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 pt-12 sm:pt-16 pb-6">
          <span className="text-brand font-bold text-xs sm:text-sm tracking-wider uppercase block mb-2">
            COMUNIDAD EVENTHIVE
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0a1838] tracking-tight mb-3">
            Conoce a nuestros organizadores
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed mb-8">
            Descubre perfiles verificados, sigue tus organizaciones favoritas y encuentra sus próximos eventos.
          </p>

          {/* Barra de búsqueda (Mockup) */}
          <div className="relative max-w-md mb-8">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar organización..."
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-sm transition-all"
            />
          </div>

          {/* Selector de pestañas: Directorio vs Información para Organizadores */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('directorio')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                activeTab === 'directorio'
                  ? 'bg-[#0a1838] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0a1838] hover:bg-slate-100'
              }`}
            >
              Directorio de Organizadores
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('informacion')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                activeTab === 'informacion'
                  ? 'bg-[#0a1838] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0a1838] hover:bg-slate-100'
              }`}
            >
              Información para Organizadores
            </button>
          </div>
        </section>

        {/* Contenido: Tab Directorio */}
        {activeTab === 'directorio' && (
          <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 pb-16">
            {/* Si no hay búsqueda o está vacío, mostramos la tarjeta exacta del Mockup */}
            {searchTerm.trim() === '' ? (
              <div className="space-y-8">
                {/* Mockup Box: Próximamente nuevos perfiles */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-12 sm:p-16 text-center shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand flex items-center justify-center mx-auto mb-4 shadow-sm">
                    {/* Icono de edificio exacto al mockup */}
                    <svg
                      className="w-7 h-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                      <path d="M6 12H4a2 2 0 0 0-2 2v8h4" />
                      <path d="M18 9h2a2 2 0 0 1 2 2v11h-4" />
                      <path d="M10 6h4" />
                      <path d="M10 10h4" />
                      <path d="M10 14h4" />
                      <path d="M10 18h4" />
                    </svg>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-[#0a1838] mb-2">
                    Próximamente nuevos perfiles
                  </h2>

                  <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Cuando el backend publique organizaciones aprobadas, sus perfiles aparecerán aquí con sus eventos, seguidores y valoración.
                  </p>
                </div>

                {/* Perfiles destacados de Cartagena */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0a1838] mb-4">
                    Organizaciones pioneras en Cartagena
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CARTAGENA_ORGANIZERS.map((org) => (
                      <div
                        key={org.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="relative">
                              <img
                                src={org.avatar}
                                alt={org.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                              />
                              {org.verified && (
                                <span className="absolute -bottom-1 -right-1 bg-brand text-white p-0.5 rounded-full shadow-sm text-[10px]">
                                  <FiCheckCircle size={10} />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full">
                              ★ {org.rating}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1">
                            {org.category}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mb-1.5">
                            {org.name}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                            {org.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">
                            {org.eventsCount} eventos
                          </span>
                          <Link
                            to={`/buscar?categoria=${encodeURIComponent(org.targetCategory)}`}
                            className="text-xs font-bold text-brand hover:underline"
                          >
                            Ver agenda →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Resultados de búsqueda */
              <div>
                {filteredOrganizers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredOrganizers.map((org) => (
                      <div
                        key={org.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <img
                              src={org.avatar}
                              alt={org.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                            />
                            <span className="text-[11px] font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full">
                              ★ {org.rating}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1">
                            {org.category}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mb-1.5">{org.name}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mb-3">{org.description}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">{org.eventsCount} eventos</span>
                          <Link
                            to={`/buscar?categoria=${encodeURIComponent(org.targetCategory)}`}
                            className="text-xs font-bold text-brand hover:underline"
                          >
                            Ver agenda →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <p className="text-slate-500 text-sm">
                      No encontramos organizaciones con el término &ldquo;{searchTerm}&rdquo;.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Contenido: Tab Información Para Organizadores */}
        {activeTab === 'informacion' && (
          <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 pb-16">
            {/* Beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand flex items-center justify-center mb-4 text-xl">
                  <FiCalendar size={22} />
                </div>
                <h3 className="font-extrabold text-[#0a1838] text-base mb-2">
                  Publicación Inmediata
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Crea eventos en minutos, añade fotografías, fechas, horarios y ubicación geolocalizada en el mapa de Cartagena.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 text-xl">
                  <FiSmartphone size={22} />
                </div>
                <h3 className="font-extrabold text-[#0a1838] text-base mb-2">
                  Pases Digitales con QR
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Valida entradas en segundos en la puerta del evento con nuestro lector de códigos QR seguro, sin riesgo de duplicados.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 text-xl">
                  <FiTrendingUp size={22} />
                </div>
                <h3 className="font-extrabold text-[#0a1838] text-base mb-2">
                  Panel de Estadísticas
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Conoce cuántas entradas se han vendido, la afluencia en tiempo real y el rendimiento de tus promociones.
                </p>
              </div>
            </div>

            {/* Banner de Registro para Organizadores */}
            <div className="rounded-3xl bg-gradient-to-r from-[#0a1838] via-[#0d2352] to-[#007bff] p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-[#ffc107] font-bold text-xs uppercase tracking-widest block mb-2">
                  EMPIEZA HOY MISMO
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                  Lleva tus eventos en Cartagena al siguiente nivel
                </h2>
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  Únete a la red de productores y colectivos que impulsan la cultura, entretenimiento y turismo en La Heroica.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/registro"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#0a1838] font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  Registrarme como Organizador
                  <FiArrowRight size={14} />
                </Link>
                <Link
                  to="/organizador"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Ir al Panel
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
