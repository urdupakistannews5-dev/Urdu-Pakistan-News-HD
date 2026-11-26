import { ExternalLink, PlayCircle, Radio, Tv, X } from 'lucide-react';
import { useEffect } from 'react';
import { NewsArticle } from '../types/news';
import { formatNumericDateTime } from '../utils/storage';
import { BrandLogo } from './BrandLogo';
import { ResilientImage } from './ResilientImage';

interface LiveTvModalProps {
  isOpen: boolean;
  videoArticles: NewsArticle[];
  onClose: () => void;
  onSelectArticle: (article: NewsArticle) => void;
}

export function LiveTvModal({
  isOpen,
  videoArticles,
  onClose,
  onSelectArticle,
}: LiveTvModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const featuredVideo = videoArticles[0] || null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-tv-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[#111111] text-white border-b-2 border-[#B91C1C] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Tv className="w-5 h-5 text-[#B91C1C]" aria-hidden="true" />
            <h2
              id="live-tv-modal-title"
              className="text-lg sm:text-xl font-bold leading-[1.6]"
            >
              لائیو ٹی وی اور ویڈیو بلیٹن
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بند کریں"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md text-white/90 hover:bg-white/15 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Broadcast Studio Player Card */}
          <div className="bg-[#111111] text-white rounded-xl overflow-hidden border border-[#262626]">
            <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
              <BrandLogo variant="dark" compact />
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                <Radio className="w-4 h-4 text-[#B91C1C]" aria-hidden="true" />
                <span>HD ڈیجیٹل نشریات</span>
              </span>
            </div>

            {featuredVideo ? (
              <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                <div className="md:col-span-7 relative aspect-video bg-black">
                  <ResilientImage
                    src={featuredVideo.imageUrl}
                    alt={featuredVideo.title}
                    fallbackTitle={featuredVideo.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end p-4">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectArticle(featuredVideo);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-md bg-[#B91C1C] text-white text-xs sm:text-sm font-bold hover:bg-[#991B1B] cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" aria-hidden="true" />
                      <span>مکمل ویڈیو رپورٹ دیکھیں</span>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 p-4 sm:p-5 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#B91C1C]">
                      نمایاں ویڈیو بلیٹن
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-[1.8]">
                      {featuredVideo.title}
                    </h3>
                    <p className="text-xs text-white/75 leading-[1.9] line-clamp-3">
                      {featuredVideo.summary}
                    </p>
                  </div>

                  {featuredVideo.videoUrl && (
                    <a
                      href={featuredVideo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-md bg-white text-[#111111] text-xs font-bold hover:bg-[#B91C1C] hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      <span>یوٹیوب / لائیو اسٹریم کھولیں</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm font-bold text-white">
                  اُردو پاکستان نیوز HD ڈیجیٹل براڈکاسٹ
                </p>
                <p className="text-xs text-white/75">
                  اسٹاف یا ایڈمن نیوز ڈیسک سے نئی ویڈیو رپورٹس شامل کرنے پر یہاں
                  براہِ راست دستیاب ہوں گی۔
                </p>
              </div>
            )}
          </div>

          {/* Video Bulletins List */}
          {videoArticles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#111111]">
                حالیہ ویڈیو اور سوشل میڈیا رپورٹس ({videoArticles.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {videoArticles.map((vid) => (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectArticle(vid);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] hover:border-[#B91C1C] text-right transition-colors cursor-pointer"
                  >
                    <div className="w-24 aspect-video rounded overflow-hidden shrink-0 bg-[#E5E5E5]">
                      <ResilientImage
                        src={vid.imageUrl}
                        alt={vid.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs sm:text-sm font-bold text-[#111111] line-clamp-2 leading-[1.7]">
                        {vid.title}
                      </p>
                      <p className="text-[11px] font-mono-num text-[#6B7280]" dir="ltr">
                        {formatNumericDateTime(vid.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
