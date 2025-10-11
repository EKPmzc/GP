#pragma once

#include <JuceHeader.h>
#include "../Utils/BlockFifo.h"

namespace EKP
{
    class TransferCurve : public juce::Component,
                          private juce::Timer
    {
    public:
        TransferCurve()
        {
            startTimerHz(30);
        }

        void setFifo(BlockFifo<float, 2048>* fifoToUse)
        {
            fifo = fifoToUse;
        }

        void paint(juce::Graphics& g) override
        {
            g.fillAll(juce::Colour(0xff151515));
            g.setColour(juce::Colours::white.withAlpha(0.2f));
            g.drawRect(getLocalBounds());
            g.setColour(juce::Colours::aqua);
            if (points.size() < 2)
                return;

            juce::Path path;
            auto bounds = getLocalBounds().toFloat();
            for (int i = 0; i < points.size(); i += 2)
            {
                auto x = juce::jmap(points.getUnchecked(i), -1.0f, 1.0f, bounds.getX(), bounds.getRight());
                auto y = juce::jmap(points.getUnchecked(i + 1), -1.0f, 1.0f, bounds.getBottom(), bounds.getY());
                if (i == 0)
                    path.startNewSubPath(x, y);
                else
                    path.lineTo(x, y);
            }
            g.strokePath(path, juce::PathStrokeType(2.0f));
        }

    private:
        void timerCallback() override
        {
            if (fifo == nullptr)
                return;

            juce::Array<float> data;
            if (fifo->popBlock(data))
            {
                points = data;
                repaint();
            }
        }

        BlockFifo<float, 2048>* fifo = nullptr;
        juce::Array<float> points;
    };
}

