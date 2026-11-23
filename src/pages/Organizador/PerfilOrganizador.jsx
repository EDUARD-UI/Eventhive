import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiMail,
  FiUser,
  FiFileText,
  FiEdit3,
  FiX,
  FiAlertCircle,
  FiPhone,
  FiCheck,
  FiUploadCloud,
} from 'react-icons/fi';
import { organizerService } from '../../services/organizerService.js';
import { userService, readFileAsDataUrl } from '../../services/userService.js';
import { session, extractPhotoUrl } from '../../services/session.js';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../../utils/alertUtils.js';
import { sanitizeText, sanitizePhone } from '../../utils/sanitizer.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_RUT_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_RUT_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

export default function PerfilOrganizador() {
  const [activeTab, setActiveTab] = useState('organizacion'); // 'organizacion' | 'representante'

  // Organization profile state
  const [orgProfile, setOrgProfile] = useState({
    id: '',
    razonSocial: '',
    correoContacto: '',
    descripcion: '',
    urlLogo: null,
    promedioRating: null,
    totalValoraciones: 0,
    totalSeguidores: 0,
    nivel: '',
    estado: '',
    nit: '',
  });

  const [orgImageFile, setOrgImageFile] = useState(null);
  const [orgImagePreview, setOrgImagePreview] = useState(null);
  const orgImageRef = useRef(null);

  // Representative profile state
  const cachedUser = session.getUser();
  const initialRepPhoto = extractPhotoUrl(cachedUser);

  const [repProfile, setRepProfile] = useState({
    id: cachedUser?.id || '',
    nombre: cachedUser?.nombre || '',
    correo: cachedUser?.correo || '',
    telefono: cachedUser?.telefono || '',
    imagenPerfil: initialRepPhoto,
    urlImagenPerfil: initialRepPhoto,
    rolNombre: cachedUser?.rolNombre || '',
  });

  const [repImageFile, setRepImageFile] = useState(null);
  const [repImagePreview, setRepImagePreview] = useState(null);
  const repImageRef = useRef(null);

  // Representative activity/purchases
  const [activity, setActivity] = useState(null);
  const [purchases, setPurchases] = useState([]);

  // RUT / Verificación State
  const [solicitudVerif, setSolicitudVerif] = useState(null);
  const [rutFile, setRutFile] = useState(null);
  const [rutUploading, setRutUploading] = useState(false);
  const rutInputRef = useRef(null);

  // Modal Lateral Derecho para Edición
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('organizacion');
  const [savingDrawer, setSavingDrawer] = useState(false);
  const [drawerErrors, setDrawerErrors] = useState({});

  // Form temporal para el drawer
  const [drawerForm, setDrawerForm] = useState({
    razonSocial: '',
    correoContacto: '',
    descripcion: '',
    repNombre: '',
    repTelefono: '',
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isEditDrawerOpen && !savingDrawer) {
        setIsEditDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditDrawerOpen, savingDrawer]);

  useEffect(() => {
    if (!orgImagePreview) return undefined;
    return () => URL.revokeObjectURL(orgImagePreview);
  }, [orgImagePreview]);

  useEffect(() => {
    if (!repImagePreview) return undefined;
    return () => URL.revokeObjectURL(repImagePreview);
  }, [repImagePreview]);

  // Load organization profile
  const loadOrgData = async () => {
    try {
      const org = await organizerService.getMiOrganizacion();
      if (org) {
        const logoUrl = org.urlLogo || org.logo || null;
        setOrgProfile({
          id: org.id || '',
          razonSocial: org.razonSocial || org.nombre || '',
          correoContacto: org.correoContacto || org.correo || '',
          descripcion: org.descripcion || '',
          urlLogo: logoUrl,
          promedioRating: org.promedioRating ?? org.valoracion ?? null,
          totalValoraciones: org.totalValoraciones || 0,
          totalSeguidores: org.totalSeguidores || 0,
          nivel: org.nivel || '',
          estado: org.estado || '',
          nit: org.nit || '',
        });
        if (logoUrl && !extractPhotoUrl(session.getUser())) {
          session.updateUser({ urlLogo: logoUrl });
        }
      }
    } catch (e) {
      console.warn('Error cargando datos de organización:', e);
    }
  };

  // Load representative data
  const loadRepData = async () => {
    try {
      const user = await userService.getPerfil();
      if (user) {
        const photo = extractPhotoUrl(user) || extractPhotoUrl(session.getUser());
        setRepProfile({
          id: user.id || '',
          nombre: user.nombre || '',
          correo: user.correo || '',
          telefono: user.telefono || '',
          imagenPerfil: photo,
          urlImagenPerfil: photo,
          rolNombre: user.rolNombre || '',
        });
        session.updateUser({
          nombre: user.nombre || '',
          ...(photo ? { urlImagenPerfil: photo, imagenPerfil: photo, fotoUrl: photo } : {}),
        });
      }
    } catch (e) {
      console.warn('Error cargando datos del representante:', e);
    }
  };

  // Load RUT / Verificación status
  const loadRUTStatus = async () => {
    try {
      const data = await organizerService.getMiSolicitudVerificacion();
      if (data) {
        setSolicitudVerif(data);
      }
    } catch {
      setSolicitudVerif(null);
    }
  };

  useEffect(() => {
    loadOrgData();
    loadRepData();
    loadRUTStatus();

    userService.getActividad()
      .then((data) => { if (data) setActivity(data); })
      .catch(() => {});

    userService.getCompras({ page: 0, size: 10 })
      .then((data) => { setPurchases(data?.content || []); })
      .catch(() => {});
  }, []);

  const openEditDrawer = (tabToOpen = activeTab) => {
    setDrawerTab(tabToOpen);
    setDrawerErrors({});
    setDrawerForm({
      razonSocial: orgProfile.razonSocial || '',
      correoContacto: orgProfile.correoContacto || '',
      descripcion: orgProfile.descripcion || '',
      repNombre: repProfile.nombre || '',
      repTelefono: repProfile.telefono || '',
    });
    setOrgImageFile(null);
    setOrgImagePreview(null);
    setRepImageFile(null);
    setRepImagePreview(null);
    setIsEditDrawerOpen(true);
  };

  const handleOrgImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showWarningAlert('Formato no permitido', 'La imagen debe ser PNG o JPG.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showWarningAlert('Archivo muy pesado', 'La imagen no puede exceder los 5 MB.');
      e.target.value = '';
      return;
    }

    setOrgImageFile(file);
    setOrgImagePreview(URL.createObjectURL(file));
  };

  const handleRepImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showWarningAlert('Formato no permitido', 'La imagen debe ser PNG o JPG.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showWarningAlert('Archivo muy pesado', 'La imagen no puede exceder los 5 MB.');
      e.target.value = '';
      return;
    }

    setRepImageFile(file);
    setRepImagePreview(URL.createObjectURL(file));
  };

  const handleSaveDrawer = async (e) => {
    e.preventDefault();
    setSavingDrawer(true);
    setDrawerErrors({});

    try {
      if (drawerTab === 'organizacion') {
        const razonSocialSan = sanitizeText(drawerForm.razonSocial);
        const correoSan = sanitizeText(drawerForm.correoContacto);
        const descSan = sanitizeText(drawerForm.descripcion);

        if (!razonSocialSan) {
          setDrawerErrors({ razonSocial: 'El nombre de la organización es obligatorio' });
          setSavingDrawer(false);
          return;
        }

        let updatedLogoUrl = orgProfile.urlLogo;
        if (orgImageFile) {
          const uploadRes = await organizerService.actualizarLogoOrganizacion(orgImageFile);
          if (uploadRes) {
            updatedLogoUrl = uploadRes.urlLogo || uploadRes.logo || uploadRes.url || orgImagePreview;
          }
        }

        await organizerService.actualizarMiOrganizacion({
          razonSocial: razonSocialSan,
          correoContacto: correoSan,
          descripcion: descSan,
        });

        setOrgProfile((prev) => ({
          ...prev,
          razonSocial: razonSocialSan,
          correoContacto: correoSan,
          descripcion: descSan,
          urlLogo: updatedLogoUrl,
        }));

        if (updatedLogoUrl) {
          session.updateUser({ urlLogo: updatedLogoUrl });
        }

        await showSuccessAlert({
          title: 'Organización actualizada',
          text: 'Los datos institucionales han sido guardados correctamente.',
        });
      } else {
        const nombreSan = sanitizeText(drawerForm.repNombre);
        const telefonoSan = sanitizePhone(drawerForm.repTelefono);

        if (!nombreSan) {
          setDrawerErrors({ repNombre: 'El nombre es obligatorio' });
          setSavingDrawer(false);
          return;
        }

        let updatedPhotoUrl = repProfile.urlImagenPerfil;
        if (repImageFile) {
          const res = await userService.uploadFotoPerfil(repImageFile);
          updatedPhotoUrl = extractPhotoUrl(res) || repImagePreview;
        }

        await userService.actualizarPerfil({
          nombre: nombreSan,
          telefono: telefonoSan,
        });

        setRepProfile((prev) => ({
          ...prev,
          nombre: nombreSan,
          telefono: telefonoSan,
          urlImagenPerfil: updatedPhotoUrl,
          imagenPerfil: updatedPhotoUrl,
        }));

        session.updateUser({
          nombre: nombreSan,
          ...(updatedPhotoUrl ? { urlImagenPerfil: updatedPhotoUrl, imagenPerfil: updatedPhotoUrl, fotoUrl: updatedPhotoUrl } : {}),
        });

        await showSuccessAlert({
          title: 'Representante actualizado',
          text: 'Los datos del representante han sido guardados.',
        });
      }

      setIsEditDrawerOpen(false);
    } catch (err) {
      await showErrorAlert({
        title: 'Error al guardar',
        text: err.message || 'No se pudieron actualizar los datos.',
      });
    } finally {
      setSavingDrawer(false);
    }
  };

  const handleRutUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_RUT_TYPES.includes(file.type)) {
      showWarningAlert('Formato no válido', 'El RUT debe ser un archivo PDF, PNG o JPG.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_RUT_SIZE) {
      showWarningAlert('Archivo muy pesado', 'El RUT no puede exceder los 10 MB.');
      e.target.value = '';
      return;
    }

    setRutUploading(true);
    try {
      await organizerService.solicitarVerificacion(file);
      await loadRUTStatus();
      await showSuccessAlert({
        title: 'RUT cargado con éxito',
        text: 'Tu documento ha sido enviado para auditoría.',
      });
    } catch (err) {
      await showErrorAlert({
        title: 'Error al subir RUT',
        text: err.message || 'No se pudo cargar el documento.',
      });
    } finally {
      setRutUploading(false);
      if (rutInputRef.current) rutInputRef.current.value = '';
    }
  };

  const orgDisplayImage = orgImagePreview || orgProfile.urlLogo;
  const repDisplayImage = repImagePreview || repProfile.urlImagenPerfil || repProfile.imagenPerfil;
  const rutStatus = String(solicitudVerif?.estado || '').toUpperCase();
  const rutAprobado = rutStatus === 'APROBADA';
  const rutPendiente = rutStatus === 'PENDIENTE' || rutStatus === 'PENDIENTE_REVISION';

  return (
    <div className="space-y-8 select-none">
      {/* 1. Cabecera y Navegación Editorial */}
      <div className="border-b border-[#E2E8F0] pb-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#0F2342] tracking-tight uppercase leading-none">
              Mi Perfil
            </h1>
          </div>

          {/* Botón Principal Rectangular (#0F2342, border-radius: 2px) */}
          <button
            type="button"
            onClick={() => openEditDrawer(activeTab)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-98 shrink-0"
          >
            <FiEdit3 size={14} />
            <span>EDITAR {activeTab === 'organizacion' ? 'ORGANIZACIÓN' : 'REPRESENTANTE'}</span>
          </button>
        </div>

        {/* Tabs Tipográficos sin píldoras, solo subrayado de 2px en #F5B800 */}
        <div className="flex items-center gap-8 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('organizacion')}
            className={`font-mono text-xs uppercase tracking-wider transition-all cursor-pointer pb-2 relative shrink-0 ${
              activeTab === 'organizacion'
                ? 'text-[#0F2342] font-bold'
                : 'text-[#64748B] hover:text-[#0F2342] font-medium'
            }`}
          >
            <span>Organización</span>
            {activeTab === 'organizacion' && (
              <span
                className="absolute bottom-0 inset-x-0 h-[2px] bg-[#F5B800] transition-all"
                aria-hidden="true"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('representante')}
            className={`font-mono text-xs uppercase tracking-wider transition-all cursor-pointer pb-2 relative shrink-0 ${
              activeTab === 'representante'
                ? 'text-[#0F2342] font-bold'
                : 'text-[#64748B] hover:text-[#0F2342] font-medium'
            }`}
          >
            <span>Representante</span>
            {activeTab === 'representante' && (
              <span
                className="absolute bottom-0 inset-x-0 h-[2px] bg-[#F5B800] transition-all"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </div>

      {/* 2. Layout Asimétrico (65% Ficha Técnica / 35% Resumen) */}
      {activeTab === 'organizacion' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda (65% Ficha Técnica): Sin cajas grises redondeadas, filas de 1px */}
          <div className="lg:col-span-8 w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 sm:p-8 space-y-6">
            {/* Cabecera de Ficha: Logo a Color Natural + Nombre + Correo */}
            <div className="flex items-center gap-5 pb-6 border-b border-[#E2E8F0]">
              <div className="w-20 h-20 rounded-[2px] border border-[#E2E8F0] bg-[#F8F9FA] overflow-hidden shrink-0 flex items-center justify-center">
                {orgDisplayImage ? (
                  <img
                    src={orgDisplayImage}
                    alt={orgProfile.razonSocial}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display font-black text-2xl text-[#0F2342]">
                    {(orgProfile.razonSocial || 'EH').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-black text-2xl text-[#0F2342] uppercase tracking-tight truncate">
                  {orgProfile.razonSocial || 'Mi Organización'}
                </h3>
                <p className="font-mono text-xs text-[#64748B] truncate mt-1">
                  {orgProfile.correoContacto || 'Sin correo de contacto'}
                </p>
              </div>
            </div>

            {/* Filas Tipográficas Limpias separadas por 1px solid #E2E8F0 */}
            <div className="divide-y divide-[#E2E8F0]">
              {/* NIT */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                  NIT de la Organización
                </span>
                <span className="font-mono text-sm font-bold text-[#0F2342]">
                  {orgProfile.nit || 'En verificación'}
                </span>
              </div>

              {/* Estado de Cuenta */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                  Estado de Cuenta
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
                  <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#0F2342]">
                    {orgProfile.estado || 'APROBADA'}
                  </span>
                </div>
              </div>

              {/* Descripción Institucional */}
              <div className="py-4 space-y-1">
                <span className="font-mono text-xs uppercase tracking-wider text-[#64748B] block">
                  Descripción Institucional
                </span>
                <p className="font-mono text-xs text-[#0F2342] leading-relaxed whitespace-pre-line pt-1">
                  {orgProfile.descripcion || 'Sin descripción institucional registrada.'}
                </p>
              </div>

              {/* Registro Único Tributario (RUT) */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#64748B] block">
                    Registro Único Tributario (RUT)
                  </span>
                  <span className="font-mono text-[11px] text-[#94A3B8]">
                    {rutAprobado
                      ? 'Documento fiscal validado y vigente'
                      : rutPendiente
                      ? 'Documento en proceso de auditoría oficial'
                      : 'Requerido para autorizar boletería en cartelera'}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider font-bold">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: rutAprobado
                          ? '#10B981'
                          : rutPendiente
                          ? '#F5B800'
                          : '#64748B',
                      }}
                    />
                    <span className="text-[#0F2342]">
                      {rutAprobado ? 'VERIFICADO' : rutPendiente ? 'EN REVISIÓN' : 'NO CARGADO'}
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={rutInputRef}
                    onChange={handleRutUpload}
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => rutInputRef.current?.click()}
                    disabled={rutUploading}
                    className="font-mono text-xs font-bold text-[#0F2342] hover:text-[#B45309] border-b border-transparent hover:border-[#F5B800] transition-all cursor-pointer py-1"
                  >
                    {rutUploading ? 'Cargando...' : 'Actualizar RUT →'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha (35% Métricas): Dos bloques apilados separados por 1px */}
          <div className="lg:col-span-4 w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 sm:p-7 space-y-6">
            {/* Bloque 1: Reputación Cultural */}
            <div className="space-y-3 pb-6 border-b border-[#E2E8F0]">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64748B] block">
                REPUTACIÓN CULTURAL
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-black text-4xl text-[#0F2342] tracking-tight">
                  {orgProfile.promedioRating ? Number(orgProfile.promedioRating).toFixed(1) : '—'}
                </span>
                <span className="font-mono text-xs text-[#64748B]">/ 5.0</span>
              </div>
              <p className="font-mono text-[11px] text-[#64748B]">
                {orgProfile.totalValoraciones} valoraciones · {orgProfile.totalSeguidores} seguidores
              </p>
            </div>

            {/* Bloque 2: Contacto Institucional */}
            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64748B] block">
                CONTACTO INSTITUCIONAL
              </span>
              <p className="font-mono text-xs text-[#0F2342] break-all">
                {orgProfile.correoContacto || 'Sin correo asignado'}
              </p>
              <p className="font-mono text-[10px] text-[#94A3B8]">
                Canal oficial para notificaciones de boletería y producción
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ===== TAB REPRESENTANTE ===== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda (65% Ficha Técnica del Representante) */}
          <div className="lg:col-span-8 w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 sm:p-8 space-y-6">
            {/* Cabecera: Avatar a Todo Color Natural (sin ícono de cámara flotante encima) */}
            <div className="flex items-center gap-5 pb-6 border-b border-[#E2E8F0]">
              <div className="w-20 h-20 rounded-[2px] border border-[#E2E8F0] bg-[#F8F9FA] overflow-hidden shrink-0 flex items-center justify-center">
                {repDisplayImage ? (
                  <img
                    src={repDisplayImage}
                    alt={repProfile.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display font-black text-2xl text-[#0F2342]">
                    {(repProfile.nombre || 'RP').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-black text-2xl text-[#0F2342] uppercase tracking-tight truncate">
                  {repProfile.nombre || 'Representante Legal'}
                </h3>
                <p className="font-mono text-xs text-[#64748B] truncate mt-1">
                  {repProfile.correo || 'Sin correo registrado'}
                </p>
              </div>
            </div>

            {/* Filas Tipográficas Limpias */}
            <div className="divide-y divide-[#E2E8F0]">
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                  Teléfono Móvil
                </span>
                <span className="font-mono text-sm font-bold text-[#0F2342]">
                  {repProfile.telefono || 'Sin teléfono registrado'}
                </span>
              </div>

              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                  Correo Principal
                </span>
                <span className="font-mono text-sm font-bold text-[#0F2342]">
                  {repProfile.correo || 'Sin correo registrado'}
                </span>
              </div>

              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                  Rol Asignado
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-[#0F2342] font-semibold">
                  {repProfile.rolNombre || 'REPRESENTANTE'}
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha (35% Actividad del Representante) */}
          <div className="lg:col-span-4 w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-6 sm:p-7 space-y-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64748B] block">
              ACTIVIDAD DE USUARIO
            </span>

            {/* Resumen tipográfico dividido por línea vertical de 1px */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-[#E2E8F0] py-6">
              <div className="text-center pr-4 border-r border-[#E2E8F0]">
                <span className="font-mono font-black text-3xl text-[#0F2342] block">
                  {purchases.length}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] mt-1 block">
                  COMPRAS
                </span>
              </div>

              <div className="text-center pl-4">
                <span className="font-mono font-black text-3xl text-[#0F2342] block">
                  {activity?.totalEntradas ?? 0}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] mt-1 block">
                  ENTRADAS
                </span>
              </div>
            </div>

            <p className="font-mono text-[11px] text-[#94A3B8] leading-relaxed">
              Historial acumulado de compras personales asociadas a la cuenta del representante.
            </p>
          </div>
        </div>
      )}

      {/* 3. Drawer Lateral de Edición */}
      {isEditDrawerOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => !savingDrawer && setIsEditDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="relative w-full max-w-lg bg-[#FFFFFF] h-full shadow-2xl z-10 flex flex-col border-l border-[#E2E8F0]">
              <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-lg text-[#0F2342] uppercase tracking-tight">
                    {drawerTab === 'organizacion' ? 'Editar Organización' : 'Editar Representante'}
                  </h3>
                  <p className="font-mono text-[11px] text-[#64748B]">
                    Modifica los datos del expediente oficial
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditDrawerOpen(false)}
                  className="p-1.5 text-[#64748B] hover:text-[#0F2342] transition-colors cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDrawer} className="flex-1 overflow-y-auto p-6 space-y-5">
                {drawerTab === 'organizacion' ? (
                  <>
                    {/* Foto/Logo de Organización */}
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-2">
                        Logo Oficial
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[2px] border border-[#E2E8F0] bg-[#F8F9FA] overflow-hidden shrink-0 flex items-center justify-center">
                          {orgImagePreview || orgProfile.urlLogo ? (
                            <img
                              src={orgImagePreview || orgProfile.urlLogo}
                              alt="Logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-mono text-xs font-bold text-[#64748B]">LOGO</span>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={orgImageRef}
                          onChange={handleOrgImageSelect}
                          accept="image/png,image/jpeg,image/jpg"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => orgImageRef.current?.click()}
                          className="px-3 py-1.5 rounded-[2px] border border-[#E2E8F0] font-mono text-xs font-bold text-[#0F2342] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                        >
                          Seleccionar Imagen
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-1">
                        Nombre de la Organización *
                      </label>
                      <input
                        type="text"
                        value={drawerForm.razonSocial}
                        onChange={(e) => setDrawerForm((prev) => ({ ...prev, razonSocial: e.target.value }))}
                        className="w-full rounded-[2px] border border-[#E2E8F0] px-3.5 py-2 font-mono text-xs text-[#0F2342] outline-none focus:border-[#0F2342]"
                      />
                      {drawerErrors.razonSocial && (
                        <p className="text-[11px] text-rose-600 font-mono mt-1">{drawerErrors.razonSocial}</p>
                      )}
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-1">
                        Correo de Contacto
                      </label>
                      <input
                        type="email"
                        value={drawerForm.correoContacto}
                        onChange={(e) => setDrawerForm((prev) => ({ ...prev, correoContacto: e.target.value }))}
                        className="w-full rounded-[2px] border border-[#E2E8F0] px-3.5 py-2 font-mono text-xs text-[#0F2342] outline-none focus:border-[#0F2342]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-1">
                        Descripción Institucional
                      </label>
                      <textarea
                        rows={4}
                        value={drawerForm.descripcion}
                        onChange={(e) => setDrawerForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                        className="w-full rounded-[2px] border border-[#E2E8F0] px-3.5 py-2 font-mono text-xs text-[#0F2342] outline-none focus:border-[#0F2342]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Foto del Representante */}
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-2">
                        Foto de Perfil
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[2px] border border-[#E2E8F0] bg-[#F8F9FA] overflow-hidden shrink-0 flex items-center justify-center">
                          {repImagePreview || repProfile.urlImagenPerfil ? (
                            <img
                              src={repImagePreview || repProfile.urlImagenPerfil}
                              alt="Perfil"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiUser size={24} className="text-[#64748B]" />
                          )}
                        </div>
                        <input
                          type="file"
                          ref={repImageRef}
                          onChange={handleRepImageSelect}
                          accept="image/png,image/jpeg,image/jpg"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => repImageRef.current?.click()}
                          className="px-3 py-1.5 rounded-[2px] border border-[#E2E8F0] font-mono text-xs font-bold text-[#0F2342] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                        >
                          Seleccionar Foto
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={drawerForm.repNombre}
                        onChange={(e) => setDrawerForm((prev) => ({ ...prev, repNombre: e.target.value }))}
                        className="w-full rounded-[2px] border border-[#E2E8F0] px-3.5 py-2 font-mono text-xs text-[#0F2342] outline-none focus:border-[#0F2342]"
                      />
                      {drawerErrors.repNombre && (
                        <p className="text-[11px] text-rose-600 font-mono mt-1">{drawerErrors.repNombre}</p>
                      )}
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-1">
                        Teléfono Móvil
                      </label>
                      <input
                        type="tel"
                        value={drawerForm.repTelefono}
                        onChange={(e) => setDrawerForm((prev) => ({ ...prev, repTelefono: e.target.value }))}
                        className="w-full rounded-[2px] border border-[#E2E8F0] px-3.5 py-2 font-mono text-xs text-[#0F2342] outline-none focus:border-[#0F2342]"
                      />
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditDrawerOpen(false)}
                    disabled={savingDrawer}
                    className="px-4 py-2 rounded-[2px] border border-[#E2E8F0] font-mono text-xs uppercase text-[#64748B] hover:bg-[#F8F9FA] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingDrawer}
                    className="px-5 py-2 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingDrawer ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
