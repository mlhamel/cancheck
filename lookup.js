export function digitsOnly(raw) {
  return String(raw ?? '').replace(/\D+/g, '');
}

export function upcCheckDigitValid(upc12) {
  if (!/^\d{12}$/.test(upc12)) return false;
  const first11 = upc12.slice(0, 11);
  const digits = first11.split('').map(Number);
  const weightAt = (index) => (index % 2 === 0 ? 3 : 1);
  const total = digits.reduce((sum, digit, index) => sum + digit * weightAt(index), 0);
  return (10 - (total % 10)) % 10 === Number(upc12[11]);
}

/*
  UPC-A (12 digits) and EAN-13 (13 digits) share one numbering space: an
  EAN-13 encoding of a UPC-A is the UPC-A with a leading 0. upcKey strips one
  leading '0' from 13-digit values so those scans match the CFIA's 12-digit
  UPCs. Any other 13-digit code is not a UPC-A encoding and is left unchanged
  (it will simply find no recall-row match).
*/
export function upcKey(raw) {
  const digits = digitsOnly(raw);
  if (digits.length === 13 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export function findRecalledProduct(rawCode, products) {
  const key = upcKey(rawCode);
  return products.find((product) => product.upc === key) ?? null;
}

/*
  Classifies a scanned or typed code:
  - 'upc'     : 12/13 digits, can be looked up against the recall list
  - 'unknown' : anything else (QR marketing URLs, truncated scans, etc.)
                so we never answer "safe" to a code we could not understand.
*/
export function classifyCode(rawCode) {
  const digits = digitsOnly(rawCode);
  const normalized = upcKey(digits);
  if (digits.length === 12 || digits.length === 13) {
    return { kind: 'upc', value: normalized };
  }
  return { kind: 'unknown', value: digits };
}
