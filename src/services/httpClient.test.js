import assert from 'node:assert/strict';
import test from 'node:test';

import { buildUrl, httpClient } from './httpClient.js';
import { LOCAL_API_URL, AZURE_API_URL } from '../config/api.js';

test('buildUrl resolves path correctly with local and production base', () => {
  const originalWindow = globalThis.window;
  try {
    globalThis.window = {
      location: {
        hostname: 'localhost',
        origin: 'http://localhost:5173',
      },
    };
    const localUrl = buildUrl('/eventos', { categoriaId: 5, activo: true });
    assert.equal(localUrl.origin, 'http://localhost:8080');
    assert.equal(localUrl.pathname, '/api/eventos');
    assert.equal(localUrl.searchParams.get('categoriaId'), '5');
    assert.equal(localUrl.searchParams.get('activo'), 'true');

    globalThis.window = {
      location: {
        hostname: 'eventhive.vercel.app',
        origin: 'https://eventhive.vercel.app',
      },
    };
    const prodUrl = buildUrl('/auth/login');
    assert.equal(prodUrl.origin, 'https://eventhive-bggyerbvhwa6akbq.brazilsouth-01.azurewebsites.net');
    assert.equal(prodUrl.pathname, '/api/auth/login');
  } finally {
    globalThis.window = originalWindow;
  }
});

test('buildUrl rejects invalid path with object injection', () => {
  assert.throws(
    () => buildUrl({ id: 123 }),
    /identificadores válidos/
  );
});

test('authenticated role routes send the stored token while login remains public', async () => {
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = globalThis.localStorage;
  const originalWindow = globalThis.window;
  const token = `header.${Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
  ).toString('base64url')}.signature`;
  const storedValues = new Map([['eventhive_token', token]]);
  const requests = [];

  globalThis.localStorage = {
    getItem: (key) => storedValues.get(key) ?? null,
    setItem: (key, value) => storedValues.set(key, value),
    removeItem: (key) => storedValues.delete(key),
  };
  globalThis.window = {
    location: { hostname: 'localhost', origin: 'http://localhost:5173' },
  };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ data: { ok: true } }) };
  };

  try {
    await httpClient.get('/eventos/organizador');
    await httpClient.get('/organizaciones/mi-organizacion');
    await httpClient.get('/auth/me');
    await httpClient.post('/auth/login', {});

    assert.equal(requests[0].options.headers.Authorization, `Bearer ${token}`);
    assert.equal(requests[1].options.headers.Authorization, `Bearer ${token}`);
    assert.equal(requests[2].options.headers.Authorization, `Bearer ${token}`);
    assert.equal(requests[3].options.headers.Authorization, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = originalLocalStorage;
    }
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  }
});
