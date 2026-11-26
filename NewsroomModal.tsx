import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Download,
  ExternalLink,
  Image as ImageIcon,
  KeyRound,
  Plus,
  Radio,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ARTICLE_CATEGORIES } from '../data/initialData';
import {
  ArticleCategory,
  BreakingItem,
  DigitalCardRequest,
  MediaType,
  NewsArticle,
  PortalBackupPayload,
  PortalPasswords,
  UserRole,
} from '../types/news';
import {
  compressImageFile,
  formatNumericDate,
  formatNumericDateTime,
} from '../utils/storage';
import { DigitalIdCardView } from './DigitalIdCardView';
import { ResilientImage } from './ResilientImage';

type NewsroomTab = 'article' | 'ticker' | 'cards' | 'passwords' | 'backup';

interface NewsroomModalProps {
  isOpen: boolean;
  role: UserRole;
  editingArticle: NewsArticle | null;
  breakingItems: BreakingItem[];
  cardRequests: DigitalCardRequest[];
  passwords: PortalPasswords;
  articles: NewsArticle[];
  onClose: () => void;
  onSaveArticle: (
    payload: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => void;
  onUpdateBreakingItems: (items: BreakingItem[]) => void;
  onApproveCardRequest: (id: string) => void;
  onRejectCardRequest: (id: string) => void;
  onDeleteCardRequest: (id: string) => void;
  onUpdatePasswords: (nextPasswords: PortalPasswords) => void;
  onImportBackup: (
    articles: NewsArticle[],
    breakingItems: BreakingItem[]
  ) => void;
  onResetSampleData: () => void;
}

export function NewsroomModal({
  isOpen,
  role,
  editingArticle,
  breakingItems,
  cardRequests,
  passwords,
  articles,
  onClose,
  onSaveArticle,
  onUpdateBreakingItems,
  onApproveCardRequest,
  onRejectCardRequest,
  onDeleteCardRequest,
  onUpdatePasswords,
  onImportBackup,
  onResetSampleData,
}: NewsroomModalProps) {
  const [activeTab, setActiveTab] = useState<NewsroomTab>('article');

  // Article form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('فیصل آباد');
  const [city, setCity] = useState('فیصل آباد');
  const [author, setAuthor] = useState('نیوز ڈیسک');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('article');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLead, setIsLead] = useState(false);
  const [formNotice, setFormNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  // Breaking ticker state
  const [newTickerText, setNewTickerText] = useState('');
  const [editingTickerId, setEditingTickerId] = useState<string | null>(null);
  const [editingTickerText, setEditingTickerText] = useState('');

  // Card review preview
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);

  // Admin password management state
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Admin backup state
  const [backupNotice, setBackupNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormNotice(null);
    setPasswordNotice(null);
    setBackupNotice(null);
    setConfirmReset(false);
    setPreviewCardId(null);

    if (editingArticle) {
      setActiveTab('article');
      setTitle(editingArticle.title);
      setCategory(editingArticle.category);
      setCity(editingArticle.city);
      setAuthor(editingArticle.author);
      setSummary(editingArticle.summary);
      setContent(editingArticle.content);
      setImageUrl(editingArticle.imageUrl);
      setMediaType(editingArticle.mediaType || 'article');
      setVideoUrl(editingArticle.videoUrl || '');
      setIsLead(Boolean(editingArticle.isLead));
    } else {
      setTitle('');
      setCategory('فیصل آباد');
      setCity('فیصل آباد');
      setAuthor('نیوز ڈیسک');
      setSummary('');
      setContent('');
      setImageUrl('');
      setMediaType('article');
      setVideoUrl('');
      setIsLead(false);
    }
  }, [isOpen, editingArticle]);

  useEffect(() => {
    if (
      role !== 'admin' &&
      (activeTab === 'cards' || activeTab === 'passwords' || activeTab === 'backup')
    ) {
      setActiveTab('article');
    }
  }, [role, activeTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || role === 'visitor') return null;

  const isAdmin = role === 'admin';
  const pendingCount = cardRequests.filter((c) => c.status === 'pending').length;
  const previewCard = previewCardId
    ? cardRequests.find((c) => c.id === previewCardId) || null
    : null;

  const handleImageFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingImage(true);
    setFormNotice(null);
    try {
      const compressedDataUrl = await compressImageFile(file);
      setImageUrl(compressedDataUrl);
      setFormNotice({
        type: 'success',
        text: 'تصویر کامیابی سے لوڈ ہو گئی ہے۔',
      });
    } catch (err) {
      setFormNotice({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'تصویر اپ لوڈ کرنے میں مسئلہ پیش آیا۔',
      });
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  const handleArticleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) {
      setFormNotice({
        type: 'error',
        text: 'براہ کرم عنوان، خلاصہ اور مکمل تفصیل لازمی درج کریں۔',
      });
      return;
    }

    onSaveArticle(
      {
        title: title.trim(),
        category,
        city: city.trim() || 'پاکستان',
        author: author.trim() || 'نیوز ڈیسک',
        summary: summary.trim(),
        content: content.trim(),
        imageUrl:
          imageUrl.trim() ||
          '/src/assets/images/faisalabad_clock_tower_1795633772481.jpg',
        mediaType,
        videoUrl: videoUrl.trim() || undefined,
        isLead,
      },
      editingArticle?.id
    );

    onClose();
  };

  // Breaking Ticker Handlers (Staff + Admin)
  const handleAddTicker = (e: FormEvent) => {
    e.preventDefault();
    const text = newTickerText.trim();
    if (!text) return;
    const next: BreakingItem[] = [
      {
        id: `brk-${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
      },
      ...breakingItems,
    ];
    onUpdateBreakingItems(next);
    setNewTickerText('');
  };

  const handleSaveTickerEdit = (id: string) => {
    const trimmed = editingTickerText.trim();
    if (!trimmed) return;
    onUpdateBreakingItems(
      breakingItems.map((item) =>
        item.id === id ? { ...item, text: trimmed } : item
      )
    );
    setEditingTickerId(null);
    setEditingTickerText('');
  };

  const handleMoveTicker = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= breakingItems.length) return;
    const copy = [...breakingItems];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    onUpdateBreakingItems(copy);
  };

  const handleDeleteTicker = (id: string) => {
    onUpdateBreakingItems(breakingItems.filter((item) => item.id !== id));
  };

  // Admin Password Change Handler
  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const trimmedStaff = newStaffPassword.trim();
    const trimmedAdmin = newAdminPassword.trim();

    if (!trimmedStaff && !trimmedAdmin) {
      setPasswordNotice({
        type: 'error',
        text: 'تبدیل کرنے کے لیے کم از کم ایک نیا پاس ورڈ درج کریں۔',
      });
      return;
    }

    if (
      (trimmedStaff && trimmedStaff.length < 4) ||
      (trimmedAdmin && trimmedAdmin.length < 4)
    ) {
      setPasswordNotice({
        type: 'error',
        text: 'نیا پاس ورڈ کم از کم 4 حروف یا ہندسوں پر مشتمل ہونا چاہیے۔',
      });
      return;
    }

    onUpdatePasswords({
      staffPassword: trimmedStaff || passwords.staffPassword,
      adminPassword: trimmedAdmin || passwords.adminPassword,
    });
    setNewStaffPassword('');
    setNewAdminPassword('');
    setPasswordNotice({
      type: 'success',
      text: 'پاس ورڈز کامیابی سے محفوظ کر دیے گئے ہیں۔',
    });
  };

  // Admin Export JSON Backup
  const handleExportJson = () => {
    if (!isAdmin) return;
    const payload: PortalBackupPayload = {
      portal: 'Urdu Pakistan News HD',
      exportedAt: new Date().toISOString(),
      articles,
      breakingItems,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `urdu-pakistan-news-backup-${formatNumericDate(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setBackupNotice({
      type: 'success',
      text: 'خبروں کا بیک اپ JSON فائل ڈاؤن لوڈ ہو گئی ہے۔',
    });
  };

  // Admin Import JSON Backup
  const handleImportJson = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupNotice(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<PortalBackupPayload>;
      if (!Array.isArray(parsed.articles) || parsed.articles.length === 0) {
        throw new Error('بیک اپ فائل میں خبریں موجود نہیں ہیں۔');
      }
      const validArticles = parsed.articles.filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.content === 'string'
      );
      if (validArticles.length === 0) {
        throw new Error('فائل کا فارمیٹ درست نہیں ہے۔');
      }
      const validTicker = Array.isArray(parsed.breakingItems)
        ? parsed.breakingItems.filter(
            (item) => item && typeof item.id === 'string' && typeof item.text === 'string'
          )
        : breakingItems;

      onImportBackup(validArticles, validTicker);
      setBackupNotice({
        type: 'success',
        text: `${validArticles.length} خبریں کامیابی سے بحال ہو گئیں۔`,
      });
    } catch (err) {
      setBackupNotice({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'JSON بیک اپ فائل پڑھنے میں خرابی پیش آئی۔',
      });
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsroom-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0D0D0D] text-white border-b-2 border-[#C8102E] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div>
            <h2
              id="newsroom-modal-title"
              className="text-base sm:text-lg font-bold"
            >
              نیوز ڈیسک پینل —{' '}
              {isAdmin ? 'ایڈمن (مکمل رسائی)' : 'اسٹاف (اشاعت و ترمیم)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="پینل بند کریں"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Tabs */}
        <div className="border-b border-[#E5E5E5] bg-[#F7F7F7] px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('article')}
            className={`px-3.5 py-2 min-h-[40px] rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'article'
                ? 'bg-[#C8102E] text-white'
                : 'text-[#0D0D0D] bg-white border border-[#E5E5E5] hover:bg-[#EFEFEF]'
            }`}
          >
            {editingArticle ? 'خبر میں ترمیم کریں' : 'نئی خبر شائع کریں'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ticker')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ticker'
                ? 'bg-[#C8102E] text-white'
                : 'text-[#0D0D0D] bg-white border border-[#E5E5E5] hover:bg-[#EFEFEF]'
            }`}
          >
            <Radio className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>بریکنگ نیوز ٹکر</span>
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'cards'
                    ? 'bg-[#C8102E] text-white'
                    : 'text-[#0D0D0D] bg-white border border-[#E5E5E5] hover:bg-[#EFEFEF]'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  ڈیجیٹل کارڈ درخواستیں
                  {pendingCount > 0 ? ` (${pendingCount})` : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('passwords')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'passwords'
                    ? 'bg-[#C8102E] text-white'
                    : 'text-[#0D0D0D] bg-white border border-[#E5E5E5] hover:bg-[#EFEFEF]'
                }`}
              >
                <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>پاس ورڈ سیٹنگز</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('backup')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'backup'
                    ? 'bg-[#C8102E] text-white'
                    : 'text-[#0D0D0D] bg-white border border-[#E5E5E5] hover:bg-[#EFEFEF]'
                }`}
              >
                <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>بیک اپ (JSON)</span>
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* TAB 1: Create / Edit Article */}
          {activeTab === 'article' && (
            <form onSubmit={handleArticleSubmit} className="space-y-4">
              {formNotice && (
                <div
                  role="status"
                  className={`text-xs sm:text-sm font-semibold px-4 py-3 rounded-lg border ${
                    formNotice.type === 'success'
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                  }`}
                >
                  {formNotice.text}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0D0D0D]">
                  خبر کا عنوان *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: فیصل آباد میں نئے صنعتی زون کی تعمیر کا آغاز..."
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#0D0D0D] focus:outline-none focus:border-[#C8102E]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0D0D0D]">
                    شعبہ / کیٹیگری
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#0D0D0D] focus:outline-none focus:border-[#C8102E]"
                  >
                    {ARTICLE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0D0D0D]">
                    شہر / مقام
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="فیصل آباد، لاہور، اسلام آباد..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#0D0D0D] focus:outline-none focus:border-[#C8102E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0D0D0D]">
                    رپورٹر / ڈیسک
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="نام رپورٹر یا نیوز ڈیسک"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#0D0D0D] focus:outline-none focus:border-[#C8102E]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0D0D0D]">
                  مختصر خلاصہ (Lead Summary) *
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="خبر کا مختصر دو سے تین سطروں پر مشتمل تعارف..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#0D0D0D] leading-relaxed focus:outline-none focus:border-[#C8102E]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0D0D0D]">
                  مکمل خبر / مضمون *
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="تفصیلی خبر یہاں تحریر کریں۔ پیراگراف کے درمیان خالی سطر چھوڑیں۔"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#0D0D0D] leading-relaxed focus:outline-none focus:border-[#C8102E]"
                  required
                />
              </div>

              {/* Image Upload or URL */}
              <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#0D0D0D] inline-flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#C8102E]" aria-hidden="true" />
                    <span>تصویر / پوسٹر (اپ لوڈ یا لنک)</span>
                  </span>

                  <label className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-md bg-[#0D0D0D] text-white hover:bg-[#262626] text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {isCompressingImage ? 'لوڈ ہو رہی ہے...' : 'فائل اپ لوڈ کریں'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  dir="ltr"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... یا اوپر بٹن سے تصویر اپ لوڈ کریں"
                  className="w-full min-h-[42px] px-3 py-2 rounded-md bg-white border border-[#D4D4D4] text-xs font-mono-num text-[#0D0D0D] focus:outline-none focus:border-[#C8102E]"
                />

                {imageUrl && (
                  <div className="aspect-video max-w-xs overflow-hidden rounded-md border border-[#E5E5E5]">
                    <ResilientImage
                      src={imageUrl}
                      alt={title || 'تصویر کا پیش نظارہ'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Media Type + Optional Video Link + Lead Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0D0D0D]">
                    پوسٹ کی نوعیت
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as MediaType)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#0D0D0D] focus:outline-none focus:border-[#C8102E]"
                  >
                    <option value="article">تحریری خبر</option>
                    <option value="video">ویڈیو رپورٹ</option>
                    <option value="social">سوشل میڈیا پوسٹ</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0D0D0D]">
                    ویڈیو یا سوشل میڈیا لنک (اختیاری)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/... or social link"
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-white border border-[#D4D4D4] text-xs font-mono-num text-[#0D0D0D] focus:outline-none focus:border-[#C8102E]"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2.5 text-sm font-medium text-[#0D0D0D] cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={isLead}
                  onChange={(e) => setIsLead(e.target.checked)}
                  className="w-4 h-4 accent-[#C8102E] rounded cursor-pointer"
                />
                <span>اس خبر کو صفحہ اول کی بڑی لیڈ اسٹوری بنائیں</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 min-h-[44px] rounded-md border border-[#D4D4D4] bg-white text-xs sm:text-sm font-semibold text-[#333333] hover:bg-[#F7F7F7] cursor-pointer"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-md bg-[#C8102E] text-white text-xs sm:text-sm font-semibold hover:bg-[#A00D24] cursor-pointer"
                >
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>{editingArticle ? 'تبدیلیاں محفوظ کریں' : 'خبر شائع کریں'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Breaking News Ticker (Staff + Admin) */}
          {activeTab === 'ticker' && (
            <div className="space-y-5">
              <form onSubmit={handleAddTicker} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={newTickerText}
                  onChange={(e) => setNewTickerText(e.target.value)}
                  placeholder="نئی بریکنگ نیوز کی سرخی درج کریں..."
                  className="flex-1 min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#0D0D0D] focus:outline-none focus:border-[#C8102E]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-md bg-[#C8102E] text-white text-xs sm:text-sm font-semibold hover:bg-[#A00D24] whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>ٹکر میں شامل کریں</span>
                </button>
              </form>

              <div className="space-y-2.5">
                {breakingItems.length === 0 ? (
                  <p className="text-sm text-[#4A4A4A] py-4 text-center bg-[#F7F7F7] rounded-lg border border-[#E5E5E5]">
                    اس وقت بریکنگ نیوز ٹکر خالی ہے۔
                  </p>
                ) : (
                  breakingItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {editingTickerId === item.id ? (
                        <div className="flex-1 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={editingTickerText}
                            onChange={(e) => setEditingTickerText(e.target.value)}
                            className="flex-1 min-h-[40px] px-3 py-1.5 rounded-md border border-[#C8102E] bg-white text-sm text-[#0D0D0D]"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveTickerEdit(item.id)}
                              className="px-3 py-2 rounded bg-[#0D0D0D] text-white text-xs font-semibold cursor-pointer"
                            >
                              محفوظ
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTickerId(null)}
                              className="px-3 py-2 rounded border border-[#D4D4D4] bg-white text-xs font-semibold cursor-pointer"
                            >
                              منسوخ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-[#0D0D0D] leading-relaxed flex-1">
                            {item.text}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveTicker(idx, -1)}
                              disabled={idx === 0}
                              aria-label="اوپر لے جائیں"
                              className="p-2 rounded border border-[#D4D4D4] bg-white text-[#0D0D0D] hover:bg-[#EFEFEF] disabled:opacity-40 cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveTicker(idx, 1)}
                              disabled={idx === breakingItems.length - 1}
                              aria-label="نیچے لے جائیں"
                              className="p-2 rounded border border-[#D4D4D4] bg-white text-[#0D0D0D] hover:bg-[#EFEFEF] disabled:opacity-40 cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTickerId(item.id);
                                setEditingTickerText(item.text);
                              }}
                              className="px-3 py-2 rounded border border-[#D4D4D4] bg-white text-xs font-semibold text-[#0D0D0D] hover:bg-[#EFEFEF] cursor-pointer"
                            >
                              ترمیم
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTicker(item.id)}
                              aria-label="ٹکر لائن ہٹائیں"
                              className="p-2 rounded border border-[#FECACA] bg-white text-[#C8102E] hover:bg-[#FEF2F2] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Digital Card Requests & Approval (Admin Only) */}
          {activeTab === 'cards' && isAdmin && (
            <div className="space-y-5">
              {previewCard ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setPreviewCardId(null)}
                    className="text-xs font-semibold text-[#C8102E] hover:underline cursor-pointer"
                  >
                    ← تمام درخواستوں پر واپس جائیں
                  </button>
                  <DigitalIdCardView card={previewCard} showWhatsAppAction />
                </div>
              ) : cardRequests.length === 0 ? (
                <p className="text-sm text-[#4A4A4A] bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-8 text-center">
                  ابھی تک کوئی نمائندہ یا صحافی ڈیجیٹل کارڈ درخواست موصول نہیں ہوئی۔
                </p>
              ) : (
                <div className="space-y-3.5">
                  {cardRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={req.photoDataUrl}
                            alt={req.fullName}
                            className="w-16 h-20 object-cover rounded-md border border-[#0D0D0D] shrink-0"
                          />
                          <div className="space-y-1 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm sm:text-base font-bold text-[#0D0D0D]">
                                {req.fullName}
                              </span>
                              <span className="font-mono-num text-[#6B7280]" dir="ltr">
                                {req.cardNumber}
                              </span>
                              {req.status === 'pending' && (
                                <span className="px-2 py-0.5 rounded bg-[#F3F4F6] text-[#111111] border border-[#111111]/20 font-bold">
                                  زیرِ التواء
                                </span>
                              )}
                              {req.status === 'approved' && (
                                <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] font-bold">
                                  منظور شدہ
                                </span>
                              )}
                              {req.status === 'rejected' && (
                                <span className="px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] font-bold">
                                  مسترد شدہ
                                </span>
                              )}
                            </div>

                            <p className="text-[#333333]">
                              موبائل:{' '}
                              <span className="font-mono-num font-semibold" dir="ltr">
                                {req.mobile}
                              </span>{' '}
                              · ای میل:{' '}
                              <span className="font-mono-num" dir="ltr">
                                {req.email}
                              </span>
                            </p>

                            <p className="text-[#333333]">
                              شعبہ:{' '}
                              <strong>
                                {req.workRole === 'journalist'
                                  ? `صحافی (${req.organizationName || '—'} · ${req.experienceYears || '—'} سال تجربہ)`
                                  : `نمائندہ (${req.workDetails})`}
                              </strong>
                            </p>

                            <p className="text-[#4A4A4A]">
                              پتہ: {req.address}{' '}
                              {req.latitude !== undefined && req.longitude !== undefined && (
                                <a
                                  href={`https://maps.google.com/?q=${req.latitude},${req.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[#C8102E] font-semibold hover:underline mr-2"
                                >
                                  <span>لوکیشن دیکھیں</span>
                                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                </a>
                              )}
                            </p>

                            <p className="text-[#0D0D0D] font-semibold">
                              فیس پیکیج:{' '}
                              <span className="font-mono-num text-[#C8102E]" dir="ltr">
                                Rs. {req.feeAmount.toLocaleString()}
                              </span>{' '}
                              · درخواست وقت:{' '}
                              <span className="font-mono-num" dir="ltr">
                                {formatNumericDateTime(req.createdAt)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {req.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => onApproveCardRequest(req.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md bg-[#115E3B] text-white text-xs font-semibold hover:bg-[#0D4A2E] cursor-pointer"
                            >
                              <BadgeCheck className="w-4 h-4" aria-hidden="true" />
                              <span>منظور کریں (Approve)</span>
                            </button>
                          )}

                          {req.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => onRejectCardRequest(req.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md border border-[#FECACA] bg-white text-[#C8102E] text-xs font-semibold hover:bg-[#FEF2F2] cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" aria-hidden="true" />
                              <span>مسترد کریں (Reject)</span>
                            </button>
                          )}

                          {req.status === 'approved' && (
                            <button
                              type="button"
                              onClick={() => setPreviewCardId(req.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md bg-[#0D0D0D] text-white text-xs font-semibold hover:bg-[#262626] cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4" aria-hidden="true" />
                              <span>کارڈ / واٹس ایپ</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onDeleteCardRequest(req.id)}
                            aria-label="درخواست حذف کریں"
                            className="p-2 min-h-[40px] rounded-md border border-[#D4D4D4] bg-white text-[#4A4A4A] hover:text-[#C8102E] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Passwords (Admin Only) */}
          {activeTab === 'passwords' && isAdmin && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
              <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                یہاں سے آپ اسٹاف اور ایڈمن کے پاس ورڈ تبدیل کر سکتے ہیں۔ نئے پاس
                ورڈ آپ کے براؤزر میں محفوظ ہو جائیں گے۔ خالی خانہ چھوڑنے پر موجودہ
                پاس ورڈ برقرار رہے گا۔
              </p>

              {passwordNotice && (
                <div
                  role="status"
                  className={`text-xs sm:text-sm font-semibold px-4 py-3 rounded-lg border flex items-center gap-2 ${
                    passwordNotice.type === 'success'
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{passwordNotice.text}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0D0D0D]">
                  نیا اسٹاف پاس ورڈ (New Staff Password)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  placeholder="Enter new staff password (optional)"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm font-mono-num text-[#0D0D0D] focus:outline-none focus:border-[#C8102E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0D0D0D]">
                  نیا ایڈمن پاس ورڈ (New Admin Password)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Enter new admin password (optional)"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm font-mono-num text-[#0D0D0D] focus:outline-none focus:border-[#C8102E]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-md bg-[#C8102E] text-white text-xs sm:text-sm font-semibold hover:bg-[#A00D24] cursor-pointer"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>نئے پاس ورڈ محفوظ کریں</span>
              </button>
            </form>
          )}

          {/* TAB 5: Backup & Restore JSON (Admin Only) */}
          {activeTab === 'backup' && isAdmin && (
            <div className="space-y-5 max-w-xl">
              {backupNotice && (
                <div
                  role="status"
                  className={`text-xs sm:text-sm font-semibold px-4 py-3 rounded-lg border ${
                    backupNotice.type === 'success'
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                  }`}
                >
                  {backupNotice.text}
                </div>
              )}

              <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-bold text-[#0D0D0D]">
                  خبروں کا بیک اپ محفوظ کریں (Export JSON)
                </h3>
                <p className="text-xs text-[#4A4A4A] leading-relaxed">
                  تمام شائع شدہ خبروں اور بریکنگ نیوز ٹکر کا مکمل بیک اپ JSON فائل
                  کی صورت میں ڈاؤن لوڈ کریں۔
                </p>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md bg-[#0D0D0D] text-white text-xs sm:text-sm font-semibold hover:bg-[#262626] cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>JSON بیک اپ ڈاؤن لوڈ کریں</span>
                </button>
              </div>

              <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-bold text-[#0D0D0D]">
                  بیک اپ سے خبریں بحال کریں (Import JSON)
                </h3>
                <p className="text-xs text-[#4A4A4A] leading-relaxed">
                  پہلے سے محفوظ کردہ بیک اپ JSON فائل منتخب کر کے تمام خبریں اور
                  ٹکر دوبارہ لوڈ کریں۔
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md border border-[#0D0D0D] text-[#0D0D0D] bg-white hover:bg-[#EFEFEF] text-xs sm:text-sm font-semibold cursor-pointer">
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>JSON فائل منتخب کریں</span>
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-bold text-[#0D0D0D]">
                  ابتدائی نمونہ خبریں بحال کریں
                </h3>
                <p className="text-xs text-[#4A4A4A] leading-relaxed">
                  اگر آپ تمام خبریں اور بریکنگ ٹکر ابتدائی حالت میں لانا چاہتے ہیں
                  تو ری سیٹ کریں۔
                </p>
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md border border-[#FECACA] bg-white text-[#C8102E] hover:bg-[#FEF2F2] text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>ابتدائی ڈیٹا ری سیٹ کریں</span>
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[#991B1B]">
                      کیا آپ واقعی ابتدائی خبریں بحال کرنا چاہتے ہیں؟
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onResetSampleData();
                        setConfirmReset(false);
                        setBackupNotice({
                          type: 'success',
                          text: 'ابتدائی نمونہ خبریں اور ٹکر بحال کر دیے گئے ہیں۔',
                        });
                      }}
                      className="px-3.5 py-2 rounded bg-[#C8102E] text-white text-xs font-semibold cursor-pointer"
                    >
                      جی ہاں، ری سیٹ کریں
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3.5 py-2 rounded border border-[#D4D4D4] bg-white text-xs font-semibold cursor-pointer"
                    >
                      منسوخ
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
