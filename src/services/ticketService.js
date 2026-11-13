import { organizerService } from './organizerService.js';

const getPageContent = (response) =>
  response?.content ||
  response?.data?.content ||
  (Array.isArray(response) ? response : []);

const getTicketEntries = (response) => {
  const entries =
    response?.tiqueteCompras ||
    response?.boletos ||
    response?.tickets ||
    [];

  return Array.isArray(entries)
    ? entries.map((entry) => entry?.tiquete || entry?.boleto || entry)
    : [];
};

const mapTicket = (ticket, compra, index) => {
  const localidad = ticket.localidad || {};
  const evento = localidad.evento || ticket.evento || compra.evento || {};
  const purchaseItems = compra.items || compra.detalles || [];
  const purchaseItem = purchaseItems.find(
    (item) =>
      (evento.id !== undefined && String(item.eventoId) === String(evento.id)) ||
      (localidad.id !== undefined && String(item.localidadId) === String(localidad.id))
  ) || {};

  return {
    ...ticket,
    id: ticket.id ?? `${compra.id}-${index}`,
    compraId: compra.id,
    eventoDetalle: evento,
    evento: evento.titulo || ticket.eventoTitulo || purchaseItem.eventoNombre || null,
    eventoId: evento.id ?? ticket.eventoId ?? purchaseItem.eventoId,
    fecha: evento.fecha || null,
    hora: evento.hora || null,
    lugar: evento.lugar || evento.ubicacion || null,
    zona: localidad.nombre || ticket.localidadNombre || purchaseItem.localidadNombre || null,
    asiento: ticket.asiento || ticket.numeroAsiento || null,
    titular: ticket.titular?.nombre || ticket.titularNombre || null,
    precio:
      ticket.precio ??
      localidad.precio ??
      purchaseItem.precioUnitario ??
      null,
    estado: ticket.estado || compra.estado || null,
    codigoQR: ticket.codigoQR || null,
  };
};

const loadAllPurchases = async () => {
  const purchases = [];
  let page = 0;
  const pageSize = 20;

  try {
    while (true) {
      const response = await organizerService.getMisCompras({ page, size: pageSize });
      const content = getPageContent(response);
      purchases.push(...content);

      const totalPages = Number(response?.totalPages ?? response?.data?.totalPages);
      if (
        response?.last === true ||
        (Number.isFinite(totalPages) && totalPages > 0 && page + 1 >= totalPages) ||
        content.length < pageSize
      ) {
        return purchases;
      }

      page += 1;
    }
  } catch (err) {
    console.warn('No se pudieron consultar compras del backend:', err?.message);
    return purchases;
  }
};

export const ticketService = {
  async getMisComprasConBoletos() {
    try {
      const purchases = await loadAllPurchases();
      const results = await Promise.all(
        purchases.map(async (compra) => {
          const preloadedTickets = getTicketEntries(compra);
          if (preloadedTickets.length > 0) {
            return {
              compra: {
                ...compra,
                boletos: preloadedTickets.map((ticket, index) =>
                  mapTicket(ticket, compra, index)
                ),
              },
              error: null,
            };
          }

          if (compra.id === undefined || compra.id === null) {
            return {
              compra: { ...compra, boletos: [] },
              error: new Error('La compra no tiene un identificador válido para consultar sus boletos.'),
            };
          }

          try {
            const response = await organizerService.getBoletos(compra.id);
            const tickets = getTicketEntries(response);
            return {
              compra: {
                ...compra,
                boletos: tickets.map((ticket, index) => mapTicket(ticket, compra, index)),
              },
              error: null,
            };
          } catch (error) {
            return {
              compra: { ...compra, boletos: [] },
              error,
            };
          }
        })
      );

      return {
        compras: results.map((result) => result.compra),
        errorCount: results.filter((result) => result.error).length,
      };
    } catch (error) {
      console.warn('Error general obteniendo compras con boletos:', error?.message);
      return {
        compras: [],
        errorCount: 1,
      };
    }
  },
};

export default ticketService;
