import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Sparkles,
  Save,
  Trash2,
  RefreshCw,
  ExternalLink,
  Layers,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import bannerService from '../../services/bannerService.js';
import BannerPreviewCard from '../../components/componentsAdmin/BannerPreviewCard.jsx';

export default function MarketingBannersView() {
  const [banners, setBanners] = useState([
    {
      id: null,
      posicion: 1,
      titulo: 'Promociona tu evento en EventHive',
      imagenUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
      textoBoton: 'Conocer Planes',
      enlaceUrl: '/organizadores',
    },
    {
      id: null,
      posicion: 2,
      titulo: 'Descubre los mejores festivales de Cartagena',
      imagenUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      textoBoton: 'Explorar Cartelera',
      enlaceUrl: '/buscar',
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [savingPos, setSavingPos] = useState(null);
  const [activePos, setActivePos] = useState(1);

  // Cargar banners reales desde el backend (GET /api/banners-home/admin)
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bannerService.getAdminBanners();
      if (Array.isArray(data) && data.length > 0) {
        setBanners((prev) =>
          prev.map((slot) => {
            const found = data.find((b) => Number(b.posicion) === Number(slot.posicion));
            return found && found.titulo ? found : slot;
          })
        );
      }
    } catch (err) {
      console.warn('Error al cargar banners administrativos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleFieldChange = (posicion, field, value) => {
    setBanners((prev) =>
      prev.map((b) => (b.posicion === posicion ? { ...b, [field]: value } : b))
    );
  };

  const handleSaveBanner = async (posicion) => {
    const banner = banners.find((b) => b.posicion === posicion);
    if (!banner) return;

    if (!banner.titulo?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Título requerido',
        text: 'Por favor ingresa un título para el banner promocional.',
      });
      return;
    }

    if (!banner.imagenUrl?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Imagen requerida',
        text: 'Por favor ingresa la URL de la imagen del banner.',
      });
      return;
    }

    try {
      setSavingPos(posicion);
      await bannerService.saveBanner(posicion, banner);

      Swal.fire({
        icon: 'success',
        title: `Banner #${posicion} guardado`,
        text: 'El banner ha sido actualizado y ya está visible en la app.',
        confirmButtonColor: '#0f172a',
        timer: 2000,
      });

      await fetchBanners();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err?.message || 'No se pudo guardar el banner en este momento.',
      });
    } finally {
      setSavingPos(null);
    }
  };

  const handleDeleteBanner = async (posicion) => {
    const confirmRes = await Swal.fire({
      icon: 'warning',
      title: `¿Eliminar Banner #${posicion}?`,
      text: 'Este espacio promocional quedará vacío en la página de inicio.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
    });

    if (!confirmRes.isConfirmed) return;

    try {
      setSavingPos(posicion);
      await bannerService.deleteBanner(posicion);

      Swal.fire({
        icon: 'success',
        title: 'Banner eliminado',
        text: `El espacio #${posicion} ha sido liberado correctamente.`,
        timer: 1500,
        showConfirmButton: false,
      });

      // Limpiar campos localmente
      setBanners((prev) =>
        prev.map((b) =>
          b.posicion === posicion
            ? { ...b, id: null, titulo: '', imagenUrl: '', textoBoton: 'Ver más', enlaceUrl: '' }
            : b
        )
      );

      await fetchBanners();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: err?.message || 'No se pudo eliminar el banner.',
      });
    } finally {
      setSavingPos(null);
    }
  };

  const activeBanner = banners.find((b) => b.posicion === activePos) || banners[0];

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2">
            <Image className="w-6 h-6 text-amber-500" />
            Gestión de Banners del Home
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configura y actualiza los banners promocionales oficiales de EventHive (Posiciones #1 y #2).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchBanners}
            title="Recargar datos"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Selector de Posición 1 o 2 */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs w-fit">
        {[1, 2].map((pos) => {
          const isSelected = activePos === pos;
          const currentB = banners.find((b) => b.posicion === pos);
          const hasContent = Boolean(currentB?.titulo?.trim());

          return (
            <button
              key={pos}
              type="button"
              onClick={() => setActivePos(pos)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers size={14} />
              <span>Espacio Promocional #{pos}</span>
              {hasContent && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Activo" />
              )}
            </button>
          );
        })}
      </div>

      {/* Editor & Preview en 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Formulario de Configuración */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Configuración del Banner #{activePos}
              </h3>
              <p className="text-xs text-slate-400">
                Los cambios se reflejarán instantáneamente en la previsualización
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-black text-[11px] uppercase tracking-wider">
              Posición {activePos}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Título del Banner <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={activeBanner.titulo}
                onChange={(e) => handleFieldChange(activePos, 'titulo', e.target.value)}
                placeholder="Ej. Vive el Festival de Música de Cartagena"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm text-slate-800 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                URL de Imagen de Fondo <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={activeBanner.imagenUrl}
                onChange={(e) => handleFieldChange(activePos, 'imagenUrl', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm text-slate-800 transition-all outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Recomendado: proporción horizontal 16:9 o 21:9 de alta resolución.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Texto del Botón CTA
                </label>
                <input
                  type="text"
                  value={activeBanner.textoBoton}
                  onChange={(e) => handleFieldChange(activePos, 'textoBoton', e.target.value)}
                  placeholder="Ej. Ver Entradas / Conocer Más"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Enlace de Redirección (URL)
                </label>
                <input
                  type="text"
                  value={activeBanner.enlaceUrl}
                  onChange={(e) => handleFieldChange(activePos, 'enlaceUrl', e.target.value)}
                  placeholder="Ej. /eventos/15 o /buscar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleDeleteBanner(activePos)}
              disabled={savingPos === activePos}
              className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Vaciar Posición</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveBanner(activePos)}
              disabled={savingPos === activePos}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <Save size={14} />
              <span>{savingPos === activePos ? 'Guardando...' : 'Publicar Banner'}</span>
            </button>
          </div>
        </div>

        {/* Columna Derecha: Previsualización en Vivo */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Previsualización en Vivo de la App
              </span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Posición #{activePos}
              </span>
            </div>

            {/* Render de Tarjeta de Previsualización */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-end p-6 text-white group">
              {activeBanner.imagenUrl ? (
                <img
                  src={activeBanner.imagenUrl}
                  alt={activeBanner.titulo}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
                  <span className="text-white/20 font-bold text-lg">Sin Imagen de Fondo</span>
                </div>
              )}

              {/* Degradados de contraste */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Banner #{activePos} • EventHive
                </span>
                <h4 className="text-lg sm:text-xl font-black text-white line-clamp-2 leading-tight">
                  {activeBanner.titulo || 'Título del Banner Promocional'}
                </h4>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
                    <span>{activeBanner.textoBoton || 'Ver más'}</span>
                    <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Este banner se mostrará en los espacios oficiales de la página de inicio para visitantes y usuarios registrados.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
