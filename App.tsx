/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ArrowLeft,
  CreditCard,
  Edit3,
  Facebook,
  MessageCircle,
  PenSquare,
  PlayCircle,
  PlusCircle,
  RotateCcw,
  Trash2,
  Tv,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ArticleModal } from './components/ArticleModal';
import { BrandLogo } from './components/BrandLogo';
import { BreakingTicker } from './components/BreakingTicker';
import { DigitalCardModal } from './components/DigitalCardModal';
import { FACEBOOK_PAGE_URL, HeaderMasthead } from './components/HeaderMasthead';
import { LiveTvModal } from './components/LiveTvModal';
import { LoginModal } from './components/LoginModal';
import { NewsCard } from './components/NewsCard';
import { NewsroomModal } from './components/NewsroomModal';
import { ResilientImage } from './components/ResilientImage';
import { WavingPakistanFlag } from './components/WavingPakistanFlag';
import { WhatsAppVideoModal } from './components/WhatsAppVideoModal';
import {
  INITIAL_ARTICLES,
  INITIAL_BREAKING_ITEMS,
  NEWS_CATEGORIES,
} from './data/initialData';
import {
  BreakingItem,
  DigitalCardRequest,
  NewsArticle,
  NewsCategory,
  PortalPasswords,
  UserRole,
  VideoSubmission,
} from './types/news';
import {
  formatNumericDateTime,
  loadArticles,
  loadBreakingItems,
  loadCardRequests,
  loadPasswords,
  loadStoredRole,
  loadVideoSubmissions,
  saveArticles,
  saveBreakingItems,
  saveCardRequests,
  savePasswords,
  saveStoredRole,
  saveVideoSubmissions,
} from './utils/storage';

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>(() => loadArticles());
  const [breakingItems, setBreakingItems] = useState<BreakingItem[]>(() =>
    loadBreakingItems()
  );
  const [passwords, setPasswords] = useState<PortalPasswords>(() =>
    loadPasswords()
  );
  const [role, setRole] = useState<UserRole>(() => loadStoredRole());
  const [videoSubmissions, setVideoSubmissions] = useState<VideoSubmission[]>(
    () => loadVideoSubmissions()
  );
  const [cardRequests, setCardRequests] = useState<DigitalCardRequest[]>(() =>
    loadCardRequests()
  );

  const [selectedCategory, setSelectedCategory] =
    useState<NewsCategory>('تازہ ترین');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pendingNewsroomAfterLogin, setPendingNewsroomAfterLogin] =
    useState(false);
  const [isNewsroomOpen, setIsNewsroomOpen] = useState(false);
  const [isWhatsAppVideoOpen, setIsWhatsAppVideoOpen] = useState(false);
  const [isDigitalCardOpen, setIsDigitalCardOpen] = useState(false);
  const [isLiveTvOpen, setIsLiveTvOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [confirmLeadDelete, setConfirmLeadDelete] = useState(false);

  // Sync changes to localStorage
  useEffect(() => {
    saveArticles(articles);
  }, [articles]);

  useEffect(() => {
    saveBreakingItems(breakingItems);
  }, [breakingItems]);

  useEffect(() => {
    savePasswords(passwords);
  }, [passwords]);

  useEffect(() => {
    saveStoredRole(role);
  }, [role]);

  useEffect(() => {
    saveVideoSubmissions(videoSubmissions);
  }, [videoSubmissions]);

  useEffect(() => {
    saveCardRequests(cardRequests);
  }, [cardRequests]);

  // Support deep-link URLs (#article-<id>) when shared via WhatsApp / Copy Link
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#article-')) {
        const targetId = hash.replace('#article-', '');
        const found = articles.find((a) => a.id === targetId);
        if (found) setActiveArticle(found);
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [articles]);

  const handleOpenArticle = (article: NewsArticle) => {
    setActiveArticle(article);
    window.history.replaceState(null, '', `#article-${article.id}`);
  };

  const handleCloseArticle = () => {
    setActiveArticle(null);
    if (window.location.hash.startsWith('#article-')) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  };

  // Filtered and sorted articles (matches category OR city for regional tabs like اسلام آباد، کراچی، لاہور، فیصل آباد، ملتان)
  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...articles]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .filter((article) => {
        const matchesCategory =
          selectedCategory === 'تازہ ترین' ||
          article.category === selectedCategory ||
          article.city === selectedCategory;
        if (!matchesCategory) return false;
        if (!query) return true;
        return (
          article.title.toLowerCase().includes(query) ||
          article.summary.toLowerCase().includes(query) ||
          article.city.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query)
        );
      });
  }, [articles, selectedCategory, searchQuery]);

  const videoArticles = useMemo(
    () =>
      [...articles]
        .filter(
          (a) =>
            a.mediaType === 'video' ||
            a.category === 'سوشل میڈیا / ویڈیوز' ||
            Boolean(a.videoUrl)
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [articles]
  );

  // Lead story selection
  const leadArticle = useMemo(() => {
    if (filteredArticles.length === 0) return null;
    return filteredArticles.find((item) => item.isLead) || filteredArticles[0];
  }, [filteredArticles]);

  const remainingArticles = useMemo(() => {
    if (!leadArticle) return [];
    return filteredArticles.filter((item) => item.id !== leadArticle.id);
  }, [filteredArticles, leadArticle]);

  const pendingCardCount = useMemo(
    () => cardRequests.filter((c) => c.status === 'pending').length,
    [cardRequests]
  );

  // Role-gated handlers
  const handleSaveArticle = (
    payload: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (role === 'visitor') return;
    const nowIso = new Date().toISOString();

    setArticles((prev) => {
      const normalized = payload.isLead
        ? prev.map((a) => ({ ...a, isLead: false }))
        : prev;

      if (existingId) {
        return normalized.map((item) =>
          item.id === existingId
            ? { ...item, ...payload, updatedAt: nowIso }
            : item
        );
      }

      const newArticle: NewsArticle = {
        ...payload,
        id: `art-${Date.now()}`,
        createdAt: nowIso,
      };
      return [newArticle, ...normalized];
    });
  };

  const handleDeleteArticle = (articleId: string) => {
    if (role !== 'admin') return;
    setArticles((prev) => prev.filter((item) => item.id !== articleId));
    setConfirmLeadDelete(false);
    if (activeArticle?.id === articleId) {
      handleCloseArticle();
    }
  };

  const handleUpdateBreakingItems = (nextItems: BreakingItem[]) => {
    if (role === 'visitor') return;
    setBreakingItems(nextItems);
  };

  const handleUpdatePasswords = (nextPasswords: PortalPasswords) => {
    if (role !== 'admin') return;
    setPasswords(nextPasswords);
  };

  const handleImportBackup = (
    importedArticles: NewsArticle[],
    importedTicker: BreakingItem[]
  ) => {
    if (role !== 'admin') return;
    setArticles(importedArticles);
    setBreakingItems(importedTicker);
  };

  const handleResetSampleData = () => {
    if (role !== 'admin') return;
    setArticles(INITIAL_ARTICLES);
    setBreakingItems(INITIAL_BREAKING_ITEMS);
  };

  // Video Submission Handlers
  const handleSaveVideoSubmission = (submission: VideoSubmission) => {
    setVideoSubmissions((prev) => [submission, ...prev]);
  };

  const handleDeleteVideoSubmission = (id: string) => {
    if (role !== 'admin') return;
    setVideoSubmissions((prev) => prev.filter((v) => v.id !== id));
  };

  // Digital Card Request Handlers
  const handleSubmitCardRequest = (request: DigitalCardRequest) => {
    setCardRequests((prev) => [request, ...prev]);
  };

  const handleApproveCardRequest = (id: string) => {
    if (role !== 'admin') return;
    setCardRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: 'approved', reviewedAt: new Date().toISOString() }
          : req
      )
    );
  };

  const handleRejectCardRequest = (id: string) => {
    if (role !== 'admin') return;
    setCardRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: 'rejected', reviewedAt: new Date().toISOString() }
          : req
      )
    );
  };

  const handleDeleteCardRequest = (id: string) => {
    if (role !== 'admin') return;
    setCardRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const handleOpenEdit = (article: NewsArticle) => {
    if (role === 'visitor') return;
    setActiveArticle(null);
    setEditingArticle(article);
    setIsNewsroomOpen(true);
  };

  const handleOpenCreate = () => {
    if (role === 'visitor') {
      setPendingNewsroomAfterLogin(true);
      setIsLoginOpen(true);
      return;
    }
    setEditingArticle(null);
    setIsNewsroomOpen(true);
  };

  const handleLogout = () => {
    setRole('visitor');
    setIsNewsroomOpen(false);
    setEditingArticle(null);
    setConfirmLeadDelete(false);
    setPendingNewsroomAfterLogin(false);
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-white text-[#111111]">
      <HeaderMasthead
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setConfirmLeadDelete(false);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        role={role}
        pendingCardCount={pendingCardCount}
        onOpenLogin={() => {
          setPendingNewsroomAfterLogin(false);
          setIsLoginOpen(true);
        }}
        onLogout={handleLogout}
        onOpenNewsroom={handleOpenCreate}
        onOpenAddNews={handleOpenCreate}
        onOpenLiveTv={() => setIsLiveTvOpen(true)}
        onOpenWhatsAppVideo={() => setIsWhatsAppVideoOpen(true)}
        onOpenDigitalCard={() => setIsDigitalCardOpen(true)}
      />

      <BreakingTicker items={breakingItems} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Active Role Banner */}
        {role !== 'visitor' && (
          <div className="bg-[#111111] text-white rounded-xl px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-white">
              <strong className="text-[#B91C1C] bg-white px-2 py-0.5 rounded ml-2">
                {role === 'admin' ? 'ایڈمن موڈ فعال' : 'اسٹاف موڈ فعال'}
              </strong>{' '}
              {role === 'admin'
                ? 'آپ خبریں شائع، ترمیم، حذف، ٹکر تبدیل، ڈیجیٹل کارڈ منظور/مسترد، پاس ورڈ سیٹ اور بیک اپ ایکسپورٹ کر سکتے ہیں۔'
                : 'آپ نئی خبریں شائع، موجودہ خبروں میں ترمیم اور بریکنگ نیوز ٹکر اپ ڈیٹ کر سکتے ہیں۔'}
            </div>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-md bg-[#B91C1C] text-white text-xs font-bold hover:bg-[#991B1B] whitespace-nowrap cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                نیوز ڈیسک کھولیں
                {role === 'admin' && pendingCardCount > 0
                  ? ` (${pendingCardCount} کارڈ زیرِ التواء)`
                  : ''}
              </span>
            </button>
          </div>
        )}

        {/* Section Heading & Count */}
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-[#B91C1C] pb-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] leading-[1.85]">
            {selectedCategory === 'تازہ ترین'
              ? 'اہم اور تازہ ترین خبریں'
              : selectedCategory}
          </h1>
          <span className="text-xs sm:text-sm text-[#4A4A4A]">
            کل خبریں:{' '}
            <span className="font-mono-num font-bold text-[#111111]">
              {filteredArticles.length}
            </span>
          </span>
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 ? (
          <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl p-8 sm:p-12 text-center space-y-4">
            <p className="text-base sm:text-lg font-bold text-[#111111]">
              اس تلاش یا شعبے میں فی الحال کوئی خبر موجود نہیں ہے۔
            </p>
            <p className="text-sm text-[#4A4A4A]">
              دیگر خبریں دیکھنے کے لیے تمام شعبے منتخب کریں یا تلاش صاف کریں۔
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('تازہ ترین');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md bg-[#B91C1C] text-white text-xs sm:text-sm font-bold hover:bg-[#991B1B] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>تمام خبریں دکھائیں</span>
            </button>
          </div>
        ) : (
          <>
            {/* Tier 1: Lead Story */}
            {leadArticle && (
              <section aria-label="بڑی خبر">
                <article className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleOpenArticle(leadArticle)}
                    className="lg:col-span-7 relative aspect-video lg:aspect-auto lg:min-h-[380px] overflow-hidden bg-[#EFEFEF] text-right cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#B91C1C]"
                  >
                    <ResilientImage
                      src={leadArticle.imageUrl}
                      alt={leadArticle.title}
                      fallbackTitle={leadArticle.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    {(leadArticle.mediaType === 'video' || leadArticle.videoUrl) && (
                      <div className="absolute bottom-3 right-3 bg-[#111111]/90 text-white px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1.5">
                        <PlayCircle className="w-4 h-4 text-[#B91C1C]" aria-hidden="true" />
                        <span>ویڈیو رپورٹ</span>
                      </div>
                    )}
                  </button>

                  <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between gap-5">
                    <div className="space-y-3.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A4A4A]">
                        <span className="font-extrabold text-[#B91C1C]">
                          لیڈ اسٹوری
                        </span>
                        <span className="text-[#B91C1C] font-bold" aria-hidden="true">
                          ◆
                        </span>
                        <span className="font-bold text-[#111111]">
                          {leadArticle.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{leadArticle.city}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num" dir="ltr">
                          {formatNumericDateTime(leadArticle.createdAt)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenArticle(leadArticle)}
                        className="text-right cursor-pointer group"
                      >
                        <h2
                          className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#111111] leading-[1.95] group-hover:text-[#B91C1C] transition-colors"
                          style={{ textWrap: 'balance' }}
                        >
                          {leadArticle.title}
                        </h2>
                      </button>

                      <p className="text-sm sm:text-base text-[#4A4A4A] leading-[2.05]">
                        {leadArticle.summary}
                      </p>

                      <p className="text-xs text-[#6B7280]">
                        رپورٹ: {leadArticle.author || 'نیوز ڈیسک'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#F0F0F0] flex flex-wrap items-center justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenArticle(leadArticle)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md bg-[#B91C1C] text-white text-xs sm:text-sm font-bold hover:bg-[#991B1B] transition-colors cursor-pointer"
                      >
                        <span>مکمل خبر پڑھیں</span>
                        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </button>

                      {role !== 'visitor' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(leadArticle)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-md border border-[#D4D4D4] text-xs font-semibold text-[#111111] hover:bg-[#F7F7F7] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>ترمیم</span>
                          </button>

                          {role === 'admin' && !confirmLeadDelete && (
                            <button
                              type="button"
                              onClick={() => setConfirmLeadDelete(true)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-md border border-[#FECACA] text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>حذف</span>
                            </button>
                          )}

                          {role === 'admin' && confirmLeadDelete && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteArticle(leadArticle.id)}
                                className="px-2.5 py-1.5 rounded bg-[#B91C1C] text-white text-xs font-semibold cursor-pointer"
                              >
                                تصدیق
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmLeadDelete(false)}
                                className="px-2.5 py-1.5 rounded border border-[#D4D4D4] text-xs font-semibold cursor-pointer"
                              >
                                نہیں
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </section>
            )}

            {/* Tier 2 & 3: Responsive News Grid */}
            {remainingArticles.length > 0 && (
              <section aria-label="مزید خبریں" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {remainingArticles.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      role={role}
                      onRead={handleOpenArticle}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeleteArticle}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Reporter, Facebook & Digital Card Portal Section — Crisp Red/Black/White Only */}
        <section
          aria-label="رپورٹر، فیس بک اور ڈیجیٹل کارڈ سروسز"
          className="bg-[#111111] text-white rounded-xl border-t-4 border-[#B91C1C] p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
        >
          <div className="lg:col-span-5 space-y-2.5">
            <div className="flex items-center gap-3">
              <WavingPakistanFlag size="sm" glowing />
              <h2 className="text-lg sm:text-xl font-bold text-white leading-[1.9]">
                نمائندہ ڈیجیٹل کارڈ، لائیو ٹی وی اور واٹس ایپ ڈیسک
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/85 leading-[2]">
              علاقائی صحافی، نمائندے اور شہری اپنی ویڈیو رپورٹس براہِ راست نیوز ڈیسک
              کو ارسال کریں، لائیو ٹی وی بلیٹن دیکھیں یا ڈیجیٹل کارڈ کے لیے آن
              لائن درخواست جمع کروائیں۔
            </p>
          </div>

          <div className="lg:col-span-7 flex flex-wrap items-center lg:justify-end gap-2.5">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-md bg-white text-[#111111] text-xs sm:text-sm font-bold hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#B91C1C] shrink-0" aria-hidden="true" />
              <span>خبر شامل کریں</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLiveTvOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-md bg-[#B91C1C] text-white text-xs sm:text-sm font-bold hover:bg-[#991B1B] transition-colors cursor-pointer"
            >
              <Tv className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>لائیو ٹی وی</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWhatsAppVideoOpen(true)}
              className="font-ui-sans inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-md bg-[#16A34A] text-white text-xs sm:text-sm font-bold hover:bg-[#15803D] transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Whatsapp</span>
            </button>

            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-ui-sans inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-md bg-[#1877F2] text-white text-xs sm:text-sm font-bold hover:bg-[#1464CC] transition-colors"
            >
              <Facebook className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Facebook</span>
            </a>

            <button
              type="button"
              onClick={() => setIsDigitalCardOpen(true)}
              className="font-ui-sans inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-md border border-white/40 bg-[#111111] text-white text-xs sm:text-sm font-bold hover:bg-white hover:text-[#111111] transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-[#B91C1C] shrink-0" aria-hidden="true" />
              <span>Digital Card</span>
            </button>
          </div>
        </section>
      </main>

      {/* Clean Editorial Footer — Crisp Red & Black Without Yellow Outlines */}
      <footer className="bg-[#111111] text-white border-t-4 border-[#B91C1C] mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <BrandLogo variant="dark" compact />
              <WavingPakistanFlag size="sm" glowing />
            </div>
            <p className="text-xs text-white/85 leading-[1.9]">
              فیصل آباد، پنجاب اور پاکستان بھر سے مصدقہ اور بروقت خبروں کا آزاد
              ڈیجیٹل پورٹل۔
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-white">
            {NEWS_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#B91C1C] transition-colors py-1 cursor-pointer"
              >
                {cat}
              </button>
            ))}
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-ui-sans inline-flex items-center gap-1 bg-[#1877F2] text-white px-2.5 py-1 rounded text-xs font-bold hover:bg-[#1464CC]"
            >
              <Facebook className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ArticleModal
        article={activeArticle}
        role={role}
        onClose={handleCloseArticle}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteArticle}
      />

      <LoginModal
        isOpen={isLoginOpen}
        passwords={passwords}
        onClose={() => {
          setIsLoginOpen(false);
          setPendingNewsroomAfterLogin(false);
        }}
        onLoginSuccess={(loggedInRole) => {
          setRole(loggedInRole);
          if (pendingNewsroomAfterLogin) {
            setPendingNewsroomAfterLogin(false);
            setEditingArticle(null);
            setIsNewsroomOpen(true);
          }
        }}
      />

      <NewsroomModal
        isOpen={isNewsroomOpen}
        role={role}
        editingArticle={editingArticle}
        breakingItems={breakingItems}
        cardRequests={cardRequests}
        passwords={passwords}
        articles={articles}
        onClose={() => {
          setIsNewsroomOpen(false);
          setEditingArticle(null);
        }}
        onSaveArticle={handleSaveArticle}
        onUpdateBreakingItems={handleUpdateBreakingItems}
        onApproveCardRequest={handleApproveCardRequest}
        onRejectCardRequest={handleRejectCardRequest}
        onDeleteCardRequest={handleDeleteCardRequest}
        onUpdatePasswords={handleUpdatePasswords}
        onImportBackup={handleImportBackup}
        onResetSampleData={handleResetSampleData}
      />

      <WhatsAppVideoModal
        isOpen={isWhatsAppVideoOpen}
        role={role}
        submissions={videoSubmissions}
        onClose={() => setIsWhatsAppVideoOpen(false)}
        onSaveSubmission={handleSaveVideoSubmission}
        onDeleteSubmission={handleDeleteVideoSubmission}
      />

      <DigitalCardModal
        isOpen={isDigitalCardOpen}
        cardRequests={cardRequests}
        onClose={() => setIsDigitalCardOpen(false)}
        onSubmitRequest={handleSubmitCardRequest}
      />

      <LiveTvModal
        isOpen={isLiveTvOpen}
        videoArticles={videoArticles}
        onClose={() => setIsLiveTvOpen(false)}
        onSelectArticle={handleOpenArticle}
      />
    </div>
  );
}
