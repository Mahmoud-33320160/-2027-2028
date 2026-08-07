import React, { useState } from 'react';
import { Service, Booking, PromoCode, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { Store, Plus, Calendar, CheckCircle2, XCircle, Tag, DollarSign, Image as ImageIcon, MapPin, Edit3 } from 'lucide-react';

interface VendorPanelProps {
  services: Service[];
  bookings: Booking[];
  promoCodes: PromoCode[];
  language: Language;
  onAddService: (service: Service) => void;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onAddPromoCode: (promo: PromoCode) => void;
}

export const VendorPanel: React.FC<VendorPanelProps> = ({
  services,
  bookings,
  promoCodes,
  language,
  onAddService,
  onUpdateBookingStatus,
  onAddPromoCode,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Form tab switcher in Vendor Panel
  const [activeSubTab, setActiveSubTab] = useState<'my_services' | 'incoming_bookings' | 'add_service' | 'promos'>('incoming_bookings');

  // New Service Form State
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState<Service['category']>('hall');
  const [price, setPrice] = useState<number>(30000);
  const [governorate, setGovernorate] = useState<Service['governorate']>('cairo');
  const [district, setDistrict] = useState('المعادي');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number>(200);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80');

  // New Promo Code State
  const [promoCodeName, setPromoCodeName] = useState('SUMMER15');
  const [discountPercent, setDiscountPercent] = useState<number>(15);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price <= 0) return;

    const newService: Service = {
      id: 'srv-' + Date.now(),
      title: title.trim(),
      titleEn: titleEn.trim() || title.trim(),
      category,
      price,
      depositPercentage: 10,
      rating: 4.9,
      reviewsCount: 1,
      governorate,
      district: district.trim() || 'القاهرة',
      address: address.trim() || 'القاهرة الكبرى',
      location: { lat: 30.0444, lng: 31.2357 },
      description: description.trim() || 'خدمة جديدة مميزة للمناسبات',
      descriptionEn: description.trim() || 'New event service',
      capacity: category === 'hall' || category === 'cafe_restaurant' ? capacity : undefined,
      imageUrls: [imageUrl, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80'],
      availableDates: ['2026-08-15', '2026-08-18', '2026-08-22', '2026-08-28'],
      bookedDates: ['2026-08-10', '2026-08-25'],
      features: ['ديكور عصري', 'نظام إضاءة وصوت بدقة عالية', 'خدمةVIP الضيوف'],
      vendorId: 'vnd-current',
      vendorName: 'مكتب المناسبات الملكية',
      vendorPhone: '01012345678',
    };

    onAddService(newService);
    setActiveSubTab('my_services');
  };

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeName.trim()) return;

    const newPromo: PromoCode = {
      id: 'prm-' + Date.now(),
      code: promoCodeName.trim().toUpperCase(),
      discountPercentage: discountPercent,
      validUntil: '2026-09-30',
      active: true,
      description: `خصم موسم الصيف بنسبة ${discountPercent}%`,
    };

    onAddPromoCode(newPromo);
    setPromoCodeName('');
  };

  return (
    <div className="space-y-6">
      {/* Vendor Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Store className="w-4 h-4 text-amber-400" />
            <span>لوحة تحكم مقدم الخدمة (Vendor Control Panel)</span>
          </div>
          <h2 className="text-2xl font-black mt-1 font-serif text-amber-100">
            إدارة القاعات والحجوزات والعروض الموسمية
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تابع طلبات العملاء والعرابين، وحدد تواريخ التوفر، وأضف قاعتك أو خِدْماتك للتطبيق.
          </p>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700 text-xs flex flex-wrap gap-1">
          <button
            onClick={() => setActiveSubTab('incoming_bookings')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'incoming_bookings'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            طلبات الحجز المستلمة ({bookings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('my_services')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'my_services'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            الخدمات القائمة ({services.length})
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Incoming Bookings */}
      {activeSubTab === 'incoming_bookings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <h3 className="text-base font-bold text-amber-300 font-serif flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>طلبات الحجز المستلمة من العملاء والعربون (10%):</span>
          </h3>

          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{b.serviceName}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                      التاريخ: {b.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-300 text-[11px] mt-2">
                    <span>اسم العميل: <strong className="text-white">{b.clientName}</strong></span>
                    <span>هاتف العميل: <strong className="text-white">{b.clientPhone}</strong></span>
                    <span>العربون المسدد: <strong className="text-amber-400">{b.depositAmount.toLocaleString()} ج.م</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onUpdateBookingStatus(b.id, 'accepted')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>قبول الطلب والتاريخ</span>
                      </button>
                      <button
                        onClick={() => onUpdateBookingStatus(b.id, 'cancelled')}
                        className="px-3 py-2 bg-rose-900 hover:bg-rose-800 text-rose-200 font-bold text-xs rounded-xl flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض</span>
                      </button>
                    </>
                  )}

                  {b.status === 'accepted' && (
                    <span className="bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      مقبول ومؤكد
                    </span>
                  )}

                  {b.status === 'cancelled' && (
                    <span className="bg-rose-500/20 text-rose-300 px-3.5 py-1.5 rounded-xl border border-rose-500/30 font-bold text-xs">
                      ملغي
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: My Services */}
      {activeSubTab === 'my_services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div key={srv.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden text-white shadow-xl">
              <img src={srv.imageUrls[0]} alt={srv.title} className="w-full h-40 object-cover" />
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {srv.district}
                </span>
                <h4 className="font-bold text-base text-white">{srv.title}</h4>
                <p className="text-xs text-amber-400 font-bold">{srv.price.toLocaleString()} ج.م</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  أيام التوفر المفتوحة للحجز: {srv.availableDates.length} أيام
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-Tab 3: Add Service Form */}
      {activeSubTab === 'add_service' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4 max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-amber-300 font-serif flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <span>إضافة قاعة جديدة أو خدمة تجميل/تصوير/دي جي:</span>
          </h3>

          <form onSubmit={handleCreateService} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">اسم القاعة أو الخدمة (بالعربية):</label>
                <input
                  type="text"
                  required
                  placeholder="قاعة القصر الملكي - المعادي"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">اسم القاعة (بالإنجليزية):</label>
                <input
                  type="text"
                  placeholder="Royal Palace Hall"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">القسم:</label>
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-bold"
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
                  placeholder="التجمع الخامس / المعادي / الهرم..."
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">رابط الصورة الرئيسية:</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">الوصف والمميزات:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="قاعة فاخرة تسع لـ 300 فرد مع كوشة مودرن وشاشات ليد وبوفيه مفتوح متكامل..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20"
            >
              حفظ ونشر الخدمة على التطبيق
            </button>
          </form>
        </div>
      )}

      {/* Sub-Tab 4: Promo Codes */}
      {activeSubTab === 'promos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4 max-w-2xl mx-auto">
          <h3 className="text-base font-bold text-amber-300 font-serif flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <span>إنشاء كود خصم وعرض خاص للمستخدمين:</span>
          </h3>

          <form onSubmit={handleCreatePromoCode} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="كود الخصم (مثال: SUMMER20)"
              value={promoCodeName}
              onChange={(e) => setPromoCodeName(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white uppercase focus:outline-none focus:border-amber-500 font-mono font-bold"
            />
            <input
              type="number"
              min="5"
              max="50"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shrink-0"
            >
              تفعيل الكود
            </button>
          </form>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-400">الأكواد الفعالة حالياً:</h4>
            {promoCodes.map((p) => (
              <div key={p.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-amber-400">{p.code}</span>
                <span className="text-emerald-300 font-bold">خصم {p.discountPercentage}%</span>
                <span className="text-slate-400 text-[10px]">صالح حتى: {p.validUntil}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
