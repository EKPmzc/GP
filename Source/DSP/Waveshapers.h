#pragma once

#include <JuceHeader.h>
#include "ADAA.h"
#include "../Utils/dsp_math.h"
#include "../Utils/SIMDUtils.h"
#include "../Utils/Smoothing.h"

namespace EKP
{
    enum class DriveModel
    {
        tape = 0,
        tube,
        diode,
        oddSym,
        fold,
        crush
    };

    struct TapeFunctor
    {
        static float evaluate(float x) noexcept
        {
            constexpr float saturation = 0.95f;
            auto limited = juce::jlimit(-0.99f, 0.99f, saturation * x);
            return std::atanh(limited);
        }

        static float integrate1(float x) noexcept
        {
            constexpr float saturation = 0.95f;
            auto limited = juce::jlimit(-0.99f, 0.99f, saturation * x);
            auto atanhVal = std::atanh(limited);
            auto logTerm = std::log(juce::jmax(1.0e-6f, 1.0f - limited * limited));
            return (limited * atanhVal + 0.5f * logTerm) / saturation;
        }

        static float integrate2(float x) noexcept
        {
            constexpr float saturation = 0.95f;
            auto limited = juce::jlimit(-0.99f, 0.99f, saturation * x);
            auto atanhVal = std::atanh(limited);
            auto logTerm = std::log(juce::jmax(1.0e-6f, 1.0f - limited * limited));
            auto term1 = 0.5f * limited * limited * atanhVal + 0.5f * limited - 0.5f * atanhVal;
            auto term2 = 0.5f * (limited * logTerm + 2.0f * atanhVal - 2.0f * limited);
            return (term1 + term2) / (saturation * saturation);
        }
    };

    struct TubeFunctor
    {
        static float evaluate(float x) noexcept
        {
            constexpr float evenBias = 0.25f;
            return std::tanh(x + evenBias) - std::tanh(evenBias);
        }

        static float integrate1(float x) noexcept
        {
            constexpr float evenBias = 0.25f;
            auto logTerm = std::log(std::cosh(x + evenBias)) - std::log(std::cosh(evenBias));
            return logTerm - x * std::tanh(evenBias);
        }

        static float integrate2(float x) noexcept
        {
            const auto sign = x >= 0.0f ? 1.0f : -1.0f;
            const auto absX = std::abs(x);
            return sign * integrateSimpson([sign](float sample) {
                return integrate1Internal(sign * sample);
            }, 0.0f, absX);
        }

    private:
        static float integrate1Internal(float x) noexcept
        {
            constexpr float evenBias = 0.25f;
            auto logTerm = std::log(std::cosh(x + evenBias)) - std::log(std::cosh(evenBias));
            return logTerm - x * std::tanh(evenBias);
        }
    };

    struct DiodeFunctor
    {
        static float evaluate(float x) noexcept
        {
            constexpr float threshold = 0.2f;
            constexpr float softness = 4.0f;
            auto pos = juce::jmax(0.0f, x - threshold);
            auto neg = juce::jmax(0.0f, -x - threshold);
            auto forward = 1.0f - std::exp(-softness * pos);
            auto reverse = 1.0f - std::exp(-softness * neg);
            return forward - reverse;
        }

        static float integrate1(float x) noexcept
        {
            return integrateSimpson([](float sample) { return evaluate(sample); }, 0.0f, x);
        }

        static float integrate2(float x) noexcept
        {
            return integrateSimpson([](float sample) { return integrate1(sample); }, 0.0f, x);
        }
    };

    struct OddSymFunctor
    {
        static float evaluate(float x) noexcept
        {
            auto x2 = x * x;
            auto x3 = x2 * x;
            auto x5 = x3 * x2;
            return x - (x3 / 3.0f) + (x5 / 5.0f);
        }

        static float integrate1(float x) noexcept
        {
            auto x2 = x * x;
            auto x4 = x2 * x2;
            auto x6 = x4 * x2;
            return 0.5f * x2 - (x4 / 12.0f) + (x6 / 30.0f);
        }

        static float integrate2(float x) noexcept
        {
            auto x2 = x * x;
            auto x3 = x2 * x;
            auto x5 = x3 * x2;
            auto x7 = x5 * x2;
            return (x3 / 6.0f) - (x5 / 60.0f) + (x7 / 210.0f);
        }
    };

    struct FoldFunctor
    {
        static float evaluate(float x) noexcept
        {
            constexpr float foldThreshold = 1.0f;
            auto wrapped = std::fmod(x + foldThreshold, 2.0f * foldThreshold);
            if (wrapped < 0.0f)
                wrapped += 2.0f * foldThreshold;
            if (wrapped > foldThreshold)
                wrapped = 2.0f * foldThreshold - wrapped;
            return std::sin(wrapped);
        }

        static float integrate1(float x) noexcept
        {
            return integrateSimpson([](float sample) { return evaluate(sample); }, 0.0f, x);
        }

        static float integrate2(float x) noexcept
        {
            return integrateSimpson([](float sample) { return integrate1(sample); }, 0.0f, x);
        }
    };

    struct CrushFunctor
    {
        static float evaluate(float x) noexcept
        {
            constexpr float steps = 32.0f;
            auto quantised = std::round(x * steps) / steps;
            return quantised;
        }

        static float integrate1(float x) noexcept
        {
            return integrateSimpson([](float sample) { return evaluate(sample); }, 0.0f, x);
        }

        static float integrate2(float x) noexcept
        {
            return integrateSimpson([](float sample) { return integrate1(sample); }, 0.0f, x);
        }
    };

    class Waveshaper
    {
    public:
        Waveshaper() = default;

        void prepare(double sampleRate, int blockSize)
        {
            juce::ignoreUnused(sampleRate, blockSize);
            tubeADAA.reset();
            tapeADAA.reset();
            diodeADAA.reset();
            oddADAA.reset();
            foldADAA.reset();
            crushADAA.reset();
        }

        void reset()
        {
            tubeADAA.reset();
            tapeADAA.reset();
            diodeADAA.reset();
            oddADAA.reset();
            foldADAA.reset();
            crushADAA.reset();
        }

        float processSample(float inSample, DriveModel model) noexcept
        {
            switch (model)
            {
                case DriveModel::tape:   return tapeADAA.processSample(inSample);
                case DriveModel::tube:   return tubeADAA.processSample(inSample);
                case DriveModel::diode:  return diodeADAA.processSample(inSample);
                case DriveModel::oddSym: return oddADAA.processSample(inSample);
                case DriveModel::fold:   return foldADAA.processSample(inSample);
                case DriveModel::crush:  return crushADAA.processSample(inSample);
                default:                 return inSample;
            }
        }

    private:
        ADAA2<TapeFunctor>  tapeADAA;
        ADAA2<TubeFunctor>  tubeADAA;
        ADAA2<DiodeFunctor> diodeADAA;
        ADAA2<OddSymFunctor> oddADAA;
        ADAA2<FoldFunctor>  foldADAA;
        ADAA2<CrushFunctor> crushADAA;
    };

    class WaveshaperBank
    {
    public:
        void prepare(double sampleRate, int blockSize)
        {
            juce::ignoreUnused(blockSize);
            for (auto& shaper : shapers)
                shaper.prepare(sampleRate, blockSize);
        }

        void reset()
        {
            for (auto& shaper : shapers)
                shaper.reset();
        }

        void process(juce::dsp::AudioBlock<float>& block, DriveModel model, float drive, float mix)
        {
            juce::dsp::AudioBlock<float> wetBlock(block);
            for (size_t channel = 0; channel < block.getNumChannels(); ++channel)
            {
                auto* dry = block.getChannelPointer(channel);
                auto* wet = wetBlock.getChannelPointer(channel);
                for (size_t i = 0; i < block.getNumSamples(); ++i)
                {
                    auto driven = dry[i] * juce::Decibels::decibelsToGain(drive);
                    wet[i] = shapers[channel % shapers.size()].processSample(driven, model);
                    wet[i] = mix * wet[i] + (1.0f - mix) * dry[i];
                }
            }
        }

    private:
        std::array<Waveshaper, 4> shapers;
    };
}

