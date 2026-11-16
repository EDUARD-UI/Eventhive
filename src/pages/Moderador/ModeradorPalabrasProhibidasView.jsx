import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiShield,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiRefreshCw,
  FiClock,
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

  // Simulador de texto en vivo
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

  // Filtrado en memoria sobre los datos actuales
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

  // KPIs reales provenientes del backend
  const totalRegistradas = totalElements || palabras.length;
  const activasCount = activasGlobal !== null ? activasGlobal : palabras.filter((p) => p.activa).length;
  const gravesCount = gravesGlobal !== null ? gravesGlobal : palabras.filter((p) => p.severidad === 'GRAVE').length;

  // Acciones: Abrir modales
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

  // Guardar (Crear o Editar en Backend)
  const handleSavePalabra = async (e) => {
    e.preventDefault();
    const cleanWord = formPalabra.trim().toLowerCase();

    if (!cleanWord) {
      Swal.fire({
        icon: 'error',
        title: 'Campo obligatorio',
        text: 'Por favor ingresa la palabra o término prohibido.',
        confirmButtonColor: '#0B1B3D',
      });
      return;
    }

    if (cleanWord.length > 100) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite excedido',
        text: 'La palabra o frase no puede superar los 100 caracteres.',
        confirmButtonColor: '#0B1B3D',
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
          text: `La palabra "${cleanWord}" fue actualizada exitosamente en el backend.`,
          timer: 2000,
          confirmButtonColor: '#0B1B3D',
        });
      } else {
        await moderationService.crearPalabraProhibida({
          palabra: cleanWord,
          severidad: formSeveridad,
        });

        Swal.fire({
          icon: 'success',
          title: 'Término registrado',
          text: `Se agregó "${cleanWord}" a las reglas oficiales del backend.`,
          timer: 2000,
          confirmButtonColor: '#0B1B3D',
        });
      }

      setModalOpen(false);
      await fetchPalabras();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar el término',
        text: err?.message || 'Ocurrió un error al comunicar con el servidor.',
        confirmButtonColor: '#0B1B3D',
      });
    } finally {
      setSaving(false);
    }
  };

  // Alternar estado activo / inactivo
  const handleToggleEstado = async (p) => {
    try {
      const nextActiva = !p.activa;
      await moderationService.cambiarEstadoPalabraProhibida(p.id, nextActiva);

      setPalabras((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, activa: nextActiva } : item))
      );
      setActivasGlobal((prev) => (prev !== null ? Math.max(0, prev + (nextActiva ? 1 : -1)) : null));

      const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
      toast.fire({
        icon: 'success',
        title: nextActiva ? 'Palabra activada en el filtro' : 'Palabra desactivada',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cambiar estado',
        text: err?.message || 'No fue posible actualizar el estado en el backend.',
        confirmButtonColor: '#0B1B3D',
      });
    }
  };

  // Eliminar palabra prohibida
  const handleDeletePalabra = async (id, palabraTexto) => {
    const res = await Swal.fire({
      title: '¿Eliminar término?',
      text: `¿Deseas remover definitivamente "${palabraTexto}" de la lista oficial de palabras prohibidas?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
    });

    if (!res.isConfirmed) return;

    try {
      await moderationService.eliminarPalabraProhibida(id);
      Swal.fire({
        icon: 'success',
        title: 'Término eliminado',
        text: 'La palabra fue retirada del catálogo de moderación.',
        timer: 2000,
        confirmButtonColor: '#0B1B3D',
      });
      await fetchPalabras();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: err?.message || 'No fue posible eliminar la palabra en el backend.',
        confirmButtonColor: '#0B1B3D',
      });
    }
  };

  // Simulador de verificación rápida
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header con aviso oficial y botón de recargar / agregar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
              Filtro y Convivencia
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              Conexión en Vivo Backend
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <FiShield className="w-5 h-5 text-amber-500" />
            <span>Diccionario de Palabras Prohibidas</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 max-w-xl font-medium">
            Supervisa y gestiona los términos restringidos por políticas comunitarias para evitar contenido fraudulento, ilícito u ofensivo en publicaciones de eventos.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchPalabras}
            disabled={loading}
            title="Recargar datos del servidor"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <FiPlus size={16} />
            <span>Agregar término</span>
          </button>
        </div>
      </div>

      {/* 2. KPIs de Moderación con Datos Reales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
            <FiShield size={22} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Términos Registrados
            </span>
            <strong className="text-2xl font-black font-display text-slate-900">
              {totalRegistradas}
            </strong>
            <span className="text-[10px] text-slate-500 block">En base de datos del sistema</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
            <FiCheckCircle size={22} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Términos Activos
            </span>
            <strong className="text-2xl font-black font-display text-slate-900">
              {activasCount}
            </strong>
            <span className="text-[10px] text-slate-500 block">Aplicando filtro en vivo</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 shrink-0">
            <FiAlertTriangle size={22} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Severidad Grave
            </span>
            <strong className="text-2xl font-black font-display text-slate-900">
              {gravesCount}
            </strong>
            <span className="text-[10px] text-slate-500 block">Bloqueo automático de evento</span>
          </div>
        </div>
      </div>

      {/* 3. Simulador de Verificación Rápida */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 font-display">
              Auditor de Texto en Vivo
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Prueba de Algoritmo
            </span>
          </div>
          {testResults && (
            <button
              type="button"
              onClick={() => {
                setTestText('');
                setTestResults(null);
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Limpiar prueba
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Escribe un título o descripción de evento para probar si contiene términos prohibidos..."
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunSimulator()}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 font-medium transition-all"
          />
          <button
            type="button"
            onClick={handleRunSimulator}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 transition-all cursor-pointer"
          >
            Auditar Texto
          </button>
        </div>

        {testResults && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 ${
              testResults.hasViolations
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
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
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-200 text-rose-900">
                Bloqueado
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. Barra de Filtros y Búsqueda */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar término prohibido..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 font-medium transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro por Severidad */}
          <select
            value={selectedSeveridad}
            onChange={(e) => {
              setSelectedSeveridad(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 cursor-pointer"
          >
            <option value="TODAS">Todas las severidades</option>
            <option value="GRAVE">Solo GRAVE</option>
            <option value="SOSPECHOSA">Solo SOSPECHOSA</option>
          </select>

          {/* Filtro por Estado */}
          <select
            value={selectedEstado}
            onChange={(e) => {
              setSelectedEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVA">Solo Activas</option>
            <option value="INACTIVA">Solo Inactivas</option>
          </select>
        </div>
      </div>

      {/* 5. Tabla de Términos con Datos Reales */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Término Prohibido</th>
                <th className="px-5 py-3.5">Nivel de Severidad</th>
                <th className="px-5 py-3.5">Estado en Filtro</th>
                <th className="px-5 py-3.5">Fecha de Creación</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <FiRefreshCw size={22} className="mx-auto mb-2 text-amber-500 animate-spin" />
                    <p className="font-bold text-slate-700">Cargando términos desde el servidor...</p>
                  </td>
                </tr>
              ) : filteredPalabras.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    <FiShield size={24} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700">No se encontraron términos</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Intenta ajustar los criterios de búsqueda o agrega un nuevo término.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPalabras.map((p) => {
                  const isActiva = p.activa;
                  const isGrave = p.severidad === 'GRAVE';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Palabra */}
                      <td className="px-5 py-4">
                        <span className="font-black text-slate-900 font-mono text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200/80">
                          {p.palabra}
                        </span>
                      </td>

                      {/* Severidad */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                            isGrave
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-amber-100 text-amber-900 border-amber-200'
                          }`}
                        >
                          {p.severidad}
                        </span>
                      </td>

                      {/* Estado con Toggle */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleEstado(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            isActiva
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActiva ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isActiva ? 'Activa' : 'Inactiva'}</span>
                        </button>
                      </td>

                      {/* Fecha de Creación */}
                      <td className="px-5 py-4 text-slate-500 font-normal">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <FiClock size={12} className="text-slate-400" />
                          <span>{p.fechaCreacion ? formatFechaHora(p.fechaCreacion) : '—'}</span>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            title="Editar término"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePalabra(p.id, p.palabra)}
                            title="Eliminar de la lista"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
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
          <div className="border-t border-slate-100">
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

      {/* Modal / Drawer para Crear o Editar Término */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <h3 className="font-display text-base font-black text-slate-900">
                  {editingPalabra ? 'Editar Término Prohibido' : 'Registrar Nuevo Término Prohibido'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Los eventos que contengan esta frase serán restringidos automáticamente por el backend.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePalabra} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Palabra o Frase Restringida *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Ej: estafa, boleta falsa, piratería..."
                  value={formPalabra}
                  onChange={(e) => setFormPalabra(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Máximo 100 caracteres.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nivel de Severidad *
                </label>
                <select
                  value={formSeveridad}
                  onChange={(e) => setFormSeveridad(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 cursor-pointer"
                >
                  <option value="GRAVE">GRAVE (Bloqueo y rechazo automático)</option>
                  <option value="SOSPECHOSA">SOSPECHOSA (Alerta prioritaria para moderador)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Determina el impacto en la verificación de eventos.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !formPalabra.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 text-amber-300 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
