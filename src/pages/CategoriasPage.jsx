import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiAward,
} from 'react-icons/fi';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import { getCategoriesWithEvents } from '../services/categoryService.js';

export default function CategoriasPage() {
  const navigate = useNavigate();
  const [rawCategories, setRawCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getCategoriesWithEvents()
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
              Elige una categoría y descubre experiencias seleccionadas para ti.
            </p>
          </div>

          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Categories Grid (Matching Mockup 4) */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {categoryCards.map((cat) => {
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className="group relative rounded-2xl p-7 sm:p-8 text-white bg-brand shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between min-h-[190px] sm:min-h-[220px] text-left cursor-pointer active:scale-[0.99]"
                  aria-label={`Ver eventos de ${cat.nombre}`}
                >
                  {/* Top: Icon */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl">
                      <FiAward size={24} />
                    </div>

                    {cat.totalEventos > 0 && (
                      <span className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full">
                        {cat.totalEventos} {cat.totalEventos === 1 ? 'evento' : 'eventos'}
                      </span>
                    )}
                  </div>

                  {/* Bottom: Title, Subtitle, Arrow */}
                  <div className="flex items-end justify-between mt-8">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide leading-snug">
                        {cat.nombre}
                      </h2>
                      <p className="text-white/85 text-xs sm:text-sm mt-1 font-medium">
                        Categoría de eventos
                      </p>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <FiArrowRight size={18} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
