import {
  Calendar,
  Clock,
  CreditCard,
  Facebook,
  LogIn,
  LogOut,
  MessageCircle,
  PenSquare,
  PlusCircle,
  Search,
  ShieldCheck,
  Tv,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NEWS_CATEGORIES } from '../data/initialData';
import { NewsCategory, UserRole } from '../types/news';
import { formatNumericDate, formatNumericTime } from '../utils/storage';
import { BrandLogo } from './BrandLogo';
import { WavingPakistanFlag } from './WavingPakistanFlag';

export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/share/19mVtAviw2/';

interface HeaderMastheadProps {
  selectedCategory: NewsCategory;
  onSelectCategory: (category: NewsCategory) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  role: UserRole;
  pendingCardCount: number;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenNewsroom: () => void;
  onOpenAddNews: () => void;
  onOpenLiveTv: () => void;
  onOpenWhatsAppVideo: () => void;
  onOpenDigitalCard: () => void;
}

export function HeaderMasthead({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  role,
  pendingCardCount,
  onOpenLogin,
  onLogout,
  onOpenNewsroom,
  onOpenAddNews,
  onOpenLiveTv,
  onOpenWhatsAppVideo,
  onOpenDigitalCard,
}: HeaderMastheadProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const numericDate = formatNumericDate(now);
  const numericTime = formatNumericTime(now, true);

  return (
    <header className="bg-white border-b border-[#E5E5E5]">
      {/* Solid Black (#111111) Main Header Utility Strip — Zero Yellow/Amber Outlines */}
      <div className="bg-[#111111] text-white border-b-2 border-[#B91C1C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Live Numeric Digital Clock & Calendar Date */}
          <div
            className="flex items-center gap-3 text-xs text-white font-mono-num"
            dir="ltr"
            aria-label="Live Date and Clock"
          >
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
              <span>{numericDate}</span>
            </span>
            <span className="text-white/35" aria-hidden="true">
              |
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-bold text-white">
              <Clock className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
              <span>{numericTime}</span>
            </span>
          </div>

          {/* Portal Actions: خبر شامل کریں + لائیو ٹی وی + Staff/Admin Login & Logout */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onOpenAddNews}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-md bg-white text-[#111111] hover:bg-[#F3F4F6] transition-colors text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer leading-[1.6]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" aria-hidden="true" />
              <span>خبر شامل کریں</span>
            </button>

            <button
              type="button"
              onClick={onOpenLiveTv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-md bg-[#B91C1C] text-white hover:bg-[#991B1B] transition-colors text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer leading-[1.6]"
            >
              <Tv className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>لائیو ٹی وی</span>
            </button>

            {role === 'visitor' ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="font-ui-sans inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] rounded-md border border-white/30 bg-transparent text-white hover:bg-white/10 transition-colors text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Staff / Admin Login</span>
              </button>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-white whitespace-nowrap px-1">
                  <ShieldCheck className="w-4 h-4 text-[#B91C1C] shrink-0" aria-hidden="true" />
                  <span>{role === 'admin' ? 'ایڈمن' : 'اسٹاف'}</span>
                </span>
                <button
                  type="button"
                  onClick={onOpenNewsroom}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-md bg-white text-[#B91C1C] hover:bg-[#F3F4F6] transition-colors text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <PenSquare className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    نیوز ڈیسک
                    {role === 'admin' && pendingCardCount > 0
                      ? ` (${pendingCardCount})`
                      : ''}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="font-ui-sans inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-md border border-white/35 bg-transparent text-white hover:bg-white/10 transition-colors text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Crisp White Masthead: Inline Bilingual Logo + Larger Flagpole Pakistan Flag + English Action Buttons + Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex items-center justify-between gap-3 sm:gap-5 min-w-0">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory('تازہ ترین');
              onSearchChange('');
            }}
            className="flex items-center gap-3 min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B91C1C]"
          >
            <BrandLogo variant="light" />
          </a>

          <div className="flex items-center shrink-0">
            <WavingPakistanFlag size="md" glowing />
          </div>
        </div>

        {/* English Action Buttons With Icons + Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 min-w-0">
          <div className="grid grid-cols-3 sm:flex items-center gap-2 shrink-0 font-ui-sans">
            <button
              type="button"
              onClick={onOpenWhatsAppVideo}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[42px] rounded-md bg-[#16A34A] text-white hover:bg-[#15803D] transition-colors text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Whatsapp</span>
            </button>

            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[42px] rounded-md bg-[#1877F2] text-white hover:bg-[#1464CC] transition-colors text-xs sm:text-sm font-bold whitespace-nowrap"
            >
              <Facebook className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Facebook</span>
            </a>

            <button
              type="button"
              onClick={onOpenDigitalCard}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[42px] rounded-md bg-[#111111] text-white hover:bg-[#262626] transition-colors text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-[#B91C1C] shrink-0" aria-hidden="true" />
              <span>Digital Card</span>
            </button>
          </div>

          <div className="relative w-full md:w-64 lg:w-72 min-w-0">
            <Search
              className="w-4 h-4 text-[#6B7280] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="خبریں، شہر یا موضوع تلاش کریں..."
              aria-label="خبریں تلاش کریں"
              className="w-full min-h-[42px] pr-10 pl-10 py-2 rounded-lg bg-[#F8F8F8] border border-[#D4D4D4] text-sm text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/15 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="تلاش صاف کریں"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#6B7280] hover:text-[#111111] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rich Vibrant Crimson Red (#B91C1C) Category Bar — Larger Nastaliq Text, Zero Yellow Outlines */}
      <nav
        aria-label="خبروں کے شعبے"
        className="bg-[#B91C1C] text-white border-t border-[#991B1B]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {NEWS_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-4 py-2 min-h-[44px] rounded-md text-base sm:text-[18px] font-bold leading-[1.9] whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-white hover:bg-white/15 hover:text-white'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
