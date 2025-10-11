# EKP Saturator

EKP Saturator is a JUCE 7 audio effect plugin (VST3/AU) focused on antialiased saturation, mastering-grade metering, and a responsive UI. The project targets C++17 and is configured via CMake.

## Features

- Multiple ADAA (antiderivative antialiasing) saturation models (tape, tube, diode, odd-symmetric, fold, crush).
- Oversampling with selectable FIR (linear-phase) or IIR (low-latency) filters and render-only HQ mode.
- Optional multiband workflow with Linkwitz-Riley crossovers and per-band tone shaping.
- Built-in loudness metering and true-peak limiter skeleton for integration with mastering chains.
- Analyzer, transfer curve display, and preset bar with hook points for factory content.

## Building

The project uses CMake and expects JUCE 7.0.12 as a dependency. By default JUCE is fetched automatically via `FetchContent`.

```bash
cmake -B build -G "Ninja" -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

On macOS the AU target is generated automatically. On Windows the VST3 target is generated under `build/EKPSaturator_artefacts`.

### IDE Integration

- **CLion / Visual Studio Code** – open the folder as a CMake project.
- **Xcode** – generate via `cmake -B build -G Xcode`.

## Testing

Run the JUCE unit tests target:

```bash
cmake --build build --target EKPTests
```

## Plugin Notes

- Latency is reported based on the selected oversampling filters. Switching oversampling factor or topology triggers a reconfiguration.
- The linear-phase option introduces extra latency that will be compensated by the host once reported.
- Loudness meters follow ITU-R BS.1770 K-weighting approximations and expose short-term and momentary readings.

## Presets

Factory preset hooks are declared inside the UI layer via the `PresetBar`. Implement the callbacks to load parameter snapshots or APVTS state.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
