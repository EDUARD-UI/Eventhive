import React, { useEffect, useMemo, useState } from 'react';
import {
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
} from 'react-icons/fi';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import { organizerService } from '../../services/organizerService.js';
import { formatPrice } from '../../utils/formatters.js';

export default function EntradasView() {
  const [loading, setLoading] = useState(true);

  // Estadísticas oficiales del endpoint (GET /api/organizaciones/mi-organizacion/estadisticas)
  const [estadisticas, setEstadisticas] = useState({
    totalBoletasVendidas: 0,
    ingresosNetos: 0,
    eventos: [],
  });

  // Cargar estadísticas oficiales del endpoint
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    organizerService
      .getEstadisticasMiOrganizacion()
      .then((data) => {
        if (!isMounted || !data) return;
        const lista = data.eventos?.content || (Array.isArray(data.eventos) ? data.eventos : data.estadisticasEventos || data.listaEventos || []);
        setEstadisticas({
          totalBoletasVendidas:
            data.totalBoletasVendidasPorEventosPublicados ?? data.totalBoletas ?? data.totalBoletasVendidas ?? 0,
          ingresosNetos: data.ingresosNetos ?? data.totalIngresos ?? 0,
          eventos: Array.isArray(lista) ? lista : [],
        });
      })
      .catch((err) => {
        console.warn('No se pudo cargar estadísticas de entradas:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Eventos para el resumen de ventas
  const eventosGanancias = useMemo(() => {
    if (estadisticas.eventos.length > 0) {
      return estadisticas.eventos.map((ev, idx) => ({
        key: `ev-stat-${idx}`,
        titulo: ev.titulo || ev.nombre || ev.nombreEvento || 'Evento',
        boletasVendidas: ev.boletasVendidas ?? ev.totalBoletasVendidas ?? 0,
        ingresosGenerados: ev.ingresosNetos ?? ev.ingresosGenerados ?? ev.totalIngresos ?? ev.ingresos ?? 0,
        estado: ev.estado || 'PUBLICADO',
      }));
    }
    return [];
  }, [estadisticas.eventos]);

  const toneMap = {
    PUBLICADO: 'active',
    FINALIZADO: 'neutral',
    BORRADOR: 'warning',
    CANCELADO: 'danger',
    SUSPENDIDO: 'danger',
    PENDIENTE_REVISION: 'warning',
    EN_CORRECCION: 'warning',
    RECHAZADO: 'danger',
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Gestión de Entradas y Ganancias
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-xl">
          Visualiza las ventas de boletos por evento y los ingresos de tu organización descontando las comisiones de EventHive.
        </p>
      </div>

      {/* 2. KPIs de Entradas y Ganancias Oficiales (Requerimiento 2.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Total de boletas vendidas por eventos publicados"
          value={estadisticas.totalBoletasVendidas.toLocaleString('es-CO')}
          change="Boletas en eventos publicados"
          trend="up"
          icon={FiCreditCard}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          label="Ingresos totales de la organización"
          value={formatPrice(estadisticas.ingresosNetos)}
          change="Descontando comisiones de EventHive"
          trend="up"
          icon={FiDollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* 3. Tabla de Ganancias e Ingresos por Evento */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-black text-slate-900">
              Ganancias y Boletas por Evento
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Resumen consolidado de ventas y recaudos de tu organización.
            </p>
          </div>
          <Badge variant="primary" size="md">
            Ingresos de la Organización
          </Badge>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-50 rounded-2xl">
            Cargando estadísticas de entradas...
          </div>
        ) : eventosGanancias.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl">
            No hay registros de ventas para tus eventos publicados aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Nombre del Evento</th>
                  <th className="py-3 px-4 text-center">Boletas Vendidas</th>
                  <th className="py-3 px-4 text-right">Ingresos Organización</th>
                  <th className="py-3 px-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {eventosGanancias.map((ev) => (
                  <tr key={ev.key} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {ev.titulo}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                        {ev.boletasVendidas.toLocaleString('es-CO')} boletas
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                      {formatPrice(ev.ingresosGenerados)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge tone={toneMap[ev.estado] || 'neutral'}>
                        {ev.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
