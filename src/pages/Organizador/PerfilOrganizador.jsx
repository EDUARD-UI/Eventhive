import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiMail,
  FiStar,
  FiCamera,
  FiUser,
  FiShoppingBag,
  FiCreditCard,
  FiUploadCloud,
  FiFileText,
  FiEdit3,
  FiX,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiPhone,
  FiShield,
  FiLayers,
} from 'react-icons/fi';
import { organizerService } from '../../services/organizerService.js';
import { userService } from '../../services/userService.js';
import { httpClient } from '../../services/httpClient.js';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../../utils/alertUtils.js';
import { sanitizeText, sanitizePhone } from '../../utils/sanitizer.js';
import {
  ProfileCard,
  ProfileField,
  ProfileMetric,
} from '../../components/Shared/DashboardProfileComponents.jsx';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 font-semibold';

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
  const [repProfile, setRepProfile] = useState({
    id: '',
    nombre: '',
    correo: '',
    telefono: '',
    imagenPerfil: null,
    urlImagenPerfil: null,
    rolNombre: '',
  });

  const [repImageFile, setRepImageFile] = useState(null);
  const [repImagePreview, setRepImagePreview] = useState(null);
  const repImageRef = useRef(null);

  // Representative activity/purchases
  const [activity, setActivity] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [favorites, setFavorites] = useState([]);

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

  // Listener para cerrar drawer con Escape
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
        setOrgProfile({
          id: org.id || '',
          razonSocial: org.razonSocial || org.nombre || '',
          correoContacto: org.correoContacto || org.correo || '',
          descripcion: org.descripcion || '',
          urlLogo: org.urlLogo || org.logo || null,
          promedioRating: org.promedioRating ?? org.valoracion ?? null,
          totalValoraciones: org.totalValoraciones || 0,
          totalSeguidores: org.totalSeguidores || 0,
          nivel: org.nivel || '',
          estado: org.estado || '',
          nit: org.nit || '',
        });
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
        setRepProfile({
          id: user.id || '',
          nombre: user.nombre || '',
          correo: user.correo || '',
          telefono: user.telefono || '',
          imagenPerfil: user.imagenPerfil || null,
          urlImagenPerfil: user.urlImagenPerfil || null,
          rolNombre: user.rolNombre || '',
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
    } catch (err) {
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

    userService.getDeseos({ page: 0, size: 10 })
      .then((data) => { setFavorites(data?.content || []); })
      .catch(() => {});
  }, []);

  // Abrir modal lateral sincronizado con los datos actuales
  const openEditDrawer = (tab = 'organizacion') => {
    setDrawerTab(tab);
    setDrawerErrors({});
    setDrawerForm({
      razonSocial: orgProfile.razonSocial,
      correoContacto: orgProfile.correoContacto,
      descripcion: orgProfile.descripcion,
      repNombre: repProfile.nombre,
      repTelefono: repProfile.telefono,
    });
    setIsEditDrawerOpen(true);
  };

  const handleImageSelect = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showWarningAlert('Formato no permitido', 'La imagen debe ser PNG o JPG.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showWarningAlert('Archivo muy pesado', 'La imagen no puede exceder los 5 MB.');
      event.target.value = '';
      return;
    }

    const preview = URL.createObjectURL(file);
    if (type === 'organizacion') {
      setOrgImageFile(file);
      setOrgImagePreview(preview);
    } else {
      setRepImageFile(file);
      setRepImagePreview(preview);
    }
  };

  // Guardar cambios desde el modal lateral con protección de doble clic
  const handleSaveDrawer = async (e) => {
    if (e) e.preventDefault();
    if (savingDrawer) return;

    setDrawerErrors({});
    setSavingDrawer(true);

    try {
      if (drawerTab === 'organizacion') {
        const rs = (drawerForm.razonSocial || '').trim();
        const cc = (drawerForm.correoContacto || '').trim();
        const desc = (drawerForm.descripcion || '').trim();

        const errors = {};
        if (!rs) {
          errors.razonSocial = 'La razón social es obligatoria.';
        } else if (rs.length > 200) {
          errors.razonSocial = 'La razón social no puede superar 200 caracteres.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!cc) {
          errors.correoContacto = 'El correo de contacto es obligatorio.';
        } else if (!emailRegex.test(cc)) {
          errors.correoContacto = 'El formato del correo de contacto no es válido.';
        } else if (cc.length > 150) {
          errors.correoContacto = 'El correo no puede superar 150 caracteres.';
        }

        if (desc.length > 1000) {
          errors.descripcion = 'La descripción no puede superar 1000 caracteres.';
        }

        if (Object.keys(errors).length > 0) {
          setDrawerErrors(errors);
          setSavingDrawer(false);
          return;
        }

        const datos = {
          razonSocial: sanitizeText(rs),
          correoContacto: cc,
          descripcion: desc,
        };
        const fd = new FormData();
        fd.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
        if (orgImageFile) {
          fd.append('imagen', orgImageFile);
        }

        const res = await organizerService.updateMiOrganizacion(fd);
        setOrgProfile((prev) => ({
          ...prev,
          razonSocial: datos.razonSocial,
          correoContacto: datos.correoContacto,
          descripcion: datos.descripcion,
          urlLogo: res?.urlLogo || prev.urlLogo,
        }));
        setOrgImageFile(null);
        setOrgImagePreview(null);
        await showSuccessAlert('Organización actualizada', 'Los datos de tu organización fueron guardados exitosamente.');
      } else {
        const cleanNombre = sanitizeText(drawerForm.repNombre);
        const cleanTelefono = sanitizePhone(drawerForm.repTelefono);

        if (!cleanNombre.trim()) {
          setDrawerErrors({ repNombre: 'El nombre del representante es obligatorio.' });
          setSavingDrawer(false);
          return;
        }

        await userService.updatePerfil({
          nombre: cleanNombre,
          telefono: cleanTelefono,
        });

        setRepProfile((prev) => ({
          ...prev,
          nombre: cleanNombre,
          telefono: cleanTelefono,
        }));

        if (repImageFile) {
          const fd = new FormData();
          fd.append('imagen', repImageFile);
          const imgRes = await httpClient.put('/usuarios/perfil/imagen', fd, { isFormData: true });
          setRepProfile((prev) => ({
            ...prev,
            imagenPerfil: imgRes?.imagenPerfil || prev.imagenPerfil,
            urlImagenPerfil: imgRes?.urlImagenPerfil || prev.urlImagenPerfil,
          }));
          setRepImageFile(null);
          setRepImagePreview(null);
        }

        await showSuccessAlert('Representante actualizado', 'Tus datos de representante fueron guardados exitosamente.');
      }
      setIsEditDrawerOpen(false);
    } catch (err) {
      const msg = err?.message || 'No fue posible guardar los cambios.';
      setDrawerErrors({ general: msg });
      showErrorAlert('Error al guardar', msg);
    } finally {
      setSavingDrawer(false);
    }
  };

  // Manejo del archivo RUT con protección asíncrona
  const handleRutFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_RUT_TYPES.includes(file.type)) {
      showWarningAlert('Formato no permitido', 'El documento RUT debe ser un archivo PDF o imagen (PNG, JPG).');
      return;
    }

    if (file.size > MAX_RUT_SIZE) {
      showWarningAlert('Archivo muy pesado', 'El archivo no puede exceder los 10 MB.');
      return;
    }

    setRutFile(file);
  };

  const handleSubirRut = async () => {
    if (!rutFile || rutUploading) return;

    setRutUploading(true);
    try {
      const fd = new FormData();
      fd.append('rut', rutFile);

      let res;
      if (solicitudVerif?.id) {
        res = await organizerService.subirRut(solicitudVerif.id, fd);
      } else {
        res = await organizerService.solicitarVerificacion(fd);
      }

      setSolicitudVerif(res || { estado: 'PENDIENTE' });
      setRutFile(null);
      if (rutInputRef.current) rutInputRef.current.value = '';

      showSuccessAlert(
        'RUT Cargado con Éxito',
        'Tu documento RUT ha sido recibido y pasará a revisión por el equipo administrativo.'
      );
    } catch (err) {
      showErrorAlert('Error al subir RUT', err?.message || 'No se pudo cargar el documento RUT.');
    } finally {
      setRutUploading(false);
    }
  };

  const getRutStatusBadge = () => {
    const estado = solicitudVerif?.estado || 'SIN_RUT';
    switch (estado) {
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <FiCheckCircle size={13} /> RUT Aprobado y Verificado
          </span>
        );
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            <FiClock size={13} /> Pendiente de Validación
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
            <FiAlertCircle size={13} /> RUT Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            <FiFileText size={13} /> Documento No Cargado
          </span>
        );
    }
  };

  const orgDisplayImage = orgImagePreview || orgProfile.urlLogo;
  const repDisplayImage = repImagePreview || repProfile.urlImagenPerfil || repProfile.imagenPerfil;
  const rutStatus = String(solicitudVerif?.estado || '').toUpperCase();
  const rutAlreadyUploaded = Boolean(
    solicitudVerif?.rutUrl ||
      solicitudVerif?.urlRut ||
      solicitudVerif?.urlDocumento ||
      solicitudVerif?.urlDocumentoRut ||
      solicitudVerif?.urlArchivo ||
      solicitudVerif?.url ||
      ['PENDIENTE', 'PENDIENTE_REVISION', 'APROBADA'].includes(rutStatus)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header con Tab Switcher y Botón de Edición en Drawer Lateral */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-200/80 px-2 py-0.5 rounded-md">
              Sede Institucional
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Mi Perfil de Organización
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 max-w-xl font-medium">
            Configura la identidad legal de tu organización, administra los datos del representante y mantén actualizado tu RUT para habilitar publicaciones.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div role="group" aria-label="Secciones del perfil" className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              type="button"
              aria-pressed={activeTab === 'organizacion'}
              onClick={() => setActiveTab('organizacion')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'organizacion'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Organización
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'representante'}
              onClick={() => setActiveTab('representante')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'representante'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Representante
            </button>
          </div>

          <button
            type="button"
            onClick={() => openEditDrawer(activeTab)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <FiEdit3 size={14} />
            <span>Editar {activeTab === 'organizacion' ? 'organización' : 'representante'}</span>
          </button>
        </div>
      </div>

      {/* ===== TAB ORGANIZACIÓN ===== */}
      {activeTab === 'organizacion' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Tarjeta de Información General */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-6">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 font-display text-2xl font-black text-amber-800 shadow-2xs">
                    {orgDisplayImage ? (
                      <img src={orgDisplayImage} alt={orgProfile.razonSocial} className="w-full h-full object-cover" />
                    ) : (
                      (orgProfile.razonSocial || 'EV').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mb-1">
                      Organización Registrada
                    </span>
                    <h3 className="truncate font-display text-xl font-black text-slate-900">
                      {orgProfile.razonSocial || 'Mi Organización'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {orgProfile.correoContacto || 'Sin correo de contacto'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEditDrawer('organizacion')}
                  className="inline-flex items-center gap-1.5 self-start rounded-xl px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 transition-colors cursor-pointer sm:self-center shadow-2xs"
                >
                  <FiEdit3 size={13} /> Editar datos
                </button>
              </div>

              {/* Datos descriptivos */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    NIT de la Organización
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {orgProfile.nit || 'Sin NIT registrado'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Estado de Cuenta
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {orgProfile.estado || 'REGISTRADA'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Descripción Institucional
                  </span>
                  <p className="whitespace-pre-line font-medium text-slate-700 leading-relaxed text-xs">
                    {orgProfile.descripcion || 'Sin descripción registrada para la organización.'}
                  </p>
                </div>
              </div>

              {/* SECCIÓN CARGA DEL RUT */}
              <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 font-display text-sm font-bold text-slate-900">
                      <FiFileText className="text-amber-500" />
                      <span>Registro Único Tributario (RUT)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Documento obligatorio para habilitar la publicación de eventos en cartelera
                    </p>
                  </div>
                  <div>{getRutStatusBadge()}</div>
                </div>

                {solicitudVerif?.estado === 'RECHAZADA' && solicitudVerif?.comentarioRechazo && (
                  <div className="space-y-1 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                    <strong className="block font-bold">Observación administrativa de rechazo:</strong>
                    <p>{solicitudVerif.comentarioRechazo}</p>
                  </div>
                )}

                {rutAlreadyUploaded ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <FiCheckCircle size={15} className="text-emerald-600 shrink-0" />
                    <span>Tu documento RUT se encuentra cargado y registrado en el sistema.</span>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
                          <FiUploadCloud size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {rutFile ? rutFile.name : 'Selecciona el archivo del RUT desde tu equipo'}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {rutFile
                              ? `${(rutFile.size / (1024 * 1024)).toFixed(2)} MB · Listo para cargar`
                              : 'PDF, PNG o JPG · Máximo 10 MB'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          ref={rutInputRef}
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg"
                          onChange={handleRutFileSelect}
                          className="hidden"
                          id="rut-file-upload"
                          disabled={rutUploading}
                        />
                        <label
                          htmlFor="rut-file-upload"
                          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
                        >
                          Examinar equipo
                        </label>

                        {rutFile && (
                          <button
                            type="button"
                            onClick={handleSubirRut}
                            disabled={rutUploading}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1B3D] px-4 py-2 text-xs font-bold text-amber-300 shadow-xs transition-colors hover:bg-slate-900 disabled:opacity-60 cursor-pointer"
                          >
                            {rutUploading ? (
                              <>
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                                <span>Subiendo...</span>
                              </>
                            ) : (
                              <span>Cargar documento</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Aside de Reputación e Información */}
            <aside className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <h4 className="font-display text-sm font-black text-slate-900">
                    Reputación Cultural
                  </h4>
                  {orgProfile.nivel && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800">
                      {orgProfile.nivel.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-700 font-display font-black text-xl">
                    <FiStar className="fill-amber-400 text-amber-500" />
                    <span>{orgProfile.promedioRating ? Number(orgProfile.promedioRating).toFixed(1) : '—'} / 5.0</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {orgProfile.totalValoraciones} valoraciones · {orgProfile.totalSeguidores} seguidores en EventHive
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-3">
                <h4 className="border-b border-slate-100 pb-3 font-display text-sm font-black text-slate-900">
                  Contacto Institucional
                </h4>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                  <FiMail size={16} className="shrink-0 text-amber-600" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase text-slate-400">Correo Oficial</p>
                    <p className="truncate text-xs font-bold text-slate-800">{orgProfile.correoContacto || '—'}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ===== TAB REPRESENTANTE LEGAL ===== */}
      {activeTab === 'representante' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Tarjeta de Información del Representante */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-6">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-200 bg-amber-50 font-display text-2xl font-black text-amber-800 shadow-2xs">
                    {repDisplayImage ? (
                      <img src={repDisplayImage} alt={repProfile.nombre} className="w-full h-full object-cover" />
                    ) : (
                      (repProfile.nombre || 'U').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mb-1">
                      Representante Legal
                    </span>
                    <h3 className="truncate font-display text-xl font-black text-slate-900">{repProfile.nombre}</h3>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{repProfile.correo}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEditDrawer('representante')}
                  className="inline-flex items-center gap-1.5 self-start rounded-xl px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 transition-colors cursor-pointer sm:self-center shadow-2xs"
                >
                  <FiEdit3 size={13} /> Editar datos
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Teléfono Móvil
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {repProfile.telefono || 'Sin teléfono registrado'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Correo Principal
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                    {repProfile.correo || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actividad en Plataforma */}
            <aside className="space-y-4">
              {activity && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                  <h4 className="font-display text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
                    Actividad de Usuario
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Compras</span>
                      <strong className="text-xl font-black font-display text-slate-900">
                        {activity.comprasConfirmadas ?? 0}
                      </strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Entradas</span>
                      <strong className="text-xl font-black font-display text-slate-900">
                        {activity.entradasCompradas ?? 0}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}

      {/* ===== MODAL LATERAL DERECHO (RIGHT-SIDE DRAWER) ===== */}
      {isEditDrawerOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-hidden flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => !savingDrawer && setIsEditDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-300">
              {/* Header del Drawer */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-black text-slate-900">
                    Editar Datos
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {drawerTab === 'organizacion' ? 'Información institucional' : 'Datos del representante legal'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditDrawerOpen(false)}
                  disabled={savingDrawer}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Formulario */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setDrawerTab('organizacion')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      drawerTab === 'organizacion'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Organización
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab('representante')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      drawerTab === 'representante'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Representante
                  </button>
                </div>

                {drawerErrors.general && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                    <FiAlertCircle size={15} className="text-rose-600 shrink-0" />
                    <span>{drawerErrors.general}</span>
                  </div>
                )}

                {drawerTab === 'organizacion' ? (
                  <form id="org-drawer-form" onSubmit={handleSaveDrawer} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                        {orgDisplayImage ? (
                          <img src={orgDisplayImage} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <FiCamera size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <input
                          ref={orgImageRef}
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={(e) => handleImageSelect(e, 'organizacion')}
                          className="hidden"
                          disabled={savingDrawer}
                        />
                        <button
                          type="button"
                          onClick={() => orgImageRef.current?.click()}
                          disabled={savingDrawer}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                        >
                          Cargar logo
                        </button>
                        <p className="mt-1 text-[10px] text-slate-500">PNG o JPG, máximo 5 MB</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Razón Social / Nombre Oficial <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={drawerForm.razonSocial}
                        onChange={(e) => {
                          setDrawerForm((prev) => ({ ...prev, razonSocial: e.target.value }));
                          if (drawerErrors.razonSocial) setDrawerErrors((prev) => ({ ...prev, razonSocial: null }));
                        }}
                        className={`${inputClass} ${drawerErrors.razonSocial ? 'border-rose-400 bg-rose-50/20' : ''}`}
                        required
                        maxLength={200}
                        disabled={savingDrawer}
                      />
                      {drawerErrors.razonSocial && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">
                          {drawerErrors.razonSocial}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo de Contacto Institucional <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={drawerForm.correoContacto}
                        onChange={(e) => {
                          setDrawerForm((prev) => ({ ...prev, correoContacto: e.target.value }));
                          if (drawerErrors.correoContacto) setDrawerErrors((prev) => ({ ...prev, correoContacto: null }));
                        }}
                        className={`${inputClass} ${drawerErrors.correoContacto ? 'border-rose-400 bg-rose-50/20' : ''}`}
                        required
                        maxLength={150}
                        disabled={savingDrawer}
                      />
                      {drawerErrors.correoContacto && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">
                          {drawerErrors.correoContacto}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Descripción de la Organización
                      </label>
                      <textarea
                        rows={4}
                        value={drawerForm.descripcion}
                        onChange={(e) => {
                          setDrawerForm((prev) => ({ ...prev, descripcion: e.target.value }));
                          if (drawerErrors.descripcion) setDrawerErrors((prev) => ({ ...prev, descripcion: null }));
                        }}
                        className={`${inputClass} resize-none leading-relaxed ${drawerErrors.descripcion ? 'border-rose-400 bg-rose-50/20' : ''}`}
                        placeholder="Describe el perfil y trayectoria cultural de la organización..."
                        maxLength={1000}
                        disabled={savingDrawer}
                      />
                      {drawerErrors.descripcion && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">
                          {drawerErrors.descripcion}
                        </p>
                      )}
                    </div>
                  </form>
                ) : (
                  <form id="rep-drawer-form" onSubmit={handleSaveDrawer} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                        {repDisplayImage ? (
                          <img src={repDisplayImage} alt="Foto" className="h-full w-full object-cover" />
                        ) : (
                          <FiUser size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <input
                          ref={repImageRef}
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={(e) => handleImageSelect(e, 'representante')}
                          className="hidden"
                          disabled={savingDrawer}
                        />
                        <button
                          type="button"
                          onClick={() => repImageRef.current?.click()}
                          disabled={savingDrawer}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                        >
                          Cargar foto
                        </button>
                        <p className="mt-1 text-[10px] text-slate-500">PNG o JPG, máximo 5 MB</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre del Representante Legal <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={drawerForm.repNombre}
                        onChange={(e) => {
                          setDrawerForm((prev) => ({ ...prev, repNombre: e.target.value }));
                          if (drawerErrors.repNombre) setDrawerErrors((prev) => ({ ...prev, repNombre: null }));
                        }}
                        className={`${inputClass} ${drawerErrors.repNombre ? 'border-rose-400 bg-rose-50/20' : ''}`}
                        required
                        disabled={savingDrawer}
                      />
                      {drawerErrors.repNombre && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">
                          {drawerErrors.repNombre}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teléfono Móvil
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={drawerForm.repTelefono}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setDrawerForm((prev) => ({ ...prev, repTelefono: cleaned }));
                        }}
                        placeholder="Ej: 3001234567"
                        className={inputClass}
                        disabled={savingDrawer}
                      />
                    </div>
                  </form>
                )}
              </div>

              {/* Footer del Drawer */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsEditDrawerOpen(false)}
                  disabled={savingDrawer}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveDrawer}
                  disabled={savingDrawer}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 text-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {savingDrawer ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar cambios</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
