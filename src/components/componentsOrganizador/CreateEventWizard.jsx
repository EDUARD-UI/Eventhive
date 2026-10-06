import React, { useState, useEffect, useMemo } from 'react';
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiClock,
  FiImage,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiUsers,
  FiAlertCircle,
  FiDollarSign,
  FiInfo,
  FiX,
} from 'react-icons/fi';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import Swal from 'sweetalert2';
import { organizerService } from '../../services/organizerService.js';
import { formatPrice } from '../../utils/formatters.js';

// Pin temático ámbar colmena para Leaflet
const amberHivePinIcon = () =>
  L.divIcon({
    className: 'custom-hive-map-pin',
    html: `
      <div style="position: relative; width: 36px; height: 44px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 6px 14px rgba(245,158,11,0.6)); cursor: pointer;">
        <svg viewBox="0 0 34 42" width="36" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 40.5 16.1 41.9C16.6 42.3 17.4 42.3 17.9 41.9C19.5 40.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="url(#honeyPinWizard)" stroke="#FFFFFF" stroke-width="2.2"/>
          <polygon points="17,9 23,12.5 23,19.5 17,23 11,19.5 11,12.5" fill="#0B172C"/>
          <circle cx="17" cy="16" r="3" fill="#FCD34D"/>
          <defs>
            <linearGradient id="honeyPinWizard" x1="0" y1="0" x2="34" y2="42" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FCD34D"/>
              <stop offset="0.5" stop-color="#F59E0B"/>
              <stop offset="1" stop-color="#D97706"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });

// Componente para redimensionar Leaflet al montarse en paneles o drawer laterales
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Componente interactivo para capturar clics en el mapa
function MapLocationPicker({ position, onSelectLocation }) {
  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} icon={amberHivePinIcon()} /> : null;
}

const STEPS = [
  { id: 1, label: 'Información básica' },
  { id: 2, label: 'Ubicación y mapa' },
  { id: 3, label: 'Localidades' },
  { id: 4, label: 'Imagen de portada' },
  { id: 5, label: 'Revisión y creación' },
];

export default function CreateEventWizard({ onBack, onSave, isDrawer = false }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario con los datos requeridos por el backend
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoriaId: '',
    fecha: '',
    hora: '',
    lugar: '',
    latitud: 10.4236, // Coordenadas de Cartagena de Indias por defecto
    longitud: -75.5478,
  });

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const [localidades, setLocalidades] = useState([
    { nombre: 'General', precio: 50000, capacidad: 100 },
  ]);

  // Cargar categorías
  useEffect(() => {
    organizerService
      .getCategorias()
      .then((res) => {
        const cats = Array.isArray(res) ? res : res?.content || res?.data || [];
        setCategories(cats);
        if (cats.length > 0 && !form.categoriaId) {
          setForm((prev) => ({ ...prev, categoriaId: String(cats[0].id) }));
        }
      })
      .catch((err) => {
        console.warn('Error cargando categorías:', err);
      });
  }, []);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isDirty = useMemo(() => {
    return Boolean(
      form.titulo ||
      form.descripcion ||
      form.fecha ||
      form.hora ||
      form.lugar ||
      fotoFile ||
      localidades.length > 1
    );
  }, [form, fotoFile, localidades]);

  // Manejo de salida con advertencia si hay cambios sin guardar
  const handleSafeBack = async () => {
    if (isDirty) {
      const res = await Swal.fire({
        icon: 'warning',
        title: '¿Abandonar creación de evento?',
        text: 'Tienes datos sin guardar en el formulario. Si sales ahora, se perderán los cambios.',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Continuar editando',
        confirmButtonColor: '#e11d48',
      });
      if (!res.isConfirmed) return;
    }
    onBack();
  };

  // Manejo de selección de archivo de imagen
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo no válido',
        text: 'Por favor selecciona un archivo de imagen (JPG, PNG, WebP).',
      });
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Localidades helpers
  const handleAddLocalidad = () => {
    setLocalidades((prev) => [
      ...prev,
      { nombre: `Zona ${prev.length + 1}`, precio: 75000, capacidad: 50 },
    ]);
  };

  const handleRemoveLocalidad = (index) => {
    if (localidades.length === 1) {
      Swal.fire({
        icon: 'info',
        title: 'Localidad requerida',
        text: 'Debes definir al menos una localidad o zona para el evento.',
      });
      return;
    }
    setLocalidades((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLocalidad = (index, field, value) => {
    setLocalidades((prev) =>
      prev.map((loc, i) => (i === index ? { ...loc, [field]: value } : loc))
    );
  };

  // Validación por paso
  const validateStep = () => {
    if (currentStep === 1) {
      if (!form.titulo.trim()) {
        Swal.fire({ icon: 'warning', title: 'Título requerido', text: 'Ingresa el nombre del evento.' });
        return false;
      }
      if (!form.descripcion.trim()) {
        Swal.fire({ icon: 'warning', title: 'Descripción requerida', text: 'Describe la experiencia del evento.' });
        return false;
      }
      if (!form.categoriaId) {
        Swal.fire({ icon: 'warning', title: 'Categoría requerida', text: 'Selecciona una categoría.' });
        return false;
      }
      if (!form.fecha) {
        Swal.fire({ icon: 'warning', title: 'Fecha requerida', text: 'Indica la fecha del evento.' });
        return false;
      }
      if (!form.hora) {
        Swal.fire({ icon: 'warning', title: 'Hora requerida', text: 'Indica la hora de inicio del evento.' });
        return false;
      }
    }

    if (currentStep === 2) {
      if (!form.lugar.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Nombre del lugar requerido',
          text: 'Por favor escribe el nombre del lugar donde se realizará el evento (ej: Plaza de la Aduana).',
        });
        return false;
      }
      if (!form.latitud || !form.longitud) {
        Swal.fire({
          icon: 'warning',
          title: 'Ubicación en el mapa',
          text: 'Haz clic en el mapa para ubicar el punto del evento.',
        });
        return false;
      }
    }

    if (currentStep === 3) {
      if (localidades.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Localidades requeridas', text: 'Agrega al menos una localidad.' });
        return false;
      }
      for (const loc of localidades) {
        if (!loc.nombre.trim()) {
          Swal.fire({ icon: 'warning', title: 'Nombre de localidad', text: 'Todas las localidades deben tener nombre.' });
          return false;
        }
        if (Number(loc.capacidad) <= 0) {
          Swal.fire({ icon: 'warning', title: 'Capacidad inválida', text: 'La capacidad debe ser mayor a 0.' });
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((s) => s + 1);
    }
  };

  // Envío final al Backend
  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      // 1. Preparar FormData para POST /api/eventos
      const formData = new FormData();
      const datosPayload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        lugar: form.lugar.trim(),
        fecha: form.fecha,
        hora: form.hora.length === 5 ? `${form.hora}:00` : form.hora,
        categoriaId: Number(form.categoriaId),
        latitud: Number(form.latitud),
        longitud: Number(form.longitud),
      };

      formData.append(
        'datos',
        new Blob([JSON.stringify(datosPayload)], { type: 'application/json' })
      );

      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      const createdEvent = await organizerService.crearEvento(formData);
      const eventoId = createdEvent?.id || createdEvent?.eventoId || createdEvent?.data?.id;

      // 2. Registrar localidades para el evento si hay ID
      if (eventoId && localidades.length > 0) {
        for (const loc of localidades) {
          try {
            await organizerService.agregarLocalidad(eventoId, {
              nombre: loc.nombre.trim(),
              precio: Number(loc.precio) || 0,
              capacidad: Number(loc.capacidad) || 1,
            });
          } catch (e) {
            console.warn('Error registrando localidad:', loc.nombre, e);
          }
        }
      }

      // 3. Manejo de estado del evento y SweetAlert2 según requerimiento
      const estadoEvento = (createdEvent?.estado || '').toUpperCase();
      const backendMsg = createdEvent?._mensaje || createdEvent?.mensaje;

      // REQUERIMIENTO 5:
      // Si la organización está en PENDIENTE_REVISION y backend devuelve BORRADOR:
      if (estadoEvento === 'BORRADOR' || createdEvent?.requiereRut) {
        await Swal.fire({
          icon: 'info',
          title: 'Evento creado como borrador',
          text: 'Su evento ha sido creado como borrador, por favor adjunte su RUT para verificación de su organización.',
          confirmButtonColor: '#0B1B3D',
        });
      } else if (estadoEvento === 'MODERACION') {
        await Swal.fire({
          icon: 'info',
          title: 'Evento enviado a moderación',
          text: 'El evento ha sido enviado a moderación y será revisado antes de publicarse en cartelera.',
          confirmButtonColor: '#0B1B3D',
        });
      } else {
        await Swal.fire({
          icon: 'success',
          title: '¡Evento Creado!',
          text: backendMsg || 'Tu evento ha sido creado y publicado exitosamente.',
          confirmButtonColor: '#0B1B3D',
        });
      }

      if (onSave) onSave(createdEvent);
    } catch (err) {
      console.error('Error al crear evento:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al crear evento',
        text: err.message || 'No se pudo crear el evento. Revisa la información e intenta de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryName =
    categories.find((c) => String(c.id) === String(form.categoriaId))?.nombre || 'Categoría';

  const wizardContent = (
    <div className={`space-y-6 ${isDrawer ? 'p-6 sm:p-7' : ''}`}>
      {/* 1. Header con botón seguro para volver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md inline-block mb-1">
            CREACIÓN ASISTIDA
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight">
            Publicar Nuevo Evento Cultural
          </h2>
          <p className="mt-1 text-xs text-slate-600 font-medium">
            Completa los datos esenciales para registrar tu evento oficial en Eventhive Cartagena.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSafeBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          {isDrawer ? (
            <>
              <FiX size={15} /> Cerrar panel
            </>
          ) : (
            <>
              <FiArrowLeft size={14} /> Regresar a mis eventos
            </>
          )}
        </button>
      </div>

      {/* 2. GUÍA BREVE ARRIBA DEL WIZARD (Requerimiento 3) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-200/10 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 text-slate-900 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-sm">
            <FiInfo size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0B1B3D]">
              Guía de Creación de Eventos
            </h4>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              Completa la información en 5 pasos sencillos: <strong>1) Datos básicos</strong>,{' '}
              <strong>2) Ubicación exacta en el mapa</strong>, <strong>3) Localidades y precios</strong>,{' '}
              <strong>4) Portada oficial</strong> y <strong>5) Revisión</strong>. Si tu organización tiene verificación pendiente de RUT, el evento quedará guardado como borrador hasta su aprobación.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Stepper de Progreso */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
          {STEPS.map((s) => {
            const isCompleted = s.id < currentStep;
            const isCurrent = s.id === currentStep;
            return (
              <div key={s.id} className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    isCurrent
                      ? 'bg-[#0B1B3D] text-amber-300 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <FiCheck size={13} /> : s.id}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isCurrent ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
                {s.id < STEPS.length && (
                  <span className="w-6 h-0.5 bg-slate-200 mx-1 hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Formulario Principal */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* PASO 1: Información Básica */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-black text-[#0B1B3D] uppercase tracking-wider">
                1. Información Básica
              </h3>
              <p className="text-xs text-slate-500">
                Define el nombre, categoría, fecha, hora y descripción general del evento.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => updateForm('titulo', e.target.value)}
                  placeholder="Ej: Festival Internacional de Música de Cartagena"
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Categoría *
                  </label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) => updateForm('categoriaId', e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => updateForm('fecha', e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Hora de Inicio *
                  </label>
                  <input
                    type="time"
                    value={form.hora}
                    onChange={(e) => updateForm('hora', e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Descripción del Evento *
                </label>
                <textarea
                  rows={4}
                  value={form.descripcion}
                  onChange={(e) => updateForm('descripcion', e.target.value)}
                  placeholder="Detalla los artistas participantes, la agenda cultural, recomendaciones de acceso y requisitos de ingreso."
                  className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: Ubicación con Mapa Interactivo (Requerimiento 4) */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-black text-[#0B1B3D] uppercase tracking-wider">
                2. Ubicación del Evento y Mapa
              </h3>
              <p className="text-xs text-slate-500">
                Escribe el nombre del lugar e indica el punto exacto en el mapa interactivo haciendo clic sobre él.
              </p>
            </div>

            {/* Campo Manual: Nombre del Lugar (Requerimiento 4) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nombre del Lugar *
              </label>
              <input
                type="text"
                value={form.lugar}
                onChange={(e) => updateForm('lugar', e.target.value)}
                placeholder="Ej: Plaza de la Aduana, Centro Histórico / Teatro Adolfo Mejía"
                className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Escribe el nombre reconocible del recinto o plaza para que los asistentes lo identifiquen fácilmente.
              </p>
            </div>

            {/* Indicador de coordenadas obtenidas del mapa */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <FiMapPin className="text-brand" size={14} />
                <span>Punto Geográfico Seleccionado:</span>
              </span>
              <span className="font-mono bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-800 font-bold">
                Lat: {Number(form.latitud).toFixed(5)}
              </span>
              <span className="font-mono bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-800 font-bold">
                Lng: {Number(form.longitud).toFixed(5)}
              </span>
              <span className="text-[11px] text-slate-500 italic ml-auto">
                (Haz clic en cualquier punto del mapa para mover el marcador)
              </span>
            </div>

            {/* Contenedor del Mapa Leaflet */}
            <div className="h-80 w-full rounded-2xl overflow-hidden border-2 border-slate-200 relative shadow-inner z-0">
              <MapContainer
                center={[form.latitud, form.longitud]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizer />
                <MapLocationPicker
                  position={[form.latitud, form.longitud]}
                  onSelectLocation={(lat, lng) => {
                    updateForm('latitud', lat);
                    updateForm('longitud', lng);
                  }}
                />
              </MapContainer>
            </div>
          </div>
        )}

        {/* PASO 3: Localidades */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#0B1B3D] uppercase tracking-wider">
                  3. Localidades y Aforos
                </h3>
                <p className="text-xs text-slate-500">
                  Configura las zonas de acceso, precios de venta y aforo disponible.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddLocalidad}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
              >
                <FiPlus size={13} />
                <span>Agregar Zona</span>
              </button>
            </div>

            <div className="space-y-3">
              {localidades.map((loc, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Nombre de la Localidad
                    </label>
                    <input
                      type="text"
                      value={loc.nombre}
                      onChange={(e) => handleUpdateLocalidad(idx, 'nombre', e.target.value)}
                      placeholder="Ej: General / VIP / Balcón"
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none focus:border-brand"
                    />
                  </div>

                  <div className="w-full sm:w-36">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Precio (COP)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={loc.precio}
                      onChange={(e) => handleUpdateLocalidad(idx, 'precio', e.target.value)}
                      placeholder="50000"
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none focus:border-brand"
                    />
                  </div>

                  <div className="w-full sm:w-28">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Capacidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={loc.capacidad}
                      onChange={(e) => handleUpdateLocalidad(idx, 'capacidad', e.target.value)}
                      placeholder="100"
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none focus:border-brand"
                    />
                  </div>

                  <div className="self-end sm:self-center pt-2 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveLocalidad(idx)}
                      title="Eliminar localidad"
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 4: Imagen de Portada */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-black text-[#0B1B3D] uppercase tracking-wider">
                4. Imagen Oficial del Evento
              </h3>
              <p className="text-xs text-slate-500">
                Sube la imagen de portada que se mostrará en las cards de la cartelera y en el detalle del evento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="border-2 border-dashed border-slate-300 hover:border-brand rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand flex items-center justify-center mb-3">
                    <FiUpload size={22} />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mb-1">
                    Seleccionar imagen de portada
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Formatos JPG, PNG o WebP. Recomendado relación 16:9 de alta resolución.
                  </p>
                </label>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Vista Previa de la Portada
                </span>
                <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-xs">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Preview Portada"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-400 text-xs font-semibold">
                      <FiImage size={32} className="mx-auto mb-2 opacity-50" />
                      <span>Sin imagen seleccionada (se utilizará la portada cultural por defecto)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 5: Revisión y Confirmación */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-black text-[#0B1B3D] uppercase tracking-wider">
                5. Revisión Final de la Información
              </h3>
              <p className="text-xs text-slate-500">
                Verifica todos los datos antes de registrar el evento oficial en la cartelera.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-brand tracking-wider">
                    {selectedCategoryName}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-0.5">{form.titulo}</h4>
                </div>
                {fotoPreview && (
                  <img
                    src={fotoPreview}
                    alt="Miniatura"
                    className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                <p className="flex items-center gap-2">
                  <FiCalendar className="text-brand shrink-0" size={14} />
                  <span>
                    <strong>Fecha y hora:</strong> {form.fecha} a las {form.hora}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <FiMapPin className="text-rose-500 shrink-0" size={14} />
                  <span>
                    <strong>Lugar:</strong> {form.lugar}
                  </span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <p className="text-slate-600 line-clamp-2 italic">"{form.descripcion}"</p>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-900 block mb-2">
                  Localidades Configuradas ({localidades.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {localidades.map((loc, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
                    >
                      {loc.nombre}: <strong>{formatPrice(loc.precio)}</strong> ({loc.capacidad} cupos)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Botones de Navegación del Wizard */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (currentStep === 1 ? handleSafeBack() : setCurrentStep((s) => s - 1))}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            {currentStep === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-95"
            >
              Siguiente Paso →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isSubmitting && (
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              )}
              <span>Crear y Publicar Evento</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
        {/* Backdrop oscurecido al hacer clic afuera */}
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs transition-opacity cursor-pointer"
          onClick={handleSafeBack}
          aria-hidden="true"
        />

        {/* Panel lateral que se despliega desde la derecha (Ref: Tiimi) */}
        <div className="relative z-50 w-full sm:w-[620px] md:w-[680px] lg:w-[660px] xl:w-[720px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300">
          {wizardContent}
        </div>
      </div>
    );
  }

  return wizardContent;
}
