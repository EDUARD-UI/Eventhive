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

test('localhost NEVER connects to Azure backend', () => {
  const originalWindow = globalThis.window;
  try {
    globalThis.window = { location: { hostname: 'localhost' } };
    const url = getApiBaseUrl();
    assert.equal(url.includes('azurewebsites.net'), false);
    assert.equal(url, 'http://localhost:8080/api');
  } finally {
    globalThis.window = originalWindow;
  }
});

