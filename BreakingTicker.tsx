import { Radio } from 'lucide-react';
import { BreakingItem } from '../types/news';

interface BreakingTickerProps {
  items: BreakingItem[];
}

export function BreakingTicker({ items }: BreakingTickerProps) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="بریکنگ نیوز"
      className="bg-white text-[#111111] border-y-2 border-[#111111]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-stretch overflow-hidden">
        <div className="bg-[#B91C1C] text-white px-3.5 sm:px-4 py-2.5 flex items-center gap-2 shrink-0 z-10">
          <Radio className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          <span className="text-sm sm:text-base font-bold whitespace-nowrap leading-[1.7]">
            بریکنگ نیوز
          </span>
        </div>

        <div className="ticker-wrapper relative flex-1 overflow-hidden flex items-center py-2.5 min-w-0 bg-white">
          <div className="ticker-track items-center gap-8 px-4">
            {[0, 1].map((dupIndex) => (
              <div
                key={dupIndex}
                aria-hidden={dupIndex === 1}
                className="flex items-center gap-6 shrink-0"
              >
                {items.map((item) => (
                  <span
                    key={`${dupIndex}-${item.id}`}
                    className="inline-flex items-center gap-4 text-sm sm:text-base font-bold text-[#111111] whitespace-nowrap leading-[1.85]"
                  >
                    <span>{item.text}</span>
                    <span className="text-[#B91C1C] font-bold" aria-hidden="true">
                      ◆
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
