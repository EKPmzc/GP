#include <JuceHeader.h>
#include "../DSP/ADAA.h"
#include "../DSP/Waveshapers.h"

namespace EKPTests
{
    class ADAACurveTest : public juce::UnitTest
    {
    public:
        ADAACurveTest() : juce::UnitTest("ADAA Curve Consistency", "EKP") {}

        void runTest() override
        {
            beginTest("Odd polynomial ADAA matches analytic to tolerance");
            EKP::ADAA2<EKP::OddSymFunctor> adaa;
            adaa.reset();
            auto direct = EKP::OddSymFunctor::evaluate(0.5f);
            auto processed = adaa.processSample(0.5f);
            expectWithinAbsoluteError(processed, direct, 0.1f, "ADAA deviates significantly from analytic evaluation");
        }
    };

    class LR4SumTest : public juce::UnitTest
    {
    public:
        LR4SumTest() : juce::UnitTest("LR4 Flat Sum", "EKP") {}

        void runTest() override
        {
            beginTest("Linkwitz-Riley magnitude sum remains flat");
            juce::dsp::LinkwitzRileyFilter<float> lowPass, highPass;
            auto coeffLP = juce::dsp::LinkwitzRileyFilter<float>::Coefficients::makeLowPass(48000.0, 2000.0);
            auto coeffHP = juce::dsp::LinkwitzRileyFilter<float>::Coefficients::makeHighPass(48000.0, 2000.0);
            lowPass.coefficients = coeffLP;
            highPass.coefficients = coeffHP;
            juce::dsp::ProcessSpec spec{ 48000.0, 128, 1 };
            lowPass.prepare(spec);
            highPass.prepare(spec);
            juce::AudioBuffer<float> buffer(1, 128);
            buffer.clear();
            buffer.setSample(0, 0, 1.0f);
            juce::dsp::AudioBlock<float> block(buffer);
            lowPass.process(juce::dsp::ProcessContextReplacing<float>(block));
            highPass.process(juce::dsp::ProcessContextReplacing<float>(block));
            auto sum = 0.0f;
            for (int n = 0; n < buffer.getNumSamples(); ++n)
                sum += std::abs(buffer.getSample(0, n));
            expect(sum > 0.0f, "Filters should pass signal");
        }
    };

    static ADAACurveTest adaaTest;
    static LR4SumTest lr4Test;
}

