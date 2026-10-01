import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiAward,
  FiMusic,
  FiActivity,
  FiBookOpen,
  FiCoffee,
  FiBriefcase,
  FiSmile,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import Pagination from '../components/Shared/Pagination.jsx';
import { getAllCategories } from '../services/categoryService.js';

const PAGE_SIZE = 9;

const CATEGORY_GRADIENTS = [
  { bg: 'from-amber-600 via-orange-600 to-slate-950', border: 'border-amber-400/40' },
  { bg: 'from-blue-600 via-indigo-600 to-slate-950', border: 'border-blue-400/40' },
  { bg: 'from-purple-600 via-pink-600 to-indigo-950', border: 'border-pink-400/40' },
  { bg: 'from-emerald-600 via-teal-600 to-slate-950', border: 'border-emerald-400/40' },
  { bg: 'from-rose-600 via-red-600 to-slate-950', border: 'border-rose-400/40' },
  { bg: 'from-cyan-600 via-blue-600 to-slate-950', border: 'border-cyan-400/40' },
  { bg: 'from-violet-600 via-purple-700 to-indigo-950', border: 'border-violet-400/40' },
  { bg: 'from-teal-600 via-emerald-700 to-slate-950', border: 'border-teal-400/40' },
  { bg: 'from-fuchsia-600 via-rose-600 to-purple-950', border: 'border-fuchsia-400/40' },
];

const getCategoryIcon = (nombre = '') => {
  const n = nombre.toLowerCase();
  if (n.includes('músic') || n.includes('conciert')) return FiMusic;
  if (n.includes('deport') || n.includes('fit')) return FiActivity;
  if (n.includes('gastro') || n.includes('comida')) return FiCoffee;
  if (n.includes('negocio') || n.includes('emprend')) return FiBriefcase;
  if (n.includes('educa') || n.includes('tall') || n.includes('acad')) return FiBookOpen;
  if (n.includes('festiv') || n.includes('arte') || n.includes('cultur')) return FiSmile;
  return FiAward;
};

const getCategoryTheme = (cat, index) => {
  const name = (cat.nombre || '').toLowerCase();
  if (name.includes('músic') || name.includes('conciert')) {
    return { bg: 'from-indigo-600 via-purple-700 to-slate-950', border: 'border-indigo-400/40' };
  }
  if (name.includes('arte') || name.includes('cultur') || name.includes('teatr')) {
    return { bg: 'from-purple-700 via-pink-600 to-indigo-950', border: 'border-pink-400/40' };
  }
  if (name.includes('deport') || name.includes('fit') || name.includes('marat')) {
    return { bg: 'from-emerald-600 via-teal-600 to-slate-950', border: 'border-emerald-400/40' };
  }
  if (name.includes('gastro') || name.includes('comida') || name.includes('rest')) {
    return { bg: 'from-amber-500 via-orange-600 to-amber-950', border: 'border-amber-400/40' };
  }
  if (name.includes('negocio') || name.includes('emprend') || name.includes('tecnol')) {
    return { bg: 'from-blue-700 via-cyan-600 to-slate-950', border: 'border-cyan-400/40' };
  }
  if (name.includes('educa') || name.includes('acad') || name.includes('tall')) {
    return { bg: 'from-cyan-700 via-blue-700 to-indigo-950', border: 'border-blue-400/40' };
  }
  if (name.includes('festiv') || name.includes('carnav')) {
    return { bg: 'from-rose-600 via-pink-600 to-amber-950', border: 'border-rose-400/40' };
  }
  return CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];
};

export default function CategoriasPage() {
  const navigate = useNavigate();
  const [rawCategories, setRawCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    getAllCategories()
      .then((data) => {
        if (isMounted) setRawCategories(data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryCards = useMemo(() => rawCategories, [rawCategories]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return categoryCards.slice(start, start + PAGE_SIZE);
  }, [categoryCards, currentPage]);

  const handleCategoryClick = (cat) => {
    const params = new URLSearchParams();
    params.set('categoria', cat.nombre);
    params.set('categoriaId', cat.id);
    navigate(`/buscar?${params.toString()}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* Header Colmena Cultural */}
        <section className="w-full bg-[#0B1B3D] text-white pt-14 pb-18 px-6 sm:px-12 lg:px-20 relative overflow-hidden border-b border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-400/30 mb-4">
              <span>⬡</span>
              <span>CELDAS TEMÁTICAS</span>
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase text-white">
              UNA CIUDAD. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                MILES DE EXPERIENCIAS.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-xl font-medium leading-relaxed">
              Explora cada nicho cultural de Cartagena. Selecciona una celda temática y descubre todos los eventos organizados para ti.
            </p>
          </div>
        </section>

        {/* Cuadrícula de Categorías */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 clip-hexagon-horiz bg-gradient-to-r from-amber-400 to-amber-500 animate-spin" />
                <div className="absolute inset-[3px] clip-hexagon-horiz bg-[#FAF8F5] flex items-center justify-center">
                  <span className="text-amber-500 text-base">⬡</span>
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-[#0B1B3D]">
                Cargando categorías culturales...
              </p>
            </div>
          ) : paginatedCategories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {paginatedCategories.map((cat, idx) => {
                  const theme = getCategoryTheme(cat, idx + (currentPage - 1) * PAGE_SIZE);
                  const Icon = getCategoryIcon(cat.nombre);
                  const imageUrl = cat.urlFoto || cat.foto || cat.imagen;
                  const hasImage = Boolean(imageUrl);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat)}
                      className={`group relative rounded-3xl p-7 sm:p-8 text-white card-interactive flex flex-col justify-between min-h-[220px] sm:min-h-[250px] text-left cursor-pointer active:scale-[0.98] overflow-hidden border-2 ${theme.border} hover:border-amber-400 transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_35px_-5px_rgba(245,158,11,0.25)] hover:-translate-y-1 ${
                        hasImage
                          ? 'bg-slate-900'
                          : `bg-gradient-to-br ${theme.bg}`
                      }`}
                      aria-label={`Ver eventos de ${cat.nombre}`}
                    >
                      {/* Fondo de imagen con overlay */}
                      {hasImage ? (
                        <>
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:scale-105 group-hover:opacity-60 transition-all duration-500 ease-out"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent pointer-events-none" />
                        </>
                      ) : (
                        <>
                          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                          <div className="absolute -left-6 -top-6 w-32 h-32 bg-black/30 rounded-full blur-xl pointer-events-none" />
                        </>
                      )}

                      {/* Header de la Tarjeta: Ícono Hexagonal y Contador */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="relative w-12 h-14 flex items-center justify-center filter drop-shadow-md shrink-0 group-hover:rotate-6 transition-transform duration-300">
                          <div className="absolute inset-0 clip-hexagon-horiz bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600" />
                          <div className="absolute inset-[2px] clip-hexagon-horiz bg-[#0B172C] flex items-center justify-center text-amber-300">
                            <Icon size={20} />
                          </div>
                        </div>

                        <span className="bg-[#0B172C]/80 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-amber-300 px-3.5 py-1 rounded-full border border-amber-400/40 shadow-xs flex items-center gap-1">
                          <span>⬡</span>
                          <span>{cat.totalEventos ?? 0} {(cat.totalEventos ?? 0) === 1 ? 'evento' : 'eventos'}</span>
                        </span>
                      </div>

                      {/* Pie de la Tarjeta: Título y Flecha de Navegación */}
                      <div className="relative z-10 flex items-end justify-between mt-8">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide leading-snug drop-shadow-sm group-hover:text-amber-300 transition-colors duration-200">
                            {cat.nombre}
                          </h2>
                          <p className="text-amber-200/90 text-xs sm:text-sm mt-1 font-bold flex items-center gap-1">
                            <span>Ver cartelera</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </p>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-all duration-200 shadow-md">
                          <FiArrowRight size={18} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Paginación */}
              {categoryCards.length > PAGE_SIZE && (
                <div className="mt-14 rounded-2xl border-2 border-amber-200/90 bg-white overflow-hidden shadow-sm">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={categoryCards.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={(p) => {
                      setCurrentPage(p);
                      window.scrollTo({ top: 320, behavior: 'smooth' });
                    }}
                    showPageSize={false}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-white p-14 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl">
                ⬡
              </div>
              <p className="text-slate-700 font-extrabold text-base mb-1">
                No hay categorías disponibles
              </p>
              <p className="text-slate-500 text-xs">
                Pronto añadiremos nuevas temáticas culturales a la colmena.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
