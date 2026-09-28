import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiArrowLeft, FiHeart } from 'react-icons/fi';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import Swal from 'sweetalert2';
import { showLoginAlert } from '../utils/alertUtils.js';
import Navbar from '../components/usersComponets/Navbar.jsx';
import Footer from '../components/usersComponets/Footer.jsx';
import { getEventById } from '../services/eventService.js';
import { httpClient } from '../services/httpClient.js';
import { session } from '../services/session.js';
import ImageWithFallback from '../components/common/ImageWithFallback.jsx';

const bluePinIcon = () =>
  L.divIcon({
    className: 'custom-detail-map-pin',
    html: `
      <div style="width: 26px; height: 26px; background: #0070F3; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,112,243,0.35); border: 2.5px solid #ffffff;">
        <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocalidad, setSelectedLocalidad] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getEventById(id)
      .then((data) => {
        if (!isMounted) return;
        setEvent(data);
        if (data?.localidades?.length > 0) {
          setSelectedLocalidad(data.localidades[0]);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'No fue posible cargar el evento.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const localidades = useMemo(() => {
    if (event?.localidades && event.localidades.length > 0) {
      return event.localidades;
    }
    if (event?.price !== undefined) {
      return [
        {
          id: 'general',
          nombre: 'General',
          precio: event.price,
        },
      ];
    }
    return [];
  }, [event]);

  useEffect(() => {
    if (!selectedLocalidad && localidades.length > 0) {
      setSelectedLocalidad(localidades[0]);
    }
  }, [localidades, selectedLocalidad]);

  const displayedPrice = selectedLocalidad?.precio ?? event?.price ?? 0;

  const orgName = useMemo(() => {
    if (!event?.organization) return 'Organización';
    if (typeof event.organization === 'object') {
      return event.organization.nombre || event.organization.razonSocial || 'Organización';
    }
    return event.organization;
  }, [event]);

  const orgAvatar = useMemo(() => {
    if (typeof event?.organization === 'object') {
      return event.organization.logo || event.organization.imagen || null;
    }
    return null;
  }, [event]);

  const mapCenter = useMemo(() => {
    const lat = Number(event?.lat);
    const lng = Number(event?.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng];
    }
    return [10.4236, -75.5513];
  }, [event]);

  const handleToggleFollow = async () => {
    const user = session.getUser();
    if (!user) {
      showLoginAlert({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para seguir a este organizador.',
        navigate,
      });
      return;
    }

    const orgId = typeof event?.organization === 'object' ? event.organization.id : null;
    try {
      if (orgId) {
        if (isFollowing) {
          await httpClient.delete(`/seguidores/${orgId}/seguir`);
        } else {
          await httpClient.post(`/seguidores/${orgId}/seguir`);
        }
      }
      setIsFollowing(!isFollowing);
    } catch {
      setIsFollowing(!isFollowing);
    }
  };

  const handleToggleFavorite = async () => {
    const user = session.getUser();
    if (!user) {
      showLoginAlert({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para guardar eventos en tu lista de deseos.',
        navigate,
      });
      return;
    }

    try {
      if (isFavorite) {
        await httpClient.delete(`/deseos/${event.id}`);
        setIsFavorite(false);
      } else {
        await httpClient.post(`/deseos/${event.id}`);
        setIsFavorite(true);
      }
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  const handlePurchase = async () => {
    const user = session.getUser();
    if (!user) {
      showLoginAlert({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para comprar entradas.',
        navigate,
      });
      return;
    }

    const { value: cantidad } = await Swal.fire({
      title: 'Comprar entradas',
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>Evento:</strong> ${event.title}</p>
          <p><strong>Localidad:</strong> ${selectedLocalidad?.nombre || 'General'}</p>
          <p><strong>Precio unitario:</strong> $${displayedPrice.toLocaleString('es-CO')} COP</p>
        </div>
      `,
      input: 'number',
      inputValue: 1,
      inputAttributes: {
        min: '1',
        max: '10',
        step: '1',
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar compra',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0070F3',
      inputValidator: (val) => {
        if (!val || val < 1) return 'Ingresa una cantidad válida.';
        return null;
      },
    });

    if (cantidad) {
      try {
        const payload = {
          eventoId: Number(event.id),
          localidadId: selectedLocalidad?.id && typeof selectedLocalidad.id === 'number' ? selectedLocalidad.id : undefined,
          cantidad: Number(cantidad),
        };
        await httpClient.post('/compras', payload);
        Swal.fire({
          icon: 'success',
          title: '¡Compra realizada!',
          text: `Has adquirido ${cantidad} entrada(s) para ${event.title}.`,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo procesar la compra',
          text: err.message || 'Ocurrió un error al procesar la transacción.',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">Cargando evento...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
          <p className="text-base font-semibold text-slate-800 mb-4">{error || 'No encontramos este evento.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <FiArrowLeft />
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/buscar');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-brand transition-colors cursor-pointer group"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" size={16} />
            <span>Volver a eventos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            <div>
              {event.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide bg-amber-400 text-slate-950">
                  {event.category}
                </span>
              )}

              <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {event.title}
              </h1>

              {event.date && (
                <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600">
                  <FiCalendar className="text-brand shrink-0" size={16} />
                  <span>{event.date}</span>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <ImageWithFallback
                src={event.photo}
                alt={event.title}
                className="w-full h-64 sm:h-80 md:h-[400px]"
                imgClassName="w-full h-full object-cover"
                fallbackClassName="w-full h-64 sm:h-80 md:h-[400px]"
                fallbackText="Imagen del evento no disponible"
                iconSize={36}
              />
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Sobre el evento</h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                {event.description || 'No hay descripción disponible para este evento.'}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Organizador</h2>
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <ImageWithFallback
                    src={orgAvatar}
                    alt={orgName}
                    showText={false}
                    className="w-12 h-12 rounded-full shrink-0 border border-slate-200"
                    imgClassName="w-12 h-12 rounded-full object-cover"
                    fallbackClassName="w-12 h-12 rounded-full"
                    iconSize={18}
                  />
                  <span className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                    {orgName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Ubicación</h2>
              <div className="h-64 sm:h-80 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-xs relative z-0">
                <MapContainer
                  center={mapCenter}
                  zoom={14}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={mapCenter} icon={bluePinIcon()} />
                </MapContainer>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-medium text-slate-500 block">Precio desde</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    ${displayedPrice.toLocaleString('es-CO')}
                  </span>
                  <span className="text-sm font-bold text-slate-600">COP</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedLocalidad?.nombre
                    ? `${selectedLocalidad.nombre} · Impuestos incluidos`
                    : 'Entrada general · Impuestos incluidos'}
                </p>
              </div>

              {localidades.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Localidad
                  </span>
                  <div className="space-y-2">
                    {localidades.map((loc) => {
                      const isSelected = selectedLocalidad?.id === loc.id;
                      return (
                        <label
                          key={loc.id}
                          onClick={() => setSelectedLocalidad(loc)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-brand bg-brand/5 ring-1 ring-brand'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="localidad"
                              checked={isSelected}
                              onChange={() => setSelectedLocalidad(loc)}
                              className="w-4 h-4 text-brand focus:ring-brand accent-brand cursor-pointer"
                            />
                            <span className="text-xs sm:text-sm font-medium text-slate-800">
                              {loc.nombre}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            ${Number(loc.precio).toLocaleString('es-CO')}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handlePurchase}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-sm shadow-md shadow-brand/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  Comprar entradas
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`w-full py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    isFavorite
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-amber-400/90 text-slate-800 bg-white hover:bg-amber-50/50'
                  }`}
                >
                  <FiHeart className={isFavorite ? 'fill-amber-500 text-amber-500' : 'text-amber-500'} size={15} />
                  <span>{isFavorite ? 'Evento guardado' : 'Guardar evento'}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-16 sm:mt-20 rounded-3xl bg-[#0057b7] p-8 sm:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block mb-2">
              ¿ORGANIZAS EVENTOS EN CARTAGENA?
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold mb-2 text-white">
              Conecta tu cartelera con miles de asistentes y turistas
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Publica en minutos, administra localidades y entradas, genera códigos QR de acceso seguro y obtén métricas detalladas en tiempo real.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              Únete como Organización →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
