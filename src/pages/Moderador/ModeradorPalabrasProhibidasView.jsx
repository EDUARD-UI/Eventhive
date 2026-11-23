import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiSearch,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiRefreshCw,
  FiX,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import Pagination from '../../components/Shared/Pagination.jsx';
import moderationService from '../../services/moderationService.js';
import { formatFechaHora } from '../../utils/formatters.js';

export default function ModeradorPalabrasProhibidasView() {
  const [palabras, setPalabras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeveridad, setSelectedSeveridad] = useState('TODAS');
  const [selectedEstado, setSelectedEstado] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [activasGlobal, setActivasGlobal] = useState(null);
  const [gravesGlobal, setGravesGlobal] = useState(null);

  // Modal para agregar/editar palabra
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPalabra, setEditingPalabra] = useState(null);
  const [formPalabra, setFormPalabra] = useState('');
  const [formSeveridad, setFormSeveridad] = useState('GRAVE');
  const [saving, setSaving] = useState(false);

  // Auditor de texto en vivo
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState(null);

  // Cargar palabras prohibidas desde el backend
  const fetchPalabras = useCallback(async () => {
    try {
      setLoading(true);
      const res = await moderationService.getPalabrasProhibidas({
        page: currentPage - 1,
        size: pageSize,
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
        palabra: item.palabra || '',
        severidad: (item.severidad || 'GRAVE').toUpperCase(),
        activa: Boolean(item.activa),
        fechaCreacion: item.fechaCreacion || null,
      }));

      setPalabras(normalized);
      setTotalElements(total);
    } catch (err) {
      console.warn('Error al cargar palabras prohibidas desde el backend:', err);
      setPalabras([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchPalabras();
  }, [fetchPalabras]);

  // Escape key para cerrar modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOpen && !saving) {
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, saving]);

  // Filtrado en memoria
  const filteredPalabras = useMemo(() => {
    return palabras.filter((p) => {
      const matchSearch =
        !searchTerm.trim() ||
        p.palabra.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchSev =
        selectedSeveridad === 'TODAS' || p.severidad === selectedSeveridad;

      const matchEstado =
        selectedEstado === 'TODOS' ||
        (selectedEstado === 'ACTIVA' && p.activa) ||
        (selectedEstado === 'INACTIVA' && !p.activa);

      return matchSearch && matchSev && matchEstado;
    });
  }, [palabras, searchTerm, selectedSeveridad, selectedEstado]);

  // Métricas reales
  const totalRegistradas = totalElements || palabras.length;
  const activasCount = activasGlobal !== null ? activasGlobal : palabras.filter((p) => p.activa).length;
  const gravesCount = gravesGlobal !== null ? gravesGlobal : palabras.filter((p) => p.severidad === 'GRAVE').length;

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
        Swal.fire({
          icon: 'success',
          title: 'Término actualizado',
          text: `"${cleanWord}" ha sido modificado exitosamente.`,
          timer: 1800,
          confirmButtonColor: '#0F2342',
        });
      } else {
        await moderationService.crearPalabraProhibida({
          palabra: cleanWord,
          severidad: formSeveridad,
        });
        Swal.fire({
          icon: 'success',
          title: 'Término agregado',
          text: `"${cleanWord}" se incorporó al diccionario de moderación.`,
          timer: 1800,
          confirmButtonColor: '#0F2342',
        });
      }

      setModalOpen(false);
      await fetchPalabras();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err?.response?.data?.message || err?.message || 'No se pudo guardar la palabra.',
        confirmButtonColor: '#0F2342',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async (p) => {
    try {
      const nuevoEstado = !p.activa;
      await moderationService.cambiarEstadoPalabraProhibida(p.id, nuevoEstado);
      setPalabras((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, activa: nuevoEstado } : item))
      );
      if (activasGlobal !== null) {
        setActivasGlobal((prev) => (nuevoEstado ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cambiar estado',
        text: err?.message || 'No fue posible actualizar el estado del término.',
        confirmButtonColor: '#0F2342',
      });
    }
  };

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
      Swal.fire({
        icon: 'success',
        title: 'Término eliminado',
        text: 'La palabra fue retirada del catálogo de moderación.',
        timer: 1800,
        confirmButtonColor: '#0F2342',
      });
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

  const handleRunSimulator = () => {
    if (!testText.trim()) {
      setTestResults(null);
      return;
    }

    const lower = testText.toLowerCase();
    const activeWords = palabras.filter((p) => p.activa);
    const matched = activeWords.filter((w) => lower.includes(w.palabra.toLowerCase()));

    setTestResults({
      tested: true,
      matched,
      hasViolations: matched.length > 0,
    });
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* 1. Cabecera Editorial */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
            DICCIONARIO DE PALABRAS PROHIBIDAS
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
            Supervisa y gestiona los términos restringidos para evitar contenido no conforme en cartelera.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchPalabras}
            disabled={loading}
            title="Recargar datos del servidor"
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

      {/* 2. Resumen en Línea (Reemplazo de las 3 cajas KPI) */}
      <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xs overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              Términos Registrados
            </span>
            <span className="font-mono font-bold text-lg sm:text-xl text-[#0F2342]">
              {loading ? '—' : totalRegistradas}
            </span>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                Activos en Filtro
              </span>
            </div>
            <span className="font-mono font-bold text-lg sm:text-xl text-[#0F2342]">
              {loading ? '—' : activasCount}
            </span>
          </div>

          <div className="p-4 sm:p-5 col-span-2 md:col-span-1 flex items-center justify-between border-t border-[#E2E8F0] md:border-t-0">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              Severidad Grave
            </span>
            <span className="font-mono font-bold text-lg sm:text-xl text-[#DC2626]">
              {loading ? '—' : gravesCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Auditor de Texto en Vivo (Consola de Prueba) */}
      <div className="p-5 sm:p-6 rounded-[2px] bg-[#FFFFFF] border border-[#0F2342] shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F2342] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
            <span>AUDITOR DE TEXTO EN VIVO</span>
          </span>
          {testResults && (
            <button
              type="button"
              onClick={() => {
                setTestText('');
                setTestResults(null);
              }}
              className="font-mono text-xs uppercase tracking-wider text-[#64748B] hover:text-[#0F2342] underline cursor-pointer"
            >
              Limpiar prueba
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Escribe un título o descripción de evento para auditar coincidencias..."
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunSimulator()}
            className="flex-1 px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] placeholder-[#94A3B8] outline-none focus:border-[#0F2342] transition-colors"
          />
          <button
            type="button"
            onClick={handleRunSimulator}
            className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#1E3A8A] text-white font-mono text-xs uppercase tracking-wider font-bold shrink-0 transition-colors cursor-pointer"
          >
            AUDITAR TEXTO
          </button>
        </div>

        {testResults && (
          <div
            className={`p-3.5 rounded-[2px] border text-xs font-mono flex items-center justify-between gap-3 ${
              testResults.hasViolations
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResults.hasViolations ? (
                <FiXCircle size={16} className="text-rose-600 shrink-0" />
              ) : (
                <FiCheckCircle size={16} className="text-emerald-600 shrink-0" />
              )}
              <span>
                {testResults.hasViolations
                  ? `Se detectaron ${testResults.matched.length} término(s) prohibido(s): ${testResults.matched.map((m) => `"${m.palabra}"`).join(', ')}`
                  : 'Texto limpio. No se detectaron términos prohibidos en la cadena evaluada.'}
              </span>
            </div>
            {testResults.hasViolations && (
              <span className="font-bold uppercase tracking-wider text-[11px] text-rose-700">
                BLOQUEADO
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. Barra de Filtros y Búsqueda */}
      <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar término en el diccionario..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3.5 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] placeholder-[#94A3B8] outline-none focus:border-[#0F2342]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedSeveridad}
            onChange={(e) => {
              setSelectedSeveridad(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] cursor-pointer"
          >
            <option value="TODAS">Todas las severidades</option>
            <option value="GRAVE">Solo GRAVE</option>
            <option value="SOSPECHOSA">Solo SOSPECHOSA</option>
          </select>

          <select
            value={selectedEstado}
            onChange={(e) => {
              setSelectedEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVA">Solo Activas</option>
            <option value="INACTIVA">Solo Inactivas</option>
          </select>
        </div>
      </div>

      {/* 5. Tabla de Términos (Sin cajas redondeadas de colores) */}
      <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] overflow-hidden">
        <div className="editorial-scroll-x w-full">
          <table className="w-full border-collapse text-left text-xs min-w-[680px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#FFFFFF] font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                <th className="px-5 py-4 font-bold">Término Prohibido</th>
                <th className="px-5 py-4 font-bold">Nivel de Severidad</th>
                <th className="px-5 py-4 font-bold">Estado en Filtro</th>
                <th className="px-5 py-4 font-bold">Fecha de Registro</th>
                <th className="px-5 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#64748B] font-mono text-xs">
                    <FiRefreshCw size={18} className="mx-auto mb-2 text-[#0F2342] animate-spin" />
                    <p>Cargando diccionario desde el servidor...</p>
                  </td>
                </tr>
              ) : filteredPalabras.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#64748B] font-mono text-xs">
                    <p className="font-bold text-[#0F2342] uppercase tracking-wider">No se encontraron términos</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Intenta ajustar los criterios de búsqueda o agrega un nuevo término.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPalabras.map((p) => {
                  const isActiva = p.activa;
                  const isGrave = p.severidad === 'GRAVE';

                  return (
                    <tr key={p.id} className="hover:bg-[#F8F9FA]/60 transition-colors">
                      {/* Palabra en fuente monoespaciada */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-bold text-[#0F2342]">
                          {p.palabra}
                        </span>
                      </td>

                      {/* Severidad: Texto limpio con acento de color sin cajas */}
                      <td className="px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-wider">
                        <span className={isGrave ? 'text-[#DC2626]' : 'text-[#B45309]'}>
                          {p.severidad}
                        </span>
                      </td>

                      {/* Estado: Punto de 6px + texto */}
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleEstado(p)}
                          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#0F2342] hover:text-[#C68B17] transition-colors cursor-pointer"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActiva ? 'bg-[#15803D]' : 'bg-[#94A3B8]'
                            }`}
                          />
                          <span>{isActiva ? 'ACTIVA' : 'INACTIVA'}</span>
                        </button>
                      </td>

                      {/* Fecha de Registro */}
                      <td className="px-5 py-3.5 font-mono text-xs text-[#64748B]">
                        {p.fechaCreacion ? formatFechaHora(p.fechaCreacion) : '—'}
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            title="Editar término"
                            className="p-1.5 rounded-[2px] border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#0F2342] transition-colors cursor-pointer"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePalabra(p.id, p.palabra)}
                            title="Eliminar de la lista"
                            className="p-1.5 rounded-[2px] border border-[#E2E8F0] hover:bg-rose-50 text-[#DC2626] transition-colors cursor-pointer"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalElements > pageSize && (
          <div className="p-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-mono">
            <span className="text-[#64748B]">
              Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalElements)} de {totalElements} términos
            </span>
            <Pagination
              currentPage={currentPage}
              totalItems={totalElements}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        )}
      </div>

      {/* Modal Rectangular para Crear o Editar Término */}
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
                  placeholder="Ej: estafa, boleta falsa, piratería..."
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
