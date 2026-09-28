import { httpClient } from './httpClient.js';

export const normalizeCategory = (categoria) => {
  if (typeof categoria === 'string') {
    return {
      id: categoria,
      nombre: categoria,
      urlFoto: null,
      totalEventos: 0,
      descripcion: '',
    };
  }

  return {
    id: categoria.id,
    nombre: categoria.nombre || '',
    urlFoto: categoria.urlFoto || categoria.foto || categoria.imagen || categoria.imagenUrl || null,
    totalEventos:
      categoria.totalEventos ??
      categoria.eventosCount ??
      categoria.cantidadEventos ??
      categoria.numeroEventos ??
      (Array.isArray(categoria.eventos) ? categoria.eventos.length : 0),
    descripcion: categoria.descripcion || '',
  };
};

/**
 * Listado de todas las categorías con imagen y conteo de eventos (GET /categorias).
 * Usado para la interfaz de Categorías y tarjetas completas.
 */
export async function getAllCategories() {
  const data = await httpClient.get('/categorias');
  const list = Array.isArray(data) ? data : data?.content || [];
  return list.map(normalizeCategory);
}

/**
 * Listado exclusivo de nombres para menús desplegables / selects (GET /categorias/nombres).
 */
export async function getCategoryNames() {
  const data = await httpClient.get('/categorias/nombres');
  const list = Array.isArray(data) ? data : data?.content || [];
  return list.map((item) => {
    if (typeof item === 'string') {
      return { id: item, nombre: item };
    }
    return { id: item.id || item.nombre, nombre: item.nombre || item };
  });
}

/** Mantener compatibilidad: /categorias/con-eventos delega a getAllCategories. */
export async function getCategoriesWithEvents() {
  return getAllCategories();
}

/** Categorías destacadas (GET /categorias/destacadas o fallback a primeras de /categorias). */
export async function getFeaturedCategories() {
  try {
    const data = await httpClient.get('/categorias/destacadas');
    const list = Array.isArray(data) ? data : data?.content || [];
    if (list.length > 0) return list.map(normalizeCategory);
  } catch {
    // Si no está disponible /categorias/destacadas, tomar las primeras de /categorias
  }
  const all = await getAllCategories();
  return all.slice(0, 6);
}

/** Detalle de una categoría (GET /categorias/{id}). */
export async function getCategoryById(categoriaId) {
  try {
    const data = await httpClient.get(`/categorias/${categoriaId}`);
    return data ? normalizeCategory(data) : null;
  } catch {
    const all = await getAllCategories();
    return all.find((c) => String(c.id) === String(categoriaId)) || null;
  }
}

export default {
  getAllCategories,
  getCategoryNames,
  getCategoriesWithEvents,
  getFeaturedCategories,
  getCategoryById,
};
