import {
  Service,
  Booking,
  Guest,
  TaskItem,
  BudgetItem,
  PlaylistItem,
  MusicCustomRequest,
  PromoCode,
  Language,
  UserRole,
  UserProfile,
  AppSettings,
  VendorApplication,
  VendorApplicationStatus,
  ServiceReview,
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_BOOKINGS,
  INITIAL_GUESTS,
  INITIAL_TASKS,
  INITIAL_BUDGET,
  PLAYLISTS,
  INITIAL_REVIEWS,
} from '../data/mockData';

const KEYS = {
  SERVICES: 'munasabati_services',
  BOOKINGS: 'munasabati_bookings',
  GUESTS: 'munasabati_guests',
  TASKS: 'munasabati_tasks',
  BUDGET: 'munasabati_budget',
  PLAYLISTS: 'munasabati_playlists',
  MUSIC_REQUESTS: 'munasabati_music_requests',
  REVIEWS: 'munasabati_reviews',
  ROLE: 'munasabati_current_role',
  LANG: 'munasabati_current_lang',
};

// Safe JSON Parse helper
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const StorageManager = {
  // Services
  getServices(): Service[] {
    return getItem<Service[]>(KEYS.SERVICES, INITIAL_SERVICES);
  },
  saveServices(services: Service[]): void {
    setItem(KEYS.SERVICES, services);
  },
  addService(service: Service): void {
    const services = this.getServices();
    services.unshift(service);
    this.saveServices(services);
  },
  updateService(service: Service): void {
    const services = this.getServices().map((s) => (s.id === service.id ? service : s));
    this.saveServices(services);
  },
  deleteService(serviceId: string): void {
    const services = this.getServices().filter((s) => s.id !== serviceId);
    this.saveServices(services);
  },

  // Toggle Date Availability on Calendar
  toggleDateAvailability(serviceId: string, dateStr: string): void {
    const services = this.getServices();
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const isBooked = service.bookedDates.includes(dateStr);
    if (isBooked) {
      // Free it up
      service.bookedDates = service.bookedDates.filter((d) => d !== dateStr);
      if (!service.availableDates.includes(dateStr)) {
        service.availableDates.push(dateStr);
      }
    } else {
      // Mark as booked
      service.availableDates = service.availableDates.filter((d) => d !== dateStr);
      if (!service.bookedDates.includes(dateStr)) {
        service.bookedDates.push(dateStr);
      }
    }
    this.saveServices(services);
  },

  // Bookings
  getBookings(): Booking[] {
    return getItem<Booking[]>(KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },
  saveBookings(bookings: Booking[]): void {
    setItem(KEYS.BOOKINGS, bookings);
  },
  createBooking(booking: Booking): void {
    const bookings = this.getBookings();
    bookings.unshift(booking);
    this.saveBookings(bookings);

    // Also mark date as booked in the service calendar
    const services = this.getServices();
    const s = services.find((srv) => srv.id === booking.serviceId);
    if (s) {
      if (!s.bookedDates.includes(booking.date)) {
        s.bookedDates.push(booking.date);
      }
      s.availableDates = s.availableDates.filter((d) => d !== booking.date);
      this.saveServices(services);
    }
  },
  addBooking(booking: Booking): void {
    this.createBooking(booking);
  },
  // App Settings & Refund Policy
  getAppSettings(): AppSettings {
    return getItem<AppSettings>('munasabati_app_settings', {
      refundPercentage: 90,
      depositPercentage: 10,
      cancellationNoticeDays: 10,
      commissionPercentage: 2,
      ownerEmail: 'mmmmm3332012@gmail.com',
    });
  },
  saveAppSettings(settings: AppSettings): void {
    setItem('munasabati_app_settings', settings);
  },

  cancelBooking(bookingId: string): void {
    this.updateBookingStatus(bookingId, 'cancelled');
  },
  updateBookingStatus(bookingId: string, status: Booking['status']): void {
    const bookings = this.getBookings();
    const b = bookings.find((bk) => bk.id === bookingId);
    if (b) {
      b.status = status;
      if (status === 'accepted') {
        b.paymentStatus = 'paid_deposit';
      } else if (status === 'cancelled') {
        b.paymentStatus = 'refunded';
        const settings = this.getAppSettings();
        const refundRate = (settings.refundPercentage ?? 90) / 100;
        b.cancellationRefundAmount = Math.round(b.depositAmount * refundRate);
      }
      this.saveBookings(bookings);
    }
  },

  // Promo codes
  getPromoCodes(): PromoCode[] {
    return getItem<PromoCode[]>('munasabati_promos', [
      { id: 'p1', code: 'MUNASABATI10', discountPercentage: 10, validUntil: '2026-12-31', active: true, description: 'خصم ترحيبي 10%' },
      { id: 'p2', code: 'SUMMER2026', discountPercentage: 15, validUntil: '2026-09-01', active: true, description: 'خصم الموسم 15%' },
    ]);
  },
  addPromoCode(promo: PromoCode): void {
    const promos = this.getPromoCodes();
    promos.unshift(promo);
    setItem('munasabati_promos', promos);
  },

  // Guests
  getGuests(): Guest[] {
    return getItem<Guest[]>(KEYS.GUESTS, INITIAL_GUESTS);
  },
  saveGuests(guests: Guest[]): void {
    setItem(KEYS.GUESTS, guests);
  },
  addGuest(guest: Guest): void {
    const guests = this.getGuests();
    guests.unshift(guest);
    this.saveGuests(guests);
  },
  checkInGuestByQr(qrCode: string): Guest | null {
    const guests = this.getGuests();
    const guest = guests.find((g) => g.qrCode.toLowerCase() === qrCode.toLowerCase().trim());
    if (guest) {
      guest.checkedIn = true;
      guest.checkedInAt = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      this.saveGuests(guests);
      return guest;
    }
    return null;
  },

  // Tasks
  getTasks(): TaskItem[] {
    return getItem<TaskItem[]>(KEYS.TASKS, INITIAL_TASKS);
  },
  saveTasks(tasks: TaskItem[]): void {
    setItem(KEYS.TASKS, tasks);
  },

  // Budget
  getBudget(): BudgetItem[] {
    return getItem<BudgetItem[]>(KEYS.BUDGET, INITIAL_BUDGET);
  },
  saveBudget(budget: BudgetItem[]): void {
    setItem(KEYS.BUDGET, budget);
  },
  getClientTargetBudget(): number {
    return getItem<number>('munasabati_client_target_budget', 80000);
  },
  saveClientTargetBudget(amount: number): void {
    setItem('munasabati_client_target_budget', amount);
  },

  // Playlists & Music Requests
  getPlaylists(): PlaylistItem[] {
    return getItem<PlaylistItem[]>(KEYS.PLAYLISTS, PLAYLISTS);
  },
  getMusicRequests(): MusicCustomRequest[] {
    return getItem<MusicCustomRequest[]>(KEYS.MUSIC_REQUESTS, []);
  },
  addMusicRequest(req: MusicCustomRequest): void {
    const reqs = this.getMusicRequests();
    reqs.unshift(req);
    setItem(KEYS.MUSIC_REQUESTS, reqs);
  },

  // Service Reviews System
  getReviews(): ServiceReview[] {
    return getItem<ServiceReview[]>(KEYS.REVIEWS, INITIAL_REVIEWS);
  },
  saveReviews(reviews: ServiceReview[]): void {
    setItem(KEYS.REVIEWS, reviews);
  },
  getReviewsForService(serviceId: string): ServiceReview[] {
    return this.getReviews().filter((r) => r.serviceId === serviceId);
  },
  canUserReviewService(
    serviceId: string,
    clientEmail?: string,
    clientPhone?: string
  ): { canReview: boolean; bookingId?: string; existingReview?: ServiceReview; reason?: string } {
    const user = this.getCurrentUser();
    const email = (clientEmail || user?.email || '').trim().toLowerCase();
    const phone = (clientPhone || user?.phone || '').trim();

    if (!email && !phone) {
      return { canReview: false, reason: 'يرجى تسجيل الدخول بحسابك أولاً لإضافة تقييم.' };
    }

    const bookings = this.getBookings();
    const userBooking = bookings.find((b) => {
      if (b.serviceId !== serviceId) return false;
      if (b.status === 'cancelled' || b.status === 'rejected') return false;
      const matchEmail = email && b.clientEmail && b.clientEmail.trim().toLowerCase() === email;
      const matchPhone = phone && b.clientPhone && b.clientPhone.trim() === phone;
      return Boolean(matchEmail || matchPhone);
    });

    if (!userBooking) {
      return { canReview: false, reason: 'التقييم متاح فقط للعملاء الذين قاموا بحجز هذه الخدمة فعلياً.' };
    }

    const reviews = this.getReviews();
    const existingReview = reviews.find((r) => {
      if (r.serviceId !== serviceId) return false;
      if (r.bookingId && r.bookingId === userBooking.id) return true;
      if (email && r.clientEmail && r.clientEmail.trim().toLowerCase() === email) return true;
      if (phone && r.clientPhone && r.clientPhone.trim() === phone) return true;
      return false;
    });

    if (existingReview) {
      return { canReview: false, bookingId: userBooking.id, existingReview, reason: 'لقد قمت بتقديم تقييم لهذه الخدمة مسبقاً.' };
    }

    return { canReview: true, bookingId: userBooking.id };
  },
  addReview(review: ServiceReview): void {
    const reviews = this.getReviews();
    reviews.unshift(review);
    this.saveReviews(reviews);

    // Recalculate rating & reviewsCount for the service
    const serviceReviews = this.getReviewsForService(review.serviceId);
    const avg = Math.round((serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length) * 10) / 10;

    const services = this.getServices();
    const srv = services.find((s) => s.id === review.serviceId);
    if (srv) {
      srv.rating = avg;
      srv.reviewsCount = serviceReviews.length;
      this.saveServices(services);
    }
  },

  // Language & Role preferences
  getLanguage(): Language {
    return getItem<Language>(KEYS.LANG, 'ar');
  },
  setLanguage(lang: Language): void {
    setItem(KEYS.LANG, lang);
  },
  getRole(): UserRole {
    return getItem<UserRole>(KEYS.ROLE, 'client');
  },
  setRole(role: UserRole): void {
    setItem(KEYS.ROLE, role);
  },

  // Users & Authentication Management
  getUsers(): UserProfile[] {
    const defaultSupportUsers: UserProfile[] = [
      {
        id: 'usr-support-1',
        name: 'سارة أحمد (ممثلة خدمة العملاء 1)',
        email: 'cs1@munasabati.com',
        phone: '01001110001',
        role: 'support',
        password: '123',
        governorate: 'cairo',
        createdAt: '2026-04-01',
      },
      {
        id: 'usr-support-2',
        name: 'محمد فاروق (ممثل خدمة العملاء 2)',
        email: 'cs2@munasabati.com',
        phone: '01001110002',
        role: 'support',
        password: '123',
        governorate: 'cairo',
        createdAt: '2026-04-01',
      },
      {
        id: 'usr-support-3',
        name: 'نورهان خالد (ممثلة خدمة العملاء 3)',
        email: 'cs3@munasabati.com',
        phone: '01001110003',
        role: 'support',
        password: '123',
        governorate: 'giza',
        createdAt: '2026-04-01',
      },
      {
        id: 'usr-support-4',
        name: 'كريم حسن (ممثل خدمة العملاء 4)',
        email: 'cs4@munasabati.com',
        phone: '01001110004',
        role: 'support',
        password: '123',
        governorate: 'qalyubia',
        createdAt: '2026-04-01',
      },
      {
        id: 'usr-support-5',
        name: 'ياسمين إبراهيم (ممثلة خدمة العملاء 5)',
        email: 'cs5@munasabati.com',
        phone: '01001110005',
        role: 'support',
        password: '123',
        governorate: 'cairo',
        createdAt: '2026-04-01',
      },
    ];

    const initialUsersList: UserProfile[] = [
      {
        id: 'usr-owner-1',
        name: 'المالك الوحيد والمدير العام',
        email: 'mmm3332012@gmail.com',
        phone: '01012345678',
        role: 'admin',
        password: 'admin',
        createdAt: '2026-01-01',
      },
      {
        id: 'usr-owner-2',
        name: 'المالك الوحيد والمدير العام',
        email: 'mmmmm3332012@gmail.com',
        phone: '01012345678',
        role: 'admin',
        password: 'admin',
        createdAt: '2026-01-01',
      },
      ...defaultSupportUsers,
      {
        id: 'usr-client-1',
        name: 'أحمد محمود العروس',
        email: 'ahmed@gmail.com',
        phone: '01011112222',
        role: 'client',
        password: '123',
        governorate: 'cairo',
        createdAt: '2026-02-10',
      },
      {
        id: 'usr-client-2',
        name: 'مريم علي حسن',
        email: 'maryam@gmail.com',
        phone: '01233334444',
        role: 'client',
        password: '123',
        governorate: 'giza',
        createdAt: '2026-03-15',
      },
      {
        id: 'usr-vendor-1',
        name: 'ستوديو لقطات لايف للتصوير',
        email: 'vendor1@gmail.com',
        phone: '01223344556',
        role: 'vendor',
        password: '123',
        governorate: 'cairo',
        createdAt: '2026-01-20',
      },
    ];

    const users = getItem<UserProfile[]>('munasabati_users', initialUsersList);

    // Auto-ensure default 5 support users exist
    let modified = false;
    defaultSupportUsers.forEach((su) => {
      if (!users.some((u) => u.id === su.id || u.email === su.email)) {
        users.push(su);
        modified = true;
      }
    });

    if (modified) {
      setItem('munasabati_users', users);
    }

    return users;
  },
  saveUsers(users: UserProfile[]): void {
    setItem('munasabati_users', users);
  },
  registerUser(user: UserProfile): UserProfile {
    const users = this.getUsers();
    const cleanEmail = user.email.trim().toLowerCase();
    // Default role is strictly 'client' unless email is owner email
    const isOwner = cleanEmail === 'mmmmm3332012@gmail.com' || cleanEmail === 'mmm3332012@gmail.com';
    const finalUser: UserProfile = {
      ...user,
      role: isOwner ? 'admin' : 'client',
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.unshift(finalUser);
    this.saveUsers(users);
    this.setCurrentUser(finalUser);
    return finalUser;
  },
  addUser(user: UserProfile): UserProfile[] {
    const users = this.getUsers();
    users.unshift(user);
    this.saveUsers(users);
    return users;
  },
  updateUser(user: UserProfile): UserProfile[] {
    const users = this.getUsers().map((u) => (u.id === user.id ? user : u));
    this.saveUsers(users);
    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      this.setCurrentUser(user);
    }
    return users;
  },
  deleteUser(userId: string): UserProfile[] {
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.saveUsers(users);
    return users;
  },
  deleteBooking(bookingId: string): Booking[] {
    const bookings = this.getBookings().filter((b) => b.id !== bookingId);
    this.saveBookings(bookings);
    return bookings;
  },
  updateVendorApplicationCallLog(
    appId: string,
    notes: string,
    callStatus: 'pending_schedule' | 'scheduled' | 'completed'
  ): VendorApplication[] {
    const apps = this.getVendorApplications().map((a) => {
      if (a.id === appId) {
        return {
          ...a,
          verificationCallNotes: notes,
          verificationCallStatus: callStatus,
        };
      }
      return a;
    });
    this.saveVendorApplications(apps);
    return apps;
  },
  updateUserRole(userId: string, newRole: UserRole): UserProfile[] {
    const users = this.getUsers().map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    this.saveUsers(users);
    
    // If current logged-in user is updated, sync current user too
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser({ ...current, role: newRole });
    }
    return users;
  },
  getCurrentUser(): UserProfile | null {
    return getItem<UserProfile | null>('munasabati_current_user', null);
  },
  setCurrentUser(user: UserProfile | null): void {
    setItem('munasabati_current_user', user);
    if (user) {
      this.setRole(user.role);
    }
  },
  logout(): void {
    localStorage.removeItem('munasabati_current_user');
  },

  // Vendor Applications Management
  getVendorApplications(): VendorApplication[] {
    return getItem<VendorApplication[]>('munasabati_vendor_applications', [
      {
        id: 'vapp-1',
        userId: 'usr-client-2',
        userName: 'مريم علي حسن',
        userEmail: 'maryam@gmail.com',
        userPhone: '01233334444',
        businessName: 'أتيليه واستوديو مريم لميك أب العرائس',
        category: 'makeup',
        governorate: 'giza',
        district: 'الدقي',
        address: 'شارع مصدق، الدقي، الجيزة',
        description: 'ميك أب آرتيست محترفة خبرة 6 سنوات في تجهيز العرائس والمناسبات واستخدام أحدث خامات أصلية معتمدة.',
        experienceYears: 6,
        nationalIdNumber: '29805120101234',
        status: 'pending',
        createdAt: '2026-08-01',
      },
      {
        id: 'vapp-2',
        userId: 'usr-vendor-1',
        userName: 'ستوديو لقطات لايف',
        userEmail: 'vendor1@gmail.com',
        userPhone: '01223344556',
        businessName: 'ستوديو لقطات لايف للتصوير والسيشنات السينمائية',
        category: 'photographer',
        governorate: 'cairo',
        district: 'مدينة نصر',
        address: 'مكرم عبيد، مدينة نصر، القاهرة',
        description: 'فريق تصوير فيديو وفوتوغرافيا سينمائية محترف للمناسبات والأفراح مع أحدث معدات درون وإضاءة.',
        experienceYears: 8,
        nationalIdNumber: '29503100109876',
        status: 'approved',
        createdAt: '2026-07-20',
      },
      {
        id: 'vapp-3',
        userId: 'usr-client-3',
        userName: 'المهندس محمود سالم',
        userEmail: 'salem_halls@gmail.com',
        userPhone: '01099887766',
        businessName: 'قاعة الباشا الملكية للأفراح والمؤتمرات',
        category: 'hall',
        governorate: 'cairo',
        district: 'التجمع الخامس',
        address: 'التجمع الخامس، شارع التسعين الجنوبي',
        description: 'قاعة فخمة تسع حتى 600 فرد مع بوفيه مفتوح وديكورات ليزر وكوشة فاخرة.',
        experienceYears: 10,
        nationalIdNumber: '28901010105432',
        status: 'pending',
        createdAt: '2026-08-03',
      },
      {
        id: 'vapp-4',
        userId: 'usr-client-4',
        userName: 'أحمد النور',
        userEmail: 'elnour_decor@gmail.com',
        userPhone: '01122334455',
        businessName: 'شركة النور لتجهيز الكوشة وتنسيق الزهور',
        category: 'decor',
        governorate: 'qalyubia',
        district: 'بنها',
        address: 'شارع الأهرام، بنها، القليوبية',
        description: 'متخصصون في أرقى تصميمات الكوشة والإضاءات الديكورية وتنسيق زهور الطبيعة.',
        experienceYears: 5,
        nationalIdNumber: '29408200103322',
        status: 'pending',
        createdAt: '2026-08-05',
      },
      {
        id: 'vapp-5',
        userId: 'usr-client-5',
        userName: 'الكابتن إسلام الملوك',
        userEmail: 'islam_dj@gmail.com',
        userPhone: '01555443322',
        businessName: 'فرقة الملوك للدي جي والزفة والدي جيهات',
        category: 'music',
        governorate: 'cairo',
        district: 'مصر الجديدة',
        address: 'شارع الميرغني، مصر الجديدة، القاهرة',
        description: 'عروض زفة وموسيقى ودي جي بأحدث أجهزة الصوت والمؤثرات الضوئية.',
        experienceYears: 7,
        nationalIdNumber: '29311150106677',
        status: 'approved',
        createdAt: '2026-07-28',
      },
    ]);
  },
  saveVendorApplications(apps: VendorApplication[]): void {
    setItem('munasabati_vendor_applications', apps);
  },
  submitVendorApplication(app: VendorApplication): VendorApplication {
    const apps = this.getVendorApplications();
    const existingIndex = apps.findIndex((a) => a.id === app.id || (a.userId === app.userId && a.businessName === app.businessName));
    if (existingIndex >= 0) {
      apps[existingIndex] = app;
    } else {
      apps.unshift(app);
    }
    this.saveVendorApplications(apps);
    return app;
  },
  updateVendorApplicationStatus(
    appId: string,
    status: VendorApplicationStatus,
    rejectionReason?: string
  ): VendorApplication[] {
    const apps = this.getVendorApplications().map((a) => {
      if (a.id === appId) {
        const updatedApp = {
          ...a,
          status,
          rejectionReason: rejectionReason || a.rejectionReason,
          reviewedAt: new Date().toISOString().split('T')[0],
        };
        // If approved, automatically upgrade user to vendor role
        if (status === 'approved') {
          this.updateUserRole(a.userId, 'vendor');
        }
        return updatedApp;
      }
      return a;
    });
    this.saveVendorApplications(apps);
    return apps;
  },
  getUserVendorApplication(userId: string): VendorApplication | null {
    const apps = this.getVendorApplications();
    return apps.find((a) => a.userId === userId) || null;
  },
};

