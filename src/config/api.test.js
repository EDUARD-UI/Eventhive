import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AZURE_API_URL,
  LOCAL_API_URL,
  formatApiUrl,
  isLocalEnvironment,
  getApiBaseUrl,
} from './api.js';

test('formatApiUrl normalizes trailing slashes and ensures /api', () => {
  assert.equal(formatApiUrl('http://localhost:8080'), 'http://localhost:8080/api');
  assert.equal(formatApiUrl('http://localhost:8080/'), 'http://localhost:8080/api');
  assert.equal(formatApiUrl('http://localhost:8080/api'), 'http://localhost:8080/api');
  assert.equal(formatApiUrl('http://localhost:8080/api/'), 'http://localhost:8080/api');
  assert.equal(
    formatApiUrl('https://eventhive-bggyerbvhwa6akbq.brazilsouth-01.azurewebsites.net'),
    'https://eventhive-bggyerbvhwa6akbq.brazilsouth-01.azurewebsites.net/api'
  );
  assert.equal(
    formatApiUrl('https://eventhive-bggyerbvhwa6akbq.brazilsouth-01.azurewebsites.net/api'),
    'https://eventhive-bggyerbvhwa6akbq.brazilsouth-01.azurewebsites.net/api'
  );
});

test('identifies localhost and 127.0.0.1 as local environment', () => {
  const originalWindow = globalThis.window;
  try {
    globalThis.window = { location: { hostname: 'localhost' } };
    assert.equal(isLocalEnvironment(), true);
    assert.equal(getApiBaseUrl(), LOCAL_API_URL);

    globalThis.window = { location: { hostname: '127.0.0.1' } };
    assert.equal(isLocalEnvironment(), true);
    assert.equal(getApiBaseUrl(), LOCAL_API_URL);
  } finally {
    globalThis.window = originalWindow;
  }
});

test('identifies production hostnames (Vercel) and enforces Azure URL', () => {
  const originalWindow = globalThis.window;
  try {
    globalThis.window = { location: { hostname: 'eventhive.vercel.app' } };
    assert.equal(isLocalEnvironment(), false);
    assert.equal(getApiBaseUrl(), AZURE_API_URL);

    globalThis.window = { location: { hostname: 'eventhive.com' } };
    assert.equal(isLocalEnvironment(), false);
    assert.equal(getApiBaseUrl(), AZURE_API_URL);
  } finally {
    globalThis.window = originalWindow;
  }
});

test('production NEVER connects to localhost even if custom env points to localhost', () => {
  const originalWindow = globalThis.window;
  try {
    globalThis.window = { location: { hostname: 'eventhive.vercel.app' } };
    assert.equal(getApiBaseUrl(), AZURE_API_URL);
  } finally {
    globalThis.window = originalWindow;
  }
});

test('localhost uses local backend by default when no environment override is set', () => {
  const originalWindow = globalThis.window;
  const originalMode = process.env.VITE_API_MODE;
  const originalUrl = process.env.VITE_API_URL;
  delete process.env.VITE_API_MODE;
  delete process.env.VITE_API_URL;
  try {
    globalThis.window = { location: { hostname: 'localhost' } };
    const url = getApiBaseUrl();
    assert.equal(url.includes('azurewebsites.net'), false);
    assert.equal(url, 'http://localhost:8080/api');
  } finally {
    globalThis.window = originalWindow;
    if (originalMode !== undefined) process.env.VITE_API_MODE = originalMode;
    if (originalUrl !== undefined) process.env.VITE_API_URL = originalUrl;
  }
});

test('localhost connects to Azure backend when VITE_API_MODE=azure or VITE_API_URL points to Azure', () => {
  const originalWindow = globalThis.window;
  const originalMode = process.env.VITE_API_MODE;
  const originalUrl = process.env.VITE_API_URL;
  try {
    globalThis.window = { location: { hostname: 'localhost' } };

    process.env.VITE_API_MODE = 'azure';
    assert.equal(getApiBaseUrl(), AZURE_API_URL);

    delete process.env.VITE_API_MODE;
    process.env.VITE_API_URL = AZURE_API_URL;
    assert.equal(getApiBaseUrl(), AZURE_API_URL);
  } finally {
    globalThis.window = originalWindow;
    if (originalMode !== undefined) process.env.VITE_API_MODE = originalMode;
    else delete process.env.VITE_API_MODE;
    if (originalUrl !== undefined) process.env.VITE_API_URL = originalUrl;
    else delete process.env.VITE_API_URL;
  }
});

test('localhost connects to local backend when VITE_API_MODE=local even if VITE_API_URL is defined', () => {
  const originalWindow = globalThis.window;
  const originalMode = process.env.VITE_API_MODE;
  const originalUrl = process.env.VITE_API_URL;
  try {
    globalThis.window = { location: { hostname: 'localhost' } };
    process.env.VITE_API_MODE = 'local';
    process.env.VITE_API_URL = AZURE_API_URL;
    assert.equal(getApiBaseUrl(), LOCAL_API_URL);
  } finally {
    globalThis.window = originalWindow;
    if (originalMode !== undefined) process.env.VITE_API_MODE = originalMode;
    else delete process.env.VITE_API_MODE;
    if (originalUrl !== undefined) process.env.VITE_API_URL = originalUrl;
    else delete process.env.VITE_API_URL;
  }
});

