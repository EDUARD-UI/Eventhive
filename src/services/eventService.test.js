import assert from 'node:assert/strict';
import test from 'node:test';

import { httpClient } from './httpClient.js';
import { getEventById, getUpcomingEvents } from './eventService.js';

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
