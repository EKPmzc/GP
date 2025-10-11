#pragma once

#include <JuceHeader.h>

namespace EKP
{
    struct TruePeakResult
    {
        float peak = -100.0f;
    };

    class LimiterTP
    {
    public:
        void prepare(double sampleRate, int samplesPerBlock, int channels)
        {
            juce::dsp::ProcessSpec spec{ sampleRate, static_cast<juce::uint32>(samplesPerBlock), static_cast<juce::uint32>(channels) };
            lookAheadDelay.reset();
            lookAheadDelay.setMaximumDelayInSamples(static_cast<int>(sampleRate * 0.01));
            lookAheadDelay.prepare(spec);
            envFollower.prepare(spec);
            envFollower.setAttackTime(1.0f);
            envFollower.setReleaseTime(50.0f);
            truePeakResult.peak = -100.0f;
        }

        void reset()
        {
            lookAheadDelay.reset();
            envFollower.reset();
        }

        void setCeiling(float ceilingDb)
        {
            ceiling = ceilingDb;
            ceilingLinear = juce::Decibels::decibelsToGain(ceilingDb);
        }

        void setBypassed(bool shouldBypass) { bypassed = shouldBypass; }

        void process(juce::AudioBuffer<float>& buffer)
        {
            if (bypassed)
                return;

            juce::dsp::AudioBlock<float> block(buffer);
            auto delayed = lookAheadDelay.processSample(0, block.getSample(0, 0));
            juce::ignoreUnused(delayed);

            auto gain = 1.0f;
            for (int channel = 0; channel < buffer.getNumChannels(); ++channel)
            {
                auto* data = buffer.getWritePointer(channel);
                for (int n = 0; n < buffer.getNumSamples(); ++n)
                {
                    auto sample = data[n];
                    envFollower.processSample(std::abs(sample));
                    auto currentEnv = envFollower.getCurrentValue();
                    auto desiredGain = currentEnv > 0.0f ? juce::jmin(1.0f, ceilingLinear / currentEnv) : 1.0f;
                    gain = 0.99f * gain + 0.01f * desiredGain;
                    data[n] *= gain;
                    truePeakResult.peak = juce::jmax(truePeakResult.peak, juce::Decibels::gainToDecibels(std::abs(data[n]) + 1.0e-9f));
                }
            }
        }

        TruePeakResult getTruePeakResult() const noexcept { return truePeakResult; }

    private:
        juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> lookAheadDelay{ 1 }; // 1 channel per block
        juce::dsp::EnvelopeFollower<float> envFollower;
        float ceiling = 0.0f;
        float ceilingLinear = 1.0f;
        bool bypassed = false;
        TruePeakResult truePeakResult;
    };
}

