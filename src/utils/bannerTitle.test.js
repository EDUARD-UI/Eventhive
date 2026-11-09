import assert from 'node:assert/strict';
import test from 'node:test';
import { getOptionalBannerTitle } from './bannerTitle.js';

test('omits missing and whitespace-only banner titles', () => {
  assert.equal(getOptionalBannerTitle(''), '');
  assert.equal(getOptionalBannerTitle('   '), '');
  assert.equal(getOptionalBannerTitle(null), '');
});

test('trims a provided banner title', () => {
  assert.equal(getOptionalBannerTitle('  Festival  '), 'Festival');
});
