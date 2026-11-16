export type TimeWindowHours = 6 | 24 | 168;

export interface DemandHeatPoint {
  id: number;
  titulo: string;
  categoriaNombre?: string;
  latitud: number;
  longitud: number;
  entradasCompradas: number;
  totalCompras: number;
  ultimaCompra?: string;
  intensidad: number;
}

export interface DemandHeatmapResponse {
  success: boolean;
  message: string;
  data: DemandHeatPoint[];
}

export interface DemandHeatmapParams {
  categoriaId?: number | string;
  lat?: number;
  lng?: number;
  radioKm?: number | string;
  ventanaHoras?: TimeWindowHours;
}

export type HeatmapPointTuple = [latitude: number, longitude: number, intensity: number];
