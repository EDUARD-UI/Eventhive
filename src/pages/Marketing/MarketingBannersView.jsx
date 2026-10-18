import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Sparkles,
  Save,
  Trash2,
  RefreshCw,
  ExternalLink,
  X,
  AlertCircle,
  HelpCircle,
  Edit3,
} from 'lucide-react';
import { FiArrowRight, FiEdit2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import bannerService from '../../services/bannerService.js';
import ImageWithFallback from '../../components/common/ImageWithFallback.jsx';

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

  // Modal drawer a la derecha para modificar el banner
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formError, setFormError] = useState(null);

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

  const handleOpenEditDrawer = (banner) => {
    setEditingBanner({ ...banner });
    setFormError(null);
    setDrawerOpen(true);
  };

  const handleFieldChange = (field, value) => {
    setEditingBanner((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveBanner = async (e) => {
    if (e) e.preventDefault();
    if (!editingBanner) return;

    if (!editingBanner.imagenUrl?.trim()) {
      setFormError('Por favor ingresa la URL de la imagen del banner.');
      return;
    }

    const posicion = editingBanner.posicion;

    try {
      setSavingPos(posicion);
      setFormError(null);
      await bannerService.saveBanner(posicion, editingBanner);

      // Actualizar estado local
      setBanners((prev) =>
        prev.map((b) => (b.posicion === posicion ? { ...editingBanner } : b))
      );

      Swal.fire({
        icon: 'success',
        title: '¡Banner guardado!',
        text: 'El banner ha sido actualizado y ya está visible en la página de inicio.',
        confirmButtonColor: '#0f172a',
        timer: 2000,
      });

      setDrawerOpen(false);
      await fetchBanners();
    } catch (err) {
      setFormError(err?.message || 'No se pudo guardar el banner en este momento.');
    } finally {
      setSavingPos(null);
    }
  };

  const handleDeleteBanner = async () => {
    if (!editingBanner) return;
    const posicion = editingBanner.posicion;

    const confirmRes = await Swal.fire({
      icon: 'warning',
      title: '¿Vaciar este banner?',
      text: 'Este espacio promocional quedará vacío en la página de inicio.',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
    });

    if (!confirmRes.isConfirmed) return;

    try {
      setSavingPos(posicion);
      await bannerService.deleteBanner(posicion);

      Swal.fire({
        icon: 'success',
        title: 'Banner vaciado',
        text: 'El espacio ha sido liberado correctamente.',
        timer: 1500,
        showConfirmButton: false,
      });

      const emptyBanner = {
        ...editingBanner,
        id: null,
        titulo: '',
        imagenUrl: '',
        textoBoton: 'Ver más',
        enlaceUrl: '',
      };

      setBanners((prev) =>
        prev.map((b) => (b.posicion === posicion ? emptyBanner : b))
      );

      setDrawerOpen(false);
      await fetchBanners();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al vaciar',
        text: err?.message || 'No se pudo vaciar el banner.',
      });
    } finally {
      setSavingPos(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2">
            <Image className="w-6 h-6 text-amber-500" />
            <span>Banners del Home</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualización y personalización de los banners promocionales oficiales de la página de inicio.
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

      {/* Grid de Banners con estilo fiel al Home pero más compactos */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs font-medium bg-white rounded-3xl border border-slate-200/80">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
          Cargando banners del home...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {banners.map((banner, index) => {
            const hasImage = Boolean(banner.imagenUrl?.trim());
            const hasTitle = Boolean(banner.titulo?.trim());

            return (
              <div
                key={banner.posicion || index}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 w-full bg-slate-900 flex flex-col justify-between"
              >
                {/* Marco de Imagen compacto pero sin espacios faltantes ni sobrantes */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[200px] overflow-hidden bg-slate-950">
                  {hasImage ? (
                    <ImageWithFallback
                      src={banner.imagenUrl}
                      alt={banner.titulo || 'Banner Home'}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      fallbackText={banner.titulo || 'Banner'}
                      iconSize={32}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0D1527] flex items-center justify-center text-slate-500 text-xs font-medium">
                      Sin imagen asignada
                    </div>
                  )}

                  {/* Degradado para nitidez del texto y botón */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

                  {/* Botón flotante para Modificar en el Modal Derecho */}
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDrawer(banner)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-black text-amber-300 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <FiEdit2 size={13} />
                      <span>Modificar</span>
                    </button>
                  </div>

                  {/* Contenido textual inferior y botón como en el Home */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 z-10 pointer-events-none">
                    <h3 className="font-extrabold text-white text-base sm:text-lg lg:text-xl leading-snug tracking-tight uppercase mb-3 max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2">
                      {hasTitle ? banner.titulo : 'Espacio de Banner Disponible'}
                    </h3>

                    {banner.textoBoton && (
                      <div>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                          <span>{banner.textoBoton}</span>
                          <FiArrowRight size={13} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DRAWER MODAL A LA DERECHA: MODIFICAR BANNER */}
      {drawerOpen && editingBanner && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop con desenfoque suave */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Panel Lateral Deslizante */}
          <div
            className="relative z-50 w-full sm:w-[500px] md:w-[540px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Cabecera del Drawer */}
              <div className="bg-[#131b2e] p-6 text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Image size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white leading-tight">
                      Modificar Banner Promocional
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Configura el contenido y el enlace de redirección del banner
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contenido del Formulario */}
              <form id="banner-drawer-form" onSubmit={handleSaveBanner} className="p-6 space-y-5">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Previsualización en Tiempo Real dentro del Drawer */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Previsualización en tiempo real
                  </label>
                  <div className="relative w-full h-[160px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex flex-col justify-end p-4">
                    {editingBanner.imagenUrl ? (
                      <img
                        src={editingBanner.imagenUrl}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                      <h4 className="font-bold text-white text-xs sm:text-sm uppercase line-clamp-1 drop-shadow-md">
                        {editingBanner.titulo || 'Título del Banner'}
                      </h4>
                      {editingBanner.textoBoton && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                            <span>{editingBanner.textoBoton}</span>
                            <FiArrowRight size={10} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Título del Banner */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Título del Banner <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={editingBanner.titulo || ''}
                    onChange={(e) => handleFieldChange('titulo', e.target.value)}
                    placeholder="Ej. Vive el Festival de Música de Cartagena"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                  />
                </div>

                {/* URL de Imagen */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    URL de Imagen de Fondo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={editingBanner.imagenUrl || ''}
                    onChange={(e) => handleFieldChange('imagenUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Imagen de alta calidad en formato horizontal para encajar perfectamente en el recuadro.
                  </p>
                </div>

                {/* Texto del Botón CTA y Enlace */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Texto del Botón CTA
                    </label>
                    <input
                      type="text"
                      value={editingBanner.textoBoton || ''}
                      onChange={(e) => handleFieldChange('textoBoton', e.target.value)}
                      placeholder="Ej. Ver Entradas / Conocer Más"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Enlace de Redirección (URL)
                    </label>
                    <input
                      type="text"
                      value={editingBanner.enlaceUrl || ''}
                      onChange={(e) => handleFieldChange('enlaceUrl', e.target.value)}
                      placeholder="Ej. /eventos/15 o /buscar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Al guardar, los cambios se publicarán inmediatamente en el Home para todos los visitantes y usuarios.
                  </span>
                </div>
              </form>
            </div>

            {/* Footer con Acciones */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDeleteBanner}
                disabled={savingPos !== null}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Vaciar</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  disabled={savingPos !== null}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  form="banner-drawer-form"
                  disabled={savingPos !== null}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{savingPos !== null ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
