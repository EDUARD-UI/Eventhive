import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ModeradorLayout from '../../layouts/ModeradorLayout.jsx';
import ModeradorResumenView from './ModeradorResumenView.jsx';
import ModeradorPendientesView from './ModeradorPendientesView.jsx';
import ModeradorHistorialView from './ModeradorHistorialView.jsx';
import ModeradorPerfilView from './ModeradorPerfilView.jsx';
import ModeradorPalabrasProhibidasView from './ModeradorPalabrasProhibidasView.jsx';

import ModalDetalleEventoModeracion from './ModalDetalleEventoModeracion.jsx';
import ModalAccionModeracion from './ModalAccionModeracion.jsx';
import moderationService from '../../services/moderationService.js';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alertUtils.js';
import {
  FiTrendingUp,
  FiClipboard,
  FiLayers,
  FiUser,
  FiShield,
} from 'react-icons/fi';

export default function ModeradorPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'resumen';

  // Loader de bienvenida inicial del dashboard
  const [pageLoading, setPageLoading] = useState(true);

  // Estados de datos reales
  const [stats, setStats] = useState({
    publicados: 0,
    pendientesRevision: 0,
    enCorreccion: 0,
    rechazados: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Eventos pendientes paginados
  const [pendientes, setPendientes] = useState([]);
  const [pagedData, setPagedData] = useState(null);
  const [pendientesLoading, setPendientesLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Motivos reales del backend
  const [motivos, setMotivos] = useState([]);
  const [motivosLoading, setMotivosLoading] = useState(false);

  // Modales
  const [eventoModalDetalle, setEventoModalDetalle] = useState(null);
  const [accionModal, setAccionModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Cargar Estadísticas reales del Moderador
  const fetchEstadisticas = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await moderationService.getEstadisticas();
      if (res) {
        setStats(res);
      }
    } catch (err) {
      console.error('Error cargando estadísticas de moderación:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 2. Cargar Eventos Pendientes de Moderación
  const fetchPendientes = useCallback(async (targetPage = 0, targetSize = 10) => {
    try {
      setPendientesLoading(true);
      const res = await moderationService.getEventosPendientes({
        page: targetPage,
        size: targetSize,
      });

      const content = res?.content || (Array.isArray(res) ? res : []);
      setPendientes(content);
      setPagedData(res);
    } catch (err) {
      console.error('Error cargando eventos pendientes:', err);
      setPendientes([]);
      setPagedData(null);
    } finally {
      setPendientesLoading(false);
    }
  }, []);

  // 3. Cargar Motivos Oficiales de Rechazo / Corrección
  const fetchMotivos = useCallback(async () => {
    try {
      setMotivosLoading(true);
      const res = await moderationService.getMotivosRechazo();
      if (Array.isArray(res)) {
        setMotivos(res);
      }
    } catch (err) {
      console.error('Error cargando motivos de rechazo:', err);
      setMotivos([]);
    } finally {
      setMotivosLoading(false);
    }
  }, []);

  const isMountedRef = useRef(false);

  // Efecto inicial concurrente sin demoras artificiales
  useEffect(() => {
    const p1 = fetchEstadisticas();
    const p2 = fetchMotivos();
    const p3 = fetchPendientes(page, size);

    Promise.allSettled([p1, p2, p3]).finally(() => {
      setPageLoading(false);
      isMountedRef.current = true;
    });
  }, [fetchEstadisticas, fetchMotivos]);

  // Efecto de paginación de pendientes (solo ante cambios posteriores de página/tamaño)
  useEffect(() => {
    if (isMountedRef.current) {
      fetchPendientes(page, size);
    }
  }, [page, size, fetchPendientes]);

  // Acciones de Moderación
  const handleAprobarEvento = async (eventoId) => {
    try {
      setActionLoading(true);
      await moderationService.aprobarEvento(eventoId);
      await showSuccessAlert({
        title: '¡Evento en cartelera!',
        text: 'La producción ya está visible al público.',
      });
      setEventoModalDetalle(null);
      fetchPendientes(page, size);
      fetchEstadisticas();
    } catch (err) {
      showErrorAlert('No fue posible aprobar el evento', err?.message || 'Intenta nuevamente en unos momentos.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSolicitarCorreccion = async (eventoId, { observacion, motivo }) => {
    try {
      setActionLoading(true);
      await moderationService.solicitarCorreccion(eventoId, observacion, motivo);
      showToast('Ticket de subsanación emitido a la organización.', 'success');
      setEventoModalDetalle(null);
      setAccionModal(null);
      fetchPendientes(page, size);
      fetchEstadisticas();
    } catch (err) {
      showErrorAlert('No fue posible solicitar la corrección', err?.message || 'Intenta nuevamente en unos momentos.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazarEvento = async (eventoId, { observacion, motivo }) => {
    try {
      setActionLoading(true);
      await moderationService.rechazarEvento(eventoId, observacion, motivo);
      showToast('Resolución de exclusión emitida para la producción.', 'info');
      setEventoModalDetalle(null);
      setAccionModal(null);
      fetchPendientes(page, size);
      fetchEstadisticas();
    } catch (err) {
      showErrorAlert('No fue posible registrar el rechazo', err?.message || 'Intenta nuevamente en unos momentos.');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPendientesCount = pagedData?.totalElements ?? pendientes.length;

  // Menú del Sidebar del Moderador con badge dinámico y nuevo apartado de palabras prohibidas
  const menuItems = useMemo(
    () => [
      { id: 'resumen', label: 'Resumen', icon: FiTrendingUp, count: null },
      {
        id: 'eventos',
        label: 'Eventos Pendientes',
        icon: FiClipboard,
        count: totalPendientesCount > 0 ? String(totalPendientesCount).padStart(2, '0') : null,
      },
      { id: 'historial', label: 'Explorar Eventos', icon: FiLayers, count: null },
      { id: 'palabras-prohibidas', label: 'Palabras Prohibidas', icon: FiShield, count: null },
      { id: 'perfil', label: 'Mi perfil', icon: FiUser, count: null },
    ],
    [totalPendientesCount]
  );

  const titlesByTab = {
    resumen: {
      title: 'MODERACIÓN Y CONTROL DE CARTELERA',
      subtitle: 'Supervisión editorial, validación de requisitos y seguimiento de eventos en Cartagena.',
    },
    eventos: {
      title: 'BANDEJA DE EVENTOS PENDIENTES',
      subtitle: 'Bandeja de solicitudes de publicación que requieren moderación',
    },
    historial: {
      title: 'EXPLORAR EVENTOS',
      subtitle: 'Búsqueda por estado, historial de moderación y auditoría',
    },
    'palabras-prohibidas': {
      title: 'DICCIONARIO DE PALABRAS PROHIBIDAS',
      subtitle: 'Diccionario de términos restringidos y reglas de filtro de contenido',
    },
    perfil: {
      title: 'MI PERFIL',
      subtitle: 'Administra tus datos personales, credenciales y estado operativo',
    },
  };

  const activeHeaderInfo = titlesByTab[currentTab] || titlesByTab.resumen;

  return (
    <ModeradorLayout
      menuItems={menuItems}
      activeItem={currentTab}
      onSelect={(tabId) => setSearchParams({ tab: tabId })}
      title={activeHeaderInfo.title}
      subtitle={activeHeaderInfo.subtitle}
    >
      {/* Vistas según la pestaña activa */}
      {currentTab === 'resumen' && (
        <ModeradorResumenView
          stats={stats}
          statsLoading={statsLoading}
          pendientes={pendientes}
          pendientesLoading={pendientesLoading}
          totalPendientes={totalPendientesCount}
          actionLoading={actionLoading}
          onNavigateTab={(tab) => setSearchParams({ tab })}
          onInspect={setEventoModalDetalle}
          onAprobar={handleAprobarEvento}
          onSolicitarCorreccion={(evento) =>
            setAccionModal({ evento, tipo: 'correccion' })
          }
          onRechazar={(evento) => setAccionModal({ evento, tipo: 'rechazo' })}
        />
      )}

      {currentTab === 'eventos' && (
        <ModeradorPendientesView
          pendientes={pendientes}
          pagedData={pagedData}
          loading={pendientesLoading}
          actionLoading={actionLoading}
          page={page}
          size={size}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setSize(newSize);
            setPage(0);
          }}
          onInspect={setEventoModalDetalle}
          onAprobar={handleAprobarEvento}
          onSolicitarCorreccion={(evento) =>
            setAccionModal({ evento, tipo: 'correccion' })
          }
          onRechazar={(evento) => setAccionModal({ evento, tipo: 'rechazo' })}
        />
      )}

      {currentTab === 'historial' && (
        <ModeradorHistorialView
          onInspect={setEventoModalDetalle}
          onAprobar={handleAprobarEvento}
          onSolicitarCorreccion={(evento) =>
            setAccionModal({ evento, tipo: 'correccion' })
          }
          onRechazar={(evento) => setAccionModal({ evento, tipo: 'rechazo' })}
        />
      )}

      {currentTab === 'palabras-prohibidas' && (
        <ModeradorPalabrasProhibidasView />
      )}

      {currentTab === 'perfil' && (
        <ModeradorPerfilView
          onNavigateTab={(tab) => setSearchParams({ tab })}
        />
      )}

      {/* Modal de Detalle e Inspección Exhaustiva */}
      {eventoModalDetalle && (
        <ModalDetalleEventoModeracion
          evento={eventoModalDetalle}
          motivos={motivos}
          isOpen={Boolean(eventoModalDetalle)}
          onClose={() => setEventoModalDetalle(null)}
          onAprobar={handleAprobarEvento}
          onSolicitarCorreccion={(ev) =>
            setAccionModal({ evento: ev || eventoModalDetalle, tipo: 'correccion' })
          }
          onRechazar={(ev) =>
            setAccionModal({ evento: ev || eventoModalDetalle, tipo: 'rechazo' })
          }
          actionLoading={actionLoading}
        />
      )}

      {/* Modal Rápido de Corrección o Rechazo */}
      {accionModal && (
        <ModalAccionModeracion
          evento={accionModal.evento}
          tipo={accionModal.tipo}
          motivos={motivos}
          isOpen={Boolean(accionModal)}
          onClose={() => setAccionModal(null)}
          onSubmit={({ motivo, observacion }) => {
            if (accionModal.tipo === 'correccion') {
              handleSolicitarCorreccion(accionModal.evento.id, {
                motivo,
                observacion,
              });
            } else {
              handleRechazarEvento(accionModal.evento.id, {
                motivo,
                observacion,
              });
            }
          }}
          loading={actionLoading}
        />
      )}
    </ModeradorLayout>
  );
}
