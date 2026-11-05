import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { userService } from '../../services/userService.js';
import { organizerService, organizationService } from '../../services/organizerService.js';
import followService from '../../services/followService.js';
import { normalizeEvent } from '../../services/eventService.js';
import { session } from '../../services/session.js';
import { formatPrice, formatHora12 } from '../../utils/formatters.js';
import { sanitizeText, sanitizePhone } from '../../utils/sanitizer.js';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../../utils/alertUtils.js';

const formatBoletoFecha = (fechaRaw) => {
  if (!fechaRaw) return 'Fecha por confirmar';
  if (typeof fechaRaw === 'string') {
    const trimmed = fechaRaw.trim();
    if (trimmed.includes('T') || (trimmed.includes('-') && trimmed.length >= 10)) {
      try {
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }
      } catch {
        // fallback
      }
    }
  }
  return fechaRaw;
};

// Helpers para persistencia de organizaciones seguidas por usuario
const getStoredFollowedIds = (userId) => {
  try {
    const raw = localStorage.getItem(`eventhive_following_${userId || 'guest'}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredFollowedIds = (userId, ids) => {
  try {
    localStorage.setItem(`eventhive_following_${userId || 'guest'}`, JSON.stringify(ids));
  } catch {
    // ignore
  }
};

export function usePerfilUsuario() {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'guardados';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetTab = params.get('tab') || location.state?.activeTab;
    if (targetTab) {
      setActiveTab(targetTab);
    }
  }, [location]);

  const [ticketModal, setTicketModal] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Datos reales del usuario
  const [usuario, setUsuario] = useState({
    id: null,
    nombreCompleto: '',
    correo: '',
    telefono: '',
    rol: 'CLIENTE',
    urlImagenPerfil: null,
    notifEmail: true,
    notifWhatsapp: true,
  });

  // Estado para carga de foto de perfil
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Datos reales de listas
  const [guardados, setGuardados] = useState([]);
  const [compras, setCompras] = useState([]);
  const [organizacionesSeguidas, setOrganizacionesSeguidas] = useState([]);
  const [organizacionesDisponibles, setOrganizacionesDisponibles] = useState([]);

  // Formulario cambio de clave
  const [passwordForm, setPasswordForm] = useState({
    claveActual: '',
    claveNueva: '',
    confirmarClave: '',
  });

  // Cargar datos reales desde los endpoints
  useEffect(() => {
    let isMounted = true;

    async function loadProfileData() {
      setLoading(true);
      const sessionUser = session.getUser() || {};

      try {
        // Ejecución concurrente y optimizada de todas las peticiones iniciales del perfil
        const [perfilRes, deseosRes, comprasRes, orgsRes, seguidasRes] = await Promise.allSettled([
          userService.getPerfil(),
          organizerService.getDeseos({ page: 0, size: 50 }),
          organizerService.getMisCompras({ page: 0, size: 50 }),
          organizationService.listOrganizations({ page: 0, size: 50, skipAuth: true }),
          organizationService.getOrganizacionesSeguidas({ page: 0, size: 50 }),
        ]);

        if (!isMounted) return;

        // 1. Procesar perfil del usuario
        if (perfilRes.status === 'fulfilled' && perfilRes.value) {
          const perfilData = perfilRes.value;
          setUsuario((prev) => ({
            ...prev,
            id: perfilData.id || sessionUser.id,
            nombreCompleto: perfilData.nombre || sessionUser.name || 'Usuario',
            correo: perfilData.correo || sessionUser.email || '',
            telefono: perfilData.telefono ? sanitizePhone(perfilData.telefono) : '',
            rol: perfilData.rol || sessionUser.role || 'CLIENTE',
            urlImagenPerfil:
              perfilData.urlImagenPerfil ||
              perfilData.imagen ||
              perfilData.foto ||
              sessionUser.urlImagenPerfil ||
              sessionUser.avatar ||
              null,
          }));
        } else {
          setUsuario((prev) => ({
            ...prev,
            nombreCompleto: sessionUser.name || 'Usuario',
            correo: sessionUser.email || '',
            urlImagenPerfil: sessionUser.urlImagenPerfil || sessionUser.avatar || null,
          }));
        }

        // 2. Procesar eventos guardados (Deseos)
        if (deseosRes.status === 'fulfilled' && deseosRes.value) {
          const items = Array.isArray(deseosRes.value)
            ? deseosRes.value
            : deseosRes.value?.content || deseosRes.value?.data || [];
          const normalized = items.map((item) => normalizeEvent(item.evento || item));
          setGuardados(normalized);
        } else {
          setGuardados([]);
        }

        // 3. Procesar mis compras y boletos (con aislamiento por usuario en localStorage)
        const userStorageKey = sessionUser?.id ? `eventhive_local_compras_${sessionUser.id}` : null;
        let localCompras = [];
        try {
          if (userStorageKey) {
            localCompras = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
          }
          if (localCompras.length === 0) {
            const legacyCompras = JSON.parse(localStorage.getItem('eventhive_local_compras') || '[]');
            localCompras = legacyCompras.filter((item) => {
              if (item?.userId && sessionUser?.id) return String(item.userId) === String(sessionUser.id);
              if (item?.userEmail && sessionUser?.email) {
                return String(item.userEmail).toLowerCase() === String(sessionUser.email).toLowerCase();
              }
              return false;
            });
          }
        } catch {
          localCompras = [];
        }

        if (comprasRes.status === 'fulfilled' && comprasRes.value) {
          const itemsCompras = Array.isArray(comprasRes.value)
            ? comprasRes.value
            : comprasRes.value?.content || comprasRes.value?.data || [];
          setCompras([...localCompras, ...itemsCompras]);
        } else {
          setCompras(localCompras);
        }

        // 4. Procesar organizaciones y seguidas
        if (orgsRes.status === 'fulfilled' && orgsRes.value) {
          const allOrgs = orgsRes.value.organizations || [];
          const seguidasBackend =
            seguidasRes.status === 'fulfilled' && Array.isArray(seguidasRes.value)
              ? seguidasRes.value
              : [];

          const storedFollowed = new Set(getStoredFollowedIds(sessionUser.id));
          seguidasBackend.forEach((o) => storedFollowed.add(String(o.id)));
          saveStoredFollowedIds(sessionUser.id, Array.from(storedFollowed));

          const seguidasList = allOrgs.filter((org) => storedFollowed.has(String(org.id)));
          seguidasBackend.forEach((bOrg) => {
            if (!seguidasList.some((s) => String(s.id) === String(bOrg.id))) {
              seguidasList.push(bOrg);
            }
          });

          const disponiblesList = allOrgs.filter((org) => !storedFollowed.has(String(org.id)));
          setOrganizacionesSeguidas(seguidasList);
          setOrganizacionesDisponibles(disponiblesList);
        } else {
          setOrganizacionesSeguidas([]);
          setOrganizacionesDisponibles([]);
        }
      } catch (err) {
        console.warn('Error en carga concurrente de perfil:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Formatear boletos a partir de las compras
  const boletosList = useMemo(() => {
    const list = [];
    compras.forEach((compra) => {
      const evento = compra.evento || {};
      const localidad = compra.localidad || {};
      const boletos = compra.boletos || [];

      if (boletos.length > 0) {
        boletos.forEach((b) => {
          list.push({
            id: b.codigo || `TKT-${b.id || compra.id}`,
            compraId: compra.id,
            evento: b.eventoTitulo || evento.titulo || compra.eventoTitulo || 'Evento EventHive',
            eventoId: evento.id || b.eventoId,
            fecha: formatBoletoFecha(evento.fecha || compra.fechaCompra),
            hora: evento.hora ? formatHora12(evento.hora) : 'Hora por confirmar',
            lugar: evento.lugar || evento.ubicacion || 'Cartagena de Indias',
            zona: b.localidadNombre || localidad.nombre || 'Entrada General',
            asiento: b.asiento || b.numeroAsiento || 'Acceso General',
            titular: b.titular || usuario.nombreCompleto || 'Titular',
            precio: b.precio ? formatPrice(b.precio) : formatPrice(compra.total || 0),
            estado: b.estado || compra.estado || 'Válido para ingreso',
            codigoQR: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
              b.codigo || `TKT-${b.id || compra.id}-${usuario.nombreCompleto}`
            )}`,
          });
        });
      } else {
        const cantidad = compra.cantidad || 1;
        for (let i = 1; i <= cantidad; i++) {
          const tktId = `TKT-${compra.id}-${i}`;
          list.push({
            id: tktId,
            compraId: compra.id,
            evento: evento.titulo || compra.eventoTitulo || 'Evento EventHive',
            eventoId: evento.id || compra.eventoId,
            fecha: formatBoletoFecha(evento.fecha || compra.fechaCompra),
            hora: evento.hora ? formatHora12(evento.hora) : 'Hora por confirmar',
            lugar: evento.lugar || evento.ubicacion || 'Cartagena de Indias',
            zona: localidad.nombre || compra.localidadNombre || 'Entrada General',
            asiento: `Boleto #${i}`,
            titular: usuario.nombreCompleto || 'Titular',
            precio: formatPrice(compra.total || 0),
            estado: compra.estado || 'Válido para ingreso',
            codigoQR: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
              `${tktId}-${usuario.nombreCompleto}`
            )}`,
          });
        }
      }
    });
    return list;
  }, [compras, usuario.nombreCompleto]);

  // Clasificar eventos de compras en Próximos e Historial
  const { eventosProximos, eventosHistorial } = useMemo(() => {
    const proximos = [];
    const historial = [];
    const now = new Date();

    compras.forEach((compra) => {
      const ev = compra.evento ? normalizeEvent(compra.evento) : null;
      if (!ev) return;

      const eventDate = ev.startsAt ? new Date(ev.startsAt) : null;
      if (eventDate && eventDate < now) {
        historial.push(ev);
      } else {
        proximos.push(ev);
      }
    });

    return { eventosProximos: proximos, eventosHistorial: historial };
  }, [compras]);

  // Eliminar deseo de favoritos
  const handleRemoveDeseo = async (e, eventoId) => {
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();

    try {
      await organizerService.eliminarDeseo(eventoId);
      setGuardados((prev) => prev.filter((ev) => String(ev.id) !== String(eventoId)));
      await showSuccessAlert({
        title: 'Eliminado',
        text: 'Evento eliminado de tus favoritos.',
        badge: 'Favorito Removido',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      await showErrorAlert({
        title: 'Error',
        text: 'No se pudo eliminar el evento de tus favoritos.',
        badge: 'Operación Fallida',
      });
    }
  };

  // Manejo de selección de foto
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showWarningAlert({
        title: 'Archivo no válido',
        text: 'Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).',
        badge: 'Formato Inválido',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showWarningAlert({
        title: 'Imagen muy pesada',
        text: 'El tamaño de la imagen no debe superar los 5MB.',
        badge: 'Tamaño Excedido',
      });
      return;
    }
    setSelectedPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Subir foto de perfil (PUT /api/usuarios/perfil/imagen)
  const handleUploadPhoto = async () => {
    if (!selectedPhotoFile) return;
    setIsUploadingPhoto(true);
    try {
      const res = await userService.uploadFotoPerfil(selectedPhotoFile);
      const newUrl = res?.urlImagenPerfil || res?.url || res?.data?.urlImagenPerfil || photoPreview;
      setUsuario((prev) => ({
        ...prev,
        urlImagenPerfil: newUrl,
      }));
      session.updateUser({
        urlImagenPerfil: newUrl,
        fotoUrl: newUrl,
        foto: newUrl,
        avatar: newUrl,
      });
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
      await showSuccessAlert({
        title: 'Foto actualizada',
        text: 'Tu foto de perfil ha sido actualizada exitosamente.',
        badge: 'Foto de Perfil',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      await showErrorAlert({
        title: 'Error al subir foto',
        text: err.message || 'No se pudo actualizar tu foto de perfil. Intenta de nuevo.',
        badge: 'Carga Fallida',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelPhoto = () => {
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Guardar datos de perfil y foto unificados
  const handleUpdatePerfil = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const cleanNombre = sanitizeText(usuario.nombreCompleto);
    if (!cleanNombre) {
      showWarningAlert({
        title: 'Atención',
        text: 'El nombre es obligatorio.',
        badge: 'Dato Requerido',
      });
      return;
    }

    const cleanPhone = sanitizePhone(usuario.telefono);
    if (usuario.telefono && cleanPhone.length > 10) {
      showWarningAlert({
        title: 'Atención',
        text: 'El teléfono no puede superar los 10 dígitos.',
        badge: 'Teléfono Inválido',
      });
      return;
    }

    try {
      setIsUpdating(true);
      let updatedPhotoUrl = usuario.urlImagenPerfil;

      // 1. Si seleccionó una nueva foto, subirla
      if (selectedPhotoFile) {
        try {
          const res = await userService.uploadFotoPerfil(selectedPhotoFile);
          updatedPhotoUrl = res?.urlImagenPerfil || res?.url || res?.data?.urlImagenPerfil || photoPreview;
        } catch (photoErr) {
          console.warn('Error al subir foto:', photoErr);
        }
      }

      // 2. Actualizar datos de texto
      await userService.updatePerfil({
        nombre: cleanNombre,
        telefono: cleanPhone,
      });

      // 3. Actualizar sesión local
      session.updateUser({
        name: cleanNombre,
        nombre: cleanNombre,
        telefono: cleanPhone,
        urlImagenPerfil: updatedPhotoUrl,
        fotoUrl: updatedPhotoUrl,
        foto: updatedPhotoUrl,
        avatar: updatedPhotoUrl,
      });

      setUsuario((prev) => ({
        ...prev,
        nombreCompleto: cleanNombre,
        telefono: cleanPhone,
        urlImagenPerfil: updatedPhotoUrl,
      }));

      setSelectedPhotoFile(null);
      setPhotoPreview(null);

      await showSuccessAlert({
        title: '¡Perfil actualizado!',
        text: 'Tus datos personales y foto de perfil se guardaron correctamente.',
        badge: 'Datos Guardados',
        timer: 1800,
        showConfirmButton: false,
      });
      setEditModal(false);
    } catch (err) {
      await showErrorAlert({
        title: 'Error al actualizar',
        text: err.message || 'No fue posible actualizar tu perfil.',
        badge: 'Actualización Fallida',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!passwordForm.claveActual) {
      showWarningAlert({
        title: 'Atención',
        text: 'Ingresa tu contraseña actual.',
        badge: 'Campo Requerido',
      });
      return;
    }
    if (!passwordForm.claveNueva || passwordForm.claveNueva.length < 6) {
      showWarningAlert({
        title: 'Atención',
        text: 'La nueva contraseña debe tener al menos 6 caracteres.',
        badge: 'Seguridad de Clave',
      });
      return;
    }
    if (passwordForm.claveNueva !== passwordForm.confirmarClave) {
      showWarningAlert({
        title: 'Atención',
        text: 'La confirmación de la nueva contraseña no coincide.',
        badge: 'Contraseñas no coinciden',
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      await userService.changePassword(passwordForm.claveActual, passwordForm.claveNueva);
      await showSuccessAlert({
        title: 'Contraseña cambiada',
        text: 'Tu contraseña se ha actualizado exitosamente.',
        badge: 'Clave Actualizada',
      });
      setPasswordForm({ claveActual: '', claveNueva: '', confirmarClave: '' });
    } catch (err) {
      await showErrorAlert({
        title: 'No se pudo cambiar la contraseña',
        text: err.message || 'Verifica tu contraseña actual e intenta de nuevo.',
        badge: 'Cambio Fallido',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Seguir una organización real
  const handleFollowOrg = async (org) => {
    if (!org?.id) return;
    const orgId = String(org.id);
    const sessionUser = session.getUser() || {};
    const ownOrganizationId =
      sessionUser.organizacionId ??
      sessionUser.organizationId ??
      sessionUser.organizacion?.id ??
      sessionUser.organization?.id;
    const representativeId =
      org.representante?.id ?? org.representanteId ?? org.representanteLegalId;
    if (
      (ownOrganizationId && String(ownOrganizationId) === orgId) ||
      (sessionUser.id && representativeId && String(sessionUser.id) === String(representativeId))
    ) {
      await showWarningAlert(
        'No puedes seguir tu organización',
        'Los miembros de una organización no pueden seguir a su propia organización.'
      );
      return;
    }

    try {
      await organizationService.followOrganization(orgId);
    } catch (err) {
      await showErrorAlert({
        title: 'No se pudo seguir la organización',
        text: err.message || 'Intenta de nuevo más tarde.',
      });
      return;
    }

    const currentStored = new Set(getStoredFollowedIds(sessionUser.id));
    currentStored.add(orgId);
    saveStoredFollowedIds(sessionUser.id, Array.from(currentStored));
    followService.notifyChange(orgId, true);

    const updatedOrg = { ...org, followers: (Number(org.followers) || 0) + 1 };
    setOrganizacionesSeguidas((prev) => [...prev.filter((o) => String(o.id) !== orgId), updatedOrg]);
    setOrganizacionesDisponibles((prev) => prev.filter((o) => String(o.id) !== orgId));

    await showSuccessAlert({
      title: '¡Siguiendo organización!',
      text: `Ahora sigues a ${org.name || org.razonSocial || 'la organización'}.`,
      badge: 'Siguiendo',
      timer: 1600,
      showConfirmButton: false,
    });
  };

  // Dejar de seguir una organización
  const handleUnfollowOrg = async (org) => {
    if (!org?.id) return;
    const orgId = String(org.id);
    const sessionUser = session.getUser() || {};

    try {
      await organizationService.unfollowOrganization(orgId);
    } catch (err) {
      await showErrorAlert({
        title: 'No se pudo dejar de seguir la organización',
        text: err.message || 'Intenta de nuevo más tarde.',
      });
      return;
    }

    const currentStored = new Set(getStoredFollowedIds(sessionUser.id));
    currentStored.delete(orgId);
    saveStoredFollowedIds(sessionUser.id, Array.from(currentStored));
    followService.notifyChange(orgId, false);

    const updatedOrg = { ...org, followers: Math.max(0, (Number(org.followers) || 1) - 1) };
    setOrganizacionesSeguidas((prev) => prev.filter((o) => String(o.id) !== orgId));
    setOrganizacionesDisponibles((prev) => [updatedOrg, ...prev.filter((o) => String(o.id) !== orgId)]);

    await showSuccessAlert({
      title: 'Dejaste de seguir',
      text: `Has dejado de seguir a ${org.name || org.razonSocial || 'la organización'}.`,
      badge: 'Organización',
      timer: 1600,
      showConfirmButton: false,
    });
  };

  return {
    activeTab,
    setActiveTab,
    ticketModal,
    setTicketModal,
    editModal,
    setEditModal,
    loading,
    isUpdating,
    isChangingPassword,
    usuario,
    setUsuario,
    selectedPhotoFile,
    photoPreview,
    isUploadingPhoto,
    fileInputRef,
    guardados,
    organizaciones: organizacionesSeguidas,
    organizacionesSeguidas,
    organizacionesDisponibles,
    boletosList,
    eventosProximos,
    eventosHistorial,
    passwordForm,
    setPasswordForm,
    handleRemoveDeseo,
    handleFollowOrg,
    handleUnfollowOrg,
    handlePhotoSelect,
    handleUploadPhoto,
    handleCancelPhoto,
    handleUpdatePerfil,
    handleChangePassword,
  };
}
