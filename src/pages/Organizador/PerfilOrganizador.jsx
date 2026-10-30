import React, { useState, useEffect, useRef } from 'react';

import {
  FiCheck,
  FiMail,
  FiShield,
  FiStar,
  FiCamera,
  FiAward,
  FiUser,
  FiShoppingBag,
  FiHeart,
  FiPackage,
  FiCreditCard,
  FiUploadCloud,
  FiFileText,
  FiEdit3,
  FiX,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiPhone,
} from 'react-icons/fi';
import { organizerService } from '../../services/organizerService.js';
import { userService } from '../../services/userService.js';
import { httpClient } from '../../services/httpClient.js';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../../utils/alertUtils.js';
import { sanitizeText, sanitizePhone } from '../../utils/sanitizer.js';
import Badge from '../../components/Shared/Badge.jsx';

const inputClass =
  'w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/10';

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

  // RUT / Verificación State (Requerimiento 2.6)
  const [solicitudVerif, setSolicitudVerif] = useState(null);
  const [rutFile, setRutFile] = useState(null);
  const [rutUploading, setRutUploading] = useState(false);
  const rutInputRef = useRef(null);

  // Modal Lateral Derecho para Edición (Requerimiento 2.5)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('organizacion'); // 'organizacion' | 'representante'
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
      // Si no existe solicitud previa, queda null (estado SIN_RUT)
      setSolicitudVerif(null);
    }
  };

  useEffect(() => {
    loadOrgData();
    loadRepData();
    loadRUTStatus();

    // Activity
    userService.getActividad()
      .then((data) => { if (data) setActivity(data); })
      .catch(() => {});

    // Purchases
    userService.getCompras({ page: 0, size: 10 })
      .then((data) => { setPurchases(data?.content || []); })
      .catch(() => {});

    // Favorites
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

  // Guardar cambios desde el modal lateral derecho con validaciones estrictas
  const handleSaveDrawer = async (e) => {
    if (e) e.preventDefault();
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
        showSuccessAlert('Organización actualizada', 'Los datos de tu organización fueron guardados exitosamente.');
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

        setRepProfile((prev) => ({
          ...prev,
          nombre: cleanNombre,
          telefono: cleanTelefono,
        }));
        showSuccessAlert('Representante actualizado', 'Tus datos de representante fueron guardados exitosamente.');
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

  // --- Manejo del archivo RUT (Requerimiento 2.6) ---
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
    if (!rutFile) {
      showWarningAlert('Selecciona un archivo', 'Por favor selecciona el archivo del RUT desde tu equipo.');
      return;
    }

    setRutUploading(true);
    try {
      const fd = new FormData();
      fd.append('rut', rutFile);

      let res;
      if (solicitudVerif?.id) {
        // Solicitud existente: PATCH /api/verificacion/{id}/subir-rut
        res = await organizerService.subirRut(solicitudVerif.id, fd);
      } else {
        // Solicitud nueva: POST /api/verificacion/solicitar
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

  // Helper de estado del RUT
  const getRutStatusBadge = () => {
    const estado = solicitudVerif?.estado || 'SIN_RUT';
    switch (estado) {
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <FiCheckCircle size={13} /> RUT Aprobado y Verificado
          </span>
        );
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <FiClock size={13} /> Pendiente de Validación
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <FiAlertCircle size={13} /> RUT Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <FiFileText size={13} /> Documento No Cargado
          </span>
        );
    }
  };

  const orgDisplayImage = orgImagePreview || orgProfile.urlLogo;
  const repDisplayImage = repImagePreview || repProfile.urlImagenPerfil || repProfile.imagenPerfil;

  
  return (
    <div className="space-y-6">
      {/* 1. Header con Tab Switcher y Botón de Edición en Modal Lateral */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Perfil de Organización y Representante
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Supervisa los datos institucionales, la verificación del RUT y el perfil del representante legal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1 border border-transparent dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('organizacion')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'organizacion'
                  ? 'bg-white dark:bg-[#0E1626] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Organización
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('representante')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'representante'
                  ? 'bg-white dark:bg-[#0E1626] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Representante Legal
            </button>
          </div>

          <button
            type="button"
            onClick={() => openEditDrawer(activeTab)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1B3D] dark:bg-amber-500 hover:bg-slate-900 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <FiEdit3 size={14} />
            <span>Editar perfil</span>
          </button>
        </div>
      </div>

      {/* ===== TAB ORGANIZACIÓN ===== */}
      {activeTab === 'organizacion' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            {/* Tarjeta de Información General */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B1B3D] to-slate-800 text-2xl font-black text-white shadow-md overflow-hidden border border-slate-200/20 dark:border-white/10">
                      {orgDisplayImage ? (
                        <img src={orgDisplayImage} alt={orgProfile.razonSocial} className="w-full h-full object-cover" />
                      ) : (
                        (orgProfile.razonSocial || 'EV').slice(0, 2).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {orgProfile.razonSocial || 'Mi Organización'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{orgProfile.correoContacto || 'Sin correo de contacto'}</p>
                    <div className="mt-2">{getRutStatusBadge()}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEditDrawer('organizacion')}
                  className="text-xs font-bold text-brand dark:text-amber-400 hover:text-brand-dark dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer self-start sm:self-center"
                >
                  <FiEdit3 size={13} /> Modificar datos
                </button>
              </div>

              {/* Datos descriptivos */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Descripción pública
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {orgProfile.descripcion || 'Sin descripción registrada para la organización.'}
                  </p>
                </div>
              </div>

              {/* SECCIÓN CARGA DEL RUT (Requerimiento 2.6) */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FiFileText className="text-brand dark:text-amber-400" />
                      <span>Registro Único Tributario (RUT)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Carga el archivo digital de tu RUT para validar y autenticar tu organización en EventHive.
                    </p>
                  </div>
                  <div>{getRutStatusBadge()}</div>
                </div>

                {solicitudVerif?.estado === 'RECHAZADA' && solicitudVerif?.comentarioRechazo && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                    <strong className="block font-bold">Observación de rechazo:</strong>
                    <p>{solicitudVerif.comentarioRechazo}</p>
                  </div>
                )}

                {/* Selector de Archivo RUT */}
                <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-brand dark:text-sky-400 flex items-center justify-center shrink-0">
                        <FiUploadCloud size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {rutFile ? rutFile.name : 'Selecciona el archivo del RUT desde tu equipo'}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {rutFile
                            ? `${(rutFile.size / (1024 * 1024)).toFixed(2)} MB · Listo para cargar`
                            : 'Formatos admitidos: PDF, PNG, JPG (Hasta 10 MB)'}
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
                      />
                      <label
                        htmlFor="rut-file-upload"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors shadow-2xs"
                      >
                        Examinar equipo
                      </label>

                      {rutFile && (
                        <button
                          type="button"
                          onClick={handleSubirRut}
                          disabled={rutUploading}
                          className="px-4 py-2 rounded-xl bg-brand dark:bg-amber-500 hover:bg-brand-dark dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                        >
                          {rutUploading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/40 dark:border-slate-950/40 border-t-white dark:border-t-slate-950 rounded-full animate-spin" />
                              <span>Subiendo...</span>
                            </>
                          ) : (
                            <span>Subir documento</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Aside de Reputación e Información */}
            <aside className="space-y-5">
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Reputación en EventHive
                  </h4>
                  {orgProfile.nivel && (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/80">
                      {orgProfile.nivel.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 shadow-2xs">
                    <FiStar size={24} fill="currentColor" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-3xl font-black text-slate-900 dark:text-white">
                        {orgProfile.promedioRating ? Number(orgProfile.promedioRating).toFixed(1) : '—'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">/ 5.0</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {orgProfile.totalValoraciones} valoraciones · {orgProfile.totalSeguidores} seguidores
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm space-y-2.5">
                <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  Información Institucional
                </h4>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 p-2.5 border border-slate-100 dark:border-slate-800">
                  <FiMail size={16} className="text-brand dark:text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Correo</p>
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{orgProfile.correoContacto || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 p-2.5 border border-slate-100 dark:border-slate-800">
                  <FiShield size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Estado de Cuenta</p>
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{orgProfile.estado || 'REGISTRADA'}</p>
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            {/* Tarjeta de Información del Representante */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-sky-400 text-2xl font-black text-white shadow-md overflow-hidden">
                      {repDisplayImage ? (
                        <img src={repDisplayImage} alt={repProfile.nombre} className="w-full h-full object-cover" />
                      ) : (
                        (repProfile.nombre || 'U').slice(0, 2).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{repProfile.nombre}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{repProfile.correo}</p>
                    {repProfile.rolNombre && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 mt-1">
                        <FiUser size={10} /> {repProfile.rolNombre}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEditDrawer('representante')}
                  className="text-xs font-bold text-brand dark:text-amber-400 hover:text-brand-dark dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <FiEdit3 size={13} /> Modificar datos
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Nombre Completo</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{repProfile.nombre || '—'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Teléfono Móvil</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{repProfile.telefono || 'Sin teléfono registrado'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Correo Electrónico (Principal)</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{repProfile.correo || '—'}</p>
                </div>
              </div>
            </div>

            {/* Actividad en Plataforma */}
            <aside className="space-y-5">
              {activity && (
                <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm space-y-3">
                  <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                    Mi Actividad en EventHive
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-center">
                      <FiShoppingBag className="mx-auto text-brand dark:text-amber-400 mb-1" size={14} />
                      <span className="font-display text-lg font-black text-slate-900 dark:text-white block">{activity.comprasConfirmadas ?? 0}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Compras</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-center">
                      <FiCreditCard className="mx-auto text-brand dark:text-amber-400 mb-1" size={14} />
                      <span className="font-display text-lg font-black text-slate-900 dark:text-white block">{activity.entradasCompradas ?? 0}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Entradas</span>
                    </div>
                  </div>
                </div>
              )}

              {purchases.length > 0 && (
                <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm">
                  <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                    Historial de Compras
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {purchases.map((compra) => (
                      <div key={compra.id} className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                          <span>${Number(compra.total).toLocaleString('es-CO')}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                            {compra.fechaCompra?.replace('T', ' ').slice(0, 16)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}

      {/* ===== MODAL LATERAL DERECHO DE EDICIÓN (Requerimiento 2.5) ===== */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop con blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-[#0E1626] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between animate-slide-left">
              {/* Header del Drawer */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Editar Perfil
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {drawerTab === 'organizacion' ? 'Información de la Organización' : 'Información del Representante'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Contenido / Formulario */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Selector de sección dentro del drawer */}
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-transparent dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setDrawerTab('organizacion')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      drawerTab === 'organizacion' ? 'bg-white dark:bg-[#131E3A] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Organización
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab('representante')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      drawerTab === 'representante' ? 'bg-white dark:bg-[#131E3A] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Representante
                  </button>
                </div>

                {drawerErrors.general && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-3">
                    <FiAlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{drawerErrors.general}</span>
                  </div>
                )}

                {drawerTab === 'organizacion' ? (
                  <form id="org-drawer-form" onSubmit={handleSaveDrawer} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Razón Social / Nombre <span className="text-rose-500">*</span>
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
                      />
                      {drawerErrors.razonSocial && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                          {drawerErrors.razonSocial}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                      />
                      {drawerErrors.correoContacto && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                          {drawerErrors.correoContacto}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                      />
                      {drawerErrors.descripcion && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                          {drawerErrors.descripcion}
                        </p>
                      )}
                    </div>
                  </form>
                ) : (
                  <form id="rep-drawer-form" onSubmit={handleSaveDrawer} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                      />
                      {drawerErrors.repNombre && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                          {drawerErrors.repNombre}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                      />
                    </div>
                  </form>
                )}
              </div>

              {/* Footer del Drawer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-[#070D1B]">
                <button
                  type="button"
                  onClick={() => setIsEditDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveDrawer}
                  disabled={savingDrawer}
                  className="px-5 py-2.5 rounded-xl bg-brand dark:bg-amber-500 hover:bg-brand-dark dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {savingDrawer ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 dark:border-slate-950/40 border-t-white dark:border-t-slate-950 rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar cambios</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
