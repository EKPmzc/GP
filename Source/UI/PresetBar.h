#pragma once

#include <JuceHeader.h>

namespace EKP
{
    class PresetBar : public juce::Component,
                      private juce::Button::Listener
    {
    public:
        PresetBar()
        {
            addAndMakeVisible(presetButton);
            presetButton.setButtonText("Preset");
            presetButton.addListener(this);
        }

        ~PresetBar() override
        {
            presetButton.removeListener(this);
        }

        void resized() override
        {
            presetButton.setBounds(getLocalBounds());
        }

        std::function<void()> onNextPreset;

    private:
        void buttonClicked(juce::Button* button) override
        {
            if (button == &presetButton && onNextPreset)
                onNextPreset();
        }

        juce::TextButton presetButton;
    };
}

