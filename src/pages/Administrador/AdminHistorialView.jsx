import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Building2,
  Tag,
  Percent,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';

export default function AdminHistorialView({ auditLogs = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEntidad, setFiltroEntidad] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtrado y búsqueda reactiva
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const tipo = (log.tipo || log.entidadTipo || '').toUpperCase();
      const entidad = log.entidad || log.entidadNombre || '';
      const accion = log.accion || '';
      const motivo = log.motivo || log.detalles || '';
      const autor = log.autor || log.usuarioNombre || '';

      const matchSearch =
        accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        autor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEntidad =
        filtroEntidad === 'TODOS' || tipo === filtroEntidad;

      return matchSearch && matchEntidad;
    });
  }, [auditLogs, searchTerm, filtroEntidad]);

  // Paginación en memoria
  const totalItems = filteredLogs.length;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Badge por tipo de entidad
  const renderTipoBadge = (tipo) => {
    const t = (tipo || '').toUpperCase();
    if (t === 'ORGANIZACION') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Building2 className="w-3 h-3" />
          Organización
        </span>
      );
    }
    if (t === 'EVENTO') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Calendar className="w-3 h-3" />
          Evento
        </span>
      );
    }
    if (t === 'MODERACION') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3 h-3" />
          Moderación
        </span>
      );
    }
    if (t === 'USUARIO') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <User className="w-3 h-3" />
          Usuario
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
        Sistema
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-primary" strokeWidth={1.75} />
          <span>Historial Administrativo y de Moderación</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Trazabilidad inmutable de suspensiones, cambios de roles y decisiones de plataforma (Sección 3)
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por acción, entidad, autor o motivo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={filtroEntidad}
            onChange={(e) => {
              setFiltroEntidad(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="TODOS">Todas las Entidades</option>
            <option value="ORGANIZACION">Organizaciones</option>
            <option value="EVENTO">Eventos</option>
            <option value="MODERACION">Moderación PULEP</option>
            <option value="USUARIO">Usuarios</option>
          </select>
        </div>
      </div>

      {/* Tabla de Auditoría */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Acción Ejecutada</th>
                <th className="py-3.5 px-4">Entidad / Sujeto</th>
                <th className="py-3.5 px-4">Detalles y Justificación</th>
                <th className="py-3.5 px-4">Autor Responsable</th>
                <th className="py-3.5 px-4 text-center">Transición</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron registros de auditoría coincidentes.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const tipo = log.tipo || log.entidadTipo || 'SISTEMA';
                  const entidad = log.entidad || log.entidadNombre || 'Plataforma';
                  const accion = log.accion || 'ACCION_REGISTRADA';
                  const motivo = log.motivo || log.detalles || 'Sin observaciones adicionales.';
                  const autor = log.autor || log.usuarioNombre || 'Administrador';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                        {log.fecha}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 font-mono text-[11px] block">
                          {accion}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {renderTipoBadge(tipo)}
                          <span className="font-semibold text-slate-800 text-xs mt-0.5">
                            {entidad}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                        <p className="line-clamp-2 leading-relaxed">{motivo}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs">{autor}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.ip || '190.25.10.42'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {log.estadoAnterior && log.estadoNuevo ? (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold">
                            <span className="text-slate-400">{log.estadoAnterior}</span>
                            <span className="text-slate-300">→</span>
                            <span className="text-primary font-black">{log.estadoNuevo}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
}
