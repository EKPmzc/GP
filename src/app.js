const canvas = document.getElementById('displayCanvas');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const sampleCanvas = document.getElementById('sampleCanvas');
const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
const videoEl = document.getElementById('video');
const downsampleCanvas = document.createElement('canvas');
const downsampleCtx = downsampleCanvas.getContext('2d');
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d');

const TAB_IDS = ['main', 'mosaic', 'glitch', 'aurora', 'particle', 'audio', 'nebula', 'wave', 'api', 'color', 'bloom', 'edge', 'ai'];
const tabButtons = document.querySelectorAll('.mode-tabs .tab');
const controlGroups = document.querySelectorAll('.control-group');
const statusText = document.getElementById('statusText');
const fpsText = document.getElementById('fpsText');
const infoTooltip = document.getElementById('infoTooltip');
const filterApplyButtons = document.querySelectorAll('.apply-filter');

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
  resetAll: document.getElementById('resetAll'),
  photoPreset: document.getElementById('photoPreset'),
  photoAspect: document.getElementById('photoAspect'),
  photoWidth: document.getElementById('photoWidth'),
  photoHeight: document.getElementById('photoHeight'),
  photoSummary: document.getElementById('photoSummary'),
  videoPreset: document.getElementById('videoPreset'),
  videoAspect: document.getElementById('videoAspect'),
  videoWidth: document.getElementById('videoWidth'),
  videoHeight: document.getElementById('videoHeight'),
  videoFps: document.getElementById('videoFps'),
  videoBitrate: document.getElementById('videoBitrate'),
  videoSummary: document.getElementById('videoSummary')
};

const glitchControls = {
  intensity: document.getElementById('glitchIntensity'),
  scanline: document.getElementById('glitchScanline')
};

const auroraControls = {
  bloom: document.getElementById('auroraBloom'),
  drift: document.getElementById('auroraDrift')
};

const nebulaControls = {
  density: document.getElementById('nebulaDensity'),
  densityNumber: document.getElementById('nebulaDensityNumber'),
  swirl: document.getElementById('nebulaSwirl'),
  swirlNumber: document.getElementById('nebulaSwirlNumber'),
  speed: document.getElementById('nebulaSpeed'),
  speedNumber: document.getElementById('nebulaSpeedNumber'),
  palette: document.getElementById('nebulaPalette')
};

const waveControls = {
  amplitude: document.getElementById('waveAmplitude'),
  amplitudeNumber: document.getElementById('waveAmplitudeNumber'),
  frequency: document.getElementById('waveFrequency'),
  frequencyNumber: document.getElementById('waveFrequencyNumber'),
  hue: document.getElementById('waveHue'),
  hueNumber: document.getElementById('waveHueNumber')
};

const particleControls = {
  count: document.getElementById('particleCount'),
  countNumber: document.getElementById('particleCountNumber'),
  speed: document.getElementById('particleSpeed'),
  speedNumber: document.getElementById('particleSpeedNumber'),
  shape: document.getElementById('particleShape'),
  trail: document.getElementById('particleTrail'),
  palette: document.getElementById('particlePalette')
};

const mosaicFilterControls = {
  density: document.getElementById('mosaicFilterDensity'),
  densityNumber: document.getElementById('mosaicFilterDensityNumber'),
  shape: document.getElementById('mosaicFilterShape'),
  shapeNumber: document.getElementById('mosaicFilterShapeNumber'),
  palette: document.getElementById('mosaicFilterPalette'),
  paletteNumber: document.getElementById('mosaicFilterPaletteNumber')
};

const apiControls = {
  fetchApod: document.getElementById('apiFetchApod'),
  fetchPicsum: document.getElementById('apiFetchPicsum'),
  fetchArt: document.getElementById('apiFetchArt'),
  fetchDog: document.getElementById('apiFetchDog'),
  fetchPalette: document.getElementById('apiFetchPalette'),
  applyPalette: document.getElementById('apiApplyPalette'),
  status: document.getElementById('apiStatus'),
  preview: document.getElementById('apiPreview')
};

const aiState = {
  palette: []
};

const audioControls = {
  file: document.getElementById('audioFile'),
  play: document.getElementById('audioPlay'),
  stop: document.getElementById('audioStop'),
  target: document.getElementById('audioTarget'),
  smoothing: document.getElementById('audioSmoothing'),
  smoothingNumber: document.getElementById('audioSmoothingNumber'),
  level: document.getElementById('audioLevel'),
  mosaicSize: document.getElementById('audioMosaicSize'),
  mosaicSizeNumber: document.getElementById('audioMosaicSizeNumber'),
  mosaicJitter: document.getElementById('audioMosaicJitter'),
  mosaicJitterNumber: document.getElementById('audioMosaicJitterNumber'),
  mosaicHue: document.getElementById('audioMosaicHue'),
  mosaicHueNumber: document.getElementById('audioMosaicHueNumber'),
  mosaicSaturation: document.getElementById('audioMosaicSaturation'),
  mosaicSaturationNumber: document.getElementById('audioMosaicSaturationNumber'),
  auroraBloom: document.getElementById('audioAuroraBloom'),
  auroraBloomNumber: document.getElementById('audioAuroraBloomNumber'),
  auroraDrift: document.getElementById('audioAuroraDrift'),
  auroraDriftNumber: document.getElementById('audioAuroraDriftNumber'),
  auroraHue: document.getElementById('audioAuroraHue'),
  auroraHueNumber: document.getElementById('audioAuroraHueNumber'),
  glitchIntensity: document.getElementById('audioGlitchIntensity'),
  glitchIntensityNumber: document.getElementById('audioGlitchIntensityNumber'),
  glitchBands: document.getElementById('audioGlitchBands'),
  glitchBandsNumber: document.getElementById('audioGlitchBandsNumber'),
  glitchColor: document.getElementById('audioGlitchColor'),
  glitchColorNumber: document.getElementById('audioGlitchColorNumber'),
  particleBurst: document.getElementById('audioParticleBurst'),
  particleBurstNumber: document.getElementById('audioParticleBurstNumber'),
  nebulaGlow: document.getElementById('audioNebulaGlow'),
  nebulaGlowNumber: document.getElementById('audioNebulaGlowNumber'),
  waveAmplitude: document.getElementById('audioWaveAmplitude'),
  waveAmplitudeNumber: document.getElementById('audioWaveAmplitudeNumber'),
  colorVibrance: document.getElementById('audioColorVibrance'),
  colorVibranceNumber: document.getElementById('audioColorVibranceNumber'),
  bloomPulse: document.getElementById('audioBloomPulse'),
  bloomPulseNumber: document.getElementById('audioBloomPulseNumber'),
  edgeBoost: document.getElementById('audioEdgeBoost'),
  edgeBoostNumber: document.getElementById('audioEdgeBoostNumber'),
  apiMix: document.getElementById('audioApiMix'),
  apiMixNumber: document.getElementById('audioApiMixNumber'),
  aiMotion: document.getElementById('audioAiMotion'),
  aiMotionNumber: document.getElementById('audioAiMotionNumber')
};

const colorGradeControls = {
  brightness: document.getElementById('colorBrightness'),
  brightnessNumber: document.getElementById('colorBrightnessNumber'),
  contrast: document.getElementById('colorContrast'),
  contrastNumber: document.getElementById('colorContrastNumber'),
  saturation: document.getElementById('colorSaturation'),
  saturationNumber: document.getElementById('colorSaturationNumber'),
  hue: document.getElementById('colorHue'),
  hueNumber: document.getElementById('colorHueNumber')
};

const bloomControls = {
  threshold: document.getElementById('bloomThreshold'),
  thresholdNumber: document.getElementById('bloomThresholdNumber'),
  intensity: document.getElementById('bloomIntensity'),
  intensityNumber: document.getElementById('bloomIntensityNumber'),
  radius: document.getElementById('bloomRadius'),
  radiusNumber: document.getElementById('bloomRadiusNumber')
};

const edgeControls = {
  strength: document.getElementById('edgeStrength'),
  strengthNumber: document.getElementById('edgeStrengthNumber'),
  tint: document.getElementById('edgeTint')
};

const aiControls = {
  prompt: document.getElementById('aiPalettePrompt'),
  variation: document.getElementById('aiPaletteVariation'),
  variationNumber: document.getElementById('aiPaletteVariationNumber'),
  generate: document.getElementById('aiPaletteGenerate'),
  destination: document.getElementById('aiPaletteDestination'),
  save: document.getElementById('aiPaletteSave'),
  preview: document.getElementById('aiPalettePreview')
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
  Starlight: ['#0a0c1a', '#21305a', '#3f72af', '#f1f6f9', '#ffd166'],
  Solar: ['#2b1c4b', '#5f2f88', '#ff6f61', '#ffd460', '#fff4d8'],
  Lush: ['#0a2f1f', '#145a32', '#1e8f4d', '#6ed972', '#c7f9cc'],
  Dreamscape: ['#1b1d3c', '#3a3e7b', '#6a5acd', '#b69bff', '#f5eaff'],
  Cyberwave: ['#01012b', '#0a0a6a', '#5f2eea', '#ff3ec9', '#ffd33d']
};

const particlePalettes = {
  aurora: ['#112240', '#1e4676', '#33a1c9', '#7ef5ff', '#d4fbff'],
  starlight: ['#0b0f1f', '#1f2a4f', '#4f5fa8', '#f5f7ff', '#ffd6ff'],
  voltage: ['#070912', '#00ffc6', '#00a6ff', '#ffd300', '#ff4ecd'],
  sunrise: ['#140818', '#ff6a3d', '#ffd166', '#ffe9c7', '#6df0ff']
};

const chaosPresets = {
  Tranquil: { jitter: 0.4, motion: 0.8, dither: true, glimmer: false },
  Pulse: { jitter: 1.2, motion: 2.5, dither: true, glimmer: false },
  Aurora: { jitter: 0.6, motion: 4, dither: true, glimmer: true },
  Sparkstorm: { jitter: 2.1, motion: 6, dither: true, glimmer: false },
  Glimmer: { jitter: 1.6, motion: 3.3, dither: true, glimmer: true },
  Hyperdrive: { jitter: 2.8, motion: 8, dither: false, glimmer: false },
  Nova: { jitter: 2.2, motion: 5.2, dither: true, glimmer: true },
  Cascade: { jitter: 0.9, motion: 4.5, dither: true, glimmer: false }
};

const shapeLibrary = createShapeLibrary();
const particleRenderer = createParticleRenderer(shapeLibrary);
let activeTab = 'main';
let previewActive = true;
let editMode = false;
let editingIndex = -1;
let mediaRecorder = null;
let recordedChunks = [];
let lastSource = 'none';
let frameSeedOffset = 0;
let lastFrameTime = 0;
let fpsSamples = [];

const particleState = {
  particles: [],
  count: 4000,
  speed: 1.2,
  shapeName: 'mix',
  palette: 'aurora',
  trails: true,
  lastTime: 0,
  customPalette: []
};

const nebulaState = {
  cloud: [],
  density: 6000,
  swirl: 1.2,
  speed: 0.8,
  palette: 'aurora',
  lastSeed: null,
  customPalette: []
};

const waveState = {
  amplitude: 24,
  frequency: 1.8,
  hue: 180,
  phase: 0,
  customPalette: []
};

const apiState = {
  palette: [],
  apod: null,
  picsum: null,
  art: null,
  dog: null
};

const audioState = {
  context: null,
  analyser: null,
  source: null,
  buffer: null,
  freqData: null,
  waveData: null,
  running: false,
  level: 0,
  bass: 0,
  treble: 0,
  target: 'mosaic',
  smoothing: 0.75,
  config: {
    mosaic: { size: 0.6, jitter: 0.9, hue: 45, saturation: 0.4 },
    aurora: { bloom: 1.2, drift: 1.4, hue: 90 },
    glitch: { intensity: 0.8, bands: 80, color: 0.35 },
    particle: { burst: 1 },
    nebula: { glow: 1.2 },
    wave: { amplitude: 1 },
    color: { vibrance: 0.6 },
    bloom: { pulse: 1.1 },
    edge: { boost: 0.8 },
    api: { mix: 0.9 },
    ai: { motion: 0.7 }
  }
};

const state = {
  mode: 'uniform',
  seed: hashSeed(String(Date.now())),
  palette: [...palettePresets['Warm']],
  lastStillFrame: 0,
  stillMotionPhase: 0,
  videoActive: false,
  sampleWidth: 640,
  sampleHeight: 360,
  particles: [],
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
  randomSize: 8,
  outputs: {
    photo: { width: 3000, height: 3000, aspect: 'source', preset: 'square' },
    video: { width: 1920, height: 1080, aspect: 'source', fps: 60, bitrate: 20, preset: 'hd' }
  },
  appliedFilters: {},
  filterSequence: []
};

const filterState = {
  preview: {}
};

const baseFrameCanvas = document.createElement('canvas');
const baseFrameCtx = baseFrameCanvas.getContext('2d');

const FILTER_ORDER = ['mosaic', 'color', 'glitch', 'aurora', 'particle', 'nebula', 'wave', 'bloom', 'edge', 'api', 'ai', 'audio'];
const FILTER_TABS = new Set(TAB_IDS.filter((id) => id !== 'main'));

const filterDefinitions = {
  mosaic: {
    collect: collectMosaicFilter,
    apply: applyMosaicOverlay
  },
  color: {
    collect: collectColorGrade,
    apply: applyColorGrade
  },
  glitch: {
    collect: collectGlitchFilter,
    apply: applyGlitchEffect
  },
  aurora: {
    collect: collectAuroraFilter,
    apply: applyAuroraOverlay
  },
  particle: {
    collect: collectParticleFilter,
    apply: applyParticleOverlay
  },
  nebula: {
    collect: collectNebulaFilter,
    apply: applyNebulaOverlay
  },
  wave: {
    collect: collectWaveFilter,
    apply: applyWaveOverlay
  },
  bloom: {
    collect: collectBloomFilter,
    apply: applyBloomEffect
  },
  edge: {
    collect: collectEdgeFilter,
    apply: applyEdgeEffect
  },
  api: {
    collect: collectApiFilter,
    apply: applyApiOverlay
  },
  ai: {
    collect: collectAiFilter,
    apply: applyAIPaletteOverlay
  },
  audio: {
    collect: collectAudioFilter,
    apply: applyAudioFilter
  }
};

const layoutModeInputs = document.querySelectorAll('input[name="layoutMode"]');

init();

function init() {
  initTabs();
  initControls();
  initParticleControls();
  initNebulaControls();
  initWaveControls();
  initApiControls();
  initAudioControls();
  initFilterPanels();
  initApplyButtons();
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
  if (tabId === 'main') {
    filterState.preview = {};
    queueRender(true);
  } else if (tabId === 'api') {
    refreshApiPreview();
    previewFilter('api');
  } else if (FILTER_TABS.has(tabId)) {
    previewFilter(tabId);
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
    seedParticleField(true);
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

  mosaicControls.photoPreset.addEventListener('change', handlePhotoPreset);
  mosaicControls.photoAspect.addEventListener('change', () => updatePhotoOutput());
  mosaicControls.photoWidth.addEventListener('change', () => updatePhotoOutput());
  mosaicControls.photoHeight.addEventListener('change', () => updatePhotoOutput());

  mosaicControls.videoPreset.addEventListener('change', handleVideoPreset);
  mosaicControls.videoAspect.addEventListener('change', () => updateVideoOutput());
  mosaicControls.videoWidth.addEventListener('change', () => updateVideoOutput());
  mosaicControls.videoHeight.addEventListener('change', () => updateVideoOutput());
  mosaicControls.videoFps.addEventListener('change', () => updateVideoOutput());
  mosaicControls.videoBitrate.addEventListener('change', () => updateVideoOutput());

  updatePhotoOutput(true);
  updateVideoOutput(true);

  glitchControls.intensity.addEventListener('input', () => previewFilter('glitch'));
  glitchControls.scanline.addEventListener('change', () => previewFilter('glitch'));

  const auroraRefresh = () => previewFilter('aurora');
  auroraControls.bloom.addEventListener('input', auroraRefresh);
  auroraControls.drift.addEventListener('input', auroraRefresh);

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('resize', handleResize);
  updateSizeControlMode(state.mode);
  handleResize();
}

function handlePhotoPreset() {
  const preset = mosaicControls.photoPreset.value;
  const source = getSourceDimensions();
  let width = state.outputs.photo.width;
  let height = state.outputs.photo.height;
  let aspect = mosaicControls.photoAspect.value;
  if (preset === 'source') {
    width = source.width;
    height = source.height;
    aspect = 'source';
  } else if (preset === 'square') {
    width = 3000;
    height = 3000;
    aspect = '1:1';
  } else if (preset === 'portrait') {
    width = 3000;
    height = 4500;
    aspect = '2:3';
  } else if (preset === 'landscape') {
    width = 4500;
    height = 3000;
    aspect = '3:2';
  }
  mosaicControls.photoWidth.value = Math.round(width);
  mosaicControls.photoHeight.value = Math.round(height);
  mosaicControls.photoAspect.value = aspect;
  updatePhotoOutput(false, true);
}

function updatePhotoOutput(initial = false, fromPreset = false) {
  const width = clamp(parseInt(mosaicControls.photoWidth.value, 10) || 3000, 512, 8000);
  const height = clamp(parseInt(mosaicControls.photoHeight.value, 10) || 3000, 512, 8000);
  const aspect = mosaicControls.photoAspect.value;
  mosaicControls.photoWidth.value = width;
  mosaicControls.photoHeight.value = height;
  state.outputs.photo = {
    width,
    height,
    aspect,
    preset: mosaicControls.photoPreset.value
  };
  mosaicControls.photoSummary.textContent = `${width.toLocaleString()} × ${height.toLocaleString()} px`;
  if (!initial && !fromPreset && mosaicControls.photoPreset.value !== 'custom') {
    mosaicControls.photoPreset.value = 'custom';
    state.outputs.photo.preset = 'custom';
  }
}

function handleVideoPreset() {
  const preset = mosaicControls.videoPreset.value;
  const source = getSourceDimensions();
  let width = state.outputs.video.width;
  let height = state.outputs.video.height;
  let aspect = mosaicControls.videoAspect.value;
  let fps = state.outputs.video.fps;
  let bitrate = state.outputs.video.bitrate;
  if (preset === 'source') {
    width = source.width;
    height = source.height;
    aspect = 'source';
  } else if (preset === 'hd') {
    width = 1920;
    height = 1080;
    aspect = '16:9';
    fps = 60;
    bitrate = 20;
  } else if (preset === 'square') {
    width = 1080;
    height = 1080;
    aspect = '1:1';
  } else if (preset === 'portrait') {
    width = 1080;
    height = 1920;
    aspect = '9:16';
  } else if (preset === 'cinema') {
    width = 3840;
    height = 1600;
    aspect = '12:5';
    fps = 48;
    bitrate = 35;
  }
  mosaicControls.videoWidth.value = Math.round(width);
  mosaicControls.videoHeight.value = Math.round(height);
  mosaicControls.videoAspect.value = aspect;
  mosaicControls.videoFps.value = fps;
  mosaicControls.videoBitrate.value = bitrate;
  updateVideoOutput(false, true);
}

function updateVideoOutput(initial = false, fromPreset = false) {
  const width = clamp(parseInt(mosaicControls.videoWidth.value, 10) || 1920, 640, 7680);
  const height = clamp(parseInt(mosaicControls.videoHeight.value, 10) || 1080, 640, 7680);
  const aspect = mosaicControls.videoAspect.value;
  const fps = clamp(parseInt(mosaicControls.videoFps.value, 10) || 60, 12, 240);
  const bitrate = clamp(parseInt(mosaicControls.videoBitrate.value, 10) || 20, 5, 150);
  mosaicControls.videoWidth.value = width;
  mosaicControls.videoHeight.value = height;
  mosaicControls.videoFps.value = fps;
  mosaicControls.videoBitrate.value = bitrate;
  state.outputs.video = {
    width,
    height,
    aspect,
    fps,
    bitrate,
    preset: mosaicControls.videoPreset.value
  };
  mosaicControls.videoSummary.textContent = `${width.toLocaleString()} × ${height.toLocaleString()} @ ${fps} fps • ${bitrate} Mbps`;
  if (!initial && !fromPreset && mosaicControls.videoPreset.value !== 'custom') {
    mosaicControls.videoPreset.value = 'custom';
    state.outputs.video.preset = 'custom';
  }
}

function initParticleControls() {
  if (!particleRenderer) {
    particleControls.count.disabled = true;
    particleControls.countNumber.disabled = true;
    particleControls.speed.disabled = true;
    particleControls.speedNumber.disabled = true;
    particleControls.shape.disabled = true;
    particleControls.trail.disabled = true;
    particleControls.palette.disabled = true;
    setStatus('WebGL unavailable – particle lab offline');
    return;
  }
  const shapeKeys = Object.keys(shapeLibrary);
  particleControls.shape.innerHTML = '';
  const matchOption = document.createElement('option');
  matchOption.value = 'match';
  matchOption.textContent = 'Match Mosaic Shape';
  particleControls.shape.append(matchOption);
  const mixOption = document.createElement('option');
  mixOption.value = 'mix';
  mixOption.textContent = 'Cycle Shapes';
  particleControls.shape.append(mixOption);
  shapeKeys.forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    particleControls.shape.append(opt);
  });
  particleControls.shape.value = 'mix';
  particleState.shapeName = 'mix';

  linkSliderNumber(particleControls.count, particleControls.countNumber, (value) => {
    particleState.count = parseInt(value, 10);
    seedParticleField(true);
    if (activeTab === 'particle') {
      previewFilter('particle');
    }
  });
  linkSliderNumber(particleControls.speed, particleControls.speedNumber, (value) => {
    particleState.speed = parseFloat(value);
    if (activeTab === 'particle') {
      previewFilter('particle');
    }
  });

  particleControls.shape.addEventListener('change', () => {
    particleState.shapeName = particleControls.shape.value;
    seedParticleField(true);
    if (activeTab === 'particle') {
      previewFilter('particle');
    }
  });
  particleControls.trail.addEventListener('change', () => {
    particleState.trails = particleControls.trail.checked;
    if (activeTab === 'particle') {
      previewFilter('particle');
    }
  });
  particleControls.palette.addEventListener('change', () => {
    particleState.palette = particleControls.palette.value;
    if (activeTab === 'particle') {
      previewFilter('particle');
    }
  });

  seedParticleField(true);
}

function initNebulaControls() {
  if (!nebulaControls.density) return;
  linkSliderNumber(nebulaControls.density, nebulaControls.densityNumber, (value) => {
    nebulaState.density = clamp(parseInt(value, 10), 100, 24000);
    nebulaState.cloud = [];
    if (activeTab === 'nebula') {
      previewFilter('nebula');
    }
  });
  linkSliderNumber(nebulaControls.swirl, nebulaControls.swirlNumber, (value) => {
    nebulaState.swirl = parseFloat(value);
    if (activeTab === 'nebula') {
      previewFilter('nebula');
    }
  });
  linkSliderNumber(nebulaControls.speed, nebulaControls.speedNumber, (value) => {
    nebulaState.speed = parseFloat(value);
  });
  nebulaControls.palette.addEventListener('change', () => {
    nebulaState.palette = nebulaControls.palette.value;
    nebulaState.cloud = [];
    if (activeTab === 'nebula') {
      previewFilter('nebula');
    }
  });
}

function initWaveControls() {
  if (!waveControls.amplitude) return;
  linkSliderNumber(waveControls.amplitude, waveControls.amplitudeNumber, (value) => {
    waveState.amplitude = parseFloat(value);
  });
  linkSliderNumber(waveControls.frequency, waveControls.frequencyNumber, (value) => {
    waveState.frequency = parseFloat(value);
  });
  linkSliderNumber(waveControls.hue, waveControls.hueNumber, (value) => {
    waveState.hue = parseFloat(value);
  });
}

function initApiControls() {
  apiControls.fetchApod.addEventListener('click', fetchApodImage);
  apiControls.fetchPicsum.addEventListener('click', fetchPicsumImage);
  apiControls.fetchArt.addEventListener('click', fetchArtImage);
  apiControls.fetchDog.addEventListener('click', fetchDogImage);
  apiControls.fetchPalette.addEventListener('click', fetchRemotePalette);
  apiControls.applyPalette.addEventListener('click', applyRemotePalette);
  refreshApiPreview();
}

function initAudioControls() {
  if (!audioControls.file) return;
  audioControls.file.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await loadAudioFile(file);
  });
  audioControls.play.addEventListener('click', startAudioPlayback);
  audioControls.stop.addEventListener('click', stopAudioPlayback);
  audioControls.target.addEventListener('change', () => {
    audioState.target = audioControls.target.value;
    updateAudioTargetGroups();
    if (activeTab === 'audio') {
      if (audioState.target === 'mosaic') {
        queueRender(true);
      } else if (audioState.target === 'aurora') {
        renderAurora();
      } else if (audioState.target === 'glitch') {
        renderGlitch();
      }
    }
  });

  linkSliderNumber(audioControls.smoothing, audioControls.smoothingNumber, (value) => {
    audioState.smoothing = clamp(parseFloat(value), 0, 0.95);
    if (audioState.analyser) {
      audioState.analyser.smoothingTimeConstant = audioState.smoothing;
    }
  });
  linkSliderNumber(audioControls.mosaicSize, audioControls.mosaicSizeNumber, (value) => {
    audioState.config.mosaic.size = parseFloat(value);
    if (audioState.target === 'mosaic') queueRender(true);
  });
  linkSliderNumber(audioControls.mosaicJitter, audioControls.mosaicJitterNumber, (value) => {
    audioState.config.mosaic.jitter = parseFloat(value);
    if (audioState.target === 'mosaic') queueRender(true);
  });
  linkSliderNumber(audioControls.mosaicHue, audioControls.mosaicHueNumber, (value) => {
    audioState.config.mosaic.hue = parseFloat(value);
    if (audioState.target === 'mosaic') queueRender(true);
  });
  linkSliderNumber(audioControls.mosaicSaturation, audioControls.mosaicSaturationNumber, (value) => {
    audioState.config.mosaic.saturation = parseFloat(value);
    if (audioState.target === 'mosaic') queueRender(true);
  });
  linkSliderNumber(audioControls.auroraBloom, audioControls.auroraBloomNumber, (value) => {
    audioState.config.aurora.bloom = parseFloat(value);
    if (audioState.target === 'aurora') renderAurora();
  });
  linkSliderNumber(audioControls.auroraDrift, audioControls.auroraDriftNumber, (value) => {
    audioState.config.aurora.drift = parseFloat(value);
    if (audioState.target === 'aurora') renderAurora();
  });
  linkSliderNumber(audioControls.auroraHue, audioControls.auroraHueNumber, (value) => {
    audioState.config.aurora.hue = parseFloat(value);
    if (audioState.target === 'aurora') renderAurora();
  });
  linkSliderNumber(audioControls.glitchIntensity, audioControls.glitchIntensityNumber, (value) => {
    audioState.config.glitch.intensity = parseFloat(value);
    if (audioState.target === 'glitch') renderGlitch();
  });
  linkSliderNumber(audioControls.glitchBands, audioControls.glitchBandsNumber, (value) => {
    audioState.config.glitch.bands = parseFloat(value);
    if (audioState.target === 'glitch') renderGlitch();
  });
  linkSliderNumber(audioControls.glitchColor, audioControls.glitchColorNumber, (value) => {
    audioState.config.glitch.color = parseFloat(value);
    if (audioState.target === 'glitch') renderGlitch();
  });

  linkSliderNumber(audioControls.particleBurst, audioControls.particleBurstNumber, (value) => {
    audioState.config.particle.burst = parseFloat(value);
    if (audioState.target === 'particle') previewFilter('particle');
  });
  linkSliderNumber(audioControls.nebulaGlow, audioControls.nebulaGlowNumber, (value) => {
    audioState.config.nebula.glow = parseFloat(value);
    if (audioState.target === 'nebula') previewFilter('nebula');
  });
  linkSliderNumber(audioControls.waveAmplitude, audioControls.waveAmplitudeNumber, (value) => {
    audioState.config.wave.amplitude = parseFloat(value);
    if (audioState.target === 'wave') previewFilter('wave');
  });
  linkSliderNumber(audioControls.colorVibrance, audioControls.colorVibranceNumber, (value) => {
    audioState.config.color.vibrance = parseFloat(value);
    if (audioState.target === 'color') previewFilter('color');
  });
  linkSliderNumber(audioControls.bloomPulse, audioControls.bloomPulseNumber, (value) => {
    audioState.config.bloom.pulse = parseFloat(value);
    if (audioState.target === 'bloom') previewFilter('bloom');
  });
  linkSliderNumber(audioControls.edgeBoost, audioControls.edgeBoostNumber, (value) => {
    audioState.config.edge.boost = parseFloat(value);
    if (audioState.target === 'edge') previewFilter('edge');
  });
  linkSliderNumber(audioControls.apiMix, audioControls.apiMixNumber, (value) => {
    audioState.config.api.mix = parseFloat(value);
    if (audioState.target === 'api') previewFilter('api');
  });
  linkSliderNumber(audioControls.aiMotion, audioControls.aiMotionNumber, (value) => {
    audioState.config.ai.motion = parseFloat(value);
    if (audioState.target === 'ai') previewFilter('ai');
  });

  updateAudioTargetGroups();
}

function initFilterPanels() {
  if (mosaicFilterControls.density) {
    linkSliderNumber(mosaicFilterControls.density, mosaicFilterControls.densityNumber, () => previewFilter('mosaic'));
    linkSliderNumber(mosaicFilterControls.shape, mosaicFilterControls.shapeNumber, () => previewFilter('mosaic'));
    linkSliderNumber(mosaicFilterControls.palette, mosaicFilterControls.paletteNumber, () => previewFilter('mosaic'));
  }
  if (colorGradeControls.brightness) {
    linkSliderNumber(colorGradeControls.brightness, colorGradeControls.brightnessNumber, () => previewFilter('color'));
    linkSliderNumber(colorGradeControls.contrast, colorGradeControls.contrastNumber, () => previewFilter('color'));
    linkSliderNumber(colorGradeControls.saturation, colorGradeControls.saturationNumber, () => previewFilter('color'));
    linkSliderNumber(colorGradeControls.hue, colorGradeControls.hueNumber, () => previewFilter('color'));
  }
  if (bloomControls.threshold) {
    linkSliderNumber(bloomControls.threshold, bloomControls.thresholdNumber, () => previewFilter('bloom'));
    linkSliderNumber(bloomControls.intensity, bloomControls.intensityNumber, () => previewFilter('bloom'));
    linkSliderNumber(bloomControls.radius, bloomControls.radiusNumber, () => previewFilter('bloom'));
  }
  if (edgeControls.strength) {
    linkSliderNumber(edgeControls.strength, edgeControls.strengthNumber, () => previewFilter('edge'));
    edgeControls.tint.addEventListener('input', () => previewFilter('edge'));
  }
  if (aiControls.variation) {
    linkSliderNumber(aiControls.variation, aiControls.variationNumber, () => {
      if (activeTab === 'ai' && aiState.palette.length) {
        previewFilter('ai');
      }
    });
    if (aiControls.prompt) {
      aiControls.prompt.addEventListener('input', () => {
        aiControls.save.disabled = true;
      });
    }
    if (aiControls.generate) {
      aiControls.generate.addEventListener('click', () => {
        const prompt = aiControls.prompt?.value || '';
        const variation = parseFloat(aiControls.variation.value) || 0;
        aiState.palette = generatePaletteFromPrompt(prompt, variation);
        renderAIPalettePreview();
        aiControls.save.disabled = aiState.palette.length === 0;
        setStatus('AI palette ready');
        previewFilter('ai');
      });
    }
    if (aiControls.save) {
      aiControls.save.addEventListener('click', handleAIPaletteSave);
    }
  }
}

function initApplyButtons() {
  filterApplyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      if (!filter) return;
      applyFilterToMain(filter);
    });
  });
}

async function loadAudioFile(file) {
  try {
    stopAudioPlayback();
    if (!audioState.context) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioState.context = new AudioCtx();
    }
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioState.context.decodeAudioData(arrayBuffer);
    audioState.buffer = audioBuffer;
    audioControls.play.disabled = false;
    audioControls.stop.disabled = true;
    setStatus(`Audio loaded: ${file.name}`);
  } catch (error) {
    setStatus(`Audio load failed: ${error.message}`);
    audioControls.play.disabled = true;
    audioControls.stop.disabled = true;
  }
}

async function startAudioPlayback() {
  if (!audioState.buffer) return;
  try {
    if (!audioState.context) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioState.context = new AudioCtx();
    }
    if (audioState.context.state === 'suspended') {
      await audioState.context.resume();
    }
    stopAudioPlayback();
    const source = audioState.context.createBufferSource();
    source.buffer = audioState.buffer;
    source.loop = true;
    const analyser = audioState.analyser || audioState.context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = audioState.smoothing;
    const gain = audioState.context.createGain();
    gain.gain.value = 1;
    source.connect(analyser);
    analyser.connect(gain);
    gain.connect(audioState.context.destination);
    source.start(0);
    audioState.source = source;
    audioState.analyser = analyser;
    audioState.freqData = new Uint8Array(analyser.frequencyBinCount);
    audioState.waveData = new Uint8Array(analyser.fftSize);
    audioState.running = true;
    audioControls.play.disabled = true;
    audioControls.stop.disabled = false;
    setStatus('Audio playback started');
  } catch (error) {
    setStatus(`Audio playback failed: ${error.message}`);
    audioControls.play.disabled = !audioState.buffer;
    audioControls.stop.disabled = true;
  }
}

function stopAudioPlayback() {
  const wasRunning = audioState.running;
  if (audioState.source) {
    try {
      audioState.source.stop();
    } catch (error) {
      console.warn('Audio stop error', error);
    }
    audioState.source.disconnect();
    audioState.source = null;
  }
  audioState.running = false;
  audioState.level = 0;
  audioState.bass = 0;
  audioState.treble = 0;
  if (audioControls.play) {
    audioControls.play.disabled = !audioState.buffer;
  }
  if (audioControls.stop) {
    audioControls.stop.disabled = true;
  }
  if (wasRunning) {
    setStatus('Audio playback stopped');
  }
}

function updateAudioTargetGroups() {
  const target = audioState.target;
  document.querySelectorAll('.audio-filter-group').forEach((group) => {
    const filter = group.getAttribute('data-audio-filter');
    group.toggleAttribute('hidden', filter !== target);
  });
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
    output: 'Configure export presets for stills and video including aspect ratios, custom dimensions, frame rate, and bitrate.',
    mosaicfilter: 'Blend density, edge overlays, and hue shifts on top of the main mosaic without regenerating geometry.',
    glitch: 'Glitch Forge slices frames into displaced bands, with optional scanlines, ready to snap back into the Mosaic lab.',
    aurora: 'Aurora Synth paints bloom-heavy ribbons and drift, useful for ambient backgrounds that can feed the Mosaic renderer.',
    particle: 'Particle Lab uses GPU instancing to animate thousands of shapes as living particles—tune count, drift, palette, and capture keyframes.',
    nebula: 'Nebula Weave builds a GPU particle galaxy from your palette—tune density, swirl, and speed to breathe motion into stills.',
    wave: 'Wave Lab ripples particles across the canvas using sine-driven displacement for liquid, glimmering mosaics.',
    api: 'API Fusion pulls NASA APOD, Picsum landscapes, Art Institute paintings, dog photography, and remote palettes into the studio for instant remixes.',
    audio: 'Audio Reactor syncs beats to your visuals—upload a track and drive mosaic, aurora, or glitch parameters with per-effect controls.',
    colorgrade: 'Adjust brightness, contrast, saturation, and hue as a post effect layered on the main mosaic output.',
    bloom: 'Bloom Forge isolates bright regions, blurs them, and screens the glow back in for cinematic highlights.',
    edge: 'Edge Sketch extracts contours with a Sobel filter and tints them to emphasize structure.',
    aipal: 'Describe a mood and generate AI-inspired palettes, then store them for the main or filter tabs.'
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
    const target = e.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT')
    ) {
      return;
    }
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

function formatFilterName(id) {
  return id
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function ensureSelectOption(select, value, label, beforeValue = null) {
  if (!select) return null;
  const existing = Array.from(select.options).find((opt) => opt.value === value);
  if (existing) {
    existing.textContent = label;
    return existing;
  }
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  if (beforeValue) {
    const before = Array.from(select.options).find((opt) => opt.value === beforeValue);
    if (before) {
      select.insertBefore(option, before);
      return option;
    }
  }
  select.appendChild(option);
  return option;
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

async function handleFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    await setSourceToImage(file);
    setStatus(`Loaded ${file.name}`);
  } catch (error) {
    setStatus(`Image failed: ${error.message}`);
  }
}

async function setSourceToImage(file) {
  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);
  transferImageToSample(img);
}

function handleResize() {
  const wrapper = document.querySelector('.aspect-wrapper');
  const rect = wrapper.getBoundingClientRect();
  const targetRatio = determineAspectRatio();
  let width = Math.max(1, rect.width - 20);
  let height = Math.max(1, rect.height - 20);
  if (targetRatio) {
    if (width / height > targetRatio) {
      width = height * targetRatio;
    } else {
      height = width / targetRatio;
    }
  }
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const displayWidth = Math.max(1, Math.round(width));
  const displayHeight = Math.max(1, Math.round(height));
  const pixelWidth = Math.max(1, Math.round(displayWidth * dpr));
  const pixelHeight = Math.max(1, Math.round(displayHeight * dpr));
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  if (activeTab === 'main') {
    queueRender();
  } else if (FILTER_TABS.has(activeTab)) {
    previewFilter(activeTab);
  }
}

function getCanvasScale() {
  const displayWidth = canvas.clientWidth || 1;
  const displayHeight = canvas.clientHeight || 1;
  return {
    x: canvas.width / displayWidth,
    y: canvas.height / displayHeight
  };
}

function determineAspectRatio() {
  const value = mosaicControls.aspectSelect.value;
  if (value === 'source') {
    const dims = getSourceDimensions();
    return dims.width / dims.height;
  }
  const [w, h] = value.split(':').map(Number);
  return w / h;
}

function getSourceDimensions() {
  if (state.videoActive && videoEl.videoWidth && videoEl.videoHeight) {
    return { width: videoEl.videoWidth, height: videoEl.videoHeight };
  }
  if (sampleCanvas.width && sampleCanvas.height) {
    return { width: sampleCanvas.width, height: sampleCanvas.height };
  }
  return { width: canvas.width || 1920, height: canvas.height || 1080 };
}

function updateAudioAnalysis() {
  if (!audioState.analyser || !audioState.running) {
    audioState.level = 0;
    audioState.bass = 0;
    audioState.treble = 0;
    if (audioControls.level) {
      audioControls.level.textContent = '0.00';
    }
    return;
  }
  const analyser = audioState.analyser;
  if (!audioState.freqData || audioState.freqData.length !== analyser.frequencyBinCount) {
    audioState.freqData = new Uint8Array(analyser.frequencyBinCount);
  }
  if (!audioState.waveData || audioState.waveData.length !== analyser.fftSize) {
    audioState.waveData = new Uint8Array(analyser.fftSize);
  }
  analyser.smoothingTimeConstant = audioState.smoothing;
  analyser.getByteFrequencyData(audioState.freqData);
  analyser.getByteTimeDomainData(audioState.waveData);
  const len = audioState.freqData.length;
  let sum = 0;
  let low = 0;
  let high = 0;
  const lowCount = Math.max(1, Math.floor(len * 0.2));
  const highStart = Math.floor(len * 0.65);
  for (let i = 0; i < len; i++) {
    const value = audioState.freqData[i] / 255;
    sum += value;
    if (i < lowCount) {
      low += value;
    }
    if (i >= highStart) {
      high += value;
    }
  }
  audioState.level = clamp(sum / Math.max(1, len), 0, 1);
  audioState.bass = clamp(low / lowCount, 0, 1);
  audioState.treble = clamp(high / Math.max(1, len - highStart), 0, 1);
  if (audioControls.level) {
    audioControls.level.textContent = audioState.level.toFixed(2);
  }
}

function queueRender(force = false) {
  const shouldForce = force || activeTab !== 'main';
  renderMosaic(shouldForce);
}

function tick(ts) {
  updateAudioAnalysis();
  if (activeTab === 'main') {
    if (previewActive && ts - lastFrameTime > 1000 / 60) {
      renderMosaic();
      lastFrameTime = ts;
    }
  } else if (activeTab === 'audio') {
    renderAudioDriven(ts);
  } else if (FILTER_TABS.has(activeTab)) {
    previewFilter(activeTab, ts);
  }
  updateFPS(ts);
  requestAnimationFrame(tick);
}

function renderAudioDriven(ts) {
  const target = audioState.target;
  if (target === 'mosaic') {
    if (!previewActive) return;
    if (ts - lastFrameTime > 1000 / 60) {
      renderMosaic(true);
      lastFrameTime = ts;
    }
    return;
  }
  if (target === 'aurora') {
    renderAurora(ts);
    return;
  }
  if (target === 'glitch') {
    if (ts - lastFrameTime > 1000 / 60) {
      renderGlitch();
      lastFrameTime = ts;
    }
  }
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

function renderMosaic(force = false) {
  if (!force && activeTab !== 'main') return;
  const sourceAvailable = ensureSourceReady();
  if (!sourceAvailable) return;
  const sample = downsampleSource();
  const params = collectParams();
  if (editMode && state.particles.length) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawParticles(ctx, state.particles, params);
    if (params.glimmer) {
      renderGlimmer(params);
    }
    return;
  }
  const sampleFn = (x, y) => sampleColorAt(sample, x, y, params.mirror);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let particles = [];
  if (params.mode === 'uniform') {
    particles = renderUniformGrid(ctx, params, sampleFn);
  } else if (params.mode === 'random') {
    particles = renderRandomPoisson(ctx, params, sampleFn);
  } else {
    const grid = renderUniformGrid(ctx, params, sampleFn, true);
    const random = renderRandomPoisson(ctx, params, sampleFn, true);
    particles = [...grid.slice(0, Math.floor(grid.length / 2)), ...random.slice(0, Math.floor(random.length / 2))];
    drawParticles(ctx, particles, params);
  }
  if (params.glimmer) {
    renderGlimmer(params);
  }
  captureBaseFrame();
  applyFilterPipeline();
  state.particles = particles;
  mosaicControls.circleCount.textContent = particles.length.toLocaleString();
  mosaicControls.sampleResolution.textContent = `${sample.width}×${sample.height}`;
  setStatus(`Rendered ${particles.length} particles`);
}

function captureBaseFrame() {
  if (!canvas.width || !canvas.height) return;
  if (baseFrameCanvas.width !== canvas.width || baseFrameCanvas.height !== canvas.height) {
    baseFrameCanvas.width = canvas.width;
    baseFrameCanvas.height = canvas.height;
  }
  baseFrameCtx.clearRect(0, 0, baseFrameCanvas.width, baseFrameCanvas.height);
  baseFrameCtx.drawImage(canvas, 0, 0);
}

function applyFilterPipeline(overrides = null, timestamp = performance.now()) {
  if (!baseFrameCanvas.width || !baseFrameCanvas.height) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(baseFrameCanvas, 0, 0, canvas.width, canvas.height);
  const merged = { ...state.appliedFilters };
  if (!overrides && activeTab !== 'main') {
    const previewSettings = filterState.preview[activeTab];
    if (previewSettings) {
      merged[activeTab] = previewSettings;
    }
  }
  if (overrides) {
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        merged[key] = value;
      } else {
        delete merged[key];
      }
    });
  }
  FILTER_ORDER.forEach((id) => {
    const settings = merged[id];
    if (!settings) return;
    const def = filterDefinitions[id];
    if (def && typeof def.apply === 'function') {
      def.apply(ctx, baseFrameCanvas, settings, timestamp);
    }
  });
}

function previewFilter(filterId, timestamp = performance.now()) {
  if (!FILTER_TABS.has(filterId)) return;
  const def = filterDefinitions[filterId];
  if (!def || typeof def.collect !== 'function') return;
  if (!baseFrameCanvas.width || !baseFrameCanvas.height) {
    queueRender(true);
    return;
  }
  const settings = def.collect(timestamp);
  if (!settings) {
    delete filterState.preview[filterId];
    applyFilterPipeline();
    return;
  }
  filterState.preview[filterId] = settings;
  applyFilterPipeline({ [filterId]: settings }, timestamp);
}

function applyFilterToMain(filterId) {
  const def = filterDefinitions[filterId];
  if (!def || typeof def.collect !== 'function') return;
  const settings = def.collect(performance.now());
  if (!settings) {
    delete state.appliedFilters[filterId];
    state.filterSequence = state.filterSequence.filter((id) => id !== filterId);
    applyFilterPipeline();
    setStatus(`${formatFilterName(filterId)} cleared from main`);
    return;
  }
  state.appliedFilters[filterId] = settings;
  if (!state.filterSequence.includes(filterId)) {
    state.filterSequence.push(filterId);
  }
  delete filterState.preview[filterId];
  applyFilterPipeline();
  setStatus(`${formatFilterName(filterId)} applied to main`);
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
  const recordingBoost = mediaRecorder ? 1280 : 0;
  const previewBoost = previewActive ? 960 : 720;
  const maxSize = Math.max(480, recordingBoost || previewBoost);
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
  const targetCount = Math.min(parseInt(mosaicControls.countSlider.value, 10), 25000);
  let baseSize = parseFloat(mosaicControls.sizeSlider.value);
  let gamma = parseFloat(mosaicControls.gammaSlider.value);
  let jitterStrength = parseFloat(mosaicControls.jitterStrength.value);
  const palette = state.palette.map((hex) => hexToRgb(hex));
  const shape = shapeLibrary[state.shapeName];
  const outline = mosaicControls.outlineToggle.checked;
  const mirror = mosaicControls.mirrorToggle.checked;
  const dither = mosaicControls.paletteDither.checked;
  const jitterMode = mosaicControls.jitterMode.value;
  const motionDepth = parseFloat(mosaicControls.motionDepth.value);
  const chaos = chaosPresets[state.chaosMode] || chaosPresets.Tranquil;
  const audioAdjusted = applyAudioToMosaicParams({ mode, baseSize, jitterStrength, gamma });
  baseSize = audioAdjusted.baseSize;
  gamma = audioAdjusted.gamma;
  jitterStrength = audioAdjusted.jitterStrength;
  return {
    mode,
    resolution,
    targetCount,
    baseSize,
    gamma,
    jitterStrength,
    palette,
    shape,
    shapeIndex: shape?.index ?? 0,
    outline,
    mirror,
    dither,
    colorMode: state.colorMode,
    jitterMode,
    rng,
    canvasW: canvas.width,
    canvasH: canvas.height,
    motionDepth,
    chaos,
    glimmer: chaos?.glimmer,
    audioHueShift: audioAdjusted.audioHueShift,
    audioSaturationBoost: audioAdjusted.audioSaturationBoost,
    audioValueBoost: audioAdjusted.audioValueBoost
  };
}

function renderUniformGrid(context, params, sampleFn, skipDraw = false) {
  const { resolution, canvasW, canvasH, baseSize, jitterMode, jitterStrength, gamma, palette, dither, outline } = params;
  const cellW = canvasW / resolution;
  const cellH = canvasH / resolution;
  const radiusBase = Math.min(cellW, cellH) * 0.5 * baseSize;
  const particles = [];
  let idx = 0;
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const cx = x * cellW + cellW / 2;
      const cy = y * cellH + cellH / 2;
      const color = sampleFn((x + 0.5) / resolution, (y + 0.5) / resolution);
      const gammaColor = applyGamma(color, gamma);
      const finalColor = colorize(gammaColor, params, idx);
      const jitterFactor = computeJitter(jitterMode, jitterStrength, color, cx, cy, params);
      const shapeRadius = radiusBase * jitterFactor;
      particles.push({
        x: cx,
        y: cy,
        radius: shapeRadius,
        color: finalColor,
        idx,
        shapeId: params.shapeIndex,
        rotation: 0
      });
      idx++;
    }
  }
  if (!skipDraw) {
    drawParticles(context, particles, params);
  }
  return particles;
}

function applyAudioToMosaicParams(params) {
  const result = {
    baseSize: params.baseSize,
    jitterStrength: params.jitterStrength,
    gamma: params.gamma,
    audioHueShift: 0,
    audioSaturationBoost: 0,
    audioValueBoost: 0
  };
  if (!audioState.running || audioState.target !== 'mosaic') {
    return result;
  }
  const level = audioState.level;
  const bass = audioState.bass;
  const treble = audioState.treble;
  if (audioState.config.mosaic.size > 0) {
    const factor = 1 + level * audioState.config.mosaic.size;
    if (params.mode === 'uniform') {
      result.baseSize = clamp(params.baseSize * factor, 0.2, 0.9);
    } else {
      result.baseSize = clamp(params.baseSize * factor, 2, 60);
    }
  }
  if (audioState.config.mosaic.jitter > 0) {
    result.jitterStrength = clamp(params.jitterStrength + bass * audioState.config.mosaic.jitter, 0, 3.5);
  }
  if (audioState.config.mosaic.hue > 0) {
    result.audioHueShift = ((treble - 0.5) * audioState.config.mosaic.hue) / 360;
  }
  if (audioState.config.mosaic.saturation > 0) {
    result.audioSaturationBoost = level * audioState.config.mosaic.saturation;
  }
  result.audioValueBoost = Math.max(0, bass * 0.25);
  return result;
}

function renderRandomPoisson(context, params, sampleFn, skipDraw = false) {
  const particles = [];
  const { targetCount, canvasW, canvasH, baseSize, jitterMode, jitterStrength, gamma } = params;
  const minRadius = Math.max(1.2, baseSize * 0.35);
  const maxRadius = Math.max(minRadius * 1.2, baseSize * 1.6);
  const cellSize = Math.max(4, maxRadius * 2);
  const gridW = Math.ceil(canvasW / cellSize);
  const gridH = Math.ceil(canvasH / cellSize);
  const grid = Array.from({ length: gridW * gridH }, () => []);
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
    color: firstFinal,
    shapeId: params.shapeIndex,
    rotation: rng() * Math.PI * 2
  };
  active.push(firstPoint);
  particles.push(firstPoint);
  placeInGrid(firstPoint, grid, cellSize, gridW, gridH);

  while (active.length && particles.length < targetCount) {
    const index = Math.floor(rng() * active.length);
    const point = active[index];
    let found = false;
    for (let i = 0; i < 20; i++) {
      const angle = rng() * Math.PI * 2;
      const baseDistance = point.radius + minRadius;
      const distance = baseDistance + rng() * (maxRadius + baseSize * 0.5);
      const nx = point.x + Math.cos(angle) * distance;
      const ny = point.y + Math.sin(angle) * distance;
      if (nx < minRadius || ny < minRadius || nx > canvasW - minRadius || ny > canvasH - minRadius) continue;
      const color = sampleFn(nx / canvasW, ny / canvasH);
      const gammaColor = applyGamma(color, gamma);
      const finalColor = colorize(gammaColor, params, particles.length);
      const jitterFactor = computeJitter(jitterMode, jitterStrength, color, nx, ny, params);
      const localRadius = clamp(baseSize * jitterFactor, minRadius, maxRadius);
      if (distance < localRadius + point.radius + 2) continue;
      const candidate = {
        x: nx,
        y: ny,
        radius: localRadius,
        color: finalColor,
        shapeId: params.shapeIndex,
        rotation: rng() * Math.PI * 2
      };
      if (fits(candidate, grid, cellSize, gridW, gridH)) {
        particles.push(candidate);
        active.push(candidate);
        placeInGrid(candidate, grid, cellSize, gridW, gridH);
        found = true;
        break;
      }
    }
    if (!found) {
      active.splice(index, 1);
    }
  }
  if (!skipDraw) {
    drawParticles(context, particles, params);
  }
  return particles;
}

function drawParticles(context, particles, params) {
  if (!particles.length) return;
  if (particleRenderer) {
    particleRenderer.draw(particles, {
      width: canvas.width,
      height: canvas.height,
      outline: params.outline,
      glimmer: !!params.glimmer,
      time: performance.now() * 0.001
    });
    context.drawImage(particleRenderer.canvas, 0, 0, canvas.width, canvas.height);
    return;
  }
  // Fallback CPU drawing if WebGL is unavailable
  const path = params.shape.path;
  context.save();
  for (const particle of particles) {
    context.fillStyle = rgbToCss(particle.color);
    context.translate(particle.x, particle.y);
    context.scale(particle.radius, particle.radius);
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

function seedParticleField(force = false) {
  if (!particleRenderer) return;
  if (!force && particleState.particles.length === particleState.count) return;
  const rng = mulberry32(state.seed ^ 0x517cc1b7);
  const shapeKeys = Object.keys(shapeLibrary);
  const mosaicShape = shapeLibrary[state.shapeName]?.index ?? 0;
  particleState.particles = [];
  for (let i = 0; i < particleState.count; i++) {
    let shapeId = mosaicShape;
    if (particleState.shapeName === 'mix') {
      const key = shapeKeys[i % shapeKeys.length];
      shapeId = shapeLibrary[key].index;
    } else if (particleState.shapeName === 'match') {
      shapeId = mosaicShape;
    } else if (shapeLibrary[particleState.shapeName]) {
      shapeId = shapeLibrary[particleState.shapeName].index;
    }
    particleState.particles.push({
      angle: rng() * Math.PI * 2,
      radius: rng(),
      speed: 0.6 + rng() * 1.4,
      size: 3 + rng() * 7,
      offset: rng() * Math.PI * 2,
      orbit: rng() * Math.PI * 2,
      colorPhase: rng(),
      shapeId
    });
  }
}

function getParticlePaletteColors() {
  return resolvePaletteColors(particleState.palette, 'particle');
}

function resolvePaletteColors(name, context = 'mosaic') {
  let colors;
  if (name === 'custom') {
    if (context === 'particle' && particleState.customPalette.length) {
      colors = particleState.customPalette;
    } else if (context === 'nebula' && nebulaState.customPalette.length) {
      colors = nebulaState.customPalette;
    } else if (context === 'wave' && waveState.customPalette.length) {
      colors = waveState.customPalette;
    } else {
      colors = state.palette.length ? state.palette : palettePresets.Warm;
    }
  } else if (particlePalettes[name]) {
    colors = particlePalettes[name];
  } else if (palettePresets[name]) {
    colors = palettePresets[name];
  } else {
    colors = state.palette.length ? state.palette : palettePresets.Warm;
  }
  return colors.map((hex) => ({ ...hexToRgb(hex), a: 255 }));
}

function renderParticleScene(timestamp = performance.now()) {
  if (activeTab !== 'particle') return;
  if (!particleRenderer) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1320';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '16px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WebGL required for Particle Lab', canvas.width / 2, canvas.height / 2);
    ctx.restore();
    return;
  }
  seedParticleField();
  const dt = particleState.lastTime ? Math.min(0.05, Math.max(0, (timestamp - particleState.lastTime) / 1000)) : 0.016;
  particleState.lastTime = timestamp;

  if (particleState.trails) {
    ctx.fillStyle = 'rgba(5,7,12,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#05080f');
    gradient.addColorStop(1, '#0c1424');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const palette = getParticlePaletteColors();
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const baseRadius = Math.min(centerX, centerY) * 0.9;
  const shapes = [];
  const paletteCount = palette.length || 1;
  const shimmer = Math.sin(timestamp * 0.0015) * 0.5 + 0.5;

  for (let i = 0; i < particleState.particles.length; i++) {
    const particle = particleState.particles[i];
    particle.angle += dt * particleState.speed * particle.speed;
    particle.orbit += dt * 0.2;
    const radius = baseRadius * (0.25 + particle.radius * 0.75);
    const wobble = Math.sin(particle.orbit + shimmer + particle.offset) * 0.15;
    const x = centerX + Math.cos(particle.angle) * radius;
    const y = centerY + Math.sin(particle.angle * 0.85 + particle.orbit) * radius * (0.9 + wobble * 0.2);
    particle.colorPhase = (particle.colorPhase + dt * 0.1) % 1;
    const paletteIndex = Math.floor(particle.colorPhase * paletteCount) % paletteCount;
    const color = palette[paletteIndex];
    const twinkle = 0.6 + 0.4 * Math.sin(timestamp * 0.002 + particle.offset);
    const radiusPx = (particle.size + twinkle * 2) * (0.8 + shimmer * 0.3);
    shapes.push({
      x,
      y,
      radius: radiusPx,
      color,
      shapeId: particle.shapeId,
      rotation: particle.angle
    });
  }

  particleRenderer.draw(shapes, {
    width: canvas.width,
    height: canvas.height,
    outline: false,
    glimmer: 1,
    time: timestamp * 0.001
  });
  ctx.drawImage(particleRenderer.canvas, 0, 0, canvas.width, canvas.height);
}

function seedNebulaCloud(force = false) {
  const desired = clamp(Math.floor(nebulaState.density), 200, 24000);
  if (!force && nebulaState.cloud.length === desired && nebulaState.lastSeed === state.seed) return;
  const rng = mulberry32((state.seed ^ 0x9e3779b1) + frameSeedOffset);
  nebulaState.cloud = [];
  for (let i = 0; i < desired; i++) {
    nebulaState.cloud.push({
      radius: Math.pow(rng(), 0.72),
      angle: rng() * Math.PI * 2,
      noise: rng() * Math.PI * 2,
      spin: rng() * 0.6 + 0.25,
      paletteIndex: Math.floor(rng() * 1024)
    });
  }
  nebulaState.lastSeed = state.seed;
}

function renderNebula(timestamp = performance.now()) {
  if (activeTab !== 'nebula') return;
  if (!particleRenderer) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1320';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '16px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WebGL required for Nebula Weave', canvas.width / 2, canvas.height / 2);
    ctx.restore();
    return;
  }
  seedNebulaCloud();
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const bg = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.1, width / 2, height / 2, Math.max(width, height) * 0.8);
  bg.addColorStop(0, 'rgba(8,12,24,1)');
  bg.addColorStop(1, 'rgba(2,6,12,1)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  const palette = resolvePaletteColors(
    nebulaState.palette === 'custom' ? 'custom' : nebulaState.palette,
    'nebula'
  );
  const shapes = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusBase = Math.min(centerX, centerY) * 0.92;
  const time = timestamp * 0.001 * nebulaState.speed;
  const swirl = nebulaState.swirl;
  const paletteCount = palette.length || 1;
  const shapeId = shapeLibrary[state.shapeName]?.index ?? shapeLibrary.Circle?.index ?? 0;
  for (let i = 0; i < nebulaState.cloud.length; i++) {
    const seed = nebulaState.cloud[i];
    const wobble = Math.sin(time * seed.spin + seed.noise) * swirl;
    const angle = seed.angle + wobble;
    const radial = Math.pow(seed.radius, 1.05);
    const dist = radiusBase * (0.22 + radial * 0.78);
    const x = centerX + Math.cos(angle) * dist;
    const y = centerY + Math.sin(angle * 0.85) * dist;
    const colorIndex = Math.abs((seed.paletteIndex + Math.floor((time + seed.noise) * 6)) % paletteCount);
    const baseColor = palette[colorIndex] || palette[0];
    const twinkle = 0.55 + 0.45 * Math.sin(time * 2.4 + seed.noise);
    const radius = Math.max(2.5, 3 + dist * 0.006 * (1 + twinkle));
    shapes.push({
      x,
      y,
      radius,
      color: baseColor,
      shapeId,
      rotation: angle
    });
  }
  particleRenderer.draw(shapes, {
    width,
    height,
    outline: false,
    glimmer: true,
    time: timestamp * 0.001
  });
  ctx.globalAlpha = 0.95;
  ctx.drawImage(particleRenderer.canvas, 0, 0, width, height);
  ctx.globalAlpha = 1;
}

function renderWave(timestamp = performance.now()) {
  if (activeTab !== 'wave') return;
  if (!particleRenderer) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#041018';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '16px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WebGL required for Wave Lab', canvas.width / 2, canvas.height / 2);
    ctx.restore();
    return;
  }
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `hsla(${(waveState.hue + 20) % 360}, 78%, 55%, 1)`);
  gradient.addColorStop(1, `hsla(${(waveState.hue + 200) % 360}, 65%, 14%, 1)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  const cols = Math.max(32, Math.floor(width / 18));
  const rows = Math.max(24, Math.floor(height / 18));
  const stepX = width / cols;
  const stepY = height / rows;
  const palette = resolvePaletteColors('Starlight', 'wave');
  const shapes = [];
  const freq = waveState.frequency;
  const amp = waveState.amplitude;
  const time = timestamp * 0.001;
  const hueShift = (waveState.hue % 360) / 360;
  const shapeId = shapeLibrary[state.shapeName]?.index ?? shapeLibrary.Circle?.index ?? 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = x / cols;
      const ny = y / rows;
      const waveX = Math.sin((nx * freq + time) * Math.PI * 2 + ny * 2.2) * amp;
      const waveY = Math.cos((ny * freq + time * 0.6) * Math.PI * 2) * amp * 0.35;
      const px = x * stepX + stepX / 2 + waveX;
      const py = y * stepY + stepY / 2 + waveY;
      const baseColor = palette[(x + y) % palette.length] || palette[0];
      const hsv = rgbToHsv(baseColor);
      hsv.h = (hsv.h + hueShift) % 1;
      const tinted = hsvToRgb(hsv);
      const color = { r: tinted.r, g: tinted.g, b: tinted.b, a: baseColor.a ?? 255 };
      const radius = Math.max(2, Math.min(stepX, stepY) * 0.35);
      shapes.push({
        x: px,
        y: py,
        radius,
        color,
        shapeId,
        rotation: 0
      });
    }
  }
  particleRenderer.draw(shapes, {
    width,
    height,
    outline: false,
    glimmer: true,
    time: timestamp * 0.001
  });
  ctx.drawImage(particleRenderer.canvas, 0, 0, width, height);
}

function colorize(rgb, params, idx) {
  const { colorMode, palette, dither, rng } = params;
  let result = { ...rgb };
  if (colorMode === 'grayscale') {
    const gray = toGrayscale(rgb);
    result = { r: gray, g: gray, b: gray, a: rgb.a };
  } else if (colorMode === 'palette') {
    if (dither) {
      const noise = (rng() - 0.5) * 10;
      const noisy = {
        r: clamp(rgb.r + noise, 0, 255),
        g: clamp(rgb.g + noise, 0, 255),
        b: clamp(rgb.b + noise, 0, 255)
      };
      result = nearestPaletteColor(noisy, palette);
    } else {
      result = nearestPaletteColor(rgb, palette);
    }
  }
  const hueShift = params.audioHueShift || 0;
  const satBoost = params.audioSaturationBoost || 0;
  const valueBoost = params.audioValueBoost || 0;
  if (hueShift !== 0 || satBoost !== 0 || valueBoost !== 0) {
    const hsv = rgbToHsv(result);
    hsv.h = (hsv.h + hueShift) % 1;
    if (hsv.h < 0) hsv.h += 1;
    hsv.s = clamp(hsv.s * (1 + satBoost), 0, 1);
    hsv.v = clamp(hsv.v * (1 + valueBoost), 0, 1);
    const tinted = hsvToRgb(hsv);
    result = { r: tinted.r, g: tinted.g, b: tinted.b, a: result.a ?? rgb.a };
  }
  return result;
}

function drawImageToCanvas(image, width, height) {
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);
}

function placeInGrid(point, grid, cellSize, gridW, gridH) {
  const minX = Math.max(0, Math.floor((point.x - point.radius) / cellSize));
  const maxX = Math.min(gridW - 1, Math.floor((point.x + point.radius) / cellSize));
  const minY = Math.max(0, Math.floor((point.y - point.radius) / cellSize));
  const maxY = Math.min(gridH - 1, Math.floor((point.y + point.radius) / cellSize));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      grid[y * gridW + x].push(point);
    }
  }
}

function fits(candidate, grid, cellSize, gridW, gridH) {
  const minX = Math.max(0, Math.floor((candidate.x - candidate.radius) / cellSize) - 1);
  const maxX = Math.min(gridW - 1, Math.floor((candidate.x + candidate.radius) / cellSize) + 1);
  const minY = Math.max(0, Math.floor((candidate.y - candidate.radius) / cellSize) - 1);
  const maxY = Math.min(gridH - 1, Math.floor((candidate.y + candidate.radius) / cellSize) + 1);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const cell = grid[y * gridW + x];
      if (!cell || !cell.length) continue;
      for (const neighbor of cell) {
        const dx = neighbor.x - candidate.x;
        const dy = neighbor.y - candidate.y;
        const limit = neighbor.radius + candidate.radius + 1.6;
        if (dx * dx + dy * dy < limit * limit) {
          return false;
        }
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

function collectMosaicFilter() {
  if (!mosaicFilterControls.density) return null;
  return {
    density: parseFloat(mosaicFilterControls.density.value),
    shape: parseFloat(mosaicFilterControls.shape.value),
    paletteShift: parseFloat(mosaicFilterControls.palette.value)
  };
}

function applyMosaicOverlay(context, base, settings) {
  if (!settings) return;
  const { density, shape, paletteShift } = settings;
  context.save();
  if (Math.abs(density) > 0.01) {
    context.globalCompositeOperation = density > 0 ? 'screen' : 'multiply';
    context.globalAlpha = Math.min(1, Math.abs(density));
    context.fillStyle = density > 0 ? 'rgba(255,255,255,0.25)' : 'rgba(5,8,12,0.55)';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (Math.abs(shape - 0.5) > 0.01) {
    const step = Math.max(6, Math.round(20 + (shape - 0.5) * 40));
    context.globalAlpha = 0.18;
    context.globalCompositeOperation = 'overlay';
    context.strokeStyle = 'rgba(255,255,255,0.6)';
    context.lineWidth = 0.75;
    for (let x = 0; x < canvas.width; x += step) {
      context.beginPath();
      context.moveTo(x + 0.5, 0);
      context.lineTo(x + 0.5, canvas.height);
      context.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      context.beginPath();
      context.moveTo(0, y + 0.5);
      context.lineTo(canvas.width, y + 0.5);
      context.stroke();
    }
  }
  context.restore();
  if (Math.abs(paletteShift) > 0.5) {
    applyHueShift(context, paletteShift / 360);
  }
}

function collectColorGrade() {
  if (!colorGradeControls.brightness) return null;
  return {
    brightness: parseFloat(colorGradeControls.brightness.value),
    contrast: parseFloat(colorGradeControls.contrast.value),
    saturation: parseFloat(colorGradeControls.saturation.value),
    hue: parseFloat(colorGradeControls.hue.value)
  };
}

function applyColorGrade(context, base, settings) {
  let brightness = settings.brightness || 0;
  let contrast = settings.contrast || 1;
  let saturation = settings.saturation || 1;
  let hue = (settings.hue || 0) / 360;
  if (audioState.running && audioState.target === 'color') {
    const vibrance = audioState.config.color.vibrance || 0;
    if (vibrance > 0) {
      const level = audioState.level;
      const bass = audioState.bass;
      const treble = audioState.treble;
      brightness = clamp(brightness + (bass - 0.5) * 0.6 * vibrance, -1, 1);
      saturation = clamp(saturation * (1 + level * vibrance), 0, 4);
      hue += (treble - 0.5) * vibrance * 0.25;
    }
  }
  applyColorAdjustments(context, {
    brightness,
    contrast,
    saturation,
    hue
  });
}

function collectGlitchFilter() {
  return {
    intensity: parseFloat(glitchControls.intensity.value),
    scanline: glitchControls.scanline.checked
  };
}

function applyGlitchEffect(context, base, settings, timestamp = performance.now()) {
  if (!settings) return;
  const { intensity, scanline } = settings;
  const level = clamp(intensity, 0, 2);
  const bands = Math.max(6, Math.floor(20 + level * 40));
  const bandHeight = canvas.height / bands;
  const rng = mulberry32(state.seed + Math.floor(timestamp));
  for (let i = 0; i < bands; i++) {
    const sliceY = (i / bands) * base.height;
    const offset = (rng() - 0.5) * level * 260;
    context.drawImage(
      base,
      0,
      sliceY,
      base.width,
      base.height / bands,
      offset,
      i * bandHeight,
      canvas.width,
      bandHeight
    );
  }
  if (scanline) {
    context.save();
    context.globalCompositeOperation = 'overlay';
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0,0,0,0.4)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }
}

function collectAuroraFilter() {
  return {
    bloom: parseFloat(auroraControls.bloom.value),
    drift: parseFloat(auroraControls.drift.value)
  };
}

function applyAuroraOverlay(context, base, settings, timestamp = performance.now()) {
  const layers = 5;
  const t = timestamp * 0.001 * (settings.drift || 1);
  const rng = mulberry32(state.seed ^ 0x9e3779b1);
  context.save();
  context.globalCompositeOperation = 'screen';
  for (let i = 0; i < layers; i++) {
    const amplitude = (0.2 + i * 0.08) * (settings.bloom || 1) * canvas.height * 0.12;
    const frequency = 0.4 + i * 0.15;
    const offset = rng() * Math.PI * 2;
    const hue = (rng() * 180 + 120) % 360;
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.25)`);
    gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, 70%, 45%, 0.2)`);
    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(0, canvas.height * 0.6);
    for (let x = 0; x <= canvas.width; x += 16) {
      const wave = Math.sin(x / canvas.width * Math.PI * 2 * frequency + offset + t);
      const y = canvas.height * 0.6 + wave * amplitude;
      context.lineTo(x, y);
    }
    context.lineTo(canvas.width, canvas.height);
    context.lineTo(0, canvas.height);
    context.closePath();
    context.fill();
  }
  context.restore();
}

function collectParticleFilter() {
  return {
    count: particleState.count,
    speed: particleState.speed,
    palette: particleState.palette,
    trails: particleState.trails,
    customPalette: [...particleState.customPalette]
  };
}

function applyParticleOverlay(context, base, settings, timestamp = performance.now()) {
  let count = clamp(Math.floor(settings.count * 0.35), 50, 4000);
  const rng = mulberry32(state.seed ^ 0x1234abcd);
  const paletteSource = settings.palette === 'custom' && settings.customPalette.length
    ? settings.customPalette
    : resolvePaletteColors(settings.palette, 'particle').map((c) => rgbToHex({ r: c.r, g: c.g, b: c.b }));
  const colors = paletteSource.map((hex) => hexToRgb(hex)).map((c) => rgbToCss(c));
  if (audioState.running && audioState.target === 'particle') {
    count = Math.min(6000, Math.floor(count * (1 + audioState.level * audioState.config.particle.burst)));
  }
  context.save();
  context.globalCompositeOperation = settings.trails ? 'lighter' : 'screen';
  let alpha = settings.trails ? 0.3 : 0.25;
  if (audioState.running && audioState.target === 'particle') {
    alpha = clamp(alpha + audioState.level * 0.3, 0, 1);
  }
  context.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    const x = rng() * canvas.width;
    const y = ((rng() + (timestamp * 0.0005 * settings.speed)) % 1) * canvas.height;
    const radius = 2 + rng() * 6;
    context.beginPath();
    context.fillStyle = colors[i % colors.length];
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function collectNebulaFilter() {
  return {
    density: nebulaState.density,
    swirl: nebulaState.swirl,
    speed: nebulaState.speed,
    palette: nebulaState.palette,
    customPalette: [...nebulaState.customPalette]
  };
}

function applyNebulaOverlay(context, base, settings, timestamp = performance.now()) {
  const rng = mulberry32(state.seed ^ 0x51ed2f1b);
  const layers = Math.max(3, Math.floor(settings.density / 2000));
  context.save();
  context.globalCompositeOperation = 'screen';
  for (let i = 0; i < layers; i++) {
    let hue = (rng() * 360 + i * 24) % 360;
    if (settings.palette === 'custom' && settings.customPalette.length) {
      const hex = settings.customPalette[i % settings.customPalette.length];
      hue = rgbToHsv(hexToRgb(hex)).h * 360;
    }
    let alpha = 0.12 + (i / layers) * 0.18;
    if (audioState.running && audioState.target === 'nebula') {
      alpha = clamp(alpha + audioState.level * audioState.config.nebula.glow * 0.2, 0, 0.8);
    }
    const radius = Math.max(canvas.width, canvas.height) * (0.25 + i * 0.12);
    const centerX = canvas.width * (0.2 + rng() * 0.6);
    const centerY = canvas.height * (0.2 + rng() * 0.6);
    const gradient = context.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius);
    gradient.addColorStop(0, `hsla(${hue}, 85%, 60%, ${alpha})`);
    gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, 60%, 35%, 0)`);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function collectWaveFilter() {
  return {
    amplitude: parseFloat(waveControls.amplitude.value),
    frequency: parseFloat(waveControls.frequency.value),
    hue: parseFloat(waveControls.hue.value),
    customPalette: [...waveState.customPalette]
  };
}

function applyWaveOverlay(context, base, settings, timestamp = performance.now()) {
  tempCanvas.width = base.width;
  tempCanvas.height = base.height;
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.drawImage(base, 0, 0);
  let amp = settings.amplitude || 0;
  const freq = settings.frequency || 1;
  const rows = Math.max(12, Math.floor(canvas.height / 12));
  const rowHeight = canvas.height / rows;
  for (let i = 0; i < rows; i++) {
    const progress = i / rows;
    let localAmp = amp;
    if (audioState.running && audioState.target === 'wave') {
      localAmp *= 1 + audioState.level * audioState.config.wave.amplitude;
    }
    const offset = Math.sin(progress * Math.PI * 2 * freq + timestamp * 0.002) * localAmp;
    context.drawImage(
      tempCanvas,
      0,
      i * rowHeight,
      canvas.width,
      rowHeight,
      offset,
      i * rowHeight,
      canvas.width,
      rowHeight
    );
  }
  if (Math.abs(settings.hue) > 0.5) {
    applyHueShift(context, settings.hue / 360);
  }
  if (settings.customPalette && settings.customPalette.length) {
    context.save();
    context.globalCompositeOperation = 'color';
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    settings.customPalette.forEach((hex, index) => {
      gradient.addColorStop(index / Math.max(1, settings.customPalette.length - 1), hex);
    });
    context.fillStyle = gradient;
    context.globalAlpha = 0.25;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }
}

function collectBloomFilter() {
  return {
    threshold: parseFloat(bloomControls.threshold.value),
    intensity: parseFloat(bloomControls.intensity.value),
    radius: parseFloat(bloomControls.radius.value)
  };
}

function applyBloomEffect(context, base, settings) {
  tempCanvas.width = base.width;
  tempCanvas.height = base.height;
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.drawImage(base, 0, 0);
  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;
  const threshold = clamp(settings.threshold || 0, 0, 1);
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / (3 * 255);
    if (lum < threshold) {
      data[i + 3] = 0;
    }
  }
  tempCtx.putImageData(imageData, 0, 0);
  context.save();
  context.globalCompositeOperation = 'screen';
  context.filter = `blur(${clamp(settings.radius || 12, 1, 120)}px)`;
  let bloomAlpha = clamp(settings.intensity || 1, 0, 3) * 0.45;
  if (audioState.running && audioState.target === 'bloom') {
    bloomAlpha = clamp(bloomAlpha + audioState.level * audioState.config.bloom.pulse * 0.25, 0, 1);
  }
  context.globalAlpha = bloomAlpha;
  context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
  context.restore();
  context.filter = 'none';
}

function collectEdgeFilter() {
  return {
    strength: parseFloat(edgeControls.strength.value),
    tint: edgeControls.tint.value
  };
}

function applyEdgeEffect(context, base, settings) {
  const width = canvas.width;
  const height = canvas.height;
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const output = context.createImageData(width, height);
  const out = output.data;
  const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;
      let idx = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = ((y + ky) * width + (x + kx)) * 4;
          const gray = (data[px] + data[px + 1] + data[px + 2]) / 3;
          gx += gray * kernelX[idx];
          gy += gray * kernelY[idx];
          idx++;
        }
      }
      let magnitude = clamp(Math.sqrt(gx * gx + gy * gy) * (settings.strength || 1) / 255, 0, 1);
      if (audioState.running && audioState.target === 'edge') {
        magnitude = clamp(magnitude * (1 + audioState.level * audioState.config.edge.boost), 0, 1);
      }
      const tint = hexToRgb(settings.tint || '#ffffff');
      const dest = (y * width + x) * 4;
      out[dest] = tint.r * magnitude;
      out[dest + 1] = tint.g * magnitude;
      out[dest + 2] = tint.b * magnitude;
      out[dest + 3] = magnitude * 255;
    }
  }
  context.save();
  context.globalCompositeOperation = 'screen';
  context.putImageData(output, 0, 0);
  context.restore();
}

function collectApiFilter() {
  return {
    strength: 0.35,
    palette: apiState.palette
  };
}

function applyApiOverlay(context, base, settings) {
  if (apiState.palette && apiState.palette.length) {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    apiState.palette.forEach((hex, index) => {
      gradient.addColorStop(index / Math.max(1, apiState.palette.length - 1), hex);
    });
    context.save();
    let alpha = 0.25;
    if (audioState.running && audioState.target === 'api') {
      alpha = clamp(alpha + audioState.level * audioState.config.api.mix * 0.2, 0, 0.75);
    }
    context.globalAlpha = alpha;
    context.globalCompositeOperation = 'soft-light';
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }
}

function collectAiFilter() {
  return {
    palette: [...aiState.palette]
  };
}

function applyAIPaletteOverlay(context, base, settings) {
  if (!settings || !settings.palette || !settings.palette.length) return;
  const stripes = settings.palette.length;
  const stripeWidth = canvas.width / stripes;
  context.save();
  let alpha = 0.18;
  if (audioState.running && audioState.target === 'ai') {
    alpha = clamp(alpha + audioState.level * audioState.config.ai.motion * 0.2, 0, 0.6);
  }
  context.globalAlpha = alpha;
  context.globalCompositeOperation = 'overlay';
  settings.palette.forEach((hex, index) => {
    context.fillStyle = hex;
    context.fillRect(index * stripeWidth, 0, stripeWidth + 1, canvas.height);
  });
  context.restore();
}

function collectAudioFilter() {
  return {
    enabled: true,
    target: audioControls.target?.value || audioState.target,
    smoothing: audioState.smoothing
  };
}

function applyAudioFilter(context, base, settings) {
  const target = settings?.target || audioState.target || 'mosaic';
  audioState.target = target;
  if (audioControls.target) {
    audioControls.target.value = target;
    updateAudioTargetGroups();
  }
  setStatus(`Audio reactor linked to ${formatFilterName(target)}`);
  if (target === 'mosaic') {
    queueRender(true);
  } else if (target === 'aurora') {
    renderAurora();
  } else if (target === 'glitch') {
    renderGlitch();
  } else if (FILTER_TABS.has(target)) {
    previewFilter(target);
  }
}

function applyColorAdjustments(context, adjustments) {
  const { brightness = 0, contrast = 1, saturation = 1, hue = 0 } = adjustments;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const hsv = rgbToHsv({ r: data[i], g: data[i + 1], b: data[i + 2] });
    let h = (hsv.h + hue) % 1;
    if (h < 0) h += 1;
    const s = clamp(hsv.s * saturation, 0, 1);
    const v = clamp((hsv.v - 0.5) * contrast + 0.5 + brightness, 0, 1);
    const rgb = hsvToRgb({ h, s, v });
    data[i] = rgb.r;
    data[i + 1] = rgb.g;
    data[i + 2] = rgb.b;
  }
  context.putImageData(imageData, 0, 0);
}

function applyHueShift(context, amount) {
  applyColorAdjustments(context, { hue: amount, brightness: 0, contrast: 1, saturation: 1 });
}

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const { signal: externalSignal, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  let onAbort;
  if (externalSignal) {
    onAbort = () => controller.abort();
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onAbort, { once: true });
    }
  }
  try {
    return await fetch(url, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    if (externalSignal && onAbort) {
      externalSignal.removeEventListener('abort', onAbort);
    }
  }
}

function renderAIPalettePreview() {
  if (!aiControls.preview) return;
  aiControls.preview.innerHTML = '';
  aiState.palette.forEach((hex) => {
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = hex;
    aiControls.preview.appendChild(swatch);
  });
}

function handleAIPaletteSave() {
  if (!aiState.palette.length) {
    return;
  }
  const destination = aiControls.destination.value;
  const paletteName = `AI-${Date.now().toString(36)}`;
  const colors = [...aiState.palette];
  if (destination === 'mosaic') {
    palettePresets[paletteName] = colors;
    ensureSelectOption(mosaicControls.palettePreset, paletteName, paletteName);
    mosaicControls.palettePreset.value = paletteName;
    state.palette = colors.slice();
    refreshPaletteEditor();
    state.colorMode = 'palette';
    mosaicControls.colorMode.value = 'palette';
    queueRender();
  } else if (destination === 'particle') {
    particlePalettes[paletteName] = colors;
    ensureSelectOption(particleControls.palette, paletteName, paletteName, 'custom');
    if (nebulaControls.palette) {
      ensureSelectOption(nebulaControls.palette, paletteName, paletteName, 'custom');
    }
    particleState.palette = paletteName;
    particleState.customPalette = [];
    if (particleControls.palette) {
      particleControls.palette.value = paletteName;
    }
    previewFilter('particle');
  } else if (destination === 'nebula') {
    particlePalettes[paletteName] = colors;
    if (particleControls.palette) {
      ensureSelectOption(particleControls.palette, paletteName, paletteName, 'custom');
    }
    ensureSelectOption(nebulaControls.palette, paletteName, paletteName, 'custom');
    nebulaState.palette = paletteName;
    nebulaState.customPalette = [];
    if (nebulaControls.palette) {
      nebulaControls.palette.value = paletteName;
    }
    previewFilter('nebula');
  } else if (destination === 'wave') {
    waveState.customPalette = colors.slice();
    previewFilter('wave');
  }
  aiControls.save.disabled = true;
  setStatus(`Saved AI palette to ${formatFilterName(destination)}`);
}

function generatePaletteFromPrompt(prompt, variation) {
  const seed = hashSeed(prompt || 'palette');
  const rng = mulberry32(seed ^ Math.floor(variation * 10_000));
  const colors = [];
  const count = 6;
  for (let i = 0; i < count; i++) {
    const baseHue = (rng() * 360 + i * (360 / count) + variation * 120) % 360;
    const sat = clamp(0.45 + rng() * 0.4 + variation * 0.2, 0, 1);
    const val = clamp(0.45 + rng() * 0.4, 0, 1);
    const rgb = hsvToRgb({ h: baseHue / 360, s: sat, v: val });
    colors.push(rgbToHex(rgb));
  }
  return colors;
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
    const force = activeTab === 'audio' && audioState.target === 'mosaic';
    renderMosaic(force);
    if (++count > 120) {
      clearInterval(interval);
      frameSeedOffset = 0;
    }
  }, 16);
}

function handlePointerDown(event) {
  if (!editMode) return;
  const scale = getCanvasScale();
  const offsetX = event.offsetX * scale.x;
  const offsetY = event.offsetY * scale.y;
  const hit = state.particles.findIndex((particle) => {
    const dx = particle.x - offsetX;
    const dy = particle.y - offsetY;
    return Math.sqrt(dx * dx + dy * dy) <= particle.radius;
  });
  if (hit !== -1) {
    editingIndex = hit;
    mosaicControls.editDuplicate.disabled = false;
    mosaicControls.editDelete.disabled = false;
    setStatus(`Selected particle ${hit + 1}`);
  }
}

function handlePointerMove(event) {
  if (!editMode || editingIndex === -1 || event.buttons === 0) return;
  const particle = state.particles[editingIndex];
  const scale = getCanvasScale();
  particle.x = clamp(event.offsetX * scale.x, 0, canvas.width);
  particle.y = clamp(event.offsetY * scale.y, 0, canvas.height);
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
  const target = state.particles[editingIndex];
  const clone = { ...target, x: clamp(target.x + 10, 0, canvas.width), y: clamp(target.y + 10, 0, canvas.height) };
  state.particles.push(clone);
  renderMosaic();
}

function deleteSelection() {
  if (!editMode || editingIndex === -1) return;
  state.particles.splice(editingIndex, 1);
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
    const output = state.outputs.video;
    let stream;
    if (mode === 'window') {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: output.fps }, audio: false });
    } else {
      stream = canvas.captureStream(output.fps || 60);
    }
    if (!previewActive) {
      previewActive = true;
      mosaicControls.previewToggle.checked = true;
      mosaicControls.previewStatus.textContent = 'Preview ON';
    }
    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: Math.round(clamp(output.bitrate, 5, 150) * 1_000_000)
    };
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
    setStatus(`Recording at ${output.fps} fps`);
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
  let intensity = parseFloat(glitchControls.intensity.value);
  const scanline = glitchControls.scanline.checked;
  const sample = ensureSourceReady() ? downsampleSource() : null;
  if (!sample) {
    ctx.restore();
    return;
  }
  const audioInfluence = applyAudioToGlitch(intensity);
  intensity = audioInfluence.intensity;
  const bands = Math.max(6, Math.floor(intensity * 40));
  const bandHeight = canvas.height / bands;
  const rng = mulberry32(state.seed + Math.floor(audioState.level * 1000));
  for (let i = 0; i < bands; i++) {
    const offset = (rng() - 0.5) * intensity * 200 + (i / bands - 0.5) * audioInfluence.bandChaos;
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
  if (audioInfluence.colorBoost > 0) {
    ctx.globalCompositeOperation = 'screen';
    const strength = clamp(audioInfluence.colorBoost, 0, 1);
    ctx.fillStyle = `rgba(255,160,220,${strength * 0.4})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.restore();
}

function renderAurora(timestamp = performance.now()) {
  let bloom = parseFloat(auroraControls.bloom.value);
  let drift = parseFloat(auroraControls.drift.value);
  const audioInfluence = applyAudioToAurora({ bloom, drift });
  bloom = audioInfluence.bloom;
  drift = audioInfluence.drift;
  const t = timestamp * 0.001;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const background = ctx.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, '#030512');
  background.addColorStop(1, '#071124');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const layers = 7;
  const rng = mulberry32(state.seed + 0x9e3779b1);
  for (let i = 0; i < layers; i++) {
    const amplitude = (0.35 + i * 0.12) * canvas.height * 0.2 * bloom;
    const frequency = 0.4 + i * 0.18;
    const offset = rng() * Math.PI * 2;
    const path = new Path2D();
    path.moveTo(0, canvas.height * 0.65);
    for (let x = 0; x <= canvas.width; x += 12) {
      const progress = x / canvas.width;
      const wave = Math.sin(progress * Math.PI * 2 * frequency + drift * t + offset);
      const y = canvas.height * 0.55 + wave * amplitude;
      path.lineTo(x, y);
    }
    path.lineTo(canvas.width, canvas.height);
    path.lineTo(0, canvas.height);
    path.closePath();
    const hue = (rng() * 180 + 120 + audioInfluence.hueShift) % 360;
    const alpha = (0.08 + i * 0.05) * (1 + audioInfluence.alphaBoost * 0.6);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsla(${hue}, 80%, ${40 + i * 4}%, ${alpha})`);
    gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, 70%, ${60 + i * 5}%, ${alpha * 0.6})`);
    ctx.fillStyle = gradient;
    ctx.fill(path);
  }

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = `rgba(255,255,255,${0.08 + bloom * 0.05 + audioInfluence.alphaBoost * 0.3})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
  if (activeTab === 'aurora' || (activeTab === 'audio' && audioState.target === 'aurora')) {
    renderGlimmer({ canvasW: canvas.width, canvasH: canvas.height, jitterStrength: bloom });
  }
}

function applyAudioToAurora(settings) {
  const result = { ...settings, hueShift: 0, alphaBoost: 0 };
  if (!audioState.running || audioState.target !== 'aurora') {
    return { ...result };
  }
  const level = audioState.level;
  const bass = audioState.bass;
  const treble = audioState.treble;
  if (audioState.config.aurora.bloom > 0) {
    result.bloom = clamp(settings.bloom * (1 + level * audioState.config.aurora.bloom), 0, 6);
  }
  if (audioState.config.aurora.drift > 0) {
    result.drift = clamp(settings.drift + bass * audioState.config.aurora.drift, 0, 8);
  }
  if (audioState.config.aurora.hue > 0) {
    result.hueShift = (treble - 0.5) * audioState.config.aurora.hue;
  }
  result.alphaBoost = Math.max(0, level * 0.8);
  return result;
}

function applyAudioToGlitch(intensity) {
  const result = { intensity, bandChaos: 0, colorBoost: 0 };
  if (!audioState.running || audioState.target !== 'glitch') {
    return result;
  }
  const level = audioState.level;
  const bass = audioState.bass;
  const treble = audioState.treble;
  if (audioState.config.glitch.intensity > 0) {
    result.intensity = clamp(intensity + level * audioState.config.glitch.intensity, 0, 2.5);
  }
  if (audioState.config.glitch.bands > 0) {
    result.bandChaos = bass * audioState.config.glitch.bands;
  }
  if (audioState.config.glitch.color > 0) {
    result.colorBoost = treble * audioState.config.glitch.color;
  }
  return result;
}

async function fetchApodImage() {
  apiControls.status.textContent = 'Loading NASA APOD…';
  try {
    const response = await fetchWithTimeout('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true', {}, 12000);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const imageUrl = data.media_type === 'image' ? data.url : data.thumbnail_url;
    if (!imageUrl) {
      throw new Error('No image available');
    }
    const imageResponse = await fetchWithTimeout(imageUrl, {}, 15000);
    if (!imageResponse.ok) {
      throw new Error(`Image HTTP ${imageResponse.status}`);
    }
    const imageBlob = await imageResponse.blob();
    const imageObjectUrl = URL.createObjectURL(imageBlob);
    let img;
    try {
      img = await loadImage(imageObjectUrl);
    } finally {
      URL.revokeObjectURL(imageObjectUrl);
    }
    transferImageToSample(img);
    apiState.apod = {
      title: data.title,
      date: data.date,
      explanation: data.explanation,
      url: imageUrl
    };
    apiControls.status.textContent = 'APOD loaded and ready';
    refreshApiPreview();
    setStatus('NASA imagery loaded into mosaic source');
  } catch (error) {
    const message = error.name === 'AbortError' ? 'APOD request timed out' : error.message;
    apiControls.status.textContent = `APOD error: ${message}`;
    await loadApodFallback();
  }
}


async function loadApodFallback() {
  try {
    const width = 1280;
    const height = 720;
    sampleCanvas.width = width;
    sampleCanvas.height = height;
    const gradient = sampleCtx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0b1d3a');
    gradient.addColorStop(0.5, '#27496d');
    gradient.addColorStop(1, '#7ea3ff');
    sampleCtx.fillStyle = gradient;
    sampleCtx.fillRect(0, 0, width, height);
    state.videoActive = false;
    state.lastStillFrame = performance.now();
    const stars = Math.floor((width * height) / 8000);
    const rng = mulberry32(state.seed ^ 0x4d2c6dfc);
    sampleCtx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < stars; i++) {
      const x = Math.floor(rng() * width);
      const y = Math.floor(rng() * height);
      const radius = rng() * 1.8 + 0.2;
      sampleCtx.beginPath();
      sampleCtx.arc(x, y, radius, 0, Math.PI * 2);
      sampleCtx.fill();
    }
    lastSource = 'image';
    apiState.apod = {
      title: 'APOD Fallback',
      date: new Date().toISOString().slice(0, 10),
      explanation: 'Procedurally generated fallback nebula',
      url: sampleCanvas.toDataURL('image/png')
    };
    apiControls.status.textContent = 'APOD fallback generated';
    refreshApiPreview();
    queueRender(true);
    setStatus('Loaded procedural APOD fallback');
  } catch (fallbackError) {
    apiControls.status.textContent = `APOD fallback failed: ${fallbackError.message}`;
  }
}

async function fetchPicsumImage() {
  apiControls.status.textContent = 'Loading Picsum scenic…';
  try {
    const seedHex = (state.seed >>> 0).toString(16);
    const url = `https://picsum.photos/seed/${seedHex}/1600/900`;
    const response = await fetchWithTimeout(url, {}, 10000);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    let img;
    try {
      img = await loadImage(blobUrl);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
    transferImageToSample(img);
    apiState.picsum = {
      title: 'Picsum Scenic',
      date: new Date().toISOString().slice(0, 10),
      url
    };
    apiControls.status.textContent = 'Picsum scenic loaded';
    refreshApiPreview();
    setStatus('Picsum scenic loaded into mosaic source');
  } catch (error) {
    const message = error.name === 'AbortError' ? 'request timed out' : error.message;
    apiControls.status.textContent = `Picsum error: ${message}`;
  }
}

async function fetchArtImage() {
  apiControls.status.textContent = 'Loading Art Institute artwork…';
  try {
    const rng = mulberry32(state.seed ^ 0x51ed2f1b);
    const page = Math.max(1, Math.floor(rng() * 100) + 1);
    const response = await fetchWithTimeout(
      `https://api.artic.edu/api/v1/artworks?page=${page}&limit=1&fields=id,title,image_id,artist_title,date_display`,
      {},
      10000
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    const record = payload.data?.[0];
    if (!record || !record.image_id) {
      throw new Error('No artwork available');
    }
    const url = `https://www.artic.edu/iiif/2/${record.image_id}/full/843,/0/default.jpg`;
    const artImage = await fetchWithTimeout(url, {}, 12000);
    if (!artImage.ok) {
      throw new Error(`Image HTTP ${artImage.status}`);
    }
    const artBlob = await artImage.blob();
    const blobUrl = URL.createObjectURL(artBlob);
    let img;
    try {
      img = await loadImage(blobUrl);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
    transferImageToSample(img);
    apiState.art = {
      title: record.title || 'Art Institute',
      date: record.date_display || '',
      artist: record.artist_title || 'Unknown artist',
      url
    };
    apiControls.status.textContent = 'Art Institute image loaded';
    refreshApiPreview();
    setStatus('Art Institute imagery loaded');
  } catch (error) {
    apiControls.status.textContent = `Art API error: ${error.message}`;
  }
}

async function fetchDogImage() {
  apiControls.status.textContent = 'Summoning canine muse…';
  try {
    const response = await fetchWithTimeout('https://dog.ceo/api/breeds/image/random', {}, 8000);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (!payload || payload.status !== 'success') {
      throw new Error('Dog API returned no image');
    }
    const url = payload.message;
    const dogImage = await fetchWithTimeout(url, {}, 8000);
    if (!dogImage.ok) {
      throw new Error(`Image HTTP ${dogImage.status}`);
    }
    const dogBlob = await dogImage.blob();
    const blobUrl = URL.createObjectURL(dogBlob);
    let img;
    try {
      img = await loadImage(blobUrl);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
    transferImageToSample(img);
    apiState.dog = {
      title: 'Canine Muse',
      date: new Date().toISOString().slice(0, 10),
      url
    };
    apiControls.status.textContent = 'Canine muse loaded';
    refreshApiPreview();
    setStatus('Canine muse loaded into mosaic source');
  } catch (error) {
    apiControls.status.textContent = `Dog API error: ${error.message}`;
  }
}

async function fetchRemotePalette() {
  apiControls.status.textContent = 'Fetching palette…';
  try {
    const response = await fetchWithTimeout('https://www.colr.org/json/colors/random/7', {}, 8000);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    const colors = (payload.colors || [])
      .map((entry) => entry.hex)
      .filter(Boolean)
      .map((hex) => `#${hex.padStart(6, '0')}`);
    if (!colors.length) {
      throw new Error('Palette API returned no colors');
    }
    apiState.palette = colors;
    apiControls.status.textContent = `Palette ready (${colors.length})`;
    refreshApiPreview();
  } catch (error) {
    const message = error.name === 'AbortError' ? 'request timed out' : error.message;
    apiControls.status.textContent = `Palette error: ${message}`;
  }
}

function applyRemotePalette() {
  if (!apiState.palette.length) {
    apiControls.status.textContent = 'Fetch a palette first';
    return;
  }
  state.palette = [...apiState.palette];
  refreshPaletteEditor();
  state.colorMode = 'palette';
  mosaicControls.colorMode.value = 'palette';
  queueRender();
  apiControls.status.textContent = 'Palette applied to mosaic';
  setStatus('Remote palette applied');
}

function refreshApiPreview() {
  const container = apiControls.preview;
  if (!container) return;
  container.innerHTML = '';
  const entries = [];
  if (apiState.apod) {
    entries.push({
      key: 'apod',
      title: apiState.apod.title || 'NASA APOD',
      caption: `${apiState.apod.title || 'NASA APOD'} ${apiState.apod.date ? `(${apiState.apod.date})` : ''}`.trim(),
      url: apiState.apod.url
    });
  }
  if (apiState.picsum) {
    entries.push({
      key: 'picsum',
      title: 'Picsum Scenic',
      caption: `Picsum Scenic ${apiState.picsum.date ? `(${apiState.picsum.date})` : ''}`.trim(),
      url: apiState.picsum.url
    });
  }
  if (apiState.art) {
    entries.push({
      key: 'art',
      title: apiState.art.title || 'Art Institute',
      caption: `${apiState.art.title || 'Art Institute'}${apiState.art.artist ? ` — ${apiState.art.artist}` : ''}`,
      url: apiState.art.url
    });
  }
  if (apiState.dog) {
    entries.push({
      key: 'dog',
      title: 'Canine Muse',
      caption: `Canine Muse ${apiState.dog.date ? `(${apiState.dog.date})` : ''}`.trim(),
      url: apiState.dog.url
    });
  }
  if (!entries.length) {
    const placeholder = document.createElement('p');
    placeholder.textContent = 'Use the buttons above to load imagery from NASA, Picsum, the Art Institute of Chicago, or the Dog CEO API.';
    container.append(placeholder);
  } else {
    entries.forEach((entry) => {
      const figure = document.createElement('figure');
      figure.className = `api-preview-item api-${entry.key}`;
      const img = document.createElement('img');
      img.src = entry.url;
      img.alt = entry.title;
      const caption = document.createElement('figcaption');
      caption.textContent = entry.caption;
      figure.append(img, caption);
      container.append(figure);
    });
  }
  if (apiState.palette.length) {
    const row = document.createElement('div');
    row.className = 'api-palette';
    apiState.palette.forEach((hex) => {
      const swatch = document.createElement('span');
      swatch.className = 'api-swatch';
      swatch.style.background = hex;
      swatch.title = hex;
      row.append(swatch);
    });
    container.append(row);
  }
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
  let index = 0;
  const register = (name, draw) => {
    const path = new Path2D();
    draw(path);
    shapes[name] = { path, index: index++ };
  };

  register('Circle', (p) => p.arc(0, 0, 1, 0, Math.PI * 2));
  register('Square', (p) => {
    p.rect(-1, -1, 2, 2);
  });
  register('Triangle', (p) => {
    p.moveTo(0, -1);
    p.lineTo(Math.cos((150 * Math.PI) / 180), Math.sin((150 * Math.PI) / 180));
    p.lineTo(Math.cos((30 * Math.PI) / 180), Math.sin((30 * Math.PI) / 180));
    p.closePath();
  });
  register('Star', (p) => {
    const spikes = 5;
    const outer = 1;
    const inner = 0.42;
    let rot = Math.PI / 2 * 3;
    p.moveTo(0, -outer);
    for (let i = 0; i < spikes; i++) {
      p.lineTo(Math.cos(rot) * outer, Math.sin(rot) * outer);
      rot += Math.PI / spikes;
      p.lineTo(Math.cos(rot) * inner, Math.sin(rot) * inner);
      rot += Math.PI / spikes;
    }
    p.closePath();
  });
  register('Hexagon', (p) => {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      if (i === 0) p.moveTo(x, y);
      else p.lineTo(x, y);
    }
    p.closePath();
  });
  register('Cross', (p) => {
    p.moveTo(-1, -0.35);
    p.lineTo(-0.35, -0.35);
    p.lineTo(-0.35, -1);
    p.lineTo(0.35, -1);
    p.lineTo(0.35, -0.35);
    p.lineTo(1, -0.35);
    p.lineTo(1, 0.35);
    p.lineTo(0.35, 0.35);
    p.lineTo(0.35, 1);
    p.lineTo(-0.35, 1);
    p.lineTo(-0.35, 0.35);
    p.lineTo(-1, 0.35);
    p.closePath();
  });
  register('Diamond', (p) => {
    p.moveTo(0, -1);
    p.lineTo(1, 0);
    p.lineTo(0, 1);
    p.lineTo(-1, 0);
    p.closePath();
  });
  register('Burst', (p) => {
    const spikes = 8;
    const outer = 1;
    const inner = 0.55;
    let angle = -Math.PI / 2;
    p.moveTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    for (let i = 0; i < spikes; i++) {
      p.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      angle += Math.PI / spikes;
      p.lineTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      angle += Math.PI / spikes;
    }
    p.closePath();
  });
  register('Blob', (p) => {
    p.moveTo(0, -1);
    p.bezierCurveTo(0.8, -0.9, 1.1, -0.2, 0.8, 0.4);
    p.bezierCurveTo(0.6, 1, -0.2, 1.1, -0.7, 0.6);
    p.bezierCurveTo(-1.2, 0.1, -0.9, -0.8, -0.2, -1);
    p.closePath();
  });
  return shapes;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('File read failed'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

function transferImageToSample(img) {
  stopCamera();
  state.videoActive = false;
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  sampleCanvas.width = width;
  sampleCanvas.height = height;
  sampleCtx.drawImage(img, 0, 0, width, height);
  lastSource = 'image';
  state.lastStillFrame = performance.now();
  queueRender();
}

function createParticleRenderer(shapeLibrary) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return null;
  try {
    const vertexSource = `#version 300 es\nlayout(location=0) in vec2 a_vertex;\nlayout(location=1) in vec2 a_offset;\nlayout(location=2) in float a_size;\nlayout(location=3) in vec4 a_color;\nlayout(location=4) in float a_shape;\nlayout(location=5) in float a_rotation;\nuniform vec2 u_resolution;\nout vec2 v_tex;\nout vec4 v_color;\nflat out float v_shape;\nout vec2 v_local;\nvoid main() {\n  vec2 unit = a_vertex;\n  vec2 local = unit * 2.0 - 1.0;\n  float c = cos(a_rotation);\n  float s = sin(a_rotation);\n  vec2 rotated = vec2(local.x * c - local.y * s, local.x * s + local.y * c);\n  vec2 position = a_offset + rotated * a_size;\n  vec2 zeroToOne = position / u_resolution;\n  vec2 clip = zeroToOne * 2.0 - 1.0;\n  gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);\n  v_tex = unit;\n  v_color = a_color;\n  v_shape = a_shape;\n  v_local = rotated;\n}`;
    const fragmentSource = `#version 300 es\nprecision highp float;\nuniform sampler2D u_shapeAtlas;\nuniform vec2 u_tileStep;\nuniform vec2 u_tileCount;\nuniform float u_outline;\nuniform float u_time;\nuniform float u_glimmer;\nin vec2 v_tex;\nin vec4 v_color;\nflat in float v_shape;\nin vec2 v_local;\nout vec4 outColor;\nvoid main() {\n  float cols = u_tileCount.x;\n  float rows = u_tileCount.y;\n  float index = v_shape;\n  float col = mod(index, cols);\n  float row = floor(index / cols);\n  vec2 base = vec2(col, row) * u_tileStep;\n  vec2 uv = base + v_tex * u_tileStep;\n  vec4 mask = texture(u_shapeAtlas, uv);\n  float fill = mask.r;\n  float outline = mask.g;\n  float alpha = fill;\n  if (alpha <= 0.001) { discard; }\n  vec3 color = v_color.rgb;\n  if (u_outline > 0.5) {\n    float edge = smoothstep(0.0, 1.0, outline);\n    color = mix(color, vec3(1.0), edge * 0.75);\n    alpha = max(alpha, outline);\n  }\n  if (u_glimmer > 0.0) {\n    float sparkle = sin(dot(v_local, vec2(12.9898, 78.233)) + u_time * 9.0 + index);\n    float glimmer = pow(max(sparkle * 0.5 + 0.5, 0.0), 8.0);\n    color += glimmer * 0.8;\n  }\n  color = clamp(color, 0.0, 1.0);\n  outColor = vec4(color, alpha * v_color.a);\n}`;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(info || 'Shader compile failed');
      }
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Program link failed');
    }

    const names = Object.keys(shapeLibrary).sort((a, b) => shapeLibrary[a].index - shapeLibrary[b].index);
    const tileSize = 128;
    const cols = Math.max(1, Math.ceil(Math.sqrt(names.length)));
    const rows = Math.max(1, Math.ceil(names.length / cols));
    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = cols * tileSize;
    atlasCanvas.height = rows * tileSize;
    const atlasCtx = atlasCanvas.getContext('2d');
    atlasCtx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);
    names.forEach((name, idx) => {
      const shape = shapeLibrary[name];
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      atlasCtx.save();
      atlasCtx.translate(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2);
      atlasCtx.scale((tileSize / 2) * 0.82, (tileSize / 2) * 0.82);
      atlasCtx.fillStyle = 'rgba(255,0,0,1)';
      atlasCtx.fill(shape.path);
      atlasCtx.strokeStyle = 'rgba(0,255,0,1)';
      atlasCtx.lineWidth = 0.3;
      atlasCtx.stroke(shape.path);
      atlasCtx.restore();
    });

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);

    const baseVertices = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1
    ]);
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, baseVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const floatsPerInstance = 9;
    const stride = floatsPerInstance * 4;
    const maxInstances = 25000;
    const instanceData = new Float32Array(maxInstances * floatsPerInstance);
    const instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, stride * maxInstances, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 8);
    gl.vertexAttribDivisor(2, 1);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, 12);
    gl.vertexAttribDivisor(3, 1);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 28);
    gl.vertexAttribDivisor(4, 1);
    gl.enableVertexAttribArray(5);
    gl.vertexAttribPointer(5, 1, gl.FLOAT, false, stride, 32);
    gl.vertexAttribDivisor(5, 1);

    gl.useProgram(program);
    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      outline: gl.getUniformLocation(program, 'u_outline'),
      time: gl.getUniformLocation(program, 'u_time'),
      glimmer: gl.getUniformLocation(program, 'u_glimmer'),
      tileStep: gl.getUniformLocation(program, 'u_tileStep'),
      tileCount: gl.getUniformLocation(program, 'u_tileCount'),
      shapeAtlas: gl.getUniformLocation(program, 'u_shapeAtlas')
    };
    gl.uniform1i(uniforms.shapeAtlas, 0);
    gl.uniform2f(uniforms.tileStep, tileSize / atlasCanvas.width, tileSize / atlasCanvas.height);
    gl.uniform2f(uniforms.tileCount, cols, rows);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return {
      canvas,
      draw(shapes, options) {
        const width = Math.max(1, Math.floor(options.width));
        const height = Math.max(1, Math.floor(options.height));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const count = Math.min(shapes.length, maxInstances);
        if (!count) {
          return;
        }
        for (let i = 0; i < count; i++) {
          const shape = shapes[i];
          const base = i * floatsPerInstance;
          instanceData[base] = shape.x;
          instanceData[base + 1] = shape.y;
          instanceData[base + 2] = shape.radius;
          const color = shape.color || { r: 255, g: 255, b: 255, a: 255 };
          instanceData[base + 3] = (color.r ?? 255) / 255;
          instanceData[base + 4] = (color.g ?? 255) / 255;
          instanceData[base + 5] = (color.b ?? 255) / 255;
          instanceData[base + 6] = (color.a ?? 255) / 255;
          instanceData[base + 7] = shape.shapeId ?? 0;
          instanceData[base + 8] = shape.rotation ?? 0;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceData.subarray(0, count * floatsPerInstance));
        gl.useProgram(program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.outline, options.outline ? 1 : 0);
        gl.uniform1f(uniforms.time, options.time || 0);
        gl.uniform1f(uniforms.glimmer, options.glimmer ? 1 : 0);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
      }
    };
  } catch (error) {
    console.warn('Particle renderer init failed', error);
    return null;
  }
}

