import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiSearch,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiRefreshCw,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import moderationService from '../../services/moderationService.js';
import { showToast } from '../../utils/alertUtils.js';

/**
 * Formatea una fecha a 'dd/mm/yyyy' en fuente monoespaciada
 */
const formatFechaSimple = (fechaStr) => {
  if (!fechaStr) return '—';
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return String(fechaStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(fechaStr);
  }
};

export default function ModeradorPalabrasProhibidasView() {
  const [palabras, setPalabras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de la Zona B
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeveridad, setSelectedSeveridad] = useState('TODAS'); // 'TODAS' | 'GRAVE' | 'SOSPECHOSA'
  const [onlyActives, setOnlyActives] = useState(false);

  // Paginación limpia
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Múltiplo para cuadrículas de 1, 2 o 3 columnas
  const [totalElements, setTotalElements] = useState(0);
  const [activasGlobal, setActivasGlobal] = useState(null);
  const [gravesGlobal, setGravesGlobal] = useState(null);

  // Modal para agregar/editar palabra
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPalabra, setEditingPalabra] = useState(null);
  const [formPalabra, setFormPalabra] = useState('');
  const [formSeveridad, setFormSeveridad] = useState('GRAVE');
  const [saving, setSaving] = useState(false);

  // Zona A: Consola de Escaneo en Vivo (Probador de Copy de Evento)
  const [testText, setTestText] = useState('');
  const [hasAudited, setHasAudited] = useState(false);

  // 1. Cargar catálogo de palabras prohibidas
  const fetchPalabras = useCallback(async () => {
    try {
      setLoading(true);
      const res = await moderationService.getPalabrasProhibidas({
        page: 0,
        size: 200, // Carga catálogo amplio para filtrado instantáneo y auditoría en vivo
      });

      const items = Array.isArray(res)
        ? res
        : res?.content || res?.data?.content || res?.data || [];

      const total =
        res?.totalElements ??
        res?.data?.totalElements ??
        (Array.isArray(items) ? items.length : 0);

      const totalActivasBackend = res?.totalActivas ?? res?.data?.totalActivas;
      if (totalActivasBackend !== undefined && totalActivasBackend !== null) {
        setActivasGlobal(Number(totalActivasBackend));
      }
      const totalGravesBackend = res?.totalGraves ?? res?.data?.totalGraves;
      if (totalGravesBackend !== undefined && totalGravesBackend !== null) {
        setGravesGlobal(Number(totalGravesBackend));
      }

      const normalized = (Array.isArray(items) ? items : []).map((item) => ({
        id: item.id,
        palabra: (item.palabra || '').toLowerCase().trim(),
        severidad: (item.severidad || 'GRAVE').toUpperCase(),
        activa: Boolean(item.activa),
        fechaCreacion: item.fechaCreacion || null,
      }));

      setPalabras(normalized);
      setTotalElements(total || normalized.length);
    } catch (err) {
      console.warn('Error al cargar palabras prohibidas desde el backend:', err);
      setPalabras([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPalabras();
  }, [fetchPalabras]);

  // Tecla Escape para cerrar modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOpen && !saving) {
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, saving]);

  // Métricas generales reales
  const totalRegistradas = totalElements || palabras.length;
  const activasCount =
    activasGlobal !== null
      ? activasGlobal
      : palabras.filter((p) => p.activa).length;
  const gravesCount =
    gravesGlobal !== null
      ? gravesGlobal
      : palabras.filter((p) => p.severidad === 'GRAVE').length;
  const sospechosasCount = Math.max(0, totalRegistradas - gravesCount);

  // Conteos de tabs superiores en Zona B
  const tabCounts = useMemo(() => {
    const baseList = onlyActives ? palabras.filter((p) => p.activa) : palabras;
    return {
      todas: baseList.length,
      graves: baseList.filter((p) => p.severidad === 'GRAVE').length,
      sospechosas: baseList.filter((p) => p.severidad === 'SOSPECHOSA').length,
    };
  }, [palabras, onlyActives]);

  // Filtrado de Zona B (Muro de Placas)
  const filteredPalabras = useMemo(() => {
    return palabras.filter((p) => {
      const matchSearch =
        !searchTerm.trim() ||
        p.palabra.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchSev =
        selectedSeveridad === 'TODAS' || p.severidad === selectedSeveridad;

      const matchActiva = !onlyActives || p.activa;

      return matchSearch && matchSev && matchActiva;
    });
  }, [palabras, searchTerm, selectedSeveridad, onlyActives]);

  // Paginación en memoria de la lista filtrada
  const totalFiltered = filteredPalabras.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPalabras = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredPalabras.slice(start, start + pageSize);
  }, [filteredPalabras, safeCurrentPage, pageSize]);

  // Generador de números de página para paginador cuadrado
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  // -------------------------------------------------------------
  // ZONA A: Análisis Editorial y Marcado en Tiempo Real
  // -------------------------------------------------------------
  const liveAuditDiagnosis = useMemo(() => {
    if (!testText.trim()) return null;

    const activeList = palabras.filter((p) => p.activa && p.palabra);
    if (activeList.length === 0) {
      return { hasViolations: false, count: 0, graves: 0, sospechosas: 0, intervals: [] };
    }

    // Ordenar de mayor a menor longitud para priorizar frases compuestas
    const sorted = [...activeList].sort((a, b) => b.palabra.length - a.palabra.length);
    const intervals = [];

    sorted.forEach((wordObj) => {
      const target = wordObj.palabra.trim().toLowerCase();
      if (!target) return;

      const lowerText = testText.toLowerCase();
      let startIdx = 0;

      while ((startIdx = lowerText.indexOf(target, startIdx)) !== -1) {
        const endIdx = startIdx + target.length;

        // Validar si colisiona con un intervalo ya marcado
        const overlaps = intervals.some(
          (inv) => Math.max(startIdx, inv.start) < Math.min(endIdx, inv.end)
        );

        if (!overlaps) {
          intervals.push({
            start: startIdx,
            end: endIdx,
            text: testText.substring(startIdx, endIdx),
            severidad: wordObj.severidad,
            palabra: wordObj.palabra,
          });
        }
        startIdx = endIdx;
      }
    });

    intervals.sort((a, b) => a.start - b.start);

    const gravesFound = intervals.filter((i) => i.severidad === 'GRAVE').length;
    const sospechosasFound = intervals.filter((i) => i.severidad === 'SOSPECHOSA').length;

    return {
      hasViolations: intervals.length > 0,
      count: intervals.length,
      graves: gravesFound,
      sospechosas: sospechosasFound,
      intervals,
    };
  }, [testText, palabras]);

  const renderMarkedText = (rawText, intervals) => {
    if (!intervals || intervals.length === 0) return rawText;
    const nodes = [];
    let lastIndex = 0;

    intervals.forEach((inv, idx) => {
      if (inv.start > lastIndex) {
        nodes.push(
          <span key={`txt-${idx}`}>{rawText.substring(lastIndex, inv.start)}</span>
        );
      }
      const isGrave = inv.severidad === 'GRAVE';
      nodes.push(
        <span
          key={`match-${idx}`}
          title={`${inv.severidad}: "${inv.palabra}"`}
          className={`inline-block font-bold px-1 py-0.5 rounded-[1px] transition-all cursor-help ${
            isGrave
              ? 'bg-[#DC2626]/15 text-[#DC2626] border-b-2 border-[#DC2626]'
              : 'bg-[#F5B800]/25 text-[#B45309] border-b-2 border-[#F5B800]'
          }`}
        >
          {inv.text}
        </span>
      );
      lastIndex = inv.end;
    });

    if (lastIndex < rawText.length) {
      nodes.push(<span key="txt-end">{rawText.substring(lastIndex)}</span>);
    }

    return nodes;
  };

  // -------------------------------------------------------------
  // Gestión de Términos (Crear, Editar, Toggle Switch, Eliminar)
  // -------------------------------------------------------------
  const handleOpenCreateModal = () => {
    setEditingPalabra(null);
    setFormPalabra('');
    setFormSeveridad('GRAVE');
    setModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingPalabra(p);
    setFormPalabra(p.palabra);
    setFormSeveridad(p.severidad || 'GRAVE');
    setModalOpen(true);
  };

  const handleSavePalabra = async (e) => {
    e.preventDefault();
    const cleanWord = formPalabra.trim().toLowerCase();

    if (!cleanWord) {
      Swal.fire({
        icon: 'error',
        title: 'Campo obligatorio',
        text: 'Por favor ingresa la palabra o término prohibido.',
        confirmButtonColor: '#0F2342',
      });
      return;
    }

    try {
      setSaving(true);
      if (editingPalabra) {
        await moderationService.actualizarPalabraProhibida(editingPalabra.id, {
          palabra: cleanWord,
          severidad: formSeveridad,
        });
        showToast(`Término "${cleanWord}" actualizado correctamente.`, 'success');
      } else {
        await moderationService.crearPalabraProhibida({
          palabra: cleanWord,
          severidad: formSeveridad,
        });
        showToast(`"${cleanWord}" agregado al diccionario de moderación.`, 'success');
      }

      setModalOpen(false);
      await fetchPalabras();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al procesar término',
        text: err?.response?.data?.message || err?.message || 'No fue posible guardar la palabra.',
        confirmButtonColor: '#0F2342',
      });
    } finally {
      setSaving(false);
    }
  };

  // Interruptor Minimalista rectangular (Toggle Switch en #0F2342) con Sonner Toast
  const handleToggleEstado = async (p) => {
    const nuevoEstado = !p.activa;
    try {
      // Optimistic update
      setPalabras((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, activa: nuevoEstado } : item))
      );
      if (activasGlobal !== null) {
        setActivasGlobal((prev) => (nuevoEstado ? prev + 1 : Math.max(0, prev - 1)));
      }

      await moderationService.cambiarEstadoPalabraProhibida(p.id, nuevoEstado);
      showToast(
        `Regla "${p.palabra}" ${nuevoEstado ? 'activada' : 'desactivada'} en el filtro.`,
        'success'
      );
    } catch (err) {
      // Rollback
      setPalabras((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, activa: !nuevoEstado } : item))
      );
      if (activasGlobal !== null) {
        setActivasGlobal((prev) => (!nuevoEstado ? prev + 1 : Math.max(0, prev - 1)));
      }
      showToast(
        err?.message || 'No fue posible cambiar el estado de la regla.',
        'error'
      );
    }
  };

  // Eliminación con confirmación de SweetAlert2
  const handleDeletePalabra = async (id, palabraTexto) => {
    const res = await Swal.fire({
      title: '¿Eliminar término?',
      text: `¿Deseas remover definitivamente "${palabraTexto}" del diccionario de moderación?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
    });

    if (!res.isConfirmed) return;

    try {
      await moderationService.eliminarPalabraProhibida(id);
      showToast(`"${palabraTexto}" fue retirado del catálogo.`, 'info');
      await fetchPalabras();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: err?.message || 'No fue posible eliminar la palabra en el servidor.',
        confirmButtonColor: '#0F2342',
      });
    }
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* =========================================================================
          2. Cabecera y Barra de Métricas Limpia
         ========================================================================= */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
            DICCIONARIO DE PALABRAS PROHIBIDAS
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
            Reglas de filtrado editorial y bloqueo automático para publicaciones en cartelera.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchPalabras}
            disabled={loading}
            title="Recargar catálogo del servidor"
            className="p-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#64748B] hover:text-[#0F2342] hover:bg-[#F8F9FA] transition-colors cursor-pointer disabled:opacity-50"
          >
            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shadow-2xs"
          >
            <FiPlus size={15} />
            <span>AGREGAR TÉRMINO</span>
          </button>
        </div>
      </div>

      {/* Barra de Resumen en Línea (Métricas separadas por líneas verticales de 1px) */}
      <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xs px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] gap-3 sm:gap-0">
          <div className="sm:pr-6 flex items-baseline gap-2">
            <span className="font-mono font-bold text-lg sm:text-xl text-[#0F2342]">
              {loading ? '—' : totalRegistradas}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              TÉRMINOS REGISTRADOS
            </span>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-6 flex items-baseline gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5B800] self-center shrink-0" />
            <span className="font-mono font-bold text-lg sm:text-xl text-[#0F2342]">
              {loading ? '—' : activasCount}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              ACTIVOS EN FILTRO
            </span>
          </div>

          <div className="pt-2 sm:pt-0 sm:pl-6 flex items-baseline gap-2">
            <span className="font-mono font-bold text-lg sm:text-xl text-[#DC2626]">
              {loading ? '—' : gravesCount}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              SEVERIDAD GRAVE
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. Layout Principal Asimétrico (35% Escáner en Vivo / 65% Muro de Placas)
         ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* =====================================================================
            Zona A: Columna Izquierda (35% — Sticky) — Consola de Escaneo en Vivo
           ===================================================================== */}
        <aside className="w-full lg:w-[35%] shrink-0 lg:sticky lg:top-6 self-start space-y-4">
          <div className="bg-[#FFFFFF] border border-[#0F2342] rounded-[2px] p-6 shadow-2xs space-y-4">
            {/* Encabezado */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F2342] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F5B800] shrink-0" />
                <span>AUDITOR DE TEXTO EN VIVO</span>
              </span>

              {testText.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTestText('');
                    setHasAudited(false);
                  }}
                  className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] hover:text-[#0F2342] underline cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Área de Prueba (textarea de 5 filas, border-radius 2px) */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#64748B] mb-1.5 font-semibold">
                Probador de Copy de Evento (Título y Descripción)
              </label>
              <textarea
                rows={5}
                placeholder="Pega aquí el título y la descripción completa de una postulación para escanear infracciones contra el diccionario comunitario..."
                value={testText}
                onChange={(e) => {
                  setTestText(e.target.value);
                  setHasAudited(true);
                }}
                className="w-full p-3 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] placeholder-[#94A3B8] outline-none focus:border-[#0F2342] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Botón de Auditoría manual */}
            <button
              type="button"
              onClick={() => setHasAudited(true)}
              className="w-full py-2.5 px-4 rounded-[2px] bg-[#0F2342] hover:bg-[#1E3A8A] text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>AUDITAR TEXTO</span>
            </button>

            {/* Diagnóstico Editorial en Tiempo Real (Diferencial UX) */}
            <div className="pt-2 border-t border-[#F1F5F9]">
              {!testText.trim() ? (
                <div className="p-3 border border-dashed border-[#E2E8F0] rounded-[2px] bg-[#F8F9FA] text-center font-mono text-[11px] text-[#64748B]">
                  Ingresa texto arriba para validar términos restringidos al instante.
                </div>
              ) : liveAuditDiagnosis?.hasViolations ? (
                <div className="space-y-3">
                  {/* Alerta de Detección */}
                  <div className="p-3 rounded-[2px] border border-[#DC2626]/30 bg-[#FEF2F2] font-mono text-xs text-[#DC2626] flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold tracking-wider uppercase text-[11px]">
                      <span>✕</span>
                      <span>
                        {liveAuditDiagnosis.count}{' '}
                        {liveAuditDiagnosis.count === 1 ? 'ALERTA DETECTADA' : 'ALERTAS DETECTADAS'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      {liveAuditDiagnosis.graves > 0 && (
                        <span className="text-[#DC2626]">
                          {liveAuditDiagnosis.graves} GRAVE
                        </span>
                      )}
                      {liveAuditDiagnosis.sospechosas > 0 && (
                        <span className="text-[#B45309]">
                          {liveAuditDiagnosis.sospechosas} SOSPECHOSA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Renderizado subrayando las palabras detectadas con marcadores horizontales */}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B] font-semibold block">
                      Marcado de Términos Coincidentes:
                    </span>
                    <div className="p-3 bg-[#F8F9FA] border border-[#E2E8F0] rounded-[2px] font-mono text-xs text-[#0F2342] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
                      {renderMarkedText(testText, liveAuditDiagnosis.intervals)}
                    </div>
                  </div>
                </div>
              ) : (
                /* Texto limpio: Línea verde sobria */
                <div className="p-3 rounded-[2px] border border-[#15803D]/30 bg-[#F0FDF4] font-mono text-xs text-[#15803D] flex items-center gap-2">
                  <FiCheck className="shrink-0 text-[#15803D]" size={16} />
                  <span className="font-bold tracking-wider uppercase text-[11px]">
                    ✓ TEXTO APTO PARA CARTELERA (0 COINCIDENCIAS)
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* =====================================================================
            Zona B: Columna Derecha (65%) — Muro de Placas de Restricción
           ===================================================================== */}
        <section className="w-full lg:w-[65%] flex-1 space-y-4">
          {/* Barra de Filtro Compacta */}
          <div className="space-y-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Buscador rectangular */}
              <div className="relative flex-1">
                <FiSearch
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Buscar término..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] placeholder-[#94A3B8] outline-none focus:border-[#0F2342] transition-colors"
                />
              </div>

              {/* Filtro Solo activas */}
              <label className="flex items-center gap-2 cursor-pointer select-none font-mono text-xs text-[#0F2342] shrink-0">
                <input
                  type="checkbox"
                  checked={onlyActives}
                  onChange={(e) => {
                    setOnlyActives(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="h-4 w-4 rounded-[2px] border-[#CBD5E1] text-[#0F2342] focus:ring-0 cursor-pointer accent-[#0F2342]"
                />
                <span className="font-bold uppercase tracking-wider text-[11px] text-[#0F2342]">
                  Solo activas
                </span>
              </label>
            </div>

            {/* Tabs tipográficos con subrayado #F5B800 */}
            <div className="flex items-center gap-6 border-t border-[#F1F5F9] pt-3 px-1 font-mono text-xs uppercase tracking-wider overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setSelectedSeveridad('TODAS');
                  setCurrentPage(1);
                }}
                className={`pb-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedSeveridad === 'TODAS'
                    ? 'border-b-2 border-[#F5B800] text-[#0F2342] font-black'
                    : 'text-[#64748B] hover:text-[#0F2342] border-b-2 border-transparent'
                }`}
              >
                TODOS ({tabCounts.todas})
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSeveridad('GRAVE');
                  setCurrentPage(1);
                }}
                className={`pb-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedSeveridad === 'GRAVE'
                    ? 'border-b-2 border-[#F5B800] text-[#0F2342] font-black'
                    : 'text-[#64748B] hover:text-[#0F2342] border-b-2 border-transparent'
                }`}
              >
                GRAVE ({tabCounts.graves})
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSeveridad('SOSPECHOSA');
                  setCurrentPage(1);
                }}
                className={`pb-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedSeveridad === 'SOSPECHOSA'
                    ? 'border-b-2 border-[#F5B800] text-[#0F2342] font-black'
                    : 'text-[#64748B] hover:text-[#0F2342] border-b-2 border-transparent'
                }`}
              >
                SOSPECHOSA ({tabCounts.sospechosas})
              </button>
            </div>
          </div>

          {/* Muro de Placas de Restricción (Grid modular sin tablas) */}
          {loading ? (
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-12 text-center font-mono text-xs text-[#64748B] shadow-2xs">
              <FiRefreshCw size={18} className="mx-auto mb-2 text-[#0F2342] animate-spin" />
              <p className="uppercase tracking-wider">Cargando catálogo de restricciones...</p>
            </div>
          ) : paginatedPalabras.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-dashed border-[#CBD5E1] rounded-[2px] p-12 text-center font-mono text-xs text-[#64748B]">
              <p className="font-bold text-[#0F2342] uppercase tracking-wider text-sm">
                No se encontraron términos
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Ajusta los filtros de búsqueda o registra una nueva regla de restricción.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
              {paginatedPalabras.map((p) => {
                const isGrave = p.severidad === 'GRAVE';
                const isActiva = p.activa;

                // Indicador lateral de 4px: Rojo sobrio (#DC2626) si es GRAVE, Ámbar (#F5B800) si es SOSPECHOSA, Gris (#CBD5E1) si está inactiva
                const borderLeftColor = !isActiva
                  ? 'border-l-[#CBD5E1]'
                  : isGrave
                  ? 'border-l-[#DC2626]'
                  : 'border-l-[#F5B800]';

                return (
                  <div
                    key={p.id}
                    className={`bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-[18px] border-l-4 ${borderLeftColor} shadow-2xs hover:border-[#0F2342]/40 transition-all flex flex-col justify-between`}
                  >
                    {/* Fila Superior de la Placa */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-[10px] font-bold tracking-widest uppercase ${
                          !isActiva
                            ? 'text-[#94A3B8]'
                            : isGrave
                            ? 'text-[#DC2626]'
                            : 'text-[#B45309]'
                        }`}
                      >
                        {isGrave ? 'GRAVE • BLOQUEO' : 'SOSPECHOSA • ALERTA'}
                        {!isActiva && ' (INACTIVA)'}
                      </span>

                      {/* Interruptor Editorial Minimalista (Toggle Switch rectangular 2px) */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActiva}
                        onClick={() => handleToggleEstado(p)}
                        title={isActiva ? 'Desactivar regla' : 'Activar regla'}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-[2px] border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isActiva ? 'bg-[#0F2342]' : 'bg-[#E2E8F0]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-[2px] shadow-xs transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
                            isActiva ? 'translate-x-4 bg-[#F5B800]' : 'translate-x-0 bg-[#FFFFFF]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Cuerpo Central (El Término en tipografía Display/Monoespaciada grande y negrita) */}
                    <div className="my-3 min-h-[44px] flex items-center">
                      <h3
                        className={`font-mono font-bold text-base sm:text-lg tracking-tight break-words leading-tight ${
                          isActiva ? 'text-[#0F2342]' : 'text-[#64748B] line-through'
                        }`}
                      >
                        {p.palabra}
                      </h3>
                    </div>

                    {/* Pie de la Placa (Separado por línea 1px solid #F1F5F9) */}
                    <div className="border-t border-[#F1F5F9] pt-3 flex items-center justify-between mt-auto">
                      <span className="font-mono text-[10px] text-[#64748B]">
                        {formatFechaSimple(p.fechaCreacion)}
                      </span>

                      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider font-bold">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="text-[#0F2342] hover:text-[#C68B17] transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <span className="text-[#CBD5E1]">|</span>
                        <button
                          type="button"
                          onClick={() => handleDeletePalabra(p.id, p.palabra)}
                          className="text-[#DC2626] hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación Única y Limpia (Pie del Muro, sin duplicaciones de texto) */}
          {totalFiltered > pageSize && (
            <div className="p-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-mono shadow-2xs select-none">
              <span className="text-[#64748B]">
                Mostrando {(safeCurrentPage - 1) * pageSize + 1}–
                {Math.min(safeCurrentPage * pageSize, totalFiltered)} de {totalFiltered} términos
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="h-8 w-8 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F2342] hover:bg-[#F8F9FA] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Página anterior"
                >
                  <FiChevronLeft size={14} />
                </button>

                {pageNumbers.map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="h-8 w-6 flex items-center justify-center text-[#94A3B8]"
                      >
                        …
                      </span>
                    );
                  }
                  const isActive = p === safeCurrentPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 min-w-[32px] px-2 rounded-[2px] border text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'bg-[#0F2342] text-[#F5B800] border-[#0F2342]'
                          : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#0F2342] hover:bg-[#F8F9FA]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="h-8 w-8 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F2342] hover:bg-[#F8F9FA] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Página siguiente"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* =========================================================================
          Modal Rectangular para Crear o Editar Término
         ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FFFFFF] rounded-[2px] border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5 sm:p-6 bg-[#0F2342] text-white">
              <div>
                <h3 className="font-display font-black text-base uppercase tracking-tight text-white">
                  {editingPalabra ? 'Editar Término Prohibido' : 'Registrar Nuevo Término Prohibido'}
                </h3>
                <p className="font-mono text-xs text-slate-300 mt-0.5">
                  Reglas comunitarias y validación algorítmica
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePalabra} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Palabra o Frase Restringida <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Ej: menores de edad, alcohol ilimitado, rifa..."
                  value={formPalabra}
                  onChange={(e) => setFormPalabra(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F2342] font-mono outline-none focus:border-[#0F2342] transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                  Nivel de Severidad <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formSeveridad}
                  onChange={(e) => setFormSeveridad(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] cursor-pointer"
                >
                  <option value="GRAVE">GRAVE (Bloqueo automático de evento)</option>
                  <option value="SOSPECHOSA">SOSPECHOSA (Alerta prioritaria para moderador)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#64748B] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !formPalabra.trim()}
                  className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editingPalabra ? 'Guardar Cambios' : 'Agregar Término'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
