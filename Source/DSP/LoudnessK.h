#pragma once

#include <JuceHeader.h>

namespace EKP
{
    struct LoudnessResult
    {
        float momentary = -100.0f;
        float shortTerm = -100.0f;
    };

    class LoudnessK
    {
    public:
        void prepare(double sampleRate, int samplesPerBlock, int channels)
        {
            juce::dsp::ProcessSpec spec{ sampleRate, static_cast<juce::uint32>(samplesPerBlock), static_cast<juce::uint32>(channels) };
            preHighPass.prepare(spec);
            preHighPass.state = juce::dsp::IIR::Coefficients<float>::makeHighPass(sampleRate, 40.0f);
            preHighPass.reset();

            highShelf.prepare(spec);
            highShelf.state = juce::dsp::IIR::Coefficients<float>::makeHighShelf(sampleRate, 1500.0f, 0.707f, juce::Decibels::decibelsToGain(4.0f));
            highShelf.reset();

            momentaryWindow = static_cast<int>(sampleRate * 0.4);
            shortTermWindow = static_cast<int>(sampleRate * 3.0);
            momentaryBuffer.setSize(channels, momentaryWindow + 1);
            shortTermBuffer.setSize(channels, shortTermWindow + 1);
            momentaryBuffer.clear();
            shortTermBuffer.clear();
            momentaryIndex = 0;
            shortTermIndex = 0;
        }

        void reset()
        {
            preHighPass.reset();
            highShelf.reset();
            momentaryBuffer.clear();
            shortTermBuffer.clear();
            result = {};
        }

        void process(const juce::AudioBuffer<float>& buffer)
        {
            juce::AudioBuffer<float> temp(buffer.getNumChannels(), buffer.getNumSamples());
            temp.makeCopyOf(buffer);
            juce::dsp::AudioBlock<float> block(temp);
            juce::dsp::ProcessContextReplacing<float> context(block);
            preHighPass.process(context);
            highShelf.process(context);

            auto channelRMSMomentary = 0.0;
            auto channelRMSShort = 0.0;
            auto numSamples = buffer.getNumSamples();

            for (int channel = 0; channel < buffer.getNumChannels(); ++channel)
            {
                auto* data = temp.getReadPointer(channel);
                for (int n = 0; n < numSamples; ++n)
                {
                    auto value = data[n];
                    momentaryBuffer.setSample(channel, momentaryIndex, value);
                    shortTermBuffer.setSample(channel, shortTermIndex, value);
                }
            }

            momentaryIndex = (momentaryIndex + numSamples) % momentaryBuffer.getNumSamples();
            shortTermIndex = (shortTermIndex + numSamples) % shortTermBuffer.getNumSamples();

            channelRMSMomentary = computeRMS(momentaryBuffer, momentaryWindow);
            channelRMSShort = computeRMS(shortTermBuffer, shortTermWindow);

            result.momentary = juce::Decibels::gainToDecibels(static_cast<float>(channelRMSMomentary) + 1.0e-9f) - 0.691f;
            result.shortTerm = juce::Decibels::gainToDecibels(static_cast<float>(channelRMSShort) + 1.0e-9f) - 0.691f;
        }

        LoudnessResult getResult() const noexcept { return result; }

    private:
        double computeRMS(const juce::AudioBuffer<float>& buffer, int window) const
        {
            auto sumSquares = 0.0;
            auto numChannels = buffer.getNumChannels();
            auto numSamples = juce::jmin(window, buffer.getNumSamples());
            for (int channel = 0; channel < numChannels; ++channel)
            {
                auto* data = buffer.getReadPointer(channel);
                for (int i = 0; i < numSamples; ++i)
                    sumSquares += data[i] * data[i];
            }
            auto totalSamples = juce::jmax(1, numSamples * numChannels);
            return std::sqrt(sumSquares / static_cast<double>(totalSamples));
        }

        juce::dsp::IIR::Filter<float> preHighPass;
        juce::dsp::IIR::Filter<float> highShelf;
        juce::AudioBuffer<float> momentaryBuffer;
        juce::AudioBuffer<float> shortTermBuffer;
        int momentaryWindow = 0;
        int shortTermWindow = 0;
        int momentaryIndex = 0;
        int shortTermIndex = 0;
        LoudnessResult result;
    };
}

