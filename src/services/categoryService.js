import { httpClient } from './httpClient.js';

const normalizeCategory = (categoria) => ({
  id: categoria.id,
  nombre: categoria.nombre,
  urlFoto: categoria.urlFoto || null,
  totalEventos: categoria.totalEventos ?? 0,
});

/** Todas las categorías con su cantidad de eventos publicados (GET /categorias/con-eventos). */
export async function getCategoriesWithEvents() {
  const data = await httpClient.get('/categorias/con-eventos');
  return (data || []).map(normalizeCategory);
}

/** Listado simple de categorías, sin conteo (GET /categorias/nombres). */
export async function getAllCategories() {
  const data = await httpClient.get('/categorias/nombres');
  return (data || []).map(normalizeCategory);
}

/** Top 4 categorías con más eventos (GET /categorias/destacadas). */
export async function getFeaturedCategories() {
  const data = await httpClient.get('/categorias/destacadas');
  return (data || []).map(normalizeCategory);
}

/** Detalle de una categoría (GET /categorias/{id}). */
export async function getCategoryById(categoriaId) {
  const data = await httpClient.get(`/categorias/${categoriaId}`);
  return data ? normalizeCategory(data) : null;
}
