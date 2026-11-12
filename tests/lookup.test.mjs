import test from 'node:test';
import assert from 'node:assert/strict';

import { RECALLED_PRODUCTS, RECALL_META } from '../data.js';
import { digitsOnly, upcCheckDigitValid, upcKey, findRecalledProduct, classifyCode } from '../lookup.js';

test('dataset matches the CFIA table (29 product formats)', () => {
  assert.equal(RECALLED_PRODUCTS.length, 29);
});

test('every recall row is well-formed', () => {
  for (const row of RECALLED_PRODUCTS) {
    assert.match(row.upc, /^\d{12}$/, row.brand);
    assert.ok(row.brand.length > 0);
    assert.ok(row.product.length > 0);
    assert.match(row.size, /\d+\s*mL/);
    assert.ok(Array.isArray(row.codes) && row.codes.length > 0);
    for (const code of row.codes) {
      assert.match(code, /^[A-Z]\d{3,4}$/, `${row.brand}: code ${code}`);
    }
  }
});

test('every UPC passes the UPC-A check digit (guards against transcription typos)', () => {
  const invalid = RECALLED_PRODUCTS.filter((row) => !upcCheckDigitValid(row.upc));
  assert.deepEqual(invalid.map((row) => row.upc), []);
});

test('UPCs are unique', () => {
  assert.equal(new Set(RECALLED_PRODUCTS.map((row) => row.upc)).size, RECALLED_PRODUCTS.length);
});

test('metadata carries official source URLs and dates', () => {
  assert.match(RECALL_META.sourceUrl.en, /^https:\/\/recalls-rappels\.canada\.ca\/en\//);
  assert.match(RECALL_META.sourceUrl.fr, /^https:\/\/recalls-rappels\.canada\.ca\/fr\//);
  assert.match(RECALL_META.lastUpdated, /^\d{4}-\d{2}-\d{2}$/);
});

test('digitsOnly strips non-digit characters', () => {
  assert.equal(digitsOnly('056 327 073 937'), '056327073937');
  assert.equal(digitsOnly('056327073937'), '056327073937');
  assert.equal(digitsOnly('https://fb.me/abc123'), '123');
  assert.equal(digitsOnly(undefined), '');
});

test('upcKey maps EAN-13 back to UPC-A', () => {
  assert.equal(upcKey('0056327073258'), '056327073258');
  assert.equal(upcKey('056327073258'), '056327073258');
  assert.equal(upcKey('005 6327 073258'), '056327073258');
});

test('classifyCode: upc vs unknown', () => {
  assert.deepEqual(classifyCode('056327073937'), { kind: 'upc', value: '056327073937' });
  assert.deepEqual(classifyCode('056 327 07 3937'), { kind: 'upc', value: '056327073937' });
  assert.deepEqual(classifyCode('0056327073937'), { kind: 'upc', value: '056327073937' });
  assert.equal(classifyCode('https://facebook.com/molson').kind, 'unknown');
  assert.equal(classifyCode('12345678').kind, 'unknown');
});

test('findRecalledProduct matches known UPCs and returns null otherwise', () => {
  const molsonSingle = findRecalledProduct('056327073937', RECALLED_PRODUCTS);
  assert.equal(molsonSingle.brand, 'Molson Canadian');
  assert.equal(molsonSingle.size, '473 mL');
  assert.deepEqual(molsonSingle.codes, ['K016']);

  const coorsTwelve = findRecalledProduct('0056327183254', RECALLED_PRODUCTS);
  assert.equal(coorsTwelve.brand, 'Coors Light');
  assert.deepEqual(coorsTwelve.codes, ['J246', 'J256', 'K026', 'K146']);

  assert.equal(findRecalledProduct('062000000000', RECALLED_PRODUCTS), null);
  assert.equal(findRecalledProduct('1234567890123', RECALLED_PRODUCTS), null);
});

test('upcCheckDigitValid rejects malformed input', () => {
  assert.equal(upcCheckDigitValid('056327073936'), false);
  assert.equal(upcCheckDigitValid('1234'), false);
  assert.equal(upcCheckDigitValid(''), false);
});
