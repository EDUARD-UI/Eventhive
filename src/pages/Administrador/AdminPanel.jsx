import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout.jsx';

import {
  TrendingUp,
  Building2,
  Calendar,
  ShieldCheck,
  BarChart3,
  Users,
  Tag,
  Percent,
  History,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

// Vistas del Módulo de Administración
import AdminResumenView from './AdminResumenView.jsx';
import AdminOrganizacionesView from './AdminOrganizacionesView.jsx';
import AdminEventosView from './AdminEventosView.jsx';
import AdminModeradoresView from './AdminModeradoresView.jsx';
import AdminReportesView from './AdminReportesView.jsx';
import AdminUsuariosView from './AdminUsuariosView.jsx';
import AdminCategoriasView from './AdminCategoriasView.jsx';
import AdminPromocionesView from './AdminPromocionesView.jsx';
import AdminHistorialView from './AdminHistorialView.jsx';
import AdminSolicitudesView from './AdminSolicitudesView.jsx';
import AdminPerfilView from './AdminPerfilView.jsx';

// Modales del Módulo de Administración
import ModalPerfilOrganizacionAdmin from '../../components/componentsAdmin/ModalPerfilOrganizacionAdmin.jsx';
import ModalSuspenderOrganizacion from '../../components/componentsAdmin/ModalSuspenderOrganizacion.jsx';
import ModalHistorialAuditoria from '../../components/componentsAdmin/ModalHistorialAuditoria.jsx';
import ModalDetalleEventoAdmin from '../../components/componentsAdmin/ModalDetalleEventoAdmin.jsx';
import ModalSuspenderEventoAdmin from '../../components/componentsAdmin/ModalSuspenderEventoAdmin.jsx';
import ModalAsignarModerador from '../../components/componentsAdmin/ModalAsignarModerador.jsx';

// Servicios de Datos
import adminService from '../../features/admin/services/adminService.js';
import {
  AGGREGATED_METRICS,
  COMMERCIAL_METRICS,
  MODERATION_STATS,
  INITIAL_ORGANIZACIONES,
  INITIAL_EVENTS,
  INITIAL_USERS,
  INITIAL_MODERADORES,
  INITIAL_CATEGORIES,
  INITIAL_PROMOTIONS,
  ADMIN_AUDIT_LOG,
} from '../../features/admin/data/mockAdminData.js';

export default function AdminPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'resumen';

  // Estados de datos principales
  const [metrics, setMetrics] = useState(AGGREGATED_METRICS);
  const [commercialMetrics, setCommercialMetrics] = useState(COMMERCIAL_METRICS);
  const [moderationStats, setModerationStats] = useState(MODERATION_STATS);
  const [organizaciones, setOrganizaciones] = useState(INITIAL_ORGANIZACIONES);
  const [eventos, setEventos] = useState(INITIAL_EVENTS);
  const [usuarios, setUsuarios] = useState(INITIAL_USERS);
  const [moderadores, setModeradores] = useState(INITIAL_MODERADORES);
  const [categorias, setCategorias] = useState(INITIAL_CATEGORIES);
  const [promociones, setPromociones] = useState(INITIAL_PROMOTIONS);
  const [auditLogs, setAuditLogs] = useState(ADMIN_AUDIT_LOG);

  // Estados de carga y feedback
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'info', message: '' }

  // Estados de Modales
  const [modalOrgPerfil, setModalOrgPerfil] = useState(null);
  const [modalOrgSuspender, setModalOrgSuspender] = useState(null);
  const [modalEventoDetalle, setModalEventoDetalle] = useState(null);
  const [modalEventoSuspender, setModalEventoSuspender] = useState(null);
  const [modalAuditoria, setModalAuditoria] = useState(null); // { entidad: '', entidadNombre: '', items: [] }
  const [modalModeradorAsignar, setModalModeradorAsignar] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Carga inicial de datos desde adminService
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [dashRes, orgsRes, eventsRes, modsRes, catsRes, promosRes, logsRes] =
          await Promise.allSettled([
            adminService.getDashboardMetrics(),
            adminService.getOrganizaciones(),
            adminService.getEventos(),
            adminService.getModeradores(),
            adminService.getCategorias(),
            adminService.getPromociones(),
            adminService.getHistorialAuditoria(),
          ]);

        if (!isMounted) return;

        if (dashRes.status === 'fulfilled' && dashRes.value?.success) {
          if (dashRes.value.metrics) setMetrics(dashRes.value.metrics);
          if (dashRes.value.commercial) setCommercialMetrics(dashRes.value.commercial);
          if (dashRes.value.moderation) setModerationStats(dashRes.value.moderation);
        }

        if (orgsRes.status === 'fulfilled' && orgsRes.value?.data) {
          setOrganizaciones(orgsRes.value.data);
        }
        if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
          setEventos(eventsRes.value.data);
        }
        if (modsRes.status === 'fulfilled' && modsRes.value?.data) {
          setModeradores(modsRes.value.data);
        }
        if (catsRes.status === 'fulfilled' && catsRes.value?.data) {
          setCategorias(catsRes.value.data);
        }
        if (promosRes.status === 'fulfilled' && promosRes.value?.data) {
          setPromociones(promosRes.value.data);
        }
        if (logsRes.status === 'fulfilled' && logsRes.value?.data) {
          setAuditLogs(logsRes.value.data);
        }
      } catch (err) {
        console.error('Error cargando datos del administrador:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Navegación de pestañas
  const handleSelectTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Contadores dinámicos para los ítems del menú lateral
  const orgsPendientesCount = useMemo(
    () => organizaciones.filter((o) => o.estado === 'PENDIENTE').length,
    [organizaciones]
  );
  const eventosPendientesCount = useMemo(
    () => eventos.filter((e) => e.estado === 'EN_REVISION' || e.estado === 'PENDIENTE').length,
    [eventos]
  );

  // Menú lateral configurado con Lucide Icons consistentes
  const menuItems = useMemo(
    () => [
      { id: 'resumen', label: 'Resumen Global', icon: TrendingUp },
      {
        id: 'organizaciones',
        label: 'Organizaciones',
        icon: Building2,
        count: orgsPendientesCount > 0 ? orgsPendientesCount : null,
      },
      {
        id: 'eventos',
        label: 'Supervisión Eventos',
        icon: Calendar,
        count: eventosPendientesCount > 0 ? eventosPendientesCount : null,
      },
      { id: 'moderadores', label: 'Moderadores & SLA', icon: ShieldCheck },
      { id: 'reportes', label: 'Métricas Comerciales', icon: BarChart3 },
      { id: 'usuarios', label: 'Directorio Usuarios', icon: Users },
      { id: 'categorias', label: 'Categorías', icon: Tag },
      { id: 'promociones', label: 'Promociones & Banners', icon: Percent },
      { id: 'historial', label: 'Historial & Auditoría', icon: History },
      {
        id: 'solicitudes',
        label: 'Admisión (Moderación)',
        icon: ClipboardList,
      },
    ],
    [orgsPendientesCount, eventosPendientesCount]
  );

  // ==================== ACCIONES: ORGANIZACIONES ====================
  const handleVerPerfilOrg = (org) => {
    setModalOrgPerfil(org);
  };

  const handleVerHistorialOrg = (org) => {
    const orgLogs = auditLogs.filter(
      (l) => l.entidad === 'ORGANIZACION' && String(l.entidadId) === String(org.id)
    );
    setModalAuditoria({
      entidad: 'ORGANIZACION',
      entidadNombre: org.nombre,
      items: orgLogs,
    });
  };

  const handleOpenSuspenderOrg = (org) => {
    setModalOrgPerfil(null);
    setModalOrgSuspender(org);
  };

  const handleConfirmSuspenderOrg = async (orgId, motivo) => {
    try {
      const res = await adminService.suspenderOrganizacion(orgId, motivo);
      if (res.success) {
        setOrganizaciones((prev) =>
          prev.map((o) => (o.id === orgId ? { ...o, estado: 'SUSPENDIDA' } : o))
        );
        // Registrar en logs locales
        const newLog = {
          id: Date.now().toString(),
          fecha: new Date().toLocaleString('es-CO'),
          accion: 'SUSPENSIÓN DE ORGANIZACIÓN',
          entidad: 'ORGANIZACION',
          entidadId: orgId,
          entidadNombre: modalOrgSuspender?.nombre || 'Organización',
          detalles: `Motivo: ${motivo}`,
          usuarioNombre: 'Administrador General',
          usuarioRol: 'ADMINISTRADOR',
          ip: '190.25.10.42',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
        showToast(`Organización suspendida exitosamente.`, 'success');
      }
    } catch (err) {
      showToast('Error al suspender la organización.', 'error');
    } finally {
      setModalOrgSuspender(null);
    }
  };

  const handleReactivarOrg = async (org) => {
    if (
      !window.confirm(
        `¿Confirma la reactivación administrativa de la organización "${org.nombre}"?`
      )
    ) {
      return;
    }

    try {
      const res = await adminService.reactivarOrganizacion(org.id);
      if (res.success) {
        setOrganizaciones((prev) =>
          prev.map((o) => (o.id === org.id ? { ...o, estado: 'APROBADA' } : o))
        );
        const newLog = {
          id: Date.now().toString(),
          fecha: new Date().toLocaleString('es-CO'),
          accion: 'REACTIVACIÓN DE ORGANIZACIÓN',
          entidad: 'ORGANIZACION',
          entidadId: org.id,
          entidadNombre: org.nombre,
          detalles: 'Reactivación administrativa conforme a subsanación.',
          usuarioNombre: 'Administrador General',
          usuarioRol: 'ADMINISTRADOR',
          ip: '190.25.10.42',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
        showToast(`Organización "${org.nombre}" reactivada con éxito.`, 'success');
      }
    } catch (err) {
      showToast('Error al reactivar la organización.', 'error');
    }
  };

  // ==================== ACCIONES: EVENTOS ====================
  const handleVerDetalleEvento = (evento) => {
    setModalEventoDetalle(evento);
  };

  const handleVerHistorialEvento = (evento) => {
    const evLogs = auditLogs.filter(
      (l) => l.entidad === 'EVENTO' && String(l.entidadId) === String(evento.id)
    );
    setModalAuditoria({
      entidad: 'EVENTO',
      entidadNombre: evento.titulo,
      items: evLogs,
    });
  };

  const handleOpenSuspenderEvento = (evento) => {
    setModalEventoDetalle(null);
    setModalEventoSuspender(evento);
  };

  const handleConfirmSuspenderEvento = async (eventoId, motivo) => {
    try {
      const res = await adminService.suspenderEvento(eventoId, motivo);
      if (res.success) {
        setEventos((prev) =>
          prev.map((e) => (e.id === eventoId ? { ...e, estado: 'SUSPENDIDO' } : e))
        );
        const newLog = {
          id: Date.now().toString(),
          fecha: new Date().toLocaleString('es-CO'),
          accion: 'SUSPENSIÓN DE EVENTO',
          entidad: 'EVENTO',
          entidadId: eventoId,
          entidadNombre: modalEventoSuspender?.titulo || 'Evento',
          detalles: `Motivo: ${motivo}`,
          usuarioNombre: 'Administrador General',
          usuarioRol: 'ADMINISTRADOR',
          ip: '190.25.10.42',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
        showToast('Evento suspendido administrativamente.', 'success');
      }
    } catch (err) {
      showToast('Error al suspender el evento.', 'error');
    } finally {
      setModalEventoSuspender(null);
    }
  };

  const handleReactivarEvento = async (evento) => {
    if (
      !window.confirm(
        `¿Confirma la reactivación administrativa del evento "${evento.titulo}"?`
      )
    ) {
      return;
    }

    try {
      const res = await adminService.reactivarEvento(evento.id);
      if (res.success) {
        setEventos((prev) =>
          prev.map((e) => (e.id === evento.id ? { ...e, estado: 'PUBLICADO' } : e))
        );
        const newLog = {
          id: Date.now().toString(),
          fecha: new Date().toLocaleString('es-CO'),
          accion: 'REACTIVACIÓN DE EVENTO',
          entidad: 'EVENTO',
          entidadId: evento.id,
          entidadNombre: evento.titulo,
          detalles: 'Reanudación de publicación tras subsanación de requerimientos.',
          usuarioNombre: 'Administrador General',
          usuarioRol: 'ADMINISTRADOR',
          ip: '190.25.10.42',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
        showToast(`Evento "${evento.titulo}" reactivado correctamente.`, 'success');
      }
    } catch (err) {
      showToast('Error al reactivar el evento.', 'error');
    }
  };

  // ==================== ACCIONES: MODERADORES ====================
  const handleOpenAsignarModerador = (mod) => {
    setModalModeradorAsignar(mod);
  };

  const handleSaveAsignacionModerador = async (modId, data) => {
    try {
      const res = await adminService.asignarModerador(modId, data);
      if (res.success) {
        setModeradores((prev) =>
          prev.map((m) =>
            m.id === modId
              ? { ...m, zonaAsignada: data.zonaAsignada, cargaActual: data.cargaActual }
              : m
          )
        );
        showToast('Zona y carga del moderador actualizadas correctamente.', 'success');
      }
    } catch (err) {
      showToast('Error al actualizar moderador.', 'error');
    } finally {
      setModalModeradorAsignar(null);
    }
  };

  const handleToggleEstadoModerador = async (modId, nuevoEstado) => {
    try {
      const res = await adminService.toggleEstadoModerador(modId, nuevoEstado);
      if (res.success) {
        setModeradores((prev) =>
          prev.map((m) => (m.id === modId ? { ...m, activo: nuevoEstado } : m))
        );
        showToast(
          `Acceso de moderador ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`,
          'success'
        );
      }
    } catch (err) {
      showToast('Error al modificar estado del moderador.', 'error');
    }
  };

  // ==================== ACCIONES: USUARIOS Y ROLES ====================
  const handleUpdateUsuario = async (userId, updates) => {
    try {
      const res = await adminService.updateUsuario(userId, updates);
      if (res.success) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
        );
        showToast('Cuenta de usuario actualizada.', 'success');
      }
    } catch (err) {
      showToast('Error al actualizar usuario.', 'error');
    }
  };

  // ==================== ACCIONES: CATEGORÍAS ====================
  const handleSaveCategoria = async (catData) => {
    try {
      const res = await adminService.saveCategoria(catData);
      if (res.success) {
        if (catData.id) {
          setCategorias((prev) =>
            prev.map((c) => (c.id === catData.id ? { ...c, ...catData } : c))
          );
          showToast('Categoría modificada con éxito.', 'success');
        } else {
          setCategorias((prev) => [
            ...prev,
            { ...catData, id: Date.now().toString(), eventosAsociados: 0, activa: true },
          ]);
          showToast('Nueva categoría creada con éxito.', 'success');
        }
      }
    } catch (err) {
      showToast('Error al guardar categoría.', 'error');
    }
  };

  const handleToggleEstadoCategoria = async (catId, nuevoEstado) => {
    try {
      const res = await adminService.toggleEstadoCategoria(catId, nuevoEstado);
      if (res.success) {
        setCategorias((prev) =>
          prev.map((c) => (c.id === catId ? { ...c, activa: nuevoEstado } : c))
        );
        showToast(
          `Categoría ${nuevoEstado ? 'activada' : 'desactivada'} satisfactoriamente.`,
          'success'
        );
      }
    } catch (err) {
      showToast('Error al cambiar estado de la categoría.', 'error');
    }
  };

  const handleEliminarCategoria = async (catId) => {
    const cat = categorias.find((c) => c.id === catId);
    if (!cat) return;

    if (cat.eventosAsociados > 0) {
      alert(
        `Salvaguarda de Integridad (Sección 7): La categoría "${cat.nombre}" tiene ${cat.eventosAsociados} eventos vinculados. Por favor, desactívela en lugar de eliminarla para preservar los tiquetes y publicaciones.`
      );
      return;
    }

    if (!window.confirm(`¿Eliminar definitivamente la categoría "${cat.nombre}"?`)) {
      return;
    }

    try {
      const res = await adminService.deleteCategoria(catId);
      if (res.success) {
        setCategorias((prev) => prev.filter((c) => c.id !== catId));
        showToast('Categoría eliminada de la plataforma.', 'success');
      }
    } catch (err) {
      showToast('Error al eliminar categoría.', 'error');
    }
  };

  // ==================== ACCIONES: PROMOCIONES ====================
  const handleSavePromocion = async (promoData) => {
    try {
      const res = await adminService.savePromocion(promoData);
      if (res.success) {
        if (promoData.id) {
          setPromociones((prev) =>
            prev.map((p) => (p.id === promoData.id ? { ...p, ...promoData } : p))
          );
          showToast('Promoción actualizada con éxito.', 'success');
        } else {
          setPromociones((prev) => [
            ...prev,
            { ...promoData, id: Date.now().toString(), usosActuales: 0, activa: true },
          ]);
          showToast('Nueva promoción global publicada.', 'success');
        }
      }
    } catch (err) {
      showToast('Error al guardar promoción.', 'error');
    }
  };

  const handleToggleEstadoPromocion = async (promoId, nuevoEstado) => {
    try {
      const res = await adminService.toggleEstadoPromocion(promoId, nuevoEstado);
      if (res.success) {
        setPromociones((prev) =>
          prev.map((p) => (p.id === promoId ? { ...p, activa: nuevoEstado } : p))
        );
        showToast(
          `Promoción ${nuevoEstado ? 'activada' : 'pausada'} con éxito.`,
          'success'
        );
      }
    } catch (err) {
      showToast('Error al cambiar estado de la promoción.', 'error');
    }
  };

  // Renderizar la vista correspondiente a la pestaña activa
  const renderCurrentView = () => {
    switch (currentTab) {
      case 'resumen':
        return (
          <AdminResumenView
            metrics={metrics}
            commercialMetrics={commercialMetrics}
            organizaciones={organizaciones}
            eventos={eventos}
            auditLogs={auditLogs}
            onNavigateTab={handleSelectTab}
            onVerOrganizacion={handleVerPerfilOrg}
            onVerEvento={handleVerDetalleEvento}
          />
        );

      case 'organizaciones':
        return (
          <AdminOrganizacionesView
            organizaciones={organizaciones}
            onVerPerfil={handleVerPerfilOrg}
            onVerHistorial={handleVerHistorialOrg}
            onSuspender={handleOpenSuspenderOrg}
            onReactivar={handleReactivarOrg}
          />
        );

      case 'eventos':
        return (
          <AdminEventosView
            eventos={eventos}
            onVerDetalle={handleVerDetalleEvento}
            onVerHistorial={handleVerHistorialEvento}
            onSuspenderEvento={handleOpenSuspenderEvento}
            onReactivarEvento={handleReactivarEvento}
          />
        );

      case 'moderadores':
        return (
          <AdminModeradoresView
            moderadores={moderadores}
            moderationStats={moderationStats}
            onAsignarModerador={handleOpenAsignarModerador}
            onToggleEstadoModerador={handleToggleEstadoModerador}
          />
        );

      case 'reportes':
        return (
          <AdminReportesView
            commercialMetrics={commercialMetrics}
            organizaciones={organizaciones}
            eventos={eventos}
          />
        );

      case 'usuarios':
      case 'roles':
      case 'niveles':
        return (
          <AdminUsuariosView
            usuarios={usuarios}
            onUpdateUsuario={handleUpdateUsuario}
          />
        );

      case 'categorias':
        return (
          <AdminCategoriasView
            categorias={categorias}
            onSaveCategoria={handleSaveCategoria}
            onToggleEstadoCategoria={handleToggleEstadoCategoria}
            onEliminarCategoria={handleEliminarCategoria}
          />
        );

      case 'promociones':
        return (
          <AdminPromocionesView
            promociones={promociones}
            onSavePromocion={handleSavePromocion}
            onToggleEstadoPromocion={handleToggleEstadoPromocion}
          />
        );

      case 'historial':
        return <AdminHistorialView auditLogs={auditLogs} />;

      case 'solicitudes':
        return (
          <AdminSolicitudesView
            organizaciones={organizaciones}
            onNavigateTab={handleSelectTab}
            onVerPerfil={handleVerPerfilOrg}
          />
        );

      case 'perfil':
        return (
          <AdminPerfilView
            onNavigateTab={handleSelectTab}
            showToast={showToast}
          />
        );

      default:
        return (
          <AdminResumenView
            metrics={metrics}
            commercialMetrics={commercialMetrics}
            organizaciones={organizaciones}
            eventos={eventos}
            auditLogs={auditLogs}
            onNavigateTab={handleSelectTab}
            onVerOrganizacion={handleVerPerfilOrg}
            onVerEvento={handleVerDetalleEvento}
          />
        );
    }
  };

  return (
    <AdminLayout
      menuItems={menuItems}
      activeItem={currentTab}
      onSelect={handleSelectTab}
      title="Administración Central"
      badgeText="Event Hive Control"
    >
      {/* Toast de Notificaciones Flotante */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md text-xs font-semibold ${
              toast.type === 'error'
                ? 'bg-rose-50/95 border-rose-200 text-rose-800'
                : toast.type === 'info'
                ? 'bg-indigo-50/95 border-indigo-200 text-indigo-800'
                : 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-700 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Contenido Dinámico de la Pestaña Activa */}
      {renderCurrentView()}

      {/* ================= MODALES ORQUESTADOS ================= */}

      {/* 1. Modal Perfil Administrativo de Organización (Distingue sensible vs público) */}
      {modalOrgPerfil && (
        <ModalPerfilOrganizacionAdmin
          organizacion={modalOrgPerfil}
          onClose={() => setModalOrgPerfil(null)}
          onSuspender={handleOpenSuspenderOrg}
          onReactivar={handleReactivarOrg}
        />
      )}

      {/* 2. Modal Suspender Organización con Justificación Obligatoria */}
      {modalOrgSuspender && (
        <ModalSuspenderOrganizacion
          organizacion={modalOrgSuspender}
          onClose={() => setModalOrgSuspender(null)}
          onConfirm={handleConfirmSuspenderOrg}
        />
      )}

      {/* 3. Modal Detalle Evento para Auditoría */}
      {modalEventoDetalle && (
        <ModalDetalleEventoAdmin
          evento={modalEventoDetalle}
          onClose={() => setModalEventoDetalle(null)}
          onSuspender={handleOpenSuspenderEvento}
          onReactivar={handleReactivarEvento}
        />
      )}

      {/* 4. Modal Suspender Evento con Motivo */}
      {modalEventoSuspender && (
        <ModalSuspenderEventoAdmin
          evento={modalEventoSuspender}
          onClose={() => setModalEventoSuspender(null)}
          onConfirm={handleConfirmSuspenderEvento}
        />
      )}

      {/* 5. Modal Historial y Trazabilidad */}
      {modalAuditoria && (
        <ModalHistorialAuditoria
          entidad={modalAuditoria.entidad}
          entidadNombre={modalAuditoria.entidadNombre}
          logs={modalAuditoria.items}
          onClose={() => setModalAuditoria(null)}
        />
      )}

      {/* 6. Modal Asignar Moderador */}
      {modalModeradorAsignar && (
        <ModalAsignarModerador
          moderador={modalModeradorAsignar}
          onClose={() => setModalModeradorAsignar(null)}
          onSave={handleSaveAsignacionModerador}
        />
      )}
    </AdminLayout>
  );
}
