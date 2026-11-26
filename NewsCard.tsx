import { Edit3, PlayCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { NewsArticle, UserRole } from '../types/news';
import { formatNumericDateTime } from '../utils/storage';
import { ResilientImage } from './ResilientImage';

interface NewsCardProps {
  article: NewsArticle;
  role: UserRole;
  onRead: (article: NewsArticle) => void;
  onEdit: (article: NewsArticle) => void;
  onDelete: (articleId: string) => void;
}

export function NewsCard({
  article,
  role,
  onRead,
  onEdit,
  onDelete,
}: NewsCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <article className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden flex flex-col justify-between transition-colors hover:border-[#0D0D0D]/40">
      <div>
        <button
          type="button"
          onClick={() => onRead(article)}
          className="block w-full text-right cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#C8102E]"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFEFEF]">
            <ResilientImage
              src={article.imageUrl}
              alt={article.title}
              fallbackTitle={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {(article.mediaType === 'video' || article.videoUrl) && (
              <div className="absolute bottom-2.5 right-2.5 bg-[#0D0D0D]/85 text-white px-2.5 py-1 rounded text-[11px] font-medium inline-flex items-center gap-1">
                <PlayCircle className="w-3.5 h-3.5 text-[#C8102E]" aria-hidden="true" />
                <span>ویڈیو</span>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 space-y-2.5">
            {/* Unboxed Metadata Line */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#4A4A4A]">
              <span className="font-bold text-[#B91C1C]">{article.category}</span>
              <span aria-hidden="true">·</span>
              <span>{article.city}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num" dir="ltr">
                {formatNumericDateTime(article.createdAt)}
              </span>
            </div>

            <h3
              className="text-base sm:text-lg font-extrabold text-[#111111] leading-[1.95] group-hover:text-[#B91C1C] transition-colors line-clamp-2 py-0.5"
              style={{ textWrap: 'balance' }}
            >
              {article.title}
            </h3>

            <p className="text-sm text-[#4A4A4A] leading-[2.05] line-clamp-3">
              {article.summary}
            </p>
          </div>
        </button>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-[#F2F2F2] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onRead(article)}
          className="text-xs sm:text-sm font-bold text-[#B91C1C] hover:underline py-1.5 cursor-pointer"
        >
          مکمل خبر پڑھیں
        </button>

        {role !== 'visitor' && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(article)}
              aria-label={`ترمیم: ${article.title}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-[#D4D4D4] text-xs font-semibold text-[#0D0D0D] hover:bg-[#F7F7F7] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>ترمیم</span>
            </button>

            {role === 'admin' && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label={`حذف: ${article.title}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-[#FECACA] text-xs font-semibold text-[#C8102E] hover:bg-[#FEF2F2] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>حذف</span>
              </button>
            )}

            {role === 'admin' && confirmDelete && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onDelete(article.id)}
                  className="px-2 py-1 rounded bg-[#C8102E] text-white text-[11px] font-semibold cursor-pointer"
                >
                  تصدیق
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 rounded border border-[#D4D4D4] text-[11px] font-semibold cursor-pointer"
                >
                  نہیں
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
