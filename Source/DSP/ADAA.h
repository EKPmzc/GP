#pragma once

#include <JuceHeader.h>
#include "../Utils/dsp_math.h"

namespace EKP
{
    template <typename Func>
    inline float integrateSimpson(Func&& func, float a, float b) noexcept
    {
        const int steps = 8; // even number
        const auto h = (b - a) / static_cast<float>(steps);
        float sum = 0.0f;
        for (int i = 0; i <= steps; ++i)
        {
            auto coeff = (i == 0 || i == steps) ? 1.0f : (i % 2 == 0 ? 2.0f : 4.0f);
            auto x = a + static_cast<float>(i) * h;
            sum += coeff * func(x);
        }
        return (h / 3.0f) * sum;
    }

    /**
        Generic 2nd order ADAA (Antiderivative Antialiasing) processor inspired by
        "Alias Suppression Using Antiderivatives" (Vadim Zavalishin, DAFx-15).
        This template expects the Functor to expose static methods evaluate(x),
        integrate1(x) and integrate2(x) representing f(x), F(x) and G(x) respectively.
    */
    template <typename Functor>
    class ADAA2
    {
    public:
        void reset()
        {
            x1 = x2 = 0.0f;
            f1 = f2 = 0.0f;
            F1 = F2 = 0.0f;
            G1 = G2 = 0.0f;
        }

        float processSample(float x) noexcept
        {
            const auto f0 = Functor::evaluate(x);
            const auto F0 = Functor::integrate1(x);
            const auto G0 = Functor::integrate2(x);

            const auto diff = x - x2;
            float y = f0;

            if (std::abs(diff) > 1.0e-6f)
            {
                const auto numerator = (G0 - 2.0f * G1 + G2);
                y = numerator / ((diff) * (diff));
            }
            else if (std::abs(x - x1) > 1.0e-6f)
            {
                const auto numerator = (F0 - F1);
                y = numerator / (x - x1);
            }

            if (! juce::isFinite(y))
                y = f0; // Fallback to naive curve if the math blows up.

            x2 = x1;
            x1 = x;
            f2 = f1;
            f1 = f0;
            G2 = G1;
            G1 = G0;
            F2 = F1;
            F1 = F0;
            return y;
        }

    private:
        float x1 = 0.0f, x2 = 0.0f;
        float f1 = 0.0f, f2 = 0.0f;
        float F1 = 0.0f, F2 = 0.0f;
        float G1 = 0.0f, G2 = 0.0f;
    };
}

