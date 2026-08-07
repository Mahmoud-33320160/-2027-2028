import React, { useState } from 'react';
import { Service, Booking, EventType, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { StorageManager } from '../lib/storage';
import {
  X,
  Calendar as CalendarIcon,
  ShieldAlert,
  Upload,
  CheckCircle2,
  CreditCard,
  Lock,
  User,
  Phone,
  Users,
  MapPin,
  AlertCircle,
  Sparkles,
  Music,
} from 'lucide-react';

interface BookingModalProps {
  service: Service;
  language: Language;
  onClose: () => void;
  onConfirmBooking: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  service,
  language,
  onClose,
  onConfirmBooking,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [selectedDate, setSelectedDate] = useState<string>(
    service.availableDates[0] || new Date().toISOString().split('T')[0]
  );
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [guestCount, setGuestCount] = useState<number>(service.capacity || 150);
  const [notes, setNotes] = useState('');

  // Category-specific options & add-ons
  const [option1Price, setOption1Price] = useState<number>(0);
  const [option1Name, setOption1Name] = useState<string>('');

  const [option2Price, setOption2Price] = useState<number>(0);
  const [option2Name, setOption2Name] = useState<string>('');

  const [option3Price, setOption3Price] = useState<number>(0);
  const [option3Name, setOption3Name] = useState<string>('');

  // Legacy fallback states
  const [decorOption, setDecorOption] = useState<number>(0);
  const [decorOptionName, setDecorOptionName] = useState<string>('');

  // Promo Code
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoMessage, setPromoMessage] = useState<string>('');

  // Music & Songs Preference
  const [musicPreference, setMusicPreference] = useState<string>('رومانسيات وهادئ للعروسين');
  const [customPlaylistUrl, setCustomPlaylistUrl] = useState<string>('');

  // National ID mock uploads
  const [nationalIdFront, setNationalIdFront] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  );
  const [nationalIdBack, setNationalIdBack] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  );
  const [idFrontUploaded, setIdFrontUploaded] = useState(false);
  const [idBackUploaded, setIdBackUploaded] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const appSettings = StorageManager.getAppSettings();
  const refundRate = (appSettings.refundPercentage ?? 90) / 100;

  // Calculate dynamic total price
  const addOnsTotal = option1Price + option2Price + option3Price + decorOption;
  const subTotal = service.price + addOnsTotal;
  const discountAmount = Math.round((subTotal * discountPercent) / 100);
  const totalPrice = subTotal - discountAmount;
  const depositAmount = Math.round(totalPrice * (service.depositPercentage / 100)); // 10%
  const remainingAmount = totalPrice - depositAmount; // 90%

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'SUMMER2026' || code === 'WELCOME2026') {
      setDiscountPercent(10);
      setPromoApplied(true);
      setPromoMessage('تم تطبيق خصم 10% بنجاح! 🎉');
    } else if (code === 'VIP2026' || code === 'WEDDING2026') {
      setDiscountPercent(15);
      setPromoApplied(true);
      setPromoMessage('تم تطبيق خصم 15% VIP بنجاح! 🎉');
    } else {
      setPromoMessage('كود الخصم غير صالح. جرب: SUMMER2026 أو VIP2026');
    }
  };

  // Calculate 10 days before event date for remaining payment
  const getRemainingDueDate = (eventDateStr: string) => {
    try {
      const d = new Date(eventDateStr);
      d.setDate(d.getDate() - 10);
      return d.toISOString().split('T')[0];
    } catch {
      return eventDateStr;
    }
  };

  const handleSimulatedFileUpload = (type: 'front' | 'back') => {
    if (type === 'front') {
      setIdFrontUploaded(true);
    } else {
      setIdBackUploaded(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientName.trim() || !clientPhone.trim()) {
      setErrorMsg(language === 'en' ? 'Please fill in your name and phone number.' : 'يرجى إدخال الاسم ورقم الهاتف.');
      return;
    }

    if (!idFrontUploaded || !idBackUploaded) {
      setErrorMsg(
        language === 'en'
          ? 'Please attach both front and back photos of your National ID for guarantee.'
          : 'يرجى رفع صور بطاقة الرقم القومي (الوجه والظهر) للضمان قبل إتمام الحجز.'
      );
      return;
    }

    setIsSubmitting(true);

    const currentUser = StorageManager.getCurrentUser();

    const musicSummary = `[نمط الموسيقى والأغاني: ${musicPreference}${customPlaylistUrl ? ` | رابط/قائمة التشغيل: ${customPlaylistUrl}` : ''}]`;
    const selectedCustomizations = [option1Name, option2Name, option3Name, decorOptionName].filter(Boolean).join(' | ');
    const optionSummary = `[تخصيص الخدمة (${service.category}): ${selectedCustomizations || 'باقة أساسية'}${promoApplied ? ` | كود خصم: ${promoCode} (-${discountPercent}%)` : ''}]`;
    const finalNotes = `${notes.trim() ? notes.trim() + '\n' : ''}${musicSummary}\n${optionSummary}`;

    const newBooking: Booking = {
      id: 'bk-' + Date.now(),
      serviceId: service.id,
      serviceName: service.title,
      serviceNameEn: service.titleEn,
      category: service.category,
      date: selectedDate,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      nationalIdFrontUrl: nationalIdFront,
      nationalIdBackUrl: nationalIdBack,
      totalPrice,
      depositAmount,
      remainingAmount,
      remainingDueDate: getRemainingDueDate(selectedDate),
      paymentStatus: 'paid_deposit',
      status: 'pending',
      eventType,
      guestCount,
      notes: finalNotes,
      governorate: service.governorate,
      createdAt: new Date().toISOString().split('T')[0],
      clientEmail: currentUser?.email || '',
      clientId: currentUser?.id || '',
      musicPreference,
      customPlaylistUrl: customPlaylistUrl.trim(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmBooking(newBooking);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-2xl w-full text-slate-100 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {t('depositTitle')}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                حجز منفصل ومستقل لهذه الخدمة
              </span>
            </div>
            <h2 className="text-xl font-bold mt-2 text-white font-serif">
              {language === 'en' ? service.titleEn : service.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{service.district} ({t(service.governorate === 'cairo' ? 'govCairo' : service.governorate === 'giza' ? 'govGiza' : 'govQalyubia')})</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Real-time Dynamic Calculation Summary Section */}
          <div className="bg-gradient-to-br from-amber-950/70 via-slate-900 to-purple-950/70 rounded-3xl p-5 border-2 border-amber-500/50 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping shrink-0" />
                <h3 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>الملخص المالي الديناميكي للحجز (حساب مباشر)</span>
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 w-fit">
                ⚡ يتحدث فورياً عند اختيار الترقيات
              </span>
            </div>

            {/* Breakdown Items List */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800">
                <span>سعر الخدمة الأساسية ({service.title}):</span>
                <span className="font-mono font-bold text-white">{service.price.toLocaleString()} {t('egp')}</span>
              </div>

              {/* Add-ons & Upgrades itemized */}
              <div className="flex flex-col gap-1 py-1 border-b border-slate-800">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <span>إجمالي الترقيات والإضافات المختارة:</span>
                    {addOnsTotal > 0 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                        +{addOnsTotal.toLocaleString()} {t('egp')}
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {addOnsTotal > 0 ? `+${addOnsTotal.toLocaleString()} ${t('egp')}` : 'بدون ترقيات (0 ج.م)'}
                  </span>
                </div>

                {/* List selected upgrade names */}
                {[option1Name, option2Name, option3Name, decorOptionName].filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[option1Name, option2Name, option3Name, decorOptionName].filter(Boolean).map((optName, idx) => (
                      <span key={idx} className="bg-slate-950/80 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{optName}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtotal & Discount */}
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 py-1 border-b border-slate-800 font-bold">
                  <span>كود الخصم المطبق ({promoCode} - {discountPercent}%):</span>
                  <span className="font-mono">-{discountAmount.toLocaleString()} {t('egp')}</span>
                </div>
              )}

              {/* Final Total */}
              <div className="flex items-center justify-between text-sm py-2 font-black text-white bg-slate-950/60 px-3 rounded-xl border border-slate-800">
                <span>إجمالي تكلفة الحجز النهائي:</span>
                <span className="text-xl font-mono text-amber-300">{totalPrice.toLocaleString()} {t('egp')}</span>
              </div>
            </div>

            {/* Dynamic Deposit (10%) and Remaining (90%) Calculation Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* 10% Deposit */}
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-950/80 border-2 border-amber-500/60 rounded-2xl p-3.5 space-y-1 shadow-lg">
                <div className="flex items-center justify-between text-amber-300">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>العربون المطلوب الآن (10%):</span>
                  </span>
                  <span className="text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">سداد فوري</span>
                </div>
                <div className="text-2xl font-black text-amber-200 font-mono pt-1">
                  {depositAmount.toLocaleString()} <span className="text-xs font-normal text-amber-300">{t('egp')}</span>
                </div>
                <p className="text-[10px] text-amber-200/90 font-medium">
                  يتم دفع هذا المبلغ المباشر لتأكيد حجز موعد المناسبة في التقويم وتوثيق العقد.
                </p>
              </div>

              {/* 90% Remaining Balance */}
              <div className="bg-slate-950/90 border-2 border-purple-500/40 rounded-2xl p-3.5 space-y-1 shadow-lg">
                <div className="flex items-center justify-between text-purple-300">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-purple-400" />
                    <span>المتبقي المؤجل (90%):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">قبل 10 أيام من المناسبة</span>
                </div>
                <div className="text-2xl font-black text-purple-200 font-mono pt-1">
                  {remainingAmount.toLocaleString()} <span className="text-xs font-normal text-purple-300">{t('egp')}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  يُسدد المتبقي مباشرة إلى مقدم الخدمة بحلول تاريخ: <span className="text-purple-300 font-bold font-mono">{getRemainingDueDate(selectedDate)}</span>
                </p>
              </div>
            </div>

            {/* Refund terms note */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ضمان الاسترداد عند الإلغاء ({appSettings.refundPercentage}%):</span>
              </span>
              <span className="font-mono font-bold text-emerald-200">
                استرجاع {Math.round(depositAmount * refundRate).toLocaleString()} {t('egp')}
              </span>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-400" />
              <span>تاريخ المناسبة (اختر من التقويم المتاح):</span>
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {service.availableDates.map((d) => (
                <option key={d} value={d}>
                  {d} - (متاح للحجز)
                </option>
              ))}
            </select>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>اسم العميل الثلاثي:</span>
              </label>
              <input
                type="text"
                required
                placeholder="أحمد محمد محمود"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>رقم الهاتف للتواصل:</span>
              </label>
              <input
                type="tel"
                required
                placeholder="01012345678"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Event Type & Category-tailored Booking Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">نوع المناسبة:</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="wedding">{t('eventWedding')}</option>
                <option value="engagement">{t('eventEngagement')}</option>
                <option value="birthday">{t('eventBirthday')}</option>
                <option value="conference">{t('eventConference')}</option>
                <option value="cafe_restaurant">{t('eventCafeRestaurant')}</option>
                <option value="graduation">{t('eventGraduation')}</option>
                <option value="other">{t('eventOther')}</option>
              </select>
            </div>

            {/* Music & Songs Selection Block */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-purple-500/40 space-y-3">
              <label className="block text-xs font-bold text-purple-300 font-serif flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>اختيار نوع الموسيقى والأغاني المطلوبة أثناء المناسبة:</span>
                </span>
                <span className="text-[10px] text-purple-400 font-normal">اختياري مجاني</span>
              </label>

              <select
                value={musicPreference}
                onChange={(e) => setMusicPreference(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-purple-500"
              >
                <option value="رومانسيات وهادئ للعروسين">🎻 أغانٍ رومانسية وهادئة للعروسين</option>
                <option value="زفة أوركسترا وموسيقى شرقية وأصيلة">🥁 زفة أوركسترا وموسيقى شرقية أصيلة</option>
                <option value="دي جي شعبي ومهرجانات مصرية حديثة">🎧 دي جي شعبي ومهرجانات مصرية حديثة</option>
                <option value="موسيقى جاز وكلاسيك غربي راقي">🎷 موسيقى جاز وكلاسيك غربي راقي</option>
                <option value="زفة شامية / خليجية احترافية">🎼 زفة شامية / خليجية استعراضية</option>
                <option value="قائمة أغانٍ خاصة بالعميل">🎵 قائمة أغانٍ خاصة بي (رابط أو أسماء الأغاني)</option>
              </select>

              <div>
                <input
                  type="text"
                  placeholder="اكتب أسماء الأغاني المفضلة أو ضع رابط قائمة التشغيل (Spotify / YouTube)..."
                  value={customPlaylistUrl}
                  onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
          {/* Category Specific Customization Block */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-amber-300 font-serif flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {service.category === 'hall' && 'خيارات القاعة وتخصيص المناسبة:'}
                  {service.category === 'makeup' && 'خيارات باقة المكياج وإطلالة العروسة:'}
                  {service.category === 'photographer' && 'خيارات حزمة التصوير والألبومات:'}
                  {service.category === 'music' && 'خيارات فقرة الدي جي والزفة والشو:'}
                  {service.category === 'catering' && 'خيارات قائمة البوفيه والضيافة:'}
                  {service.category === 'decor' && 'خيارات طراز الديكور وتزيين السيارة:'}
                  {service.category === 'cafe_restaurant' && 'خيارات حجز المكان والضيافة:'}
                </span>
              </h4>
              <span className="text-[10px] text-slate-400">تُحسب التكلفة الإضافية تلقائياً بالعربون</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Category: Hall */}
              {service.category === 'hall' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">👑 الكوشة وتجهيز المسرح:</label>
                    <select
                      value={option1Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption1Price(price);
                        const names: Record<number, string> = {
                          0: 'كوشة مودرن هادئة (أساسي - 0 ج.م)',
                          3000: 'كوشة ملكية ورد طبيعي وتأطير إضاءة (+3,000 ج.م)',
                          5000: 'سنتربيس VIP وممر العروسين الفاخر (+5,000 ج.م)',
                        };
                        setOption1Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>كوشة مودرن هادئة (0 ج.م)</option>
                      <option value={3000}>كوشة ملكية ورد طبيعي وتأطير إضاءة (+3,000 ج.م)</option>
                      <option value={5000}>سنتربيس VIP وممر العروسين الفاخر (+5,000 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🍽️ مستوى البوفيه المفتوح:</label>
                    <select
                      value={option2Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption2Price(price);
                        const names: Record<number, string> = {
                          0: 'بوفيه مفتوح أساسي (0 ج.م)',
                          8000: 'بوفيه VIP مشويات مأكولات فاخرة (+8,000 ج.م)',
                          12000: 'بوفيه ملوكي وتورطة 5 أدوار (+12,000 ج.م)',
                        };
                        setOption2Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>بوفيه مفتوح أساسي (0 ج.م)</option>
                      <option value={8000}>بوفيه VIP مشويات فاخرة (+8,000 ج.م)</option>
                      <option value={12000}>بوفيه ملوكي وتورطة 5 أدوار (+12,000 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🎶 الزفة ومؤثرات القاعة:</label>
                    <select
                      value={option3Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption3Price(price);
                        const names: Record<number, string> = {
                          0: 'دي جي ومؤثرات صوتية أساسية (0 ج.م)',
                          4000: 'زفة إسكندراني/شامي + شو استعراضي (+4,000 ج.م)',
                          7000: 'زفة ملكية شو العاب نارية ودخان كوشة (+7,000 ج.م)',
                        };
                        setOption3Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>دي جي ومؤثرات صوتية أساسية (0 ج.م)</option>
                      <option value={4000}>زفة إسكندراني/شامي + شو استعراضي (+4,000 ج.م)</option>
                      <option value={7000}>زفة ملكية شو العاب نارية ودخان (+7,000 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">👥 عدد المعازيم / الحضور المتوقع:</label>
                    <input
                      type="number"
                      min={50}
                      max={2000}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </>
              )}

              {/* Category: Makeup */}
              {service.category === 'makeup' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">💄 نوع إطلالة الميكب:</label>
                    <select
                      value={option1Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption1Price(price);
                        const names: Record<number, string> = {
                          0: 'ميكب خطوبة / سواريه راقي (0 ج.م)',
                          2000: 'ميكب عروسة زفاف ملكي براندات (+2,000 ج.م)',
                          4000: 'باقة العروسة الشاملة (زفاف + لفة طرحة/شعر + رموش وأظافر) (+4,000 ج.م)',
                        };
                        setOption1Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>ميكب خطوبة / سواريه راقي (0 ج.م)</option>
                      <option value={2000}>ميكب عروسة زفاف ملكي براندات (+2,000 ج.م)</option>
                      <option value={4000}>باقة العروسة الشاملة (زفاف + لفة طرحة + أظافر) (+4,000 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🏠 مكان التجهيز المفضل:</label>
                    <select
                      value={option2Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption2Price(price);
                        const names: Record<number, string> = {
                          0: 'التجهيز داخل سنتر/أتيلييه خبيرة التجميل (0 ج.م)',
                          1500: 'خدمة التجهيز الخارجي في الفندق أو البيت (+1,500 ج.م)',
                        };
                        setOption2Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>داخل سنتر خبيرة التجميل (0 ج.م)</option>
                      <option value={1500}>خدمة التجهيز الخارجي بالفندق / البيت (+1,500 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">👩‍👩‍👧 المرافقات مع العروسة:</label>
                    <select
                      value={option3Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption3Price(price);
                        const names: Record<number, string> = {
                          0: 'بدون مرافقين (0 ج.م)',
                          800: 'مرافق واحد (ميكب سواريه + لفة طرحة) (+800 ج.م)',
                          1500: '2 مرافقين (ميكب سواريه كامل) (+1,500 ج.م)',
                        };
                        setOption3Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>بدون مرافقين (0 ج.م)</option>
                      <option value={800}>مرافق واحد (ميكب سواريه) (+800 ج.م)</option>
                      <option value={1500}>2 مرافقين (ميكب سواريه كامل) (+1,500 ج.م)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Category: Photographer */}
              {service.category === 'photographer' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">📷 نطاق تغطية التصوير:</label>
                    <select
                      value={option1Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption1Price(price);
                        const names: Record<number, string> = {
                          0: 'سيشن خارجي أوت دور أو القاعة فقط (0 ج.م)',
                          3000: 'تغطية اليوم بالكامل Full Day من الميكب للزفة (+3,000 ج.م)',
                          5000: 'تغطية سينمائية VIP + تريلر HD وفيديو كامل (+5,000 ج.م)',
                        };
                        setOption1Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>سيشن أوت دور أو القاعة فقط (0 ج.م)</option>
                      <option value={3000}>تغطية اليوم بالكامل Full Day (+3,000 ج.م)</option>
                      <option value={5000}>تغطية سينمائية VIP + فيديو تريلر (+5,000 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🚁 الدرون والجيمي جيب:</label>
                    <select
                      value={option2Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption2Price(price);
                        const names: Record<number, string> = {
                          0: 'تصوير كاميرات أرضية 4K (0 ج.م)',
                          2000: 'إضافة تصوير طائرة درون جوية (Drone 4K) (+2,000 ج.م)',
                          3500: 'إضافة كاميرا جيمي جيب داخل القاعة (+3,500 ج.م)',
                        };
                        setOption2Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>تصوير أرضي 4K (0 ج.م)</option>
                      <option value={2000}>إضافة تصوير طائرة درون جوية (+2,000 ج.م)</option>
                      <option value={3500}>إضافة كاميرا جيمي جيب بالقاعة (+3,500 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🖼️ الألبومات واللوحات المطبوعة:</label>
                    <select
                      value={option3Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption3Price(price);
                        const names: Record<number, string> = {
                          0: 'ألبوم ديجيتال فاخر مقاس 30x80 (0 ج.م)',
                          2500: 'ألبوم خشبي حراري كبير + 2 ألبوم ميني + تابلوه (+2,500 ج.م)',
                          4000: 'صندوق خشبي محفور بالإسم + ألبوم جلد فاخر + 2 تابلوه (+4,000 ج.م)',
                        };
                        setOption3Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>ألبوم ديجيتال مقاس 30x80 (0 ج.م)</option>
                      <option value={2500}>ألبوم خشبي حراري + 2 ألبوم ميني + تابلوه (+2,500 ج.م)</option>
                      <option value={4000}>صندوق خشبي محفور + ألبوم جلد + 2 تابلوه (+4,000 ج.م)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Category: Music */}
              {service.category === 'music' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🥁 طابع الزفة والاستعراض:</label>
                    <select
                      value={option1Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption1Price(price);
                        const names: Record<number, string> = {
                          0: 'فقرة دي جي ومؤثرات صوتية كاملة (0 ج.م)',
                          2500: 'زفة دمياطي / بلدي بالطبول والمزمار (+2,500 ج.م)',
                          3500: 'زفة شامية استعراضية بالسيوف (+3,500 ج.م)',
                          6000: 'فرقة أوركسترا حية (شرقي / غربي) (+6,000 ج.م)',
                        };
                        setOption1Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>دي جي ومؤثرات صوتية (0 ج.م)</option>
                      <option value={2500}>زفة دمياطي / بلدي بالطبول (+2,500 ج.م)</option>
                      <option value={3500}>زفة شامية بالسيوف (+3,500 ج.م)</option>
                      <option value={6000}>فرقة أوركسترا حية (+6,000 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🎆 المؤثرات والألعاب النارية:</label>
                    <select
                      value={option2Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption2Price(price);
                        const names: Record<number, string> = {
                          0: 'بدون ألعاب نارية (0 ج.م)',
                          2000: 'شو العاب نارية كولد فاير ودخان كوشة (+2,000 ج.م)',
                          4000: 'شو ليزر وشاشات تعريض تفاعلية ضخمة (+4,000 ج.م)',
                        };
                        setOption2Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>بدون ألعاب نارية (0 ج.م)</option>
                      <option value={2000}>شو العاب نارية كولد فاير ودخان (+2,000 ج.م)</option>
                      <option value={4000}>شو ليزر وشاشات تعريض (+4,000 ج.م)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Category: Catering */}
              {service.category === 'catering' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🍖 قائمة الوجبات والمأكولات:</label>
                    <select
                      value={option1Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption1Price(price);
                        const names: Record<number, string> = {
                          0: 'قائمة مشويات ولحوم بلدي (0 ج.م)',
                          4000: 'بوفيه بحري وسي فود وفاخر (+4,000 ج.م)',
                          7000: 'بوفيه ملوكي شامل الأطباق والمشروبات (+7,000 ج.م)',
                        };
                        setOption1Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>قائمة مشويات ولحوم بلدي (0 ج.م)</option>
                      <option value={4000}>بوفيه بحري وسي فود (+4,000 ج.م)</option>
                      <option value={7000}>بوفيه ملوكي شامل (+7,000 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🎂 كعكة الزفاف والحلويات:</label>
                    <select
                      value={option2Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption2Price(price);
                        const names: Record<number, string> = {
                          0: 'أطباق حلويات شرقية وغربية (0 ج.م)',
                          2000: 'تورطة زفاف 3 أدوار مغطاة بالفوندان (+2,000 ج.م)',
                          4000: 'تورطة 5 أدوار ملكية + نافورة شوكولاتة (+4,000 ج.م)',
                        };
                        setOption2Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>أطباق حلويات شرقية وغربية (0 ج.م)</option>
                      <option value={2000}>تورطة 3 أدوار مغطاة بالفوندان (+2,000 ج.م)</option>
                      <option value={4000}>تورطة 5 أدوار + نافورة شوكولاتة (+4,000 ج.م)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Category: Decor */}
              {service.category === 'decor' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🌸 نطاق الديكور والتنسيق:</label>
                    <select
                      value={option1Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption1Price(price);
                        const names: Record<number, string> = {
                          0: 'كوشة القاعة أو مدخل المناسبة (0 ج.م)',
                          3500: 'تنسيق القاعة بالكامل (كوشة + ممر + سنتربيس) (+3,500 ج.م)',
                          5500: 'باقة الديكور الشاملة + تزيين سيارة الزفاف (+5,500 ج.م)',
                        };
                        setOption1Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>كوشة القاعة أو المدخل (0 ج.م)</option>
                      <option value={3500}>تنسيق القاعة بالكامل (+3,500 ج.م)</option>
                      <option value={5500}>ديكور شامل + تزيين سيارة الزفاف (+5,500 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🚗 تزيين سيارة الزفاف بالورد:</label>
                    <select
                      value={option2Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption2Price(price);
                        const names: Record<number, string> = {
                          0: 'بدون تزيين سيارة (0 ج.م)',
                          1200: 'تزيين سيارة الزفاف بالورد البلدي والشريط الملكي (+1,200 ج.م)',
                        };
                        setOption2Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>بدون تزيين سيارة (0 ج.م)</option>
                      <option value={1200}>تزيين سيارة الزفاف بالورد البلدي (+1,200 ج.م)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Category: Cafe & Restaurant */}
              {service.category === 'cafe_restaurant' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🏛️ نوع حجز المكان والخصوصية:</label>
                    <select
                      value={option1Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption1Price(price);
                        const names: Record<number, string> = {
                          0: 'حجز روف/قاعة مغلقة داخل المكان (0 ج.م)',
                          3000: 'حجز وإغلاق المكان بالكامل للخصوصية Privatization (+3,000 ج.م)',
                        };
                        setOption1Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>حجز روف/قاعة خاصة بالداخل (0 ج.م)</option>
                      <option value={3000}>إغلاق المكان بالكامل للخصوصية Privatization (+3,000 ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">🍹 باقة المشروبات والحلويات:</label>
                    <select
                      value={option2Price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setOption2Price(price);
                        const names: Record<number, string> = {
                          0: 'مشروب ترحيبي لكل ضيف (0 ج.م)',
                          2000: 'باقة المشروبات المفتوحة والحلويات لكافة الضيوف (+2,000 ج.م)',
                        };
                        setOption2Name(names[price] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>مشروب ترحيبي لكل ضيف (0 ج.م)</option>
                      <option value={2000}>باقة المشروبات المفتوحة والحلويات المفتوحة (+2,000 ج.م)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Promo Code Entry */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="كود الخصم (مثال: SUMMER2026)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shrink-0"
                >
                  تطبيق
                </button>
              </div>
              {promoMessage && (
                <span className={`text-xs font-bold ${promoApplied ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {promoMessage}
                </span>
              )}
            </div>
          </div>

          {/* National ID Upload Section (Guarantee requirement) */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Lock className="w-4 h-4" />
              <span>{t('nationalIdRequired')}</span>
            </div>
            <p className="text-[11px] text-slate-400">{t('nationalIdNotice')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSimulatedFileUpload('front')}
                className={`p-3 rounded-xl border border-dashed flex items-center justify-between transition-all ${
                  idFrontUploaded
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-700 hover:border-amber-500/50 bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{t('uploadFront')}</span>
                </div>
                {idFrontUploaded ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-400">مطلوب</span>}
              </button>

              <button
                type="button"
                onClick={() => handleSimulatedFileUpload('back')}
                className={`p-3 rounded-xl border border-dashed flex items-center justify-between transition-all ${
                  idBackUploaded
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-700 hover:border-amber-500/50 bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{t('uploadBack')}</span>
                </div>
                {idBackUploaded ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-400">مطلوب</span>}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظات أو طلبات مخصصة:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: نرجو إضافة زفة بالدفوف والورد وكوشة ذات طابع عصري..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
            >
              {t('close')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>جاري معالجة طلب الحجز...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>{t('confirmBooking')} ({depositAmount.toLocaleString()} {t('egp')})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
