#pragma once

#include <JuceHeader.h>

namespace EKP
{
    template <typename Functor>
    inline void processSIMD(juce::dsp::AudioBlock<float>& block, Functor&& functor)
    {
        auto numChannels = block.getNumChannels();
        auto numSamples = block.getNumSamples();
        auto simdWidth = juce::dsp::SIMDRegister<float>::size();

        for (size_t channel = 0; channel < numChannels; ++channel)
        {
            auto* data = block.getChannelPointer(channel);
            size_t sample = 0;

            for (; sample + simdWidth <= numSamples; sample += simdWidth)
            {
                juce::dsp::SIMDRegister<float> v(&data[sample]);
                functor(v).store(&data[sample]);
            }

            for (; sample < numSamples; ++sample)
                data[sample] = functor(juce::dsp::SIMDRegister<float>(data[sample]))[0];
        }
    }
}

