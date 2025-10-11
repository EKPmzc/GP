#include "PluginEditor.h"

EKPSaturatorAudioProcessorEditor::EKPSaturatorAudioProcessorEditor(EKPSaturatorAudioProcessor& p)
    : AudioProcessorEditor(&p), processorRef(p)
{
    setSize(920, 560);
    setResizable(true, true);
    setResizeLimits(800, 520, 1600, 1000);

    auto& vts = processorRef.getValueTreeState();

    addAndMakeVisible(presetBar);
    addAndMakeVisible(driveKnob);
    addAndMakeVisible(dryWetKnob);
    addAndMakeVisible(loudnessMeter);
    addAndMakeVisible(analyzer);
    addAndMakeVisible(transferCurve);
    addAndMakeVisible(driveModelBox);
    addAndMakeVisible(oversamplingBox);

    driveModelBox.addItemList({ "Tape", "Tube", "Diode", "OddSym", "Fold", "Crush" }, 1);
    oversamplingBox.addItemList({ "1x", "2x", "4x", "8x", "16x" }, 1);

    driveAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(vts, "drive", driveKnob);
    dryWetAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(vts, "dryWet", dryWetKnob);
    driveModelAttachment = std::make_unique<juce::AudioProcessorValueTreeState::ComboBoxAttachment>(vts, "driveModel", driveModelBox);
    oversamplingAttachment = std::make_unique<juce::AudioProcessorValueTreeState::ComboBoxAttachment>(vts, "oversamplingFactor", oversamplingBox);

    analyzer.setFifo(&processorRef.getSpectrumFifo());
    transferCurve.setFifo(&processorRef.getTransferCurveFifo());

    startTimerHz(30);
}

EKPSaturatorAudioProcessorEditor::~EKPSaturatorAudioProcessorEditor()
{
    stopTimer();
}

void EKPSaturatorAudioProcessorEditor::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colour(0xff101216));
    auto bounds = getLocalBounds().toFloat();
    juce::Colour accent(0xff00ffaa);
    g.setColour(accent.withAlpha(0.3f));
    g.drawRoundedRectangle(bounds.reduced(4.0f), 10.0f, 2.0f);
}

void EKPSaturatorAudioProcessorEditor::resized()
{
    auto area = getLocalBounds();
    auto topBar = area.removeFromTop(40);
    presetBar.setBounds(topBar.removeFromLeft(200));
    driveModelBox.setBounds(topBar.removeFromLeft(150).reduced(4));
    oversamplingBox.setBounds(topBar.removeFromLeft(150).reduced(4));

    auto controls = area.removeFromTop(160);
    driveKnob.setBounds(controls.removeFromLeft(200).reduced(16));
    dryWetKnob.setBounds(controls.removeFromLeft(200).reduced(16));
    loudnessMeter.setBounds(controls.removeFromLeft(80).reduced(10));

    auto bottom = area;
    auto half = bottom.removeFromLeft(bottom.getWidth() / 2);
    analyzer.setBounds(half.reduced(10));
    transferCurve.setBounds(bottom.reduced(10));
}

void EKPSaturatorAudioProcessorEditor::timerCallback()
{
    auto loudness = processorRef.getLoudnessState();
    loudnessMeter.setLevel(juce::jlimit(0.0f, 1.0f, juce::jmap(loudness.shortTerm, -60.0f, 0.0f, 0.0f, 1.0f)));
}

