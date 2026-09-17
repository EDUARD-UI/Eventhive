import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import EventCard from '../components/EventCard.jsx';
import { searchEvents, getEventsByCategory } from '../services/eventService.js';


export default function BuscarEventosPage() {
  const [searchParams] = useSearchParams();
  const titulo = searchParams.get('titulo') || '';
  const fecha = searchParams.get('fecha') || '';
  const categoria = searchParams.get('categoria') || '';
  const categoriaId = searchParams.get('categoriaId') || '';

  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      if (categoriaId) {
        return getEventsByCategory({ categoriaId });
      }

      return searchEvents({ titulo, fecha });
    };

    load()
      .then(({ events: results, total: totalResults }) => {
        if (!isMounted) return;
        setEvents(results);
        setTotal(totalResults);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [titulo, fecha, categoriaId]);

  const hasFilters = Boolean(titulo || fecha || categoria);

  return (
    <div className="w-full min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <Link
          to={categoria ? '/categorias' : '/'}
          className="text-[13.5px] font-semibold text-brand"
        >
          ← Volver {categoria ? 'a categorías' : 'al inicio'}
        </Link>

        <div className="mt-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-display">
            {categoria || 'Resultados de búsqueda'}
          </h1>
          <p className="text-[13.5px] text-muted mt-1">
            {hasFilters ? (
              <>
                {!categoria && titulo && `“${titulo}” `}
                {fecha && `· ${fecha} `}
                {!loading && !error && `· ${total} evento${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`}
              </>
            ) : (
              'Usa el buscador para encontrar eventos por título o fecha.'
            )}
          </p>
        </div>

        {loading && <p className="text-[13.5px] text-muted">Buscando eventos…</p>}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
            No se pudo completar la búsqueda. Verifica que el backend esté disponible ({error}).
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="text-[13.5px] text-muted">No encontramos eventos con esos criterios.</p>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
