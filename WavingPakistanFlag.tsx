interface WavingPakistanFlagProps {
  size?: 'sm' | 'md' | 'lg';
  glowing?: boolean;
}

export function WavingPakistanFlag({
  size = 'md',
  glowing = false,
}: WavingPakistanFlagProps) {
  const flagDimensions =
    size === 'sm'
      ? 'w-11 h-7'
      : size === 'lg'
        ? 'w-20 h-14 sm:w-24 sm:h-16'
        : 'w-16 h-11 sm:w-20 sm:h-[52px]';

  const poleHeight =
    size === 'sm'
      ? 'h-11'
      : size === 'lg'
        ? 'h-20 sm:h-24'
        : 'h-16 sm:h-[74px]';

  return (
    <div
      className={`inline-flex items-start gap-0.5 shrink-0 ${
        glowing ? 'pk-flag-glow' : ''
      }`}
      title="پاکستان زندہ باد"
      aria-label="ڈنڈے پر لہراتا ہوا پاکستانی پرچم"
      dir="ltr"
    >
      {/* Prominent Flagpole / Mast with Silver Metallic Finial & Pedestal Base */}
      <div className="flex flex-col items-center shrink-0">
        {/* Metallic Silver Finial Ball */}
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-white to-[#9CA3AF] border border-[#4B5563] shadow-sm" />
        {/* Metallic Pole */}
        <div
          className={`w-[4px] ${poleHeight} bg-gradient-to-r from-[#E5E7EB] via-[#9CA3AF] to-[#374151] rounded-b-sm relative`}
        >
          {/* Flag Mounting Rings */}
          <span className="absolute -right-[2px] top-1 w-2 h-1 rounded-full bg-[#D1D5DB]" />
          <span
            className={`absolute -right-[2px] ${
              size === 'sm' ? 'top-5' : 'top-9 sm:top-11'
            } w-2 h-1 rounded-full bg-[#D1D5DB]`}
          />
        </div>
        {/* Pedestal Base */}
        <div className="w-4 h-1.5 rounded-t-sm bg-[#111111] border-t border-[#9CA3AF]" />
      </div>

      {/* Larger Waving Flag */}
      <div
        className={`mt-2.5 relative overflow-hidden rounded-r-[4px] border border-black/25 shadow-md animate-pk-flag ${flagDimensions}`}
        style={{ transformOrigin: 'left center' }}
      >
        <svg
          viewBox="0 0 120 80"
          className="w-full h-full block"
          role="img"
          aria-hidden="true"
        >
          {/* Left 1/4 White Stripe (attached to flagpole) */}
          <rect x="0" y="0" width="30" height="80" fill="#FFFFFF" />
          {/* Right 3/4 Pakistan Green Field */}
          <rect x="30" y="0" width="90" height="80" fill="#01411C" />
          {/* White Crescent */}
          <circle cx="74" cy="40" r="18" fill="#FFFFFF" />
          <circle cx="80" cy="36" r="15" fill="#01411C" />
          {/* White 5-Pointed Star */}
          <polygon
            points="89,23 91.2,28.2 96.8,28.7 92.5,32.4 93.8,37.8 89,34.9 84.2,37.8 85.5,32.4 81.2,28.7 86.8,28.2"
            fill="#FFFFFF"
          />
        </svg>

        {/* Subtle cloth wave sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-black/15 animate-pk-shimmer" />
      </div>
    </div>
  );
}
