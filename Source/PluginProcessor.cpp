#include "PluginProcessor.h"
#include "PluginEditor.h"

namespace
{
    juce::StringArray makeDriveChoices()
    {
        return { "Tape", "Tube", "Diode", "OddSym", "Fold", "Crush" };
    }

    juce::StringArray makeModeChoices()
    {
        return { "Uniform", "Multiband" };
    }

    juce::StringArray makeOSChoices()
    {
        return { "1x", "2x", "4x", "8x", "16x" };
    }

    juce::StringArray makeOSTypeChoices()
    {
        return { "IIR_Fast", "FIR_Linear" };
    }
}

EKPSaturatorAudioProcessor::EKPSaturatorAudioProcessor()
    : AudioProcessor(BusesProperties().withInput("Input", juce::AudioChannelSet::stereo(), true)
                                         .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
      parameters(*this, nullptr, "Parameters", createParameterLayout())
{
    parameters.state.addListener(this);
}

EKPSaturatorAudioProcessor::~EKPSaturatorAudioProcessor()
{
    parameters.state.removeListener(this);
}

const juce::String EKPSaturatorAudioProcessor::getName() const
{
    return JucePlugin_Name;
}

void EKPSaturatorAudioProcessor::prepareToPlay(double sampleRate, int samplesPerBlock)
{
    currentSampleRate = sampleRate;

    oversampling.prepare(sampleRate, samplesPerBlock, getTotalNumOutputChannels());
    updateOversampling();

    juce::dsp::ProcessSpec spec{ sampleRate, static_cast<juce::uint32>(samplesPerBlock), static_cast<juce::uint32>(getTotalNumOutputChannels()) };
    dryWetGainDry.prepare(spec);
    dryWetGainWet.prepare(spec);
    outputTrim.prepare(spec);

    dryWetGainDry.setGainLinear(1.0f);
    dryWetGainWet.setGainLinear(1.0f);
    outputTrim.setGainLinear(1.0f);

    waveshapers.prepare(sampleRate, samplesPerBlock);
    limiter.prepare(sampleRate, samplesPerBlock, getTotalNumOutputChannels());
    limiter.setCeiling(parameters.getRawParameterValue("limiterCeiling")->load());
    limiter.setBypassed(! parameters.getRawParameterValue("limiterOn")->load());

    loudnessProcessor.prepare(sampleRate, samplesPerBlock, getTotalNumOutputChannels());

    driveSmoothed.reset(sampleRate, 20.0);
    driveSmoothed.setCurrentAndTargetValue(parameters.getRawParameterValue("drive")->load());
    tiltSmoothed.reset(sampleRate, 50.0);
    tiltSmoothed.setCurrentAndTargetValue(parameters.getRawParameterValue("tilt")->load());

    spectrumFifo.clear();
    transferCurveFifo.clear();
}

void EKPSaturatorAudioProcessor::releaseResources()
{
}

#if ! JucePlugin_PreferredChannelConfigurations
bool EKPSaturatorAudioProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    if (layouts.getMainInputChannelSet() != layouts.getMainOutputChannelSet())
        return false;
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::mono()
        && layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;
    return true;
}
#endif

void EKPSaturatorAudioProcessor::updateOversampling()
{
    auto factorChoice = static_cast<int>(parameters.getRawParameterValue("oversamplingFactor")->load());
    auto factor = juce::jlimit(0, 4, factorChoice);
    factor = juce::jmax(1, 1 << factor);
    auto typeChoice = static_cast<int>(parameters.getRawParameterValue("oversamplingType")->load());
    auto mode = typeChoice == 0 ? EKP::OversamplingWrapper::Mode::iirFast : EKP::OversamplingWrapper::Mode::firLinear;
    oversampling.setParameters(factor, mode);
    latencySamples = oversampling.getLatencySamples();
    setLatencySamples(latencySamples);
}

void EKPSaturatorAudioProcessor::updateMode()
{
    // Placeholder for multiband routing updates.
}

void EKPSaturatorAudioProcessor::updateSmoothing()
{
    driveSmoothed.setTargetValue(parameters.getRawParameterValue("drive")->load());
    tiltSmoothed.setTargetValue(parameters.getRawParameterValue("tilt")->load());
}

void EKPSaturatorAudioProcessor::valueTreePropertyChanged(juce::ValueTree& treeWhosePropertyHasChanged,
                                                          const juce::Identifier& property)
{
    juce::ignoreUnused(treeWhosePropertyHasChanged);
    if (property == juce::Identifier("oversamplingFactor") || property == juce::Identifier("oversamplingType"))
        updateOversampling();
}

void EKPSaturatorAudioProcessor::processUniform(juce::dsp::AudioBlock<float>& block)
{
    auto drive = driveSmoothed.getNextValue();
    auto mix = parameters.getRawParameterValue("dryWet")->load();
    auto driveModel = static_cast<int>(parameters.getRawParameterValue("driveModel")->load());

    waveshapers.process(block, static_cast<EKP::DriveModel>(driveModel), drive, mix);
}

void EKPSaturatorAudioProcessor::processMultiband(juce::dsp::AudioBlock<float>& block)
{
    // Simplified: currently forward to uniform processing. The structure is ready for expansion.
    processUniform(block);
}

void EKPSaturatorAudioProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ignoreUnused(midiMessages);
    juce::ScopedNoDenormals noDenormals;

    const auto totalNumInputChannels  = getTotalNumInputChannels();
    const auto totalNumOutputChannels = getTotalNumOutputChannels();

    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear (i, 0, buffer.getNumSamples());

    updateSmoothing();

    juce::dsp::AudioBlock<float> block(buffer);
    if (auto* oversampler = oversampling.get())
    {
        auto upBlock = oversampler->processSamplesUp(block);
        if (getMode() == Mode::uniform)
            processUniform(upBlock);
        else
            processMultiband(upBlock);
        oversampler->processSamplesDown(block);
    }
    else
    {
        if (getMode() == Mode::uniform)
            processUniform(block);
        else
            processMultiband(block);
    }

    limiter.setCeiling(parameters.getRawParameterValue("limiterCeiling")->load());
    limiter.setBypassed(! parameters.getRawParameterValue("limiterOn")->load());
    limiter.process(buffer);

    loudnessProcessor.process(buffer);

    for (int channel = 0; channel < buffer.getNumChannels(); ++channel)
    {
        auto* data = buffer.getReadPointer(channel);
        for (int n = 0; n < buffer.getNumSamples(); ++n)
        {
            spectrumFifo.push(data[n]);
            pushTransferCurveSample(data[n], data[n]);
        }
    }
}

void EKPSaturatorAudioProcessor::pushTransferCurveSample(float input, float output)
{
    transferCurveFifo.push(input);
    transferCurveFifo.push(output);
}

double EKPSaturatorAudioProcessor::getLatencySeconds() const noexcept
{
    return static_cast<double>(latencySamples) / currentSampleRate;
}

void EKPSaturatorAudioProcessor::getStateInformation(juce::MemoryBlock& destData)
{
    if (auto xml = parameters.copyState().createXml())
        copyXmlToBinary(*xml, destData);
}

void EKPSaturatorAudioProcessor::setStateInformation(const void* data, int sizeInBytes)
{
    if (auto xmlState = getXmlFromBinary(data, sizeInBytes))
    {
        if (xmlState->hasTagName(parameters.state.getType()))
            parameters.replaceState(juce::ValueTree::fromXml(*xmlState));
    }
}

juce::AudioProcessorValueTreeState::ParameterLayout EKPSaturatorAudioProcessor::createParameterLayout()
{
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> params;

    params.push_back(std::make_unique<juce::AudioParameterChoice>("mode", "Mode", makeModeChoices(), 0));
    params.push_back(std::make_unique<juce::AudioParameterChoice>("driveModel", "Drive Model", makeDriveChoices(), 0));
    params.push_back(std::make_unique<juce::AudioParameterFloat>("drive", "Drive", juce::NormalisableRange<float>(0.0f, 36.0f), 6.0f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>("colorOddEven", "Color Odd/Even", juce::NormalisableRange<float>(0.0f, 1.0f), 0.5f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>("tilt", "Tilt", juce::NormalisableRange<float>(-6.0f, 6.0f), 0.0f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>("preEmph", "Pre Emphasis", juce::NormalisableRange<float>(0.0f, 1.0f), 0.0f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>("deEmph", "De Emphasis", juce::NormalisableRange<float>(0.0f, 1.0f), 0.0f));
    params.push_back(std::make_unique<juce::AudioParameterChoice>("oversamplingFactor", "Oversampling Factor", makeOSChoices(), 0));
    params.push_back(std::make_unique<juce::AudioParameterChoice>("oversamplingType", "Oversampling Type", makeOSTypeChoices(), 0));
    params.push_back(std::make_unique<juce::AudioParameterBool>("hqRenderOnly", "HQ Render Only", false));
    params.push_back(std::make_unique<juce::AudioParameterBool>("autoGain", "Auto Gain", true));
    params.push_back(std::make_unique<juce::AudioParameterFloat>("dryWet", "Dry Wet", juce::NormalisableRange<float>(0.0f, 1.0f), 1.0f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>("outputTrim", "Output Trim", juce::NormalisableRange<float>(-24.0f, 24.0f), 0.0f));
    params.push_back(std::make_unique<juce::AudioParameterBool>("limiterOn", "Limiter", true));
    params.push_back(std::make_unique<juce::AudioParameterFloat>("limiterCeiling", "Limiter Ceiling", juce::NormalisableRange<float>(-6.0f, 0.0f), -1.0f));
    params.push_back(std::make_unique<juce::AudioParameterBool>("monoBelowOn", "Mono Below", false));
    params.push_back(std::make_unique<juce::AudioParameterFloat>("monoBelowFreq", "Mono Below Freq", juce::NormalisableRange<float>(20.0f, 200.0f), 80.0f));

    auto addBandParameters = [&params](const juce::String& prefix, bool includeHigh){
        params.push_back(std::make_unique<juce::AudioParameterBool>(prefix + "BandOn", prefix + " Band On", true));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "BandDrive", prefix + " Band Drive", juce::NormalisableRange<float>(0.0f, 36.0f), 6.0f));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "BandMix", prefix + " Band Mix", juce::NormalisableRange<float>(0.0f, 1.0f), 1.0f));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "PreHP", prefix + " Pre HP", juce::NormalisableRange<float>(20.0f, 2000.0f), 40.0f));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "PreLP", prefix + " Pre LP", juce::NormalisableRange<float>(200.0f, 20000.0f), 16000.0f));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "PreBellGain", prefix + " Pre Bell Gain", juce::NormalisableRange<float>(-12.0f, 12.0f), 0.0f));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "PreBellFreq", prefix + " Pre Bell Freq", juce::NormalisableRange<float>(100.0f, 8000.0f), 1000.0f));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "PreBellQ", prefix + " Pre Bell Q", juce::NormalisableRange<float>(0.1f, 10.0f), 0.707f));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "PostHP", prefix + " Post HP", juce::NormalisableRange<float>(20.0f, 2000.0f), 40.0f));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "PostLP", prefix + " Post LP", juce::NormalisableRange<float>(200.0f, 20000.0f), 16000.0f));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "PostShelfGain", prefix + " Post Shelf Gain", juce::NormalisableRange<float>(-12.0f, 12.0f), 0.0f));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "PostShelfFreq", prefix + " Post Shelf Freq", juce::NormalisableRange<float>(500.0f, 16000.0f), 8000.0f));
        params.push_back(std::make_unique<juce::AudioParameterBool>(prefix + "BandMS", prefix + " M/S", false));
        params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "BandSideTrim", prefix + " Side Trim", juce::NormalisableRange<float>(-12.0f, 12.0f), 0.0f));
        if (includeHigh)
        {
            params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "XoverLow", prefix + " Xover Low", juce::NormalisableRange<float>(80.0f, 800.0f), 160.0f));
            params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "XoverHigh", prefix + " Xover High", juce::NormalisableRange<float>(800.0f, 8000.0f), 3200.0f));
        }
        else
        {
            params.push_back(std::make_unique<juce::AudioParameterFloat>(prefix + "Xover", prefix + " Xover", juce::NormalisableRange<float>(200.0f, 4000.0f), 800.0f));
        }
    };

    addBandParameters("low", false);
    addBandParameters("mid", true);
    addBandParameters("high", false);

    return { params.begin(), params.end() };
}

juce::AudioProcessorEditor* EKPSaturatorAudioProcessor::createEditor()
{
    return new EKPSaturatorAudioProcessorEditor(*this);
}
