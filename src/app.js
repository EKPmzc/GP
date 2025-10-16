const canvas = document.getElementById('displayCanvas');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const sampleCanvas = document.getElementById('sampleCanvas');
const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
const videoEl = document.getElementById('video');
const downsampleCanvas = document.createElement('canvas');
const downsampleCtx = downsampleCanvas.getContext('2d');

const TAB_IDS = ['mosaic', 'glitch', 'aurora'];
const tabButtons = document.querySelectorAll('.mode-tabs .tab');
const controlGroups = document.querySelectorAll('.control-group');
const statusText = document.getElementById('statusText');
const fpsText = document.getElementById('fpsText');
const infoTooltip = document.getElementById('infoTooltip');

const mosaicControls = {
  cameraToggle: document.getElementById('cameraToggle'),
  mirrorToggle: document.getElementById('mirrorToggle'),
  fileInput: document.getElementById('fileInput'),
  aspectSelect: document.getElementById('aspectSelect'),
  previewToggle: document.getElementById('previewToggle'),
  previewOnce: document.getElementById('previewOnce'),
  startRecord: document.getElementById('startRecord'),
  stopRecord: document.getElementById('stopRecord'),
  recordMode: document.getElementById('recordMode'),
  resSlider: document.getElementById('resSlider'),
  resNumber: document.getElementById('resNumber'),
  resLabel: document.getElementById('resLabel'),
  countSlider: document.getElementById('countSlider'),
  countNumber: document.getElementById('countNumber'),
  sizeSlider: document.getElementById('sizeSlider'),
  sizeNumber: document.getElementById('sizeNumber'),
  sizeLabel: document.getElementById('sizeLabel'),
  shapeSelect: document.getElementById('shapeSelect'),
  outlineToggle: document.getElementById('outlineToggle'),
  lockGrid: document.getElementById('lockGrid'),
  colorMode: document.getElementById('colorMode'),
  gammaSlider: document.getElementById('gammaSlider'),
  gammaNumber: document.getElementById('gammaNumber'),
  palettePreset: document.getElementById('palettePreset'),
  paletteApply: document.getElementById('paletteApply'),
  paletteCenter: document.getElementById('paletteCenter'),
  paletteRange: document.getElementById('paletteRange'),
  paletteEditor: document.getElementById('paletteEditor'),
  addColor: document.getElementById('addColor'),
  resetPalette: document.getElementById('resetPalette'),
  paletteDither: document.getElementById('paletteDither'),
  jitterMode: document.getElementById('jitterMode'),
  jitterStrength: document.getElementById('jitterStrength'),
  jitterNumber: document.getElementById('jitterNumber'),
  motionDepth: document.getElementById('motionDepth'),
  motionDepthNumber: document.getElementById('motionDepthNumber'),
  staticMotionToggle: document.getElementById('staticMotionToggle'),
  chaosMode: document.getElementById('chaosMode'),
  chaosBurst: document.getElementById('chaosBurst'),
  seedInput: document.getElementById('seedInput'),
  randomizeSeed: document.getElementById('randomizeSeed'),
  previewToggleBtn: document.getElementById('previewToggleBtn'),
  previewStatus: document.getElementById('previewStatus'),
  circleCount: document.getElementById('circleCount'),
  sampleResolution: document.getElementById('sampleResolution'),
  editModeToggle: document.getElementById('editModeToggle'),
  editDuplicate: document.getElementById('editDuplicate'),
  editDelete: document.getElementById('editDelete'),
  savePNG: document.getElementById('savePNG'),
  resetAll: document.getElementById('resetAll')
};

const glitchControls = {
  intensity: document.getElementById('glitchIntensity'),
  scanline: document.getElementById('glitchScanline'),
  snap: document.getElementById('glitchSnap')
};

const auroraControls = {
  bloom: document.getElementById('auroraBloom'),
  drift: document.getElementById('auroraDrift'),
  snap: document.getElementById('auroraSnap')
};

const palettePresets = {
  Warm: ['#8d2a0f', '#c6451c', '#f49b17', '#ffd45c', '#ffe6b1'],
  Cool: ['#0f1f45', '#174e87', '#1e8bd3', '#8ad2ff', '#e0f6ff'],
  Pastel: ['#ffd1dc', '#ffe6e6', '#d9f2ff', '#e8f7ff', '#fef6d8'],
  Neon: ['#08f7fe', '#09fbd3', '#f5d300', '#fe53bb', '#f8f4ff'],
  Muted: ['#3b3a3f', '#6d6a75', '#a4978e', '#d3c0a3', '#f0e7d8'],
  'High-Contrast': ['#000000', '#ffffff', '#ff4141', '#1d9bf0', '#ff8c00'],
  'Heat-Signature': ['#25004a', '#58167d', '#ff007e', '#ff6b00', '#ffe066'],
  Exposed: ['#00111a', '#006cbe', '#ffd700', '#ff9f1c', '#ff3838'],
  Aurora: ['#1a1e44', '#2f477a', '#5a8fb2', '#8fe4ff', '#d8f7ff'],
  Starlight: ['#0a0c1a', '#21305a', '#3f72af', '#f1f6f9', '#ffd166']
};

const chaosPresets = {
  Tranquil: { jitter: 0.4, motion: 0.8, dither: true },
  Pulse: { jitter: 1.2, motion: 2.5, dither: true },
  Aurora: { jitter: 0.6, motion: 4, dither: true },
  Sparkstorm: { jitter: 2.1, motion: 6, dither: true },
  Glimmer: { jitter: 1.6, motion: 3.3, dither: true },
  Hyperdrive: { jitter: 2.8, motion: 8, dither: false }
};

const shapeLibrary = createShapeLibrary();
let activeTab = 'mosaic';
let previewActive = true;
let editMode = false;
let editingIndex = -1;
let mediaRecorder = null;
let recordedChunks = [];
let lastSource = 'none';
let frameSeedOffset = 0;
let lastFrameTime = 0;
let fpsSamples = [];

const state = {
  mode: 'uniform',
  seed: hashSeed(String(Date.now())),
  palette: [...palettePresets['Warm']],
  lastStillFrame: 0,
  stillMotionPhase: 0,
  videoActive: false,
  sampleWidth: 640,
  sampleHeight: 360,
  shapes: [],
  colorMode: 'source',
  dither: true,
  jitterMode: 'none',
  jitterStrength: 1,
  motionDepth: 2,
  staticMotion: false,
  chaosMode: 'Tranquil',
  shapeName: 'Circle',
  outline: false,
  lockGrid: true,
  uniformSize: 0.9,
  randomSize: 8
};

const layoutModeInputs = document.querySelectorAll('input[name="layoutMode"]');

init();

function init() {
  initTabs();
  initControls();
  initInfo();
  initShapeOptions();
  initPalette();
  initChaosOptions();
  initShortcuts();
  mosaicControls.seedInput.value = String(state.seed);
  requestAnimationFrame(tick);
}

function initTabs() {
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  tabButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
    btn.setAttribute('aria-selected', btn.dataset.tab === tabId);
  });
  controlGroups.forEach((group) => {
    const owner = group.getAttribute('data-tab-owner');
    if (!owner) return;
    const hidden = owner !== tabId;
    group.toggleAttribute('hidden', hidden);
  });
  if (tabId === 'mosaic' && previewActive) {
    queueRender();
  } else if (tabId === 'glitch') {
    renderGlitch();
  } else if (tabId === 'aurora') {
    renderAurora();
  }
}

function initControls() {
  mosaicControls.cameraToggle.addEventListener('click', toggleCamera);
  mosaicControls.mirrorToggle.addEventListener('change', queueRender);
  mosaicControls.fileInput.addEventListener('change', handleFile);
  mosaicControls.aspectSelect.addEventListener('change', queueRender);
  mosaicControls.previewToggle.addEventListener('change', () => {
    previewActive = mosaicControls.previewToggle.checked;
    mosaicControls.previewStatus.textContent = previewActive ? 'Preview ON' : 'Preview OFF';
  });
  mosaicControls.previewOnce.addEventListener('click', () => {
    renderMosaic();
  });
  mosaicControls.startRecord.addEventListener('click', startRecording);
  mosaicControls.stopRecord.addEventListener('click', stopRecording);
  mosaicControls.recordMode.addEventListener('change', () => {
    setStatus(`Record mode: ${mosaicControls.recordMode.value}`);
  });

  linkSliderNumber(mosaicControls.resSlider, mosaicControls.resNumber, updateResolutionLabel);
  linkSliderNumber(mosaicControls.countSlider, mosaicControls.countNumber, queueRender);
  linkSliderNumber(mosaicControls.sizeSlider, mosaicControls.sizeNumber, handleSizeChange);
  linkSliderNumber(mosaicControls.gammaSlider, mosaicControls.gammaNumber, queueRender);
  linkSliderNumber(mosaicControls.jitterStrength, mosaicControls.jitterNumber, queueRender);
  linkSliderNumber(mosaicControls.motionDepth, mosaicControls.motionDepthNumber, () => {
    state.motionDepth = parseFloat(mosaicControls.motionDepth.value);
    queueRender();
  });

  mosaicControls.shapeSelect.addEventListener('change', () => {
    state.shapeName = mosaicControls.shapeSelect.value;
    queueRender();
  });
  mosaicControls.outlineToggle.addEventListener('change', () => {
    state.outline = mosaicControls.outlineToggle.checked;
    queueRender();
  });
  mosaicControls.lockGrid.addEventListener('change', () => {
    state.lockGrid = mosaicControls.lockGrid.checked;
  });
  mosaicControls.colorMode.addEventListener('change', () => {
    state.colorMode = mosaicControls.colorMode.value;
    queueRender();
  });
  mosaicControls.palettePreset.addEventListener('change', () => {
    const preset = mosaicControls.palettePreset.value;
    if (palettePresets[preset]) {
      state.palette = [...palettePresets[preset]];
      refreshPaletteEditor();
      queueRender();
    }
  });
  mosaicControls.paletteApply.addEventListener('click', () => {
    applyPaletteRange();
  });
  mosaicControls.paletteCenter.addEventListener('change', () => {
    applyPaletteRange(false);
  });
  mosaicControls.paletteRange.addEventListener('input', () => applyPaletteRange(false));
  mosaicControls.addColor.addEventListener('click', () => {
    state.palette.push('#ffffff');
    refreshPaletteEditor();
    queueRender();
  });
  mosaicControls.resetPalette.addEventListener('click', () => {
    const preset = mosaicControls.palettePreset.value;
    state.palette = [...(palettePresets[preset] || palettePresets.Warm)];
    refreshPaletteEditor();
    queueRender();
  });
  mosaicControls.paletteDither.addEventListener('change', () => {
    state.dither = mosaicControls.paletteDither.checked;
    queueRender();
  });
  mosaicControls.jitterMode.addEventListener('change', () => {
    state.jitterMode = mosaicControls.jitterMode.value;
    queueRender();
  });
  mosaicControls.staticMotionToggle.addEventListener('change', () => {
    state.staticMotion = mosaicControls.staticMotionToggle.checked;
  });
  mosaicControls.chaosMode.addEventListener('change', () => {
    state.chaosMode = mosaicControls.chaosMode.value;
    const preset = chaosPresets[state.chaosMode];
    if (preset) {
      mosaicControls.jitterStrength.value = preset.jitter;
      mosaicControls.jitterNumber.value = preset.jitter;
      mosaicControls.motionDepth.value = preset.motion;
      mosaicControls.motionDepthNumber.value = preset.motion;
      mosaicControls.paletteDither.checked = preset.dither;
      state.jitterStrength = preset.jitter;
      state.motionDepth = preset.motion;
      state.dither = preset.dither;
      queueRender();
    }
  });
  mosaicControls.chaosBurst.addEventListener('click', startChaosBurst);

  layoutModeInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) {
        state.mode = input.value;
        updateSizeControlMode(state.mode);
        queueRender();
      }
    });
  });

  mosaicControls.seedInput.addEventListener('change', () => {
    const value = mosaicControls.seedInput.value.trim();
    state.seed = hashSeed(value);
    frameSeedOffset = 0;
    queueRender();
  });
  mosaicControls.randomizeSeed.addEventListener('click', () => {
    const newSeed = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    mosaicControls.seedInput.value = newSeed;
    state.seed = hashSeed(newSeed);
    queueRender();
  });

  mosaicControls.previewToggleBtn.addEventListener('click', () => {
    previewActive = !previewActive;
    mosaicControls.previewStatus.textContent = previewActive ? 'Preview ON' : 'Preview OFF';
  });

  mosaicControls.editModeToggle.addEventListener('click', toggleEditMode);
  mosaicControls.editDuplicate.addEventListener('click', duplicateSelection);
  mosaicControls.editDelete.addEventListener('click', deleteSelection);
  mosaicControls.savePNG.addEventListener('click', downloadPNG);
  mosaicControls.resetAll.addEventListener('click', resetAllSettings);

  glitchControls.intensity.addEventListener('input', renderGlitch);
  glitchControls.scanline.addEventListener('change', renderGlitch);
  glitchControls.snap.addEventListener('click', () => {
    renderGlitch();
    captureSnapshotToMosaic();
  });

  auroraControls.bloom.addEventListener('input', renderAurora);
  auroraControls.drift.addEventListener('input', renderAurora);
  auroraControls.snap.addEventListener('click', () => {
    renderAurora();
    captureSnapshotToMosaic();
  });

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('resize', handleResize);
  updateSizeControlMode(state.mode);
  handleResize();
}

function initInfo() {
  const infoCopy = {
    source: 'Choose your live camera, upload an image, configure aspect ratio, and enable 60 fps preview/recording options.',
    mode: 'Uniform builds an N×N grid. Random uses seeded Poisson discs up to 20k shapes. Hybrid blends both for dense fills.',
    color: 'Choose the palette pipeline. Gamma applies before grayscale/palette. Palette mode uses the swatches below and optionally dithers to reduce banding.',
    jitter: 'Jitter scales shapes by brightness, hue, saturation, or position noise. Static motion animates still images by modulating the seed each frame.',
    seed: 'Use deterministic seeds for reproducible art. Toggle preview or render single frames without changing the locked seed.',
    edit: 'Freeze a frame then move, duplicate, or delete shapes directly on canvas without regenerating the mosaic.',
    utility: 'Export PNG renders, reset to defaults, and manage project housekeeping.',
    glitch: 'Glitch Forge slices frames into displaced bands, with optional scanlines, ready to snap back into the Mosaic lab.',
    aurora: 'Aurora Synth paints bloom-heavy ribbons and drift, useful for ambient backgrounds that can feed the Mosaic renderer.'
  };
  document.querySelectorAll('button.info').forEach((btn) => {
    const key = btn.dataset.info;
    btn.addEventListener('mouseenter', (e) => {
      infoTooltip.textContent = infoCopy[key] || 'Info';
      infoTooltip.style.opacity = '1';
      positionTooltip(e);
    });
    btn.addEventListener('mousemove', positionTooltip);
    btn.addEventListener('mouseleave', () => {
      infoTooltip.style.opacity = '0';
    });
  });
}

function positionTooltip(e) {
  infoTooltip.style.left = `${e.clientX + 16}px`;
  infoTooltip.style.top = `${e.clientY + 16}px`;
}

function initShapeOptions() {
  Object.keys(shapeLibrary).forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    mosaicControls.shapeSelect.appendChild(opt);
  });
  mosaicControls.shapeSelect.value = state.shapeName;
}

function initPalette() {
  Object.keys(palettePresets).forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    mosaicControls.palettePreset.appendChild(option);
  });
  mosaicControls.palettePreset.value = 'Warm';
  refreshPaletteEditor();
}

function initChaosOptions() {
  Object.keys(chaosPresets).forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    mosaicControls.chaosMode.appendChild(option);
  });
  mosaicControls.chaosMode.value = state.chaosMode;
}

function initShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      renderMosaic();
    } else if (e.key.toLowerCase() === 'r') {
      mosaicControls.randomizeSeed.click();
    } else if (e.key.toLowerCase() === 'p') {
      mosaicControls.previewToggleBtn.click();
    } else if (e.key.toLowerCase() === 'e') {
      mosaicControls.editModeToggle.click();
    } else if (e.key.toLowerCase() === 's' && e.ctrlKey === false && e.metaKey === false) {
      e.preventDefault();
      downloadPNG();
    }
  });
}

function setStatus(message) {
  statusText.textContent = message;
}

function linkSliderNumber(slider, numberInput, callback = () => {}) {
  const sync = (value) => {
    slider.value = value;
    numberInput.value = value;
    callback(parseFloat(value));
  };
  slider.addEventListener('input', () => sync(slider.value));
  numberInput.addEventListener('change', () => sync(numberInput.value));
  sync(slider.value);
}

function handleSizeChange(value) {
  const mode = state.mode;
  if (mode === 'uniform') {
    state.uniformSize = parseFloat(value);
    mosaicControls.sizeLabel.textContent = `${parseFloat(value).toFixed(2)}× cell`;
  } else {
    state.randomSize = parseFloat(value);
    mosaicControls.sizeLabel.textContent = `${parseFloat(value).toFixed(1)} px`;
  }
  queueRender();
}

function updateSizeControlMode(mode) {
  if (mode === 'uniform') {
    mosaicControls.sizeSlider.min = '0.2';
    mosaicControls.sizeSlider.max = '0.9';
    mosaicControls.sizeSlider.step = '0.01';
    mosaicControls.sizeNumber.min = '0.2';
    mosaicControls.sizeNumber.max = '0.9';
    mosaicControls.sizeNumber.step = '0.01';
    const value = clamp(state.uniformSize, 0.2, 0.9);
    mosaicControls.sizeSlider.value = value;
    mosaicControls.sizeNumber.value = value;
    mosaicControls.sizeLabel.textContent = `${value.toFixed(2)}× cell`;
  } else {
    mosaicControls.sizeSlider.min = '2';
    mosaicControls.sizeSlider.max = '40';
    mosaicControls.sizeSlider.step = '0.1';
    mosaicControls.sizeNumber.min = '2';
    mosaicControls.sizeNumber.max = '40';
    mosaicControls.sizeNumber.step = '0.1';
    const value = clamp(state.randomSize, 2, 40);
    mosaicControls.sizeSlider.value = value;
    mosaicControls.sizeNumber.value = value;
    mosaicControls.sizeLabel.textContent = `${value.toFixed(1)} px`;
  }
}

function updateResolutionLabel(value) {
  const n = parseInt(value, 10);
  mosaicControls.resLabel.textContent = `${n} × ${n}`;
  queueRender();
}

function toggleCamera() {
  if (state.videoActive) {
    stopCamera();
  } else {
    startCamera();
  }
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, frameRate: { ideal: 60, max: 120 } }, audio: false });
    videoEl.srcObject = stream;
    await videoEl.play();
    state.videoActive = true;
    lastSource = 'video';
    mosaicControls.cameraToggle.textContent = 'Stop Camera';
    setStatus('Camera started');
  } catch (err) {
    setStatus(`Camera failed: ${err.message}`);
  }
}

function stopCamera() {
  const stream = videoEl.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  videoEl.srcObject = null;
  state.videoActive = false;
  mosaicControls.cameraToggle.textContent = 'Start Camera';
  setStatus('Camera stopped');
}

function handleFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    state.videoActive = false;
    stopCamera();
    sampleCanvas.width = img.width;
    sampleCanvas.height = img.height;
    sampleCtx.drawImage(img, 0, 0, img.width, img.height);
    lastSource = 'image';
    state.lastStillFrame = performance.now();
    URL.revokeObjectURL(url);
    queueRender();
  };
  img.src = url;
}

function handleResize() {
  const wrapper = document.querySelector('.aspect-wrapper');
  const rect = wrapper.getBoundingClientRect();
  const targetRatio = determineAspectRatio();
  let width = rect.width - 20;
  let height = rect.height - 20;
  if (targetRatio) {
    if (width / height > targetRatio) {
      width = height * targetRatio;
    } else {
      height = width / targetRatio;
    }
  }
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  queueRender();
}

function determineAspectRatio() {
  const value = mosaicControls.aspectSelect.value;
  if (value === 'source') {
    if (lastSource === 'video' && videoEl.videoWidth) {
      return videoEl.videoWidth / videoEl.videoHeight;
    }
    if (lastSource === 'image') {
      return sampleCanvas.width / sampleCanvas.height;
    }
    return 16 / 9;
  }
  const [w, h] = value.split(':').map(Number);
  return w / h;
}

function queueRender() {
  renderMosaic();
}

function tick(ts) {
  if (previewActive && activeTab === 'mosaic') {
    if (ts - lastFrameTime > 1000 / 60) {
      renderMosaic();
      lastFrameTime = ts;
    }
  }
  updateFPS(ts);
  requestAnimationFrame(tick);
}

function updateFPS(ts) {
  fpsSamples.push(ts);
  while (fpsSamples.length > 30) {
    fpsSamples.shift();
  }
  if (fpsSamples.length >= 2) {
    const span = fpsSamples[fpsSamples.length - 1] - fpsSamples[0];
    const fps = Math.round((fpsSamples.length - 1) * 1000 / (span || 1));
    fpsText.textContent = `${fps} fps`;
  }
}

function renderMosaic() {
  if (activeTab !== 'mosaic') return;
  const sourceAvailable = ensureSourceReady();
  if (!sourceAvailable) return;
  const sample = downsampleSource();
  const params = collectParams();
  if (editMode && state.shapes.length) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShapes(ctx, state.shapes, params);
    if (state.chaosMode === 'Glimmer') {
      renderGlimmer(params);
    }
    return;
  }
  const sampleFn = (x, y) => sampleColorAt(sample, x, y, params.mirror);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let shapes = [];
  if (params.mode === 'uniform') {
    shapes = renderUniformGrid(ctx, params, sampleFn);
  } else if (params.mode === 'random') {
    shapes = renderRandomPoisson(ctx, params, sampleFn);
  } else {
    const grid = renderUniformGrid(ctx, params, sampleFn, true);
    const random = renderRandomPoisson(ctx, params, sampleFn, true);
    shapes = [...grid.slice(0, Math.floor(grid.length / 2)), ...random.slice(0, Math.floor(random.length / 2))];
    drawShapes(ctx, shapes, params);
  }
  if (state.chaosMode === 'Glimmer') {
    renderGlimmer(params);
  }
  state.shapes = shapes;
  mosaicControls.circleCount.textContent = shapes.length.toLocaleString();
  mosaicControls.sampleResolution.textContent = `${sample.width}×${sample.height}`;
  setStatus(`Rendered ${shapes.length} shapes`);
}

function ensureSourceReady() {
  if (state.videoActive) {
    if (!videoEl.videoWidth || !videoEl.videoHeight) {
      return false;
    }
    sampleCanvas.width = videoEl.videoWidth;
    sampleCanvas.height = videoEl.videoHeight;
    sampleCtx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
    return true;
  }
  if (lastSource === 'image') {
    if (state.staticMotion) {
      const elapsed = (performance.now() - state.lastStillFrame) / 1000;
      state.stillMotionPhase = elapsed * state.motionDepth;
    }
    return true;
  }
  return false;
}

function downsampleSource() {
  const maxSize = 640;
  const sourceW = sampleCanvas.width;
  const sourceH = sampleCanvas.height;
  const scale = Math.min(1, maxSize / Math.max(sourceW, sourceH));
  const width = Math.max(1, Math.floor(sourceW * scale));
  const height = Math.max(1, Math.floor(sourceH * scale));
  if (downsampleCanvas.width !== width || downsampleCanvas.height !== height) {
    downsampleCanvas.width = width;
    downsampleCanvas.height = height;
  }
  downsampleCtx.clearRect(0, 0, width, height);
  downsampleCtx.drawImage(sampleCanvas, 0, 0, width, height);
  const imageData = downsampleCtx.getImageData(0, 0, width, height);
  return { width, height, data: imageData.data };
}

function collectParams() {
  if (state.staticMotion) {
    frameSeedOffset = Math.floor(state.stillMotionPhase * 1000);
  } else {
    frameSeedOffset = 0;
  }
  const seedBase = state.seed + frameSeedOffset;
  const rng = mulberry32(seedBase);
  const mode = state.mode;
  const resolution = parseInt(mosaicControls.resSlider.value, 10);
  const targetCount = parseInt(mosaicControls.countSlider.value, 10);
  const baseSize = parseFloat(mosaicControls.sizeSlider.value);
  const gamma = parseFloat(mosaicControls.gammaSlider.value);
  const jitterStrength = parseFloat(mosaicControls.jitterStrength.value);
  const palette = state.palette.map((hex) => hexToRgb(hex));
  const shape = shapeLibrary[state.shapeName];
  const outline = mosaicControls.outlineToggle.checked;
  const mirror = mosaicControls.mirrorToggle.checked;
  const dither = mosaicControls.paletteDither.checked;
  const jitterMode = mosaicControls.jitterMode.value;
  const motionDepth = parseFloat(mosaicControls.motionDepth.value);
  return {
    mode,
    resolution,
    targetCount,
    baseSize,
    gamma,
    jitterStrength,
    palette,
    shape,
    outline,
    mirror,
    dither,
    colorMode: state.colorMode,
    jitterMode,
    rng,
    canvasW: canvas.width,
    canvasH: canvas.height,
    motionDepth
  };
}

function renderUniformGrid(context, params, sampleFn, skipDraw = false) {
  const { resolution, canvasW, canvasH, baseSize, jitterMode, jitterStrength, gamma, palette, dither, outline } = params;
  const cellW = canvasW / resolution;
  const cellH = canvasH / resolution;
  const radiusBase = Math.min(cellW, cellH) * 0.5 * baseSize;
  const shapes = [];
  let idx = 0;
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const cx = x * cellW + cellW / 2;
      const cy = y * cellH + cellH / 2;
      const color = sampleFn(x / resolution, y / resolution);
      const gammaColor = applyGamma(color, gamma);
      const finalColor = colorize(gammaColor, params, idx);
      const jitterFactor = computeJitter(jitterMode, jitterStrength, color, cx, cy, params);
      const shapeRadius = radiusBase * jitterFactor;
      shapes.push({ x: cx, y: cy, radius: shapeRadius, color: finalColor, idx });
      idx++;
    }
  }
  if (!skipDraw) {
    drawShapes(context, shapes, params);
  }
  return shapes;
}

function renderRandomPoisson(context, params, sampleFn, skipDraw = false) {
  const shapes = [];
  const { targetCount, canvasW, canvasH, baseSize, jitterMode, jitterStrength, gamma } = params;
  const minRadius = baseSize * 0.35;
  const maxRadius = baseSize * 1.6;
  const cellSize = (minRadius * 2) / Math.SQRT2;
  const gridW = Math.ceil(canvasW / cellSize);
  const gridH = Math.ceil(canvasH / cellSize);
  const grid = new Array(gridW * gridH).fill(null);
  const active = [];
  const rng = params.rng;
  const fx = canvasW * rng();
  const fy = canvasH * rng();
  const firstColor = sampleFn(fx / canvasW, fy / canvasH);
  const firstGamma = applyGamma(firstColor, gamma);
  const firstFinal = colorize(firstGamma, params, 0);
  const firstRadius = clamp(baseSize * computeJitter(params.jitterMode, params.jitterStrength, firstColor, fx, fy, params), minRadius, maxRadius);
  const firstPoint = {
    x: fx,
    y: fy,
    radius: firstRadius,
    color: firstFinal
  };
  active.push(firstPoint);
  shapes.push(firstPoint);
  placeInGrid(firstPoint, grid, cellSize, gridW);

  while (active.length && shapes.length < targetCount) {
    const index = Math.floor(rng() * active.length);
    const point = active[index];
    let found = false;
    for (let i = 0; i < 20; i++) {
      const angle = rng() * Math.PI * 2;
      const radius = point.radius + minRadius + rng() * (maxRadius - minRadius);
      const distance = radius * 2.2;
      const nx = point.x + Math.cos(angle) * distance;
      const ny = point.y + Math.sin(angle) * distance;
      if (nx < 0 || ny < 0 || nx > canvasW || ny > canvasH) continue;
      const color = sampleFn(nx / canvasW, ny / canvasH);
      const gammaColor = applyGamma(color, gamma);
      const finalColor = colorize(gammaColor, params, shapes.length);
      const jitterFactor = computeJitter(jitterMode, jitterStrength, color, nx, ny, params);
      const localRadius = clamp(baseSize * jitterFactor, minRadius, maxRadius);
      const candidate = { x: nx, y: ny, radius: localRadius, color: finalColor };
      if (fits(candidate, grid, cellSize, gridW)) {
        shapes.push(candidate);
        active.push(candidate);
        placeInGrid(candidate, grid, cellSize, gridW);
        found = true;
        break;
      }
    }
    if (!found) {
      active.splice(index, 1);
    }
  }
  if (!skipDraw) {
    drawShapes(context, shapes, params);
  }
  return shapes;
}

function drawShapes(context, shapes, params) {
  const path = params.shape.path;
  context.save();
  for (const shape of shapes) {
    context.fillStyle = rgbToCss(shape.color);
    context.translate(shape.x, shape.y);
    context.scale(shape.radius, shape.radius);
    context.fill(path);
    if (params.outline) {
      context.strokeStyle = 'rgba(255,255,255,0.25)';
      context.lineWidth = 0.03;
      context.stroke(path);
    }
    context.setTransform(1, 0, 0, 1, 0, 0);
  }
  context.restore();
}

function renderGlimmer(params) {
  const sparkleCount = Math.max(12, Math.floor((params.canvasW * params.canvasH) / 8000));
  const rng = mulberry32(state.seed + 0x9e3779b1 + frameSeedOffset);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < sparkleCount; i++) {
    const x = params.canvasW * rng();
    const y = params.canvasH * rng();
    const radius = (rng() * 6 + 2) * (params.jitterStrength * 0.3 + 1);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.25)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function computeJitter(mode, strength, color, x, y, params) {
  if (mode === 'none' || strength === 0) return 1;
  const rng = params.rng;
  const baseNoise = rng() * 0.1;
  const normalizedX = x / params.canvasW;
  const normalizedY = y / params.canvasH;
  if (mode === 'brightness') {
    const lum = luminance(color) / 255;
    return 1 + (0.5 - lum) * strength;
  }
  if (mode === 'hue') {
    const hsv = rgbToHsv(color);
    return 1 + Math.sin(hsv.h * Math.PI * 2) * 0.5 * strength;
  }
  if (mode === 'saturation') {
    const hsv = rgbToHsv(color);
    return 1 + (hsv.s - 0.5) * strength;
  }
  if (mode === 'position') {
    const noise = Math.sin((normalizedX + baseNoise) * Math.PI * 4) * Math.cos((normalizedY + baseNoise) * Math.PI * 4);
    return 1 + noise * 0.7 * strength;
  }
  return 1;
}

function colorize(rgb, params, idx) {
  const { colorMode, palette, dither, rng } = params;
  if (colorMode === 'source') return rgb;
  if (colorMode === 'grayscale') {
    const gray = toGrayscale(rgb);
    return { r: gray, g: gray, b: gray, a: rgb.a };
  }
  if (colorMode === 'palette') {
    if (dither) {
      const noise = (rng() - 0.5) * 10;
      const noisy = {
        r: clamp(rgb.r + noise, 0, 255),
        g: clamp(rgb.g + noise, 0, 255),
        b: clamp(rgb.b + noise, 0, 255)
      };
      return nearestPaletteColor(noisy, palette);
    }
    return nearestPaletteColor(rgb, palette);
  }
  return rgb;
}

function drawImageToCanvas(image, width, height) {
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);
}

function placeInGrid(point, grid, cellSize, gridW) {
  const gx = Math.floor(point.x / cellSize);
  const gy = Math.floor(point.y / cellSize);
  if (gx < 0 || gy < 0 || gy * gridW + gx >= grid.length) return;
  grid[gy * gridW + gx] = point;
}

function fits(candidate, grid, cellSize, gridW) {
  const gx = Math.floor(candidate.x / cellSize);
  const gy = Math.floor(candidate.y / cellSize);
  const gridH = grid.length / gridW;
  for (let y = Math.max(0, gy - 2); y <= Math.min(gridH - 1, gy + 2); y++) {
    for (let x = Math.max(0, gx - 2); x <= Math.min(gridW - 1, gx + 2); x++) {
      const neighbor = grid[y * gridW + x];
      if (!neighbor) continue;
      const dx = neighbor.x - candidate.x;
      const dy = neighbor.y - candidate.y;
      if (dx * dx + dy * dy < Math.pow(neighbor.radius + candidate.radius, 2)) {
        return false;
      }
    }
  }
  return true;
}

function sampleColorAt(sample, nx, ny, mirror) {
  const x = clamp(Math.floor((mirror ? 1 - nx : nx) * (sample.width - 1)), 0, sample.width - 1);
  const y = clamp(Math.floor(ny * (sample.height - 1)), 0, sample.height - 1);
  const idx = (y * sample.width + x) * 4;
  const data = sample.data;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
}

function applyGamma(color, gamma) {
  const inv = 1 / gamma;
  return {
    r: Math.pow(color.r / 255, inv) * 255,
    g: Math.pow(color.g / 255, inv) * 255,
    b: Math.pow(color.b / 255, inv) * 255,
    a: color.a
  };
}

function toGrayscale(rgb) {
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

function nearestPaletteColor(color, palette) {
  let best = palette[0];
  let bestDist = Infinity;
  for (const pal of palette) {
    const dr = pal.r - color.r;
    const dg = pal.g - color.g;
    const db = pal.b - color.b;
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = pal;
    }
  }
  return best;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

function luminance(color) {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

function rgbToCss(color) {
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a !== undefined ? color.a / 255 : 1})`;
}

function rgbToHsv(color) {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
  }
  h = (h / 6) % 1;
  if (h < 0) h += 1;
  const s = max === 0 ? 0 : delta / max;
  return { h, s, v: max };
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  if (value.length === 6) {
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255, a: 255 };
  }
  return { r: 255, g: 255, b: 255, a: 255 };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function refreshPaletteEditor() {
  mosaicControls.paletteEditor.innerHTML = '';
  state.palette.forEach((hex, index) => {
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    const input = document.createElement('input');
    input.type = 'color';
    input.value = hex;
    input.addEventListener('input', () => {
      state.palette[index] = input.value;
      queueRender();
    });
    const remove = document.createElement('button');
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      state.palette.splice(index, 1);
      refreshPaletteEditor();
      queueRender();
    });
    swatch.appendChild(input);
    if (state.palette.length > 2) {
      swatch.appendChild(remove);
    }
    mosaicControls.paletteEditor.appendChild(swatch);
  });
}

function applyPaletteRange(updateSeed = true) {
  const center = hexToRgb(mosaicControls.paletteCenter.value);
  const range = parseFloat(mosaicControls.paletteRange.value);
  const paletteSize = state.palette.length;
  const baseHue = rgbToHsv(center).h * 360;
  const newPalette = [];
  for (let i = 0; i < paletteSize; i++) {
    const offset = (i / Math.max(1, paletteSize - 1) - 0.5) * range;
    const hue = (baseHue + offset + 360) % 360;
    const color = hsvToRgb({ h: hue / 360, s: 0.6, v: 0.95 });
    newPalette.push(rgbToHex(color));
  }
  state.palette = newPalette;
  refreshPaletteEditor();
  if (updateSeed) {
    queueRender();
  }
}

function rgbToHex(color) {
  const r = color.r.toString(16).padStart(2, '0');
  const g = color.g.toString(16).padStart(2, '0');
  const b = color.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function hsvToRgb({ h, s, v }) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default:
      r = v;
      g = p;
      b = q;
      break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function startChaosBurst() {
  let count = 0;
  const interval = setInterval(() => {
    frameSeedOffset = Math.floor(Math.random() * 100000);
    renderMosaic();
    if (++count > 120) {
      clearInterval(interval);
      frameSeedOffset = 0;
    }
  }, 16);
}

function handlePointerDown(event) {
  if (!editMode) return;
  const { offsetX, offsetY } = event;
  const hit = state.shapes.findIndex((shape) => {
    const dx = shape.x - offsetX;
    const dy = shape.y - offsetY;
    return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
  });
  if (hit !== -1) {
    editingIndex = hit;
    mosaicControls.editDuplicate.disabled = false;
    mosaicControls.editDelete.disabled = false;
    setStatus(`Selected shape ${hit + 1}`);
  }
}

function handlePointerMove(event) {
  if (!editMode || editingIndex === -1 || event.buttons === 0) return;
  const shape = state.shapes[editingIndex];
  shape.x = clamp(event.offsetX, 0, canvas.width);
  shape.y = clamp(event.offsetY, 0, canvas.height);
  renderMosaic();
}

function handlePointerUp(event) {
  editingIndex = -1;
}

function toggleEditMode() {
  editMode = !editMode;
  mosaicControls.editModeToggle.textContent = editMode ? 'Exit Edit (E)' : 'Enter Edit (E)';
  mosaicControls.editDuplicate.disabled = !editMode;
  mosaicControls.editDelete.disabled = !editMode;
  setStatus(editMode ? 'Edit mode enabled' : 'Edit mode disabled');
  if (!editMode) {
    queueRender();
  }
}

function duplicateSelection() {
  if (!editMode || editingIndex === -1) return;
  const target = state.shapes[editingIndex];
  const clone = { ...target, x: clamp(target.x + 10, 0, canvas.width), y: clamp(target.y + 10, 0, canvas.height) };
  state.shapes.push(clone);
  renderMosaic();
}

function deleteSelection() {
  if (!editMode || editingIndex === -1) return;
  state.shapes.splice(editingIndex, 1);
  editingIndex = -1;
  renderMosaic();
}

function downloadPNG() {
  const link = document.createElement('a');
  link.download = 'mosaic.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function resetAllSettings() {
  mosaicControls.resSlider.value = 40;
  mosaicControls.resNumber.value = 40;
  mosaicControls.countSlider.value = 1500;
  mosaicControls.countNumber.value = 1500;
  mosaicControls.sizeSlider.value = 0.9;
  mosaicControls.sizeNumber.value = 0.9;
  mosaicControls.gammaSlider.value = 1;
  mosaicControls.gammaNumber.value = 1;
  mosaicControls.jitterStrength.value = 1;
  mosaicControls.jitterNumber.value = 1;
  mosaicControls.motionDepth.value = 2;
  mosaicControls.motionDepthNumber.value = 2;
  state.palette = [...palettePresets.Warm];
  refreshPaletteEditor();
  queueRender();
}

async function startRecording() {
  if (mediaRecorder) return;
  try {
    const mode = mosaicControls.recordMode.value;
    let stream;
    if (mode === 'window') {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 60 }, audio: false });
    } else {
      stream = canvas.captureStream(60);
    }
    const options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 12_000_000 };
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mosaic-${Date.now()}.webm`;
      link.click();
      URL.revokeObjectURL(url);
      mediaRecorder = null;
    };
    mediaRecorder.start();
    mosaicControls.startRecord.disabled = true;
    mosaicControls.stopRecord.disabled = false;
    setStatus('Recording at 60 fps');
  } catch (error) {
    mediaRecorder = null;
    mosaicControls.startRecord.disabled = false;
    mosaicControls.stopRecord.disabled = true;
    setStatus(`Recording failed: ${error.message}`);
  }
}

function stopRecording() {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  mosaicControls.startRecord.disabled = false;
  mosaicControls.stopRecord.disabled = true;
  setStatus('Recording stopped');
}

function renderGlitch() {
  ctx.save();
  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const intensity = parseFloat(glitchControls.intensity.value);
  const scanline = glitchControls.scanline.checked;
  const sample = ensureSourceReady() ? downsampleSource() : null;
  if (!sample) {
    ctx.restore();
    return;
  }
  const bands = Math.max(6, Math.floor(intensity * 40));
  const bandHeight = canvas.height / bands;
  const rng = mulberry32(state.seed);
  for (let i = 0; i < bands; i++) {
    const offset = (rng() - 0.5) * intensity * 200;
    ctx.drawImage(
      sampleCanvas,
      0,
      (i / bands) * sampleCanvas.height,
      sampleCanvas.width,
      sampleCanvas.height / bands,
      offset,
      i * bandHeight,
      canvas.width,
      bandHeight
    );
  }
  if (scanline) {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.08)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.restore();
}

function renderAurora() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const bloom = parseFloat(auroraControls.bloom.value);
  const drift = parseFloat(auroraControls.drift.value);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#030b19');
  gradient.addColorStop(1, '#0c1626');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const layers = 6;
  const rng = mulberry32(state.seed + frameSeedOffset);
  for (let i = 0; i < layers; i++) {
    const path = new Path2D();
    const amplitude = (i + 1) * 30 * bloom;
    const frequency = 0.5 + i * 0.15;
    path.moveTo(0, canvas.height / 2);
    for (let x = 0; x <= canvas.width; x += 20) {
      const y = canvas.height / 2 + Math.sin((x / canvas.width) * Math.PI * 2 * frequency + drift * i) * amplitude;
      path.lineTo(x, y);
    }
    path.lineTo(canvas.width, canvas.height);
    path.lineTo(0, canvas.height);
    path.closePath();
    const hue = (rng() * 360) | 0;
    ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${0.1 + 0.1 * i})`;
    ctx.fill(path);
  }
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
}

function captureSnapshotToMosaic() {
  sampleCanvas.width = canvas.width;
  sampleCanvas.height = canvas.height;
  sampleCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  lastSource = 'image';
  state.staticMotion = true;
  mosaicControls.staticMotionToggle.checked = true;
  switchTab('mosaic');
  queueRender();
}

function createShapeLibrary() {
  const shapes = {};
  const simpleShape = (draw) => {
    const path = new Path2D();
    draw(path);
    return { path };
  };
  shapes.Circle = simpleShape((p) => p.arc(0, 0, 1, 0, Math.PI * 2));
  shapes.Square = simpleShape((p) => {
    p.rect(-1, -1, 2, 2);
  });
  shapes.Triangle = simpleShape((p) => {
    p.moveTo(0, -1);
    p.lineTo(Math.cos((150 * Math.PI) / 180), Math.sin((150 * Math.PI) / 180));
    p.lineTo(Math.cos((30 * Math.PI) / 180), Math.sin((30 * Math.PI) / 180));
    p.closePath();
  });
  shapes.Star = simpleShape((p) => {
    const spikes = 5;
    const outer = 1;
    const inner = 0.4;
    let rot = Math.PI / 2 * 3;
    let x = 0;
    let y = 0;
    p.moveTo(0, -outer);
    for (let i = 0; i < spikes; i++) {
      x = Math.cos(rot) * outer;
      y = Math.sin(rot) * outer;
      p.lineTo(x, y);
      rot += Math.PI / spikes;
      x = Math.cos(rot) * inner;
      y = Math.sin(rot) * inner;
      p.lineTo(x, y);
      rot += Math.PI / spikes;
    }
    p.lineTo(0, -outer);
    p.closePath();
  });
  shapes.Hexagon = simpleShape((p) => {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      if (i === 0) p.moveTo(x, y);
      else p.lineTo(x, y);
    }
    p.closePath();
  });
  shapes.Cross = simpleShape((p) => {
    p.moveTo(-1, -0.3);
    p.lineTo(-0.3, -0.3);
    p.lineTo(-0.3, -1);
    p.lineTo(0.3, -1);
    p.lineTo(0.3, -0.3);
    p.lineTo(1, -0.3);
    p.lineTo(1, 0.3);
    p.lineTo(0.3, 0.3);
    p.lineTo(0.3, 1);
    p.lineTo(-0.3, 1);
    p.lineTo(-0.3, 0.3);
    p.lineTo(-1, 0.3);
    p.closePath();
  });
  return shapes;
}

