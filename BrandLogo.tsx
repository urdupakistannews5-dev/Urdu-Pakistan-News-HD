interface BrandLogoProps {
  variant?: 'light' | 'dark';
  compact?: boolean;
}

export function BrandLogo({ variant = 'light', compact = false }: BrandLogoProps) {
  const isDarkSurface = variant === 'dark';

  return (
    <div
      className="inline-flex items-center gap-2.5 sm:gap-3.5 select-none min-w-0"
      dir="rtl"
    >
      {/* Rich Red Brand Emblem Box (#B91C1C) — Zero Yellow/Amber Outlines */}
      <div
        className={`flex flex-col items-center justify-center rounded-lg border shrink-0 bg-[#B91C1C] text-white shadow-sm ${
          isDarkSurface ? 'border-white/30' : 'border-[#991B1B]'
        } ${compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5 sm:px-3.5 sm:py-2'}`}
      >
        <span
          className={`font-urdu-display font-bold leading-[1.35] ${
            compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
          }`}
        >
          اُردو
        </span>
        <div className="flex items-center gap-1 mt-0.5 font-ui-sans" dir="ltr">
          <span className="text-[9px] sm:text-[10px] font-extrabold tracking-tight text-white">
            Pakistan
          </span>
          <span className="text-[9px] sm:text-[10px] font-extrabold text-white">
            NEWS
          </span>
          <span className="text-[8px] sm:text-[9px] font-mono-num font-bold bg-white text-[#B91C1C] px-1 rounded leading-tight">
            HD
          </span>
        </div>
      </div>

      {/* Inline Bilingual Brand Title: Urdu & English on the SAME row/line */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={`font-urdu-display font-bold leading-[1.7] ${
              compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-[27px]'
            } ${isDarkSurface ? 'text-white' : 'text-[#111111]'}`}
          >
            اُردو پاکستان نیوز
          </span>
          <span
            className="inline-flex items-center justify-center rounded px-1.5 py-0.5 font-mono-num font-extrabold leading-none bg-[#B91C1C] text-white text-[10px] sm:text-xs shrink-0"
            dir="ltr"
          >
            HD
          </span>
        </div>

        <span
          className={`hidden sm:inline text-sm font-bold ${
            isDarkSurface ? 'text-white/40' : 'text-[#D4D4D4]'
          }`}
          aria-hidden="true"
        >
          |
        </span>

        <span
          className={`font-ui-sans font-extrabold tracking-tight whitespace-nowrap ${
            compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'
          } ${isDarkSurface ? 'text-white' : 'text-[#111111]'}`}
          dir="ltr"
        >
          Urdu Pakistan News{' '}
          <span className={isDarkSurface ? 'text-white' : 'text-[#B91C1C]'}>
            <span className="font-mono-num">HD</span>
          </span>
        </span>
      </div>
    </div>
  );
}
