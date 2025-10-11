#pragma once

#include <JuceHeader.h>

namespace EKP
{
    template <typename SampleType, size_t Capacity>
    class BlockFifo
    {
    public:
        void push(SampleType value)
        {
            auto writeIndex = static_cast<size_t>(write.load(std::memory_order_relaxed));
            buffer[writeIndex] = value;
            write.store((writeIndex + 1) % Capacity, std::memory_order_release);
        }

        bool popBlock(juce::Array<SampleType>& dst)
        {
            const auto available = getAvailable();
            if (available == 0)
                return false;

            dst.clearQuick();
            dst.ensureStorageFree(static_cast<int>(available));
            for (size_t i = 0; i < available; ++i)
            {
                auto readIndex = static_cast<size_t>(read.load(std::memory_order_relaxed));
                dst.add(buffer[readIndex]);
                read.store((readIndex + 1) % Capacity, std::memory_order_release);
            }
            return true;
        }

        size_t getAvailable() const noexcept
        {
            auto r = static_cast<size_t>(read.load(std::memory_order_acquire));
            auto w = static_cast<size_t>(write.load(std::memory_order_acquire));
            if (w >= r)
                return w - r;
            return Capacity - r + w;
        }

        void clear()
        {
            read.store(0, std::memory_order_release);
            write.store(0, std::memory_order_release);
        }

    private:
        std::array<SampleType, Capacity> buffer{};
        std::atomic<size_t> read{ 0 };
        std::atomic<size_t> write{ 0 };
    };
}

