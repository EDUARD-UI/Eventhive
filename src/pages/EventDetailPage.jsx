import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import { getEventById } from '../services/eventService.js';

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getEventById(id)
      .then((data) => {
        if (isMounted) setEvent(data);
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
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0d] text-white">
        <p>Cargando evento...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0b0b0d] px-6 text-center text-white">
        <p>{error || 'No encontramos este evento.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          <FiArrowLeft />
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          <FiArrowLeft />
          Volver
        </Link>

        <article className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111318] shadow-2xl">
          <div className="relative h-72 w-full sm:h-96">
            <img src={event.photo} alt={event.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              <span className="inline-flex rounded-full bg-amber-400/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-900">
                {event.category}
              </span>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{event.title}</h1>
            </div>
          </div>

          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.5fr_0.9fr]">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-amber-400" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-amber-400" />
                  {event.location}
                </div>
              </div>

              <h2 className="mb-3 text-xl font-semibold text-white">Descripción</h2>
              <p className="max-w-2xl text-base leading-7 text-slate-300">{event.description}</p>

              <div className="mt-8">
                <h3 className="mb-3 text-lg font-semibold text-white">Localidades</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {event.localidades?.map((localidad, index) => (
                    <div key={`${localidad.nombre}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm uppercase tracking-[0.14em] text-slate-400">{localidad.nombre}</p>
                      <p className="mt-2 text-xl font-bold text-amber-300">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(localidad.precio)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-[#171b23] p-5">
              <p className="text-sm uppercase tracking-[0.14em] text-slate-400">Evento</p>
              <p className="mt-3 text-3xl font-bold text-amber-300">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(event.price || 0)}
              </p>

              <div className="mt-6 space-y-4 border-t border-white/10 pt-5 text-sm text-slate-300">
                <div>
                  <p className="text-slate-400">Ubicación</p>
                  <p className="mt-1 font-medium text-white">{event.location}</p>
                </div>
                <div>
                  <p className="text-slate-400">Organización</p>
                  <p className="mt-1 font-medium text-white">
                    {typeof event.organization === 'string' ? event.organization : event.organization?.nombre || 'No disponible'}
                  </p>
                </div>
              </div>

              <button className="mt-6 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-300">
                Comprar entrada
              </button>
            </aside>
          </div>
        </article>
      </div>
    </div>
  );
}
