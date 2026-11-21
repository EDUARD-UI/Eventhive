import React, { useEffect, useState, useMemo } from 'react';
import {
  FiUsers,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiGrid,
  FiList,
  FiX,
  FiCheck,
} from 'react-icons/fi';
import { organizerService } from '../../services/organizerService.js';
import GmailComposeModal from '../../components/Shared/GmailComposeModal.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import { formatFecha } from '../../utils/formatters.js';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/alertUtils.js';

export default function OperadoresView() {
  const [operadores, setOperadores] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('operadores'); // 'operadores' | 'invitaciones'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal Enviar Correo Directo
  const [emailModal, setEmailModal] = useState({
    isOpen: false,
    email: '',
    name: '',
    subject: '',
    mode: 'email',
    role: 'OPERADOR',
  });

  // Modal Invitar Operador
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Estados de carga por elemento
  const [resendingEmail, setResendingEmail] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [opsRes, invRes] = await Promise.allSettled([
        organizerService.getMisOperadores({ page: 0, size: 100 }),
        organizerService.getInvitacionesEnviadas({ page: 0, size: 100 }),
      ]);

      let ops = [];
      if (opsRes.status === 'fulfilled') {
        ops = Array.isArray(opsRes.value)
          ? opsRes.value
          : opsRes.value?.content || opsRes.value?.data || [];
      } else {
        console.warn('Error cargando operadores:', opsRes.reason);
      }
      setOperadores(ops);

      let invs = [];
      if (invRes.status === 'fulfilled') {
        invs = Array.isArray(invRes.value)
          ? invRes.value
          : invRes.value?.content || invRes.value?.data || [];
      } else {
        console.warn('Error cargando invitaciones:', invRes.reason);
      }
      setInvitaciones(invs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Enviar invitación
  const handleInvite = async (e) => {
    e.preventDefault();
    if (isInviting) return;

    const emailTrim = inviteEmail.trim();
    if (!emailTrim) {
      await showErrorAlert({
        title: 'Correo obligatorio',
        text: 'Por favor ingresa el correo del operador a invitar.',
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      await showErrorAlert({
        title: 'Correo no válido',
        text: 'Ingresa un correo electrónico con formato válido.',
      });
      return;
    }

    setIsInviting(true);
    try {
      await organizerService.invitarOperador(emailTrim);
      setShowInviteModal(false);
      setInviteEmail('');
      await showSuccessAlert({
        title: 'Invitación enviada',
        text: `Se ha enviado la invitación exitosamente a ${emailTrim}. El enlace será válido por 24 horas.`,
      });
      await fetchData();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al enviar invitación',
        text: err.message || 'No se pudo enviar la invitación al operador.',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Reenviar invitación
  const handleReenviarInvitacion = async (correo) => {
    if (resendingEmail) return;

    setResendingEmail(correo);
    try {
      await organizerService.invitarOperador(correo);
      await showSuccessAlert({
        title: 'Invitación reenviada',
        text: `Se ha generado un nuevo enlace válido por 24 horas y se reenvió el correo a ${correo}.`,
      });
      await fetchData();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al reenviar',
        text: err.message || 'No fue posible reenviar la invitación en este momento.',
      });
    } finally {
      setResendingEmail(null);
    }
  };

  // Revocar / Desvincular operador
  const handleRevocarOperador = async (op) => {
    const opId = op.id || op.operadorId;
    if (revokingId) return;

    const nombre = op.nombre || op.nombreCompleto || op.correo || op.email || 'Operador';
    const confirmed = await showConfirmAlert({
      title: '¿Revocar acceso a colaborador?',
      text: `Se revocará el acceso a "${nombre}" y quedará desvinculado del equipo de la organización.`,
      confirmButtonText: 'Sí, revocar acceso',
      confirmButtonColor: '#e11d48',
    });

    if (!confirmed) return;

    setRevokingId(opId);
    try {
      await organizerService.expulsarOperador(opId);
      await showSuccessAlert({
        title: 'Acceso revocado',
        text: `"${nombre}" ha sido desvinculado de la organización exitosamente.`,
      });
      await fetchData();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al revocar',
        text: err.message || 'No se pudo revocar el rol al operador.',
      });
    } finally {
      setRevokingId(null);
    }
  };

  // Métricas calculadas directamente desde el estado real (Sincronización exacta)
  const operadoresActivos = operadores.length;
  const invitacionesPendientes = useMemo(() => {
    return invitaciones.filter((i) => {
      const st = String(i.estado || i.status || 'PENDIENTE').toUpperCase();
      return st === 'PENDIENTE' || st === 'PENDING';
    }).length;
  }, [invitaciones]);
  const historicoPersonal = operadores.length + invitaciones.length;

  // Filtrado por buscador
  const filteredOperadores = useMemo(() => {
    return operadores.filter((op) => {
      const nombre = (op.nombre || op.nombreCompleto || '').toLowerCase();
      const correo = (op.correo || op.email || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();
      return !term || nombre.includes(term) || correo.includes(term);
    });
  }, [operadores, searchTerm]);

  const filteredInvitaciones = useMemo(() => {
    return invitaciones.filter((inv) => {
      const correo = (inv.correo || inv.correoInvitado || inv.email || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();
      return !term || correo.includes(term);
    });
  }, [invitaciones, searchTerm]);

  const currentOriginalList = activeTab === 'operadores' ? operadores : invitaciones;
  const currentList = activeTab === 'operadores' ? filteredOperadores : filteredInvitaciones;

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return currentList.slice(start, start + pageSize);
  }, [currentList, currentPage, pageSize]);

  return (
    <div className="space-y-8 select-none">
      {/* 1. Cabecera Minimalista */}
      <div className="border-b border-[#E2E8F0] pb-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#64748B] block mb-1">
              Crew & Acreditaciones · Cartagena
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#0F2342] tracking-tight uppercase leading-none">
              Trabajadores
            </h1>
            <p className="text-xs font-mono uppercase tracking-wider text-[#64748B] pt-1">
              Gestión de operadores acreditados y control de invitaciones institucionales
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Botón cuadrado de recarga con solo ícono lineal */}
            <button
              type="button"
              onClick={fetchData}
              title="Recargar listado"
              disabled={loading}
              className="w-10 h-10 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            >
              <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Botón rectangular #0F2342: INVITAR COLABORADOR */}
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="px-5 py-3 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-98"
            >
              Invitar Colaborador
            </button>
          </div>
        </div>
      </div>

      {/* 2. Barra de Resumen en Línea (Sin tarjetas KPI redondeadas) */}
      <div className="rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
          <div className="w-full sm:w-1/3 sm:px-4 first:pl-0">
            <span className="font-mono font-black text-2xl text-[#0F2342] tabular-nums">
              {operadoresActivos}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] ml-2 font-bold">
              Operadores Activos
            </span>
          </div>

          <div className="w-full sm:w-1/3 sm:px-4 pt-3 sm:pt-0">
            <span className="font-mono font-black text-2xl text-[#0F2342] tabular-nums">
              {invitacionesPendientes}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] ml-2 font-bold">
              Invitaciones Pendientes
            </span>
          </div>

          <div className="w-full sm:w-1/3 sm:px-4 pt-3 sm:pt-0">
            <span className="font-mono font-black text-2xl text-[#0F2342] tabular-nums">
              {historicoPersonal}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] ml-2 font-bold">
              Histórico de Personal
            </span>
          </div>
        </div>
      </div>

      {/* 3. Controles: Tabs Tipográficos con Subrayado #F5B800 + Buscador + Selector de Vista */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs tipográficos */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab('operadores');
              setCurrentPage(1);
            }}
            className={`font-mono text-xs uppercase tracking-wider transition-all cursor-pointer pb-2 relative shrink-0 ${
              activeTab === 'operadores'
                ? 'text-[#0F2342] font-bold'
                : 'text-[#64748B] hover:text-[#0F2342] font-medium'
            }`}
          >
            <span>Operadores ({operadoresActivos})</span>
            {activeTab === 'operadores' && (
              <span
                className="absolute bottom-0 inset-x-0 h-[2px] bg-[#F5B800] transition-all"
                aria-hidden="true"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('invitaciones');
              setCurrentPage(1);
            }}
            className={`font-mono text-xs uppercase tracking-wider transition-all cursor-pointer pb-2 relative shrink-0 ${
              activeTab === 'invitaciones'
                ? 'text-[#0F2342] font-bold'
                : 'text-[#64748B] hover:text-[#0F2342] font-medium'
            }`}
          >
            <span>Invitaciones ({invitaciones.length})</span>
            {activeTab === 'invitaciones' && (
              <span
                className="absolute bottom-0 inset-x-0 h-[2px] bg-[#F5B800] transition-all"
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {/* Buscador rectangular y selector de vista */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="BUSCAR COLABORADOR..."
              className="w-full rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] pl-8 pr-3 py-2 font-mono text-[11px] uppercase text-[#0F2342] placeholder:text-[#94A3B8] outline-none focus:border-[#0F2342] transition-colors"
            />
          </div>

          <div className="flex items-center border border-[#E2E8F0] rounded-[2px] bg-[#FFFFFF] p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vista Cuadrícula"
              className={`p-1.5 rounded-[2px] text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#0F2342] text-white font-bold'
                  : 'text-[#64748B] hover:text-[#0F2342]'
              }`}
            >
              <FiGrid size={13} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Vista Lista"
              className={`p-1.5 rounded-[2px] text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#0F2342] text-white font-bold'
                  : 'text-[#64748B] hover:text-[#0F2342]'
              }`}
            >
              <FiList size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Tarjetas de Credencial (Operadores e Invitaciones) */}
      {loading ? (
        <div className="p-16 text-center text-xs font-mono text-[#64748B] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px]">
          <div className="w-6 h-6 border-2 border-[#0F2342] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          CONSULTANDO EXPEDIENTE DE PERSONAL...
        </div>
      ) : currentOriginalList.length === 0 ? (
        /* Estado Vacío de Personal (cuando no hay registros en la API) */
        <div className="rounded-[2px] border border-dashed border-[#CBD5E1] bg-[#FFFFFF] p-12 sm:p-16 text-center space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#64748B] block">
            [ SIN CREDENCIALES ACTIVAS ]
          </span>
          <h3 className="font-display font-black text-xl text-[#0F2342] uppercase tracking-tight">
            {activeTab === 'operadores' ? 'No hay operadores vinculados' : 'No hay invitaciones registradas'}
          </h3>
          <p className="text-xs font-mono text-[#64748B] max-w-md mx-auto">
            {activeTab === 'operadores'
              ? 'Invita a los miembros de tu equipo para coordinar la logística y acreditaciones de tus eventos.'
              : 'Las invitaciones emitidas por correo aparecerán en esta consola.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
            >
              Invitar Primer Operador
            </button>
          </div>
        </div>
      ) : currentList.length === 0 ? (
        /* Estado de Búsqueda Vacía */
        <div className="p-10 text-center font-mono text-xs text-[#64748B] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px]">
          No se encontraron colaboradores para "{searchTerm}".
        </div>
      ) : viewMode === 'grid' ? (
        /* VISTA CUADRÍCULA DE TARJETAS HORIZONTALES */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedList.map((item, idx) => {
              const isOperador = activeTab === 'operadores';
              const email = item.correo || item.email || item.correoInvitado || 'Sin correo';
              const rawName = item.nombreCompleto || item.nombre || null;
              const displayName = rawName || email;
              const initials = (rawName || email).slice(0, 2).toUpperCase();
              const opId = item.id || item.operadorId;
              const isRevoking = revokingId === opId;
              const isResending = resendingEmail === email;
              const statusLabel = String(item.estado || item.status || (isOperador ? 'ACTIVO' : 'PENDIENTE')).toUpperCase();

              return (
                <div
                  key={opId || email || idx}
                  className="relative p-5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] flex flex-col justify-between gap-4 overflow-hidden"
                >
                  {/* Barra lateral izquierda de 4px: #0F2342 para activos, #F5B800 para invitaciones */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-[4px]"
                    style={{ backgroundColor: isOperador ? '#0F2342' : '#F5B800' }}
                    aria-hidden="true"
                  />

                  {/* Cuerpo de la tarjeta con datos reales de la API únicamente */}
                  <div className="flex items-start gap-4 pl-1">
                    {/* Cuadro de iniciales */}
                    <div
                      className={`w-11 h-11 rounded-[2px] font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        isOperador
                          ? 'bg-[#0F2342] text-[#F5B800]'
                          : 'bg-[#F8F9FA] border border-[#E2E8F0] text-[#0F2342]'
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display font-black text-sm text-[#0F2342] uppercase truncate">
                          {displayName}
                        </h4>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                          {isOperador ? 'OPERADOR' : statusLabel}
                        </span>
                      </div>

                      <p className="font-mono text-xs text-[#64748B] truncate mt-0.5">
                        {email}
                      </p>

                      {/* Metadato de fecha si existe */}
                      {(item.fechaCreacion || item.fechaInvitacion) && (
                        <p className="font-mono text-[10px] text-[#94A3B8] mt-1">
                          Registrado: {formatFecha(item.fechaCreacion || item.fechaInvitacion)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones Tipográficas Limpias */}
                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs pl-1">
                    {isOperador ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setEmailModal({
                              isOpen: true,
                              email,
                              name: displayName,
                              subject: 'Comunicación oficial de producción',
                              mode: 'email',
                              role: 'OPERADOR',
                            })
                          }
                          className="font-mono text-xs font-bold text-[#0F2342] hover:text-[#B45309] border-b border-transparent hover:border-[#F5B800] transition-all cursor-pointer"
                        >
                          Contactar →
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRevocarOperador(item)}
                          disabled={isRevoking || Boolean(revokingId)}
                          className="font-mono text-[11px] text-[#94A3B8] hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          {isRevoking ? 'Revocando...' : 'Revocar Acceso'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReenviarInvitacion(email)}
                          disabled={isResending}
                          className="font-mono text-xs font-bold text-[#0F2342] hover:text-[#B45309] border-b border-transparent hover:border-[#F5B800] transition-all cursor-pointer disabled:opacity-40"
                        >
                          {isResending ? 'Reenviando...' : 'Reenviar Invitación →'}
                        </button>

                        <span className="font-mono text-[10px] text-[#94A3B8] uppercase">
                          Vence en 24h
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {currentList.length > pageSize && (
            <div className="pt-2 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalItems={currentList.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                showPageSize={false}
              />
            </div>
          )}
        </div>
      ) : (
        /* VISTA LISTA / TABLA EDITORIAL */
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#E2E8F0] font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              <tr>
                <th className="py-3 px-5">Colaborador</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-mono">
              {paginatedList.map((item, idx) => {
                const isOperador = activeTab === 'operadores';
                const email = item.correo || item.email || item.correoInvitado || 'Sin correo';
                const rawName = item.nombreCompleto || item.nombre || null;
                const displayName = rawName || email;
                const opId = item.id || item.operadorId;
                const statusLabel = String(item.estado || item.status || (isOperador ? 'ACTIVO' : 'PENDIENTE')).toUpperCase();

                return (
                  <tr key={opId || email || idx} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0F2342]">
                      {displayName}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {email}
                    </td>
                    <td className="py-3.5 px-4 text-[#0F2342]">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: isOperador ? '#0F2342' : '#F5B800' }}
                        />
                        <span>{isOperador ? 'OPERADOR' : statusLabel}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {isOperador ? (
                        <button
                          type="button"
                          onClick={() => handleRevocarOperador(item)}
                          className="text-[#94A3B8] hover:text-rose-600 font-mono text-xs cursor-pointer"
                        >
                          Revocar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReenviarInvitacion(email)}
                          className="text-[#0F2342] hover:text-[#B45309] font-bold font-mono text-xs cursor-pointer"
                        >
                          Reenviar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Invitar Colaborador */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-[2px] border border-[#E2E8F0] shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="font-display font-black text-lg text-[#0F2342] uppercase tracking-tight">
                  Invitar Colaborador
                </h3>
                <p className="font-mono text-[11px] text-[#64748B]">
                  Envía una invitación oficial para el rol de Operador
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-[#64748B] hover:text-[#0F2342] cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="operador@ejemplo.com"
                  className="w-full rounded-[2px] border border-[#E2E8F0] px-3.5 py-2 font-mono text-xs text-[#0F2342] outline-none focus:border-[#0F2342]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  disabled={isInviting}
                  className="px-4 py-2 rounded-[2px] border border-[#E2E8F0] font-mono text-xs uppercase text-[#64748B] hover:bg-[#F8F9FA] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-5 py-2 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isInviting ? 'Enviando...' : 'Enviar Invitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Enviar Correo */}
      <GmailComposeModal
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal((prev) => ({ ...prev, isOpen: false }))}
        defaultEmail={emailModal.email}
        defaultName={emailModal.name}
        defaultSubject={emailModal.subject}
        role={emailModal.role}
        mode={emailModal.mode}
      />
    </div>
  );
}
