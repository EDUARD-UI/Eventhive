/**
 * Servicio Central de Caché en Memoria y Stale-While-Revalidate para EventHive.
 *
 * Optimiza la experiencia de usuario (UX) evitando pantallas de carga repetitivas,
 * acelerando transiciones de página y reduciendo llamadas redundantes al backend.
 */

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.inFlightRequests = new Map();
  }

  /**
   * Genera una clave normalizada.
   */
  _normalizeKey(key) {
    if (typeof key === 'string') return key;
    try {
      return JSON.stringify(key);
    } catch {
      return String(key);
    }
  }

  /**
   * Obtiene un valor de la caché en memoria si no ha expirado.
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const normKey = this._normalizeKey(key);
    const entry = this.memoryCache.get(normKey);
    if (!entry) return null;

    const isExpired = Date.now() > entry.expiresAt;
    if (isExpired && !entry.staleWhileRevalidate) {
      this.memoryCache.delete(normKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Guarda un valor en la caché con tiempo de vida (TTL).
   * @param {string} key
   * @param {any} data
   * @param {number} ttlMs - Tiempo de vida en ms (por defecto: 90 segundos)
   * @param {boolean} staleWhileRevalidate
   */
  set(key, data, ttlMs = 90000, staleWhileRevalidate = true) {
    const normKey = this._normalizeKey(key);
    this.memoryCache.set(normKey, {
      data,
      expiresAt: Date.now() + ttlMs,
      staleWhileRevalidate,
      savedAt: Date.now(),
    });
  }

  /**
   * Verifica si existe una entrada no expirada.
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Elimina una clave o todas las claves que comiencen con un prefijo.
   */
  invalidate(prefixOrKey) {
    const norm = this._normalizeKey(prefixOrKey);
    for (const key of this.memoryCache.keys()) {
      if (key === norm || key.startsWith(norm)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Limpia toda la caché en memoria.
   */
  clear() {
    this.memoryCache.clear();
    this.inFlightRequests.clear();
  }

  /**
   * Ejecuta una función fetcher aplicando la estrategia de caché Stale-While-Revalidate
   * y deduplicación de peticiones en vuelo (in-flight request coalescing).
   *
   * @param {string} key - Identificador único de los datos.
   * @param {Function} fetcher - Función asíncrona que obtiene los datos frescos.
   * @param {Object} options
   * @param {number} options.ttlMs - Milisegundos de vigencia (default: 60000ms = 1 min).
   * @param {boolean} options.staleWhileRevalidate - Si devuelve caché vieja mientras actualiza en background.
   */
  async fetchWithCache(key, fetcher, { ttlMs = 60000, staleWhileRevalidate = true } = {}) {
    const normKey = this._normalizeKey(key);
    const cachedEntry = this.memoryCache.get(normKey);
    const now = Date.now();

    // 1. Si hay dato fresco, retornar inmediatamente
    if (cachedEntry && now <= cachedEntry.expiresAt) {
      return cachedEntry.data;
    }

    // 2. Si hay dato expirado pero staleWhileRevalidate está activo:
    // Retornamos el dato viejo de inmediato y disparamos la actualización en segundo plano
    if (cachedEntry && staleWhileRevalidate) {
      this._revalidateInBackground(normKey, fetcher, ttlMs);
      return cachedEntry.data;
    }

    // 3. Si ya hay una petición en vuelo idéntica, reutilizar su promesa (evita tormentas de peticiones)
    if (this.inFlightRequests.has(normKey)) {
      return this.inFlightRequests.get(normKey);
    }

    // 4. Obtener datos frescos
    const requestPromise = (async () => {
      try {
        const freshData = await fetcher();
        if (freshData !== undefined && freshData !== null) {
          this.set(normKey, freshData, ttlMs, staleWhileRevalidate);
        }
        return freshData;
      } finally {
        this.inFlightRequests.delete(normKey);
      }
    })();

    this.inFlightRequests.set(normKey, requestPromise);
    return requestPromise;
  }

  /**
   * Actualización silenciosa en segundo plano.
   */
  async _revalidateInBackground(normKey, fetcher, ttlMs) {
    if (this.inFlightRequests.has(normKey)) return;

    const bgPromise = (async () => {
      try {
        const freshData = await fetcher();
        if (freshData !== undefined && freshData !== null) {
          this.set(normKey, freshData, ttlMs, true);
        }
      } catch (err) {
        // En revalidación en background no interrumpimos la UX
        console.debug(`[CacheService] Revalidación fallida para ${normKey}:`, err?.message);
      } finally {
        this.inFlightRequests.delete(normKey);
      }
    })();

    this.inFlightRequests.set(normKey, bgPromise);
  }
}

export const apiCache = new CacheService();
export default apiCache;
