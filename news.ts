export type NewsCategory =
  | 'تازہ ترین'
  | 'اسلام آباد'
  | 'کراچی'
  | 'لاہور'
  | 'فیصل آباد'
  | 'ملتان'
  | 'پنجاب'
  | 'پاکستان'
  | 'سیاست'
  | 'معیشت'
  | 'سوشل میڈیا / ویڈیوز';

export type ArticleCategory = Exclude<NewsCategory, 'تازہ ترین'>;

export type UserRole = 'visitor' | 'staff' | 'admin';

export type MediaType = 'article' | 'video' | 'social';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  city: string;
  author: string;
  imageUrl: string;
  mediaType?: MediaType;
  videoUrl?: string;
  isLead?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BreakingItem {
  id: string;
  text: string;
  createdAt: string;
}

export interface PortalPasswords {
  staffPassword: string;
  adminPassword: string;
}

export interface PortalBackupPayload {
  portal: string;
  exportedAt: string;
  articles: NewsArticle[];
  breakingItems: BreakingItem[];
}

export interface VideoSubmission {
  id: string;
  title: string;
  senderName: string;
  city: string;
  notes: string;
  fileName?: string;
  fileSizeMb?: string;
  createdAt: string;
}

export type CardWorkRole = 'journalist' | 'representative';

export type CardRequestStatus = 'pending' | 'approved' | 'rejected';

export interface DigitalCardRequest {
  id: string;
  cardNumber: string;
  fullName: string;
  mobile: string;
  email: string;
  photoDataUrl: string;
  address: string;
  latitude?: number;
  longitude?: number;
  workRole: CardWorkRole;
  workDetails: string;
  organizationName?: string;
  experienceYears?: string;
  feeAmount: number;
  feeLabel: string;
  status: CardRequestStatus;
  createdAt: string;
  reviewedAt?: string;
}
