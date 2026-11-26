import {
  CheckCircle2,
  ExternalLink,
  Film,
  History,
  MessageCircle,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { UserRole, VideoSubmission } from '../types/news';
import {
  buildHiddenWhatsAppUrl,
  formatNumericDateTime,
} from '../utils/storage';

interface WhatsAppVideoModalProps {
  isOpen: boolean;
  role: UserRole;
  submissions: VideoSubmission[];
  onClose: () => void;
  onSaveSubmission: (submission: VideoSubmission) => void;
  onDeleteSubmission: (id: string) => void;
}

export function WhatsAppVideoModal({
  isOpen,
  role,
  submissions,
  onClose,
  onSaveSubmission,
  onDeleteSubmission,
}: WhatsAppVideoModalProps) {
  const [title, setTitle] = useState('');
  const [senderName, setSenderName] = useState('');
  const [city, setCity] = useState('فیصل آباد');
  const [notes, setNotes] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSizeMb, setSelectedFileSizeMb] = useState('');
  const [sessionVideoPreviewUrl, setSessionVideoPreviewUrl] = useState('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [latestWaLink, setLatestWaLink] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSavedNotice(null);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (sessionVideoPreviewUrl) {
        URL.revokeObjectURL(sessionVideoPreviewUrl);
      }
    };
  }, [sessionVideoPreviewUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (sessionVideoPreviewUrl) {
      URL.revokeObjectURL(sessionVideoPreviewUrl);
    }
    setSelectedFileName(file.name);
    setSelectedFileSizeMb((file.size / (1024 * 1024)).toFixed(2));
    setSessionVideoPreviewUrl(URL.createObjectURL(file));
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const createWaMessage = (item: VideoSubmission) => {
    return [
      'اُردو پاکستان نیوز HD | Urdu Pakistan News HD',
      `عنوان: ${item.title}`,
      `بھیجنے والا: ${item.senderName}`,
      `شہر: ${item.city}`,
      item.fileName
        ? `منتخب ویڈیو فائل: ${item.fileName} (${item.fileSizeMb || '0'} MB)`
        : 'ویڈیو یا خبر کی تفصیل واٹس ایپ چیٹ میں بھیجی جا رہی ہے',
      item.notes ? `تفصیلات: ${item.notes}` : '',
      'براہ کرم واٹس ایپ چیٹ میں اپنی ویڈیو فائل اٹیچ کر کے ارسال کریں۔',
    ]
      .filter(Boolean)
      .join('\n');
  };

  const quickDirectWaHref = buildHiddenWhatsAppUrl(
    'السلام علیکم! اُردو پاکستان نیوز HD نیوز ڈیسک کو خبر / ویڈیو رپورٹ بھیجنا چاہتا ہوں۔'
  );

  const handleQuickDirectWhatsApp = () => {
    const quickRecord: VideoSubmission = {
      id: `vid-${Date.now()}`,
      title: title.trim() || 'براہِ راست واٹس ایپ پیغام / ویڈیو رپورٹ',
      senderName: senderName.trim() || 'رپورٹر / صارف',
      city: city.trim() || 'پاکستان',
      notes: notes.trim() || 'براہِ راست واٹس ایپ چیٹ کھولی گئی',
      fileName: selectedFileName || undefined,
      fileSizeMb: selectedFileSizeMb || undefined,
      createdAt: new Date().toISOString(),
    };
    onSaveSubmission(quickRecord);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !senderName.trim()) {
      setError('براہ کرم ویڈیو کا عنوان اور اپنا نام درج کریں۔');
      return;
    }

    const record: VideoSubmission = {
      id: `vid-${Date.now()}`,
      title: title.trim(),
      senderName: senderName.trim(),
      city: city.trim() || 'پاکستان',
      notes: notes.trim(),
      fileName: selectedFileName || undefined,
      fileSizeMb: selectedFileSizeMb || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveSubmission(record);
    const waHref = buildHiddenWhatsAppUrl(createWaMessage(record));
    setLatestWaLink(waHref);
    setSavedNotice(
      'رپورٹ ریکارڈ محفوظ ہو گیا ہے اور واٹس ایپ چیٹ کھول دی گئی ہے۔'
    );
    setError('');

    const tempAnchor = document.createElement('a');
    tempAnchor.href = waHref;
    tempAnchor.target = '_blank';
    tempAnchor.rel = 'noopener noreferrer';
    document.body.appendChild(tempAnchor);
    tempAnchor.click();
    document.body.removeChild(tempAnchor);

    setTitle('');
    setNotes('');
    setSelectedFileName('');
    setSelectedFileSizeMb('');
    if (sessionVideoPreviewUrl) {
      URL.revokeObjectURL(sessionVideoPreviewUrl);
      setSessionVideoPreviewUrl('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-video-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#111111] text-white border-b-2 border-[#B91C1C] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-[#B91C1C]" aria-hidden="true" />
            <h2 id="wa-video-modal-title" className="text-base sm:text-lg font-bold">
              Whatsapp ویڈیو و خبر ڈیسک
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
          {/* Direct 1-click Open WhatsApp Banner (Hidden number) */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#111111]">
                فوری واٹس ایپ رابطہ اور ویڈیو ارسال کریں
              </p>
              <p className="text-xs text-[#374151] leading-relaxed">
                بغیر فارم بھرے براہِ راست نیوز ڈیسک واٹس ایپ کھولیں یا نیچے ویڈیو
                رپورٹ کی تفصیل محفوظ کر کے ارسال کریں۔
              </p>
            </div>
            <a
              href={quickDirectWaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleQuickDirectWhatsApp}
              className="font-ui-sans inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md bg-[#16A34A] text-white text-xs sm:text-sm font-bold hover:bg-[#15803D] whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Open Whatsapp</span>
            </a>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Video File Picker */}
            <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#111111]">
                  ویڈیو فائل منتخب کریں (اختیاری)
                </span>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-md bg-[#B91C1C] text-white hover:bg-[#991B1B] text-xs font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>ویڈیو منتخب کریں</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFileName && (
                <div className="text-xs text-[#111111] bg-white border border-[#E5E5E5] rounded p-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold truncate max-w-[260px]" dir="ltr">
                    {selectedFileName}
                  </span>
                  <span className="font-mono-num text-[#4A4A4A]" dir="ltr">
                    {selectedFileSizeMb} MB
                  </span>
                </div>
              )}

              {sessionVideoPreviewUrl && (
                <video
                  src={sessionVideoPreviewUrl}
                  controls
                  className="w-full max-h-48 rounded-md bg-black"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#111111]">
                  ویڈیو / خبر کا عنوان *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: فیصل آباد بارش یا عوامی مسئلہ"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#111111]">
                  بھیجنے والے کا نام *
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="رپورٹر یا شہری کا نام"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#111111]">
                  شہر / علاقہ
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="فیصل آباد، لاہور..."
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#111111]">
                  مختصر نوٹ / تفصیلات
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="واقعہ کی مختصر تفصیل..."
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="text-xs font-semibold text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-md px-3 py-2.5"
              >
                {error}
              </div>
            )}

            {savedNotice && (
              <div
                role="status"
                className="text-xs sm:text-sm font-semibold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg px-4 py-3 space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{savedNotice}</span>
                </div>
                {latestWaLink && (
                  <a
                    href={latestWaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-md bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D]"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>واٹس ایپ چیٹ دوبارہ کھولیں</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 min-h-[44px] rounded-md border border-[#D4D4D4] bg-white text-xs sm:text-sm font-semibold text-[#333333] hover:bg-[#F7F7F7] cursor-pointer"
              >
                بند کریں
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-md bg-[#16A34A] text-white text-xs sm:text-sm font-bold hover:bg-[#15803D] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>محفوظ کریں اور Whatsapp کھولیں</span>
              </button>
            </div>
          </form>

          {/* Saved Submissions History */}
          <section className="border-t border-[#E5E5E5] pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111] inline-flex items-center gap-2">
                <History className="w-4 h-4 text-[#B91C1C]" aria-hidden="true" />
                <span>محفوظ شدہ ویڈیو ریکارڈ ({submissions.length})</span>
              </h3>
            </div>

            {submissions.length === 0 ? (
              <p className="text-xs text-[#6B7280] bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-4 text-center">
                ابھی تک کوئی ویڈیو رپورٹ محفوظ نہیں کی گئی۔
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {submissions.map((item) => {
                  const waHref = buildHiddenWhatsAppUrl(createWaMessage(item));
                  return (
                    <div
                      key={item.id}
                      className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#111111] truncate">
                          {item.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#4A4A4A]">
                          <span>{item.senderName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.city}</span>
                          {item.fileName && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span dir="ltr" className="truncate max-w-[160px]">
                                {item.fileName}
                              </span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num" dir="ltr">
                            {formatNumericDateTime(item.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-ui-sans inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Whatsapp</span>
                        </a>
                        {role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => onDeleteSubmission(item.id)}
                            aria-label="ریکارڈ حذف کریں"
                            className="p-1.5 rounded border border-[#FECACA] text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
