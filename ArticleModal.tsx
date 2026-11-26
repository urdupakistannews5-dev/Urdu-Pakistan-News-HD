import {
  Check,
  Copy,
  Edit3,
  ExternalLink,
  MessageCircle,
  PlayCircle,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NewsArticle, UserRole } from '../types/news';
import { formatNumericDateTime } from '../utils/storage';
import { ResilientImage } from './ResilientImage';

interface ArticleModalProps {
  article: NewsArticle | null;
  role: UserRole;
  onClose: () => void;
  onEdit: (article: NewsArticle) => void;
  onDelete: (articleId: string) => void;
}

export function ArticleModal({
  article,
  role,
  onClose,
  onEdit,
  onDelete,
}: ArticleModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setCopied(false);
    setConfirmDelete(false);
  }, [article?.id]);

  useEffect(() => {
    if (!article) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [article, onClose]);

  if (!article) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}#article-${article.id}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${article.title}\n\n${article.summary}\n\n${shareUrl}`
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  };

  const paragraphs = article.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
      onClick={onClose}
    >
      <article
        className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="sticky top-0 z-10 bg-[#0D0D0D] text-white border-b-2 border-[#C8102E] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-white/85 min-w-0 truncate">
            <span className="font-bold text-[#C8102E]">{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>{article.city}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num" dir="ltr">
              {formatNumericDateTime(article.createdAt)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="مضمون بند کریں"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-8 space-y-6">
          <header className="space-y-3">
            <h2
              id="article-modal-title"
              className="text-2xl sm:text-3xl font-bold text-[#0D0D0D] leading-[1.65]"
              style={{ textWrap: 'balance' }}
            >
              {article.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#4A4A4A] border-b border-[#E5E5E5] pb-4">
              <span>رپورٹ: {article.author || 'نیوز ڈیسک'}</span>
              <span aria-hidden="true">·</span>
              <span>شہر: {article.city}</span>
              {article.updatedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    اپ ڈیٹ:{' '}
                    <span className="font-mono-num" dir="ltr">
                      {formatNumericDateTime(article.updatedAt)}
                    </span>
                  </span>
                </>
              )}
            </div>
          </header>

          {/* Image / Poster Preview */}
          <figure className="space-y-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#EFEFEF]">
              <ResilientImage
                src={article.imageUrl}
                alt={article.title}
                fallbackTitle={article.title}
                className="w-full h-full object-cover"
              />
              {(article.mediaType === 'video' || article.videoUrl) && (
                <div className="absolute bottom-3 right-3 bg-[#0D0D0D]/85 text-white px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-[#C8102E]" aria-hidden="true" />
                  <span>ویڈیو / سوشل میڈیا رپورٹ</span>
                </div>
              )}
            </div>
            {article.videoUrl && (
              <div className="pt-1">
                <a
                  href={article.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#C8102E] hover:underline"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>متعلقہ ویڈیو یا سوشل میڈیا پوسٹ دیکھیں</span>
                </a>
              </div>
            )}
          </figure>

          {/* Summary Lead */}
          <p className="text-base sm:text-lg font-semibold text-[#0D0D0D] leading-[1.9] bg-[#F7F7F7] p-4 rounded-lg border border-[#E5E5E5]">
            {article.summary}
          </p>

          {/* Full Reading Body */}
          <div className="max-w-2xl space-y-4 text-base text-[#1A1A1A] leading-[2.05]">
            {paragraphs.map((para, index) => (
              <p key={index}>{para}</p>
            ))}
          </div>

          {/* Share & Role Actions Bar */}
          <footer className="pt-5 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md bg-[#C8102E] text-white hover:bg-[#A00D24] transition-colors text-xs sm:text-sm font-semibold whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>واٹس ایپ پر شیئر کریں</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md border border-[#D4D4D4] bg-white text-[#0D0D0D] hover:bg-[#F7F7F7] transition-colors text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#115E3B] shrink-0" aria-hidden="true" />
                    <span className="text-[#115E3B]">لنک کاپی ہو گیا</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>لنک کاپی کریں</span>
                  </>
                )}
              </button>
            </div>

            {role !== 'visitor' && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(article)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-md border border-[#0D0D0D] bg-white text-[#0D0D0D] hover:bg-[#F7F7F7] transition-colors text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>ترمیم کریں</span>
                </button>

                {role === 'admin' && !confirmDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-md border border-[#FECACA] bg-white text-[#C8102E] hover:bg-[#FEF2F2] transition-colors text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>حذف کریں</span>
                  </button>
                )}

                {role === 'admin' && confirmDelete && (
                  <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-md">
                    <span className="text-xs font-semibold text-[#991B1B]">
                      پکی حذف؟
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(article.id);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded bg-[#C8102E] text-white text-xs font-semibold hover:bg-[#A00D24] cursor-pointer"
                    >
                      جی ہاں
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1.5 rounded bg-white border border-[#D4D4D4] text-[#0D0D0D] text-xs font-semibold hover:bg-[#F7F7F7] cursor-pointer"
                    >
                      نہیں
                    </button>
                  </div>
                )}
              </div>
            )}
          </footer>
        </div>
      </article>
    </div>
  );
}
