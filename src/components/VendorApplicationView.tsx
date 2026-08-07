import React, { useState, useEffect } from 'react';
import { UserProfile, ServiceCategory, Governorate, VendorApplication, Language } from '../types';
import { StorageManager } from '../lib/storage';
import { 
  Store, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Upload, 
  Sparkles, 
  Phone, 
  MapPin, 
  Award, 
  FileText, 
  Send, 
  Building2, 
  UserCheck, 
  AlertCircle,
  Camera,
  Layers,
  ArrowRight,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Plus,
  Trash2,
  Calendar,
  Mic,
  VideoOff,
  MicOff
} from 'lucide-react';

interface VendorApplicationViewProps {
  currentUser: UserProfile | null;
  onApplicationSubmitted?: () => void;
  onSwitchToVendorRole?: () => void;
  language?: Language;
}

export const VendorApplicationView: React.FC<VendorApplicationViewProps> = ({
  currentUser,
  onApplicationSubmitted,
  onSwitchToVendorRole,
}) => {
  const [existingApp, setExistingApp] = useState<VendorApplication | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('hall');
  const [governorate, setGovernorate] = useState<Governorate>('cairo');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [description, setDescription] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [nationalIdFrontUrl, setNationalIdFrontUrl] = useState('');
  const [nationalIdBackUrl, setNationalIdBackUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Full Service Photos & Verification Call
  const [servicePhotos, setServicePhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [verificationCallDate, setVerificationCallDate] = useState('2026-08-08');
  const [verificationCallTime, setVerificationCallTime] = useState('07:00 مساءً');
  const [isLiveCallModalOpen, setIsLiveCallModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      const app = StorageManager.getUserVendorApplication(currentUser.id);
      setExistingApp(app);
      if (app) {
        setBusinessName(app.businessName);
        setCategory(app.category);
        setGovernorate(app.governorate);
        setDistrict(app.district);
        setAddress(app.address);
        setPhone(app.userPhone);
        setDescription(app.description);
        setExperienceYears(app.experienceYears || 3);
        setNationalIdNumber(app.nationalIdNumber || '');
        setNationalIdFrontUrl(app.nationalIdFrontUrl || '');
        setNationalIdBackUrl(app.nationalIdBackUrl || '');
        setPortfolioUrl(app.portfolioUrl || '');
        if (app.servicePhotos && app.servicePhotos.length > 0) {
          setServicePhotos(app.servicePhotos);
        }
        if (app.verificationCallDate) setVerificationCallDate(app.verificationCallDate);
        if (app.verificationCallTime) setVerificationCallTime(app.verificationCallTime);
      } else {
        setPhone(currentUser.phone || '');
      }
    }
  }, [currentUser]);

  const handleAddServicePhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setServicePhotos((prev) => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
  };

  const handleRemoveServicePhoto = (index: number) => {
    setServicePhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!currentUser) {
      setFormError('يرجى تسجيل الدخول أولاً للتمكن من تقديم طلب الانضمام كمقدم خدمة.');
      return;
    }

    if (!businessName.trim() || !district.trim() || !address.trim() || !phone.trim() || !description.trim()) {
      setFormError('يرجى ملء كافة البيانات المطلوبة للطلب.');
      return;
    }

    if (servicePhotos.length === 0) {
      setFormError('يرجى إرفاق صورة واحدة على الأقل من صور الخدمة أو القاعة.');
      return;
    }

    const newApp: VendorApplication = {
      id: existingApp ? existingApp.id : 'vapp-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: phone.trim(),
      businessName: businessName.trim(),
      category,
      governorate,
      district: district.trim(),
      address: address.trim(),
      description: description.trim(),
      experienceYears,
      nationalIdNumber: nationalIdNumber.trim(),
      nationalIdFrontUrl: nationalIdFrontUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      nationalIdBackUrl: nationalIdBackUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      portfolioUrl: portfolioUrl.trim(),
      servicePhotos,
      verificationCallDate,
      verificationCallTime,
      verificationCallStatus: 'scheduled',
      verificationCallRoomUrl: `https://meet.munasabati.eg/verify-${currentUser.id}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    StorageManager.submitVendorApplication(newApp);
    setExistingApp(newApp);
    setIsEditing(false);
    setSuccessMsg('تم إرسال طلب الانضمام وصور الخدمة وموعد المكالمة التوثيقية بنجاح إلى المالك (إدارة المنصة)! يمكنك الانضمام للمكالمة في الموعد المحدد.');
    if (onApplicationSubmitted) {
      onApplicationSubmitted();
    }
  };

  const getCategoryLabel = (cat: ServiceCategory) => {
    switch (cat) {
      case 'hall': return 'قاعة أفراح / مناسبات';
      case 'photographer': return 'ستوديو وتصوير سينمائي';
      case 'decor': return 'ديكورات وتصميم كوشة';
      case 'catering': return 'بوفيه مفتوح وكاترينج';
      case 'music': return 'فرقة موسيقية وفرقة زفة / دي جي';
      case 'makeup': return 'أتيليه وميك أب آرتيست';
      case 'cafe_restaurant': return 'كافيه ومطعم للمناسبات';
      default: return 'خدمة مناسبات';
    }
  };

  const getGovLabel = (gov: Governorate) => {
    switch (gov) {
      case 'cairo': return 'القاهرة';
      case 'giza': return 'الجيزة';
      case 'qalyubia': return 'القليوبية';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 p-6 sm:p-10 rounded-3xl border border-purple-500/30 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs">
            <Store className="w-4 h-4 text-purple-400" />
            <span>برنامج انضمام الشركاء ومقدمي الخدمات</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-serif text-amber-200">
            قدم الآن وانضم كـ "مقدم خدمة معتمد" في مناسباتي مصر
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            هل تملك قاعة أفراح، استوديو تصوير، أتيليه ميك أب، فرقة موسيقية، كافيه، أو شركة كاترينج وديكور؟ ابدأ باستقبال حجوزاتك مباشرة من آلاف العملاء في القاهرة والجيزة والقليوبية ونظّم عملك بسهولة.
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-purple-500/20 text-xs font-semibold">
            <div className="flex items-center gap-2.5 bg-slate-950/60 p-3 rounded-2xl border border-purple-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>نظام حجز إلكتروني مؤكد بعربون 10%</span>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-950/60 p-3 rounded-2xl border border-purple-500/20">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span>ضمان حماية المالي للطرفين ببطاقة الرقم القومي</span>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-950/60 p-3 rounded-2xl border border-purple-500/20">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <span>لوحة تحكم كاملة لإدارة المواعيد والأسعار</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {formError && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Existing Application Banner & Status */}
      {existingApp && !isEditing && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold">حالة طلب الانضمام المقدم:</span>
              <h3 className="text-xl font-bold font-serif text-amber-200">
                {existingApp.businessName}
              </h3>
            </div>

            <div>
              {existingApp.status === 'pending' && (
                <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 shadow-lg">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>طلبك قيد المراجعة والتدقيق بواسطة الإدارة</span>
                </div>
              )}

              {existingApp.status === 'approved' && (
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تم قبول الطلب واعتمادك كمقدم خدمة!</span>
                </div>
              )}

              {existingApp.status === 'rejected' && (
                <div className="px-4 py-2 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-2 shadow-lg">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>تم رفض الطلب</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] font-bold">تخصص الخدمة:</span>
              <span className="font-bold text-amber-300 block">{getCategoryLabel(existingApp.category)}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] font-bold">المحافظة والمنطقة:</span>
              <span className="font-bold text-white block">{getGovLabel(existingApp.governorate)} - {existingApp.district}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] font-bold">رقم الهاتف والواتساب:</span>
              <span className="font-bold text-emerald-400 block dir-ltr font-mono">{existingApp.userPhone}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] font-bold">رقم بطاقة الرقم القومي:</span>
              <span className="font-bold text-slate-300 block dir-ltr font-mono">{existingApp.nationalIdNumber || 'تم الإرفاق'}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] font-bold">سنوات الخبرة:</span>
              <span className="font-bold text-purple-300 block">{existingApp.experienceYears} سنوات</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] font-bold">تاريخ تقديم الطلب:</span>
              <span className="font-bold text-slate-400 block dir-ltr font-mono">{existingApp.createdAt}</span>
            </div>
          </div>

          {/* Verification Video Call Status Card */}
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-950 to-indigo-950/80 p-5 rounded-2xl border border-purple-500/40 text-xs text-white space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-300 text-sm font-serif">المكالمة التوثيقية المباشرة مع مالك المنصة</h4>
                  <p className="text-slate-300 text-[11px]">
                    موعد المكالمة المباشرة: <span className="font-bold text-purple-300 dir-ltr inline-block">{existingApp.verificationCallDate || verificationCallDate} الساعة {existingApp.verificationCallTime || verificationCallTime}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLiveCallModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all shrink-0 animate-pulse"
              >
                <Video className="w-4 h-4 text-emerald-400" />
                <span>الانضمام للمكالمة التوثيقية المباشرة (فيديو لايف)</span>
              </button>
            </div>
          </div>

          {/* Service Photos Gallery View */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-slate-300 block text-xs font-bold flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>معرض صور الخدمة الكاملة المرفقة بالطلب ({existingApp.servicePhotos?.length || servicePhotos.length} صورة):</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {(existingApp.servicePhotos || servicePhotos).map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video">
                  <img src={img} alt={`Service ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                  <span className="absolute bottom-1 right-1 bg-slate-950/80 text-[10px] text-amber-300 px-1.5 py-0.5 rounded font-mono">صورة #{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 block text-[10px] font-bold">وصف النشاط والخدمات:</span>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{existingApp.description}</p>
          </div>

          {/* Action Buttons based on status */}
          <div className="pt-2 flex flex-wrap gap-3">
            {existingApp.status === 'approved' && onSwitchToVendorRole && (
              <button
                onClick={onSwitchToVendorRole}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-purple-500/20 flex items-center gap-2 transition-all"
              >
                <Store className="w-4 h-4" />
                <span>الانتقال فوراً إلى لوحة تحكم مقدم الخدمات</span>
              </button>
            )}

            {existingApp.status === 'rejected' && existingApp.rejectionReason && (
              <div className="w-full p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 space-y-1">
                <span className="font-bold block text-rose-400">سبب الرفض الموضح من الإدارة:</span>
                <p>{existingApp.rejectionReason}</p>
              </div>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all"
            >
              تعديل بيانات الطلب وإعادة التقديم
            </button>
          </div>
        </div>
      )}

      {/* Form Section (if no application yet or editing) */}
      {(!existingApp || isEditing) && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <h3 className="text-xl font-bold font-serif text-amber-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>استمارة تقديم طلب الانضمام كشركاء ومقدمي خدمات</span>
            </h3>
            <p className="text-xs text-slate-400">
              يرجى إدخال البيانات بدقة لضمان الاعتماد والموافقة الفورية من إدارة منصة مناسباتي مصر.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field Group 1: Business Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  اسم النشاط التجاري / الخدمة (اسم القاعة / الستوديو / الأتيليه) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قاعة الجراند بالاس / ستوديو لقطات لايف"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  تخصص الخدمة الرئيسي *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="hall">قاعات أفراح ومناسبات</option>
                  <option value="photographer">مصور فوتوغرافي وسيشن فيديو</option>
                  <option value="decor">ديكورات وكوشة الزفاف</option>
                  <option value="catering">بوفيه مفتوح وخدمات كاترينج</option>
                  <option value="music">دي جي وفرقة زفة / فرقة موسيقية</option>
                  <option value="makeup">ميك أب آرتيست وأتيليه فساتين</option>
                  <option value="cafe_restaurant">كافيهات ومطاعم للمناسبات</option>
                </select>
              </div>
            </div>

            {/* Field Group 2: Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">المحافظة *</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value as Governorate)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="cairo">القاهرة</option>
                  <option value="giza">الجيزة</option>
                  <option value="qalyubia">القليوبية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">المنطقة / الحي *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: المعادي / الدقي / بنها"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">العنوان التفصيلي *</label>
                <input
                  type="text"
                  required
                  placeholder="شارع النصر، بجوار..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Field Group 3: Phone & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">رقم الهاتف والواتساب *</label>
                <input
                  type="text"
                  required
                  placeholder="010XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">سنوات الخبرة في مجال المناسبات</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">رقم بطاقة الرقم القومي (14 رقم)</label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="29XXXXXXXXXXXX"
                  value={nationalIdNumber}
                  onChange={(e) => setNationalIdNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 dir-ltr font-mono"
                />
              </div>
            </div>

            {/* Description & Portfolio */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">وصف تفصيلي للخدمات والعروض المتاحة *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="اكتب نبذة عن التجهيزات، السعة، الأنظمة الصوتية، الماركات المستخدمة، أو العروض المتاحة..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">رابط معرض الأعمال / صفحة الفيسبوك أو الإنستجرام (اختياري)</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/your-page"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 dir-ltr"
                />
              </div>
            </div>

            {/* Full Service Photos Gallery Section */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <label className="text-xs font-bold text-amber-300 font-serif flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>صور الخدمة أو القاعة بكافة تفاصيلها (إجباري) *</span>
                </label>
                <span className="text-[10px] text-slate-400">{servicePhotos.length} صور مضافة</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                ارفع أو أضف روابط لصور توضح القاعة، الكوشة، الإضاءات، بوفيه الأكل، أجهزة الدي جي أو السيشنات للتحقق وتحديد جودة الخدمة.
              </p>

              {/* Photo Upload Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {servicePhotos.map((photo, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video">
                    <img src={photo} alt={`Service ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveServicePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg transition-all"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 text-[9px] bg-slate-950/80 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                      صورة #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Custom Photo Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="url"
                  placeholder="ضع رابط صورة جديد (مثال: https://images.unsplash.com/...)"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddServicePhoto}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة صورة</span>
                </button>
              </div>
            </div>

            {/* Verification Video Call Schedule Section */}
            <div className="bg-gradient-to-r from-purple-950/60 via-slate-950 to-indigo-950/60 p-5 rounded-2xl border border-purple-500/40 space-y-4">
              <div className="flex items-center gap-2 border-b border-purple-500/30 pb-2">
                <Video className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-xs font-bold text-amber-200 font-serif">حجز موعد المكالمة التوثيقية المباشرة مع المالك *</h4>
                  <p className="text-[10px] text-slate-300">مكالمة فيديو سريعة (5 دقائق) عبر المنصة للتحقق من شخصية مقدم الخدمة واعتماد الحساب.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">تاريخ المكالمة التوثيقية المفضل *</label>
                  <input
                    type="date"
                    required
                    value={verificationCallDate}
                    onChange={(e) => setVerificationCallDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">توقيت المكالمة المفضل *</label>
                  <select
                    value={verificationCallTime}
                    onChange={(e) => setVerificationCallTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold text-purple-200"
                  >
                    <option value="04:00 مساءً">04:00 مساءً</option>
                    <option value="06:00 مساءً">06:00 مساءً</option>
                    <option value="07:00 مساءً">07:00 مساءً</option>
                    <option value="08:00 مساءً">08:00 مساءً</option>
                    <option value="09:00 مساءً">09:00 مساءً</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Terms and Declarations */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  أقر بصحة البيانات وإرفاق بطاقة الرقم القومي وصور الخدمة الصحيحة، وألتزم بالحضور في موعد المكالمة التوثيقية مع مالك المنصة واستلام العربون (10%) وفقاً للشروط والأحكام الرسمية.
                </p>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end gap-3 pt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl"
                >
                  إلغاء التعديل
                </button>
              )}

              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs rounded-2xl shadow-xl shadow-purple-500/20 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>إرسال طلب الانضمام المباشر للإدارة</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interactive Verification Video Call Simulator Modal */}
      {isLiveCallModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 text-white space-y-4 shadow-2xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-sm text-amber-200 font-serif">
                  المكالمة التوثيقية المباشرة (غرفة التحقق بالفيديو)
                </h3>
              </div>

              <span className="text-[10px] bg-purple-950 border border-purple-700 text-purple-300 px-2.5 py-1 rounded-full font-mono">
                ROOM: MUN-VERIFY-2026
              </span>
            </div>

            {/* Video Streams Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Owner / Admin Stream */}
              <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden aspect-video flex flex-col items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
                  alt="Owner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 border border-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>المالك (إدارة المنصة - mmmmm3332012@gmail.com)</span>
                </div>
              </div>

              {/* Vendor Self Stream */}
              <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden aspect-video flex flex-col items-center justify-center">
                {isVideoOff ? (
                  <div className="text-center space-y-2 text-slate-500">
                    <VideoOff className="w-8 h-8 mx-auto text-slate-600" />
                    <span className="text-[10px] block">الكاميرا متوقفة مؤقتاً</span>
                  </div>
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                    alt="Vendor"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 right-2 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-slate-800 flex items-center gap-1">
                  <Store className="w-3 h-3 text-purple-400" />
                  <span>أنـت (مقدم الخدمة المتقدم)</span>
                </div>
              </div>
            </div>

            {/* Call Controls Bar */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-2xl font-bold transition-all ${
                  isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title="كتم الصوت"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-2xl font-bold transition-all ${
                  isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title="إيقاف الكاميرا"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsLiveCallModalOpen(false)}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>إنهاء المكالمة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
