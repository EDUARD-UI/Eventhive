import assert from 'node:assert/strict';
import test from 'node:test';

import { httpClient } from './httpClient.js';
import { getDemandHeatmap, getEventById, getUpcomingEvents } from './eventService.js';

test('loads every event detail from the backend without local fixture fallbacks', async (t) => {
  const calls = [];
  t.mock.method(httpClient, 'get', async (path) => {
    calls.push(path);
    return { id: 'demo-slug', titulo: 'Evento del backend' };
  });

  assert.equal((await getEventById('demo-slug')).title, 'Evento del backend');
  assert.deepEqual(calls, ['/eventos/demo-slug']);
});

test('does not invent an event location when the backend omits it', async (t) => {
  t.mock.method(httpClient, 'get', async () => ({
    id: 11,
    titulo: 'Evento sin ubicación',
  }));

  assert.equal((await getEventById(11)).location, '');
});

test('propagates upcoming event API failures so the UI can show an error state', async (t) => {
  const error = Object.assign(new Error('Server error'), { status: 500 });
  t.mock.method(httpClient, 'get', async () => {
    throw error;
  });

  await assert.rejects(getUpcomingEvents(), (actual) => actual === error);
});

test('getDemandHeatmap passes correct parameters including category, location, radius and time window', async (t) => {
  let capturedPath = null;
  let capturedParams = null;

  t.mock.method(httpClient, 'get', async (path, params) => {
    capturedPath = path;
    capturedParams = params;
    return [
      {
        id: 25,
        titulo: 'Festival Musical',
        categoriaNombre: 'Música',
        latitud: 10.3910,
        longitud: -75.4794,
        entradasCompradas: 180,
        totalCompras: 65,
        ultimaCompra: '2026-11-15T14:30:00',
        intensidad: 1.0,
      },
    ];
  });

  const res = await getDemandHeatmap({
    categoriaId: 5,
    lat: 10.42,
    lng: -75.55,
    radioKm: 10,
    ventanaHoras: 24,
  });

  assert.equal(capturedPath, '/eventos/mapa/calor');
  assert.deepEqual(capturedParams, {
    categoriaId: 5,
    lat: 10.42,
    lng: -75.55,
    radioKm: 10,
    ventanaHoras: 24,
  });
  assert.equal(res.length, 1);
  assert.equal(res[0].id, 25);
  assert.equal(res[0].entradasCompradas, 180);
  assert.equal(res[0].intensidad, 1.0);
});

test('getDemandHeatmap defaults to 24 hours and ignores "all" filters', async (t) => {
  let capturedParams = null;

  t.mock.method(httpClient, 'get', async (path, params) => {
    capturedParams = params;
    return [];
  });

  const res = await getDemandHeatmap({
    categoriaId: 'all',
    radioKm: 'all',
  });

  assert.deepEqual(capturedParams, { ventanaHoras: 24 });
  assert.deepEqual(res, []);
});

test('getDemandHeatmap gracefully returns empty array on failure without inventing mock points', async (t) => {
  t.mock.method(httpClient, 'get', async () => {
    throw new Error('Connection refused');
  });

  const res = await getDemandHeatmap({ ventanaHoras: 6 });
  assert.deepEqual(res, []);
});
