import {
  DEFAULT_PASSWORDS,
  INITIAL_ARTICLES,
  INITIAL_BREAKING_ITEMS,
} from '../data/initialData';
import {
  BreakingItem,
  DigitalCardRequest,
  NewsArticle,
  PortalPasswords,
  UserRole,
  VideoSubmission,
} from '../types/news';

const STORAGE_KEYS = {
  articles: 'urdu_pk_news_articles_v1',
  ticker: 'urdu_pk_news_ticker_v1',
  passwords: 'urdu_pk_news_passwords_v1',
  role: 'urdu_pk_news_role_v1',
  videoSubmissions: 'urdu_pk_news_video_submissions_v1',
  cardRequests: 'urdu_pk_news_card_requests_v1',
} as const;

// Internal WhatsApp destination (never displayed visibly in UI)
const INTERNAL_WA_NUMBER = '923197207128';

export function buildHiddenWhatsAppUrl(message: string): string {
  return `https://wa.me/${INTERNAL_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function loadArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.articles);
    if (!raw) return INITIAL_ARTICLES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_ARTICLES;
    return parsed;
  } catch {
    return INITIAL_ARTICLES;
  }
}

export function saveArticles(articles: NewsArticle[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.articles, JSON.stringify(articles));
  } catch (err) {
    console.error('Failed to persist articles in localStorage:', err);
  }
}

export function loadBreakingItems(): BreakingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ticker);
    if (!raw) return INITIAL_BREAKING_ITEMS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_BREAKING_ITEMS;
    return parsed;
  } catch {
    return INITIAL_BREAKING_ITEMS;
  }
}

export function saveBreakingItems(items: BreakingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ticker, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to persist breaking items in localStorage:', err);
  }
}

export function loadPasswords(): PortalPasswords {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.passwords);
    if (!raw) return DEFAULT_PASSWORDS;
    const parsed = JSON.parse(raw) as Partial<PortalPasswords>;
    return {
      staffPassword:
        typeof parsed.staffPassword === 'string' && parsed.staffPassword.trim().length > 0
          ? parsed.staffPassword
          : DEFAULT_PASSWORDS.staffPassword,
      adminPassword:
        typeof parsed.adminPassword === 'string' && parsed.adminPassword.trim().length > 0
          ? parsed.adminPassword
          : DEFAULT_PASSWORDS.adminPassword,
    };
  } catch {
    return DEFAULT_PASSWORDS;
  }
}

export function savePasswords(passwords: PortalPasswords): void {
  try {
    localStorage.setItem(STORAGE_KEYS.passwords, JSON.stringify(passwords));
  } catch (err) {
    console.error('Failed to persist passwords in localStorage:', err);
  }
}

export function loadStoredRole(): UserRole {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.role);
    if (raw === 'staff' || raw === 'admin') return raw;
    return 'visitor';
  } catch {
    return 'visitor';
  }
}

export function saveStoredRole(role: UserRole): void {
  try {
    if (role === 'visitor') {
      localStorage.removeItem(STORAGE_KEYS.role);
    } else {
      localStorage.setItem(STORAGE_KEYS.role, role);
    }
  } catch {
    // ignore storage errors
  }
}

export function loadVideoSubmissions(): VideoSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.videoSubmissions);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveVideoSubmissions(items: VideoSubmission[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.videoSubmissions, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to persist video submissions:', err);
  }
}

export function loadCardRequests(): DigitalCardRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cardRequests);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCardRequests(items: DigitalCardRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.cardRequests, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to persist card requests:', err);
  }
}

export function formatNumericDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '25-11-2026';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatNumericTime(dateInput: Date | string, includeSeconds = false): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '12:00';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  if (!includeSeconds) return `${hours}:${minutes}`;
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function formatNumericDateTime(dateInput: Date | string): string {
  return `${formatNumericDate(dateInput)} · ${formatNumericTime(dateInput)}`;
}

/**
 * Resize and compress an uploaded image file to a clean JPEG Data URL
 * so it stores reliably inside browser localStorage.
 */
export function compressImageFile(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تصویر پڑھنے میں مسئلہ پیش آیا'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('منتخب کردہ فائل درست تصویر نہیں ہے'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch {
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function renderDigitalIdCardCanvas(
  card: DigitalCardRequest
): Promise<HTMLCanvasElement> {
  const width = 1100;
  const height = 680;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  // Card white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Top Deep Black & Red Header Band
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, width, 140);
  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(0, 130, width, 12);

  // Bilingual Brand Title inside Header
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px "Noto Naskh Arabic", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('اُردو پاکستان نیوز  |  Urdu Pakistan News', 40, 62);

  // Red HD Box
  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(675, 28, 66, 42);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px "JetBrains Mono", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HD', 708, 58);

  ctx.fillStyle = '#E5E5E5';
  ctx.font = 'bold 17px "JetBrains Mono", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('OFFICIAL DIGITAL PRESS & REPRESENTATIVE CARD', 40, 102);

  // Pakistan Flag drawn on top right of header
  const fx = 930;
  const fy = 28;
  const fw = 126;
  const fh = 80;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(fx, fy, 32, fh);
  ctx.fillStyle = '#01411C';
  ctx.fillRect(fx + 32, fy, fw - 32, fh);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(fx, fy, fw, fh);
  // Crescent
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(fx + 78, fy + 40, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#01411C';
  ctx.beginPath();
  ctx.arc(fx + 84, fy + 36, 15, 0, Math.PI * 2);
  ctx.fill();
  // Star
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(fx + 92, fy + 29, 4.8, 0, Math.PI * 2);
  ctx.fill();

  // Photo Box on left
  const px = 44;
  const py = 180;
  const pw = 240;
  const ph = 295;
  ctx.fillStyle = '#F5F5F5';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3;
  ctx.strokeRect(px, py, pw, ph);

  if (card.photoDataUrl) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(px + 2, py + 2, pw - 4, ph - 4);
        ctx.clip();
        const ratio = Math.max(pw / img.width, ph / img.height);
        const dw = img.width * ratio;
        const dh = img.height * ratio;
        ctx.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
        ctx.restore();
        resolve();
      };
      img.onerror = () => resolve();
      img.src = card.photoDataUrl;
    });
  }

  // Verified Badge under Photo
  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(px, py + ph + 18, pw, 46);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 19px "JetBrains Mono", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(card.cardNumber, px + pw / 2, py + ph + 48);

  // Details Column
  ctx.textAlign = 'left';
  ctx.fillStyle = '#B91C1C';
  ctx.font = 'bold 21px "Noto Naskh Arabic", Arial, sans-serif';
  const roleLabel =
    card.workRole === 'journalist'
      ? 'VERIFIED JOURNALIST / صحافی'
      : 'AUTHORIZED REPRESENTATIVE / نمائندہ';
  ctx.fillText(roleLabel, 324, 210);

  ctx.fillStyle = '#111111';
  ctx.font = 'bold 36px "Noto Naskh Arabic", Arial, sans-serif';
  ctx.fillText(card.fullName, 324, 260);

  const lines: Array<[string, string]> = [
    ['Mobile:', card.mobile],
    ['Email:', card.email],
    ...(card.workRole === 'journalist'
      ? ([
          ['Organization:', card.organizationName || 'Urdu Pakistan News HD'],
          ['Experience:', `${card.experienceYears || '1'} Years`],
        ] as Array<[string, string]>)
      : ([['Work:', card.workDetails || 'News Representative']] as Array<[string, string]>)),
    ['Address:', card.address.slice(0, 56)],
    ['Package Fee:', `Rs. ${card.feeAmount.toLocaleString()}`],
    ['Issued:', formatNumericDate(card.reviewedAt || card.createdAt)],
  ];

  let yPos = 312;
  for (const [label, value] of lines) {
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 19px "JetBrains Mono", Arial, sans-serif';
    ctx.fillText(label, 324, yPos);

    ctx.fillStyle = '#111111';
    ctx.font = '600 20px "Noto Naskh Arabic", Arial, sans-serif';
    ctx.fillText(value, 490, yPos);
    yPos += 42;
  }

  // Bottom Footer Strip
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, height - 52, width, 52);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "JetBrains Mono", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'URDU PAKISTAN NEWS HD · APPROVED DIGITAL CREDENTIAL · VALID WITH PHOTO ID',
    width / 2,
    height - 20
  );

  return canvas;
}

/**
 * Generate a downloadable high-res PNG Digital ID Card
 */
export async function generateDigitalIdCardPng(card: DigitalCardRequest): Promise<string> {
  const canvas = await renderDigitalIdCardCanvas(card);
  return canvas.toDataURL('image/png');
}

/**
 * Generate a genuine single-page PDF Blob embedding the high-res rendered ID card JPEG
 * so Urdu Nastaliq/Naskh glyphs and passport photos render accurately across all devices.
 */
export async function generateDigitalIdCardPdfBlob(card: DigitalCardRequest): Promise<Blob> {
  const canvas = await renderDigitalIdCardCanvas(card);
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.94);
  const base64 = jpegDataUrl.split(',')[1];
  const binary = atob(base64);
  const imgBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    imgBytes[i] = binary.charCodeAt(i);
  }

  const pageWidth = canvas.width;
  const pageHeight = canvas.height;
  const encoder = new TextEncoder();

  const header = encoder.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const obj1 = encoder.encode('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const obj2 = encoder.encode('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  const obj3 = encoder.encode(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );
  const obj4Prefix = encoder.encode(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pageWidth} /Height ${pageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`
  );
  const obj4Suffix = encoder.encode('\nendstream\nendobj\n');
  const contentStreamStr = `q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q`;
  const obj5 = encoder.encode(
    `5 0 obj\n<< /Length ${contentStreamStr.length} >>\nstream\n${contentStreamStr}\nendstream\nendobj\n`
  );

  const chunks: Uint8Array[] = [
    header,
    obj1,
    obj2,
    obj3,
    obj4Prefix,
    imgBytes,
    obj4Suffix,
    obj5,
  ];

  // Compute byte offsets for xref
  const offsets: number[] = [];
  let cursor = header.length;
  offsets.push(cursor); // obj 1
  cursor += obj1.length;
  offsets.push(cursor); // obj 2
  cursor += obj2.length;
  offsets.push(cursor); // obj 3
  cursor += obj3.length;
  offsets.push(cursor); // obj 4
  cursor += obj4Prefix.length + imgBytes.length + obj4Suffix.length;
  offsets.push(cursor); // obj 5
  cursor += obj5.length;

  const xrefStart = cursor;
  const xrefLines = [
    'xref',
    '0 6',
    '0000000000 65535 f ',
    ...offsets.map((off) => `${String(off).padStart(10, '0')} 00000 n `),
    'trailer',
    '<< /Size 6 /Root 1 0 R >>',
    'startxref',
    String(xrefStart),
    '%%EOF',
  ].join('\n');

  const xrefBytes = encoder.encode(xrefLines);
  chunks.push(xrefBytes);

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const merged = new Uint8Array(totalLength);
  let pos = 0;
  for (const chunk of chunks) {
    merged.set(chunk, pos);
    pos += chunk.length;
  }

  return new Blob([merged], { type: 'application/pdf' });
}
