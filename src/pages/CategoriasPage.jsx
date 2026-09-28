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
  { bg: 'from-blue-600 via-indigo-600 to-slate-950', border: 'border-blue-400/30' },
  { bg: 'from-purple-600 via-pink-600 to-indigo-950', border: 'border-pink-400/30' },
  { bg: 'from-emerald-600 via-teal-600 to-slate-950', border: 'border-emerald-400/30' },
  { bg: 'from-amber-500 via-orange-600 to-amber-950', border: 'border-amber-400/30' },
  { bg: 'from-rose-600 via-red-600 to-slate-950', border: 'border-rose-400/30' },
  { bg: 'from-cyan-600 via-blue-600 to-slate-950', border: 'border-cyan-400/30' },
  { bg: 'from-violet-600 via-purple-700 to-indigo-950', border: 'border-violet-400/30' },
  { bg: 'from-teal-600 via-emerald-700 to-slate-950', border: 'border-teal-400/30' },
  { bg: 'from-fuchsia-600 via-rose-600 to-purple-950', border: 'border-fuchsia-400/30' },
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
    return { bg: 'from-indigo-600 via-purple-600 to-slate-950', border: 'border-indigo-400/40' };
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
      .catch(() => {
        // Backend offline or error fallback
      })
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
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Mockup Header: Dark Navy banner with Gold Accent */}
        <section className="w-full bg-[#0a1838] text-white pt-14 pb-16 px-6 sm:px-12 lg:px-20 border-b-2 border-[#ffc107] relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <span className="text-[#ffc107] font-bold text-xs sm:text-sm tracking-widest uppercase block mb-3">
              EXPLORA POR INTERÉS
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none uppercase">
              UNA CIUDAD. <br />
              <span className="text-white">MILES DE PLANES.</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-xl font-normal leading-relaxed">
              Elige una categoría y descubre experiencias seleccionadas para ti en Cartagena.
            </p>
          </div>

          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Categories Grid con colores dinámicos y soporte de imágenes */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 py-12 sm:py-16">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-sm">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3" />
              Cargando categorías...
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
                      className={`group relative rounded-2xl p-7 sm:p-8 text-white shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-h-[200px] sm:min-h-[230px] text-left cursor-pointer active:scale-[0.99] overflow-hidden border ${theme.border} ${
                        hasImage
                          ? 'bg-slate-900'
                          : `bg-gradient-to-br ${theme.bg}`
                      }`}
                      aria-label={`Ver eventos de ${cat.nombre}`}
                    >
                      {/* Fondo de imagen con overlay si existe */}
                      {hasImage ? (
                        <>
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:scale-105 group-hover:opacity-55 transition-all duration-500"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent pointer-events-none" />
                        </>
                      ) : (
                        <>
                          {/* Luces sutiles si no hay imagen para darle estética premium */}
                          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                          <div className="absolute -left-6 -top-6 w-32 h-32 bg-black/20 rounded-full blur-xl pointer-events-none" />
                        </>
                      )}

                      {/* Top: Icon & Event Count */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl shadow-inner group-hover:rotate-6 transition-transform">
                          <Icon size={24} />
                        </div>

                        <span className="bg-white/20 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                          {cat.totalEventos ?? 0} {(cat.totalEventos ?? 0) === 1 ? 'evento' : 'eventos'}
                        </span>
                      </div>

                      {/* Bottom: Title, Subtitle, Arrow */}
                      <div className="relative z-10 flex items-end justify-between mt-8">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide leading-snug drop-shadow-sm group-hover:text-amber-200 transition-colors">
                            {cat.nombre}
                          </h2>
                          <p className="text-white/80 text-xs sm:text-sm mt-1 font-medium">
                            Explorar agenda →
                          </p>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:translate-x-1.5 group-hover:bg-[#ffc107] group-hover:text-[#0a1838] transition-all shadow-sm">
                          <FiArrowRight size={18} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Componente de Paginación */}
              {categoryCards.length > PAGE_SIZE && (
                <div className="mt-12 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
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
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-lg mx-auto">
              <p className="text-slate-500 text-sm">
                No hay categorías disponibles en este momento.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
