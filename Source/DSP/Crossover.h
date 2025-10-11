#pragma once

#include <JuceHeader.h>

namespace EKP
{
    class CrossoverProcessor
    {
    public:
        enum class Type { minimumPhase, linearPhase };

        void prepare(double sampleRate, int samplesPerBlock, size_t channels)
        {
            juce::dsp::ProcessSpec spec{ sampleRate, static_cast<juce::uint32>(samplesPerBlock), channels };
            for (auto& filter : lowFilters)
                filter.prepare(spec);
            for (auto& filter : highFilters)
                filter.prepare(spec);
        }

        void reset()
        {
            for (auto& filter : lowFilters)
                filter.reset();
            for (auto& filter : highFilters)
                filter.reset();
        }

        void setCutoffs(float lowMid, float midHigh)
        {
            lowCut = lowMid;
            highCut = midHigh;
        }

        void updateFilters(double sampleRate)
        {
            for (auto& filter : lowFilters)
                filter.coefficients = juce::dsp::LinkwitzRileyFilter<float>::Coefficients::makeLowPass(sampleRate, lowCut);
            for (auto& filter : highFilters)
                filter.coefficients = juce::dsp::LinkwitzRileyFilter<float>::Coefficients::makeHighPass(sampleRate, highCut);
        }

        void process(juce::dsp::AudioBlock<float>& block)
        {
            juce::dsp::ProcessContextReplacing<float> context(block);
            lowFilters[0].process(context);
            highFilters[0].process(context);
        }

    private:
        float lowCut = 200.0f;
        float highCut = 2000.0f;
        std::array<juce::dsp::LinkwitzRileyFilter<float>, 2> lowFilters;
        std::array<juce::dsp::LinkwitzRileyFilter<float>, 2> highFilters;
    };
}

