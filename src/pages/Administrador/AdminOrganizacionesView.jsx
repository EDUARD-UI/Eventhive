import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  Search,
  Eye,
  Calendar,
  Award,
  Star,
} from 'lucide-react';
import Pagination from '../../components/Shared/Pagination.jsx';
import adminService from '../../features/admin/services/adminService.js';
import { organizationService } from '../../services/organizerService.js';

export default function AdminOrganizacionesView({
  organizaciones: initialOrganizaciones = [],
  onVerPerfil,
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
    return list.filter((o) => o?.estado === 'APROBADA').length;
  }, [initialOrganizaciones, organizacionesList]);

  const countPendientes = useMemo(() => {
    const list = Array.isArray(initialOrganizaciones) && initialOrganizaciones.length > 0
      ? initialOrganizaciones
      : (Array.isArray(organizacionesList) ? organizacionesList : []);
    return list.filter(
      (o) => o?.estado === 'PENDIENTE_REVISION'
    ).length;
  }, [initialOrganizaciones, organizacionesList]);

  const countSuspendidas = useMemo(() => {
    const list = Array.isArray(initialOrganizaciones) && initialOrganizaciones.length > 0
      ? initialOrganizaciones
      : (Array.isArray(organizacionesList) ? organizacionesList : []);
    return list.filter((o) => o?.estado === 'SUSPENDIDA').length;
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

  const renderStatus = (org) => {
    const rawEstado = org.estado ? String(org.estado).toUpperCase() : 'PENDIENTE_REVISION';

    if (rawEstado === 'APROBADA') {
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#15803D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
          APROBADA
        </span>
      );
    }

    if (rawEstado === 'SUSPENDIDA') {
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#DC2626]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          SUSPENDIDA
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#D97706]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
        EN REVISIÓN
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F2342] font-display">
            ORGANIZACIONES REGISTRADAS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Directorio oficial de entidades organizadoras y estado de acreditación en plataforma.
          </p>
        </div>
      </div>

      {/* Barra de Resumen en Línea con Separadores Verticales */}
      <div className="bg-white border border-[#E2E8F0] rounded-[2px] p-3 flex flex-wrap items-center divide-x divide-[#E2E8F0] shadow-sm">
        <button
          type="button"
          onClick={() => {
            setFiltroEstado('TODOS');
            setCurrentPage(1);
          }}
          className={`px-4 py-1 text-left cursor-pointer transition-colors ${
            filtroEstado === 'TODOS' ? 'font-bold text-[#0F2342]' : 'text-slate-500 hover:text-[#0F2342]'
          }`}
        >
          <span className="font-mono text-[10px] tracking-wider uppercase block">TOTAL REGISTRADAS</span>
          <span className="font-mono text-sm font-bold">{totalItems}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFiltroEstado('APROBADA');
            setCurrentPage(1);
          }}
          className={`px-4 py-1 text-left cursor-pointer transition-colors ${
            filtroEstado === 'APROBADA' ? 'font-bold text-[#0F2342]' : 'text-slate-500 hover:text-[#0F2342]'
          }`}
        >
          <span className="font-mono text-[10px] tracking-wider uppercase block flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
            APROBADAS
          </span>
          <span className="font-mono text-sm font-bold text-[#15803D]">{countAprobadas}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFiltroEstado('PENDIENTE_REVISION');
            setCurrentPage(1);
          }}
          className={`px-4 py-1 text-left cursor-pointer transition-colors ${
            filtroEstado === 'PENDIENTE_REVISION' ? 'font-bold text-[#0F2342]' : 'text-slate-500 hover:text-[#0F2342]'
          }`}
        >
          <span className="font-mono text-[10px] tracking-wider uppercase block flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
            EN REVISIÓN
          </span>
          <span className="font-mono text-sm font-bold text-[#D97706]">{countPendientes}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFiltroEstado('SUSPENDIDA');
            setCurrentPage(1);
          }}
          className={`px-4 py-1 text-left cursor-pointer transition-colors ${
            filtroEstado === 'SUSPENDIDA' ? 'font-bold text-[#0F2342]' : 'text-slate-500 hover:text-[#0F2342]'
          }`}
        >
          <span className="font-mono text-[10px] tracking-wider uppercase block flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
            SUSPENDIDAS
          </span>
          <span className="font-mono text-sm font-bold text-[#DC2626]">{countSuspendidas}</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-3 rounded-[2px] border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Razón Social o Representante..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-[2px] border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#0F2342] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 rounded-[2px] border border-[#E2E8F0] text-xs font-mono uppercase text-[#0F2342] bg-white focus:outline-none focus:border-[#0F2342]"
          >
            <option value="TODOS">TODOS LOS ESTADOS</option>
            <option value="APROBADA">SOLO APROBADAS</option>
            <option value="PENDIENTE_REVISION">EN REVISIÓN</option>
            <option value="SUSPENDIDA">SUSPENDIDAS</option>
          </select>
        </div>
      </div>

      {/* Tabla con scroll editorial */}
      <div className="bg-white rounded-[2px] border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto editorial-scroll-x">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Razón Social</th>
                <th className="py-3 px-4">Representante Legal</th>
                <th className="py-3 px-4">Fecha Creación</th>
                <th className="py-3 px-4 text-center">Nivel</th>
                <th className="py-3 px-4 text-center">Eventos</th>
                <th className="py-3 px-4 text-center">Valoración</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-mono text-xs">
                    Cargando organizaciones desde el servidor...
                  </td>
                </tr>
              ) : organizacionesList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-mono text-xs">
                    No se encontraron organizaciones con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                organizacionesList.map((org) => {
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
                      className="hover:bg-[#F8F9FA] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[2px] bg-[#0F2342] text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                            {razonSocialDisplay.charAt(0)}
                          </div>
                          <div>
                            <button
                              type="button"
                              className="font-bold text-[#0F2342] hover:text-[#F5B800] transition-colors text-left cursor-pointer"
                              onClick={() => onVerPerfil(org)}
                            >
                              {razonSocialDisplay}
                            </button>
                            <div className="text-[10px] text-slate-400 font-mono">
                              NIT: {org.nit || 'En verificación'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-semibold text-xs">{org.representante || org.representanteLegal || '—'}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{org.email || org.correoContacto || ''}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-[11px] font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{fechaDisplay}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-[10px] font-bold text-[#0F2342]">
                          {org.nivel || 'NIVEL_1'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-xs font-bold text-[#0F2342]">
                          {cantEventos}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 text-[#0F2342] font-mono font-bold text-xs">
                          <Star className="w-3.5 h-3.5 text-[#F5B800] fill-[#F5B800]" />
                          <span>{Number(rating).toFixed(1)}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({totalReviews})
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {renderStatus(org)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onVerPerfil(org)}
                          className="px-2.5 py-1 rounded-[2px] border border-[#0F2342] text-[#0F2342] hover:bg-[#0F2342] hover:text-white transition-colors cursor-pointer text-[11px] font-mono font-bold inline-flex items-center gap-1"
                          title="Ver Detalle de Organización"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>VER</span>
                        </button>
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
