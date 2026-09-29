import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ModeradorLayout from '../../layouts/ModeradorLayout.jsx';
import ModeradorResumenView from './ModeradorResumenView.jsx';
import ModeradorPendientesView from './ModeradorPendientesView.jsx';
import ModeradorHistorialView from './ModeradorHistorialView.jsx';
import ModeradorMotivosView from './ModeradorMotivosView.jsx';
import ModalDetalleEventoModeracion from './ModalDetalleEventoModeracion.jsx';
import ModalAccionModeracion from './ModalAccionModeracion.jsx';
import moderationService from '../../services/moderationService.js';
import {
  FiTrendingUp,
  FiClipboard,
  FiLayers,
  FiList,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi';

export default function ModeradorPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'resumen';

  // Estados de datos reales
  const [stats, setStats] = useState({
    revisados: 0,
    aprobados: 0,
    rechazados: 0,
    correccionesSolicitadas: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Eventos pendientes paginados
  const [pendientes, setPendientes] = useState([]);
  const [pagedData, setPagedData] = useState(null);
  const [pendientesLoading, setPendientesLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Motivos reales del backend (/api/enums/motivos-rechazos)
  const [motivos, setMotivos] = useState([]);
  const [motivosLoading, setMotivosLoading] = useState(false);

  // Feedback y Modales
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }
  const [eventoModalDetalle, setEventoModalDetalle] = useState(null);
  const [accionModal, setAccionModal] = useState(null); // { evento, tipo: 'correccion'|'rechazo' }
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

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
      // Si el endpoint aún no retorna datos, dejar vacío y no usar datos falsos
      setMotivos([]);
    } finally {
      setMotivosLoading(false);
    }
  }, []);

  // Efecto inicial
  useEffect(() => {
    fetchEstadisticas();
    fetchMotivos();
  }, [fetchEstadisticas, fetchMotivos]);

  // Efecto de paginación de pendientes
  useEffect(() => {
    fetchPendientes(page, size);
  }, [page, size, fetchPendientes]);

  // Acciones de Moderación
  const handleAprobarEvento = async (eventoId) => {
    try {
      setActionLoading(true);
      await moderationService.aprobarEvento(eventoId);
      showToast('¡Evento aprobado y publicado exitosamente en la cartelera!', 'success');
      setEventoModalDetalle(null);
      // Refrescar datos
      fetchPendientes(page, size);
      fetchEstadisticas();
    } catch (err) {
      showToast(err.message || 'Error al aprobar el evento.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSolicitarCorreccion = async (eventoId, { observacion, motivo }) => {
    try {
      setActionLoading(true);
      await moderationService.solicitarCorreccion(eventoId, observacion, motivo);
      showToast('Se solicitaron las correcciones a la organización.', 'success');
      setEventoModalDetalle(null);
      setAccionModal(null);
      // Refrescar datos
      fetchPendientes(page, size);
      fetchEstadisticas();
    } catch (err) {
      showToast(err.message || 'Error al solicitar corrección del evento.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazarEvento = async (eventoId, { observacion, motivo }) => {
    try {
      setActionLoading(true);
      await moderationService.rechazarEvento(eventoId, observacion, motivo);
      showToast('Evento rechazado conforme a las políticas comunitarias.', 'success');
      setEventoModalDetalle(null);
      setAccionModal(null);
      // Refrescar datos
      fetchPendientes(page, size);
      fetchEstadisticas();
    } catch (err) {
      showToast(err.message || 'Error al rechazar el evento.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPendientesCount = pagedData?.totalElements ?? pendientes.length;

  // Menú del Sidebar del Moderador con badge dinámico
  const menuItems = useMemo(
    () => [
      { id: 'resumen', label: 'Resumen', icon: FiTrendingUp, count: null },
      {
        id: 'eventos',
        label: 'Eventos Pendientes',
        icon: FiClipboard,
        count: totalPendientesCount > 0 ? String(totalPendientesCount) : null,
      },
      { id: 'historial', label: 'Explorar Eventos', icon: FiLayers, count: null },
      {
        id: 'motivos',
        label: 'Motivos de Rechazo',
        icon: FiList,
        count: motivos.length > 0 ? String(motivos.length) : null,
      },
    ],
    [totalPendientesCount, motivos.length]
  );

  const titlesByTab = {
    resumen: {
      title: 'Panel del Moderador',
      subtitle: 'Resumen operativo y cola prioritaria de revisiones',
    },
    eventos: {
      title: 'Eventos Pendientes',
      subtitle: 'Bandeja de solicitudes de publicación que requieren moderación',
    },
    historial: {
      title: 'Explorar Eventos del Sistema',
      subtitle: 'Búsqueda por estado, historial de moderación y auditoría',
    },
    motivos: {
      title: 'Catálogo de Motivos Oficiales',
      subtitle: 'Criterios normativos provistos por el backend para correcciones y rechazos',
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
      badgeText="Módulo de Moderación"
    >
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border ${
              toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800 shadow-rose-950/20'
                : 'bg-slate-900 text-white border-slate-800 shadow-slate-950/20'
            }`}
          >
            {toast.type === 'error' ? (
              <FiAlertCircle className="text-rose-400 shrink-0" size={17} />
            ) : (
              <FiCheckCircle className="text-emerald-400 shrink-0" size={17} />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <FiX size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Vistas según la pestaña activa */}
      {currentTab === 'resumen' && (
        <ModeradorResumenView
          stats={stats}
          statsLoading={statsLoading}
          pendientes={pendientes}
          pendientesLoading={pendientesLoading}
          totalPendientes={totalPendientesCount}
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

      {currentTab === 'motivos' && (
        <ModeradorMotivosView motivos={motivos} loading={motivosLoading} />
      )}

      {/* Modal de Detalle e Inspección Exhaustiva */}
      {eventoModalDetalle && (
        <ModalDetalleEventoModeracion
          evento={eventoModalDetalle}
          motivos={motivos}
          isOpen={Boolean(eventoModalDetalle)}
          onClose={() => setEventoModalDetalle(null)}
          onAprobar={handleAprobarEvento}
          onSolicitarCorreccion={handleSolicitarCorreccion}
          onRechazar={handleRechazarEvento}
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
