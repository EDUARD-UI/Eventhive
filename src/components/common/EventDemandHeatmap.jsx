import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { HeatLayer } from 'leaflet.heat';
import { EVENTHIVE_HEAT_GRADIENT } from '../../utils/heatmapUtils.js';

/**
 * Componente de mapa de calor por demanda de compras para Leaflet (EventHive).
 * Representa visualmente la afluencia comercial de entradas compradas recientemente.
 *
 * @param {Array<[number, number, number]>} points - Array de puntos [lat, lng, intensidad]
 * @param {object} gradient - Gradiente visual térmico (Azul -> Ámbar -> Naranja -> Rojo)
 */
export default function EventDemandHeatmap({
  points = [],
  radius = 32,
  blur = 18,
  maxZoom = 17,
  max = 0.85,
  minOpacity = 0.38,
  gradient = EVENTHIVE_HEAT_GRADIENT,
}) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Calcular radio adaptativo equilibrado según el nivel de zoom
    const getAdaptiveRadius = () => {
      const zoom = map.getZoom();
      if (zoom <= 12) return 24;
      if (zoom <= 14) return 34;
      if (zoom <= 16) return 44;
      return 54;
    };

    const currentRadius = getAdaptiveRadius();

    // Si la capa ya existe, actualizar sus puntos y opciones sin recrear la instancia
    if (layerRef.current) {
      if (Array.isArray(points) && points.length > 0) {
        layerRef.current.setLatLngs(points);
        layerRef.current.setOptions({
          radius: currentRadius,
          blur: Math.round(currentRadius * 0.52),
          max: 0.85,
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

    // Crear la capa de calor con HeatLayer con intensidad calibrada
    const heatLayer = new HeatLayer(points, {
      radius: currentRadius,
      blur: Math.round(currentRadius * 0.52),
      maxZoom,
      max: 0.85,
      minOpacity,
      gradient,
    });

    heatLayer.addTo(map);
    layerRef.current = heatLayer;

    // Adaptar dinámicamente el radio cuando el usuario hace zoom
    const handleZoom = () => {
      if (layerRef.current) {
        const nextRadius = getAdaptiveRadius();
        layerRef.current.setOptions({
          radius: nextRadius,
          blur: Math.round(nextRadius * 0.52),
        });
        layerRef.current.redraw();
      }
    };

    map.on('zoomend', handleZoom);

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
          console.warn('Error removiendo HeatLayer de demanda:', err);
        }
        layerRef.current = null;
      }
    };
  }, [map, points, radius, blur, maxZoom, max, minOpacity, gradient]);

  return null;
}
