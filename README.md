# EKP Saturator

EKP Saturator is a JUCE 7 audio effect plugin (VST3/AU) focused on antialiased saturation, mastering-grade metering, and a responsive UI. The project targets C++17 and is configured via CMake.

## Features

- Multiple ADAA (antiderivative antialiasing) saturation models (tape, tube, diode, odd-symmetric, fold, crush).
- Oversampling with selectable FIR (linear-phase) or IIR (low-latency) filters and render-only HQ mode.
- Optional multiband workflow with Linkwitz-Riley crossovers and per-band tone shaping.
- Built-in loudness metering and true-peak limiter skeleton for integration with mastering chains.
- Analyzer, transfer curve display, and preset bar with hook points for factory content.

## Building & Running

### 1. Install prerequisites

- **CMake 3.22+** and a recent compiler toolchain that supports C++17
  (Visual Studio 2022, Xcode 14+, clang, or GCC 11+).
- **JUCE 7.0.12**. The default CMake flow fetches JUCE automatically, but if
  you are offline place a local JUCE checkout on disk and pass
  `-DJUCE_DIR=/path/to/JUCE` when configuring.
- *(Optional but recommended)* **Ninja** for faster multi-configuration builds.

### 2. Configure the project

```bash
cmake -S . -B build -G "Ninja" -DCMAKE_BUILD_TYPE=Release
```

If you prefer another generator, substitute `-G "Ninja"` with e.g. `-G "Xcode"`
or `-G "Visual Studio 17 2022"`.

### 3. Build the plugin binaries

```bash
cmake --build build --config Release
```

The build produces platform-specific artefacts inside
`build/EKPSaturator_artefacts/`. Look for:

- **Windows:** `EKPSaturator.vst3`
- **macOS:** `EKPSaturator.vst3` and `EKPSaturator.component` (AU)

### 4. Load the plugin in a host

Copy or symlink the generated artefacts to your DAW's plugin search paths and
rescan. For quick testing you can use JUCE's
[`AudioPluginHost`](https://github.com/juce-framework/JUCE/tree/master/extras/AudioPluginHost)
application: launch it, add the build output folder to the scan paths, and load
**EKP Saturator**.

### IDE Integration

- **CLion / Visual Studio Code** – open the folder as a CMake project.
- **Xcode** – generate via `cmake -B build -G Xcode`.
- **Visual Studio** – generate via `cmake -B build -G "Visual Studio 17 2022"`.

## Testing

After configuring the project, build and run the JUCE unit test target:

```bash
cmake --build build --target EKPTests --config Release
```

## Plugin Notes

- Latency is reported based on the selected oversampling filters. Switching oversampling factor or topology triggers a reconfiguration.
- The linear-phase option introduces extra latency that will be compensated by the host once reported.
- Loudness meters follow ITU-R BS.1770 K-weighting approximations and expose short-term and momentary readings.

## Presets

Factory preset hooks are declared inside the UI layer via the `PresetBar`. Implement the callbacks to load parameter snapshots or APVTS state.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
