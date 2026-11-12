import { getStrings, isSupportedLang } from './i18n.js?v=2';
import { RECALL_META, RECALLED_PRODUCTS } from './data.js?v=2';
import { classifyCode, findRecalledProduct, digitsOnly } from './lookup.js?v=2';

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
  debugTimer: null,
  watchdog: null,
  stalledFor: 0,
  scanGeneration: 0,
  scanError: '',
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
  state.scanGeneration += 1;
  clearStallWatchdog();
  if (state.debugTimer) {
    clearInterval(state.debugTimer);
    state.debugTimer = null;
  }
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
  const myGeneration = state.scanGeneration;
  showGlobalError(null);
  showView('view-scan');
  $('scanStall').hidden = true;
  state.lastScanText = '';
  state.scanError = 'phase:gum';
  updateScanDebug();
  startStallWatchdog();

  const hints = new Map();
  hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS, [
    window.ZXing.BarcodeFormat.UPC_A,
    window.ZXing.BarcodeFormat.EAN_13,
    window.ZXing.BarcodeFormat.QR_CODE,
  ]);

  const video = $('video');
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.disableRemotePlayback = true;

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
  } catch (error) {
    if (state.scanGeneration !== myGeneration) return;
    state.scanError = `${error.name}`;
    console.error(error);
    updateScanDebug();
    stopScanner();
    showView('view-home');
    showGlobalError(`${t('cameraError')} (${error.name})`);
    return;
  }

  if (state.scanGeneration !== myGeneration) {
    stream.getTracks().forEach((track) => track.stop());
    return;
  }

  state.scanError = 'phase:play';
  const reader = new window.ZXing.BrowserMultiFormatReader(hints, 250);
  state.scanner = reader;
  state.stream = stream;

  video.srcObject = stream;
  try {
    await video.play();
  } catch (error) {
    if (state.scanGeneration !== myGeneration) return;
    state.scanError = `play: ${error.name}`;
    console.error(error);
    updateScanDebug();
    stopScanner();
    showView('view-home');
    showGlobalError(`${t('cameraError')} (${error.name})`);
    return;
  }

  if (state.scanGeneration !== myGeneration) {
    stream.getTracks().forEach((track) => track.stop());
    return;
  }

  state.scanError = 'phase:decode';
  state.debugTimer = setInterval(updateScanDebug, 500);
  updateScanDebug();
  setupTorch();

  reader
    .decodeFromStream(stream, video, (result, error) => {
      if (state.scanner !== reader) return;
      if (result) handleScanResult(result.getText());
      else if (error && /NotAllowed|abort|overconstrained|track/i.test(String(error.message || error.name))) {
        state.scanError = `decode: ${error.name}`;
        updateScanDebug();
      }
    })
    .catch((error) => {
      if (state.scanner !== reader) return;
      state.scanError = `attach: ${error.name}`;
      updateScanDebug();
      stopScanner();
      showView('view-home');
      showGlobalError(`${t('cameraError')} (${error.name})`);
      console.error(error);
    });
}

function updateScanDebug() {
  const video = $('video');
  const track = state.stream?.getVideoTracks()[0];
  const fps = track?.getSettings?.().frameRate;
  const live = track?.readyState === 'live' && video.readyState >= 2 && video.videoWidth > 0;
  if (live) {
    clearStallWatchdog();
    if (state.scanError?.startsWith('phase:')) {
      state.scanError = '';
    }
  }
  $('scanDebug').hidden = false;
  $('scanDebug').textContent = [
    `rs:${video.readyState}`,
    `vw:${video.videoWidth}x${video.videoHeight}`,
    `tr:${track?.readyState ?? '-'}`,
    `fm:${track?.getSettings?.().facingMode ?? '-'}`,
    `fps:${fps ? Math.round(fps) : '?'}`,
    state.scanError ? `err:${state.scanError}` : 'err:-',
  ].join(' ');
}

function startStallWatchdog() {
  clearStallWatchdog();
  state.stalledFor = 0;
  state.watchdog = setInterval(() => {
    state.stalledFor += 1;
    if (state.stalledFor >= 8) showStall();
  }, 1000);
}

function clearStallWatchdog() {
  state.stalledFor = 0;
  if (state.watchdog) {
    clearInterval(state.watchdog);
    state.watchdog = null;
  }
}

function showStall() {
  state.scanError = `stalled@${state.stalledFor}s ${state.scanError}`;
  updateScanDebug();
  stopScanner();
  $('scanStall').hidden = false;
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
  $('btnRetryCamera').addEventListener('click', startScan);
  $('btnHome').addEventListener('click', () => showView('view-home'));
  window.addEventListener('pagehide', stopScanner);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (state.scanner) stopScanner();
      return;
    }
    if (!$('view-scan').hidden && !state.scanner && !state.watchdog) showStall();
  });
}

applyI18n();
bind();
