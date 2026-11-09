import assert from 'node:assert/strict';
import test from 'node:test';

import { httpClient } from './httpClient.js';
import { getAdminBanners, getHomeBanners, normalizeBanner } from './bannerService.js';

test('keeps a missing banner title empty', () => {
  assert.equal(normalizeBanner({ id: 1, posicion: 1 }).titulo, '');
});

test('does not invent a destination or button label when the backend leaves them blank', () => {
  const banner = normalizeBanner({
    id: 1,
    titulo: 'Vive el Classic Night',
    imagenUrl: '/banner.jpg',
    enlaceUrl: '',
  });

  assert.equal(banner.enlaceUrl, '');
  assert.equal(banner.textoBoton, '');
});

test('does not turn a banner image URL into an event destination', () => {
  const banner = normalizeBanner({
    id: 1,
    titulo: 'Festival',
    enlaceUrl: 'https://cdn.example/banner.jpg',
  });

  assert.equal(banner.enlaceUrl, '');
});

test('propagates home banner API errors instead of treating them as empty data', async (t) => {
  const error = Object.assign(new Error('Server error'), { status: 500 });
  t.mock.method(httpClient, 'get', async () => {
    throw error;
  });

  await assert.rejects(getHomeBanners(), (actual) => actual === error);
});

test('only falls back to public banners when the admin endpoint is not found', async (t) => {
  const notFound = Object.assign(new Error('Not found'), { status: 404 });
  const calls = [];
  t.mock.method(httpClient, 'get', async (path) => {
    calls.push(path);
    if (path === '/banners-home/admin') throw notFound;
    return [];
  });

  assert.deepEqual(await getAdminBanners(), [
    {
      id: null,
      posicion: 1,
      titulo: '',
      imagenUrl: '',
      textoBoton: '',
      enlaceUrl: '',
    },
    {
      id: null,
      posicion: 2,
      titulo: '',
      imagenUrl: '',
      textoBoton: '',
      enlaceUrl: '',
    },
  ]);
  assert.deepEqual(calls, ['/banners-home/admin', '/banners-home']);
});

test('does not hide admin API server errors behind the public endpoint', async (t) => {
  const error = Object.assign(new Error('Server error'), { status: 500 });
  const calls = [];
  t.mock.method(httpClient, 'get', async (path) => {
    calls.push(path);
    throw error;
  });

  await assert.rejects(getAdminBanners(), (actual) => actual === error);
  assert.deepEqual(calls, ['/banners-home/admin']);
});
