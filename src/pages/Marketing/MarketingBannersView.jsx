import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiArrowRight,
  FiEdit3,
  FiRefreshCw,
  FiTrash2,
  FiX,
  FiUpload,
  FiAlertCircle,
  FiExternalLink,
  FiCheck,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import bannerService from '../../services/bannerService.js';
import { getOptionalBannerTitle } from '../../utils/bannerTitle.js';

export default function MarketingBannersView() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPos, setSavingPos] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Modal drawer a la derecha para modificar el banner
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [formError, setFormError] = useState(null);
  const fileInputRef = useRef(null);

  // Cargar banners reales desde el backend (GET /api/banners-home/admin)
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await bannerService.getAdminBanners();
      if (Array.isArray(data) && data.length > 0) {
        setBanners(
          [1, 2].map((pos) => {
            const found = data.find((b) => Number(b.posicion) === Number(pos));
            return (
              found || {
                id: null,
                posicion: pos,
                titulo: '',
                imagenUrl: '',
                textoBoton: '',
                enlaceUrl: '',
              }
            );
          })
        );
      } else {
        setBanners([
          { id: null, posicion: 1, titulo: '', imagenUrl: '', textoBoton: '', enlaceUrl: '' },
          { id: null, posicion: 2, titulo: '', imagenUrl: '', textoBoton: '', enlaceUrl: '' },
        ]);
      }
    } catch (err) {
      setLoadError(err?.message || 'No se pudieron cargar los espacios publicitarios.');
      setBanners([
        { id: null, posicion: 1, titulo: '', imagenUrl: '', textoBoton: '', enlaceUrl: '' },
        { id: null, posicion: 2, titulo: '', imagenUrl: '', textoBoton: '', enlaceUrl: '' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && drawerOpen && !savingPos) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, savingPos]);

  const handleOpenEditDrawer = (banner) => {
    setEditingBanner({ ...banner });
    setSelectedFile(null);
    setFilePreview(banner.imagenUrl || null);
    setFormError(null);
    setDrawerOpen(true);
  };

  const handleFieldChange = (field, value) => {
    setEditingBanner((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFormError('Formato de imagen no válido. Solo se permiten archivos JPG, PNG o WEBP.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFormError('La imagen seleccionada supera el límite máximo permitido de 5 MB.');
      return;
    }

    setFormError(null);
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
    setEditingBanner((prev) => (prev ? { ...prev, imagenUrl: previewUrl } : prev));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setEditingBanner((prev) => (prev ? { ...prev, imagenUrl: '' } : prev));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveBanner = async (e) => {
    if (e) e.preventDefault();
    if (!editingBanner) return;

    if (!selectedFile && !editingBanner.imagenUrl?.trim()) {
      setFormError('Por favor selecciona una pieza gráfica para el banner.');
      return;
    }

    const posicion = editingBanner.posicion;

    try {
      setSavingPos(posicion);
      setFormError(null);

      const payload = {
        ...editingBanner,
        imagenFile: selectedFile || undefined,
      };

      await bannerService.saveBanner(posicion, payload);

      Swal.fire({
        icon: 'success',
        title: 'Pieza de difusión guardada',
        text: 'El banner ha sido actualizado y se exhibe en la portada pública.',
        confirmButtonColor: '#0F2342',
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
      title: '¿Vaciar este espacio de exhibición?',
      text: 'El slot publicitario quedará desocupado en la portada principal de Event Hive.',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar slot',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0F2342',
      cancelButtonColor: '#64748B',
    });

    if (!confirmRes.isConfirmed) return;

    try {
      setSavingPos(posicion);
      await bannerService.deleteBanner(posicion);

      Swal.fire({
        icon: 'success',
        title: 'Espacio desocupado',
        text: 'El slot publicitario ha sido liberado correctamente.',
        timer: 1600,
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
        text: err?.message || 'No se pudo vaciar el espacio.',
        confirmButtonColor: '#0F2342',
      });
    } finally {
      setSavingPos(null);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* A. Cabecera Editorial */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
            ESPACIOS PUBLICITARIOS
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
            Gestiona las piezas gráficas principales que se exhiben en la portada pública de Event Hive.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={fetchBanners}
            title="Recargar datos"
            className="p-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#64748B] hover:text-[#0F2342] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
          >
            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loadError && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-xs font-mono text-amber-900 rounded-[2px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle size={15} className="text-amber-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={fetchBanners}
            className="text-amber-700 hover:text-amber-900 font-bold uppercase underline ml-3"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* B. Grid de Previsualización Realista (Slot 01 y Slot 02) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {banners.map((banner) => {
          const hasImage = Boolean(banner.imagenUrl && banner.imagenUrl.trim());
          const optionalTitle = getOptionalBannerTitle(banner.titulo);
          const slotLabel = `SLOT 0${banner.posicion}`;
          const ctaText = banner.textoBoton?.trim() || 'VER EVENTO';

          return (
            <div key={banner.posicion} className="flex flex-col space-y-3">
              {/* Encabezado Técnico (Fuera de la imagen) */}
              <div className="flex items-center justify-between px-0.5">
                <span className="font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider">
                  {slotLabel}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenEditDrawer(banner)}
                  className="font-mono text-xs uppercase tracking-wider text-[#0F2342] hover:text-[#C68B17] font-bold flex items-center gap-1.5 transition-colors cursor-pointer group"
                >
                  <span>Modificar pieza</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>

              {/* Lienzo del Banner: Idéntico al Home (rounded-2xl sm:rounded-3xl, aspecto real 16/9, colores vivos) */}
              <div
                className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl border border-[#E2E8F0] overflow-hidden bg-slate-950 flex items-center justify-center group cursor-pointer shadow-md transition-shadow hover:shadow-lg"
                onClick={() => handleOpenEditDrawer(banner)}
              >
                {hasImage ? (
                  <>
                    {/* Imagen promocional a todo color sin velo oscuro opaco */}
                    <img
                      src={banner.imagenUrl}
                      alt={optionalTitle || `Slot ${banner.posicion}`}
                      className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out"
                    />

                    {/* Sombra sutil solo en la parte inferior si hay título para legibilidad */}
                    {optionalTitle && (
                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
                    )}

                    {/* Contenido: Título editorial y botón de acción (el botón SIEMPRE se muestra) */}
                    <div className="absolute inset-0 p-5 sm:p-6 lg:p-7 flex flex-col justify-end z-10 pointer-events-none">
                      {optionalTitle && (
                        <div className="max-w-md mb-3">
                          <h4 className="font-display font-extrabold text-white text-lg sm:text-xl lg:text-2xl uppercase tracking-tight leading-snug drop-shadow-md">
                            {optionalTitle}
                          </h4>
                        </div>
                      )}

                      {/* Botón de acción: NO es opcional, siempre visible */}
                      <div>
                        <span className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md pointer-events-auto">
                          <span>{ctaText}</span>
                          <FiArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Slot Desocupado */
                  <div className="w-full h-full bg-[#FFFFFF] border border-dashed border-[#CBD5E1] flex flex-col items-center justify-center p-6 text-center hover:bg-[#F8F9FA] transition-colors rounded-2xl sm:rounded-3xl">
                    <span className="font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider mb-1">
                      Slot Desocupado
                    </span>
                    <p className="font-mono text-[11px] text-[#64748B]">
                      Haz clic en &quot;Modificar pieza&quot; para subir el arte de esta posición.
                    </p>
                  </div>
                )}
              </div>

              {/* Pie de Slot: Solo estado, SIN url de destino */}
              <div className="flex items-center justify-end py-1 px-1 text-xs font-mono">
                <div className="shrink-0">
                  {hasImage ? (
                    <div className="flex items-center gap-1.5 font-bold text-[#0F2342] uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
                      <span>EN EXHIBICIÓN</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#94A3B8] uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                      <span>DISPONIBLE</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DRAWER LATERAL DERECHO: MODIFICAR BANNER */}
      {drawerOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => !savingPos && setDrawerOpen(false)}
          />

          <div
            className="relative z-10 w-full sm:w-[500px] md:w-[540px] bg-[#FFFFFF] h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera Drawer #0F2342 */}
            <div className="bg-[#0F2342] text-white p-6 flex items-center justify-between border-b border-white/10">
              <div>
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
                  Modificar Pieza de Difusión (Slot 0{editingBanner?.posicion})
                </h3>
                <p className="font-mono text-xs text-slate-300 mt-0.5">
                  Carrusel Oficial de Portada Pública
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                disabled={Boolean(savingPos)}
                className="p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveBanner} className="p-6 space-y-5 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono rounded-[2px] flex items-center gap-2">
                  <FiAlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Previsualización de la Pieza Gráfica */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-2">
                  Pieza Gráfica (16:9) <span className="text-rose-500">*</span>
                </label>

                {filePreview || editingBanner?.imagenUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-full aspect-[16/9] rounded-[2px] border border-[#E2E8F0] overflow-hidden bg-[#0F2342]">
                      <img
                        src={filePreview || editingBanner?.imagenUrl}
                        alt="Previsualización"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Reemplazar Archivo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="px-3 py-1.5 rounded-[2px] border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Quitar Arte
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[16/9] rounded-[2px] border border-dashed border-[#CBD5E1] bg-[#F8F9FA] hover:bg-[#FFFFFF] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors"
                  >
                    <FiUpload size={24} className="text-[#64748B] mb-2" />
                    <span className="font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider">
                      Cargar Archivo de Imagen
                    </span>
                    <span className="font-mono text-[11px] text-[#64748B] mt-1">
                      JPG, PNG o WEBP (Máx. 5 MB). Proporción recomendada: 16:9 o 1920x1080.
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />
              </div>

              {/* URL alternativa */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  O Enlace Directo de Imagen (URL)
                </label>
                <input
                  type="url"
                  value={editingBanner?.imagenUrl || ''}
                  onChange={(e) => {
                    handleFieldChange('imagenUrl', e.target.value);
                    setFilePreview(e.target.value);
                  }}
                  placeholder="https://ejemplo.com/arte-promocional.jpg"
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342]"
                />
              </div>

              {/* 2. Título Opcional (¡Importante!) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold">
                    Título de la Pieza (Opcional)
                  </label>
                  <span className="font-mono text-[10px] text-[#64748B]">
                    Dejar en blanco si el arte ya tiene texto
                  </span>
                </div>
                <input
                  type="text"
                  value={editingBanner?.titulo || ''}
                  onChange={(e) => handleFieldChange('titulo', e.target.value)}
                  placeholder="Ej. Cartagena Jazz Festival 2026"
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] focus:outline-none focus:border-[#0F2342]"
                />
                <p className="font-mono text-[11px] text-[#64748B] mt-1">
                  Si dejas este campo vacío, la imagen se mostrará 100% limpia sin degradados oscuros.
                </p>
              </div>

              {/* 3. Texto del Botón CTA (Opcional) */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Texto del Botón CTA (Opcional)
                </label>
                <input
                  type="text"
                  value={editingBanner?.textoBoton || ''}
                  onChange={(e) => handleFieldChange('textoBoton', e.target.value)}
                  placeholder="Ej. VER EVENTO"
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342]"
                />
              </div>

              {/* 4. Enlace URL de Destino */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Enlace URL de Destino
                </label>
                <input
                  type="text"
                  value={editingBanner?.enlaceUrl || ''}
                  onChange={(e) => handleFieldChange('enlaceUrl', e.target.value)}
                  placeholder="/buscar?categoria=1 o https://..."
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs sm:text-sm text-[#0F2342] font-mono focus:outline-none focus:border-[#0F2342]"
                />
              </div>

              {/* Botones de acción del drawer */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E2E8F0]">
                {editingBanner?.id || editingBanner?.imagenUrl ? (
                  <button
                    type="button"
                    onClick={handleDeleteBanner}
                    disabled={Boolean(savingPos)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-[2px] border border-rose-200 hover:bg-rose-50 text-rose-700 font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                  >
                    Vaciar Slot
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    disabled={Boolean(savingPos)}
                    className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#64748B] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(savingPos)}
                    className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {savingPos ? 'Guardando...' : 'Guardar Pieza'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
