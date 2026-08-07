import React, { useState, useEffect } from 'react';
import { Booking, Service, Language, PromoCode, UserProfile, UserRole, AppSettings, VendorApplication } from '../types';
import { getTranslation } from '../lib/translations';
import { StorageManager } from '../lib/storage';
import { 
  ShieldCheck, 
  Users, 
  Store, 
  DollarSign, 
  FileCheck, 
  Eye, 
  CheckCircle2, 
  Lock, 
  Tag, 
  Plus, 
  Crown, 
  Sparkles, 
  User,
  Edit3,
  Building2,
  Phone,
  UserCheck,
  Search,
  Check,
  UserPlus,
  ShieldAlert,
  Mail,
  Calendar,
  Settings,
  RotateCcw,
  Percent,
  Trash2,
  Video,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  X,
  PieChart,
  BarChart3,
  PhoneCall,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface AdminPanelProps {
  bookings: Booking[];
  services: Service[];
  promoCodes?: PromoCode[];
  users?: UserProfile[];
  vendorApplications?: VendorApplication[];
  onAddPromoCode?: (promo: PromoCode) => void;
  onDeletePromoCode?: (promoId: string) => void;
  onAddService?: (service: Service) => void;
  onUpdateService?: (service: Service) => void;
  onDeleteService?: (serviceId: string) => void;
  onAddUser?: (user: UserProfile) => void;
  onUpdateUser?: (user: UserProfile) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUserRole?: (userId: string, newRole: UserRole) => void;
  onUpdateVendorApplicationStatus?: (appId: string, status: 'approved' | 'rejected', rejectionReason?: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: Booking['status']) => void;
  onDeleteBooking?: (bookingId: string) => void;
  language: Language;
}

const PRESET_VENDORS = [
  { id: 'vnd-1', name: 'مكتب المناسبات الملكية', phone: '01012345678' },
  { id: 'vnd-2', name: 'ستوديو لقطات لايف للتصوير والسيشن', phone: '01223344556' },
  { id: 'vnd-3', name: 'موزيكانا للدي جي والفرق الموسيقية', phone: '01112223334' },
  { id: 'vnd-4', name: 'لمسات الجمال للميكب آرتيست', phone: '01556677889' },
  { id: 'vnd-5', name: 'شيف الجراند بوتيك للبوفيه والكاترينج', phone: '01099887766' },
  { id: 'vnd-6', name: 'كافيه ومطعم أروما بالاس للمناسبات', phone: '01277665544' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  bookings,
  services,
  promoCodes = [],
  users = [],
  vendorApplications: vendorApplicationsProp,
  onAddPromoCode,
  onDeletePromoCode,
  onAddService,
  onUpdateService,
  onDeleteService,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateUserRole,
  onUpdateVendorApplicationStatus,
  onUpdateBookingStatus,
  onDeleteBooking,
  language,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [activeTab, setActiveTab] = useState<'overview' | 'users_roles' | 'vendor_applications' | 'add_service' | 'manage_vendors' | 'financial_reports' | 'promos' | 'settings'>('overview');
  const [selectedNationalIdBooking, setSelectedNationalIdBooking] = useState<Booking | null>(null);

  // Vendor Applications State
  const [vendorApplications, setVendorApplications] = useState<VendorApplication[]>(
    () => vendorApplicationsProp || StorageManager.getVendorApplications()
  );
  const [vendorAppFilter, setVendorAppFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [vendorSearchQuery, setVendorSearchQuery] = useState<string>('');
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');

  // Verification Call Modal State
  const [activeVerificationApp, setActiveVerificationApp] = useState<VendorApplication | null>(null);
  const [verificationCallNotes, setVerificationCallNotes] = useState<string>('');
  const [verificationCallStatus, setVerificationCallStatus] = useState<'pending_schedule' | 'scheduled' | 'completed'>('completed');

  useEffect(() => {
    if (vendorApplicationsProp && vendorApplicationsProp.length > 0) {
      setVendorApplications(vendorApplicationsProp);
    } else {
      setVendorApplications(StorageManager.getVendorApplications());
    }
  }, [vendorApplicationsProp, activeTab]);

  const handleApproveVendorApp = (appId: string) => {
    if (onUpdateVendorApplicationStatus) {
      onUpdateVendorApplicationStatus(appId, 'approved');
    } else {
      const updated = StorageManager.updateVendorApplicationStatus(appId, 'approved');
      setVendorApplications(updated);
      const app = updated.find(a => a.id === appId);
      if (app && onUpdateUserRole) {
        onUpdateUserRole(app.userId, 'vendor');
      }
    }
    setActiveVerificationApp(null);
  };

  const handleRejectVendorApp = (appId: string, reason?: string) => {
    const finalReason = reason || rejectionReasonText.trim() || 'عدم استيفاء شروط وتراخيص الخدمة في المكالمة التوثيقية';
    if (onUpdateVendorApplicationStatus) {
      onUpdateVendorApplicationStatus(appId, 'rejected', finalReason);
    } else {
      const updated = StorageManager.updateVendorApplicationStatus(appId, 'rejected', finalReason);
      setVendorApplications(updated);
    }
    setRejectingAppId(null);
    setRejectionReasonText('');
    setActiveVerificationApp(null);
  };

  const handleSaveVerificationCall = () => {
    if (!activeVerificationApp) return;
    const updated = StorageManager.updateVendorApplicationCallLog(
      activeVerificationApp.id,
      verificationCallNotes,
      verificationCallStatus
    );
    setVendorApplications(updated);
    alert('تم حفظ تفاصيل وملاحظات مكالمة التحقق بنجاح!');
  };

  // App Refund Policy Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(() => StorageManager.getAppSettings());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageManager.saveAppSettings(appSettings);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // User Search & Full User CRUD Modal State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'client' | 'vendor' | 'support' | 'admin'>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  
  // New User Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPassword, setUserPassword] = useState('123456');
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [userGov, setUserGov] = useState<UserProfile['governorate']>('cairo');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !userPhone.trim()) return;
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: userName.trim(),
      email: userEmail.trim().toLowerCase(),
      phone: userPhone.trim(),
      password: userPassword || '123456',
      role: userRole,
      governorate: userGov,
      createdAt: new Date().toISOString().split('T')[0],
    };
    if (onAddUser) {
      onAddUser(newUser);
    } else {
      StorageManager.addUser(newUser);
    }
    setIsAddUserModalOpen(false);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (onUpdateUser) {
      onUpdateUser(editingUser);
    } else {
      StorageManager.updateUser(editingUser);
    }
    setEditingUser(null);
  };

  const handleDeleteUserClick = (userId: string, email: string) => {
    const clean = email.trim().toLowerCase();
    if (clean === 'mmmmm3332012@gmail.com' || clean === 'mmm3332012@gmail.com') {
      alert('عذراً، لا يمكن حذف حساب المالك الرئيسي والمدير العام المنفذ.');
      return;
    }
    if (confirm('هل أنت تأكد من رغبتك في حذف هذا المستخدم نهائياً من المنصة؟')) {
      if (onDeleteUser) {
        onDeleteUser(userId);
      } else {
        StorageManager.deleteUser(userId);
      }
    }
  };

  // Full Service Edit Modal State
  const [editingFullService, setEditingFullService] = useState<Service | null>(null);

  const handleSaveFullServiceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFullService) return;
    if (onUpdateService) {
      onUpdateService(editingFullService);
    } else {
      StorageManager.updateService(editingFullService);
    }
    setEditingFullService(null);
    alert('تم تحديث وتعديل تفاصيل الخدمة بنجاح!');
  };

  const handleDeleteServiceClick = (serviceId: string, title: string) => {
    if (confirm(`هل أنت متأكد من حذف الخدمة (${title}) نهائياً من المنصة؟`)) {
      if (onDeleteService) {
        onDeleteService(serviceId);
      } else {
        StorageManager.deleteService(serviceId);
      }
    }
  };

  // Booking CRUD Handlers
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');

  const handleDeleteBookingClick = (bookingId: string) => {
    if (confirm(`هل أنت متأكد من حذف الحجز #${bookingId} من المنصة؟`)) {
      if (onDeleteBooking) {
        onDeleteBooking(bookingId);
      } else {
        StorageManager.deleteBooking(bookingId);
      }
    }
  };

  // Promo Code Form & Delete
  const [promoCodeName, setPromoCodeName] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(10);
  const [promoDesc, setPromoDesc] = useState('');

  const handleDeletePromoCodeClick = (promoId: string) => {
    if (confirm('هل أنت متأكد من حذف كود الخصم هذا؟')) {
      if (onDeletePromoCode) {
        onDeletePromoCode(promoId);
      } else {
        const updated = promoCodes.filter(p => p.id !== promoId);
        localStorage.setItem('munasabati_promos', JSON.stringify(updated));
      }
    }
  };

  // Add New Service Form State (Owner Driven)
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState<Service['category']>('hall');
  const [price, setPrice] = useState<number>(35000);
  const [governorate, setGovernorate] = useState<Service['governorate']>('cairo');
  const [district, setDistrict] = useState('المعادي');
  const [address, setAddress] = useState('كورنيش النيل، المعادي');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number>(250);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80');
  
  // Vendor Selector for New Service
  const [selectedVendorOption, setSelectedVendorOption] = useState<string>('vnd-1');
  const [customVendorName, setCustomVendorName] = useState('');
  const [customVendorPhone, setCustomVendorPhone] = useState('');

  // Edit Vendor Reassignment Modal State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editVendorOption, setEditVendorOption] = useState<string>('vnd-1');
  const [editCustomVendorName, setEditCustomVendorName] = useState('');
  const [editCustomVendorPhone, setEditCustomVendorPhone] = useState('');

  // Search in manage vendors
  const [serviceSearch, setServiceSearch] = useState('');

  // Stats & Financial Analysis
  const totalVolume = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
  const totalDepositsCollected = bookings.reduce((acc, b) => acc + b.depositAmount, 0);
  const totalRemainingBalance = totalVolume - totalDepositsCollected;
  const commissionRate = (appSettings.commissionPercentage ?? 2) / 100;
  const platformCommissionEstimate = Math.round(totalVolume * commissionRate);
  const vendorPayoutsTotal = totalVolume - platformCommissionEstimate;

  // Category Revenue Map
  const categoryRevenueMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const srv = services.find((s) => s.id === b.serviceId);
    const cat = srv ? srv.category : 'hall';
    categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + b.totalPrice;
  });

  // Governorate Revenue Map
  const govRevenueMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const srv = services.find((s) => s.id === b.serviceId);
    const gov = srv ? srv.governorate : 'cairo';
    govRevenueMap[gov] = (govRevenueMap[gov] || 0) + b.totalPrice;
  });

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeName.trim()) return;
    const newPromo: PromoCode = {
      id: `p-${Date.now()}`,
      code: promoCodeName.trim().toUpperCase(),
      discountPercentage: promoDiscount,
      validUntil: '2026-12-31',
      active: true,
      description: promoDesc.trim() || 'خصم خاص حصري من المالك',
    };
    if (onAddPromoCode) {
      onAddPromoCode(newPromo);
    } else {
      StorageManager.addPromoCode(newPromo);
    }
    setPromoCodeName('');
    setPromoDesc('');
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let vName = 'مكتب المناسبات الملكية';
    let vPhone = '01012345678';

    if (selectedVendorOption === 'custom') {
      vName = customVendorName.trim() || 'مقدم خدمة معتمد';
      vPhone = customVendorPhone.trim() || '01000000000';
    } else {
      const preset = PRESET_VENDORS.find((v) => v.id === selectedVendorOption);
      if (preset) {
        vName = preset.name;
        vPhone = preset.phone;
      }
    }

    const newService: Service = {
      id: `srv-owner-${Date.now()}`,
      title: title.trim(),
      titleEn: titleEn.trim() || title.trim(),
      category,
      price,
      depositPercentage: appSettings.depositPercentage ?? 10,
      governorate,
      district: district.trim() || 'القاهرة',
      address: address.trim() || 'عنوان التفاصيل بالطلب',
      location: { lat: 30.0444, lng: 31.2357 },
      rating: 4.9,
      reviewsCount: 1,
      imageUrls: [imageUrl],
      description: description.trim() || 'خدمة فاخرة معتمدة من مالك المنصة بأرقى معايير الجودة.',
      descriptionEn: description.trim() || 'Verified premium service approved by owner.',
      features: ['ضمان الحجز بالكامل', 'إمكانية المعاينة قبل المناسبة', 'دعم المالك المباشر'],
      capacity: capacity || 200,
      vendorId: `vnd-${Date.now()}`,
      vendorName: vName,
      vendorPhone: vPhone,
      availableDates: ['2026-08-20', '2026-08-25', '2026-09-01', '2026-09-10'],
      bookedDates: [],
    };

    if (onAddService) {
      onAddService(newService);
    } else {
      StorageManager.addService(newService);
    }

    // Reset Form
    setTitle('');
    setTitleEn('');
    setPrice(35000);
    setDescription('');
    setCustomVendorName('');
    setCustomVendorPhone('');
    alert('تم إضافة الخدمة وتخصيص مقدم الخدمة المختار بنجاح!');
    setActiveTab('manage_vendors');
  };

  const handleOpenEditVendor = (service: Service) => {
    setEditingService(service);
    const existingPreset = PRESET_VENDORS.find((v) => v.name === service.vendorName);
    if (existingPreset) {
      setEditVendorOption(existingPreset.id);
    } else {
      setEditVendorOption('custom');
      setEditCustomVendorName(service.vendorName);
      setEditCustomVendorPhone(service.vendorPhone);
    }
  };

  const handleSaveVendorChange = () => {
    if (!editingService) return;

    let newVName = 'مكتب المناسبات الملكية';
    let newVPhone = '01012345678';

    if (editVendorOption === 'custom') {
      newVName = editCustomVendorName.trim() || editingService.vendorName;
      newVPhone = editCustomVendorPhone.trim() || editingService.vendorPhone;
    } else {
      const preset = PRESET_VENDORS.find((v) => v.id === editVendorOption);
      if (preset) {
        newVName = preset.name;
        newVPhone = preset.phone;
      }
    }

    const updatedService: Service = {
      ...editingService,
      vendorName: newVName,
      vendorPhone: newVPhone,
    };

    if (onUpdateService) {
      onUpdateService(updatedService);
    } else {
      StorageManager.updateService(updatedService);
    }

    setEditingService(null);
    alert(`تم تعديل وتعيين (${newVName}) كمقدم خدمة لـ "${editingService.title}" بنجاح!`);
  };

  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.vendorName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.district.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const filteredVendorApps = vendorApplications.filter((app) => {
    const matchesFilter = vendorAppFilter === 'all' || app.status === vendorAppFilter;
    const matchesSearch =
      app.userName.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
      app.businessName.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
      app.userPhone.includes(vendorSearchQuery) ||
      app.userEmail.toLowerCase().includes(vendorSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredBookingsList = bookings.filter((b) => {
    const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    const matchesQuery =
      b.clientName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.clientPhone.includes(bookingSearch) ||
      b.serviceName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.id.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 dir-rtl font-sans text-slate-100">
      {/* Top Banner: Owner Status */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shrink-0 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  حساب المالك الوحيد والسوبر أدمن
                </span>
              </div>
              <h2 className="text-2xl font-black mt-1 font-serif text-amber-100 flex items-center gap-2">
                <span>البريد المعتمد:</span>
                <span className="font-mono text-emerald-400 text-xl font-extrabold dir-ltr">mmmmm3332012@gmail.com</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                صلاحيات الشاملة الكاملة: إدارة المستخدمين، اعتماد طلبات مقدمي الخدمات والمكالمات التوثيقية، إضافة الخدمات، التقارير المالية وأكواد الخصم.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>مالك وحيد مؤكد 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>إدارة الحجوزات التدقيقية ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users_roles')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'users_roles'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4 text-purple-400" />
          <span>إدارة حسابات المستخدمين ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vendor_applications')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 relative ${
            activeTab === 'vendor_applications'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Store className="w-4 h-4 text-amber-400" />
          <span>طلبات الانضمام ومكالمات الفيديو ({vendorApplications.length})</span>
          {vendorApplications.filter(a => a.status === 'pending').length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute top-2 left-2" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('add_service')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'add_service'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خدمة جديدة وتعيين مقدمها</span>
        </button>

        <button
          onClick={() => setActiveTab('manage_vendors')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'manage_vendors'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>إدارة وتعديل الخدمات الكلية ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('financial_reports')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'financial_reports'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>التقارير المالية والعمولات الشاملة</span>
        </button>

        <button
          onClick={() => setActiveTab('promos')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'promos'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>أكواد الخصم ({promoCodes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>سياسة الاسترداد وإعدادات المالك</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & BOOKINGS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Pending Vendor Applications Banner */}
          {!isBannerDismissed && vendorApplications.filter(a => a.status === 'pending').length > 0 && (
            <div className="bg-gradient-to-r from-amber-950 via-purple-950 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-200 text-sm font-serif">
                    تنبيه المالك: يوجد ({vendorApplications.filter(a => a.status === 'pending').length}) طلب جديد للانضمام كمقدم خدمة ومكالمة توثيق!
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    قم بفتح قسم "طلبات الانضمام ومكالمات الفيديو" لمراجعة بطاقات الرقم القومي والبيانات وإجراء الاتصال التوثيقي.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('vendor_applications');
                    setIsBannerDismissed(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <span>الانتقال لمراجعة الطلبات ({vendorApplications.filter(a => a.status === 'pending').length})</span>
                  <span>↗</span>
                </button>
                <button
                  onClick={() => setIsBannerDismissed(true)}
                  className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
                  title="إخفاء التنبيه"
                >
                  إخفاء ✕
                </button>
              </div>
            </div>
          )}

          {/* Admin Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl">
              <span className="text-xs text-slate-400 block font-semibold">إجمالي حجوزات المنصة</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">{bookings.length} حجز نشط</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl">
              <span className="text-xs text-slate-400 block font-semibold">إجمالي قيمة الحفلات</span>
              <span className="text-2xl font-black text-white mt-1 block">{totalVolume.toLocaleString()} ج.م</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl">
              <span className="text-xs text-slate-400 block font-semibold">العربونات المجمعة (10%)</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{totalDepositsCollected.toLocaleString()} ج.م</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl">
              <span className="text-xs text-slate-400 block font-semibold">عمولة التطبيق التقديرية ({appSettings.commissionPercentage ?? 2}%)</span>
              <span className="text-2xl font-black text-purple-300 mt-1 block">{platformCommissionEstimate.toLocaleString()} ج.م</span>
            </div>
          </div>

          {/* Full Bookings List with Search, Filter & Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-emerald-300 font-serif flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <span>إدارة وتدقيق جميع الحجوزات وبطاقات الرقم القومي للضمان:</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  إمكانية تعديل حالة الحجز، معالجة طلبات الاسترداد، وتدقيق الوجهين لبطاقة الرقم القومي لكل عميل.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="بحث باسم العميل، الخدمة، أو الهاتف..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none w-64"
                  />
                </div>

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="accepted">عربون مدفوع (مقبول)</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="completed">مكتمل بالكامل</option>
                  <option value="cancelled">ملغي ومسترد</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredBookingsList.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">العميل: {b.clientName}</span>
                      <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                        {b.clientPhone}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        b.status === 'cancelled' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {b.status === 'accepted' ? 'مقبول - تم سداد العربون' :
                         b.status === 'cancelled' ? `ملغي - استرداد ${b.cancellationRefundAmount || 0} ج.م` : 'قيد الانتظار'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400 text-[11px] pt-1 flex-wrap">
                      <span>رقم الحجز: <strong className="text-amber-400 font-mono">#{b.id}</strong></span>
                      <span>الخدمة: <strong className="text-slate-200">{b.serviceName}</strong></span>
                      <span>تاريخ المناسبة: <strong className="text-amber-400 font-bold">{b.date}</strong></span>
                      <span>الإجمالي: <strong className="text-white font-bold">{b.totalPrice.toLocaleString()} ج.م</strong></span>
                      <span>العربون: <strong className="text-emerald-400 font-bold">{b.depositAmount.toLocaleString()} ج.م</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {b.nationalIdFrontUrl && (
                      <button
                        onClick={() => setSelectedNationalIdBooking(b)}
                        className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>تدقيق البطاقة</span>
                      </button>
                    )}

                    {onUpdateBookingStatus && (
                      <select
                        value={b.status}
                        onChange={(e) => onUpdateBookingStatus(b.id, e.target.value as Booking['status'])}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-amber-300 font-bold focus:outline-none"
                      >
                        <option value="pending">قيد المراجعة</option>
                        <option value="accepted">تأكيد العربون (Accepted)</option>
                        <option value="completed">مكتمل النهائي</option>
                        <option value="cancelled">إلغاء واسترداد</option>
                      </select>
                    )}

                    <button
                      onClick={() => handleDeleteBookingClick(b.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-all"
                      title="حذف الحجز"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & VENDOR ROLES MANAGEMENT (FULL USER CRUD) */}
      {activeTab === 'users_roles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold inline-block mb-1">
                التحكم بالصلاحيات والمستخدمين
              </span>
              <h3 className="text-xl font-bold text-amber-200 font-serif flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-purple-400" />
                <span>إدارة وحكم حسابات جميع المستخدمين والشركاء (User CRUD Management)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                إضافة مستخدم جديد، تعديل الحسابات، تحويل أدوار العملاء ومقدمي الخدمات، وحذف الحسابات غير المرغوبة.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مستخدم جديد</span>
              </button>

              <div className="relative w-full sm:w-60 shrink-0">
                <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث باسم، بريد، أو هاتف..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Customer Support Team Management Banner & 5 Accounts Overview */}
          <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-2xl p-5 text-white space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                      تعيين واعتماد المالك المباشر 👑
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-cyan-200 font-serif mt-0.5">
                    حسابات فريق خدمة العملاء والدعم الفني ({users.filter(u => u.role === 'support').length}/5 حسابات)
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setUserRole('support');
                    setIsAddUserModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة ممثل خدمة عملاء جديد</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.filter(u => u.role === 'support').map((supUser, idx) => (
                <div key={supUser.id} className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-start justify-between gap-3 text-xs hover:border-cyan-400 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-200">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] shrink-0 font-mono">
                        #{idx + 1}
                      </span>
                      <span className="truncate max-w-[140px]">{supUser.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 dir-ltr font-mono">{supUser.email}</div>
                    <div className="text-[11px] text-slate-300 font-bold">{supUser.phone}</div>
                    <div className="text-[10px] text-cyan-400/80 pt-0.5">كلمة السر: {supUser.password || '123'}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingUser(supUser)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg"
                      title="تعديل حساب خدمة العملاء"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (onUpdateUserRole) {
                          onUpdateUserRole(supUser.id, 'client');
                          alert(`تم إلغاء تكليف خدمة العملاء للحساب (${supUser.name}) وتحويله إلى عميل.`);
                        }
                      }}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg"
                      title="إلغاء التعيين من خدمة العملاء"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Role Filter Buttons */}
          <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
            <button
              onClick={() => setUserRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                userRoleFilter === 'all' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              الكل ({users.length})
            </button>
            <button
              onClick={() => setUserRoleFilter('client')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                userRoleFilter === 'client' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              العملاء ({users.filter(u => u.role === 'client').length})
            </button>
            <button
              onClick={() => setUserRoleFilter('vendor')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                userRoleFilter === 'vendor' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              مقدمو الخدمات ({users.filter(u => u.role === 'vendor').length})
            </button>
            <button
              onClick={() => setUserRoleFilter('support')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                userRoleFilter === 'support' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-950 text-cyan-300 hover:text-white'
              }`}
            >
              خدمة العملاء ({users.filter(u => u.role === 'support').length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users
              .filter(u => {
                const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                const matchesSearch =
                  u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.phone.toLowerCase().includes(userSearch.toLowerCase());
                return matchesRole && matchesSearch;
              })
              .map((u) => {
                const isOwner = u.email.trim().toLowerCase() === 'mmmmm3332012@gmail.com' || u.email.trim().toLowerCase() === 'mmm3332012@gmail.com';
                return (
                  <div
                    key={u.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-4 hover:border-amber-500/40 transition-all shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-base">{u.name}</span>
                          {isOwner ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-400" />
                              المالك الوحيد
                            </span>
                          ) : u.role === 'support' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold flex items-center gap-1">
                              <PhoneCall className="w-3 h-3 text-cyan-400" />
                              خدمة عملاء معتمد
                            </span>
                          ) : u.role === 'vendor' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold flex items-center gap-1">
                              <Store className="w-3 h-3 text-purple-400" />
                              مقدم خدمة معتمد
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 text-[10px] font-bold flex items-center gap-1">
                              <User className="w-3 h-3 text-amber-400" />
                              عميل
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-slate-400 text-xs pt-1 flex-wrap">
                          <span className="flex items-center gap-1 dir-ltr">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            {u.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            {u.phone}
                          </span>
                        </div>
                      </div>

                      {!isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                            title="تعديل تفاصيل المستخدم"
                          >
                            <Edit3 className="w-4 h-4 text-amber-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteUserClick(u.id, u.email)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all"
                            title="حذف المستخدم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Role Toggle Actions by Owner */}
                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="text-[11px] text-slate-500">
                        المحافظة: {u.governorate || 'القاهرة'} | التسجيل: {u.createdAt || 'جديد'}
                      </span>

                      {isOwner ? (
                        <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          حساب مدير المنصة
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {u.role !== 'support' && (
                            <button
                              onClick={() => {
                                if (onUpdateUserRole) {
                                  onUpdateUserRole(u.id, 'support');
                                  alert(`تم تعيين المستخدم (${u.name}) كـ ممثل خدمة عملاء معتمد من المالك!`);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-cyan-600/20 transition-all"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>تعيين خدمة عملاء</span>
                            </button>
                          )}

                          {u.role === 'client' ? (
                            <button
                              onClick={() => {
                                if (onUpdateUserRole) {
                                  onUpdateUserRole(u.id, 'vendor');
                                  alert(`تم تحويل المستخدم (${u.name}) إلى مقدم خدمة معتمد بنجاح!`);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-purple-600/20 transition-all"
                            >
                              <Store className="w-3 h-3" />
                              <span>تحويل لـ مقدم خدمة</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (onUpdateUserRole) {
                                  onUpdateUserRole(u.id, 'client');
                                  alert(`تم إرجاع حساب (${u.name}) إلى عميل.`);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <User className="w-3 h-3 text-amber-400" />
                              <span>إرجاع كـ عميل</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: VENDOR APPLICATIONS & VERIFICATION CALLS */}
      {activeTab === 'vendor_applications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold inline-block mb-1">
                تدقيق طلبات الانضمام والمكالمات التوثيقية
              </span>
              <h3 className="text-xl font-bold text-amber-200 font-serif flex items-center gap-2">
                <Store className="w-6 h-6 text-amber-400" />
                <span>طلبات الشركاء والمكالمات المرئية المباشرة (Vendor Verification)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                مراجعة بطاقات الرقم القومي، إجراء الاتصال المرئي التوثيقي، تسجيل الملاحظات، واتخاذ قرار الاعتماد أو الرفض مع سبب معلل.
              </p>
            </div>

            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="بحث باسم النشاط، المالك، أو الهاتف..."
                value={vendorSearchQuery}
                onChange={(e) => setVendorSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 text-xs font-bold overflow-x-auto pb-1">
            <button
              onClick={() => setVendorAppFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                vendorAppFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              جميع الطلبات ({vendorApplications.length})
            </button>
            <button
              onClick={() => setVendorAppFilter('pending')}
              className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                vendorAppFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-950 text-amber-300 hover:bg-slate-800'
              }`}
            >
              قيد المراجعة والمكالمة ({vendorApplications.filter((a) => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setVendorAppFilter('approved')}
              className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                vendorAppFilter === 'approved'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-950 text-emerald-300 hover:bg-slate-800'
              }`}
            >
              المقبولة والمعتمدة ({vendorApplications.filter((a) => a.status === 'approved').length})
            </button>
            <button
              onClick={() => setVendorAppFilter('rejected')}
              className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                vendorAppFilter === 'rejected'
                  ? 'bg-rose-500 text-white font-black shadow-lg shadow-rose-500/20'
                  : 'bg-slate-950 text-rose-300 hover:bg-slate-800'
              }`}
            >
              المرفوضة ({vendorApplications.filter((a) => a.status === 'rejected').length})
            </button>
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredVendorApps.map((app) => (
              <div
                key={app.id}
                className={`p-6 rounded-3xl border transition-all ${
                  app.status === 'pending'
                    ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-amber-500/40 shadow-xl'
                    : app.status === 'approved'
                    ? 'bg-slate-950 border-emerald-500/30 opacity-90'
                    : 'bg-slate-950 border-rose-500/30 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-lg text-amber-300 font-serif">{app.businessName}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
                        تصنيف: {app.category === 'hall' ? 'قاعات أفراح' : app.category === 'photographer' ? 'تصوير وسيشن' : app.category === 'makeup' ? 'ميكب آرتيست' : 'خدمات عامة'}
                      </span>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : app.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      }`}>
                        {app.status === 'approved' ? '✓ معتمد ومفعل' : app.status === 'rejected' ? '✕ طلب مرفوض' : '⏱ قيد تدقيق المكالمة'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                      <span>مقدم الطلب: <strong className="text-white">{app.userName}</strong></span>
                      <span>الهاتف: <strong className="text-amber-400 font-mono">{app.userPhone}</strong></span>
                      <span>البريد: <strong className="text-slate-300 font-mono">{app.userEmail}</strong></span>
                      <span>المحافظة: <strong className="text-slate-300">{app.governorate} ({app.district})</strong></span>
                      {app.nationalIdNumber && (
                        <span>الرقم القومي: <strong className="text-emerald-400 font-mono">{app.nationalIdNumber}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Verification & Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => {
                        setActiveVerificationApp(app);
                        setVerificationCallNotes(app.verificationCallNotes || '');
                        setVerificationCallStatus(app.verificationCallStatus || 'completed');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                    >
                      <Video className="w-4 h-4" />
                      <span>المكالمة التوثيقية وتدقيق الهوية</span>
                    </button>

                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveVendorApp(app.id)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shadow-lg shadow-emerald-500/20"
                        >
                          <Check className="w-4 h-4" />
                          <span>قبول واعتماد</span>
                        </button>

                        <button
                          onClick={() => setRejectingAppId(app.id)}
                          className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          <span>رفض الطلب</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <strong className="text-amber-400 block mb-0.5">وصف النشاط والخدمة المُقدّمة:</strong>
                    {app.description}
                  </p>

                  {app.verificationCallNotes && (
                    <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-purple-200">
                      <strong className="text-purple-300 flex items-center gap-1 mb-1 font-bold">
                        <Video className="w-3.5 h-3.5 text-purple-400" />
                        سجل ملاحظات مكالمة التوثيق المرئية للمالك:
                      </strong>
                      <p>{app.verificationCallNotes}</p>
                    </div>
                  )}

                  {app.status === 'rejected' && app.rejectionReason && (
                    <p className="text-rose-300 font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                      سبب الرفض المسجل للعميل: {app.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Inline Rejection Reason Prompt Modal / Input */}
                {rejectingAppId === app.id && (
                  <div className="mt-4 p-4 bg-slate-900 border border-rose-500/50 rounded-2xl space-y-3 animate-in fade-in">
                    <label className="block text-xs font-bold text-rose-300">
                      يرجى كتابة سبب عدم قبول أو توثيق الطلب بعد التواصل:
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionReasonText}
                      onChange={(e) => setRejectionReasonText(e.target.value)}
                      placeholder="مثال: عدم وضوح بطاقة الرقم القومي أو عدم تطابق النشاط في مكالمة الفيديو..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRejectingAppId(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleRejectVendorApp(app.id)}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow"
                      >
                        تأكيد رفض الطلب
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ADD NEW SERVICE & ASSIGN VENDOR */}
      {activeTab === 'add_service' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Plus className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold font-serif text-amber-200">إضافة قاعة أو خدمة جديدة للمنصة</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                بصفتك المالك الوحيد، يمكنك إنشاء الخدمة مباشرة وتخصيص المكتب أو مقدم الخدمة المعتمد لها.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs">
              صلاحية المالك والمشرف
            </span>
          </div>

          <form onSubmit={handleCreateService} className="space-y-4 text-xs">
            {/* Vendor Choice Component */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <label className="block font-bold text-amber-300 text-sm">اختر أو عين مقدم الخدمة لهذه القاعة:</label>
              
              <select
                value={selectedVendorOption}
                onChange={(e) => setSelectedVendorOption(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-amber-500"
              >
                {PRESET_VENDORS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.phone})
                  </option>
                ))}
                <option value="custom">+ تخصيص مقدم خدمة جديد يدوياً</option>
              </select>

              {selectedVendorOption === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">اسم مقدم الخدمة / النشاط:</label>
                    <input
                      type="text"
                      required
                      placeholder="اسم المكتب أو الاستوديو..."
                      value={customVendorName}
                      onChange={(e) => setCustomVendorName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">رقم هاتف التواصل للخدمة:</label>
                    <input
                      type="text"
                      required
                      placeholder="010XXXXXXXX"
                      value={customVendorPhone}
                      onChange={(e) => setCustomVendorPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">عنوان الخدمة (بالعربية):</label>
                <input
                  type="text"
                  required
                  placeholder="قاعة اللؤلؤة للعرائس"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">عنوان الخدمة (بالإنجليزية):</label>
                <input
                  type="text"
                  placeholder="Pearl Ballroom"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">تصنيف الخدمة:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Service['category'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="hall">قاعات الأفراح والاحتفالات</option>
                  <option value="photographer">التصوير والسيشن</option>
                  <option value="decor">الديكور والكوشة</option>
                  <option value="catering">الكاترينج والبوفيه</option>
                  <option value="music">الدي جي والفرق الموسيقية</option>
                  <option value="makeup">الميكب آرتيست والجمال</option>
                  <option value="cafe_restaurant">حجز الكافيهات والمطاعم</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">السعر الإجمالي (جنيه):</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">المحافظة:</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value as Service['governorate'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="cairo">القاهرة</option>
                  <option value="giza">الجيزة</option>
                  <option value="qalyubia">القليوبية</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">المنطقة / الحي:</label>
                <input
                  type="text"
                  placeholder="المعادي / التجمع / الهرم..."
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">رابط صورة المعاينة:</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">وصف وتفاصيل الخدمة:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تفاصيل العرض والمميزات المرفقة مع إمكانية التنسيق..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>إضافة الخدمة واعتماد مقدم الخدمة المختار</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: MANAGE SERVICES & REASSIGN VENDORS (FULL SERVICE CRUD) */}
      {activeTab === 'manage_vendors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-amber-300 font-serif flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <span>إدارة الخدمات والشركاء (Full Service CRUD Panel)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تعديل الأسعار والمواقع والوصف بالكامل، تغيير مقدمي الخدمات، وحذف الخدمات غير المتاحة.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="بحث باسم الخدمة أو مقدمها..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((srv) => (
              <div key={srv.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div>
                  <div className="flex items-start gap-3">
                    <img src={srv.imageUrls[0]} alt={srv.title} className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                          {srv.district}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingFullService(srv)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg"
                            title="تعديل تفاصيل الخدمة بالكامل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteServiceClick(srv.id, srv.title)}
                            className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg"
                            title="حذف الخدمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-white truncate mt-1" title={srv.title}>{srv.title}</h4>
                      <p className="text-xs text-amber-400 font-bold">{srv.price.toLocaleString()} ج.م</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs mt-3">
                    <span className="text-[10px] text-slate-400 block font-bold">مقدم الخدمة المعتمد حالياً:</span>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{srv.vendorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{srv.vendorPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setEditingFullService(srv)}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>تعديل الشامل</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditVendor(srv)}
                    className="py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>تغيير الشريك</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: COMPREHENSIVE FINANCIAL REPORTING & ANALYTICS */}
      {activeTab === 'financial_reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold font-serif text-amber-200">التقارير والتحليلات المالية والعمولات</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                توزيع الإيرادات بحسب الأقسام والمحافظات، حساب عمولة التطبيق (2%) وصافي مستحقات مقدمي الخدمات.
              </p>
            </div>

            <button
              onClick={() => alert('تم تصدير التقرير المالي الشامل بنجاح إلى ملف CSV/Excel!')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تصدير التقرير المالي (Export CSV)</span>
            </button>
          </div>

          {/* Key Executive Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-bold">إجمالي الحجم (Gross Volume)</span>
              <span className="text-lg font-black text-white mt-1 block">{totalVolume.toLocaleString()} ج.م</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-bold">إجمالي العربونات (Deposits)</span>
              <span className="text-lg font-black text-emerald-400 mt-1 block">{totalDepositsCollected.toLocaleString()} ج.م</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-bold">المبالغ المستحقة (Remaining)</span>
              <span className="text-lg font-black text-amber-300 mt-1 block">{totalRemainingBalance.toLocaleString()} ج.م</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-purple-500/30 bg-purple-950/20">
              <span className="text-[11px] text-purple-300 block font-bold">عمولة المنصة ({appSettings.commissionPercentage ?? 2}%)</span>
              <span className="text-lg font-black text-purple-200 mt-1 block">{platformCommissionEstimate.toLocaleString()} ج.م</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
              <span className="text-[11px] text-emerald-300 block font-bold">مستحقات الشركاء بعد العمولة</span>
              <span className="text-lg font-black text-emerald-200 mt-1 block">{vendorPayoutsTotal.toLocaleString()} ج.م</span>
            </div>
          </div>

          {/* Revenue Breakdown by Category and Governorate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Category Revenue Breakdown */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>توزيع المبيعات بحسب الأقسام والتصنيفات:</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                {Object.entries(categoryRevenueMap).map(([catKey, amount]) => {
                  const pct = totalVolume > 0 ? Math.round((amount / totalVolume) * 100) : 0;
                  const catLabel = catKey === 'hall' ? 'قاعات أفراح' : catKey === 'photographer' ? 'تصوير وسيشن' : catKey === 'makeup' ? 'ميكب آرتيست' : catKey === 'music' ? 'دي جي وزفة' : catKey;
                  return (
                    <div key={catKey} className="space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-200">{catLabel}</span>
                        <span className="text-amber-400">{amount.toLocaleString()} ج.م ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Governorate Breakdown */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>توزيع المبيعات بحسب المحافظات:</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                {Object.entries(govRevenueMap).map(([govKey, amount]) => {
                  const pct = totalVolume > 0 ? Math.round((amount / totalVolume) * 100) : 0;
                  const govLabel = govKey === 'cairo' ? 'محافظة القاهرة' : govKey === 'giza' ? 'محافظة الجيزة' : 'محافظة القليوبية';
                  return (
                    <div key={govKey} className="space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-200">{govLabel}</span>
                        <span className="text-emerald-400">{amount.toLocaleString()} ج.م ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PROMO CODES */}
      {activeTab === 'promos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-amber-300 font-serif flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-400" />
              <span>إدارة وإنشاء أكواد الخصم والبروموكود (حصري للمالك)</span>
            </h3>
            <span className="text-xs bg-slate-800 text-amber-300 px-3 py-1 rounded-full border border-slate-700 font-bold">
              {promoCodes.length} كود خصم فعّال
            </span>
          </div>

          {/* Add Promo Code Form */}
          <form onSubmit={handleCreatePromoCode} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-[11px] text-slate-400 block font-bold mb-1">رمز كود الخصم:</label>
              <input
                type="text"
                placeholder="مثال: OWNER2026"
                value={promoCodeName}
                onChange={(e) => setPromoCodeName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block font-bold mb-1">نسبة الخصم (%):</label>
              <input
                type="number"
                min="1"
                max="90"
                value={promoDiscount}
                onChange={(e) => setPromoDiscount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block font-bold mb-1">وصف العرض:</label>
              <input
                type="text"
                placeholder="خصم خاص من المالك"
                value={promoDesc}
                onChange={(e) => setPromoDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة كود الخصم</span>
              </button>
            </div>
          </form>

          {/* Existing Promo Codes List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {promoCodes.map((p) => (
              <div key={p.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-amber-300 text-sm block">{p.code}</span>
                  <span className="text-slate-400 text-[11px]">{p.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    -{p.discountPercentage}%
                  </span>
                  <button
                    onClick={() => handleDeletePromoCodeClick(p.id)}
                    className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg"
                    title="حذف كود الخصم"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: OWNER SETTINGS & REFUND POLICY */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold font-serif text-amber-200">إعدادات المالك وسياسة الاسترداد والإلغاء</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                تحديد القواعد المالية الرسمية للمنصة، نسبة استرداد العربون للعميل، ومواعيد استحقاق المبالغ المتبقية.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
              سياسة نشطة ومطبقة
            </span>
          </div>

          {saveSuccessMsg && (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>تم حفظ وتطبيق سياسة الاسترداد وإعدادات المنصة بنجاح!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Setting 1: Refund Percentage */}
            <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>نسبة استرداد العربون عند إلغاء الحجز (%):</span>
                </label>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {appSettings.refundPercentage}%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                النسبة المئوية التي يستردها العميل من مبلغ العربون (10%) عند إلغاء حجزه من حسابه.
              </p>
              <div className="flex items-center gap-4 pt-1">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={appSettings.refundPercentage}
                  onChange={(e) => setAppSettings({ ...appSettings, refundPercentage: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={appSettings.refundPercentage}
                  onChange={(e) => setAppSettings({ ...appSettings, refundPercentage: Number(e.target.value) })}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-center font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Setting 2: Deposit Percentage & Cancellation Notice Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                <label className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span>نسبة العربون المطلوب عند الحجز (%):</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={appSettings.depositPercentage}
                  onChange={(e) => setAppSettings({ ...appSettings, depositPercentage: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-400 block">العربون الأساسي المقتطع للخدمة المستقلة (10% حالياً)</span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                <label className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>مهلة سداد المبلغ المتبقي (أيام قبل المناسبة):</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={appSettings.cancellationNoticeDays}
                  onChange={(e) => setAppSettings({ ...appSettings, cancellationNoticeDays: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-400 block">أيام استحقاق سداد الـ 90% المتبقية قبل تاريخ الحفل</span>
              </div>
            </div>

            {/* Setting 3: Platform Commission Percentage */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-purple-400" />
                <span>نسبة عمولة التطبيق / المنصة (%):</span>
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={appSettings.commissionPercentage ?? 2}
                onChange={(e) => setAppSettings({ ...appSettings, commissionPercentage: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-purple-200 font-mono font-bold focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-400 block">نسبة عمولة منصة مناسباتي مصر من إجمالي الحجوزات (تم خفضها لـ 2%)</span>
            </div>

            {/* Setting 4: Owner Official Email */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>البريد المعتمد للمالك والمدير الوحيد:</span>
              </label>
              <input
                type="email"
                value={appSettings.ownerEmail}
                onChange={(e) => setAppSettings({ ...appSettings, ownerEmail: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500 dir-ltr"
              />
              <span className="text-[10px] text-slate-400 block">البريد الإلكتروني ذو الصلاحيات المطلقة الشاملة</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>حفظ وتطبيق سياسة الاسترداد وإعدادات المالك</span>
            </button>
          </form>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>إضافة مستخدم جديد إلى النظام</span>
              </h4>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">الاسم بالكامل:</label>
                <input
                  type="text"
                  required
                  placeholder="محمد أحمد"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  required
                  placeholder="user@gmail.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 dir-ltr"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  required
                  placeholder="010XXXXXXXX"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">كلمة السر:</label>
                <input
                  type="text"
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نوع الدور:</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="client">عميل (Client)</option>
                    <option value="support">خدمة عملاء (Customer Support)</option>
                    <option value="vendor">مقدم خدمة (Vendor)</option>
                    <option value="admin">مدير أدمن (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المحافظة:</label>
                  <select
                    value={userGov}
                    onChange={(e) => setUserGov(e.target.value as UserProfile['governorate'])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="cairo">القاهرة</option>
                    <option value="giza">الجيزة</option>
                    <option value="qalyubia">القليوبية</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl shadow">إضافة الحساب</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>تعديل تفاصيل حساب المستخدم #{editingUser.id}</span>
              </h4>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المستخدم:</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 dir-ltr"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  required
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الدور والصلاحية:</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="client">عميل (Client)</option>
                  <option value="support">خدمة عملاء (Customer Support)</option>
                  <option value="vendor">مقدم خدمة (Vendor)</option>
                  <option value="admin">أدمن مدير (Admin)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-black rounded-xl shadow">حفظ التعديلات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Full Service Edit Modal */}
      {editingFullService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>تعديل الشامل للخدمة: {editingFullService.title}</span>
              </h4>
              <button onClick={() => setEditingFullService(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveFullServiceEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم الخدمة (عربي):</label>
                  <input
                    type="text"
                    required
                    value={editingFullService.title}
                    onChange={(e) => setEditingFullService({ ...editingFullService, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم الخدمة (E):</label>
                  <input
                    type="text"
                    value={editingFullService.titleEn}
                    onChange={(e) => setEditingFullService({ ...editingFullService, titleEn: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">السعر الإجمالي (ج.م):</label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={editingFullService.price}
                    onChange={(e) => setEditingFullService({ ...editingFullService, price: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المحافظة:</label>
                  <select
                    value={editingFullService.governorate}
                    onChange={(e) => setEditingFullService({ ...editingFullService, governorate: e.target.value as Service['governorate'] })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="cairo">القاهرة</option>
                    <option value="giza">الجيزة</option>
                    <option value="qalyubia">القليوبية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المنطقة / الحي:</label>
                  <input
                    type="text"
                    value={editingFullService.district}
                    onChange={(e) => setEditingFullService({ ...editingFullService, district: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم الشريك / مقدم الخدمة:</label>
                  <input
                    type="text"
                    value={editingFullService.vendorName}
                    onChange={(e) => setEditingFullService({ ...editingFullService, vendorName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم هاتف الشريك:</label>
                  <input
                    type="text"
                    value={editingFullService.vendorPhone}
                    onChange={(e) => setEditingFullService({ ...editingFullService, vendorPhone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">رابط الصورة الرئيسي:</label>
                <input
                  type="text"
                  value={editingFullService.imageUrls[0] || ''}
                  onChange={(e) => setEditingFullService({ ...editingFullService, imageUrls: [e.target.value] })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الوصف الكامل:</label>
                <textarea
                  rows={3}
                  value={editingFullService.description}
                  onChange={(e) => setEditingFullService({ ...editingFullService, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setEditingFullService(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-black rounded-xl shadow">حفظ التعديلات الكاملة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Verification Call & Candidate Details Modal */}
      {activeVerificationApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Video className="w-5 h-5 text-purple-400" />
                <span>تدقيق ومكالمة التوثيق المرئية: "{activeVerificationApp.businessName}"</span>
              </div>
              <button onClick={() => setActiveVerificationApp(null)} className="text-slate-400 hover:text-white text-xs font-bold">إغلاق ✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <p className="text-slate-400">اسم صاحب الطلب:</p>
                <p className="font-bold text-white text-sm">{activeVerificationApp.userName}</p>
              </div>
              <div>
                <p className="text-slate-400">رقم هاتف التواصل:</p>
                <p className="font-bold text-amber-400 font-mono text-sm">{activeVerificationApp.userPhone}</p>
              </div>
              <div>
                <p className="text-slate-400">البريد الإلكتروني:</p>
                <p className="font-bold text-slate-200 dir-ltr font-mono">{activeVerificationApp.userEmail}</p>
              </div>
              <div>
                <p className="text-slate-400">الرقم القومي:</p>
                <p className="font-bold text-emerald-400 font-mono">{activeVerificationApp.nationalIdNumber || 'غير مدخل'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-400">عنوان المقر أو القاعة:</p>
                <p className="font-bold text-white">{activeVerificationApp.address || activeVerificationApp.district}</p>
              </div>
            </div>

            {/* Verification Call Launcher */}
            <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-purple-400" />
                  غرفة الاتصال المرئي المباشر للتوثيق
                </span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
                  اتصال آمن ومُشفّر
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`https://meet.jit.si/munasabati-verification-${activeVerificationApp.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <Video className="w-4 h-4" />
                  <span>بدء مكالمة الفيديو التوثيقية الآن</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => window.open(`tel:${activeVerificationApp.userPhone}`)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>اتصال هاتفي مباشر ({activeVerificationApp.userPhone})</span>
                </button>
              </div>
            </div>

            {/* Log Verification Notes Form */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-300">سجل وتوثيق نتائج مكالمة التحقق للشخصية والخدمة:</label>
              <textarea
                rows={3}
                value={verificationCallNotes}
                onChange={(e) => setVerificationCallNotes(e.target.value)}
                placeholder="سجل انطباع المالك: تم التأكد من هوية الشخصية والبطاقة، تم الاطلاع على صور القاعة، التوافق مع الشروط..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={handleSaveVerificationCall}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs"
              >
                حفظ الملاحظات فقط
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejectingAppId(activeVerificationApp.id)}
                  className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold text-xs"
                >
                  رفض الطلب
                </button>

                <button
                  onClick={() => handleApproveVendorApp(activeVerificationApp.id)}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>قبول واعتماد المورد</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Edit Vendor Reassignment Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <UserCheck className="w-5 h-5" />
                <span>تعيين مقدم خدمة لـ "{editingService.title}"</span>
              </div>
              <button onClick={() => setEditingService(null)} className="text-slate-400 hover:text-white text-xs font-bold">إلغاء</button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-300">اختر مقدم الخدمة الجديد:</label>

              <select
                value={editVendorOption}
                onChange={(e) => setEditVendorOption(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-amber-500"
              >
                {PRESET_VENDORS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.phone})
                  </option>
                ))}
                <option value="custom">+ تخصيص مقدم خدمة جديد</option>
              </select>

              {editVendorOption === 'custom' && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">اسم مقدم الخدمة:</label>
                    <input
                      type="text"
                      placeholder="اسم المكتب أو مقدم الخدمة"
                      value={editCustomVendorName}
                      onChange={(e) => setEditCustomVendorName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">رقم الهاتف:</label>
                    <input
                      type="text"
                      placeholder="010XXXXXXXX"
                      value={editCustomVendorPhone}
                      onChange={(e) => setEditCustomVendorPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button onClick={() => setEditingService(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">إلغاء</button>
              <button onClick={handleSaveVendorChange} className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl font-black text-xs shadow-lg shadow-amber-500/20">
                حفظ مقدم الخدمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. National ID Viewer Modal */}
      {selectedNationalIdBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FileCheck className="w-5 h-5" />
                <span>تدقيق بطاقة الرقم القومي لحجز #{selectedNationalIdBooking.id}</span>
              </div>
              <button onClick={() => setSelectedNationalIdBooking(null)} className="text-slate-400 hover:text-white text-sm font-bold">إغلاق</button>
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <p>اسم العميل: <strong className="text-white">{selectedNationalIdBooking.clientName}</strong></p>
              <p>رقم الهاتف: <strong className="text-white">{selectedNationalIdBooking.clientPhone}</strong></p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400 block">صورة بطاقة الرقم القومي (الوجه):</span>
                <img
                  src={selectedNationalIdBooking.nationalIdFrontUrl}
                  alt="Front ID"
                  className="w-full h-40 rounded-xl object-cover border border-slate-700 shadow"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400 block">صورة بطاقة الرقم القومي (الظهر):</span>
                <img
                  src={selectedNationalIdBooking.nationalIdBackUrl}
                  alt="Back ID"
                  className="w-full h-40 rounded-xl object-cover border border-slate-700 shadow"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>البطاقة متوافقة وتأكيد حجز العميل للضمان الأمني.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
