import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  RotateCw,
  Search,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import adminService from '../../features/admin/services/adminService.js';
import { formatFechaHora } from '../../utils/formatters.js';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/alertUtils.js';

export default function AdminSugerenciasAscensoView() {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
        confirmButtonColor: '#0F2342',
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
        confirmButtonColor: '#DC2626',
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

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      {/* 1. Encabezado Editorial */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
            TABLERO DE ASCENSOS DE NIVEL
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
            Consola de evaluación de nivel para organizaciones con cumplimiento de cartelera y aforo.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSugerencias}
          disabled={loading || actionLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* 2. Barra de Búsqueda Compacta */}
      <div className="bg-[#FFFFFF] p-4 rounded-[2px] border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de organización..."
            className="w-full pl-10 pr-4 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] placeholder-[#94A3B8] outline-none focus:border-[#0F2342] transition-colors"
          />
        </div>

        <div className="font-mono text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-2 self-end sm:self-center">
          <span>Total:</span>
          <strong className="text-[#0F2342] font-bold">{filtered.length}</strong>
          <span>sugerencias</span>
        </div>
      </div>

      {/* 3. Consola de Evaluación de Nivel (Sin Tablas) */}
      {loading ? (
        <div className="p-12 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] text-center font-mono text-xs text-[#64748B] shadow-2xs">
          <RotateCw size={18} className="mx-auto mb-2 text-[#0F2342] animate-spin" />
          <p className="uppercase tracking-wider">Consultando propuestas de ascenso...</p>
        </div>
      ) : filtered.length === 0 ? (
        /* Estado Vacío Editorial Especificado */
        <div className="p-12 rounded-[2px] border border-dashed border-[#CBD5E1] bg-[#FFFFFF] text-center font-mono text-xs text-[#64748B] shadow-2xs">
          <p className="font-bold text-[#0F2342] uppercase tracking-wider text-sm mb-1.5">
            [ SIN SOLICITUDES DE ASCENSO ]
          </p>
          <p className="text-[11px] text-[#94A3B8]">
            Ninguna organización cumple actualmente con nuevos criterios pendientes de ascenso.
          </p>
        </div>
      ) : (
        /* Fichas de Promoción de Nivel */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-[#FFFFFF] border border-[#E2E8F0] border-l-4 border-l-[#F5B800] rounded-[2px] p-5 shadow-2xs hover:border-[#0F2342]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-base text-[#0F2342] uppercase tracking-tight truncate">
                    {item.organizacionNombre || 'Organización'}
                  </h3>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#B45309] font-bold bg-[#F5B800]/15 px-1.5 py-0.5 rounded-[1px]">
                    EVALUACIÓN
                  </span>
                </div>

                {/* Transición de Nivel: Nivel Actual -> Nivel Sugerido con acento #F5B800 */}
                <div className="flex items-center gap-3 py-2 px-3 bg-[#F8F9FA] rounded-[2px] border border-[#E2E8F0] font-mono text-xs">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-[#64748B]">NIVEL ACTUAL</span>
                    <span className="font-bold text-[#0F2342]">{item.nivelActual || 'BRONCE'}</span>
                  </div>

                  <ArrowRight size={15} className="text-[#F5B800] shrink-0" />

                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-[#F5B800] font-bold">NIVEL SUGERIDO</span>
                    <span className="font-bold text-[#0F2342]">{item.nivelSugerido || 'PLATA'}</span>
                  </div>
                </div>

                <div className="font-mono text-[11px] text-[#64748B]">
                  Generado: {item.fechaGeneracion ? formatFechaHora(item.fechaGeneracion) : '—'}
                </div>
              </div>

              {/* Botones de Dictamen Rectangulares (border-radius: 2px) */}
              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRechazar(item)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-rose-50 text-[#DC2626] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Rechazar
                </button>

                <button
                  type="button"
                  onClick={() => handleAprobar(item)}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-[2px] bg-[#0F2342] hover:bg-[#15803D] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shadow-2xs"
                >
                  APROBAR ASCENSO
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
