#pragma once

#include <JuceHeader.h>

namespace EKP
{
    class Meter : public juce::Component,
                  private juce::Timer
    {
    public:
        Meter()
        {
            startTimerHz(30);
        }

        void setLevel(float newLevel)
        {
            level.store(newLevel, std::memory_order_relaxed);
        }

        void paint(juce::Graphics& g) override
        {
            auto bounds = getLocalBounds().toFloat();
            g.setColour(juce::Colours::black);
            g.fillRoundedRectangle(bounds, 4.0f);
            g.setColour(juce::Colour(0xff00ff99));
            auto filled = bounds.removeFromBottom(bounds.getHeight() * juce::jlimit(0.0f, 1.0f, currentLevel));
            g.fillRoundedRectangle(filled, 4.0f);
        }

    private:
        void timerCallback() override
        {
            currentLevel = level.load(std::memory_order_relaxed);
            repaint();
        }

        std::atomic<float> level{ 0.0f };
        float currentLevel = 0.0f;
    };
}

