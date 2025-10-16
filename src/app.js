const canvas = document.getElementById('displayCanvas');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const sampleCanvas = document.getElementById('sampleCanvas');
const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
const videoEl = document.getElementById('video');
const downsampleCanvas = document.createElement('canvas');
const downsampleCtx = downsampleCanvas.getContext('2d');

const TAB_IDS = ['mosaic', 'glitch', 'aurora', 'particle', 'audio', 'nebula', 'wave', 'spectrum', 'ink', 'pulse', 'ai', 'api'];
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

const nebulaControls = {
  density: document.getElementById('nebulaDensity'),
  densityNumber: document.getElementById('nebulaDensityNumber'),
  swirl: document.getElementById('nebulaSwirl'),
  swirlNumber: document.getElementById('nebulaSwirlNumber'),
  speed: document.getElementById('nebulaSpeed'),
  speedNumber: document.getElementById('nebulaSpeedNumber'),
  palette: document.getElementById('nebulaPalette'),
  snap: document.getElementById('nebulaSnap')
};

const waveControls = {
  amplitude: document.getElementById('waveAmplitude'),
  amplitudeNumber: document.getElementById('waveAmplitudeNumber'),
  frequency: document.getElementById('waveFrequency'),
  frequencyNumber: document.getElementById('waveFrequencyNumber'),
  hue: document.getElementById('waveHue'),
  hueNumber: document.getElementById('waveHueNumber'),
  snap: document.getElementById('waveSnap')
};

const spectrumControls = {
  bands: document.getElementById('spectrumBands'),
  bandsNumber: document.getElementById('spectrumBandsNumber'),
  speed: document.getElementById('spectrumSpeed'),
  speedNumber: document.getElementById('spectrumSpeedNumber'),
  glow: document.getElementById('spectrumGlow'),
  glowNumber: document.getElementById('spectrumGlowNumber'),
  snap: document.getElementById('spectrumSnap')
};

const inkControls = {
  detail: document.getElementById('inkDetail'),
  detailNumber: document.getElementById('inkDetailNumber'),
  contrast: document.getElementById('inkContrast'),
  contrastNumber: document.getElementById('inkContrastNumber'),
  invert: document.getElementById('inkInvert'),
  snap: document.getElementById('inkSnap')
};

const pulseControls = {
  density: document.getElementById('pulseDensity'),
  densityNumber: document.getElementById('pulseDensityNumber'),
  depth: document.getElementById('pulseDepth'),
  depthNumber: document.getElementById('pulseDepthNumber'),
  trails: document.getElementById('pulseTrails'),
  snap: document.getElementById('pulseSnap')
};

const aiLabControls = {
  model: document.getElementById('aiPaletteModel'),
  prompt: document.getElementById('aiPrompt'),
  generate: document.getElementById('aiGenerate'),
  apply: document.getElementById('aiApplyPalette'),
  glow: document.getElementById('aiGlow'),
  glowNumber: document.getElementById('aiGlowNumber'),
  snap: document.getElementById('aiSnap'),
  previewRow: document.getElementById('aiPreviewRow'),
  preview: document.getElementById('aiPalettePreview')
};

const particleControls = {
  count: document.getElementById('particleCount'),
  countNumber: document.getElementById('particleCountNumber'),
  speed: document.getElementById('particleSpeed'),
  speedNumber: document.getElementById('particleSpeedNumber'),
  shape: document.getElementById('particleShape'),
  trail: document.getElementById('particleTrail'),
  palette: document.getElementById('particlePalette'),
  snap: document.getElementById('particleSnap')
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
  particleSpeed: document.getElementById('audioParticleSpeed'),
  particleSpeedNumber: document.getElementById('audioParticleSpeedNumber'),
  particleColor: document.getElementById('audioParticleColor'),
  particleColorNumber: document.getElementById('audioParticleColorNumber'),
  nebulaDensity: document.getElementById('audioNebulaDensity'),
  nebulaDensityNumber: document.getElementById('audioNebulaDensityNumber'),
  nebulaHue: document.getElementById('audioNebulaHue'),
  nebulaHueNumber: document.getElementById('audioNebulaHueNumber'),
  waveAmplitude: document.getElementById('audioWaveAmplitude'),
  waveAmplitudeNumber: document.getElementById('audioWaveAmplitudeNumber'),
  waveHue: document.getElementById('audioWaveHue'),
  waveHueNumber: document.getElementById('audioWaveHueNumber'),
  spectrumMotion: document.getElementById('audioSpectrumMotion'),
  spectrumMotionNumber: document.getElementById('audioSpectrumMotionNumber'),
  spectrumBrightness: document.getElementById('audioSpectrumBrightness'),
  spectrumBrightnessNumber: document.getElementById('audioSpectrumBrightnessNumber'),
  inkContrast: document.getElementById('audioInkContrast'),
  inkContrastNumber: document.getElementById('audioInkContrastNumber'),
  inkPaper: document.getElementById('audioInkPaper'),
  inkPaperNumber: document.getElementById('audioInkPaperNumber'),
  pulseDepth: document.getElementById('audioPulseDepth'),
  pulseDepthNumber: document.getElementById('audioPulseDepthNumber'),
  pulseTrails: document.getElementById('audioPulseTrails'),
  pulseTrailsNumber: document.getElementById('audioPulseTrailsNumber'),
  aiShift: document.getElementById('audioAiShift'),
  aiShiftNumber: document.getElementById('audioAiShiftNumber'),
  aiGlow: document.getElementById('audioAiGlow'),
  aiGlowNumber: document.getElementById('audioAiGlowNumber')
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
  Cyberwave: ['#01012b', '#0a0a6a', '#5f2eea', '#ff3ec9', '#ffd33d'],
  Vintage: ['#382923', '#705446', '#b88c6a', '#dfc7a3', '#f5ebd7'],
  Oceanic: ['#021220', '#0b3954', '#087e8b', '#bfd7ea', '#fffbfa'],
  Desert: ['#2d1b0d', '#7a3d1c', '#c66a2b', '#edc167', '#f8e5c9'],
  Monochrome: ['#0a0a0a', '#2f2f2f', '#595959', '#8d8d8d', '#d9d9d9']
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

const particleState = {
  particles: [],
  count: 4000,
  speed: 1.2,
  shapeName: 'mix',
  palette: 'aurora',
  trails: true,
  lastTime: 0
};

const nebulaState = {
  cloud: [],
  density: 6000,
  swirl: 1.2,
  speed: 0.8,
  palette: 'aurora',
  lastSeed: null
};

const waveState = {
  amplitude: 24,
  frequency: 1.8,
  hue: 180,
  phase: 0
};

const pulseState = {
  phases: [],
  density: 24,
  lastTime: 0,
  seed: 0
};

const apiState = {
  palette: [],
  apod: null,
  picsum: null,
  art: null,
  dog: null
};

const aiState = {
  palette: [],
  model: 'colormind',
  glow: 0.8,
  loading: false
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
    particle: { speed: 1, color: 60 },
    nebula: { density: 1.2, hue: 80 },
    wave: { amplitude: 0.9, hue: 90 },
    spectrum: { motion: 1, brightness: 0.7 },
    ink: { contrast: 0.8, paper: 0.4 },
    pulse: { depth: 1.1, trails: 0.5 },
    ai: { shift: 45, glow: 0.6 }
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
  randomSize: 8
};

const layoutModeInputs = document.querySelectorAll('input[name="layoutMode"]');

init();

function init() {
  initTabs();
  initControls();
  initParticleControls();
  initNebulaControls();
  initWaveControls();
  initSpectrumControls();
  initInkControls();
  initPulseControls();
  initAiControls();
  initApiControls();
  initAudioControls();
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
  } else if (tabId === 'particle') {
    renderParticleScene(performance.now());
  } else if (tabId === 'nebula') {
    renderNebula(performance.now());
  } else if (tabId === 'wave') {
    renderWave(performance.now());
  } else if (tabId === 'spectrum') {
    renderSpectrum(performance.now());
  } else if (tabId === 'ink') {
    renderInk();
  } else if (tabId === 'pulse') {
    renderPulse(performance.now());
  } else if (tabId === 'ai') {
    renderAiCanvas(performance.now());
  } else if (tabId === 'audio') {
    renderAudioDriven(performance.now());
  } else if (tabId === 'api') {
    refreshApiPreview();
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
    seedPulseField(pulseState.density);
    queueRender();
  });
  mosaicControls.randomizeSeed.addEventListener('click', () => {
    const newSeed = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    mosaicControls.seedInput.value = newSeed;
    state.seed = hashSeed(newSeed);
    seedPulseField(pulseState.density);
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

  const auroraRefresh = () => renderAurora(performance.now());
  auroraControls.bloom.addEventListener('input', auroraRefresh);
  auroraControls.drift.addEventListener('input', auroraRefresh);
  auroraControls.snap.addEventListener('click', () => {
    auroraRefresh();
    captureSnapshotToMosaic();
  });

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('resize', handleResize);
  updateSizeControlMode(state.mode);
  handleResize();
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
    particleControls.snap.disabled = true;
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
      renderParticleScene(performance.now());
    }
  });
  linkSliderNumber(particleControls.speed, particleControls.speedNumber, (value) => {
    particleState.speed = parseFloat(value);
    if (activeTab === 'particle') {
      renderParticleScene(performance.now());
    }
  });

  particleControls.shape.addEventListener('change', () => {
    particleState.shapeName = particleControls.shape.value;
    seedParticleField(true);
    if (activeTab === 'particle') {
      renderParticleScene(performance.now());
    }
  });
  particleControls.trail.addEventListener('change', () => {
    particleState.trails = particleControls.trail.checked;
    if (activeTab === 'particle') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderParticleScene(performance.now());
    }
  });
  particleControls.palette.addEventListener('change', () => {
    particleState.palette = particleControls.palette.value;
    if (activeTab === 'particle') {
      renderParticleScene(performance.now());
    }
  });
  particleControls.snap.addEventListener('click', () => {
    renderParticleScene(performance.now());
    captureSnapshotToMosaic();
    setStatus('Particle frame captured to mosaic');
  });

  seedParticleField(true);
}

function initNebulaControls() {
  if (!nebulaControls.density) return;
  linkSliderNumber(nebulaControls.density, nebulaControls.densityNumber, (value) => {
    nebulaState.density = clamp(parseInt(value, 10), 100, 24000);
    nebulaState.cloud = [];
    if (activeTab === 'nebula') {
      renderNebula(performance.now());
    }
  });
  linkSliderNumber(nebulaControls.swirl, nebulaControls.swirlNumber, (value) => {
    nebulaState.swirl = parseFloat(value);
    if (activeTab === 'nebula') {
      renderNebula(performance.now());
    }
  });
  linkSliderNumber(nebulaControls.speed, nebulaControls.speedNumber, (value) => {
    nebulaState.speed = parseFloat(value);
  });
  nebulaControls.palette.addEventListener('change', () => {
    nebulaState.palette = nebulaControls.palette.value;
    nebulaState.cloud = [];
    if (activeTab === 'nebula') {
      renderNebula(performance.now());
    }
  });
  nebulaControls.snap.addEventListener('click', () => {
    renderNebula(performance.now());
    captureSnapshotToMosaic();
    setStatus('Nebula frame captured to mosaic');
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
  waveControls.snap.addEventListener('click', () => {
    renderWave(performance.now());
    captureSnapshotToMosaic();
    setStatus('Wave frame captured to mosaic');
  });
}

function initSpectrumControls() {
  if (!spectrumControls.bands) return;
  linkSliderNumber(spectrumControls.bands, spectrumControls.bandsNumber, () => {
    if (activeTab === 'spectrum') renderSpectrum(performance.now());
  });
  linkSliderNumber(spectrumControls.speed, spectrumControls.speedNumber, () => {
    if (activeTab === 'spectrum') renderSpectrum(performance.now());
  });
  linkSliderNumber(spectrumControls.glow, spectrumControls.glowNumber, () => {
    if (activeTab === 'spectrum') renderSpectrum(performance.now());
  });
  spectrumControls.snap.addEventListener('click', () => {
    renderSpectrum(performance.now());
    captureSnapshotToMosaic();
    setStatus('Spectrum bloom captured to mosaic');
  });
}

function initInkControls() {
  if (!inkControls.detail) return;
  linkSliderNumber(inkControls.detail, inkControls.detailNumber, () => {
    if (activeTab === 'ink') renderInk();
  });
  linkSliderNumber(inkControls.contrast, inkControls.contrastNumber, () => {
    if (activeTab === 'ink') renderInk();
  });
  inkControls.invert.addEventListener('change', () => {
    if (activeTab === 'ink') renderInk();
  });
  inkControls.snap.addEventListener('click', () => {
    renderInk();
    captureSnapshotToMosaic();
    setStatus('Ink sketch sent to mosaic');
  });
}

function initPulseControls() {
  if (!pulseControls.density) return;
  linkSliderNumber(pulseControls.density, pulseControls.densityNumber, (value) => {
    seedPulseField(parseInt(value, 10));
    if (activeTab === 'pulse') renderPulse(performance.now());
  });
  linkSliderNumber(pulseControls.depth, pulseControls.depthNumber, () => {
    if (activeTab === 'pulse') renderPulse(performance.now());
  });
  pulseControls.trails.addEventListener('change', () => {
    if (activeTab === 'pulse') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderPulse(performance.now());
    }
  });
  pulseControls.snap.addEventListener('click', () => {
    renderPulse(performance.now());
    captureSnapshotToMosaic();
    setStatus('Pulse grid frozen to mosaic');
  });
  seedPulseField(parseInt(pulseControls.density.value, 10));
}

function initAiControls() {
  if (!aiLabControls.model) return;
  aiLabControls.model.addEventListener('change', () => {
    aiState.model = aiLabControls.model.value;
  });
  linkSliderNumber(aiLabControls.glow, aiLabControls.glowNumber, (value) => {
    aiState.glow = parseFloat(value);
    if (activeTab === 'ai') renderAiCanvas(performance.now());
  });
  aiLabControls.generate.addEventListener('click', () => {
    generateAiPalette().catch((error) => {
      setStatus(`AI palette failed: ${error.message}`);
    });
  });
  aiLabControls.apply.addEventListener('click', () => {
    if (!aiState.palette.length) return;
    state.palette = aiState.palette.map((hex) => hex.toUpperCase());
    refreshPaletteEditor();
    mosaicControls.palettePreset.value = 'Custom';
    state.colorMode = 'palette';
    mosaicControls.colorMode.value = 'palette';
    setStatus('AI palette applied to mosaic');
    queueRender(true);
  });
  aiLabControls.snap.addEventListener('click', () => {
    renderAiCanvas(performance.now());
    captureSnapshotToMosaic();
    setStatus('AI canvas captured to mosaic');
  });
  if (aiLabControls.apply) {
    aiLabControls.apply.disabled = true;
  }
  updateAiPreview();
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

  if (audioControls.particleSpeed) {
    linkSliderNumber(audioControls.particleSpeed, audioControls.particleSpeedNumber, (value) => {
      audioState.config.particle.speed = parseFloat(value);
    });
  }
  if (audioControls.particleColor) {
    linkSliderNumber(audioControls.particleColor, audioControls.particleColorNumber, (value) => {
      audioState.config.particle.color = parseFloat(value);
    });
  }
  if (audioControls.nebulaDensity) {
    linkSliderNumber(audioControls.nebulaDensity, audioControls.nebulaDensityNumber, (value) => {
      audioState.config.nebula.density = parseFloat(value);
    });
  }
  if (audioControls.nebulaHue) {
    linkSliderNumber(audioControls.nebulaHue, audioControls.nebulaHueNumber, (value) => {
      audioState.config.nebula.hue = parseFloat(value);
    });
  }
  if (audioControls.waveAmplitude) {
    linkSliderNumber(audioControls.waveAmplitude, audioControls.waveAmplitudeNumber, (value) => {
      audioState.config.wave.amplitude = parseFloat(value);
    });
  }
  if (audioControls.waveHue) {
    linkSliderNumber(audioControls.waveHue, audioControls.waveHueNumber, (value) => {
      audioState.config.wave.hue = parseFloat(value);
    });
  }
  if (audioControls.spectrumMotion) {
    linkSliderNumber(audioControls.spectrumMotion, audioControls.spectrumMotionNumber, (value) => {
      audioState.config.spectrum.motion = parseFloat(value);
    });
  }
  if (audioControls.spectrumBrightness) {
    linkSliderNumber(audioControls.spectrumBrightness, audioControls.spectrumBrightnessNumber, (value) => {
      audioState.config.spectrum.brightness = parseFloat(value);
    });
  }
  if (audioControls.inkContrast) {
    linkSliderNumber(audioControls.inkContrast, audioControls.inkContrastNumber, (value) => {
      audioState.config.ink.contrast = parseFloat(value);
    });
  }
  if (audioControls.inkPaper) {
    linkSliderNumber(audioControls.inkPaper, audioControls.inkPaperNumber, (value) => {
      audioState.config.ink.paper = parseFloat(value);
    });
  }
  if (audioControls.pulseDepth) {
    linkSliderNumber(audioControls.pulseDepth, audioControls.pulseDepthNumber, (value) => {
      audioState.config.pulse.depth = parseFloat(value);
    });
  }
  if (audioControls.pulseTrails) {
    linkSliderNumber(audioControls.pulseTrails, audioControls.pulseTrailsNumber, (value) => {
      audioState.config.pulse.trails = parseFloat(value);
    });
  }
  if (audioControls.aiShift) {
    linkSliderNumber(audioControls.aiShift, audioControls.aiShiftNumber, (value) => {
      audioState.config.ai.shift = parseFloat(value);
    });
  }
  if (audioControls.aiGlow) {
    linkSliderNumber(audioControls.aiGlow, audioControls.aiGlowNumber, (value) => {
      audioState.config.ai.glow = parseFloat(value);
    });
  }

  updateAudioTargetGroups();
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
    glitch: 'Glitch Forge slices frames into displaced bands, with optional scanlines, ready to snap back into the Mosaic lab.',
    aurora: 'Aurora Synth paints bloom-heavy ribbons and drift, useful for ambient backgrounds that can feed the Mosaic renderer.',
    particle: 'Particle Lab uses GPU instancing to animate thousands of shapes as living particles—tune count, drift, palette, and capture keyframes.',
    nebula: 'Nebula Weave builds a GPU particle galaxy from your palette—tune density, swirl, and speed to breathe motion into stills.',
    wave: 'Wave Lab ripples particles across the canvas using sine-driven displacement for liquid, glimmering mosaics.',
    spectrum: 'Spectrum Bloom transforms palettes into animated light bands—tune bands, drift, and glow for synthwave ribbons or soft washes.',
    ink: 'Ink Sketch converts your source into pen-stroke edges with adjustable detail, contrast, and invertible paper stock.',
    pulse: 'Pulse Grid stages instanced particles as a living grid of pulses—great for equalizer looks or motion-driven lattices.',
    ai: 'AI Studio queries neural palette services (Colormind/Huemint) or builds procedural schemes, then renders glowing gradients ready for mosaic capture.',
    api: 'API Fusion pulls NASA APOD, Picsum landscapes, Art Institute paintings, dog photography, and remote palettes into the studio for instant remixes.',
    audio: 'Audio Reactor syncs beats to your visuals—upload a track and drive every filter family with per-effect controls.'
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
  const customOption = document.createElement('option');
  customOption.value = 'Custom';
  customOption.textContent = 'Custom';
  mosaicControls.palettePreset.appendChild(customOption);
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
  if (activeTab === 'mosaic') {
    queueRender();
  } else if (activeTab === 'particle') {
    renderParticleScene(performance.now());
  } else if (activeTab === 'aurora') {
    renderAurora(performance.now());
  } else if (activeTab === 'glitch') {
    renderGlitch();
  } else if (activeTab === 'nebula') {
    renderNebula(performance.now());
  } else if (activeTab === 'wave') {
    renderWave(performance.now());
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
  const shouldForce = force || (activeTab === 'audio' && audioState.target === 'mosaic');
  renderMosaic(shouldForce);
}

function tick(ts) {
  updateAudioAnalysis();
  if (activeTab === 'mosaic') {
    if (previewActive) {
      if (ts - lastFrameTime > 1000 / 60) {
        renderMosaic();
        lastFrameTime = ts;
      }
    }
  } else if (activeTab === 'audio') {
    renderAudioDriven(ts);
  } else if (activeTab === 'particle') {
    renderParticleScene(ts);
  } else if (activeTab === 'aurora') {
    renderAurora(ts);
  } else if (activeTab === 'nebula') {
    renderNebula(ts);
  } else if (activeTab === 'wave') {
    renderWave(ts);
  } else if (activeTab === 'spectrum') {
    renderSpectrum(ts);
  } else if (activeTab === 'ink') {
    renderInk();
  } else if (activeTab === 'pulse') {
    renderPulse(ts);
  } else if (activeTab === 'ai') {
    renderAiCanvas(ts);
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
    return;
  }
  if (target === 'particle') {
    renderParticleScene(ts);
    return;
  }
  if (target === 'nebula') {
    renderNebula(ts);
    return;
  }
  if (target === 'wave') {
    renderWave(ts);
    return;
  }
  if (target === 'spectrum') {
    renderSpectrum(ts);
    return;
  }
  if (target === 'ink') {
    renderInk();
    return;
  }
  if (target === 'pulse') {
    renderPulse(ts);
    return;
  }
  if (target === 'ai') {
    renderAiCanvas(ts);
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
  if (!force && activeTab !== 'mosaic') return;
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
  state.particles = particles;
  mosaicControls.circleCount.textContent = particles.length.toLocaleString();
  mosaicControls.sampleResolution.textContent = `${sample.width}×${sample.height}`;
  setStatus(`Rendered ${particles.length} particles`);
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

function seedPulseField(density) {
  const dim = Math.max(2, density);
  const rng = mulberry32((state.seed ^ 0x39f1ab) + dim);
  pulseState.phases = [];
  for (let i = 0; i < dim * dim; i++) {
    pulseState.phases.push({
      phase: rng() * Math.PI * 2,
      speed: 0.6 + rng() * 1.1,
      hue: rng()
    });
  }
  pulseState.density = dim;
  pulseState.seed = state.seed;
}

function getParticlePaletteColors() {
  return resolvePaletteColors(particleState.palette);
}

function resolvePaletteColors(name) {
  let colors;
  if (name === 'custom') {
    colors = state.palette.length ? state.palette : palettePresets.Warm;
  } else if (particlePalettes[name]) {
    colors = particlePalettes[name];
  } else if (palettePresets[name]) {
    colors = palettePresets[name];
  } else {
    colors = palettePresets.Warm;
  }
  return colors.map((hex) => ({ ...hexToRgb(hex), a: 255 }));
}

function renderParticleScene(timestamp = performance.now()) {
  const shouldRender = activeTab === 'particle' || (activeTab === 'audio' && audioState.target === 'particle');
  if (!shouldRender) return;
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

  const audioInfluence = applyAudioToParticle({ speed: particleState.speed });
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
    particle.angle += dt * audioInfluence.speed * particle.speed;
    particle.orbit += dt * 0.2;
    const radius = baseRadius * (0.25 + particle.radius * 0.75);
    const wobble = Math.sin(particle.orbit + shimmer + particle.offset) * 0.15;
    const x = centerX + Math.cos(particle.angle) * radius;
    const y = centerY + Math.sin(particle.angle * 0.85 + particle.orbit) * radius * (0.9 + wobble * 0.2);
    particle.colorPhase = (particle.colorPhase + dt * 0.1) % 1;
    const paletteIndex = Math.floor(particle.colorPhase * paletteCount) % paletteCount;
    const baseColor = palette[paletteIndex];
    const hsv = rgbToHsv(baseColor);
    hsv.h = (hsv.h + audioInfluence.colorSwing + 1) % 1;
    const tinted = hsvToRgb(hsv);
    const color = { r: tinted.r, g: tinted.g, b: tinted.b, a: baseColor.a };
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
  const shouldRender = activeTab === 'nebula' || (activeTab === 'audio' && audioState.target === 'nebula');
  if (!shouldRender) return;
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
  const palette = resolvePaletteColors(nebulaState.palette === 'custom' ? 'custom' : nebulaState.palette);
  const audioInfluence = applyAudioToNebula();
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
    const hsv = rgbToHsv(baseColor);
    hsv.h = (hsv.h + audioInfluence.hueShift / 360 + 1) % 1;
    const tinted = hsvToRgb(hsv);
    const twinkle = 0.55 + 0.45 * Math.sin(time * 2.4 + seed.noise);
    const radius = Math.max(2.5, (3 + dist * 0.006 * (1 + twinkle)) * audioInfluence.densityFactor);
    shapes.push({
      x,
      y,
      radius,
      color: { r: tinted.r, g: tinted.g, b: tinted.b, a: baseColor.a },
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
  const shouldRender = activeTab === 'wave' || (activeTab === 'audio' && audioState.target === 'wave');
  if (!shouldRender) return;
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
  const waveAudio = applyAudioToWaveSettings({ amplitude: waveState.amplitude, hue: waveState.hue });
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `hsla(${(waveAudio.hue + 20) % 360}, 78%, 55%, 1)`);
  gradient.addColorStop(1, `hsla(${(waveAudio.hue + 200) % 360}, 65%, 14%, 1)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  const cols = Math.max(32, Math.floor(width / 18));
  const rows = Math.max(24, Math.floor(height / 18));
  const stepX = width / cols;
  const stepY = height / rows;
  const palette = resolvePaletteColors('Starlight');
  const shapes = [];
  const freq = waveState.frequency;
  const amp = waveAudio.amplitude;
  const time = timestamp * 0.001;
  const hueShift = (waveAudio.hue % 360) / 360;
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

function renderSpectrum(timestamp = performance.now()) {
  const shouldRender = activeTab === 'spectrum' || (activeTab === 'audio' && audioState.target === 'spectrum');
  if (!shouldRender) return;
  const width = canvas.width;
  const height = canvas.height;
  const baseBands = parseInt(spectrumControls.bands?.value ?? '24', 10) || 24;
  const baseSpeed = parseFloat(spectrumControls.speed?.value ?? '1.2');
  const baseGlow = parseFloat(spectrumControls.glow?.value ?? '0.6');
  const audioInfluence = applyAudioToSpectrum({ bands: baseBands, speed: baseSpeed, glow: baseGlow });
  const paletteHex = state.palette.length ? state.palette : palettePresets.Aurora;
  const paletteRgb = paletteHex.map((hex) => hexToRgb(hex));
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#04070d';
  ctx.fillRect(0, 0, width, height);
  const bands = Math.max(4, audioInfluence.bands);
  const time = timestamp * 0.00035 * audioInfluence.speed;
  for (let i = 0; i < bands; i++) {
    const t = (i / bands + time) % 1;
    const color = samplePaletteColor(paletteRgb, t + audioInfluence.hueShift / 360);
    const luminanceBoost = audioInfluence.brightness;
    const rgb = {
      r: clamp(color.r * luminanceBoost, 0, 255),
      g: clamp(color.g * luminanceBoost, 0, 255),
      b: clamp(color.b * luminanceBoost, 0, 255)
    };
    const next = samplePaletteColor(paletteRgb, t + 0.08 + audioInfluence.hueShift / 360);
    const rgbNext = {
      r: clamp(next.r * luminanceBoost, 0, 255),
      g: clamp(next.g * luminanceBoost, 0, 255),
      b: clamp(next.b * luminanceBoost, 0, 255)
    };
    const x0 = Math.floor((i / bands) * width);
    const x1 = Math.floor(((i + 1) / bands) * width + 1);
    const gradient = ctx.createLinearGradient(x0, 0, x1, height);
    gradient.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.85)`);
    gradient.addColorStop(1, `rgba(${rgbNext.r},${rgbNext.g},${rgbNext.b},0.85)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x0, 0, Math.max(1, x1 - x0), height);
  }
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = `rgba(255,255,255,${Math.min(0.55, 0.12 + audioInfluence.glow * 0.3)})`;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
  renderGlimmer({ canvasW: width, canvasH: height, jitterStrength: audioInfluence.glow });
}

function renderInk() {
  const shouldRender = activeTab === 'ink' || (activeTab === 'audio' && audioState.target === 'ink');
  if (!shouldRender) return;
  if (!ensureSourceReady()) return;
  const sample = downsampleSource();
  const detail = Math.max(1, parseInt(inkControls.detail?.value ?? '5', 10));
  const baseContrast = parseFloat(inkControls.contrast?.value ?? '1.2');
  const invert = !!inkControls.invert?.checked;
  const audioInfluence = applyAudioToInk({ contrast: baseContrast, paper: invert ? 1 : 0 });
  const contrast = audioInfluence.contrast;
  const paperFlash = invert ? audioInfluence.paper : Math.max(0, audioInfluence.paper - 0.2);
  const width = canvas.width;
  const height = canvas.height;
  const scaleX = width / sample.width;
  const scaleY = height / sample.height;
  ctx.clearRect(0, 0, width, height);
  const background = invert ? '#f5f4ee' : '#06080f';
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  const stroke = invert ? '#10131a' : '#fdfdf7';
  ctx.strokeStyle = stroke;
  ctx.lineCap = 'round';
  const data = sample.data;
  const threshold = 0.08;
  for (let y = 1; y < sample.height - 1; y += detail) {
    for (let x = 1; x < sample.width - 1; x += detail) {
      const idx = (y * sample.width + x) * 4;
      const lum = toGrayscale({ r: data[idx], g: data[idx + 1], b: data[idx + 2] }) / 255;
      const left = toGrayscale({
        r: data[idx - 4],
        g: data[idx - 3],
        b: data[idx - 2]
      }) / 255;
      const right = toGrayscale({
        r: data[idx + 4],
        g: data[idx + 5],
        b: data[idx + 6]
      }) / 255;
      const up = toGrayscale({
        r: data[idx - sample.width * 4],
        g: data[idx - sample.width * 4 + 1],
        b: data[idx - sample.width * 4 + 2]
      }) / 255;
      const down = toGrayscale({
        r: data[idx + sample.width * 4],
        g: data[idx + sample.width * 4 + 1],
        b: data[idx + sample.width * 4 + 2]
      }) / 255;
      const gx = right - left;
      const gy = down - up;
      const magnitude = Math.sqrt(gx * gx + gy * gy) * contrast;
      if (magnitude < threshold) continue;
      const centerX = (x + 0.5) * scaleX;
      const centerY = (y + 0.5) * scaleY;
      const angle = Math.atan2(gy, gx);
      const length = Math.max(2, Math.min(scaleX, scaleY) * (detail * 0.4 + magnitude * 6));
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.globalAlpha = clamp(magnitude, 0.15, 1);
      ctx.lineWidth = Math.max(0.6, Math.min(scaleX, scaleY) * 0.4);
      ctx.beginPath();
      ctx.moveTo(-length / 2, 0);
      ctx.lineTo(length / 2, 0);
      ctx.stroke();
      ctx.restore();
    }
  }
  if (paperFlash > 0.05) {
    ctx.globalAlpha = Math.min(0.4, paperFlash);
    ctx.fillStyle = invert ? 'rgba(14,18,28,0.08)' : 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }
}

function renderPulse(timestamp = performance.now()) {
  const shouldRender = activeTab === 'pulse' || (activeTab === 'audio' && audioState.target === 'pulse');
  if (!shouldRender) return;
  if (!particleRenderer) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#05080f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '16px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WebGL required for Pulse Grid', canvas.width / 2, canvas.height / 2);
    ctx.restore();
    return;
  }
  const density = Math.max(2, parseInt(pulseControls.density?.value ?? '24', 10));
  if (pulseState.density !== density || pulseState.seed !== state.seed || pulseState.phases.length !== density * density) {
    seedPulseField(density);
  }
  const width = canvas.width;
  const height = canvas.height;
  const dt = pulseState.lastTime ? Math.min(0.05, Math.max(0, (timestamp - pulseState.lastTime) / 1000)) : 0.016;
  pulseState.lastTime = timestamp;
  const baseDepth = parseFloat(pulseControls.depth?.value ?? '1');
  const trailsBase = pulseControls.trails?.checked ? 0.25 : 0;
  const audioInfluence = applyAudioToPulse({ depth: baseDepth, trails: trailsBase });
  const fade = Math.min(0.6, audioInfluence.trails + (pulseControls.trails?.checked ? 0.12 : 0));
  if (pulseControls.trails?.checked || audioInfluence.trails > 0.05) {
    ctx.fillStyle = `rgba(4,7,12,${Math.max(0.08, fade)})`;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#05080f';
    ctx.fillRect(0, 0, width, height);
  }
  const paletteHex = state.palette.length ? state.palette : palettePresets.Neon;
  const paletteRgb = paletteHex.map((hex) => hexToRgb(hex));
  const shapes = [];
  const stepX = width / density;
  const stepY = height / density;
  const time = timestamp * 0.0012;
  for (let y = 0; y < density; y++) {
    for (let x = 0; x < density; x++) {
      const index = y * density + x;
      const info = pulseState.phases[index];
      info.phase += dt * info.speed;
      const pulsate = Math.sin(info.phase + info.hue * 6 + time) * 0.5 + 0.5;
      const radius = Math.max(1.5, Math.min(stepX, stepY) * 0.25 * (0.6 + pulsate * audioInfluence.depth));
      const px = x * stepX + stepX / 2;
      const py = y * stepY + stepY / 2;
      const color = samplePaletteColor(paletteRgb, info.hue + pulsate * 0.1);
      shapes.push({
        x: px,
        y: py,
        radius,
        color: { r: color.r, g: color.g, b: color.b, a: 255 },
        shapeId: shapeLibrary[state.shapeName]?.index ?? shapeLibrary.Circle?.index ?? 0,
        rotation: info.phase
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

function renderAiCanvas(timestamp = performance.now()) {
  const shouldRender = activeTab === 'ai' || (activeTab === 'audio' && audioState.target === 'ai');
  if (!shouldRender) return;
  const width = canvas.width;
  const height = canvas.height;
  const paletteHex = aiState.palette.length
    ? aiState.palette
    : state.palette.length
    ? state.palette
    : palettePresets.Aurora;
  const paletteRgb = paletteHex.map((hex) => hexToRgb(hex));
  const audioInfluence = applyAudioToAi({ shift: 0, glow: aiState.glow });
  ctx.clearRect(0, 0, width, height);
  const layers = paletteRgb.length;
  for (let i = 0; i < layers; i++) {
    const base = paletteRgb[i];
    const hsv = rgbToHsv(base);
    hsv.h = (hsv.h + audioInfluence.shift / 360 + i * 0.02) % 1;
    const tinted = hsvToRgb(hsv);
    const next = paletteRgb[(i + 1) % layers];
    const nextTint = hsvToRgb({ ...rgbToHsv(next), h: (rgbToHsv(next).h + audioInfluence.shift / 360 + (i + 1) * 0.02) % 1 });
    const gradient = ctx.createLinearGradient(0, i * (height / layers), width, (i + 1) * (height / layers));
    gradient.addColorStop(0, `rgba(${tinted.r},${tinted.g},${tinted.b},0.9)`);
    gradient.addColorStop(1, `rgba(${nextTint.r},${nextTint.g},${nextTint.b},0.9)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, i * (height / layers), width, height / layers + 1);
  }
  ctx.globalCompositeOperation = 'overlay';
  const noiseStrength = 0.08 + Math.abs(Math.sin(timestamp * 0.001)) * 0.1;
  ctx.fillStyle = `rgba(255,255,255,${noiseStrength})`;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
  renderGlimmer({ canvasW: width, canvasH: height, jitterStrength: audioInfluence.glow });
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

function samplePaletteColor(palette, t) {
  if (!palette.length) {
    return { r: 255, g: 255, b: 255 };
  }
  const scaled = ((t % 1) + 1) % 1 * palette.length;
  const index = Math.floor(scaled) % palette.length;
  const next = (index + 1) % palette.length;
  const frac = scaled - Math.floor(scaled);
  const a = palette[index];
  const b = palette[next];
  return {
    r: a.r + (b.r - a.r) * frac,
    g: a.g + (b.g - a.g) * frac,
    b: a.b + (b.b - a.b) * frac
  };
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
  if (spectrumControls.bands) {
    spectrumControls.bands.value = 24;
    spectrumControls.bandsNumber.value = 24;
  }
  if (spectrumControls.speed) {
    spectrumControls.speed.value = 1.2;
    spectrumControls.speedNumber.value = 1.2;
  }
  if (spectrumControls.glow) {
    spectrumControls.glow.value = 0.6;
    spectrumControls.glowNumber.value = 0.6;
  }
  if (inkControls.detail) {
    inkControls.detail.value = 5;
    inkControls.detailNumber.value = 5;
    inkControls.contrast.value = 1.2;
    inkControls.contrastNumber.value = 1.2;
    inkControls.invert.checked = false;
  }
  if (pulseControls.density) {
    pulseControls.density.value = 24;
    pulseControls.densityNumber.value = 24;
    pulseControls.depth.value = 1;
    pulseControls.depthNumber.value = 1;
    pulseControls.trails.checked = true;
    seedPulseField(24);
  }
  aiState.palette = [];
  updateAiPreview();
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
    if (!previewActive) {
      previewActive = true;
      mosaicControls.previewToggle.checked = true;
      mosaicControls.previewStatus.textContent = 'Preview ON';
    }
    const options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 18_000_000 };
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

function applyAudioToParticle(settings) {
  const result = { speed: settings.speed, colorSwing: 0 };
  if (!audioState.running || audioState.target !== 'particle') {
    return result;
  }
  const level = audioState.level;
  const treble = audioState.treble;
  const cfg = audioState.config.particle;
  result.speed = clamp(settings.speed * (1 + level * cfg.speed), 0.1, 6);
  result.colorSwing = ((treble - 0.5) * cfg.color) / 180;
  return result;
}

function applyAudioToNebula() {
  const result = { densityFactor: 1, hueShift: 0 };
  if (!audioState.running || audioState.target !== 'nebula') {
    return result;
  }
  const level = audioState.level;
  const treble = audioState.treble;
  const cfg = audioState.config.nebula;
  result.densityFactor = clamp(1 + level * cfg.density, 0.3, 4);
  result.hueShift = (treble - 0.5) * cfg.hue;
  return result;
}

function applyAudioToWaveSettings(settings) {
  const result = { amplitude: settings.amplitude, hue: settings.hue };
  if (!audioState.running || audioState.target !== 'wave') {
    return result;
  }
  const level = audioState.level;
  const treble = audioState.treble;
  const cfg = audioState.config.wave;
  result.amplitude = clamp(settings.amplitude * (1 + level * cfg.amplitude), 0, 120);
  result.hue = (settings.hue + (treble - 0.5) * cfg.hue) % 360;
  if (result.hue < 0) result.hue += 360;
  return result;
}

function applyAudioToSpectrum(settings) {
  const result = { ...settings, bands: settings.bands, speed: settings.speed, glow: settings.glow, brightness: 1, hueShift: 0 };
  if (!audioState.running || audioState.target !== 'spectrum') {
    return result;
  }
  const level = audioState.level;
  const bass = audioState.bass;
  const treble = audioState.treble;
  const cfg = audioState.config.spectrum;
  result.speed = clamp(settings.speed + level * cfg.motion, 0, 12);
  result.bands = clamp(Math.round(settings.bands * (1 + bass * 0.5)), 4, 128);
  result.brightness = clamp(1 + level * cfg.brightness, 0.2, 3);
  result.glow = clamp(settings.glow + bass * 0.4, 0, 3);
  result.hueShift = (treble - 0.5) * 60;
  return result;
}

function applyAudioToInk(settings) {
  const result = { contrast: settings.contrast, paper: settings.paper };
  if (!audioState.running || audioState.target !== 'ink') {
    return result;
  }
  const level = audioState.level;
  const treble = audioState.treble;
  const cfg = audioState.config.ink;
  result.contrast = clamp(settings.contrast + level * cfg.contrast, 0, 4);
  result.paper = clamp(settings.paper + (treble - 0.5) * cfg.paper, 0, 1.5);
  return result;
}

function applyAudioToPulse(settings) {
  const result = { depth: settings.depth, trails: settings.trails };
  if (!audioState.running || audioState.target !== 'pulse') {
    return result;
  }
  const level = audioState.level;
  const bass = audioState.bass;
  const cfg = audioState.config.pulse;
  result.depth = clamp(settings.depth + level * cfg.depth, 0, 4);
  result.trails = clamp(settings.trails + bass * cfg.trails, 0, 1);
  return result;
}

function applyAudioToAi(settings) {
  const result = { shift: settings.shift, glow: settings.glow };
  if (!audioState.running || audioState.target !== 'ai') {
    return result;
  }
  const level = audioState.level;
  const treble = audioState.treble;
  const cfg = audioState.config.ai;
  result.shift = clamp(settings.shift + (treble - 0.5) * cfg.shift, -360, 360);
  result.glow = clamp(settings.glow + level * cfg.glow, 0, 4);
  return result;
}

async function fetchApodImage() {
  apiControls.status.textContent = 'Loading NASA APOD…';
  try {
    const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const imageUrl = data.media_type === 'image' ? data.url : data.thumbnail_url;
    if (!imageUrl) {
      throw new Error('No image available');
    }
    const img = await loadImage(imageUrl);
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
    apiControls.status.textContent = `APOD error: ${error.message}`;
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
    const img = await loadImage(url);
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
    apiControls.status.textContent = `Picsum error: ${error.message}`;
  }
}

async function fetchArtImage() {
  apiControls.status.textContent = 'Loading Art Institute artwork…';
  try {
    const rng = mulberry32(state.seed ^ 0x51ed2f1b);
    const page = Math.max(1, Math.floor(rng() * 100) + 1);
    const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=1&fields=id,title,image_id,artist_title,date_display`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    const record = payload.data?.[0];
    if (!record || !record.image_id) {
      throw new Error('No artwork available');
    }
    const url = `https://www.artic.edu/iiif/2/${record.image_id}/full/843,/0/default.jpg`;
    const img = await loadImage(url);
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
    await fetchMetMuseumFallback();
  }
}

async function fetchDogImage() {
  apiControls.status.textContent = 'Summoning canine muse…';
  try {
    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (!payload || payload.status !== 'success') {
      throw new Error('Dog API returned no image');
    }
    const url = payload.message;
    const img = await loadImage(url);
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

async function fetchMetMuseumFallback() {
  try {
    const search = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=landscape');
    if (!search.ok) {
      throw new Error(`Met search HTTP ${search.status}`);
    }
    const ids = await search.json();
    const objectIDs = ids?.objectIDs || [];
    if (!objectIDs.length) {
      throw new Error('Met search returned no results');
    }
    const rng = mulberry32(state.seed ^ 0x5d13f1);
    const id = objectIDs[Math.floor(rng() * objectIDs.length)];
    const recordRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
    if (!recordRes.ok) {
      throw new Error(`Met object HTTP ${recordRes.status}`);
    }
    const record = await recordRes.json();
    if (!record?.primaryImageLarge) {
      throw new Error('Met object missing image');
    }
    const img = await loadImage(record.primaryImageLarge);
    transferImageToSample(img);
    apiState.art = {
      title: record.title || 'Metropolitan Museum of Art',
      date: record.objectDate || '',
      artist: record.artistDisplayName || 'Unknown artist',
      url: record.primaryImageLarge
    };
    apiControls.status.textContent = 'Met Museum image loaded';
    refreshApiPreview();
    setStatus('Met Museum fallback imagery loaded');
  } catch (fallbackError) {
    apiControls.status.textContent = `Met fallback failed: ${fallbackError.message}`;
  }
}

async function fetchRemotePalette() {
  apiControls.status.textContent = 'Fetching palette…';
  try {
    const response = await fetch('https://www.colr.org/json/colors/random/7');
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
    apiControls.status.textContent = `Palette error: ${error.message}`;
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

async function generateAiPalette() {
  if (aiState.loading) return;
  aiState.loading = true;
  if (aiLabControls.generate) {
    aiLabControls.generate.disabled = true;
    aiLabControls.generate.textContent = 'Generating…';
  }
  setStatus('Generating AI-assisted palette…');
  const prompt = aiLabControls.prompt?.value.trim() || 'mosaic dream';
  const model = aiLabControls.model?.value || 'colormind';
  try {
    let palette;
    if (model === 'colormind') {
      palette = await requestColormindPalette(prompt);
    } else {
      palette = await requestHuemintPalette(prompt);
    }
    if (!palette.length) {
      throw new Error('Empty palette response');
    }
    aiState.palette = palette;
    setStatus('AI palette ready – preview updated');
  } catch (error) {
    console.warn('AI palette fallback', error);
    aiState.palette = buildProceduralPalette(prompt);
    setStatus(`AI service fallback used: ${error.message}`);
  } finally {
    aiState.loading = false;
    if (aiLabControls.generate) {
      aiLabControls.generate.disabled = false;
      aiLabControls.generate.textContent = 'Generate Palette';
    }
    updateAiPreview();
  }
}

async function requestColormindPalette(prompt) {
  const model = chooseColormindModel(prompt);
  const response = await fetch('https://colormind.io/api/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: ['N', 'N', 'N', 'N', 'N'] })
  });
  if (!response.ok) {
    throw new Error(`Colormind HTTP ${response.status}`);
  }
  const data = await response.json();
  if (!data || !Array.isArray(data.result)) {
    throw new Error('Colormind returned invalid data');
  }
  return data.result.map((rgb) => rgbToHex({ r: rgb[0], g: rgb[1], b: rgb[2] }));
}

async function requestHuemintPalette(prompt) {
  const response = await fetch('https://api.huemint.com/colorpalette', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'transformer',
      num_colors: 5,
      temperature: 0.75,
      adjacency: '111111',
      palette: null,
      seed: prompt || 'mosaic'
    })
  });
  if (!response.ok) {
    throw new Error(`Huemint HTTP ${response.status}`);
  }
  const data = await response.json();
  const palette = data?.results?.[0]?.palette;
  if (!Array.isArray(palette) || !palette.length) {
    throw new Error('Huemint returned no palette');
  }
  return palette.map((rgb) => {
    const [r, g, b] = rgb;
    return rgbToHex({ r: Math.round(r), g: Math.round(g), b: Math.round(b) });
  });
}

function chooseColormindModel(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('neon') || lower.includes('cyber')) return 'ui';
  if (lower.includes('nature') || lower.includes('forest')) return 'default';
  if (lower.includes('sunset') || lower.includes('warm')) return 'default';
  if (lower.includes('material')) return 'material';
  return 'default';
}

function buildProceduralPalette(prompt) {
  const seed = hashSeed(prompt || 'ai-fallback');
  const rng = mulberry32(seed);
  const palette = [];
  for (let i = 0; i < 5; i++) {
    const h = (rng() + i * 0.21) % 1;
    const s = 0.55 + rng() * 0.35;
    const v = 0.55 + rng() * 0.35;
    const rgb = hsvToRgb({ h, s, v });
    palette.push(rgbToHex(rgb));
  }
  return palette;
}

function updateAiPreview() {
  if (!aiLabControls.preview) return;
  aiLabControls.preview.innerHTML = '';
  if (!aiState.palette.length) {
    if (aiLabControls.previewRow) aiLabControls.previewRow.hidden = true;
    if (aiLabControls.apply) aiLabControls.apply.disabled = true;
    return;
  }
  if (aiLabControls.previewRow) aiLabControls.previewRow.hidden = false;
  aiState.palette.forEach((hex) => {
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.background = hex;
    const label = document.createElement('span');
    label.textContent = hex.toUpperCase();
    swatch.appendChild(label);
    aiLabControls.preview.appendChild(swatch);
  });
  if (aiLabControls.apply) aiLabControls.apply.disabled = false;
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

async function loadImage(source) {
  const resolveFromTag = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });

  if (source instanceof HTMLImageElement) {
    return source;
  }

  if (source instanceof Blob) {
    const objectUrl = URL.createObjectURL(source);
    try {
      const img = await resolveFromTag(objectUrl);
      return img;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  if (typeof source === 'string') {
    if (source.startsWith('data:') || source.startsWith('blob:') || source.startsWith('file:')) {
      return resolveFromTag(source);
    }
    try {
      const response = await fetch(source, { cache: 'no-store', mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      return await loadImage(blob);
    } catch (networkError) {
      console.warn('Direct fetch failed, falling back to tag load', networkError);
      return resolveFromTag(source);
    }
  }

  throw new Error('Unsupported image source');
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
        if (!count) return;
        for (let i = 0; i < count; i++) {
          const shape = shapes[i] || {};
          const base = i * floatsPerInstance;
          instanceData[base] = shape.x || 0;
          instanceData[base + 1] = shape.y || 0;
          instanceData[base + 2] = Math.max(0.001, shape.radius || 0);
          const color = shape.color || { r: 255, g: 255, b: 255, a: 255 };
          instanceData[base + 3] = clamp((color.r ?? 255) / 255, 0, 1);
          instanceData[base + 4] = clamp((color.g ?? 255) / 255, 0, 1);
          instanceData[base + 5] = clamp((color.b ?? 255) / 255, 0, 1);
          instanceData[base + 6] = clamp((color.a ?? 255) / 255, 0, 1);
          instanceData[base + 7] = shape.shapeId ?? 0;
          instanceData[base + 8] = typeof shape.rotation === 'number' ? shape.rotation : 0;
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

