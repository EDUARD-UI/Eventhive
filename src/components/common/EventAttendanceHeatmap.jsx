import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { HeatLayer } from 'leaflet.heat';
import { EVENTHIVE_HEAT_GRADIENT } from '../../utils/heatmapUtils.js';

/**
 * Componente de mapa de calor optimizado y acotado para Eventhive.
 *
 * Características clave:
 * - Halo contenido: no cubre cuadras ajenas ni cuerpos de agua.
 * - Gradiente orgánico con núcleo térmico (Oro/Ámbar/Rojo suave) y bordes translúcidos.
 * - Adaptabilidad al zoom: mantiene la proporción visual al acercar o alejar el mapa.
 */
export default function EventAttendanceHeatmap({
  points = [],
  radius = 24,
  blur = 16,
  maxZoom = 17,
  max = 1.0,
  minOpacity = 0.20,
  gradient = EVENTHIVE_HEAT_GRADIENT,
}) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Calcular radio según el nivel de zoom actual
    const getAdaptiveRadius = () => {
      const zoom = map.getZoom();
      if (zoom <= 12) return 18;
      if (zoom <= 14) return 22;
      if (zoom <= 16) return 25;
      return 28;
    };

    const currentRadius = getAdaptiveRadius();

    if (layerRef.current) {
      if (Array.isArray(points) && points.length > 0) {
        layerRef.current.setLatLngs(points);
        layerRef.current.setOptions({
          radius: currentRadius,
          blur: Math.round(currentRadius * 0.65),
          max: 1.0,
          minOpacity,
          gradient,
        });
        layerRef.current.redraw();
      } else {
        try {
          map.removeLayer(layerRef.current);
          layerRef.current = null;
        } catch {
          // ignore
        }
      }
      return;
    }

    if (!Array.isArray(points) || points.length === 0) return;

    // Crear la capa de calor con parámetros no saturados
    const heatLayer = new HeatLayer(points, {
      radius: currentRadius,
      blur: Math.round(currentRadius * 0.65),
      maxZoom,
      max: 1.0,
      minOpacity,
      gradient,
    });

    heatLayer.addTo(map);
    layerRef.current = heatLayer;

    // Adaptar el radio cuando el usuario hace zoom
    const handleZoom = () => {
      if (layerRef.current) {
        const nextRadius = getAdaptiveRadius();
        layerRef.current.setOptions({
          radius: nextRadius,
          blur: Math.round(nextRadius * 0.65),
        });
        layerRef.current.redraw();
      }
    };

    map.on('zoomend', handleZoom);

    // Asegurar redibujado inicial limpio
    const timer = setTimeout(() => {
      if (heatLayer && heatLayer._map) {
        heatLayer.redraw();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      map.off('zoomend', handleZoom);
      if (layerRef.current && map) {
        try {
          map.removeLayer(layerRef.current);
        } catch (err) {
          console.warn('Error removiendo HeatLayer:', err);
        }
        layerRef.current = null;
      }
    };
  }, [map, points, radius, blur, maxZoom, max, minOpacity, gradient]);

  return null;
}
