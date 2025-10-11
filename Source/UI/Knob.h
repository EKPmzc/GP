#pragma once

#include <JuceHeader.h>

namespace EKP
{
    class Knob : public juce::Slider
    {
    public:
        Knob()
        {
            setSliderStyle(juce::Slider::RotaryVerticalDrag);
            setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 20);
        }
    };
}

