import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Building2,
  Calendar,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import AdminInfoAlert from '../../components/componentsAdmin/AdminInfoAlert.jsx';

export default function AdminHistorialView({ auditLogs: initialLogs = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEntidad, setFiltroEntidad] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Datos base preparados para registrar acciones administrativas (Requisito 8)
  const auditLogs = useMemo(() => {
    if (initialLogs && initialLogs.length > 0) return initialLogs;
    return [
      {
        id: 'log-1',
        fecha: '2026-09-28 14:30',
        accion: 'APROBACIÓN DE RUT',
        usuarioNombre: 'Carlos Administrador',
        usuarioRol: 'ADMINISTRADOR',
        elementoTipo: 'ORGANIZACION',
        elementoNombre: 'Eventica SpA (NIT: 76.123.456-7)',
        resultado: 'EXITOSO',
        detalles: 'Documento RUT verificado satisfactoriamente.',
      },
      {
        id: 'log-2',
        fecha: '2026-09-27 11:15',
        accion: 'REVOCACIÓN DE MODERADOR',
        usuarioNombre: 'Carlos Administrador',
        usuarioRol: 'ADMINISTRADOR',
        elementoTipo: 'USUARIO',
        elementoNombre: 'Sofía Martínez (ID: 22)',
        resultado: 'APLICADO',
        detalles: 'Conclusión de periodo contractual de moderación.',
      },
      {
        id: 'log-3',
        fecha: '2026-09-25 09:40',
        accion: 'SUSPENSIÓN DE ORGANIZACIÓN',
        usuarioNombre: 'Carlos Administrador',
        usuarioRol: 'ADMINISTRADOR',
        elementoTipo: 'ORGANIZACION',
        elementoNombre: 'Caribe Producciones (NIT: 900.222.111)',
        resultado: 'SUSPENDIDA',
        detalles: 'Inconsistencia en documentación tributaria aportada.',
      },
      {
        id: 'log-4',
        fecha: '2026-09-24 16:50',
        accion: 'CREACIÓN DE CATEGORÍA',
        usuarioNombre: 'Carlos Administrador',
        usuarioRol: 'ADMINISTRADOR',
        elementoTipo: 'CATEGORIA',
        elementoNombre: 'Festivales & Gastronomía',
        resultado: 'EXITOSO',
        detalles: 'Carga de fotografía y registro en catálogo central.',
      },
    ];
  }, [initialLogs]);

  // Filtrado reactivo
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const tipo = (log.elementoTipo || log.tipo || log.entidad || '').toUpperCase();
      const accion = (log.accion || '').toLowerCase();
      const elemento = (log.elementoNombre || log.entidadNombre || '').toLowerCase();
      const usuario = (log.usuarioNombre || log.autor || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchSearch =
        !term ||
        accion.includes(term) ||
        elemento.includes(term) ||
        usuario.includes(term);

      const matchEntidad =
        filtroEntidad === 'TODOS' || tipo === filtroEntidad;

      return matchSearch && matchEntidad;
    });
  }, [auditLogs, searchTerm, filtroEntidad]);

  const totalItems = filteredLogs.length;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const renderResultadoBadge = (res) => {
    const r = (res || 'EXITOSO').toUpperCase();
    if (r === 'EXITOSO' || r === 'APROBADO' || r === 'APLICADO') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          <span>{r}</span>
        </span>
      );
    }
    if (r === 'SUSPENDIDA' || r === 'RECHAZADO' || r === 'REVOCADO') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
          <span>{r}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3 h-3" />
        <span>{r}</span>
      </span>
    );
  };

  const renderElementoBadge = (tipo) => {
    const t = (tipo || 'SISTEMA').toUpperCase();
    if (t === 'ORGANIZACION') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Building2 className="w-3 h-3" />
          <span>Organización</span>
        </span>
      );
    }
    if (t === 'USUARIO') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <User className="w-3 h-3" />
          <span>Usuario</span>
        </span>
      );
    }
    if (t === 'CATEGORIA') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Tag className="w-3 h-3" />
          <span>Categoría</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
        <span>Sistema</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta Informativa Inicial (Requisito 10) */}
      <AdminInfoAlert
        id="historial"
        title="Historial de Auditoría y Trazabilidad Administrativa"
        description="Registro inmutable de acciones administrativas: suspensiones, aprobaciones de RUT, asignaciones de roles y decisiones de plataforma. La interfaz está estructurada para auditar con exactitud: quién realizó la acción, cuándo, sobre qué elemento y cuál fue el resultado."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span>Trazabilidad y Auditoría Administrativa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de control interno de decisiones ejecutadas por administradores
          </p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por acción, usuario o elemento..."
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
            <option value="USUARIO">Usuarios y Moderadores</option>
            <option value="CATEGORIA">Categorías</option>
          </select>
        </div>
      </div>

      {/* Tabla Estructurada de Auditoría (Requisito 8) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Fecha / Hora</th>
                <th className="py-3.5 px-4">Acción Realizada</th>
                <th className="py-3.5 px-4">Usuario Responsable</th>
                <th className="py-3.5 px-4">Elemento Afectado</th>
                <th className="py-3.5 px-4 text-center">Resultado</th>
                <th className="py-3.5 px-4">Detalle / Justificación</th>
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
                  const elementoTipo = log.elementoTipo || log.tipo || log.entidad || 'SISTEMA';
                  const elementoNombre = log.elementoNombre || log.entidadNombre || log.entidadId || 'General';
                  const usuarioNombre = log.usuarioNombre || log.autor || 'Administrador General';
                  const usuarioRol = log.usuarioRol || 'ADMINISTRADOR';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Fecha / Hora */}
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.fecha}</span>
                        </span>
                      </td>

                      {/* Acción Realizada */}
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-900 font-mono text-[11px] tracking-wide block">
                          {log.accion}
                        </span>
                      </td>

                      {/* Usuario que realizó la acción */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-100">
                            {usuarioNombre.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block text-xs">
                              {usuarioNombre}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              {usuarioRol}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Elemento Afectado */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-start gap-1">
                          {renderElementoBadge(elementoTipo)}
                          <span className="font-medium text-slate-800 text-xs">
                            {elementoNombre}
                          </span>
                        </div>
                      </td>

                      {/* Resultado de la Acción */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {renderResultadoBadge(log.resultado)}
                      </td>

                      {/* Justificación / Detalle */}
                      <td className="py-4 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2 leading-relaxed text-[11px]">
                          {log.detalles || log.motivo || 'Operación administrativa regular.'}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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
