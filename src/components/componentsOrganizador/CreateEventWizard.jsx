import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
import {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showInfoAlert,
  showPendingRutAlert,
  showEventCreatedSuccess,
  showConfirmAlert,
} from '../../utils/alertUtils.js';
import { organizerService } from '../../services/organizerService.js';
import { formatPrice, formatHora23, formatHora12, formatFechaHora12, formatFecha } from '../../utils/formatters.js';
import StyledDatePicker from '../common/StyledDatePicker.jsx';
import { apiCache } from '../../services/cacheService.js';

const parseTourDate = (dateStr) => {
  const currentYear = new Date().getFullYear().toString();
  if (!dateStr) return { dayMonth: 'TBD', year: currentYear };
  try {
    const parts = dateStr.includes('T') ? dateStr.split('T')[0].split('-') : dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const monthName = months[monthIdx] || 'MES';
      return { dayMonth: `${day} ${monthName}`, year };
    }
  } catch (e) {
    // fallback
  }
  return { dayMonth: 'TBD', year: currentYear };
};

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
  { id: 1, label: '01 INFORMACIÓN' },
  { id: 2, label: '02 UBICACIÓN' },
  { id: 3, label: '03 LOCALIDADES' },
  { id: 4, label: '04 PORTADA' },
  { id: 5, label: '05 REVISIÓN' },
];

export default function CreateEventWizard({
  onBack,
  onSave,
  isDrawer = false,
  initialEvent = null,
  canSendEvents = false,
  orgSuspended = false,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const drawerPanelRef = useRef(null);
  const stepperRef = useRef(null);

  // Fecha mínima con siete días de anticipación
  const now = new Date();
  const todayStr = (() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  })();

  const minimumEventDate = (() => {
    const minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const y = minDate.getFullYear();
    const m = String(minDate.getMonth() + 1).padStart(2, '0');
    const d = String(minDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  })();

  // Formulario con los datos requeridos por el backend
  const [form, setForm] = useState({
    titulo: initialEvent?.titulo || initialEvent?.nombre || '',
    descripcion: initialEvent?.descripcion || '',
    categoriaId: initialEvent?.categoriaId || initialEvent?.categoria?.id || '',
    fecha: initialEvent?.fecha || '',
    hora: initialEvent?.hora ? formatHora23(initialEvent.hora) : '',
    lugar: initialEvent?.lugar || '',
    latitud: initialEvent?.latitud || 10.4236,
    longitud: initialEvent?.longitud || -75.5478,
  });
  useEffect(() => {
    if (!stepperRef.current) return undefined;
    const frame = requestAnimationFrame(() => {
      if (isDrawer && drawerPanelRef.current) {
        drawerPanelRef.current.scrollTo({
          top: Math.max(0, stepperRef.current.offsetTop - 16),
          behavior: 'smooth',
        });
      } else {
        stepperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [currentStep, isDrawer]);

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(
    initialEvent?.foto || initialEvent?.imagenUrl || null
  );

  const [localidades, setLocalidades] = useState(
    initialEvent?.localidades && initialEvent.localidades.length > 0
      ? initialEvent.localidades
      : []
  );

  const [dateTimeError, setDateTimeError] = useState(null);
  const photoInputRef = useRef(null);

  const selectedCategoryName = useMemo(() => {
    return categories.find((c) => String(c.id) === String(form.categoriaId))?.nombre || 'Categoría';
  }, [categories, form.categoriaId]);

  // Carga reactiva de los datos del evento al editar
  useEffect(() => {
    if (!initialEvent) return;

    let fechaClean = '';
    let horaClean = '';

    if (initialEvent.fecha) {
      if (typeof initialEvent.fecha === 'string' && initialEvent.fecha.includes('T')) {
        const [f, h] = initialEvent.fecha.split('T');
        fechaClean = f;
        horaClean = h ? h.substring(0, 5) : '';
      } else {
        fechaClean = initialEvent.fecha;
      }
    }

    if (initialEvent.hora) {
      horaClean = formatHora23(initialEvent.hora);
    }

    const catId =
      initialEvent.categoriaId ||
      initialEvent.categoria?.id ||
      (typeof initialEvent.categoria === 'number' ? initialEvent.categoria : '') ||
      '';

    setForm({
      titulo: initialEvent.titulo || initialEvent.nombre || '',
      descripcion: initialEvent.descripcion || '',
      categoriaId: String(catId || ''),
      fecha: fechaClean,
      hora: horaClean,
      lugar: initialEvent.lugar || initialEvent.direccion || '',
      latitud: Number(initialEvent.latitud) || 10.4236,
      longitud: Number(initialEvent.longitud) || -75.5478,
    });
    if (initialEvent.foto || initialEvent.imagenUrl || initialEvent.urlFoto) {
      setFotoPreview(initialEvent.foto || initialEvent.imagenUrl || initialEvent.urlFoto);
    }

    if (Array.isArray(initialEvent.localidades) && initialEvent.localidades.length > 0) {
      setLocalidades(
        initialEvent.localidades.map((loc) => ({
          id: loc.id,
          nombre: loc.nombre || loc.tipo || 'General',
          precio: Number(loc.precio ?? loc.price ?? 0),
          capacidad: Number(loc.capacidad ?? loc.cupos ?? loc.capacity ?? 100),
        }))
      );
    }
  }, [initialEvent]);

  const DEFAULT_CATEGORIES = [
    { id: 1, nombre: 'Música y Conciertos' },
    { id: 2, nombre: 'Arte y Cultura' },
    { id: 3, nombre: 'Gastronomía y Sabores' },
    { id: 4, nombre: 'Deportes y Bienestar' },
    { id: 5, nombre: 'Festivales y Tradición' },
    { id: 6, nombre: 'Teatro y Espectáculos' },
    { id: 7, nombre: 'Tecnología y Ferias' },
  ];

  // Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = typeof organizerService?.getCategorias === 'function'
          ? await organizerService.getCategorias()
          : null;
        const cats = Array.isArray(res) ? res : res?.content || res?.data || [];
        if (cats && cats.length > 0) {
          setCategories(cats);
          if (!form.categoriaId) {
            setForm((prev) => ({ ...prev, categoriaId: String(cats[0].id) }));
          }
          return;
        }
      } catch (err) {
        console.warn('Error cargando categorías del servidor:', err);
      }
      // Fallback si la API no responde o tarda demasiado
      setCategories(DEFAULT_CATEGORIES);
      setForm((prev) => ({
        ...prev,
        categoriaId: prev.categoriaId || String(DEFAULT_CATEGORIES[0].id),
      }));
    };

    fetchCategorias();
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
      localidades.length > (initialEvent?.localidades?.length || 0)
    );
  }, [form, fotoFile, localidades, initialEvent]);

  // Manejo de salida con advertencia SweetAlert para no perder el proceso
  const handleSafeBack = async () => {
    const confirmed = await showConfirmAlert({
      title: '¿Descartar proceso de creación?',
      text: '¿Estás seguro de que deseas salir de la mesa de montaje? Se perderá el proceso del evento y los datos no guardados.',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Continuar editando',
      isDanger: true,
    });
    if (confirmed) {
      onBack();
    }
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
        showWarningAlert({ title: 'Título requerido', text: 'Ingresa el nombre del evento.', badge: 'Campo Obligatorio' });
        return false;
      }
      if (!form.descripcion.trim()) {
        showWarningAlert({ title: 'Descripción requerida', text: 'Describe la experiencia del evento.', badge: 'Campo Obligatorio' });
        return false;
      }
      if (!form.categoriaId) {
        showWarningAlert({ title: 'Categoría requerida', text: 'Selecciona una categoría para clasificar tu evento.', badge: 'Campo Obligatorio' });
        return false;
      }
      if (!form.fecha) {
        showWarningAlert({ title: 'Fecha requerida', text: 'Indica la fecha en que se realizará el evento.', badge: 'Campo Obligatorio' });
        return false;
      }
      if (form.fecha < minimumEventDate) {
        showWarningAlert({
          title: 'Fecha inválida',
          text: 'Selecciona una fecha con al menos 7 días de anticipación.',
          badge: 'Fecha no permitida',
        });
        return false;
      }
      if (!form.hora) {
        showWarningAlert({ title: 'Hora requerida', text: 'Indica la hora de inicio del evento.', badge: 'Campo Obligatorio' });
        return false;
      }
    }

    if (currentStep === 2) {
      if (!form.lugar.trim()) {
        showWarningAlert({
          title: 'Nombre del lugar requerido',
          text: 'Por favor escribe el nombre del lugar donde se realizará el evento (ej: Plaza de la Aduana).',
          badge: 'Lugar Requerido',
        });
        return false;
      }
      if (!form.latitud || !form.longitud) {
        showWarningAlert({
          title: 'Ubicación en el mapa',
          text: 'Haz clic en el mapa para ubicar el punto del evento.',
          badge: 'Geolocalización',
        });
        return false;
      }
    }

    if (currentStep === 3) {
      if (localidades.length === 0) {
        showWarningAlert({ title: 'Localidades requeridas', text: 'Agrega al menos una localidad o zona para la venta de boletos.', badge: 'Localidades' });
        return false;
      }
      for (const loc of localidades) {
        if (!loc.nombre.trim()) {
          showWarningAlert({ title: 'Nombre de localidad', text: 'Todas las localidades deben tener un nombre definido.', badge: 'Datos Incompletos' });
          return false;
        }
        if (Number(loc.capacidad) <= 0) {
          showWarningAlert({ title: 'Capacidad inválida', text: 'La capacidad de cada localidad debe ser mayor a 0.', badge: 'Aforo Inválido' });
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
        hora: `${formatHora23(form.hora)}:00`,
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

      const isEditing = Boolean(initialEvent?.id || initialEvent?.eventoId);
      const rawTargetId = initialEvent?.id || initialEvent?.eventoId;
      const targetId =
        rawTargetId && typeof rawTargetId === 'object' ? rawTargetId.id : rawTargetId;

      let resultEvent;
      let finalEventId = targetId;

      if (isEditing) {
        resultEvent = await organizerService.editarEvento(targetId, formData);
        const currentStatus = String(initialEvent?.estado || initialEvent?.rawStatus || '').toUpperCase();
        const canResubmit = ['BORRADOR', 'EN_CORRECCION'].includes(currentStatus);
        if (canResubmit && canSendEvents && !orgSuspended) {
          try {
            const reviewResult = await organizerService.enviarRevision(targetId);
            resultEvent = {
              ...(resultEvent || {}),
              ...(reviewResult && typeof reviewResult === 'object' ? reviewResult : {}),
              estado: reviewResult?.estado || 'PENDIENTE_REVISION',
            };
            await showInfoAlert({
              title: 'Evento enviado a revisión',
              text: 'El evento se guardó y fue enviado a moderación.',
            });
          } catch (error) {
            await showErrorAlert({
              title: 'Cambios guardados como borrador',
              text: `No se pudo enviar el evento a revisión. Puedes reintentarlo desde Mis eventos. ${error.message || ''}`.trim(),
            });
          }
        } else {
          await showSuccessAlert({
            title: '¡Evento actualizado!',
            text: canResubmit
              ? orgSuspended
                ? 'Los cambios se guardaron como borrador. La organización está suspendida y no puede enviar eventos a revisión.'
                : 'Los cambios se guardaron como borrador. Carga el RUT de la organización para enviarlo a revisión.'
              : 'Las modificaciones del evento han sido guardadas exitosamente.',
          });
        }
      } else {
        resultEvent = await organizerService.crearEvento(formData);
        const rawEventId =
          resultEvent?.id ||
          resultEvent?.eventoId ||
          resultEvent?.data?.id ||
          resultEvent?.data?.eventoId;
        const eventoId = rawEventId && typeof rawEventId === 'object' ? rawEventId.id : rawEventId;
        finalEventId = eventoId;
        const failedLocalities = [];

        // Registrar localidades para el evento si hay ID
        if (!eventoId && localidades.length > 0) {
          failedLocalities.push(...localidades.map((localidad) => localidad.nombre));
        } else if (localidades.length > 0) {
          for (const loc of localidades) {
            try {
              await organizerService.agregarLocalidad(eventoId, {
                nombre: loc.nombre.trim(),
                precio: Number(loc.precio) || 0,
                capacidad: Number(loc.capacidad) || 1,
              });
            } catch (e) {
              console.warn('Error registrando localidad:', loc.nombre, e);
              failedLocalities.push(loc.nombre);
            }
          }
        }

        if (failedLocalities.length > 0) {
          await showErrorAlert({
            title: 'Evento creado con localidades pendientes',
            text: `El evento se creó, pero no se pudieron guardar estas localidades: ${failedLocalities.join(', ')}. Revisa el evento y vuelve a agregarlas.`,
            badge: 'Localidades pendientes',
          });
        } else if (orgSuspended) {
          await showInfoAlert({
            title: 'Borrador guardado',
            text: 'El evento se guardó como borrador. La organización está suspendida y no puede enviarlo a revisión.',
          });
        } else if (!canSendEvents) {
          await showPendingRutAlert();
        } else if (eventoId) {
          try {
            const reviewResult = await organizerService.enviarRevision(eventoId);
            resultEvent = {
              ...(resultEvent || {}),
              ...(reviewResult && typeof reviewResult === 'object' ? reviewResult : {}),
              estado: reviewResult?.estado || 'PENDIENTE_REVISION',
            };
            await showEventCreatedSuccess({
              eventTitle: form.titulo,
            });
          } catch (error) {
            await showErrorAlert({
              title: 'Borrador guardado',
              text: `El evento se creó, pero no se pudo enviar a revisión. Puedes reintentarlo desde Mis eventos. ${error.message || ''}`.trim(),
            });
          }
        } else {
          await showEventCreatedSuccess({
            eventTitle: form.titulo,
          });
        }
      }

      // Estructurar objeto completo del evento para actualizar registros en memoria de inmediato
      const rawData = resultEvent?.data || (typeof resultEvent === 'object' ? resultEvent : {});
      const totalCaps = localidades.reduce((acc, l) => acc + (Number(l.capacidad) || 0), 0);
      const fullSavedEvent = {
        id: finalEventId || rawData.id || Date.now(),
        eventoId: finalEventId || rawData.id || Date.now(),
        titulo: form.titulo,
        nombre: form.titulo,
        descripcion: form.descripcion,
        fecha: form.fecha,
        hora: form.hora,
        lugar: form.lugar,
        latitud: form.latitud,
        longitud: form.longitud,
        categoriaId: form.categoriaId,
        categoriaNombre: selectedCategoryName,
        categoria: { id: form.categoriaId, nombre: selectedCategoryName },
        foto: fotoPreview || rawData.foto || rawData.imagenUrl || null,
        imagenUrl: fotoPreview || rawData.foto || rawData.imagenUrl || null,
        estado: resultEvent?.estado || rawData.estado || (canSendEvents && !orgSuspended ? 'PENDIENTE_REVISION' : 'BORRADOR'),
        localidades: localidades,
        totalBoletas: totalCaps,
        boletasDisponibles: totalCaps,
        tieneBoletasDisponibles: totalCaps > 0,
        ...rawData,
      };

      // Invalidar cachés locales para que los paneles reflejen el evento recién creado
      apiCache.invalidate('event');
      apiCache.invalidate('org');

      if (onSave) onSave(fullSavedEvent);
    } catch (err) {
      console.error('Error al crear evento:', err);
      await showErrorAlert({
        title: 'Error al crear evento',
        text: err.message || 'No se pudo crear el evento. Revisa la información e intenta de nuevo.',
        badge: 'Creación Fallida',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const minPrice = useMemo(() => {
    if (!localidades || localidades.length === 0) return null;
    const validPrices = localidades
      .map((l) => Number(l.precio))
      .filter((p) => !isNaN(p) && p >= 0);
    return validPrices.length > 0 ? Math.min(...validPrices) : null;
  }, [localidades]);

  const totalCapacidad = useMemo(() => {
    if (!localidades || localidades.length === 0) return 0;
    return localidades.reduce((acc, l) => acc + (Number(l.capacidad) || 0), 0);
  }, [localidades]);

  const tourDate = useMemo(() => parseTourDate(form.fecha), [form.fecha]);

  const wizardContent = (
    <div className={`space-y-6 ${isDrawer ? 'p-6 sm:p-7' : ''}`}>
      {/* 1. Header Minimalista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64748B] block mb-0.5">
            Mesa de Montaje Editorial
          </span>
          <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F2342] tracking-tight uppercase">
            {initialEvent ? 'Edición de Producción' : 'Nueva Producción Cultural'}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleSafeBack}
          aria-label="Cerrar"
          title="Cerrar"
          className="w-8 h-8 rounded-[2px] border border-[#E2E8F0] bg-white hover:bg-slate-100 text-[#0F2342] flex items-center justify-center transition-colors shadow-2xs self-start sm:self-auto cursor-pointer shrink-0"
        >
          <FiX size={16} />
        </button>
      </div>

      {/* 2. Stepper Arquitectónico de 5 Segmentos Iguales (Verde al completar, Dorado en activo) */}
      <div ref={stepperRef} className="border-b border-[#E2E8F0] pb-2 bg-white scroll-mt-4">
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {STEPS.map((s) => {
            const isCompleted = s.id < currentStep;
            const isCurrent = s.id === currentStep;
            return (
              <div
                key={s.id}
                className={`pb-2.5 transition-all text-center sm:text-left ${
                  isCurrent
                    ? 'border-b-[3px] border-[#F5B800]'
                    : isCompleted
                    ? 'border-b-[3px] border-emerald-500'
                    : 'border-b-[3px] border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  {isCompleted && (
                    <FiCheck size={12} className="text-emerald-600 shrink-0" />
                  )}
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800] shrink-0" />
                  )}
                  <span
                    className={`font-mono text-[10px] sm:text-xs uppercase tracking-wider block font-bold truncate ${
                      isCurrent
                        ? 'text-[#0F2342]'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Split Layout: Preview Boleto Físico Izquierda + Formulario Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* COLUMNA IZQUIERDA: Vista Previa en Vivo (Boleto Coleccionable) */}
        <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-4 z-10 space-y-3">
          <div className="flex items-center justify-between px-1 border-b border-[#E2E8F0] pb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#0F2342] font-bold">
              Boleto Coleccionable
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                En vivo
              </span>
            </div>
          </div>

          {/* Tarjeta Boleto Coleccionable Horizontal idéntica a Cartelera */}
          <article className="group relative rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden flex flex-col items-stretch select-none">
            {/* Sección Superior: Póster Oficial a Color (110px x 130px) + Metadatos */}
            <div className="flex flex-col sm:flex-row items-stretch border-b border-[#E2E8F0]">
              <div className="w-full sm:w-[110px] h-36 sm:h-[130px] shrink-0 bg-[#0F2342] overflow-hidden relative group/img border-b sm:border-b-0 sm:border-r border-[#E2E8F0]">
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt={form.titulo || 'Portada del evento'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F2342] text-white p-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#F5B800]">PASS</span>
                    <span className="font-display font-black text-xl mt-0.5">
                      {(form.titulo?.trim() || 'EV').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Botón rápido para subir/cambiar foto */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  title="Subir imagen"
                  className="absolute inset-0 bg-[#0F2342]/75 text-white font-mono text-[10px] uppercase font-bold flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                >
                  {fotoPreview ? 'Cambiar Foto' : 'Subir Foto'}
                </button>
              </div>

              {/* Sección Central: Metadatos Editoriales y Título */}
              <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B] font-medium truncate">
                    {(form.lugar?.trim() || 'CARTAGENA').toUpperCase()} • {selectedCategoryName.toUpperCase()}
                  </span>
                  <span className="font-mono text-[9px] tracking-wider text-[#94A3B8] uppercase">
                    BORRADOR
                  </span>
                </div>

                <h3 className="font-display font-black text-base sm:text-lg text-[#0F2342] uppercase tracking-tight line-clamp-2 leading-tight my-1">
                  {form.titulo?.trim() || 'NOMBRE DEL EVENTO'}
                </h3>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-1.5 border-t border-[#F1F5F9]">
                  <span>{minPrice !== null ? `Desde ${formatPrice(minPrice)}` : 'Precio a definir'}</span>
                  <span>{totalCapacidad > 0 ? `${totalCapacidad} cupos` : 'Sin cupos'}</span>
                </div>
              </div>
            </div>

            {/* Perforación de corte y stub inferior */}
            <div className="p-3 bg-[#FAFAFA] flex items-center justify-between font-mono text-xs text-[#0F2342]">
              <div className="flex items-center gap-2">
                <div className="font-display font-black text-sm uppercase">
                  {tourDate.dayMonth}
                </div>
                <div className="text-[10px] text-[#64748B]">
                  {tourDate.year} {form.hora ? `• ${formatHora12(form.hora)}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  {localidades.length > 0 ? `${localidades.length} LOCALIDADES` : '0 LOCALIDADES'}
                </span>
              </div>
            </div>
          </article>

          {/* Resumen tipográfico editorial */}
          <div className="p-3 border border-[#E2E8F0] rounded-[2px] bg-white text-xs font-mono text-[#64748B] space-y-1">
            <div className="flex justify-between text-[10px] uppercase">
              <span>Coordenadas GPS</span>
              <span className="text-[#0F2342]">{form.latitud.toFixed(4)}, {form.longitud.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase border-t border-[#F1F5F9] pt-1">
              <span>Fecha Límite</span>
              <span className="text-[#0F2342]">{form.fecha ? formatFecha(form.fecha) : 'Por definir'}</span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Pasos del Formulario */}
        <div className="lg:col-span-7 xl:col-span-7 bg-white rounded-[2px] border border-[#E2E8F0] p-6 sm:p-7 shadow-xs">
        {/* PASO 1: Información Básica */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-black text-[#0B1B3D] uppercase tracking-wider">
                1. Información Básica
              </h3>
              
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => updateForm('titulo', e.target.value)}
                  placeholder="Ej: Festival Internacional de Música de Cartagena"
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-white outline-none focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/25 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    Categoría *
                  </label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) => updateForm('categoriaId', e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-white outline-none focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/25 transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <StyledDatePicker
                    id="fecha"
                    name="fecha"
                    label="Fecha"
                    required
                    value={form.fecha}
                    minDate={minimumEventDate}
                    variant="light"
                    onChange={(e) => updateForm('fecha', e.target.value)}
                    helperText="Selecciona una fecha con al menos 7 días de anticipación."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    Hora de Inicio *
                  </label>
                  <input
                    type="time"
                    aria-label="Hora de inicio"
                    value={form.hora}
                    onChange={(e) => updateForm('hora', e.target.value)}
                    step="60"
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-white text-slate-800 outline-none focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/25 transition-all cursor-pointer"
                    style={{ colorScheme: 'light' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  Descripción del Evento *
                </label>
                <textarea
                  rows={4}
                  value={form.descripcion}
                  onChange={(e) => updateForm('descripcion', e.target.value)}
                  placeholder="Detalla los artistas participantes, la agenda cultural, recomendaciones de acceso y requisitos de ingreso."
                  className="w-full text-xs font-medium px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-white outline-none focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/25 transition-all resize-none leading-relaxed"
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
              
            </div>

            {/* Campo Manual: Nombre del Lugar */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                Nombre del Lugar *
              </label>
              <input
                type="text"
                value={form.lugar}
                onChange={(e) => updateForm('lugar', e.target.value)}
                placeholder="Ej: Plaza de la Aduana, Centro Histórico / Teatro Adolfo Mejía"
                className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-white outline-none focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/25 transition-all"
                required
              />
            </div>

            {/* Contenedor del Mapa Leaflet */}
            <div className="h-80 w-full rounded-[2px] overflow-hidden border border-[#E2E8F0] relative shadow-inner z-0">
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
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64748B] block mb-0.5">
                  Boletaje y Capacidad
                </span>
                <h3 className="text-base font-black text-[#0F2342] uppercase tracking-wider font-display">
                  03. Localidades y Aforos
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddLocalidad}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[2px] bg-[#0F2342] hover:bg-[#1B365D] text-white hover:text-[#F5B800] font-mono text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
              >
                <FiPlus size={13} className="text-[#F5B800]" />
                <span>Agregar Zona</span>
              </button>
            </div>

            <div className="space-y-3">
              {localidades.length === 0 && (
                <p className="rounded-[2px] border border-dashed border-[#CBD5E1] bg-[#FAFAFA] px-4 py-8 text-center text-xs font-mono text-[#64748B]">
                  No hay localidades preconfiguradas. Agrega únicamente las zonas que quieras ofrecer en cartelera.
                </p>
              )}
              {localidades.map((loc, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#FAFAFA] border border-[#E2E8F0] rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-[10px] font-bold uppercase font-mono text-slate-500 mb-1">
                      Nombre de la Localidad
                    </label>
                    <input
                      type="text"
                      value={loc.nombre}
                      onChange={(e) => handleUpdateLocalidad(idx, 'nombre', e.target.value)}
                      placeholder="Ej: General / VIP / Balcón"
                      className="w-full text-xs font-semibold px-3 py-2 rounded-[2px] border border-[#E2E8F0] bg-white outline-none focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/25"
                    />
                  </div>

                  <div className="w-full sm:w-36">
                    <label className="block text-[10px] font-bold uppercase font-mono text-slate-500 mb-1">
                      Precio (COP)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={loc.precio}
                      onChange={(e) => handleUpdateLocalidad(idx, 'precio', e.target.value)}
                      placeholder="50000"
                      className="w-full text-xs font-semibold px-3 py-2 rounded-[2px] border border-[#E2E8F0] bg-white outline-none focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/25 text-[#0F2342] font-bold"
                    />
                  </div>

                  <div className="w-full sm:w-28">
                    <label className="block text-[10px] font-bold uppercase font-mono text-slate-500 mb-1">
                      Capacidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={loc.capacidad}
                      onChange={(e) => handleUpdateLocalidad(idx, 'capacidad', e.target.value)}
                      placeholder="100"
                      className="w-full text-xs font-semibold px-3 py-2 rounded-[2px] border border-[#E2E8F0] bg-white outline-none focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/25"
                    />
                  </div>

                  <div className="self-end sm:self-center pt-2 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveLocalidad(idx)}
                      title="Eliminar localidad"
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-[2px] transition-colors cursor-pointer"
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
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64748B] block mb-0.5">
                Cartel Oficial
              </span>
              <h3 className="text-base font-black text-[#0F2342] uppercase tracking-wider font-display">
                04. Imagen Oficial del Evento
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="border-2 border-dashed border-[#CBD5E1] hover:border-[#F5B800] rounded-[2px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#FAFAFA] hover:bg-[#FFFFFF] block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-[2px] bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-200">
                    <FiUpload size={22} className="text-[#F5B800]" />
                  </div>
                  <h4 className="font-bold text-xs text-[#0F2342] mb-1 font-mono uppercase tracking-wider">
                    Seleccionar imagen de portada
                  </h4>
                  <p className="text-[11px] text-[#64748B] max-w-xs font-mono">
                    Formatos JPG, PNG o WebP. Recomendado relación 16:9 de alta resolución.
                  </p>
                </label>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block mb-2 font-mono">
                  Vista Previa de la Portada
                </span>
                <div className="aspect-[16/9] rounded-[2px] overflow-hidden border border-[#E2E8F0] bg-slate-100 flex items-center justify-center shadow-xs">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Preview Portada"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-400 text-xs font-mono">
                      <FiImage size={32} className="mx-auto mb-2 opacity-50 text-amber-500" />
                      <span>Sin imagen seleccionada (se utilizará la portada cultural por defecto)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 5: Revisión y Confirmación Editorial */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64748B] block mb-1">
                Ficha Técnica de Producción
              </span>
              <h3 className="font-display font-black text-lg text-[#0F2342] uppercase tracking-tight">
                05. Verificación de Cartelera
              </h3>
            </div>

            {/* Boleto Coleccionable Completo */}
            <article className="rounded-[2px] border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
              <div className="flex flex-col sm:flex-row items-stretch border-b border-[#E2E8F0]">
                <div className="w-full sm:w-[130px] h-40 sm:h-[140px] shrink-0 bg-[#0F2342] overflow-hidden border-b sm:border-b-0 sm:border-r border-[#E2E8F0]">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt={form.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-2">
                      <span className="font-mono text-[9px] text-[#F5B800] uppercase tracking-widest">PASS</span>
                      <span className="font-display font-black text-2xl mt-0.5">
                        {(form.titulo || 'EV').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-[#64748B]">
                      {(form.lugar || 'CARTAGENA').toUpperCase()} • {selectedCategoryName.toUpperCase()}
                    </span>
                    <span className="font-mono text-[9px] text-[#94A3B8]">LISTO PARA REVISIÓN</span>
                  </div>

                  <h4 className="font-display font-black text-lg text-[#0F2342] uppercase tracking-tight line-clamp-2 my-1">
                    {form.titulo || 'Nombre de la producción'}
                  </h4>

                  <div className="flex items-center justify-between text-xs font-mono text-[#64748B] pt-2 border-t border-[#F1F5F9]">
                    <span>{minPrice !== null ? `Desde ${formatPrice(minPrice)}` : 'Precio a definir'}</span>
                    <span>{totalCapacidad} cupos totales</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#FAFAFA] flex items-center justify-between font-mono text-xs text-[#0F2342]">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-sm uppercase">{tourDate.dayMonth}</span>
                  <span className="text-[10px] text-[#64748B]">{tourDate.year} {form.hora ? `• ${formatHora12(form.hora)}` : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
                  <span className="text-[10px] uppercase font-bold">{localidades.length} ZONAS CONFIGURADAS</span>
                </div>
              </div>
            </article>

            {/* Resumen de producción dividido por filetes de 1px */}
            <div className="border border-[#E2E8F0] rounded-[2px] bg-white p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                <span className="text-[#64748B] uppercase text-[10px]">Categoría Oficial</span>
                <span className="text-[#0F2342] font-bold">{selectedCategoryName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                <span className="text-[#64748B] uppercase text-[10px]">Lugar & Recinto</span>
                <span className="text-[#0F2342] font-semibold">{form.lugar}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                <span className="text-[#64748B] uppercase text-[10px]">Coordenadas GPS</span>
                <span className="text-[#0F2342]">{form.latitud.toFixed(4)}, {form.longitud.toFixed(4)}</span>
              </div>
              {form.descripcion && (
                <div className="pt-1">
                  <span className="text-[#64748B] uppercase text-[10px] block mb-1">Sinopsis</span>
                  <p className="text-[#334155] font-sans text-xs italic leading-relaxed">"{form.descripcion}"</p>
                </div>
              )}
            </div>

            {/* Tabla Limpia de Localidades */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#0F2342] font-bold block">
                Zonas de Boletaje y Capacidad ({localidades.length})
              </span>
              <div className="border border-[#E2E8F0] rounded-[2px] overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#FAFAFA] border-b border-[#E2E8F0] text-[10px] uppercase text-[#64748B]">
                    <tr>
                      <th className="py-2 px-3">Localidad</th>
                      <th className="py-2 px-3">Precio Unitario</th>
                      <th className="py-2 px-3 text-right">Cupos / Capacidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] bg-white">
                    {localidades.map((loc, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-semibold text-[#0F2342]">{loc.nombre}</td>
                        <td className="py-2 px-3 font-bold text-[#0F2342]">{formatPrice(loc.precio)}</td>
                        <td className="py-2 px-3 text-right text-[#64748B]">{loc.capacidad} cupos</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. Botones de Navegación del Wizard */}
        <div className="mt-8 pt-5 border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            type="button"
            onClick={() => (currentStep === 1 ? handleSafeBack() : setCurrentStep((s) => s - 1))}
            className="px-5 py-2.5 rounded-[2px] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F2342] hover:bg-slate-50 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            {currentStep === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#1B365D] text-white hover:text-[#F5B800] font-mono text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
            >
              Siguiente Paso →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-7 py-3 rounded-[2px] bg-[#0F2342] hover:bg-[#1B365D] text-white hover:text-[#F5B800] font-mono text-xs font-bold uppercase tracking-wider shadow-xs transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer active:scale-98"
            >
              {isSubmitting && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>LANZAR EVENTO A CARTELERA</span>
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );

  if (isDrawer) {
    const drawerNode = (
      <div className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200">
        {/* Backdrop oscurecido al hacer clic afuera */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity cursor-pointer"
          onClick={handleSafeBack}
          aria-hidden="true"
        />

        {/* Panel lateral que se despliega desde la derecha (Ref: Luma / EventHive) */}
        <div
          ref={drawerPanelRef}
          data-lenis-prevent="true"
          className="relative z-50 w-full sm:w-[680px] md:w-[840px] lg:w-[1060px] xl:w-[1240px] 2xl:w-[1360px] max-w-[98vw] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300"
        >
          {wizardContent}
        </div>
      </div>
    );
    return typeof document !== 'undefined' ? createPortal(drawerNode, document.body) : drawerNode;
  }

  return wizardContent;
}
