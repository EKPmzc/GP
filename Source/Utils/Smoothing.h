#pragma once

#include <JuceHeader.h>

namespace EKP
{
    template <typename FloatType>
    class LinearSmoothedValue
    {
    public:
        void reset(double sampleRate, double timeMs)
        {
            juce::ignoreUnused(sampleRate);
            rampLength = juce::roundToInt(sampleRate * (timeMs / 1000.0));
            rampLength = juce::jmax(1, rampLength);
            counter = rampLength;
            currentValue = targetValue;
        }

        void setCurrentAndTargetValue(FloatType newValue)
        {
            currentValue = newValue;
            targetValue = newValue;
            counter = 0;
        }

        void setTargetValue(FloatType newValue)
        {
            targetValue = newValue;
            counter = rampLength;
            if (rampLength <= 1)
            {
                currentValue = targetValue;
                counter = 0;
            }
        }

        FloatType getNextValue()
        {
            if (counter <= 0)
                return currentValue = targetValue;

            auto step = (targetValue - currentValue) / static_cast<FloatType>(counter);
            currentValue += step;
            --counter;
            return currentValue;
        }

        FloatType getCurrentValue() const noexcept { return currentValue; }
        FloatType getTargetValue() const noexcept { return targetValue; }

    private:
        int rampLength = 1;
        int counter = 0;
        FloatType currentValue = 0;
        FloatType targetValue = 0;
    };
}

