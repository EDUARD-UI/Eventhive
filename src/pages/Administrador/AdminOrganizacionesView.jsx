import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Ban,
  Clock,
  Eye,
  History,
  Star,
  Calendar,
  ShieldCheck,
  Award,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import adminService from '../../features/admin/services/adminService.js';
import { organizationService } from '../../services/organizerService.js';

export default function AdminOrganizacionesView({
  organizaciones: initialOrganizaciones = [],
  onVerPerfil,
  onVerHistorial,
  onSuspender,
  onReactivar,
}) {
  const [organizacionesList, setOrganizacionesList] = useState(initialOrganizaciones);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(initialOrganizaciones.length || 0);
  const [loading, setLoading] = useState(false);

  const countAprobadas = useMemo(() => {
    const list = Array.isArray(initialOrganizaciones) && initialOrganizaciones.length > 0
      ? initialOrganizaciones
      : (Array.isArray(organizacionesList) ? organizacionesList : []);
    return list.filter((o) => o?.estado === 'APROBADA' || o?.estado === 'VERIFICADA').length;
  }, [initialOrganizaciones, organizacionesList]);

  const countPendientes = useMemo(() => {
    const list = Array.isArray(initialOrganizaciones) && initialOrganizaciones.length > 0
      ? initialOrganizaciones
      : (Array.isArray(organizacionesList) ? organizacionesList : []);
    return list.filter(
      (o) => o?.estado === 'PENDIENTE' || o?.estado === 'PENDIENTE_REVISION' || o?.estado === 'EN_REVISION'
    ).length;
  }, [initialOrganizaciones, organizacionesList]);

  const countSuspendidas = useMemo(() => {
    const list = Array.isArray(initialOrganizaciones) && initialOrganizaciones.length > 0
      ? initialOrganizaciones
      : (Array.isArray(organizacionesList) ? organizacionesList : []);
    return list.filter((o) => o?.estado === 'SUSPENDIDA' || o?.estado === 'RECHAZADA').length;
  }, [initialOrganizaciones, organizacionesList]);

  // Carga reactiva de organizaciones utilizando los endpoints paginados del backend
  const fetchOrganizaciones = useCallback(async () => {
    try {
      setLoading(true);
      if (searchTerm.trim()) {
        const searchRes = await organizationService.searchOrganizations(searchTerm.trim(), {
          page: currentPage - 1,
          size: pageSize,
        });
        setOrganizacionesList(searchRes.organizations || []);
        setTotalItems(searchRes.total || 0);
      } else {
        const estadoParam = filtroEstado === 'TODOS' ? undefined : filtroEstado;
        const res = await adminService.getOrganizaciones({
          page: currentPage - 1,
          size: pageSize,
          estado: estadoParam,
        });
        if (res.success) {
          setOrganizacionesList(res.data);
          setTotalItems(res.total);
        }
      }
    } catch (err) {
      console.warn('Error al cargar organizaciones paginadas:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filtroEstado, searchTerm]);

  useEffect(() => {
    fetchOrganizaciones();
  }, [fetchOrganizaciones]);

  // Si cambian initialOrganizaciones y no se ha interactuado
  useEffect(() => {
    if (initialOrganizaciones && initialOrganizaciones.length > 0 && !searchTerm && filtroEstado === 'TODOS') {
      setOrganizacionesList(initialOrganizaciones);
      setTotalItems(initialOrganizaciones.length);
    }
  }, [initialOrganizaciones]);

  // Conteo rápido de estados (de los datos disponibles o totales)
  const getDisplayBadge = (org) => {
    const rawEstado = org.estado ? String(org.estado).toUpperCase() : 'PENDIENTE';

    // Regla 2: Si tiene el RUT rechazado, debe mostrarse como suspendida hasta que realice una nueva verificación
    if (rawEstado === 'RECHAZADA') {
      return (
        <Badge variant="danger" size="xs" title="Suspendida por RUT rechazado">
          SUSPENDIDA
        </Badge>
      );
    }

    if (rawEstado === 'APROBADA' || rawEstado === 'VERIFICADA') {
      return (
        <Badge variant="success" size="xs">
          APROBADA
        </Badge>
      );
    }

    if (rawEstado === 'SUSPENDIDA') {
      return (
        <Badge variant="danger" size="xs">
          SUSPENDIDA
        </Badge>
      );
    }

    if (rawEstado === 'PENDIENTE_REVISION' || rawEstado === 'EN_REVISION' || rawEstado === 'PENDIENTE') {
      return (
        <Badge variant="warning" size="xs">
          EN REVISIÓN
        </Badge>
      );
    }

    return (
      <Badge variant="neutral" size="xs">
        {rawEstado}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setFiltroEstado('TODOS');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filtroEstado === 'TODOS'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            filtroEstado === 'TODOS' ? 'text-slate-300' : 'text-slate-500'
          }`}>
            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
            <span>Total Empresas</span>
          </span>
          <span className="text-2xl font-black mt-1.5 block">{totalItems}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFiltroEstado('APROBADA');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filtroEstado === 'APROBADA'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            filtroEstado === 'APROBADA' ? 'text-slate-300' : 'text-slate-500'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Aprobadas</span>
          </span>
          <span className="text-2xl font-black mt-1.5 block">
            {countAprobadas}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFiltroEstado('PENDIENTE');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filtroEstado === 'PENDIENTE'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            filtroEstado === 'PENDIENTE' ? 'text-slate-300' : 'text-slate-500'
          }`}>
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>En Revisión</span>
          </span>
          <span className="text-2xl font-black mt-1.5 block">
            {countPendientes}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFiltroEstado('SUSPENDIDA');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filtroEstado === 'SUSPENDIDA'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            filtroEstado === 'SUSPENDIDA' ? 'text-slate-300' : 'text-slate-500'
          }`}>
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>Suspendidas</span>
          </span>
          <span className="text-2xl font-black mt-1.5 block">
            {countSuspendidas}
          </span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por Razón Social o Representante..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="APROBADA">Solo Aprobadas</option>
            <option value="PENDIENTE">En Revisión / Pendientes</option>
            <option value="SUSPENDIDA">Suspendidas</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Razón Social</th>
                <th className="py-3.5 px-4">Representante Legal</th>
                <th className="py-3.5 px-4">Fecha de Creación</th>
                <th className="py-3.5 px-4 text-center">Nivel</th>
                <th className="py-3.5 px-4 text-center">Eventos</th>
                <th className="py-3.5 px-4 text-center">Valoración</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Cargando organizaciones desde el servidor...
                  </td>
                </tr>
              ) : organizacionesList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron organizaciones con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                organizacionesList.map((org) => {
                  const rawEstado = org.estado ? String(org.estado).toUpperCase() : 'PENDIENTE';
                  const isSuspendida = rawEstado === 'SUSPENDIDA' || rawEstado === 'RECHAZADA';
                  const razonSocialDisplay = org.razonSocial || org.nombre || 'Organización';
                  const fechaDisplay = org.fechaCreacion
                    ? org.fechaCreacion.split('T')[0]
                    : org.fechaRegistro || '—';
                  const rating = org.promedioRating ?? org.ratingPromedio ?? 0;
                  const totalReviews = org.totalValoraciones ?? org.totalReviews ?? 0;
                  const cantEventos = org.eventosActivos ?? org.totalEventosCreados ?? org.cantidadEventos ?? org.eventsCount ?? 0;

                  return (
                    <tr
                      key={org.id}
                      className="hover:bg-white transition-colors"
                    >
                  
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20">
                            {razonSocialDisplay.charAt(0)}
                          </div>
                          <div>
                            <div
                              className="font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer"
                              onClick={() => onVerPerfil(org)}
                            >
                              {razonSocialDisplay}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              NIT: {org.nit || 'En verificación'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Nombre del Representante */}
                      <td className="py-4 px-4 text-slate-700">
                        <div className="font-semibold">{org.representante || org.representanteLegal || '—'}</div>
                        <span className="text-[11px] text-slate-400">{org.email || org.correoContacto || ''}</span>
                      </td>

                      {/* Fecha de Creación */}
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{fechaDisplay}</span>
                        </span>
                      </td>

                      {/* Nivel */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>{org.nivel || 'NIVEL_1'}</span>
                        </span>
                      </td>

                      {/* Cantidad de Eventos Activos */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs" title="Eventos activos de la organización">
                          {cantEventos}
                        </span>
                      </td>

                      {/* Valoración Promedio */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1 text-slate-700 font-bold">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" strokeWidth={1.5} />
                          <span>{Number(rating).toFixed(1)}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({totalReviews})
                          </span>
                        </div>
                      </td>

                      {/* Estado de la Organización */}
                      <td className="py-4 px-4 text-center">
                        {getDisplayBadge(org)}
                      </td>

                      {/* Acciones Reales Soportadas (Requerimiento 7.3) */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onVerPerfil(org)}
                            className="p-2 rounded-xl text-slate-500 hover:text-brand hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Ver Detalle de Organización"
                          >
                            <Eye className="w-4 h-4" strokeWidth={1.75} />
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
