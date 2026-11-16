# Guía de Integración Frontend - Disponibilidad de Boletos y Localidades

Este documento describe la estructura y comportamiento de los campos de disponibilidad de eventos y localidades implementados en el backend de Eventhive, resolviendo cualquier discrepancia con respecto a estados de "Agotado / Sold Out".

---

## 1. Problema Resuelto

Anteriormente, al solicitar listados de eventos (`GET /api/eventos`, `GET /api/eventos/proximos`, `GET /api/eventos/buscar`, `GET /api/eventos/organizacion/{id}`), el campo primitivo `tieneBoletasDisponibles` no se inicializaba explícitamente en la conversión DTO de listados, enviándose en `false` por omisión técnica. Esto provocaba que `ticketAvailabilityUtils.js` (`isEventSoldOut`) marcara todos los eventos como agotados aun cuando tenían cupos disponibles en base de datos.

### Mejoras Aplicadas
1. **Paginación y Listados en Batch**: El backend ahora consulta eficientemente mediante una sola consulta SQL (`SELECT DISTINCT l.evento.id FROM Localidad l WHERE l.evento.id IN :ids AND l.disponibles > 0`) la disponibilidad real de todos los eventos del lote, poblando fielmente `tieneBoletasDisponibles`.
2. **Nuevos Campos Complementarios en `EventoDTO`**:
   - `tieneBoletasDisponibles`: `true` si al menos una localidad tiene boletos disponibles (`disponibles > 0`).
   - `disponible`: Booleano idéntico a `tieneBoletasDisponibles`.
   - `agotado`: Booleano inverso (`!tieneBoletasDisponibles`).
   - `boletasDisponibles`: Total numérico de boletas disponibles sumando todas las localidades (en el detalle del evento).
3. **Nuevos Campos Complementarios en `LocalidadDTO`**:
   - `disponibles`: Entero con la cantidad de boletas restantes.
   - `disponible`: `true` si `disponibles > 0`, `false` si 0.
   - `agotado`: `true` si `disponibles <= 0`, `false` si hay boletos.
   - `tieneBoletasDisponibles`: `true` si `disponibles > 0`.
4. **Auto-Aseguramiento de Localidad General**: Al publicarse un evento (`EstadoEvento.PUBLICADO`), si no tenía localidades configuradas, el sistema asegura automáticamente una localidad "General" con disponibilidad para evitar que eventos queden en sold out accidentalmente.

---

## 2. Modelos TypeScript / JavaScript

### `EventoDTO` (Resumen en Listados y Detalle)
```typescript
interface EventoDTO {
  id: number;
  titulo: string;
  descripcion: string;
  lugar: string;
  foto?: string;
  fecha: string; // "YYYY-MM-DD"
  hora: string;  // "HH:mm:ss"
  estado: "BORRADOR" | "EN_REVISION" | "EN_CORRECCION" | "PUBLICADO" | "FINALIZADO" | "CANCELADO" | "SUSPENDIDO";
  promocionado?: boolean;
  latitud?: number;
  longitud?: number;
  categoria?: {
    id: number;
    nombre: string;
  };
  organizacion?: {
    id: number;
    razonSocial: string;
    urlLogo?: string;
  };
  // Campos de disponibilidad:
  tieneBoletasDisponibles: boolean; // TRUE si hay boletas a la venta
  disponible: boolean;              // TRUE si hay boletas a la venta
  agotado: boolean;                 // TRUE si el evento está completamente agotado
  boletasDisponibles?: number;      // Total de boletas disponibles (en detalle)
  localidades?: LocalidadDTO[];     // Presente en GET /api/eventos/{id}
}
```

### `LocalidadDTO` (Detalle del Evento y Selector de Boletos)
```typescript
interface LocalidadDTO {
  id: number;
  nombre: string;
  precio: number;
  capacidad: number;
  disponibles: number;              // Cantidad exacta restante (ej: 45)
  disponible: boolean;              // TRUE si disponibles > 0
  agotado: boolean;                 // TRUE si disponibles === 0
  tieneBoletasDisponibles: boolean; // TRUE si disponibles > 0
}
```

---

## 3. Lógica Recomendada para el Frontend

### A. Determinar si un Evento está Agotado (`isEventSoldOut`)
```javascript
export function isEventSoldOut(event) {
  if (!event) return false;

  // 1. Si el backend indica directamente disponibilidad
  if (typeof event.tieneBoletasDisponibles === 'boolean') {
    return !event.tieneBoletasDisponibles;
  }
  if (typeof event.disponible === 'boolean') {
    return !event.disponible;
  }
  if (typeof event.agotado === 'boolean') {
    return event.agotado;
  }

  // 2. Si vienen las localidades cargadas (p. ej. en la vista de detalle)
  if (Array.isArray(event.localidades) && event.localidades.length > 0) {
    return !event.localidades.some((loc) => (loc.disponibles ?? 0) > 0);
  }

  return false;
}
```

### B. Determinar si una Localidad está Agotada o con Escasez
```javascript
export function getLocalidadStatus(loc) {
  const disponibles = loc.disponibles ?? 0;
  const isSoldOut = loc.agotado ?? (disponibles <= 0);
  const isScarcity = disponibles > 0 && disponibles < 25;

  return {
    disponibles,
    isSoldOut,
    isScarcity,
    badgeText: isSoldOut
      ? 'Agotado'
      : isScarcity
        ? `¡Últimas entradas! (${disponibles} restantes)`
        : `${disponibles} disponibles`
  };
}
```

### C. Deshabilitar Botón de Compra
En la página de detalle (`EventDetailPage.jsx`):
```javascript
const isEventAgotado = isEventSoldOut(event);
const isLocAgotada = selectedLocalidad?.agotado || (selectedLocalidad?.disponibles <= 0);

// Deshabilitar botón de compra si el evento entero o la localidad seleccionada está agotada
const isPurchaseDisabled = isEventAgotado || isLocAgotada || !selectedLocalidad;
```

---

## 4. Endpoints Clave

| Endpoint | Método | Disponibilidad Incluida | Descripción |
|---|---|---|---|
| `/api/eventos` | `GET` | `tieneBoletasDisponibles`, `disponible`, `agotado` | Listado paginado de eventos públicos. |
| `/api/eventos/proximos` | `GET` | `tieneBoletasDisponibles`, `disponible`, `agotado` | Próximos eventos ordenados por fecha. |
| `/api/eventos/buscar?nombre=...` | `GET` | `tieneBoletasDisponibles`, `disponible`, `agotado` | Búsqueda por coincidencia en título o descripción. |
| `/api/eventos/organizacion/{id}` | `GET` | `tieneBoletasDisponibles`, `disponible`, `agotado` | Eventos públicos de una organización. |
| `/api/eventos/{id}` | `GET` | Detalle completo + `localidades[]` con `disponibles`, `disponible`, `agotado` | Información completa del evento para la compra. |
| `/api/eventos/{eventoId}/localidades` | `GET` | Lista de `LocalidadDTO` con `disponible` y `agotado` | Consulta independiente de localidades para un evento. |
