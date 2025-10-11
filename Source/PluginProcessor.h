#pragma once

#include <JuceHeader.h>
#include "DSP/OversamplingWrapper.h"
#include "DSP/Crossover.h"
#include "DSP/Waveshapers.h"
#include "DSP/LimiterTP.h"
#include "DSP/LoudnessK.h"
#include "Utils/Smoothing.h"
#include "Utils/BlockFifo.h"
#include "Utils/SIMDUtils.h"

class EKPSaturatorAudioProcessor : public juce::AudioProcessor,
                                   private juce::ValueTree::Listener
{
public:
    EKPSaturatorAudioProcessor();
    ~EKPSaturatorAudioProcessor() override;

    //==============================================================================
    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

   #if ! JucePlugin_PreferredChannelConfigurations
    bool isBusesLayoutSupported(const BusesLayout& layouts) const override;
   #endif

    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    //==============================================================================
    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    //==============================================================================
    const juce::String getName() const override { return JucePlugin_Name; }

    bool acceptsMidi() const override { return false; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    double getTailLengthSeconds() const override { return 0.0; }

    //==============================================================================
    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram(int) override {}
    const juce::String getProgramName(int) override { return {}; }
    void changeProgramName(int, const juce::String&) override {}

    //==============================================================================
    void getStateInformation(juce::MemoryBlock& destData) override;
    void setStateInformation(const void* data, int sizeInBytes) override;

    juce::AudioProcessorValueTreeState& getValueTreeState() { return parameters; }

    const EKP::LoudnessResult getLoudnessState() const noexcept { return loudnessProcessor.getResult(); }
    const EKP::TruePeakResult getTruePeakState() const noexcept { return limiter.getTruePeakResult(); }

    double getLatencySeconds() const noexcept;

    enum class Mode { uniform = 0, multiband };

    Mode getMode() const noexcept { return static_cast<Mode>(parameters.getRawParameterValue("mode")->load()); }

    EKP::OversamplingWrapper& getOversampling() noexcept { return oversampling; }
    const EKP::OversamplingWrapper& getOversampling() const noexcept { return oversampling; }

    EKP::BlockFifo<float, 2048>& getSpectrumFifo() noexcept { return spectrumFifo; }
    EKP::BlockFifo<float, 2048>& getTransferCurveFifo() noexcept { return transferCurveFifo; }

    void pushTransferCurveSample(float input, float output);

private:
    static juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout();

    void valueTreePropertyChanged(juce::ValueTree& treeWhosePropertyHasChanged,
                                  const juce::Identifier& property) override;

    void updateOversampling();
    void updateMode();

    void processUniform(juce::dsp::AudioBlock<float>& block);
    void processMultiband(juce::dsp::AudioBlock<float>& block);

    void updateSmoothing();

    juce::AudioProcessorValueTreeState parameters;
    EKP::OversamplingWrapper oversampling;
    EKP::CrossoverProcessor crossover;
    EKP::WaveshaperBank waveshapers;
    EKP::LimiterTP limiter;
    EKP::LoudnessK loudnessProcessor;

    juce::dsp::Gain<float> dryWetGainDry;
    juce::dsp::Gain<float> dryWetGainWet;
    juce::dsp::Gain<float> outputTrim;

    EKP::BlockFifo<float, 2048> spectrumFifo;
    EKP::BlockFifo<float, 2048> transferCurveFifo;

    EKP::LinearSmoothedValue<float> driveSmoothed;
    EKP::LinearSmoothedValue<float> tiltSmoothed;

    double currentSampleRate = 44100.0;
    int latencySamples = 0;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(EKPSaturatorAudioProcessor)
};

