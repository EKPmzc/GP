#pragma once

#include <JuceHeader.h>
#include "../Utils/BlockFifo.h"

namespace EKP
{
    class Analyzer : public juce::Component,
                     private juce::Timer
    {
    public:
        Analyzer()
        {
            startTimerHz(30);
        }

        void setFifo(BlockFifo<float, 2048>* fifoToUse)
        {
            fifo = fifoToUse;
        }

        void paint(juce::Graphics& g) override
        {
            g.fillAll(juce::Colours::transparentBlack);
            g.setColour(juce::Colour(0xff1a1f26));
            g.fillRoundedRectangle(getLocalBounds().toFloat(), 8.0f);
            g.setColour(juce::Colours::lime);
            juce::Path path;
            if (spectrum.size() > 1)
            {
                auto bounds = getLocalBounds().toFloat();
                auto width = bounds.getWidth();
                auto height = bounds.getHeight();
                for (int i = 0; i < spectrum.size(); ++i)
                {
                    auto x = bounds.getX() + width * (static_cast<float>(i) / static_cast<float>(spectrum.size() - 1));
                    auto y = bounds.getBottom() - height * spectrum.getUnchecked(i);
                    if (i == 0)
                        path.startNewSubPath(x, y);
                    else
                        path.lineTo(x, y);
                }
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
                if (fft == nullptr)
                    fft.reset(new juce::dsp::FFT(10));

                juce::HeapBlock<juce::dsp::Complex<float>> complexBlock(1 << 10);
                std::fill_n(complexBlock.get(), 1 << 10, juce::dsp::Complex<float>());
                auto copyCount = juce::jmin(data.size(), 1 << 10);
                for (int i = 0; i < copyCount; ++i)
                {
                    complexBlock[i].real(data[i]);
                }
                fft->perform(complexBlock.get(), complexBlock.get(), false);
                spectrum.clearQuick();
                for (int i = 0; i < 1 << 9; ++i)
                {
                    auto magnitude = std::sqrt(complexBlock[i].real() * complexBlock[i].real() + complexBlock[i].imag() * complexBlock[i].imag());
                    spectrum.add(juce::jlimit(0.0f, 1.0f, magnitude));
                }
                repaint();
            }
        }

        BlockFifo<float, 2048>* fifo = nullptr;
        std::unique_ptr<juce::dsp::FFT> fft;
        juce::Array<float> spectrum;
    };
}

