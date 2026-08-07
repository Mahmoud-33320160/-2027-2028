import { Language } from '../types';

export const translations = {
  ar: {
    appName: 'مناسباتي',
    appTagline: 'منصتك الشاملة لتنظيم وتخطيط أجمل المناسبات في مصر',
    // Navigation & Roles
    roleClient: 'عميل / منظّم مناسبة',
    roleVendor: 'مقدم خدمة (صاحب قاعة/مصور...)',
    roleAdmin: 'المالك / الأدمن الرئيسي',
    switchRole: 'تبديل نوع الحساب',
    language: 'اللغة / Language',
    currentLanguage: 'العربية',

    // Client Navigation Tabs
    tabSearch: 'تصفح الخدمات والقاعات',
    tabMaps: 'خريطة الموقع (Maps)',
    tabServices: 'الخدمات والقاعات',
    tabMap: 'خريطة الموقع (Maps)',
    tabCalendar: 'تقويم التوفر',
    tabMakeup: 'قسم الميكب آرتيست',
    tabMusic: 'مكتبة الموسيقى',
    tabAssistant: 'المساعد الذكي (AI)',
    tabAiAssistant: 'المساعد الذكي (AI)',
    tabDashboard: 'الميزانية والمهام',
    tabGuests: 'إدارة الضيوف وQR',
    tabBookings: 'حجوزاتي والدفعات',
    tabGoogleDrive: 'مستندات Google Drive',
    tabGoogleTasks: 'مهام Google Tasks',
    tabGmail: 'بريد Gmail للحجوزات',
    tabBecomeVendor: 'التقديم كمقدم خدمة',

    // Categories
    catHall: 'قاعات وأفراح',
    catHalls: 'قاعات وأفراح',
    catPhotographer: 'مصورين وسيشن',
    catPhotographers: 'مصورين وسيشن',
    catDecor: 'ديكور وكوشة',
    catCatering: 'بوفيه وكاترينج',
    catMusic: 'دي جي وموسيقى',
    catMakeup: 'ميكب آرتيست',
    catCafeRestaurant: 'كافيهات ومطاعم',
    allCategories: 'جميع الخدمات',
    price: 'التكلفة الإجمالية',

    // Governorates
    govCairo: 'القاهرة',
    govGiza: 'الجيزة',
    govQalyubia: 'القليوبية',
    allGovernorates: 'جميع المحافظات',

    // Event Types
    eventWedding: 'زفاف',
    eventEngagement: 'خطوبة',
    eventBirthday: 'عيد ميلاد',
    eventConference: 'مؤتمر / عمل',
    eventCafeRestaurant: 'حجز كافيه / مطعم',
    eventGraduation: 'تخرج',
    eventOther: 'مناسبة أخرى',

    // Booking & Deposit Policy
    depositTitle: 'نظام الدفع والعربون 10%',
    depositNotice: 'ادفع 10% عربون الآن لتأكيد الحجز، والمبلغ المتبقي (90%) يتم سداده قبل المناسبة بـ 10 أيام.',
    cancellationPolicyTitle: 'سياسة الإلغاء والاسترداد 90%',
    cancellationPolicyText: 'عند إلغاء الحجز من طرف العميل قبل الموعد، يحق لك استرداد 90% من إجمالي المبلغ المدفوع.',
    nationalIdRequired: 'ضمان الحجز (رفع صورة البطاقة الشخصية - الرقم القومي)',
    nationalIdNotice: 'لضمان حقوق الطرفين، يجب رفع صورة بطاقة الرقم القومي (الوجهين) قبل إتمام طلب الحجز.',
    uploadFront: 'رفع صورة البطاقة (الوجه الأول)',
    uploadBack: 'رفع صورة البطاقة (الظهر)',

    // Booking Statuses
    statusPending: 'قيد الانتظار',
    statusAccepted: 'تم القبول',
    statusRejected: 'مرفوض',
    statusPaid: 'تم دفع العربون',
    statusCompleted: 'مكتمل',
    statusCancelled: 'ملغى ومسترد',

    // Actions
    bookNow: 'احجز الآن (دفع 10% عربون)',
    viewDetails: 'عرض التفاصيل والتقويم',
    searchPlaceholder: 'ابحث عن قاعة، مصور، ميكب آرتيست، أو موقع...',
    filterByPrice: 'السعر الأقصى (جنيه)',
    filterByCapacity: 'عدد الضيوف المطلوب',
    resetFilters: 'إعادة ضبط الفلاتر',
    close: 'إغلاق',
    save: 'حفظ البيانات',
    cancel: 'إلغاء الحجز والاسترداد',
    confirmBooking: 'تأكيد الحجز والدفع',

    // Calendar
    calendarTitle: 'تقويم توفر الخدمة',
    calendarGreenLegend: 'الأيام الخضراء: متاحة للحجز المباشر',
    calendarRedLegend: 'الأيام الحمراء: محجوزة أو غير متاحة',
    selectDatePrompt: 'اختر تاريخاً متاحاً باللون الأخضر لإرسال طلب الحجز',

    // Makeup section
    makeupTitle: 'قسم الميكب آرتيست المتخصص',
    makeupSubtitle: 'أشطر الميكب آرتيست في القاهرة والجيزة والقليوبية - باقات الخطوبة والزفاف والسواريه',

    // Music section
    musicTitle: 'مكتبة الموسيقى والأغاني',
    musicSubtitle: 'قوائم تشغيل جاهزة للزفة، الرقص الشرقي، DJ، والدبكة - يمكنك طلب قائمة خاصة من مزود الموسيقى',
    playPreview: 'تشغيل المعاينة',
    stopPreview: 'إيقاف',
    requestCustomSongs: 'طلب قائمة أغاني مخصصة',

    // AI Assistant
    aiAssistantTitle: 'المساعد الذكي لمناسبتك',
    aiAssistantSubtitle: 'أدخل ميزانيتك وعدد ضيوفك ومحافظتك ليقترح عليك Gemini أفضل القاعات والخدمات المناسبة تماماً.',
    budgetInputLabel: 'الميزانية الإجمالية (جنيه مصري):',
    guestsInputLabel: 'عدد الضيوف المتوقع:',
    getAiRecommendation: 'الحصول على اقتراحات المساعد الذكي ✨',
    aiLoading: 'جاري تحليل الخيارات المتاحة بواسطة Gemini...',

    // Dashboard, Budget, Tasks
    completionRate: 'نسبة إنجاز التجهيزات',
    totalBudget: 'الميزانية المرصودة',
    spentBudget: 'المصروفات الفعلية',
    remainingBudget: 'المتبقي من الميزانية',
    addExpense: 'إضافة مصروف جديد',
    addTask: 'إضافة مهمة جديدة',
    tasksChecklist: 'جدول مهام المناسبة',

    // Guests & QR
    guestManagement: 'إدارة قائمة المدعوين وبطاقات الدعوة',
    addGuest: 'إضافة ضيف جديد',
    companionCount: 'عدد المرافقين',
    rsvpStatus: 'حالة الرد (قبول / رفض / معلق)',
    qrCodeTitle: 'رمز QR الخاص بالدعوة',
    scanQrTitle: 'ماسح حضور الضيوف يوم المناسبة',
    simulateScan: 'تسجيل دخول الضيف عبر الـ QR Code',
    checkedInAt: 'تم الحضور في:',

    // Map & Directions
    mapTitle: 'خريطة القاعات والخدمات (Google Maps)',
    calculateRoute: 'حساب المسافة وطريق الوصول',
    userLocation: 'موقعك الحكالي (القاهرة / الجيزة / القليوبية)',
    distance: 'المسافة التقريبية:',
    duration: 'زمن الوصول المتوقع:',

    // Vendor View
    vendorDashboardTitle: 'لوحة تحكم مقدم الخدمة (Vendor Panel)',
    vendorManageService: 'إدارة بيانات الخدمة والأسعار',
    vendorManageCalendar: 'إدارة التقويم والتوفر',
    vendorRequests: 'طلبات الحجز الواردة ووثائق الضمان',
    vendorEarnings: 'إجمالي الأرباح والدفعات',
    toggleDateAvailability: 'انقر على اليوم للتبديل بين متاح (أخضر) ومحجوز (أحمر)',
    clientNationalIdView: 'معاينة بطاقة الرقم القومي للعميل (الضمان)',

    // Admin View
    adminDashboardTitle: 'لوحة تحكم المالك الرئيسي (Super Admin)',
    adminUsersManagement: 'إدارة العملاء ومقدمي الخدمات',
    adminAddVendor: 'إضافة مقدم خدمة جديد اعتماد رسمي',
    adminAllBookings: 'جميع الحجوزات والعمليات المالية',
    adminCommissionReport: 'تقارير العمولات (2% المنصة)',
    adminAddService: 'إضافة قاعة / مطعم / كافيه / خدمة جديدة',

    // Common
    egp: 'ج.م',
    guestsCount: 'ضيف',
    daysBeforeEvent: 'يوم على المناسبة',
    phone: 'رقم الهاتف',
    notes: 'ملاحظات إضافية',
  },
  en: {
    appName: 'Munasabati',
    appTagline: 'Your All-in-One Event Management Platform in Egypt',
    // Navigation & Roles
    roleClient: 'Client / Event Planner',
    roleVendor: 'Service Provider / Vendor',
    roleAdmin: 'Super Admin / Owner',
    switchRole: 'Switch Account Type',
    language: 'Language / اللغة',
    currentLanguage: 'English',

    // Client Navigation Tabs
    tabSearch: 'Browse Venues & Services',
    tabMaps: 'Location Map (Maps)',
    tabServices: 'Services & Venues',
    tabMap: 'Location Map (Maps)',
    tabCalendar: 'Availability Calendar',
    tabMakeup: 'Makeup Artists Section',
    tabMusic: 'Music Library',
    tabAssistant: 'Smart AI Assistant',
    tabAiAssistant: 'Smart AI Assistant',
    tabDashboard: 'Budget & Tasks',
    tabGuests: 'Guest List & QR Cards',
    tabBookings: 'My Bookings & Deposits',
    tabGoogleDrive: 'Google Drive Documents',
    tabGoogleTasks: 'Google Tasks Sync',
    tabGmail: 'Gmail Email Workspace',
    tabBecomeVendor: 'Become a Service Provider',

    // Categories
    catHall: 'Wedding Halls & Venues',
    catHalls: 'Halls & Venues',
    catPhotographer: 'Photographers & Sessions',
    catPhotographers: 'Photographers',
    catDecor: 'Decor & Stages',
    catCatering: 'Buffet & Catering',
    catMusic: 'DJ & Music Services',
    catMakeup: 'Makeup Artists',
    catCafeRestaurant: 'Cafes & Restaurants',
    allCategories: 'All Services',
    price: 'Total Price',

    // Governorates
    govCairo: 'Cairo',
    govGiza: 'Giza',
    govQalyubia: 'Qalyubia',
    allGovernorates: 'All Governorates',

    // Event Types
    eventWedding: 'Wedding',
    eventEngagement: 'Engagement',
    eventBirthday: 'Birthday Party',
    eventConference: 'Conference / Business',
    eventCafeRestaurant: 'Cafe / Restaurant Booking',
    eventGraduation: 'Graduation Party',
    eventOther: 'Other Event',

    // Booking & Deposit Policy
    depositTitle: '10% Deposit Payment System',
    depositNotice: 'Pay a 10% down payment now to secure your reservation. The remaining 90% balance is payable 10 days before the event.',
    cancellationPolicyTitle: '90% Cancellation & Refund Policy',
    cancellationPolicyText: 'If you cancel your reservation prior to the event, you are eligible for a 90% refund of the total paid amount.',
    nationalIdRequired: 'Booking Guarantee (National ID Card Attachment)',
    nationalIdNotice: 'To protect both parties, please attach front and back photos of your National ID before finalizing your request.',
    uploadFront: 'Upload ID Front Photo',
    uploadBack: 'Upload ID Back Photo',

    // Booking Statuses
    statusPending: 'Pending Acceptance',
    statusAccepted: 'Accepted',
    statusRejected: 'Rejected',
    statusPaid: 'Deposit Paid (10%)',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled & Refunded',

    // Actions
    bookNow: 'Book Now (10% Deposit)',
    viewDetails: 'View Details & Calendar',
    searchPlaceholder: 'Search venue, photographer, makeup artist, or area...',
    filterByPrice: 'Max Price (EGP)',
    filterByCapacity: 'Required Guests Capacity',
    resetFilters: 'Reset Filters',
    close: 'Close',
    save: 'Save Changes',
    cancel: 'Cancel Booking & Refund',
    confirmBooking: 'Confirm & Pay Deposit',

    // Calendar
    calendarTitle: 'Service Availability Calendar',
    calendarGreenLegend: 'Green Days: Available for Instant Booking',
    calendarRedLegend: 'Red Days: Booked / Unavailable',
    selectDatePrompt: 'Select an available green date to send your reservation request',

    // Makeup section
    makeupTitle: 'Specialized Makeup Artists Section',
    makeupSubtitle: 'Top Makeup Artists in Cairo, Giza & Qalyubia - Engagement, Bridal & Soirée packages',

    // Music section
    musicTitle: 'Music & Playlists Library',
    musicSubtitle: 'Ready playlists for Zaffa, Bellydance, DJ Sets & Dabke - Request custom playlists directly from vendors',
    playPreview: 'Play Sample',
    stopPreview: 'Stop',
    requestCustomSongs: 'Request Custom Song List',

    // AI Assistant
    aiAssistantTitle: 'Smart AI Event Planner',
    aiAssistantSubtitle: 'Enter your budget, guest count, and governorate to get AI-driven venue & vendor package recommendations via Gemini.',
    budgetInputLabel: 'Total Budget (EGP):',
    guestsInputLabel: 'Expected Guest Count:',
    getAiRecommendation: 'Get AI Recommendations ✨',
    aiLoading: 'Gemini is analyzing top available services...',

    // Dashboard, Budget, Tasks
    completionRate: 'Preparation Progress',
    totalBudget: 'Allocated Budget',
    spentBudget: 'Actual Expenses',
    remainingBudget: 'Remaining Budget',
    addExpense: 'Add New Expense',
    addTask: 'Add New Task',
    tasksChecklist: 'Event Tasks Checklist',

    // Guests & QR
    guestManagement: 'Guests & Invitation Cards Management',
    addGuest: 'Add New Guest',
    companionCount: 'Companions Count',
    rsvpStatus: 'RSVP Status (Accepted / Declined / Pending)',
    qrCodeTitle: 'Invitation QR Code',
    scanQrTitle: 'Event-Day Guest Check-in Scanner',
    simulateScan: 'Simulate Guest QR Check-In',
    checkedInAt: 'Checked in at:',

    // Map & Directions
    mapTitle: 'Venues & Services Location Map (Google Maps)',
    calculateRoute: 'Calculate Route & Distance',
    userLocation: 'Your Current Location (Cairo / Giza / Qalyubia)',
    distance: 'Estimated Distance:',
    duration: 'Estimated Travel Time:',

    // Vendor View
    vendorDashboardTitle: 'Vendor Control Panel',
    vendorManageService: 'Manage Service Details & Pricing',
    vendorManageCalendar: 'Manage Availability Calendar',
    vendorRequests: 'Incoming Booking Requests & ID Guarantees',
    vendorEarnings: 'Total Revenue & Payments',
    toggleDateAvailability: 'Click on any date to toggle between Available (Green) and Booked (Red)',
    clientNationalIdView: 'Inspect Client National ID (Guarantee)',

    // Admin View
    adminDashboardTitle: 'Super Admin Panel (Owner)',
    adminUsersManagement: 'Manage Clients & Vendors',
    adminAddVendor: 'Approve & Add New Vendor',
    adminAllBookings: 'All Bookings & Financial Logs',
    adminCommissionReport: 'Platform Commission Reports (2%)',
    adminAddService: 'Add New Hall / Cafe / Restaurant / Service',

    // Common
    egp: 'EGP',
    guestsCount: 'guests',
    daysBeforeEvent: 'days before event',
    phone: 'Phone Number',
    notes: 'Additional Notes',
  },
};

export function getTranslation(lang: Language, key: keyof typeof translations.ar): string {
  return translations[lang]?.[key] || translations.ar[key] || key;
}
