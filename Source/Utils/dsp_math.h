#pragma once

#include <JuceHeader.h>

namespace EKP
{
    inline float fastTanh(float x) noexcept
    {
        // Polynomial tanh approximation clipped to avoid blowup (see DAFX-19)
        auto x2 = x * x;
        auto numerator = x * (27.f + x2);
        auto denominator = 27.f + 9.f * x2;
        return juce::jlimit(-1.0f, 1.0f, numerator / denominator);
    }

    inline float fastAtanh(float x) noexcept
    {
        x = juce::jlimit(-0.95f, 0.95f, x);
        return 0.5f * juce::log((1.0f + x) / (1.0f - x));
    }

    inline float softClipEven(float x, float bias) noexcept
    {
        return fastTanh(x + bias) - fastTanh(bias);
    }
}

