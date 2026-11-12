import { getStrings, isSupportedLang } from './i18n.js';
import { RECALL_META, RECALLED_PRODUCTS } from './data.js';
import { classifyCode, findRecalledProduct, digitsOnly } from './lookup.js';

const LANG_STORAGE_KEY = 'cancheck-lang';

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode / storage disabled — language just won't persist */
  }
}

const state = {
  lang: detectLanguage(),
  scanner: null,
  stream: null,
  torchOn: false,
  lastScanText: '',
  lastScanAt: 0,
};

const $ = (id) => document.getElementById(id);

function detectLanguage() {
  const stored = storageGet(LANG_STORAGE_KEY);
  if (isSupportedLang(stored)) return stored;
  if (isSupportedLang(navigator.language?.slice(0, 2))) return navigator.language.slice(0, 2);
  return 'en';
}

function interpolate(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

function t(key, values) {
  const template = getStrings(state.lang)[key] ?? getStrings('en')[key] ?? key;
  return interpolate(template, values);
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  document.title = t('docTitle');
  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of document.querySelectorAll('[data-i18n-html]')) {
    el.innerHTML = t(el.dataset.i18nHtml);
  }
  for (const el of document.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':').map((part) => part.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  }
  $('langToggle').textContent = t('langButton');

  const note = $('dataNote');
  const link = document.createElement('a');
  link.href = RECALL_META.sourceUrl[state.lang];
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = RECALL_META.agency[state.lang];
  note.replaceChildren(
    interpolate(t('dataNote'), { date: RECALL_META.lastUpdated, agency: '' }).trimEnd(),
    ' ',
    link,
  );
}

function showView(id) {
  for (const view of document.querySelectorAll('.view')) {
    view.hidden = view.id !== id;
  }
}

function stopScanner() {
  for (const track of state.stream?.getTracks() ?? []) {
    track.stop();
  }
  state.scanner?.reset();
  state.scanner = null;
  $('video').srcObject = null;
  state.stream = null;
  state.torchOn = false;
  $('btnTorch').hidden = true;
}

function beepAndVibrate() {
  navigator.vibrate?.(180);
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    oscillator.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);
    setTimeout(() => context.close(), 300);
  } catch {
    /* audio is a nice-to-have */
  }
}

async function startScan() {
  if (!window.ZXing) {
    showGlobalError(t('engineError'));
    return;
  }
  stopScanner();
  showGlobalError(null);
  showView('view-scan');
  state.lastScanText = '';

  const hints = new Map();
  hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS, [
    window.ZXing.BarcodeFormat.UPC_A,
    window.ZXing.BarcodeFormat.EAN_13,
    window.ZXing.BarcodeFormat.QR_CODE,
  ]);

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
  } catch (error) {
    console.error(error);
    showView('view-home');
    showGlobalError(t('cameraError'));
    return;
  }

  const reader = new window.ZXing.BrowserMultiFormatReader(hints, 250);
  state.scanner = reader;
  state.stream = stream;

  const video = $('video');
  video.srcObject = stream;
  try {
    await video.play();
  } catch (error) {
    console.error(error);
    stopScanner();
    showView('view-home');
    showGlobalError(t('cameraError'));
    return;
  }
  setupTorch();

  reader.decodeFromStream(stream, video, (result, error) => {
    if (state.scanner !== reader) return;
    if (result) handleScanResult(result.getText());
    else if (error && error.name !== 'NotFoundException') throw error;
  });
}

function setupTorch() {
  const track = state.stream?.getVideoTracks()[0];
  if (track?.getCapabilities()?.torch) {
    $('btnTorch').hidden = false;
  }
}

function toggleTorch() {
  const track = state.stream?.getVideoTracks()[0];
  if (!track) return;
  state.torchOn = !state.torchOn;
  track
    .applyConstraints({ advanced: [{ torch: state.torchOn }] })
    .catch(() => {
      state.torchOn = false;
      $('btnTorch').hidden = true;
    });
}

function handleScanResult(text) {
  const now = Date.now();
  if (text === state.lastScanText && now - state.lastScanAt < 1500) return;
  state.lastScanText = text;
  state.lastScanAt = now;

  const decoded = classifyCode(text);
  if (decoded.kind !== 'upc') {
    stopScanner();
    beepAndVibrate();
    showUnknown(text);
    return;
  }

  const product = findRecalledProduct(decoded.value, RECALLED_PRODUCTS);
  stopScanner();
  beepAndVibrate();
  showResult(decoded.value, product);
}

function submitManual(event) {
  event.preventDefault();
  const digits = digitsOnly($('manualInput').value);
  const decoded = classifyCode(digits);
  if (decoded.kind !== 'upc') {
    $('manualError').hidden = false;
    return;
  }
  $('manualError').hidden = true;
  showResult(decoded.value, findRecalledProduct(decoded.value, RECALLED_PRODUCTS));
}

function showResult(scannedUpc, product) {
  const card = $('resultCard');
  const isRecalled = product !== null;

  card.className = `result-card ${isRecalled ? 'is-recalled' : 'is-ok'}`;
  $('resultIcon').textContent = isRecalled ? '⚠️' : '✅';
  $('resultTitle').textContent = isRecalled ? t('recalledTitle') : t('notListedTitle');
  $('resultBody').textContent = isRecalled
    ? t('recalledBody')
    : interpolate(t('notListedBody'), { date: RECALL_META.lastUpdated });

  $('resultProduct').hidden = !isRecalled;
  if (product) {
    $('detailBrand').textContent = product.brand;
    $('detailProduct').textContent = product.product;
    $('detailSize').textContent = product.size;
  }

  $('resultCodesBlock').hidden = !isRecalled;
  if (product) {
    $('resultCodes').replaceChildren(
      ...product.codes.map((code) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = code;
        return chip;
      }),
    );
  }

  $('resultScanned').textContent = `${t('scannedCode')}: ${scannedUpc}`;
  $('officialLink').href = RECALL_META.sourceUrl[state.lang];
  showView('view-result');
}

function showUnknown(rawText) {
  const card = $('resultCard');
  card.className = 'result-card is-unknown';
  $('resultIcon').textContent = '❓';
  $('resultTitle').textContent = t('unknownTitle');
  $('resultBody').textContent = interpolate(t('unknownBody'), { code: rawText });
  $('resultProduct').hidden = true;
  $('resultCodesBlock').hidden = true;
  $('resultScanned').textContent = `${t('scannedCode')}: ${rawText}`;
  $('officialLink').href = RECALL_META.sourceUrl[state.lang];
  showView('view-result');
}

function showGlobalError(message) {
  const el = $('globalError');
  el.hidden = message === null;
  el.textContent = message ?? '';
}

function switchLanguage() {
  state.lang = state.lang === 'en' ? 'fr' : 'en';
  storageSet(LANG_STORAGE_KEY, state.lang);
  applyI18n();
}

function bind() {
  $('langToggle').addEventListener('click', switchLanguage);
  $('btnScan').addEventListener('click', startScan);
  $('btnManual').addEventListener('click', () => {
    showGlobalError(null);
    $('manualError').hidden = true;
    showView('view-manual');
  });
  $('btnManualBack').addEventListener('click', () => showView('view-home'));
  $('manualForm').addEventListener('submit', submitManual);
  $('btnStop').addEventListener('click', () => {
    stopScanner();
    showView('view-home');
  });
  $('btnTorch').addEventListener('click', toggleTorch);
  $('btnScanAgain').addEventListener('click', startScan);
  $('btnHome').addEventListener('click', () => showView('view-home'));
  window.addEventListener('pagehide', stopScanner);
}

applyI18n();
bind();
