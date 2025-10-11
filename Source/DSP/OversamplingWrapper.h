#pragma once

#include <JuceHeader.h>

namespace EKP
{
    class OversamplingWrapper
    {
    public:
        enum class Mode { iirFast = 0, firLinear };

        void prepare(double sampleRate, int samplesPerBlock, int channels)
        {
            currentSampleRate = sampleRate;
            currentBlockSize = samplesPerBlock;
            numChannels = channels;
            updateOversampling();
        }

        void reset()
        {
            if (oversampling)
                oversampling->reset();
        }

        void setParameters(int factor, Mode mode)
        {
            oversamplingFactor = juce::jlimit(1, 16, factor);
            oversamplingMode = mode;
            updateOversampling();
        }

        juce::dsp::Oversampling<float>* get() noexcept { return oversampling.get(); }
        const juce::dsp::Oversampling<float>* get() const noexcept { return oversampling.get(); }

        int getLatencySamples() const noexcept { return oversampling ? oversampling->getLatencyInSamples() : 0; }

        juce::dsp::AudioBlock<float> processUp(juce::dsp::AudioBlock<float>& block)
        {
            if (! oversampling)
                return block;
            return oversampling->processSamplesUp(block);
        }

        void processDown(juce::dsp::AudioBlock<float>& block)
        {
            if (oversampling)
                oversampling->processSamplesDown(block);
        }

    private:
        void updateOversampling()
        {
            if (numChannels <= 0)
                return;

            auto factorIndex = static_cast<int>(std::log2(static_cast<float>(oversamplingFactor)));
            factorIndex = juce::jmax(0, factorIndex);

            juce::dsp::Oversampling<float>::FilterType filterType = juce::dsp::Oversampling<float>::FilterType::filterHalfBandFIREquiripple;
            if (oversamplingMode == Mode::iirFast)
                filterType = juce::dsp::Oversampling<float>::FilterType::filterHalfBandPolyphaseIIR;

            oversampling = std::make_unique<juce::dsp::Oversampling<float>>(static_cast<size_t>(numChannels),
                                                                            static_cast<size_t>(factorIndex),
                                                                            filterType);

            juce::dsp::ProcessSpec spec{ currentSampleRate, static_cast<juce::uint32>(currentBlockSize), static_cast<juce::uint32>(numChannels) };
            oversampling->initProcessing(static_cast<size_t>(currentBlockSize));
            oversampling->reset();
            oversampling->prepare(spec);
        }

        std::unique_ptr<juce::dsp::Oversampling<float>> oversampling;
        int oversamplingFactor = 1;
        Mode oversamplingMode = Mode::iirFast;
        double currentSampleRate = 44100.0;
        int currentBlockSize = 512;
        int numChannels = 2;
    };
}

