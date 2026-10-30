import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Search,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import adminService from '../../features/admin/services/adminService.js';
import { formatFechaHora } from '../../utils/formatters.js';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/alertUtils.js';
import ActionButton from '../../components/Shared/ActionButton.jsx';

export default function AdminSugerenciasAscensoView() {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchSugerencias = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getSugerenciasAscenso({ page: 0, size: 100 });
      if (res && res.data) {
        setSugerencias(res.data);
      }
    } catch (err) {
      console.warn('Error cargando sugerencias de ascenso:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSugerencias();
  }, [fetchSugerencias]);

  const handleAprobar = async (item) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const confirmed = await showConfirmAlert({
        title: '¿Aprobar ascenso de nivel?',
        text: `La organización "${item.organizacionNombre || 'Organización'}" pasará de nivel ${item.nivelActual} a ${item.nivelSugerido}.`,
        confirmButtonText: 'Sí, aprobar ascenso',
        confirmButtonColor: '#059669',
      });

      if (confirmed !== true) return;

      await adminService.aprobarSugerenciaAscenso(item.id);
      await showSuccessAlert({
        title: 'Ascenso aprobado',
        text: `El nivel de la organización se actualizó exitosamente a ${item.nivelSugerido}.`,
      });
      await fetchSugerencias();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al aprobar',
        text: err?.message || 'No se pudo aprobar la sugerencia de ascenso.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async (item) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const confirmed = await showConfirmAlert({
        title: '¿Rechazar sugerencia de ascenso?',
        text: `Se descartará la propuesta de ascenso para "${item.organizacionNombre || 'Organización'}".`,
        confirmButtonText: 'Sí, rechazar',
        confirmButtonColor: '#e11d48',
      });

      if (confirmed !== true) return;

      await adminService.rechazarSugerenciaAscenso(item.id);
      await showSuccessAlert({
        title: 'Sugerencia rechazada',
        text: 'La sugerencia ha sido descartada.',
      });
      await fetchSugerencias();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al rechazar',
        text: err?.message || 'No se pudo rechazar la sugerencia.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return sugerencias.filter((s) => {
      const orgName = (s.organizacionNombre || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();
      return !term || orgName.includes(term);
    });
  }, [sugerencias, searchTerm]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const getNivelBadgeVariant = (nivel) => {
    const n = (nivel || '').toUpperCase();
    if (n === 'ORO' || n === 'GOLD') return 'warning';
    if (n === 'PLATA' || n === 'SILVER') return 'neutral';
    if (n === 'DIAMANTE' || n === 'PLATINO') return 'primary';
    return 'info';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Sugerencias de Ascenso de Organizaciones</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evalúa y aprueba el ascenso de nivel para las organizaciones que han alcanzado los requisitos de aforo y eventos
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSugerencias}
          disabled={loading || actionLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre de organización..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Total: <strong className="text-slate-900">{filtered.length}</strong> sugerencias
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white">
            <thead className="bg-white border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-4 px-4">Organización</th>
                <th className="py-4 px-4 text-center">Nivel Actual</th>
                <th className="py-4 px-4 text-center">Nivel Sugerido</th>
                <th className="py-4 px-4">Fecha de Generación</th>
                <th className="py-4 px-4 text-center">Estado</th>
                <th className="py-4 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando sugerencias de ascenso...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No hay sugerencias de ascenso pendientes en este momento.
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    {/* Organización sin IDs */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20">
                          {item.organizacionNombre?.charAt(0).toUpperCase() || 'O'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {item.organizacionNombre || 'Organización Oficial'}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            Evaluación por cumplimiento
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Nivel Actual */}
                    <td className="py-4 px-4 text-center">
                      <Badge variant={getNivelBadgeVariant(item.nivelActual)} size="sm">
                        {item.nivelActual || 'BRONCE'}
                      </Badge>
                    </td>

                    {/* Nivel Sugerido */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                        <TrendingUp size={13} className="text-amber-600" />
                        <span>{item.nivelSugerido || 'PLATA'}</span>
                      </div>
                    </td>

                    {/* Fecha de Generación: {dia/mes/año} {hora/minutos} */}
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      {item.fechaGeneracion ? formatFechaHora(item.fechaGeneracion) : '—'}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-4 text-center">
                      <Badge variant="warning" size="xs">
                        {item.estado || 'PENDIENTE'}
                      </Badge>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <ActionButton
                          onClick={() => handleAprobar(item)}
                          variant="success"
                          disabled={actionLoading}
                          className="gap-1 px-3 py-1.5"
                          title="Aprobar ascenso de nivel"
                        >
                          <CheckCircle2 size={13} />
                          <span>Aprobar</span>
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleRechazar(item)}
                          variant="danger"
                          disabled={actionLoading}
                          className="gap-1 px-3 py-1.5"
                          title="Rechazar sugerencia"
                        >
                          <XCircle size={13} />
                          <span>Rechazar</span>
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > pageSize && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
