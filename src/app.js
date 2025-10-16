const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const TAU = Math.PI * 2;

const SHAPES = [
  { id: "circle", label: "Circle", shaderType: 0 },
  { id: "square", label: "Square", shaderType: 1 },
  { id: "triangle", label: "Triangle", shaderType: 2 },
  { id: "hex", label: "Hexagon", shaderType: 3 },
  { id: "diamond", label: "Diamond", shaderType: 4 },
  { id: "star", label: "Star", shaderType: 5 },
  { id: "burst", label: "Burst", shaderType: 6 },
];

const PALETTE_PRESETS = {
  Warm: ["#f7b267", "#f79d65", "#f4845f", "#f27059", "#f25c54", "#d95d39", "#dc602e", "#bc3908"],
  Cool: ["#d7f9f1", "#9cf6fb", "#51e5ff", "#00a5cf", "#0077b6", "#023e8a", "#03045e", "#041562"],
  "Heat-Signature": ["#140152", "#3a0ca3", "#7209b7", "#f72585", "#ff5f40", "#ffb200", "#ffe066", "#faff81"],
  Exposed: ["#1b262c", "#0f4c75", "#3282b8", "#bbe1fa", "#f8f7f9", "#ff4f00", "#1f7a8c", "#bfdbf7"],
  Pastel: ["#f8edeb", "#fcd5ce", "#fae1dd", "#f9dcc4", "#fcd5ce", "#f8edeb", "#e8e8e4", "#d8e2dc"],
  Neon: ["#ff5f1f", "#fbff12", "#04d9ff", "#f700ff", "#ff124f", "#ff00a0", "#00f0ff", "#39ff14"],
  Muted: ["#2d3142", "#4f5d75", "#bfc0c0", "#ffffff", "#ef8354", "#a3a3a3", "#6d7275", "#8d99ae"],
  "High-Contrast": ["#111111", "#f5f5f5", "#ff5400", "#00a8e8", "#ffbd00", "#ff0054", "#2ec4b6", "#011627"],
  Aurora: ["#141852", "#2e1f71", "#5f0a87", "#a4508b", "#ff006a", "#ff6f91", "#ffd452", "#d0f4de"],
  Glimmer: ["#0f0f1a", "#3c1642", "#712b75", "#b55489", "#ffbf81", "#ffe9ce", "#f9f7f7", "#ffffff"],
  Spectrum: ["#140d4f", "#ff5800", "#ffd400", "#00c2ff", "#8a00d4", "#ff1d58", "#28df99", "#f7d716"],
};

const INFO_TEXT = {
  source: "Switch between live camera, uploads, and set aspect ratios. Mirror offers selfie-friendly input.",
  mode: "Uniform = grid, Random = Poisson GPU scatter, Hybrid mixes both for dense tiling.",
  color: "Sample original colors, convert to grayscale, or quantize via editable palette ranges.",
  jitter: "Animate particle radius/offset using brightness, hue, saturation, or procedural motion.",
  seed: "All noise is deterministic. Randomize or hold Chaos for rapid seed storms.",
  edit: "Freeze and adjust: click particles to move, duplicate, or delete them.",
  utility: "Export high bitrate video or PNG snapshots and restore defaults.",
  glitch: "Slice/offset scanlines and chroma split for datamosh-style snapshots.",
  aurora: "GPU-inspired aurora gradients with bloom/flow controls.",
  spectrum: "Pull palettes from an online API and apply instantly.",
  flow: "Noise-driven particle emission to capture as a starting texture.",
};

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seedFromString(value) {
  if (!value) return (Math.random() * 0xffffffff) >>> 0;
  return hashString(String(value));
}

function mulberry32(seed) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h, s, l) {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r;
  let g;
  let b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  const value = parseInt(clean, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgbToHex({ r, g, b }) {
  return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
}

function applyGamma(rgb, gamma) {
  if (gamma === 1) return { ...rgb };
  const inv = 1 / gamma;
  return {
    r: Math.pow(rgb.r / 255, inv) * 255,
    g: Math.pow(rgb.g / 255, inv) * 255,
    b: Math.pow(rgb.b / 255, inv) * 255,
  };
}

function toGrayscale(rgb) {
  const l = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
  return { r: l, g: l, b: l };
}

function nearestPaletteColor(rgb, palette) {
  let best = palette[0];
  let dist = Infinity;
  for (const hex of palette) {
    const p = hexToRgb(hex);
    const d = (p.r - rgb.r) ** 2 + (p.g - rgb.g) ** 2 + (p.b - rgb.b) ** 2;
    if (d < dist) {
      dist = d;
      best = hex;
    }
  }
  return hexToRgb(best);
}

function distanceSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}
class ParticleRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl =
      canvas.getContext("webgl2", {
        antialias: true,
        preserveDrawingBuffer: true,
        premultipliedAlpha: false,
      }) ||
      canvas.getContext("webgl", {
        antialias: true,
        preserveDrawingBuffer: true,
        premultipliedAlpha: false,
      });
    if (!this.gl) {
      throw new Error("WebGL not supported. A GPU-backed renderer is required.");
    }
    this.maxParticles = 0;
    this.count = 0;
    this.initProgram();
  }

  initProgram() {
    const gl = this.gl;
    const vertexSource = `#version 300 es\n
      precision highp float;\n
      layout(location = 0) in vec2 position;\n
      layout(location = 1) in vec2 instancePos;\n
      layout(location = 2) in float instanceSize;\n
      layout(location = 3) in float instanceAngle;\n
      layout(location = 4) in vec4 instanceColor;\n
      layout(location = 5) in float instanceShape;\n
      layout(location = 6) in vec2 instanceScale;\n
      uniform vec2 uResolution;\n
      out vec2 vLocal;\n
      out vec4 vColor;\n
      out float vShape;\n
      void main() {\n
        float s = sin(instanceAngle);\n
        float c = cos(instanceAngle);\n
        vec2 rotated = vec2(\n          position.x * c - position.y * s,\n
          position.x * s + position.y * c\n
        );\n
        vec2 scaled = rotated * instanceSize * instanceScale;\n
        vec2 world = instancePos + scaled;\n
        vec2 clip = (world / uResolution) * 2.0 - 1.0;\n
        gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);\n
        vLocal = rotated * instanceScale;\n
        vColor = instanceColor;\n
        vShape = instanceShape;\n
      }`;

    const fragmentSource = `#version 300 es\n
      precision highp float;\n
      in vec2 vLocal;\n
      in vec4 vColor;\n
      in float vShape;\n
      out vec4 fragColor;\n
      float circleMask(vec2 uv) {\n
        float d = length(uv);\n
        return 1.0 - smoothstep(0.95, 1.05, d);\n
      }\n
      float squareMask(vec2 uv) {\n
        float m = max(abs(uv.x), abs(uv.y));\n
        return 1.0 - smoothstep(0.95, 1.05, m);\n
      }\n
      float triangleMask(vec2 uv) {\n
        vec2 a = vec2(0.0, -1.0);\n
        vec2 b = vec2(0.866, 0.5);\n
        vec2 c = vec2(-0.866, 0.5);\n
        float w0 = sign((b.x - a.x) * (uv.y - a.y) - (b.y - a.y) * (uv.x - a.x));\n
        float w1 = sign((c.x - b.x) * (uv.y - b.y) - (c.y - b.y) * (uv.x - b.x));\n
        float w2 = sign((a.x - c.x) * (uv.y - c.y) - (a.y - c.y) * (uv.x - c.x));\n
        float inside = step(0.0, w0) * step(0.0, w1) * step(0.0, w2);\n
        float dist = max(max(abs(uv.x) + uv.y * 0.57735, -uv.y), abs(uv.x) + (uv.y * -0.57735));\n
        float edge = 1.0 - smoothstep(0.95, 1.05, dist);\n
        return inside * edge;\n
      }\n
      float hexMask(vec2 uv) {\n
        vec2 a = abs(uv);\n
        return 1.0 - smoothstep(0.95, 1.05, max(a.x * 0.57735 + a.y, a.x));\n
      }\n
      float diamondMask(vec2 uv) {\n
        float m = abs(uv.x) + abs(uv.y);\n
        return 1.0 - smoothstep(0.95, 1.05, m);\n
      }\n
      float starMask(vec2 uv) {\n
        float angle = atan(uv.y, uv.x);\n
        float radius = length(uv);\n
        float spikes = 5.0;\n
        float spoke = cos(angle * spikes);\n
        float r = mix(0.35, 1.0, abs(spoke));\n
        return 1.0 - smoothstep(r - 0.05, r + 0.05, radius);\n
      }\n
      float burstMask(vec2 uv) {\n
        float angle = atan(uv.y, uv.x);\n
        float radius = length(uv);\n
        float spikes = 8.0;\n
        float spoke = abs(sin(angle * spikes));\n
        float r = mix(0.3, 1.0, spoke);\n
        return 1.0 - smoothstep(r - 0.05, r + 0.05, radius);\n
      }\n
      void main() {\n
        float mask;\n
        if (vShape < 0.5) {\n
          mask = circleMask(vLocal);\n
        } else if (vShape < 1.5) {\n
          mask = squareMask(vLocal);\n
        } else if (vShape < 2.5) {\n
          mask = triangleMask(vLocal);\n
        } else if (vShape < 3.5) {\n
          mask = hexMask(vLocal);\n
        } else if (vShape < 4.5) {\n
          mask = diamondMask(vLocal);\n
        } else if (vShape < 5.5) {\n
          mask = starMask(vLocal);\n
        } else {\n
          mask = burstMask(vLocal);\n
        }\n
        if (mask <= 0.0) discard;\n
        fragColor = vec4(vColor.rgb, vColor.a) * mask;\n
      }`;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }

    this.program = program;
    gl.useProgram(program);

    this.uResolution = gl.getUniformLocation(program, "uResolution");

    const quad = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]);
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.instanceBuffer = gl.createBuffer();
    this.scaleBuffer = gl.createBuffer();
    this.ensureCapacity(1);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  ensureCapacity(count) {
    if (count <= this.maxParticles) return;
    const gl = this.gl;
    this.maxParticles = count;
    this.particleData = new Float32Array(count * 9);
    this.scaleData = new Float32Array(count * 2);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particleData.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 9 * 4, 0);
    gl.vertexAttribDivisor(1, 1);

    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 9 * 4, 2 * 4);
    gl.vertexAttribDivisor(2, 1);

    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 9 * 4, 3 * 4);
    gl.vertexAttribDivisor(3, 1);

    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 4, gl.FLOAT, false, 9 * 4, 4 * 4);
    gl.vertexAttribDivisor(4, 1);

    gl.enableVertexAttribArray(5);
    gl.vertexAttribPointer(5, 1, gl.FLOAT, false, 9 * 4, 8 * 4);
    gl.vertexAttribDivisor(5, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.scaleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.scaleData.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(6);
    gl.vertexAttribPointer(6, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(6, 1);
  }

  update(particles) {
    this.ensureCapacity(particles.length);
    const data = this.particleData;
    const scale = this.scaleData;
    let di = 0;
    let si = 0;
    for (const p of particles) {
      data[di++] = p.x;
      data[di++] = p.y;
      data[di++] = p.radius;
      data[di++] = p.rotation || 0;
      data[di++] = p.color.r / 255;
      data[di++] = p.color.g / 255;
      data[di++] = p.color.b / 255;
      data[di++] = p.alpha ?? 1;
      data[di++] = p.shapeType || 0;
      scale[si++] = p.scaleX ?? 1;
      scale[si++] = p.scaleY ?? 1;
    }
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, particles.length * 9));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.scaleBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, scale.subarray(0, particles.length * 2));
    this.count = particles.length;
  }

  draw(width, height) {
    const gl = this.gl;
    if (!this.count) {
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    if (gl.canvas.width !== width || gl.canvas.height !== height) {
      gl.canvas.width = width;
      gl.canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);
    gl.uniform2f(this.uResolution, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.count);
  }
}
const state = {
  activeTab: "mosaic",
  seed: seedFromString(Date.now().toString()),
  layoutMode: "uniform",
  resolution: 40,
  randomCount: 1500,
  sizeFactor: 0.9,
  colorMode: "source",
  gamma: 1,
  palette: [...PALETTE_PRESETS.Warm],
  paletteCenter: "#4fa3ff",
  paletteRange: 120,
  paletteDither: true,
  jitterMode: "none",
  jitterStrength: 1,
  motionDepth: 2,
  staticMotion: false,
  glimmer: true,
  chaosMode: "quiet",
  preview: true,
  mirror: true,
  outline: false,
  lockGrid: true,
  shape: SHAPES[0].id,
  hybridMix: 0.5,
  cameraActive: false,
  editMode: false,
  selectedParticle: -1,
  particles: [],
  mosaicBounds: { width: 1280, height: 720 },
  sampleWidth: 640,
  sampleHeight: 360,
  mosaicSourceReady: false,
  mosaicDirty: true,
  glimmerStrength: 0.3,
  chaosTimer: null,
  chaosBurst: false,
  previewFps: 0,
  recording: false,
  recorder: null,
  recordingChunks: [],
  apiPalette: null,
  aspectMode: "source",
  lastFrameTime: 0,
  samplePixels: null,
  sampleStride: 0,
};

const elements = {};

function captureElements() {
  const ids = [
    "displayCanvas",
    "video",
    "sampleCanvas",
    "statusText",
    "fpsText",
    "cameraToggle",
    "mirrorToggle",
    "fileInput",
    "aspectSelect",
    "previewToggle",
    "previewOnce",
    "startRecord",
    "stopRecord",
    "recordMode",
    "resSlider",
    "resNumber",
    "resLabel",
    "countSlider",
    "countNumber",
    "sizeSlider",
    "sizeNumber",
    "sizeLabel",
    "shapeSelect",
    "outlineToggle",
    "lockGrid",
    "colorMode",
    "gammaSlider",
    "gammaNumber",
    "palettePreset",
    "paletteApply",
    "paletteCenter",
    "paletteRange",
    "paletteEditor",
    "addColor",
    "resetPalette",
    "paletteDither",
    "jitterMode",
    "jitterStrength",
    "jitterNumber",
    "motionDepth",
    "motionDepthNumber",
    "staticMotionToggle",
    "glimmerToggle",
    "chaosMode",
    "chaosBurst",
    "seedInput",
    "randomizeSeed",
    "previewToggleBtn",
    "previewStatus",
    "circleCount",
    "sampleResolution",
    "editModeToggle",
    "editDuplicate",
    "editDelete",
    "savePNG",
    "resetAll",
    "glitchIntensity",
    "glitchIntensityNumber",
    "glitchScanline",
    "glitchChromatic",
    "glitchSnap",
    "auroraBloom",
    "auroraDrift",
    "auroraWaves",
    "auroraSnap",
    "apiKeyword",
    "apiFetch",
    "apiApply",
    "apiPalette",
    "flowEmission",
    "flowNoise",
    "flowColor",
    "flowSnap",
    "infoTooltip",
  ];
  ids.forEach((id) => {
    elements[id] = document.getElementById(id);
  });
}

const displayCanvas = () => elements.displayCanvas;
const videoElement = () => elements.video;
const sampleCanvas = () => elements.sampleCanvas;
const sampleCtx = () => sampleCanvas().getContext("2d");

let renderer;
let previewHandle = null;
function init() {
  captureElements();
  elements.previewToggle.checked = state.preview;
  elements.previewStatus.textContent = state.preview ? "Preview ON" : "Preview OFF";
  renderer = new ParticleRenderer(displayCanvas());
  initShapeOptions();
  initPaletteUI();
  bindControls();
  updateSizeLabel();
  setupTabs();
  setupInfoTooltips();
  setupKeyboardShortcuts();
  updateSeedDisplay();
  updateSampleResolutionLabel();
  resizeCanvas();
  schedulePreview();
  elements.statusText.textContent = "Ready";
}

function initShapeOptions() {
  const select = elements.shapeSelect;
  select.innerHTML = "";
  SHAPES.forEach((shape) => {
    const option = document.createElement("option");
    option.value = shape.id;
    option.textContent = shape.label;
    select.appendChild(option);
  });
  select.value = state.shape;
}

function initPaletteUI() {
  const preset = elements.palettePreset;
  preset.innerHTML = "";
  Object.keys(PALETTE_PRESETS).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    preset.appendChild(option);
  });
  preset.value = "Warm";
  rebuildPaletteEditor();
}

function rebuildPaletteEditor() {
  const container = elements.paletteEditor;
  container.innerHTML = "";
  state.palette.forEach((color, index) => {
    const swatch = document.createElement("div");
    swatch.className = "palette-swatch";
    const input = document.createElement("input");
    input.type = "color";
    input.value = color;
    input.addEventListener("input", () => {
      state.palette[index] = input.value;
      state.mosaicDirty = true;
    });
    const remove = document.createElement("button");
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      if (state.palette.length > 2) {
        state.palette.splice(index, 1);
        rebuildPaletteEditor();
        state.mosaicDirty = true;
      }
    });
    swatch.appendChild(input);
    swatch.appendChild(remove);
    container.appendChild(swatch);
  });
}

function updateSeedDisplay() {
  elements.seedInput.value = state.seed.toString();
}

function bindSliderPair(slider, number, onChange) {
  const sync = (value, trigger = true) => {
    slider.value = value;
    number.value = value;
    if (trigger) onChange(parseFloat(value));
  };
  slider.addEventListener("input", () => sync(slider.value));
  number.addEventListener("input", () => sync(number.value));
  number.addEventListener("change", () => sync(number.value));
  return sync;
}
function bindControls() {
  elements.cameraToggle.addEventListener("click", toggleCamera);
  elements.mirrorToggle.addEventListener("change", () => {
    state.mirror = elements.mirrorToggle.checked;
    state.mosaicDirty = true;
  });
  elements.fileInput.addEventListener("change", handleFileInput);
  elements.aspectSelect.addEventListener("change", () => {
    state.aspectMode = elements.aspectSelect.value;
    resizeCanvas();
  });
  elements.previewToggle.addEventListener("change", () => {
    state.preview = elements.previewToggle.checked;
    elements.previewStatus.textContent = state.preview ? "Preview ON" : "Preview OFF";
    if (state.preview) {
      schedulePreview();
    } else if (previewHandle) {
      cancelAnimationFrame(previewHandle);
      previewHandle = null;
    }
  });
  elements.previewOnce.addEventListener("click", () => renderFrame(true));
  elements.startRecord.addEventListener("click", startRecording);
  elements.stopRecord.addEventListener("click", stopRecording);

  document.querySelectorAll('input[name="layoutMode"]').forEach((input) => {
    if (input.checked) state.layoutMode = input.value;
    input.addEventListener("change", () => {
      if (input.checked) {
        state.layoutMode = input.value;
        updateSizeLabel();
        state.mosaicDirty = true;
      }
    });
  });

  bindSliderPair(elements.resSlider, elements.resNumber, (value) => {
    state.resolution = value;
    elements.resLabel.textContent = `${value} × ${value}`;
    state.mosaicDirty = true;
  })(state.resolution, false);

  bindSliderPair(elements.countSlider, elements.countNumber, (value) => {
    state.randomCount = value;
    state.mosaicDirty = true;
  })(state.randomCount, false);

  bindSliderPair(elements.sizeSlider, elements.sizeNumber, (value) => {
    state.sizeFactor = value;
    updateSizeLabel();
    state.mosaicDirty = true;
  })(state.sizeFactor, false);

  elements.shapeSelect.addEventListener("change", () => {
    state.shape = elements.shapeSelect.value;
    state.mosaicDirty = true;
  });

  elements.outlineToggle.addEventListener("change", () => {
    state.outline = elements.outlineToggle.checked;
    state.mosaicDirty = true;
  });

  elements.lockGrid.addEventListener("change", () => {
    state.lockGrid = elements.lockGrid.checked;
  });

  elements.colorMode.addEventListener("change", () => {
    state.colorMode = elements.colorMode.value;
    state.mosaicDirty = true;
  });

  bindSliderPair(elements.gammaSlider, elements.gammaNumber, (value) => {
    state.gamma = value;
    state.mosaicDirty = true;
  })(state.gamma, false);

  elements.palettePreset.addEventListener("change", () => {
    const palette = PALETTE_PRESETS[elements.palettePreset.value];
    if (palette) {
      state.palette = [...palette];
      rebuildPaletteEditor();
      state.mosaicDirty = true;
    }
  });

  elements.paletteApply.addEventListener("click", generatePaletteRange);
  elements.paletteCenter.addEventListener("input", () => {
    state.paletteCenter = elements.paletteCenter.value;
  });
  elements.paletteRange.addEventListener("input", () => {
    state.paletteRange = parseFloat(elements.paletteRange.value);
  });
  elements.addColor.addEventListener("click", () => {
    state.palette.push("#ffffff");
    rebuildPaletteEditor();
    state.mosaicDirty = true;
  });
  elements.resetPalette.addEventListener("click", () => {
    const palette = PALETTE_PRESETS[elements.palettePreset.value] || PALETTE_PRESETS.Warm;
    state.palette = [...palette];
    rebuildPaletteEditor();
    state.mosaicDirty = true;
  });
  elements.paletteDither.addEventListener("change", () => {
    state.paletteDither = elements.paletteDither.checked;
  });

  bindSliderPair(elements.jitterStrength, elements.jitterNumber, (value) => {
    state.jitterStrength = value;
    state.mosaicDirty = true;
  })(state.jitterStrength, false);
  bindSliderPair(elements.motionDepth, elements.motionDepthNumber, (value) => {
    state.motionDepth = value;
  })(state.motionDepth, false);

  elements.jitterMode.addEventListener("change", () => {
    state.jitterMode = elements.jitterMode.value;
    state.mosaicDirty = true;
  });
  elements.staticMotionToggle.addEventListener("change", () => {
    state.staticMotion = elements.staticMotionToggle.checked;
  });
  elements.glimmerToggle.addEventListener("change", () => {
    state.glimmer = elements.glimmerToggle.checked;
  });

  populateChaosModes();
  elements.chaosMode.addEventListener("change", () => {
    state.chaosMode = elements.chaosMode.value;
  });
  elements.chaosBurst.addEventListener("mousedown", () => startChaosBurst(true));
  elements.chaosBurst.addEventListener("mouseup", stopChaosBurst);
  elements.chaosBurst.addEventListener("mouseleave", stopChaosBurst);

  elements.seedInput.addEventListener("change", () => {
    state.seed = seedFromString(elements.seedInput.value);
    state.mosaicDirty = true;
  });
  elements.randomizeSeed.addEventListener("click", () => {
    state.seed = seedFromString(Date.now().toString());
    updateSeedDisplay();
    state.mosaicDirty = true;
  });

  elements.previewToggleBtn.addEventListener("click", togglePreviewButton);
  elements.previewStatus.textContent = "Preview ON";

  elements.editModeToggle.addEventListener("click", toggleEditMode);
  elements.editDuplicate.addEventListener("click", duplicateSelection);
  elements.editDelete.addEventListener("click", deleteSelection);

  elements.savePNG.addEventListener("click", downloadPNG);
  elements.resetAll.addEventListener("click", resetAll);

  bindSliderPair(elements.glitchIntensity, elements.glitchIntensityNumber, () => {})(elements.glitchIntensity.value, false);
  elements.glitchSnap.addEventListener("click", () => snapshotToMosaic(renderGlitchFrame()));
  elements.auroraSnap.addEventListener("click", () => snapshotToMosaic(renderAuroraFrame()));
  elements.flowSnap.addEventListener("click", () => snapshotToMosaic(renderFlowFrame()));

  elements.apiFetch.addEventListener("click", fetchPaletteFromApi);
  elements.apiApply.addEventListener("click", applyApiPalette);

  displayCanvas().addEventListener("click", onCanvasClick);
  displayCanvas().addEventListener("mousemove", onCanvasHover);
}
function populateChaosModes() {
  const modes = {
    quiet: {
      label: "Quiet Drift",
      apply: () => ({}),
    },
    shimmer: {
      label: "Shimmer Pulse",
      apply: (params, time) => ({
        glimmerStrength: 0.3 + 0.15 * Math.sin(time * 3),
        jitterStrength: params.jitterStrength * (1 + 0.3 * Math.sin(time * 2)),
      }),
    },
    tide: {
      label: "Tidal Blend",
      apply: (params, time) => ({
        hybridMix: 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(time * 0.7)),
        sizeFactor: params.sizeFactor * (0.8 + 0.2 * Math.sin(time * 0.6)),
      }),
    },
    jitterstorm: {
      label: "Jitter Storm",
      apply: () => ({ jitterMode: "position", jitterStrength: 2.2 }),
    },
    spectrum: {
      label: "Spectrum Sweep",
      apply: (params, time) => ({
        paletteCenter: rgbToHex(hslToRgb((time * 0.08) % 1, 0.8, 0.5)),
        paletteRange: 180,
      }),
    },
  };
  elements.chaosMode.innerHTML = "";
  Object.entries(modes).forEach(([key, value]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = value.label;
    elements.chaosMode.appendChild(option);
  });
  state.chaosDefinitions = modes;
}

function setupTabs() {
  document.querySelectorAll(".mode-tabs .tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".mode-tabs .tab").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      setActiveTab(button.dataset.tab);
    });
  });
}

function setActiveTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll(".control-group").forEach((group) => {
    const owner = group.getAttribute("data-tab-owner");
    group.hidden = owner && owner !== tab;
  });
  state.mosaicDirty = true;
}

function setupInfoTooltips() {
  const tooltip = elements.infoTooltip;
  document.querySelectorAll("button.info").forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      const key = btn.dataset.info;
      if (!INFO_TEXT[key]) return;
      tooltip.textContent = INFO_TEXT[key];
      const rect = btn.getBoundingClientRect();
      tooltip.style.left = `${rect.right + 8}px`;
      tooltip.style.top = `${rect.top}px`;
      tooltip.style.display = "block";
    });
    btn.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  });
}

function setupKeyboardShortcuts() {
  window.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea")) return;
    switch (event.key.toLowerCase()) {
      case "r":
        state.seed = seedFromString(Date.now().toString());
        updateSeedDisplay();
        state.mosaicDirty = true;
        break;
      case " ":
        event.preventDefault();
        renderFrame(true);
        break;
      case "p":
        togglePreviewButton();
        break;
      case "e":
        toggleEditMode();
        break;
      case "s":
        downloadPNG();
        break;
      default:
        break;
    }
  });
}
function togglePreviewButton() {
  state.preview = !state.preview;
  elements.previewToggleBtn.textContent = state.preview ? "Preview Off (P)" : "Preview On (P)";
  elements.previewStatus.textContent = state.preview ? "Preview ON" : "Preview OFF";
  elements.previewToggle.checked = state.preview;
  if (state.preview) {
    schedulePreview();
  } else if (previewHandle) {
    cancelAnimationFrame(previewHandle);
    previewHandle = null;
  }
}

function toggleCamera() {
  if (state.cameraActive) {
    stopCamera();
  } else {
    startCamera();
  }
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
    videoElement().srcObject = stream;
    state.cameraActive = true;
    elements.cameraToggle.textContent = "Stop Camera";
    state.mosaicDirty = true;
  } catch (error) {
    elements.statusText.textContent = `Camera unavailable: ${error.message}`;
  }
}

function stopCamera() {
  const stream = videoElement().srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  videoElement().srcObject = null;
  state.cameraActive = false;
  elements.cameraToggle.textContent = "Start Camera";
}

function handleFileInput(event) {
  const [file] = event.target.files;
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    state.imageSource = img;
    state.cameraActive = false;
    stopCamera();
    state.mosaicDirty = true;
  };
  img.src = URL.createObjectURL(file);
}

function resizeCanvas() {
  const wrapper = document.querySelector(".aspect-wrapper");
  const rect = wrapper.getBoundingClientRect();
  const canvas = displayCanvas();
  let width = rect.width;
  let height = rect.height;
  let aspect = getSourceAspect();
  if (state.aspectMode !== "source") {
    const [w, h] = state.aspectMode.split(":").map(Number);
    if (w && h) aspect = w / h;
  }
  if (width / height > aspect) {
    width = height * aspect;
  } else {
    height = width / aspect;
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  state.mosaicBounds.width = canvas.width;
  state.mosaicBounds.height = canvas.height;
  state.mosaicDirty = true;
}

function getSourceAspect() {
  const video = videoElement();
  if (state.cameraActive && video.videoWidth && video.videoHeight) {
    return video.videoWidth / video.videoHeight;
  }
  if (state.imageSource) {
    return state.imageSource.width / state.imageSource.height;
  }
  return 16 / 9;
}

function schedulePreview() {
  if (!state.preview) return;
  state.lastFrameTime = performance.now();
  const loop = (timestamp) => {
    if (!state.preview) return;
    previewHandle = requestAnimationFrame(loop);
    const delta = timestamp - (state.lastFrameTime || timestamp);
    state.lastFrameTime = timestamp;
    state.previewFps = Math.round(1000 / Math.max(delta, 1));
    elements.fpsText.textContent = `${state.previewFps} fps`;
    renderFrame(false, delta / 1000, timestamp / 1000);
  };
  previewHandle = requestAnimationFrame(loop);
}

function renderFrame(force = false, delta = 0.016, time = performance.now() / 1000) {
  updateSampleBuffer();
  if (!force && !state.preview) return;
  switch (state.activeTab) {
    case "mosaic":
      renderMosaic(delta, time, force);
      break;
    case "glitch":
      renderGlitchFrame();
      break;
    case "aurora":
      renderAuroraFrame(time);
      break;
    case "spectrum":
      renderSpectrumFrame(time);
      break;
    case "flow":
      renderFlowFrame(time);
      break;
    default:
      break;
  }
}

function updateSampleBuffer() {
  const canvas = sampleCanvas();
  const ctx = sampleCtx();
  const video = videoElement();
  const src = state.cameraActive && video.readyState >= 2 ? video : state.imageSource;
  if (!src) return;
  const ratio = src.videoWidth ? src.videoWidth / src.videoHeight : src.width / src.height;
  let width = state.sampleWidth;
  let height = Math.round(width / ratio);
  if (!height || !Number.isFinite(height)) {
    width = state.sampleWidth;
    height = state.sampleHeight;
  }
  canvas.width = width;
  canvas.height = height;
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  if (state.mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, 0, 0, width, height);
  ctx.restore();
  const imageData = ctx.getImageData(0, 0, width, height);
  state.samplePixels = imageData.data;
  state.sampleStride = width * 4;
  state.sampleWidth = width;
  state.sampleHeight = height;
  updateSampleResolutionLabel();
  state.mosaicSourceReady = true;
}
function sampleColorAt(x, y) {
  const canvas = sampleCanvas();
  if (!canvas.width || !canvas.height || !state.samplePixels) return { r: 0, g: 0, b: 0, a: 255 };
  const px = clamp(Math.round(x), 0, canvas.width - 1);
  const py = clamp(Math.round(y), 0, canvas.height - 1);
  const index = py * state.sampleStride + px * 4;
  const data = state.samplePixels;
  return { r: data[index], g: data[index + 1], b: data[index + 2], a: data[index + 3] };
}

function renderMosaic(delta, time, force = false) {
  if (!state.mosaicSourceReady) return;
  if (!force && !state.preview && !state.mosaicDirty) return;
  const params = buildMosaicParams(delta, time);
  state.particles = generateParticles(params);
  renderer.update(state.particles);
  renderer.draw(state.mosaicBounds.width, state.mosaicBounds.height);
  state.mosaicDirty = false;
  elements.circleCount.textContent = state.particles.length.toLocaleString();
}

function buildMosaicParams(delta, time) {
  const rng = mulberry32(state.seed);
  const palette = [...state.palette];
  const chaos = state.chaosDefinitions[state.chaosMode];
  const mods = chaos ? chaos.apply({
    jitterStrength: state.jitterStrength,
    sizeFactor: state.sizeFactor,
  }, time) : {};
  if (mods.paletteCenter) {
    state.paletteCenter = mods.paletteCenter;
    elements.paletteCenter.value = state.paletteCenter;
  }
  if (mods.paletteRange !== undefined) {
    state.paletteRange = mods.paletteRange;
    elements.paletteRange.value = state.paletteRange;
    generatePaletteRange();
  }
  return {
    w: state.mosaicBounds.width,
    h: state.mosaicBounds.height,
    sampleScaleX: sampleCanvas().width / state.mosaicBounds.width,
    sampleScaleY: sampleCanvas().height / state.mosaicBounds.height,
    rng,
    layoutMode: state.layoutMode,
    resolution: state.resolution,
    randomCount: state.randomCount,
    sizeFactor: mods.sizeFactor || state.sizeFactor,
    jitterMode: mods.jitterMode || state.jitterMode,
    jitterStrength: mods.jitterStrength || state.jitterStrength,
    motionDepth: state.motionDepth,
    staticMotion: state.staticMotion,
    glimmer: state.glimmer,
    glimmerStrength: mods.glimmerStrength || state.glimmerStrength,
    time,
    delta,
    gamma: state.gamma,
    colorMode: state.colorMode,
    palette,
    paletteDither: state.paletteDither,
    shape: state.shape,
    hybridMix: mods.hybridMix !== undefined ? mods.hybridMix : state.hybridMix,
    outline: state.outline,
  };
}

function generateParticles(params) {
  const particles = [];
  const rng = params.rng;
  const shapeType = SHAPES.find((shape) => shape.id === params.shape)?.shaderType ?? 0;

  const applyColor = (x, y, index) => {
    const sampleX = x * params.sampleScaleX;
    const sampleY = y * params.sampleScaleY;
    let rgb = sampleColorAt(sampleX, sampleY);
    rgb = applyGamma(rgb, params.gamma);
    if (params.colorMode === "grayscale") {
      rgb = toGrayscale(rgb);
    } else if (params.colorMode === "palette") {
      rgb = nearestPaletteColor(rgb, params.palette);
      if (params.paletteDither) {
        const n = (rng() - 0.5) * 0.1;
        rgb.r = clamp(rgb.r + n * 255, 0, 255);
        rgb.g = clamp(rgb.g + n * 255, 0, 255);
        rgb.b = clamp(rgb.b + n * 255, 0, 255);
      }
    }
    if (params.glimmer) {
      const pulse = params.glimmerStrength * (0.5 + 0.5 * Math.sin(index * 0.05 + params.time * 6));
      rgb.r = clamp(rgb.r + pulse * 180 * rng(), 0, 255);
      rgb.g = clamp(rgb.g + pulse * 150 * rng(), 0, 255);
      rgb.b = clamp(rgb.b + pulse * 200 * rng(), 0, 255);
    }
    return rgb;
  };

  const jitterRadius = (radius, color, index) => {
    const strength = params.jitterStrength;
    const hsl = rgbToHsl(color.r, color.g, color.b);
    const brightness = (color.r + color.g + color.b) / (3 * 255);
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    switch (params.jitterMode) {
      case "brightness":
        scale = 0.7 + (1 - brightness) * strength;
        break;
      case "hue":
        scale = 0.7 + hsl.h * strength;
        break;
      case "saturation":
        scale = 0.8 + hsl.s * strength;
        break;
      case "position":
        scale = 1;
        const angle = rng() * TAU + params.time;
        offsetX = Math.cos(angle + index * 0.01) * radius * strength * 0.6;
        offsetY = Math.sin(angle + index * 0.02) * radius * strength * 0.6;
        break;
      default:
        break;
    }
    if (params.staticMotion && params.jitterMode !== "position") {
      scale *= 0.8 + 0.4 * Math.sin(params.time * strength + index * 0.03);
      offsetX = Math.sin(index * 0.05 + params.time) * radius * params.motionDepth * 0.2;
      offsetY = Math.cos(index * 0.05 + params.time * 1.2) * radius * params.motionDepth * 0.2;
    }
    return { radius: radius * Math.max(scale, 0.05), offsetX, offsetY };
  };

  const pushParticle = (x, y, radius, index) => {
    const color = applyColor(x, y, index);
    const jitter = jitterRadius(radius, color, index);
    particles.push({
      x: x + jitter.offsetX,
      y: y + jitter.offsetY,
      radius: jitter.radius,
      rotation: rng() * TAU,
      color,
      alpha: 1,
      shapeType,
      scaleX: 1,
      scaleY: 1,
    });
  };

  if (params.layoutMode === "uniform" || params.layoutMode === "hybrid") {
    const grid = params.resolution;
    const cellW = params.w / grid;
    const cellH = params.h / grid;
    for (let gy = 0; gy < grid; gy += 1) {
      for (let gx = 0; gx < grid; gx += 1) {
        const cx = (gx + 0.5) * cellW;
        const cy = (gy + 0.5) * cellH;
        const radius = (Math.min(cellW, cellH) * params.sizeFactor) / 2;
        pushParticle(cx, cy, radius, particles.length);
      }
    }
  }

  if (params.layoutMode === "random" || params.layoutMode === "hybrid") {
    const target = params.layoutMode === "random" ? params.randomCount : Math.floor(params.randomCount * params.hybridMix);
    const radius = params.sizeFactor * (params.layoutMode === "random" ? 8 : Math.min(params.w, params.h) / params.resolution / 2);
    const sampler = poissonDiscSampler(params.w, params.h, Math.max(2, radius * 0.5), rng);
    let point;
    let count = 0;
    while ((point = sampler()) && count < target) {
      const base = radius * (0.5 + rng());
      pushParticle(point[0], point[1], base, particles.length);
      count += 1;
    }
  }

  if (state.outline) {
    const outlines = particles.map((p) => ({
      ...p,
      radius: p.radius * 1.05,
      color: { r: 10, g: 10, b: 10 },
      alpha: 0.8,
    }));
    particles.unshift(...outlines);
  }

  return particles;
}

function poissonDiscSampler(width, height, radius, rng) {
  const k = 30;
  const radius2 = radius * radius;
  const cellSize = radius / Math.SQRT2;
  const gridWidth = Math.ceil(width / cellSize);
  const gridHeight = Math.ceil(height / cellSize);
  const grid = new Array(gridWidth * gridHeight);
  const queue = [];

  const addSample = (sample) => {
    queue.push(sample);
    const gx = Math.floor(sample[0] / cellSize);
    const gy = Math.floor(sample[1] / cellSize);
    grid[gx + gy * gridWidth] = sample;
  };

  const first = [rng() * width, rng() * height];
  addSample(first);

  return function sample() {
    while (queue.length) {
      const index = Math.floor(rng() * queue.length);
      const samplePoint = queue[index];
      for (let i = 0; i < k; i += 1) {
        const angle = rng() * TAU;
        const magnitude = radius * (1 + rng());
        const candidate = [
          samplePoint[0] + Math.cos(angle) * magnitude,
          samplePoint[1] + Math.sin(angle) * magnitude,
        ];
        if (
          candidate[0] >= 0 &&
          candidate[0] < width &&
          candidate[1] >= 0 &&
          candidate[1] < height &&
          isFar(candidate)
        ) {
          addSample(candidate);
          return candidate;
        }
      }
      queue.splice(index, 1);
    }
    return undefined;
  };

  function isFar(candidate) {
    const gx = Math.floor(candidate[0] / cellSize);
    const gy = Math.floor(candidate[1] / cellSize);
    for (let y = -2; y <= 2; y += 1) {
      for (let x = -2; x <= 2; x += 1) {
        const neighbor = grid[(gx + x) + (gy + y) * gridWidth];
        if (!neighbor) continue;
        if (distanceSq({ x: neighbor[0], y: neighbor[1] }, { x: candidate[0], y: candidate[1] }) < radius2) {
          return false;
        }
      }
    }
    return true;
  }
}

function updateSizeLabel() {
  elements.sizeLabel.textContent = state.layoutMode === "uniform"
    ? `${Number(state.sizeFactor).toFixed(2)}× cell`
    : `${Math.round(state.sizeFactor * 10)}px base`;
}

function updateSampleResolutionLabel() {
  elements.sampleResolution.textContent = `${state.sampleWidth}×${state.sampleHeight}`;
}
function toggleEditMode() {
  state.editMode = !state.editMode;
  elements.editModeToggle.textContent = state.editMode ? "Exit Edit (E)" : "Enter Edit (E)";
  elements.editDuplicate.disabled = !state.editMode;
  elements.editDelete.disabled = !state.editMode;
}

function onCanvasClick(event) {
  if (!state.editMode) return;
  const rect = displayCanvas().getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * state.mosaicBounds.width;
  const y = ((event.clientY - rect.top) / rect.height) * state.mosaicBounds.height;
  let closest = -1;
  let best = Infinity;
  state.particles.forEach((p, index) => {
    const d = distanceSq({ x, y }, p);
    if (d < p.radius * p.radius && d < best) {
      best = d;
      closest = index;
    }
  });
  state.selectedParticle = closest;
  if (closest >= 0) {
    elements.statusText.textContent = `Selected particle #${closest + 1}`;
  }
}

function onCanvasHover(event) {
  if (!state.editMode || state.selectedParticle < 0 || event.buttons !== 1) return;
  const rect = displayCanvas().getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * state.mosaicBounds.width;
  const y = ((event.clientY - rect.top) / rect.height) * state.mosaicBounds.height;
  const particle = state.particles[state.selectedParticle];
  particle.x = clamp(x, 0, state.mosaicBounds.width);
  particle.y = clamp(y, 0, state.mosaicBounds.height);
  renderer.update(state.particles);
  renderer.draw(state.mosaicBounds.width, state.mosaicBounds.height);
}

function duplicateSelection() {
  if (state.selectedParticle < 0) return;
  const particle = { ...state.particles[state.selectedParticle] };
  particle.x += 10;
  particle.y += 10;
  state.particles.push(particle);
  renderer.update(state.particles);
  renderer.draw(state.mosaicBounds.width, state.mosaicBounds.height);
}

function deleteSelection() {
  if (state.selectedParticle < 0) return;
  state.particles.splice(state.selectedParticle, 1);
  state.selectedParticle = -1;
  renderer.update(state.particles);
  renderer.draw(state.mosaicBounds.width, state.mosaicBounds.height);
}
function downloadPNG() {
  const link = document.createElement("a");
  link.download = "circles.png";
  link.href = displayCanvas().toDataURL("image/png");
  link.click();
}

function resetAll() {
  state.seed = seedFromString(Date.now().toString());
  updateSeedDisplay();
  elements.resSlider.value = state.resolution = 40;
  elements.resNumber.value = 40;
  elements.countSlider.value = state.randomCount = 1500;
  elements.countNumber.value = 1500;
  elements.sizeSlider.value = state.sizeFactor = 0.9;
  elements.sizeNumber.value = 0.9;
  elements.gammaSlider.value = state.gamma = 1;
  elements.gammaNumber.value = 1;
  elements.jitterStrength.value = state.jitterStrength = 1;
  elements.jitterNumber.value = 1;
  elements.motionDepth.value = state.motionDepth = 2;
  elements.motionDepthNumber.value = 2;
  state.palette = [...PALETTE_PRESETS.Warm];
  rebuildPaletteEditor();
  state.mosaicDirty = true;
}

function startChaosBurst(hold) {
  if (state.chaosTimer) return;
  state.chaosBurst = true;
  state.chaosTimer = setInterval(() => {
    state.seed = seedFromString(`${Date.now()}-${Math.random()}`);
    updateSeedDisplay();
    state.mosaicDirty = true;
  }, 1000 / 60);
  if (!hold) {
    setTimeout(stopChaosBurst, 4000);
  }
}

function stopChaosBurst() {
  state.chaosBurst = false;
  if (state.chaosTimer) {
    clearInterval(state.chaosTimer);
    state.chaosTimer = null;
  }
}

function startRecording() {
  if (state.recording) return;
  const stream = displayCanvas().captureStream(60);
  const options = { mimeType: "video/webm;codecs=vp9", videoBitsPerSecond: 8_000_000 };
  const recorder = new MediaRecorder(stream, options);
  state.recordingChunks = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) state.recordingChunks.push(event.data);
  };
  recorder.onstop = () => {
    const blob = new Blob(state.recordingChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mosaic.webm";
    link.click();
    URL.revokeObjectURL(url);
  };
  recorder.start();
  state.recording = true;
  state.recorder = recorder;
  elements.startRecord.disabled = true;
  elements.stopRecord.disabled = false;
  elements.statusText.textContent = "Recording...";
}

function stopRecording() {
  if (!state.recording || !state.recorder) return;
  state.recorder.stop();
  state.recording = false;
  elements.startRecord.disabled = false;
  elements.stopRecord.disabled = true;
  elements.statusText.textContent = "Recording saved";
}

function generatePaletteRange() {
  const center = hexToRgb(state.paletteCenter);
  const base = rgbToHsl(center.r, center.g, center.b);
  const range = state.paletteRange / 360;
  const count = state.palette.length || 8;
  const palette = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(count - 1, 1) - 0.5;
    const color = hslToRgb((base.h + t * range + 1) % 1, clamp(base.s + t * range, 0, 1), clamp(base.l + t * range * 0.5, 0, 1));
    palette.push(rgbToHex(color));
  }
  state.palette = palette;
  rebuildPaletteEditor();
  state.mosaicDirty = true;
}

function snapshotToMosaic(dataUrl) {
  if (!dataUrl) return;
  const img = new Image();
  img.onload = () => {
    state.imageSource = img;
    state.cameraActive = false;
    stopCamera();
    state.mosaicDirty = true;
  };
  img.src = dataUrl;
}

function renderGlitchFrame() {
  const canvas = displayCanvas();
  const ctx = canvas.getContext("2d");
  updateSampleBuffer();
  ctx.drawImage(sampleCanvas(), 0, 0, canvas.width, canvas.height);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const intensity = parseFloat(elements.glitchIntensity.value);
  if (elements.glitchScanline.checked) {
    for (let y = 0; y < canvas.height; y += 2) {
      const offset = ((Math.random() - 0.5) * 40 * intensity) | 0;
      const start = y * canvas.width * 4;
      const row = data.slice(start, start + canvas.width * 4);
      data.set(row, clamp(start + offset * 4, 0, data.length - row.length));
    }
  }
  if (elements.glitchChromatic.checked) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + ((Math.random() > 0.5 ? 4 : -4) | 0)] || data[i];
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

function renderAuroraFrame(time = performance.now() / 1000) {
  const canvas = displayCanvas();
  const ctx = canvas.getContext("2d");
  const bloom = parseFloat(elements.auroraBloom.value);
  const drift = parseFloat(elements.auroraDrift.value);
  const waves = parseInt(elements.auroraWaves.value, 10);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  for (let i = 0; i <= waves; i += 1) {
    const t = i / Math.max(1, waves);
    const hue = ((time * 0.08 + t * drift) % 1) * 360;
    gradient.addColorStop(t, `hsla(${hue}, 80%, ${50 + Math.sin(time + t * 8) * 20}%, 1)`);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "screen";
  ctx.filter = `blur(${bloom}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = "none";
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";
  return canvas.toDataURL("image/png");
}

function renderSpectrumFrame(time = performance.now() / 1000) {
  const canvas = displayCanvas();
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  for (let i = 0; i <= 10; i += 1) {
    const t = i / 10;
    gradient.addColorStop(t, `hsl(${((t + time * 0.1) % 1) * 360}, 80%, 60%)`);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 0.25;
  ctx.drawImage(sampleCanvas(), 0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
}

function renderFlowFrame(time = performance.now() / 1000) {
  const canvas = displayCanvas();
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const emission = parseFloat(elements.flowEmission.value);
  const noise = parseFloat(elements.flowNoise.value);
  const colorDrift = parseFloat(elements.flowColor.value);
  const count = Math.floor(emission * 0.08);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.sin(time * noise + i) * TAU;
    const radius = Math.cos(time * 0.7 + i) * 0.5 + 0.5;
    const x = Math.cos(angle) * canvas.width * 0.4 + canvas.width / 2;
    const y = Math.sin(angle * 0.7) * canvas.height * 0.4 + canvas.height / 2;
    ctx.fillStyle = `hsla(${((time * 40 + i * colorDrift * 120) % 360)}, 80%, 60%, 0.6)`;
    ctx.beginPath();
    ctx.arc(x, y, 3 + radius * 6, 0, TAU);
    ctx.fill();
  }
  return canvas.toDataURL("image/png");
}

async function fetchPaletteFromApi() {
  const keyword = elements.apiKeyword.value.trim() || "aurora";
  const hashed = seedFromString(keyword).toString(16).slice(0, 6);
  try {
    const response = await fetch(`https://www.thecolorapi.com/scheme?hex=${hashed}&mode=analogic&count=8`);
    const json = await response.json();
    const colors = json.colors.map((c) => c.hex.value);
    state.apiPalette = colors;
    const list = elements.apiPalette;
    list.innerHTML = "";
    colors.forEach((color) => {
      const li = document.createElement("li");
      li.textContent = color;
      li.style.background = color;
      list.appendChild(li);
    });
  } catch (error) {
    elements.statusText.textContent = `API error: ${error.message}`;
  }
}

function applyApiPalette() {
  if (!state.apiPalette) return;
  state.palette = [...state.apiPalette];
  rebuildPaletteEditor();
  state.mosaicDirty = true;
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
document.addEventListener("mouseup", stopChaosBurst);
document.addEventListener("mouseleave", stopChaosBurst);

init();
