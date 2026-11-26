import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Upload,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { CardWorkRole, DigitalCardRequest } from '../types/news';
import { compressImageFile, formatNumericDateTime } from '../utils/storage';
import { BrandLogo } from './BrandLogo';
import { DigitalIdCardView } from './DigitalIdCardView';
import { WavingPakistanFlag } from './WavingPakistanFlag';

const FEE_TIERS = [
  {
    amount: 2000,
    label: 'بنیادی ڈیجیٹل پریس / نمائندہ کارڈ',
    description: 'Rs. 2,000 — ابتدائی سالانہ رجسٹریشن',
  },
  {
    amount: 3500,
    label: 'اسٹینڈرڈ تصدیق شدہ پریس پیکیج',
    description: 'Rs. 3,500 — ڈیجیٹل کارڈ و پریس ویریفکیشن',
  },
  {
    amount: 5000,
    label: 'پریمیم بیورو چیف / خصوصی پیکیج',
    description: 'Rs. 5,000 — ترجیحی منظوری و میڈیا کیٹ',
  },
];

interface DigitalCardModalProps {
  isOpen: boolean;
  cardRequests: DigitalCardRequest[];
  onClose: () => void;
  onSubmitRequest: (request: DigitalCardRequest) => void;
}

export function DigitalCardModal({
  isOpen,
  cardRequests,
  onClose,
  onSubmitRequest,
}: DigitalCardModalProps) {
  const [viewMode, setViewMode] = useState<'apply' | 'status'>('apply');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [workRole, setWorkRole] = useState<CardWorkRole>('journalist');
  const [workDetails, setWorkDetails] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [selectedFeeAmount, setSelectedFeeAmount] = useState<number>(2000);
  const [customFeeInput, setCustomFeeInput] = useState<string>('2000');

  // Camera selfie capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

  // Form feedback & selected approved card viewer
  const [formError, setFormError] = useState('');
  const [submittedSuccessId, setSubmittedSuccessId] = useState<string | null>(null);
  const [activeCardToView, setActiveCardToView] =
    useState<DigitalCardRequest | null>(null);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setActiveCardToView(null);
      return;
    }
    setFormError('');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopCameraStream();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError('');
    try {
      const compressed = await compressImageFile(file, 600, 0.85);
      setPhotoDataUrl(compressed);
      stopCameraStream();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'تصویر لوڈ کرنے میں مسئلہ پیش آیا۔'
      );
    } finally {
      e.target.value = '';
    }
  };

  const handleStartCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'اس براؤزر میں کیمرہ دستیاب نہیں ہے۔ براہ کرم تصویر اپ لوڈ کریں۔'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch {
      setCameraError(
        'کیمرہ کی اجازت نہیں ملی یا کیمرہ دستیاب نہیں۔ نیچے سے پاسپورٹ سائز تصویر اپ لوڈ کریں۔'
      );
    }
  };

  const handleCaptureSelfie = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    canvas.width = 480;
    canvas.height = 560;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sx = ((video.videoWidth || size) - size) / 2;
    const sy = ((video.videoHeight || size) - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 480, 560);
    setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.88));
    stopCameraStream();
  };

  const handleGetCurrentLocation = () => {
    setLocationNotice('');
    if (!navigator.geolocation) {
      setLocationNotice('اس ڈیوائس میں جیو لوکیشن دستیاب نہیں ہے۔');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setLocationNotice(`موجودہ لوکیشن محفوظ ہو گئی (${lat}, ${lng})`);
        if (!address.trim()) {
          setAddress(`GPS Coordinates: ${lat}, ${lng}`);
        }
        setIsLocating(false);
      },
      () => {
        setLocationNotice(
          'لوکیشن حاصل نہیں ہو سکی۔ براہ کرم مکمل پتہ خود تحریر کریں۔'
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !mobile.trim() || !email.trim() || !address.trim()) {
      setFormError('براہ کرم نام، موبائل نمبر، ای میل اور مکمل پتہ لازمی درج کریں۔');
      return;
    }

    if (!photoDataUrl) {
      setFormError('براہ کرم پاسپورٹ سائز تصویر اپ لوڈ کریں یا لائیو سیلفی کھینچیں۔');
      return;
    }

    if (workRole === 'journalist' && (!organizationName.trim() || !experienceYears.trim())) {
      setFormError('صحافی ہونے کی صورت میں ادارے کا نام اور کتنے سالہ تجربہ درج کریں۔');
      return;
    }

    const numericFee = Math.max(2000, Number(customFeeInput) || selectedFeeAmount || 2000);
    const matchedTier = FEE_TIERS.find((t) => t.amount === numericFee);

    const request: DigitalCardRequest = {
      id: `req-${Date.now()}`,
      cardNumber: `UPN-${new Date().getFullYear()}-${String(
        Math.floor(1000 + Math.random() * 9000)
      )}`,
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      photoDataUrl,
      address: address.trim(),
      latitude,
      longitude,
      workRole,
      workDetails:
        workRole === 'journalist'
          ? workDetails.trim() || 'فیلڈ صحافی / رپورٹر'
          : workDetails.trim() || 'نمائندہ / کاروباری شراکت دار',
      organizationName:
        workRole === 'journalist' ? organizationName.trim() : undefined,
      experienceYears:
        workRole === 'journalist' ? experienceYears.trim() : undefined,
      feeAmount: numericFee,
      feeLabel: matchedTier ? matchedTier.label : 'کسٹم ڈیجیٹل کارڈ پیکیج',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onSubmitRequest(request);
    setSubmittedSuccessId(request.cardNumber);

    setFullName('');
    setMobile('');
    setEmail('');
    setPhotoDataUrl('');
    setAddress('');
    setLatitude(undefined);
    setLongitude(undefined);
    setWorkDetails('');
    setOrganizationName('');
    setExperienceYears('');
    setLocationNotice('');
    setViewMode('status');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="digital-card-modal-title"
      onClick={() => {
        stopCameraStream();
        onClose();
      }}
    >
      <div
        className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#111111] text-white border-b-2 border-[#B91C1C] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-[#B91C1C]" aria-hidden="true" />
            <h2 id="digital-card-modal-title" className="text-base sm:text-lg font-bold">
              نمائندہ / صحافی ڈیجیٹل کارڈ (Digital Card)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            aria-label="بند کریں"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md text-white/90 hover:bg-white/15 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="bg-[#F8F8F8] border-b border-[#E5E5E5] px-4 sm:px-6 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setViewMode('apply');
              setActiveCardToView(null);
            }}
            className={`px-4 py-2 min-h-[40px] rounded-md text-xs sm:text-sm font-bold cursor-pointer ${
              viewMode === 'apply'
                ? 'bg-[#B91C1C] text-white'
                : 'bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#EFEFEF]'
            }`}
          >
            نئی کارڈ درخواست دیں
          </button>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              setViewMode('status');
            }}
            className={`px-4 py-2 min-h-[40px] rounded-md text-xs sm:text-sm font-bold cursor-pointer ${
              viewMode === 'status'
                ? 'bg-[#B91C1C] text-white'
                : 'bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#EFEFEF]'
            }`}
          >
            درخواستوں کی صورتحال ({cardRequests.length})
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {viewMode === 'apply' ? (
            <>
              {/* Complete Polished Demo Card Visual Preview */}
              <section
                aria-label="ڈیمو کارڈ"
                className="bg-[#F8F8F8] border border-[#D4D4D4] rounded-xl p-4 sm:p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#B91C1C]">
                    مکمل نمونہ ڈیجیٹل کارڈ (Demo Card Preview)
                  </span>
                  <span className="text-[11px] font-semibold text-[#4A4A4A]">
                    ایڈمن منظوری کے بعد آپ کا PDF کارڈ اس طرز پر جاری ہوگا
                  </span>
                </div>

                <div className="bg-white border-2 border-[#111111] rounded-xl overflow-hidden shadow-md max-w-xl mx-auto">
                  <div className="bg-[#111111] text-white px-4 py-3 border-b-4 border-[#B91C1C] flex items-center justify-between gap-2">
                    <BrandLogo variant="dark" compact />
                    <WavingPakistanFlag size="sm" glowing />
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-4 flex flex-col items-center gap-2">
                      <div className="w-28 h-32 sm:w-full sm:h-36 rounded-lg border-2 border-[#111111] bg-[#F3F4F6] flex flex-col items-center justify-center text-[#6B7280] overflow-hidden">
                        {photoDataUrl ? (
                          <img
                            src={photoDataUrl}
                            alt="آپ کی تصویر"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <User className="w-9 h-9 text-[#9CA3AF]" aria-hidden="true" />
                            <span className="text-[10px] font-ui-sans font-bold mt-1">
                              PASSPORT PHOTO
                            </span>
                          </>
                        )}
                      </div>
                      <span
                        className="w-full text-center py-1.5 rounded bg-[#B91C1C] text-white text-[11px] font-mono-num font-bold"
                        dir="ltr"
                      >
                        UPN-2026-DEMO
                      </span>
                    </div>

                    <div className="sm:col-span-8 space-y-1.5 text-xs">
                      <div className="inline-flex items-center gap-1.5 text-[#B91C1C] font-bold">
                        <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>
                          {workRole === 'journalist'
                            ? 'تصدیق شدہ صحافی (Verified Journalist)'
                            : 'مجاز نمائندہ (Authorized Representative)'}
                        </span>
                      </div>

                      <p className="text-base sm:text-lg font-bold text-[#111111] leading-snug">
                        {fullName.trim() || 'محمد احمد خان'}
                      </p>

                      <dl className="space-y-1 text-[11px] text-[#333333] border-t border-[#E5E5E5] pt-2">
                        <div className="flex justify-between gap-2">
                          <dt className="text-[#6B7280]">موبائل:</dt>
                          <dd className="font-mono-num font-semibold" dir="ltr">
                            {mobile.trim() || '0300-0000000'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-[#6B7280]">ای میل:</dt>
                          <dd className="font-mono-num truncate" dir="ltr">
                            {email.trim() || 'press@urdupakistannews.pk'}
                          </dd>
                        </div>
                        {workRole === 'journalist' ? (
                          <>
                            <div className="flex justify-between gap-2">
                              <dt className="text-[#6B7280]">ادارے کا نام:</dt>
                              <dd className="font-semibold text-[#111111]">
                                {organizationName.trim() || 'اُردو پاکستان نیوز HD'}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-[#6B7280]">تجربہ:</dt>
                              <dd className="font-semibold text-[#111111]">
                                {experienceYears.trim() || '5 سال'}
                              </dd>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between gap-2">
                            <dt className="text-[#6B7280]">شعبہ:</dt>
                            <dd className="font-semibold text-[#111111]">
                              {workDetails.trim() || 'علاقائی نمائندہ'}
                            </dd>
                          </div>
                        )}
                        <div className="flex justify-between gap-2">
                          <dt className="text-[#6B7280]">پتہ:</dt>
                          <dd className="text-left line-clamp-1">
                            {address.trim() || 'فیصل آباد، پنجاب، پاکستان'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-[#6B7280]">فیس پیکیج:</dt>
                          <dd className="font-mono-num font-bold text-[#B91C1C]" dir="ltr">
                            Rs. {(Number(customFeeInput) || 2000).toLocaleString()}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div
                    className="bg-[#111111] text-white px-4 py-1.5 text-[10px] font-mono-num font-semibold text-center tracking-wide"
                    dir="ltr"
                  >
                    URDU PAKISTAN NEWS HD · SAMPLE DIGITAL CREDENTIAL
                  </div>
                </div>
              </section>

              <form onSubmit={handleSubmit} className="space-y-5">
                {formError && (
                  <div
                    role="alert"
                    className="text-xs sm:text-sm font-semibold text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-4 py-3"
                  >
                    {formError}
                  </div>
                )}

                {/* Basic Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#111111]">
                      مکمل نام (Full Name) *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="اپنا مکمل نام لکھیں"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#111111]">
                      موبائل نمبر (Mobile) *
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm font-mono-num text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#111111]">
                      ای میل ایڈریس (Email) *
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm font-mono-num text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                      required
                    />
                  </div>
                </div>

                {/* Passport Photo Upload OR Live Camera Selfie */}
                <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#111111]">
                      پاسپورٹ سائز تصویر یا لائیو سیلفی *
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md bg-[#111111] text-white hover:bg-[#262626] text-xs font-semibold cursor-pointer">
                        <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>تصویر اپ لوڈ کریں</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>

                      {!isCameraActive ? (
                        <button
                          type="button"
                          onClick={handleStartCamera}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md border border-[#B91C1C] text-[#B91C1C] bg-white hover:bg-[#B91C1C]/10 text-xs font-semibold cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>کیمرہ سے سیلفی لیں</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopCameraStream}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md border border-[#D4D4D4] bg-white text-xs font-semibold cursor-pointer"
                        >
                          کیمرہ بند کریں
                        </button>
                      )}
                    </div>
                  </div>

                  {cameraError && (
                    <p className="text-xs text-[#B91C1C] font-semibold">
                      {cameraError}
                    </p>
                  )}

                  {isCameraActive && (
                    <div className="space-y-2.5 flex flex-col items-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-56 h-56 object-cover rounded-lg border-2 border-[#111111] bg-black"
                      />
                      <button
                        type="button"
                        onClick={handleCaptureSelfie}
                        className="px-4 py-2 min-h-[40px] rounded-md bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] cursor-pointer"
                      >
                        تصویر کھینچیں (Capture Selfie)
                      </button>
                    </div>
                  )}

                  {photoDataUrl && !isCameraActive && (
                    <div className="flex items-center gap-3">
                      <img
                        src={photoDataUrl}
                        alt="پاسپورٹ تصویر"
                        className="w-24 h-28 object-cover rounded-md border border-[#111111]"
                      />
                      <div className="text-xs text-[#4A4A4A] space-y-1">
                        <p className="font-semibold text-[#115E3B]">
                          تصویر کامیابی سے شامل کر لی گئی۔
                        </p>
                        <button
                          type="button"
                          onClick={() => setPhotoDataUrl('')}
                          className="text-[#B91C1C] hover:underline font-semibold cursor-pointer"
                        >
                          تصویر تبدیل کریں
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address + Geolocation */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-[#111111]">
                      مکمل پتہ (Complete Address) *
                    </label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md border border-[#111111] bg-white text-[#111111] hover:bg-[#F7F7F7] text-xs font-semibold cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
                      <span>
                        {isLocating
                          ? 'لوکیشن حاصل کی جا رہی ہے...'
                          : 'موجودہ لوکیشن حاصل کریں (Get Current Location)'}
                      </span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مکان/دکان نمبر، گلی، محلہ، شہر اور ضلع..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                    required
                  />

                  {(locationNotice || (latitude !== undefined && longitude !== undefined)) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-[#F8F8F8] border border-[#E5E5E5] rounded-md px-3 py-2">
                      <span className="text-[#4A4A4A]">{locationNotice}</span>
                      {latitude !== undefined && longitude !== undefined && (
                        <a
                          href={`https://maps.google.com/?q=${latitude},${longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#B91C1C] font-semibold hover:underline"
                        >
                          <span>نقشہ دیکھیں</span>
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Work / Role & Conditional Journalist Fields */}
                <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-4 space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#111111]">
                      شعبہ / کام کی نوعیت
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWorkRole('journalist')}
                        className={`py-2.5 px-3 min-h-[44px] rounded-md text-xs sm:text-sm font-semibold border cursor-pointer ${
                          workRole === 'journalist'
                            ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                            : 'bg-white text-[#111111] border-[#D4D4D4]'
                        }`}
                      >
                        صحافی / رپورٹر (Journalist)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkRole('representative')}
                        className={`py-2.5 px-3 min-h-[44px] rounded-md text-xs sm:text-sm font-semibold border cursor-pointer ${
                          workRole === 'representative'
                            ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                            : 'bg-white text-[#111111] border-[#D4D4D4]'
                        }`}
                      >
                        نمائندہ / کاروبار (Representative / Business)
                      </button>
                    </div>
                  </div>

                  {workRole === 'journalist' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#111111]">
                          ادارے کا نام (Organization Name) *
                        </label>
                        <input
                          type="text"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          placeholder="مثلاً: اُردو پاکستان نیوز یا اخبار/چینل"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#111111]">
                          کتنے سالہ تجربہ (Years of Experience) *
                        </label>
                        <input
                          type="text"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="مثلاً: 5 سال"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#111111]">
                      کام یا کاروبار کی مزید تفصیل
                    </label>
                    <input
                      type="text"
                      value={workDetails}
                      onChange={(e) => setWorkDetails(e.target.value)}
                      placeholder="اپنے فیلڈ، علاقے یا کاروبار کا مختصر تعارف..."
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm text-[#111111] focus:outline-none focus:border-[#B91C1C]"
                    />
                  </div>
                </div>

                {/* Fee Selection starting from Rs. 2,000 */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-[#111111]">
                    کارڈ فیس کا انتخاب (کم از کم Rs. 2,000 سے شروع)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {FEE_TIERS.map((tier) => {
                      const isSelected = Number(customFeeInput) === tier.amount;
                      return (
                        <button
                          key={tier.amount}
                          type="button"
                          onClick={() => {
                            setSelectedFeeAmount(tier.amount);
                            setCustomFeeInput(String(tier.amount));
                          }}
                          className={`text-right p-3 rounded-lg border transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-[#B91C1C] bg-[#FEF2F2]'
                              : 'border-[#E5E5E5] bg-white hover:border-[#111111]'
                          }`}
                        >
                          <div className="text-sm font-bold text-[#B91C1C] font-mono-num" dir="ltr">
                            Rs. {tier.amount.toLocaleString()}
                          </div>
                          <div className="text-xs font-bold text-[#111111] mt-1">
                            {tier.label}
                          </div>
                          <div className="text-[11px] text-[#4A4A4A] mt-0.5">
                            {tier.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="text-xs font-semibold text-[#4A4A4A]">
                      یا منتخب رقم (Rs. 2,000 یا زائد):
                    </label>
                    <input
                      type="number"
                      min={2000}
                      step={500}
                      dir="ltr"
                      value={customFeeInput}
                      onChange={(e) => setCustomFeeInput(e.target.value)}
                      className="w-36 min-h-[40px] px-3 py-1.5 rounded-md border border-[#D4D4D4] text-sm font-mono-num text-[#111111]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5E5E5]">
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      onClose();
                    }}
                    className="px-4 py-2.5 min-h-[44px] rounded-md border border-[#D4D4D4] bg-white text-xs sm:text-sm font-semibold text-[#333333] hover:bg-[#F7F7F7] cursor-pointer"
                  >
                    منسوخ کریں
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 min-h-[44px] rounded-md bg-[#B91C1C] text-white text-xs sm:text-sm font-bold hover:bg-[#991B1B] cursor-pointer"
                  >
                    درخواست جمع کروائیں
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              {submittedSuccessId && (
                <div
                  role="status"
                  className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] rounded-lg px-4 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    آپ کی درخواست ({submittedSuccessId}) موصول ہو گئی ہے اور ایڈمن کی
                    منظوری کے لیے زیرِ التواء ہے۔
                  </span>
                </div>
              )}

              {activeCardToView ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setActiveCardToView(null)}
                    className="text-xs font-semibold text-[#B91C1C] hover:underline cursor-pointer"
                  >
                    ← تمام درخواستوں کی فہرست پر واپس جائیں
                  </button>
                  <DigitalIdCardView card={activeCardToView} />
                </div>
              ) : cardRequests.length === 0 ? (
                <p className="text-sm text-[#4A4A4A] text-center py-8 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg">
                  ابھی تک کوئی ڈیجیٹل کارڈ درخواست جمع نہیں کرائی گئی۔
                </p>
              ) : (
                <div className="space-y-3">
                  {cardRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={req.photoDataUrl}
                          alt={req.fullName}
                          className="w-12 h-14 object-cover rounded border border-[#D4D4D4] shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[#111111]">
                              {req.fullName}
                            </span>
                            <span className="text-[11px] font-mono-num text-[#6B7280]" dir="ltr">
                              {req.cardNumber}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#4A4A4A]">
                            <span>
                              {req.workRole === 'journalist' ? 'صحافی' : 'نمائندہ'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num" dir="ltr">
                              Rs. {req.feeAmount.toLocaleString()}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num" dir="ltr">
                              {formatNumericDateTime(req.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] bg-[#F3F4F6] border border-[#111111]/20 px-3 py-1.5 rounded-md">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>زیرِ التواء (Pending Approval)</span>
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#991B1B] bg-[#FEE2E2] px-3 py-1.5 rounded-md">
                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>مسترد شدہ</span>
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => setActiveCardToView(req)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md bg-[#115E3B] text-white text-xs font-semibold hover:bg-[#0D4A2E] cursor-pointer"
                          >
                            <BadgeCheck className="w-4 h-4" aria-hidden="true" />
                            <span>PDF کارڈ دیکھیں / ڈاؤن لوڈ</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
