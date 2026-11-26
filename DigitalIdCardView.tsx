import {
  Download,
  FileText,
  MessageCircle,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { DigitalCardRequest } from '../types/news';
import {
  buildHiddenWhatsAppUrl,
  formatNumericDate,
  generateDigitalIdCardPdfBlob,
  generateDigitalIdCardPng,
} from '../utils/storage';
import { BrandLogo } from './BrandLogo';
import { WavingPakistanFlag } from './WavingPakistanFlag';

interface DigitalIdCardViewProps {
  card: DigitalCardRequest;
  showWhatsAppAction?: boolean;
}

export function DigitalIdCardView({
  card,
  showWhatsAppAction = true,
}: DigitalIdCardViewProps) {
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const safeSlug = card.fullName.trim().replace(/\s+/g, '-') || 'card';

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const pdfBlob = await generateDigitalIdCardPdfBlob(card);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${card.cardNumber}-${safeSlug}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    setIsDownloadingPng(true);
    try {
      const dataUrl = await generateDigitalIdCardPng(card);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${card.cardNumber}-${safeSlug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const approvedWhatsAppMessage = [
    'اُردو پاکستان نیوز HD | Urdu Pakistan News HD — منظور شدہ ڈیجیٹل کارڈ',
    `کارڈ نمبر: ${card.cardNumber}`,
    `نام: ${card.fullName}`,
    `موبائل: ${card.mobile}`,
    `ای میل: ${card.email}`,
    `عہدہ / کام: ${
      card.workRole === 'journalist' ? 'صحافی (Journalist)' : 'نمائندہ (Representative)'
    }`,
    card.workRole === 'journalist'
      ? `ادارے کا نام: ${card.organizationName || '—'}\nتجربہ: ${card.experienceYears || '—'} سال`
      : `کام کی تفصیل: ${card.workDetails || '—'}`,
    `پتہ: ${card.address}`,
    card.latitude !== undefined && card.longitude !== undefined
      ? `لوکیشن: https://maps.google.com/?q=${card.latitude},${card.longitude}`
      : '',
    `منتخب فیس پیکیج: Rs. ${card.feeAmount.toLocaleString()} (${card.feeLabel})`,
    `تاریخِ منظوری: ${formatNumericDate(card.reviewedAt || card.createdAt)}`,
  ]
    .filter(Boolean)
    .join('\n');

  const waHref = buildHiddenWhatsAppUrl(approvedWhatsAppMessage);

  return (
    <div className="space-y-4">
      {/* Printable Card Canvas */}
      <div
        id="printable-digital-id-card"
        className="bg-white border-2 border-[#111111] rounded-xl overflow-hidden shadow-lg max-w-xl mx-auto"
      >
        {/* Top Black & Red Card Header */}
        <div className="bg-[#111111] text-white px-4 sm:px-5 py-3.5 border-b-4 border-[#B91C1C] flex items-center justify-between gap-3">
          <BrandLogo variant="dark" compact />
          <WavingPakistanFlag size="sm" glowing />
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Passport Photo + Card Number */}
          <div className="sm:col-span-4 flex flex-col items-center gap-2">
            <div className="w-32 h-36 sm:w-full sm:h-40 rounded-lg border-2 border-[#111111] overflow-hidden bg-[#F5F5F5]">
              {card.photoDataUrl ? (
                <img
                  src={card.photoDataUrl}
                  alt={card.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#6B7280]">
                  تصویر
                </div>
              )}
            </div>
            <span
              className="w-full text-center py-1.5 px-2 rounded bg-[#B91C1C] text-white text-xs font-mono-num font-bold"
              dir="ltr"
            >
              {card.cardNumber}
            </span>
          </div>

          {/* Credentials */}
          <div className="sm:col-span-8 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-[#B91C1C] font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                {card.workRole === 'journalist'
                  ? 'تصدیق شدہ صحافی (Verified Journalist)'
                  : 'مجاز نمائندہ (Authorized Representative)'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#111111]">
              {card.fullName}
            </h3>

            <dl className="space-y-1 text-xs text-[#333333] border-t border-[#E5E5E5] pt-2">
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">موبائل:</dt>
                <dd className="font-mono-num font-semibold" dir="ltr">
                  {card.mobile}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">ای میل:</dt>
                <dd className="font-mono-num truncate" dir="ltr">
                  {card.email}
                </dd>
              </div>
              {card.workRole === 'journalist' ? (
                <>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#6B7280]">ادارے کا نام:</dt>
                    <dd className="font-semibold text-[#111111]">
                      {card.organizationName || 'اُردو پاکستان نیوز HD'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#6B7280]">تجربہ:</dt>
                    <dd className="font-semibold text-[#111111]">
                      {card.experienceYears || '1'} سال
                    </dd>
                  </div>
                </>
              ) : (
                <div className="flex justify-between gap-2">
                  <dt className="text-[#6B7280]">کام / شعبہ:</dt>
                  <dd className="font-semibold text-[#111111]">
                    {card.workDetails || 'نمائندہ'}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">پتہ:</dt>
                <dd className="text-left line-clamp-1">{card.address}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">فیس پیکیج:</dt>
                <dd className="font-mono-num font-bold text-[#B91C1C]" dir="ltr">
                  Rs. {card.feeAmount.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">اجراء کی تاریخ:</dt>
                <dd className="font-mono-num" dir="ltr">
                  {formatNumericDate(card.reviewedAt || card.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Footer Strip */}
        <div
          className="bg-[#111111] text-white px-4 py-2 text-[10px] sm:text-[11px] font-mono-num font-semibold text-center tracking-wide"
          dir="ltr"
        >
          URDU PAKISTAN NEWS HD · APPROVED DIGITAL ID CREDENTIAL
        </div>
      </div>

      {/* Action Buttons: PDF Download, PNG Download, Print, WhatsApp */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md bg-[#B91C1C] text-white text-xs sm:text-sm font-bold hover:bg-[#991B1B] cursor-pointer"
        >
          <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{isDownloadingPdf ? 'PDF بن رہی ہے...' : 'PDF کارڈ ڈاؤن لوڈ کریں'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={isDownloadingPng}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md bg-[#111111] text-white text-xs sm:text-sm font-semibold hover:bg-[#2A2A2A] cursor-pointer"
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{isDownloadingPng ? 'تیار ہو رہا ہے...' : 'PNG تصویر ڈاؤن لوڈ'}</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md border border-[#D4D4D4] bg-white text-[#111111] text-xs sm:text-sm font-semibold hover:bg-[#F7F7F7] cursor-pointer"
        >
          <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>پرنٹ کریں</span>
        </button>

        {showWhatsAppAction && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md bg-[#16A34A] text-white text-xs sm:text-sm font-semibold hover:bg-[#15803D]"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Whatsapp</span>
          </a>
        )}
      </div>
    </div>
  );
}
