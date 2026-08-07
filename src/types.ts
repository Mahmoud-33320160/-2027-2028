export type UserRole = 'client' | 'vendor' | 'admin' | 'support';

export type Language = 'ar' | 'en';

export type EventType =
  | 'wedding'
  | 'engagement'
  | 'birthday'
  | 'conference'
  | 'cafe_restaurant'
  | 'graduation'
  | 'other';

export type Governorate = 'cairo' | 'giza' | 'qalyubia';

export type ServiceCategory =
  | 'hall'
  | 'photographer'
  | 'decor'
  | 'catering'
  | 'music'
  | 'makeup'
  | 'cafe_restaurant';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface Service {
  id: string;
  title: string;
  titleEn: string;
  category: ServiceCategory;
  governorate: Governorate;
  district: string;
  districtEn?: string;
  address: string;
  addressEn?: string;
  location: LocationCoordinates;
  price: number;
  capacity?: number;
  rating: number;
  reviewsCount: number;
  imageUrls: string[];
  description: string;
  descriptionEn: string;
  features: string[];
  featuresEn?: string[];
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  availableDates: string[]; // YYYY-MM-DD
  bookedDates: string[]; // YYYY-MM-DD
  depositPercentage: number; // e.g., 10%
  // Specific properties
  makeupPackages?: { name: string; nameEn: string; price: number; details: string; detailsEn: string }[];
  menuItems?: string[];
  musicStyles?: string[];
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  bookingId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string; // YYYY-MM-DD
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercentage: number;
  validUntil: string;
  active: boolean;
  description: string;
}

export type PaymentStatus = 'paid_deposit' | 'fully_paid' | 'refunded' | 'pending';

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'paid'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceNameEn: string;
  category: ServiceCategory;
  date: string; // YYYY-MM-DD
  clientName: string;
  clientPhone: string;
  nationalIdFrontUrl?: string;
  nationalIdBackUrl?: string;
  totalPrice: number;
  depositAmount: number; // 10%
  remainingAmount: number; // 90%
  remainingDueDate: string; // 10 days before event
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  eventType: EventType;
  guestCount: number;
  notes?: string;
  governorate: Governorate;
  createdAt: string;
  cancellationRefundAmount?: number; // 90% of total paid if cancelled
  clientEmail?: string;
  clientId?: string;
  musicPreference?: string;
  customPlaylistUrl?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  companionsCount: number;
  status: 'accepted' | 'declined' | 'pending';
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
  tableNumber?: string;
  clientEmail?: string;
  clientId?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  titleEn: string;
  dueDate: string;
  completed: boolean;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BudgetItem {
  id: string;
  name: string;
  nameEn: string;
  category: ServiceCategory | 'other';
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
}

export interface PlaylistItem {
  id: string;
  title: string;
  titleEn: string;
  artist: string;
  category: 'zaffa' | 'bellydance' | 'dj_set' | 'dabke' | 'romantic' | 'custom';
  duration: string;
  audioSampleUrl: string; // HTML5 playable preview URL or synth generator
  description: string;
  descriptionEn: string;
}

export interface MusicCustomRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  eventDate: string;
  playlistId?: string;
  songList: string[];
  specialInstructions: string;
  status: 'pending' | 'accepted' | 'in_progress';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  governorate?: Governorate;
  assignedServiceIds?: string[];
  nationalIdFrontUrl?: string;
  nationalIdBackUrl?: string;
  clientTargetBudget?: number;
  createdAt?: string;
}

export interface AppSettings {
  refundPercentage: number; // e.g. 90
  depositPercentage: number; // e.g. 10
  cancellationNoticeDays: number; // e.g. 10
  commissionPercentage?: number; // e.g. 2%
  ownerEmail: string;
}

export type VendorApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface VendorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  businessName: string;
  category: ServiceCategory;
  governorate: Governorate;
  district: string;
  address: string;
  description: string;
  experienceYears?: number;
  nationalIdNumber?: string;
  nationalIdFrontUrl?: string;
  nationalIdBackUrl?: string;
  portfolioUrl?: string;
  sampleImages?: string[];
  servicePhotos?: string[]; // صور الخدمة الشاملة بكافة التفاصيل
  verificationCallDate?: string; // تاريخ المكالمة التوثيقية مع المالك
  verificationCallTime?: string; // وقت المكالمة
  verificationCallStatus?: 'pending_schedule' | 'scheduled' | 'completed';
  verificationCallRoomUrl?: string; // رابط غرفة الفيديو التوثيقية
  verificationCallNotes?: string;
  status: VendorApplicationStatus;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}
