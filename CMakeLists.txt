cmake_minimum_required(VERSION 3.22)

project(EKPSaturator VERSION 1.0.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(JUCE_BUILD_EXTRAS OFF CACHE BOOL "" FORCE)
set(JUCE_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)

include(FetchContent)

if (NOT DEFINED JUCE_SOURCE_DIR)
    FetchContent_Declare(
        juce
        GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
        GIT_TAG 7.0.12
    )
    FetchContent_MakeAvailable(juce)
endif ()

juce_add_plugin(EKPSaturator
    COMPANY_NAME "EKP Audio"
    BUNDLE_ID com.ekpaudio.eksaturator
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    COPY_PLUGIN_AFTER_BUILD TRUE
    PLUGIN_MANUFACTURER_CODE EKPA
    PLUGIN_CODE EKPS
    FORMATS VST3 AU
    PRODUCT_NAME "EKP Saturator"
)

juce_generate_juce_header(EKPSaturator)

add_subdirectory(Resources)

set(SOURCE_FILES
    Source/PluginProcessor.cpp
    Source/PluginEditor.cpp
    Source/DSP/ADAA.cpp
    Source/DSP/Waveshapers.cpp
    Source/DSP/ToneFilters.cpp
    Source/DSP/Crossover.cpp
    Source/DSP/OversamplingWrapper.cpp
    Source/DSP/LimiterTP.cpp
    Source/DSP/LoudnessK.cpp
    Source/Utils/SIMDUtils.cpp
    Source/Utils/Smoothing.cpp
    Source/Utils/BlockFifo.cpp
    Source/Utils/dsp_math.cpp
    Source/UI/Knob.cpp
    Source/UI/Meter.cpp
    Source/UI/Analyzer.cpp
    Source/UI/TransferCurve.cpp
    Source/UI/PresetBar.cpp
)

set(HEADER_FILES
    Source/PluginProcessor.h
    Source/PluginEditor.h
    Source/DSP/ADAA.h
    Source/DSP/Waveshapers.h
    Source/DSP/ToneFilters.h
    Source/DSP/Crossover.h
    Source/DSP/OversamplingWrapper.h
    Source/DSP/LimiterTP.h
    Source/DSP/LoudnessK.h
    Source/Utils/SIMDUtils.h
    Source/Utils/Smoothing.h
    Source/Utils/BlockFifo.h
    Source/Utils/dsp_math.h
    Source/UI/Knob.h
    Source/UI/Meter.h
    Source/UI/Analyzer.h
    Source/UI/TransferCurve.h
    Source/UI/PresetBar.h
)

source_group(TREE ${CMAKE_CURRENT_SOURCE_DIR}/Source FILES ${SOURCE_FILES} ${HEADER_FILES})

juce_add_binary_data(EKPSaturatorData SOURCES Resources/placeholder.txt)

juce_add_unit_test(EKPTests)

target_sources(EKPTests PRIVATE Source/Tests/ADAAUnitTests.cpp)

target_link_libraries(EKPTests PRIVATE juce::juce_core juce::juce_events juce::juce_dsp juce::juce_audio_basics juce::juce_audio_processors)

set_target_properties(EKPSaturator PROPERTIES
    UNITY_BUILD OFF
    XCODE_ATTRIBUTE_CODE_SIGN_IDENTITY ""
    XCODE_ATTRIBUTE_DEVELOPMENT_TEAM ""
)

target_compile_definitions(EKPSaturator PUBLIC
    JUCE_DISPLAY_SPLASH_SCREEN=0
    JUCE_REPORT_APP_USAGE=0
    JUCE_USE_SIMD_INTRINSICS=1
)

target_link_libraries(EKPSaturator
    PRIVATE
        juce::juce_audio_basics
        juce::juce_audio_processors
        juce::juce_dsp
        juce::juce_gui_extra
        EKPSaturatorData
)

target_compile_definitions(EKPSaturator PRIVATE
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=0
)

if (JUCE_BUILD_EXTRAS)
    message(WARNING "JUCE extras are disabled for this project")
endif()

install(TARGETS EKPSaturator DESTINATION .)
