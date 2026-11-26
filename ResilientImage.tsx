import { Newspaper } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EFEFEF] via-[#F7F7F7] to-[#E5E5E5] text-[#4A4A4A] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Newspaper className="w-8 h-8 text-[#C8102E]/80 mb-2 shrink-0" />
        <span className="text-xs font-medium text-[#0D0D0D]/80 line-clamp-2 max-w-[26ch]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
