#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"
#include "UI/Knob.h"
#include "UI/Meter.h"
#include "UI/Analyzer.h"
#include "UI/TransferCurve.h"
#include "UI/PresetBar.h"

class EKPSaturatorAudioProcessorEditor : public juce::AudioProcessorEditor,
                                         private juce::Timer
{
public:
    explicit EKPSaturatorAudioProcessorEditor(EKPSaturatorAudioProcessor&);
    ~EKPSaturatorAudioProcessorEditor() override;

    void paint(juce::Graphics&) override;
    void resized() override;

private:
    void timerCallback() override;

    EKPSaturatorAudioProcessor& processorRef;

    EKP::PresetBar presetBar;
    EKP::Knob driveKnob;
    EKP::Knob dryWetKnob;
    EKP::Meter loudnessMeter;
    EKP::Analyzer analyzer;
    EKP::TransferCurve transferCurve;

    juce::ComboBox driveModelBox;
    juce::ComboBox oversamplingBox;

    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> driveAttachment;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> dryWetAttachment;
    std::unique_ptr<juce::AudioProcessorValueTreeState::ComboBoxAttachment> driveModelAttachment;
    std::unique_ptr<juce::AudioProcessorValueTreeState::ComboBoxAttachment> oversamplingAttachment;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(EKPSaturatorAudioProcessorEditor)
};

