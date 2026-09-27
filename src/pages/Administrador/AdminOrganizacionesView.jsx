import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Clock,
  Eye,
  History,
  ShieldAlert,
  Star,
  Calendar,
  FileText,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';

export default function AdminOrganizacionesView({
  organizaciones = [],
  onVerPerfil,
  onVerHistorial,
  onSuspender,
  onReactivar,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [orden, setOrden] = useState('recientes');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filtrado y búsqueda
  const filteredOrgs = useMemo(() => {
    return organizaciones.filter((org) => {
      const matchSearch =
        org.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.representante?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado =
        filtroEstado === 'TODOS' || org.estado === filtroEstado;

      return matchSearch && matchEstado;
    });
  }, [organizaciones, searchTerm, filtroEstado]);

  const paginatedOrgs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrgs.slice(start, start + pageSize);
  }, [filteredOrgs, currentPage, pageSize]);

  const totalAprobadas = organizaciones.filter((o) => o.estado === 'APROBADA').length;
  const totalPendientes = organizaciones.filter((o) => o.estado === 'PENDIENTE').length;
  const totalSuspendidas = organizaciones.filter((o) => o.estado === 'SUSPENDIDA').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner de Delimitación de Responsabilidad (Sección 3 y 5) */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
          <ShieldAlert className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold block text-amber-950 mb-0.5">
            Módulo de Supervisión Administrativa de Organizaciones
          </span>
          El Administrador supervisa y gestiona el cumplimiento de las organizaciones registradas. Las suspensiones administrativas requieren justificación vinculante para trazabilidad. Recuerde que la revisión de admisión y aprobación inicial corresponde al flujo del <strong>Módulo de Moderación</strong>.
        </div>
      </div>

      {/* Contadores Rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFiltroEstado('TODOS')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filtroEstado === 'TODOS'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
            Total Empresas
          </span>
          <span className="text-xl font-black">{organizaciones.length}</span>
        </button>

        <button
          onClick={() => setFiltroEstado('APROBADA')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filtroEstado === 'APROBADA'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
            Aprobadas
          </span>
          <span className="text-xl font-black text-emerald-600 group-hover:text-emerald-700 ${filtroEstado === 'APROBADA' ? 'text-white' : ''}">
            {totalAprobadas}
          </span>
        </button>

        <button
          onClick={() => setFiltroEstado('PENDIENTE')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filtroEstado === 'PENDIENTE'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
            En Revisión
          </span>
          <span className="text-xl font-black text-amber-600 ${filtroEstado === 'PENDIENTE' ? 'text-white' : ''}">
            {totalPendientes}
          </span>
        </button>

        <button
          onClick={() => setFiltroEstado('SUSPENDIDA')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filtroEstado === 'SUSPENDIDA'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
            Suspendidas
          </span>
          <span className="text-xl font-black text-rose-600 ${filtroEstado === 'SUSPENDIDA' ? 'text-white' : ''}">
            {totalSuspendidas}
          </span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por Razón Social, NIT o Representante..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setCurrentPage(1); }}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="APROBADA">Aprobadas</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="SUSPENDIDA">Suspendidas</option>
          </select>
        </div>
      </div>

      {/* Tabla de Organizaciones (Sección 5: Razón Social, NIT, Estado, Rep, Fecha, Cant. Eventos, Rating, Acciones) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Organización / Razón Social</th>
                <th className="py-3.5 px-4">NIT</th>
                <th className="py-3.5 px-4">Representante Legal</th>
                <th className="py-3.5 px-4 text-center">Eventos</th>
                <th className="py-3.5 px-4 text-center">Valoración</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones Administrativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedOrgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron organizaciones con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedOrgs.map((org) => {
                  const isSuspendida = org.estado === 'SUSPENDIDA';
                  const isAprobada = org.estado === 'APROBADA';

                  return (
                    <tr
                      key={org.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Razón Social */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20">
                            {org.nombre?.charAt(0) || 'O'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer" onClick={() => onVerPerfil(org)}>
                              {org.nombre}
                            </div>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" strokeWidth={1.75} />
                              <span>Reg: {org.fechaRegistro}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* NIT */}
                      <td className="py-4 px-4 font-mono text-slate-600 text-[11px] font-medium">
                        {org.nit}
                      </td>

                      {/* Representante */}
                      <td className="py-4 px-4 text-slate-700">
                        <div className="font-medium">{org.representante}</div>
                        <span className="text-[11px] text-slate-400">{org.email}</span>
                      </td>

                      {/* Eventos */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                          {org.cantidadEventos || 0}
                        </span>
                      </td>

                      {/* Valoración Promedio */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1 text-slate-700 font-bold">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" strokeWidth={1.5} />
                          <span>{org.ratingPromedio || 4.5}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({org.totalReviews || 0})
                          </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-4 text-center">
                        <Badge
                          variant={
                            org.estado === 'APROBADA'
                              ? 'success'
                              : org.estado === 'SUSPENDIDA'
                              ? 'danger'
                              : 'warning'
                          }
                          size="xs"
                        >
                          {org.estado}
                        </Badge>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Ver Perfil Administrativo */}
                          <button
                            onClick={() => onVerPerfil(org)}
                            className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Ver Perfil Administrativo"
                          >
                            <Eye className="w-4 h-4" strokeWidth={1.75} />
                          </button>

                          {/* Ver Historial */}
                          <button
                            onClick={() => onVerHistorial(org)}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Consultar Historial y Trazabilidad"
                          >
                            <History className="w-4 h-4" strokeWidth={1.75} />
                          </button>

                          {/* Suspender o Reactivar */}
                          {isSuspendida ? (
                            <button
                              onClick={() => onReactivar(org)}
                              className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Reactivar Organización"
                            >
                              <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                          ) : (
                            <button
                              onClick={() => onSuspender(org)}
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Suspender Organización Administrativamente"
                            >
                              <Ban className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                          )}
                        </div>
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
          totalItems={filteredOrgs.length}
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
