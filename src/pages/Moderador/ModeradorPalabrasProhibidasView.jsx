import React, { useState, useMemo } from 'react';
import {
  FiShield,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiX,
  FiLayers,
  FiTag,
  FiInfo,
  FiEye,
  FiCopy,
  FiRefreshCw,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';

const INITIAL_PALABRAS = [
  {
    id: 1,
    palabra: 'estafa',
    categoria: 'Fraude & Engaño',
    severidad: 'Alta',
    estado: 'ACTIVA',
    fechaCreacion: '2026-10-15',
    detecciones: 38,
    motivo: 'Protección contra promociones fraudulentas y suplantación.',
  },
  {
    id: 2,
    palabra: 'boletas falsas',
    categoria: 'Fraude & Engaño',
    severidad: 'Alta',
    estado: 'ACTIVA',
    fechaCreacion: '2026-10-15',
    detecciones: 24,
    motivo: 'Comercialización ilegal o falsificación de entradas.',
  },
  {
    id: 3,
    palabra: 'reventa ilegal',
    categoria: 'Comercio Ilícito',
    severidad: 'Alta',
    estado: 'ACTIVA',
    fechaCreacion: '2026-10-18',
    detecciones: 19,
    motivo: 'Violación a la normativa oficial de reventa no autorizada.',
  },
  {
    id: 4,
    palabra: 'sustancias ilícitas',
    categoria: 'Salud & Seguridad',
    severidad: 'Alta',
    estado: 'ACTIVA',
    fechaCreacion: '2026-10-20',
    detecciones: 14,
    motivo: 'Prohibición explícita de consumo de drogas y estupefacientes.',
  },
  {
    id: 5,
    palabra: 'armas de fuego',
    categoria: 'Violencia & Armas',
    severidad: 'Alta',
    estado: 'ACTIVA',
    fechaCreacion: '2026-10-22',
    detecciones: 8,
    motivo: 'Ingreso o promoción de cualquier armamento bélico o traumático.',
  },
  {
    id: 6,
    palabra: 'contenido sexual explícito',
    categoria: 'Contenido Adulto',
    severidad: 'Alta',
    estado: 'ACTIVA',
    fechaCreacion: '2026-10-25',
    detecciones: 12,
    motivo: 'Restricción en cartelera pública apta para todo espectador.',
  },
  {
    id: 7,
    palabra: 'discriminación racial',
    categoria: 'Convivencia & Odio',
    severidad: 'Media',
    estado: 'ACTIVA',
    fechaCreacion: '2026-10-28',
    detecciones: 7,
    motivo: 'Cero tolerancia al racismo o xenofobia en eventos culturales.',
  },
  {
    id: 8,
    palabra: 'piratería',
    categoria: 'Propiedad Intelectual',
    severidad: 'Media',
    estado: 'ACTIVA',
    fechaCreacion: '2026-11-01',
    detecciones: 5,
    motivo: 'Uso no licenciado de marcas, artistas o producciones registradas.',
  },
  {
    id: 9,
    palabra: 'spam masivo',
    categoria: 'Comportamiento Abusivo',
    severidad: 'Baja',
    estado: 'INACTIVA',
    fechaCreacion: '2026-11-02',
    detecciones: 2,
    motivo: 'Palabras repetitivas usadas para saturar títulos de eventos.',
  },
];

const CATEGORIAS_DISPONIBLES = [
  'Fraude & Engaño',
  'Comercio Ilícito',
  'Salud & Seguridad',
  'Violencia & Armas',
  'Contenido Adulto',
  'Convivencia & Odio',
  'Propiedad Intelectual',
  'Comportamiento Abusivo',
];

export default function ModeradorPalabrasProhibidasView() {
  const [palabras, setPalabras] = useState(INITIAL_PALABRAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('TODAS');
  const [selectedEstado, setSelectedEstado] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modal para agregar/editar palabra
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPalabra, setEditingPalabra] = useState(null);
  const [formPalabra, setFormPalabra] = useState('');
  const [formCategoria, setFormCategoria] = useState(CATEGORIAS_DISPONIBLES[0]);
  const [formSeveridad, setFormSeveridad] = useState('Alta');
  const [formMotivo, setFormMotivo] = useState('');

  // Simulador de texto contra filtro
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState(null);

  // Filtrado
  const filteredPalabras = useMemo(() => {
    return palabras.filter((p) => {
      const matchSearch =
        !searchTerm.trim() ||
        p.palabra.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.motivo.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchCat =
        selectedCategoria === 'TODAS' || p.categoria === selectedCategoria;

      const matchEstado =
        selectedEstado === 'TODOS' || p.estado === selectedEstado;

      return matchSearch && matchCat && matchEstado;
    });
  }, [palabras, searchTerm, selectedCategoria, selectedEstado]);

  // Paginación
  const paginatedPalabras = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPalabras.slice(start, start + pageSize);
  }, [filteredPalabras, currentPage, pageSize]);

  // KPIs
  const totalPalabras = palabras.length;
  const activasCount = palabras.filter((p) => p.estado === 'ACTIVA').length;
  const totalDetecciones = palabras.reduce((acc, curr) => acc + (curr.detecciones || 0), 0);

  // Acciones
  const handleOpenCreateModal = () => {
    setEditingPalabra(null);
    setFormPalabra('');
    setFormCategoria(CATEGORIAS_DISPONIBLES[0]);
    setFormSeveridad('Alta');
    setFormMotivo('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingPalabra(p);
    setFormPalabra(p.palabra);
    setFormCategoria(p.categoria);
    setFormSeveridad(p.severidad);
    setFormMotivo(p.motivo);
    setModalOpen(true);
  };

  const handleSavePalabra = (e) => {
    e.preventDefault();
    if (!formPalabra.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Campo obligatorio',
        text: 'Por favor ingresa el término o palabra prohibida.',
        confirmButtonColor: '#0B1B3D',
      });
      return;
    }

    if (editingPalabra) {
      setPalabras((prev) =>
        prev.map((item) =>
          item.id === editingPalabra.id
            ? {
                ...item,
                palabra: formPalabra.trim().toLowerCase(),
                categoria: formCategoria,
                severidad: formSeveridad,
                motivo: formMotivo.trim() || 'Regla de moderación de contenido.',
              }
            : item
        )
      );
      Swal.fire({
        icon: 'success',
        title: 'Término actualizado',
        text: `El término "${formPalabra.trim()}" fue actualizado en la lista de moderación.`,
        timer: 2000,
        confirmButtonColor: '#0B1B3D',
      });
    } else {
      const exists = palabras.some(
        (p) => p.palabra.toLowerCase() === formPalabra.trim().toLowerCase()
      );
      if (exists) {
        Swal.fire({
          icon: 'warning',
          title: 'Término ya registrado',
          text: `La palabra "${formPalabra.trim()}" ya existe en el diccionario prohibido.`,
          confirmButtonColor: '#0B1B3D',
        });
        return;
      }

      const newEntry = {
        id: Date.now(),
        palabra: formPalabra.trim().toLowerCase(),
        categoria: formCategoria,
        severidad: formSeveridad,
        estado: 'ACTIVA',
        fechaCreacion: new Date().toISOString().split('T')[0],
        detecciones: 0,
        motivo: formMotivo.trim() || 'Regla de moderación de contenido.',
      };

      setPalabras((prev) => [newEntry, ...prev]);
      Swal.fire({
        icon: 'success',
        title: 'Término añadido',
        text: `Se agregó "${formPalabra.trim()}" a las reglas del filtro automático.`,
        timer: 2000,
        confirmButtonColor: '#0B1B3D',
      });
    }

    setModalOpen(false);
  };

  const handleToggleEstado = (id) => {
    setPalabras((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextEstado = p.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
          return { ...p, estado: nextEstado };
        }
        return p;
      })
    );
  };

  const handleDeletePalabra = async (id, palabraTexto) => {
    const res = await Swal.fire({
      title: '¿Eliminar término?',
      text: `¿Deseas remover "${palabraTexto}" del filtro de moderación?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
    });

    if (res.isConfirmed) {
      setPalabras((prev) => prev.filter((p) => p.id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Término eliminado',
        text: 'La palabra fue retirada del catálogo de moderación.',
        timer: 2000,
        confirmButtonColor: '#0B1B3D',
      });
    }
  };

  const handleRunSimulator = () => {
    if (!testText.trim()) {
      setTestResults(null);
      return;
    }

    const lower = testText.toLowerCase();
    const activeWords = palabras.filter((p) => p.estado === 'ACTIVA');
    const matched = activeWords.filter((w) => lower.includes(w.palabra.toLowerCase()));

    setTestResults({
      tested: true,
      matched,
      hasViolations: matched.length > 0,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header con aviso de backend y botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
              Filtro y Convivencia
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              Módulo de Auditoría
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <FiShield className="w-5 h-5 text-amber-500" />
            <span>Diccionario de Palabras Prohibidas</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 max-w-xl font-medium">
            Define y supervisa los términos restringidos por políticas comunitarias para evitar contenido fraudulento, ilícito u ofensivo en títulos y descripciones de eventos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Agregar término</span>
        </button>
      </div>

      {/* 2. KPIs de Moderación */}
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
              {totalPalabras}
            </strong>
            <span className="text-[10px] text-slate-500 block">En diccionario del sistema</span>
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
              Detecciones Prevenidas
            </span>
            <strong className="text-2xl font-black font-display text-slate-900">
              {totalDetecciones}
            </strong>
            <span className="text-[10px] text-slate-500 block">Incidencias interceptadas</span>
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
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
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
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <FiSearch
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar término o motivo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 font-medium transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro por Categoría */}
          <select
            value={selectedCategoria}
            onChange={(e) => {
              setSelectedCategoria(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 cursor-pointer"
          >
            <option value="TODAS">Todas las categorías</option>
            {CATEGORIAS_DISPONIBLES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
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

      {/* 5. Tabla de Términos */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Término Prohibido</th>
                <th className="px-5 py-3.5">Categoría</th>
                <th className="px-5 py-3.5">Severidad</th>
                <th className="px-5 py-3.5">Detecciones</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {paginatedPalabras.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    <FiShield size={24} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700">No se encontraron términos</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Intenta ajustar los criterios de búsqueda o filtro.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPalabras.map((p) => {
                  const isActiva = p.estado === 'ACTIVA';
                  const severidadColor =
                    p.severidad === 'Alta'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : p.severidad === 'Media'
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Palabra y Motivo */}
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 font-mono text-xs">
                            {p.palabra}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                            {p.motivo}
                          </p>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {p.categoria}
                        </span>
                      </td>

                      {/* Severidad */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${severidadColor}`}
                        >
                          {p.severidad}
                        </span>
                      </td>

                      {/* Detecciones */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800">
                          {p.detecciones || 0}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleEstado(p.id)}
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
        {filteredPalabras.length > pageSize && (
          <div className="border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredPalabras.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 8, 15, 30]}
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
                  Los eventos que contengan esta frase serán restringidos por el filtro.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
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
                  placeholder="Ej: boleta falsa, estafa, armas..."
                  value={formPalabra}
                  onChange={(e) => setFormPalabra(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Categoría de Restricción
                  </label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 cursor-pointer"
                  >
                    {CATEGORIAS_DISPONIBLES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Nivel de Severidad
                  </label>
                  <select
                    value={formSeveridad}
                    onChange={(e) => setFormSeveridad(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 cursor-pointer"
                  >
                    <option value="Alta">Alta (Bloqueo automático)</option>
                    <option value="Media">Media (Alerta prioritaria)</option>
                    <option value="Baja">Baja (Notificación de auditoría)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Motivo de Restricción o Justificación
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica brevemente por qué este término no debe figurar en publicaciones oficiales..."
                  value={formMotivo}
                  onChange={(e) => setFormMotivo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 text-amber-300 font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  {editingPalabra ? 'Guardar Cambios' : 'Agregar Término'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

