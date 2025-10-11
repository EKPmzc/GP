#pragma once

#include <JuceHeader.h>
#include "../Utils/Smoothing.h"

namespace EKP
{
    struct ToneSettings
    {
        float highPass = 20.0f;
        float lowPass = 20000.0f;
        float bellGain = 0.0f;
        float bellFreq = 1000.0f;
        float bellQ = 0.707f;
        float shelfGain = 0.0f;
        float shelfFreq = 8000.0f;
    };

    class ToneFilters
    {
    public:
        void prepare(double sampleRate, int samplesPerBlock)
        {
            this->sampleRate = sampleRate;
            juce::dsp::ProcessSpec spec{ sampleRate, static_cast<juce::uint32>(samplesPerBlock), 2 };
            hp12.prepare(spec);
            hp24.prepare(spec);
            lp12.prepare(spec);
            lp24.prepare(spec);
            bell.prepare(spec);
            shelf.prepare(spec);
        }

        void reset()
        {
            hp12.reset();
            hp24.reset();
            lp12.reset();
            lp24.reset();
            bell.reset();
            shelf.reset();
        }

        void update(const ToneSettings& settings)
        {
            auto hpCutoff = juce::jlimit(10.0f, 20000.0f, settings.highPass);
            auto lpCutoff = juce::jlimit(50.0f, 20000.0f, settings.lowPass);
            hp12.state = juce::dsp::IIR::Coefficients<float>::makeHighPass(sampleRate, hpCutoff);
            hp24.state = juce::dsp::IIR::Coefficients<float>::makeHighPass(sampleRate, hpCutoff, 0.5f);
            lp12.state = juce::dsp::IIR::Coefficients<float>::makeLowPass(sampleRate, lpCutoff);
            lp24.state = juce::dsp::IIR::Coefficients<float>::makeLowPass(sampleRate, lpCutoff, 0.5f);
            bell.state = juce::dsp::IIR::Coefficients<float>::makePeakFilter(sampleRate, settings.bellFreq, settings.bellQ, juce::Decibels::decibelsToGain(settings.bellGain));
            shelf.state = juce::dsp::IIR::Coefficients<float>::makeLowShelf(sampleRate, settings.shelfFreq, 0.707f, juce::Decibels::decibelsToGain(settings.shelfGain));
        }

        void process(juce::dsp::AudioBlock<float>& block)
        {
            juce::dsp::ProcessContextReplacing<float> context(block);
            hp12.process(context);
            bell.process(context);
            shelf.process(context);
            lp12.process(context);
        }

        void setSampleRate(double newSampleRate) { sampleRate = newSampleRate; }

    private:
        double sampleRate = 44100.0;
        juce::dsp::IIR::Filter<float> hp12;
        juce::dsp::IIR::Filter<float> hp24;
        juce::dsp::IIR::Filter<float> lp12;
        juce::dsp::IIR::Filter<float> lp24;
        juce::dsp::IIR::Filter<float> bell;
        juce::dsp::IIR::Filter<float> shelf;
    };
}

