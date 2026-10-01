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
import AdminInfoAlert from '../../components/componentsAdmin/AdminInfoAlert.jsx';
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
      {/* Alerta Informativa Inicial (Requisito 10) */}
      <AdminInfoAlert
        id="organizaciones"
        title="Directorio y Supervisión de Organizaciones"
        description="Consulte el listado oficial de organizaciones con paginación desde el backend. Las suspensiones administrativas requieren justificación vinculante para auditoría. Utilice los filtros para consultar exclusivamente organizaciones aprobadas o en revisión."
      />

      {/* Contadores Rápidos y Filtros de Estado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setFiltroEstado('TODOS');
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filtroEstado === 'TODOS'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
            Total Empresas
          </span>
          <span className="text-xl font-black">{totalItems}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFiltroEstado('APROBADA');
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filtroEstado === 'APROBADA'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
            Solo Aprobadas
          </span>
          <span className={`text-xl font-black ${filtroEstado === 'APROBADA' ? 'text-white' : 'text-emerald-600'}`}>
            Filtro Activo
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFiltroEstado('PENDIENTE');
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filtroEstado === 'PENDIENTE'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
            En Revisión
          </span>
          <span className={`text-xl font-black ${filtroEstado === 'PENDIENTE' ? 'text-white' : 'text-amber-600'}`}>
            Por Validar
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFiltroEstado('SUSPENDIDA');
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filtroEstado === 'SUSPENDIDA'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
            Suspendidas
          </span>
          <span className={`text-xl font-black ${filtroEstado === 'SUSPENDIDA' ? 'text-white' : 'text-rose-600'}`}>
            Inactivas
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

      {/* Tabla de Organizaciones Paginada */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
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
                  const cantEventos = org.totalEventosCreados ?? org.cantidadEventos ?? 0;

                  return (
                    <tr
                      key={org.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Razón Social */}
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
                        <div className="font-semibold">{org.representante || '—'}</div>
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

                      {/* Cantidad de Eventos */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
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

                      {/* Estado de la Organización (Visualización clara según Requisito 2) */}
                      <td className="py-4 px-4 text-center">
                        {getDisplayBadge(org)}
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onVerPerfil(org)}
                            className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Ver Perfil Administrativo"
                          >
                            <Eye className="w-4 h-4" strokeWidth={1.75} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onVerHistorial(org)}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Consultar Historial"
                          >
                            <History className="w-4 h-4" strokeWidth={1.75} />
                          </button>

                          {isSuspendida ? (
                            <button
                              type="button"
                              onClick={() => onReactivar(org)}
                              className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Reactivar Organización"
                            >
                              <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                          ) : (
                            <button
                              type="button"
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
