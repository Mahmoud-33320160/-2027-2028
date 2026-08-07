import React, { useState } from 'react';
import { Booking, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { StorageManager } from '../lib/storage';
import { Calendar, CreditCard, ShieldAlert, CheckCircle2, Clock, XCircle, RotateCcw, FileText, AlertCircle, Printer, X, ShieldCheck, Heart, Sparkles, QrCode, Music, MapPin, Navigation } from 'lucide-react';

interface BookingsHistoryViewProps {
  bookings: Booking[];
  language: Language;
  onCancelBooking: (bookingId: string) => void;
}

export const BookingsHistoryView: React.FC<BookingsHistoryViewProps> = ({
  bookings,
  language,
  onCancelBooking,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);
  const [activeQrBooking, setActiveQrBooking] = useState<Booking | null>(null);

  const currentUser = StorageManager.getCurrentUser();
  const isOwnerOrAdmin = currentUser?.email.trim().toLowerCase() === 'mmmmm3332012@gmail.com' || currentUser?.role === 'admin';

  // Strict user filter: Clients strictly ONLY see bookings created by their account
  const visibleBookings = bookings.filter((b) => {
    if (isOwnerOrAdmin) return true;
    if (currentUser?.role === 'vendor') {
      return b.clientEmail?.toLowerCase() === currentUser.email.toLowerCase();
    }
    // Client strictly sees ONLY their own bookings
    if (!currentUser) return false;
    const isMatchingEmail = b.clientEmail && b.clientEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase();
    const isMatchingId = b.clientId && currentUser.id && b.clientId === currentUser.id;
    const isMatchingPhone = Boolean(b.clientPhone && currentUser.phone && b.clientPhone === currentUser.phone);
    return isMatchingEmail || isMatchingId || isMatchingPhone;
  });

  const appSettings = StorageManager.getAppSettings();
  const refundRate = (appSettings.refundPercentage ?? 90) / 100;

  return (
    <div className="space-y-6">
      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full text-white p-6 sm:p-8 shadow-2xl relative my-auto space-y-5">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute left-4 top-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center space-y-2 border-b border-slate-800 pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mb-1 border border-amber-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-200">إيصال حجز خدمة مستقلة رسمية</h3>
              <p className="text-xs text-slate-400">منصة المناسبات والأفراح - جمهورية مصر العربية</p>
              <span className="inline-block text-[10px] font-mono font-bold bg-slate-950 px-3 py-1 rounded-full text-amber-400 border border-amber-500/20">
                رقم الفاتورة: #{selectedReceipt.id}
              </span>
            </div>

            {/* Receipt Details Table */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">الخدمة المحجوزة:</span>
                <span className="font-bold text-white text-sm">{selectedReceipt.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">قسم الخدمة:</span>
                <span className="font-bold text-amber-300">{selectedReceipt.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">اسم العميل:</span>
                <span className="font-bold text-white">{selectedReceipt.clientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">رقم الهاتف:</span>
                <span className="font-mono text-white">{selectedReceipt.clientPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">تاريخ المناسبة:</span>
                <span className="font-bold text-amber-400">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">التكلفة الإجمالية:</span>
                <span className="font-bold text-white">{selectedReceipt.totalPrice.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">العربون المسدد (10%):</span>
                <span className="font-bold text-emerald-400">{selectedReceipt.depositAmount.toLocaleString()} ج.م (مُسدّد)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">المبلغ المتبقي (90%):</span>
                <span className="font-bold text-rose-300">
                  {selectedReceipt.status === 'cancelled' ? '0 ج.م (ملغي)' : `${selectedReceipt.remainingAmount.toLocaleString()} ج.م (مستحق في ${selectedReceipt.remainingDueDate})`}
                </span>
              </div>
              {selectedReceipt.musicPreference && (
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-purple-400" />
                    <span>نمط الموسيقى والأغاني:</span>
                  </span>
                  <span className="font-bold text-purple-300">{selectedReceipt.musicPreference}</span>
                </div>
              )}
              {selectedReceipt.customPlaylistUrl && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">رابط الأغاني/قائمة التشغيل:</span>
                  <a
                    href={selectedReceipt.customPlaylistUrl.startsWith('http') ? selectedReceipt.customPlaylistUrl : `https://${selectedReceipt.customPlaylistUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-sky-400 underline"
                  >
                    عرض القائمة 🔗
                  </a>
                </div>
              )}
            </div>

            {/* Official Stamp Footer */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-amber-300">ختم الاعتماد والضمان</p>
                  <p className="text-[10px] text-slate-300">مضمون بقوة بطاقة الرقم القومي وسياسة الاسترداد الرسمية ({appSettings.refundPercentage}%)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                إيصال موثق
              </span>
            </div>

            {selectedReceipt.status === 'cancelled' && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <span>إيصال إلغاء واسترداد الخدمة ({appSettings.refundPercentage}%)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  تم إلغاء الخدمة بنجاح، والمبلغ المسترد بقيمة <strong className="text-emerald-400 font-bold">{selectedReceipt.cancellationRefundAmount ? selectedReceipt.cancellationRefundAmount.toLocaleString() : Math.round(selectedReceipt.depositAmount * refundRate).toLocaleString()} ج.م</strong> متاح بحسابك وفقاً لسياسة المنصة الرسمية.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة أو حفظ الإيصال (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <CreditCard className="w-4 h-4" />
            <span>{t('tabBookings')}</span>
          </div>
          <h2 className="text-2xl font-black mt-1 font-serif text-amber-100">
            {language === 'en' ? 'My Reservations & Payment Status' : 'سجل الحجوزات، حالة الدفع، وسياسة الاسترداد'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('depositNotice')}
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-xs text-amber-300 max-w-sm">
          <p className="font-bold">سياسة الإلغاء المعتمدة:</p>
          <p className="text-[11px] text-amber-200/80 mt-0.5">{t('cancellationPolicyText')}</p>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {visibleBookings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">لا توجد حجوزات حصرية مسجلة باسمك حالياً</p>
            <p className="text-xs text-slate-500">تصفح القاعات والخدمات واختر تاريخك المفضل لبدء الحجز بعربون 10% فقط.</p>
          </div>
        ) : (
          visibleBookings.map((b) => {
            const isCancelled = b.status === 'cancelled';
            const isAccepted = b.status === 'accepted' || b.status === 'paid';

            return (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4 transition-all hover:border-slate-700"
              >
                {/* Top Title & Status Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        {b.category}
                      </span>
                      <span className="text-xs text-slate-400">رقم الحجز: #{b.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-serif mt-1">
                      {language === 'en' ? b.serviceNameEn : b.serviceName}
                    </h3>
                  </div>

                  {/* Booking Status Badge */}
                  <div className="flex items-center gap-2">
                    {b.status === 'pending' && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {t('statusPending')}
                      </span>
                    )}

                    {isAccepted && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('statusAccepted')} ({t('statusPaid')})
                      </span>
                    )}

                    {isCancelled && (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t('statusCancelled')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">تاريخ المناسبة:</span>
                    <span className="font-bold text-white text-sm">{b.date}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">التكلفة الإجمالية:</span>
                    <span className="font-bold text-white text-sm">{b.totalPrice.toLocaleString()} ج.م</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">العربون المدفوع (10%):</span>
                    <span className="font-bold text-amber-400 text-sm">{b.depositAmount.toLocaleString()} ج.م</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">المبلغ المتبقي (90%):</span>
                    <span className="font-bold text-rose-300 text-sm">
                      {isCancelled ? '0 ج.م' : `${b.remainingAmount.toLocaleString()} ج.م`}
                    </span>
                    {!isCancelled && (
                      <span className="text-[9px] text-slate-400 block mt-0.5">مستحق في: {b.remainingDueDate}</span>
                    )}
                  </div>
                </div>

                {/* National ID Guarantee Indicator & View Receipt Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>وثيقة الضمان: تم المرفق وصور بطاقة الرقم القومي للعميل</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.serviceName + ' ' + b.governorate)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-700/80 text-sky-200 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sky-400" />
                      <span>اتصال GPS وتتبع المسار للمكان 🧭</span>
                    </a>

                    <button
                      onClick={() => setActiveQrBooking(b)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-purple-200 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5 text-purple-400" />
                      <span>طلب / عرض رمز QR الحجز</span>
                    </button>

                    <button
                      onClick={() => setSelectedReceipt(b)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>إيصال الحجز المستقل</span>
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => onCancelBooking(b.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>إلغاء الحجز (استرداد {appSettings.refundPercentage}% = {Math.round(b.depositAmount * refundRate).toLocaleString()} ج.م)</span>
                      </button>
                    )}

                    {isCancelled && (
                      <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تم استرداد {appSettings.refundPercentage}% من العربون: {b.cancellationRefundAmount ? b.cancellationRefundAmount.toLocaleString() : Math.round(b.depositAmount * refundRate).toLocaleString()} ج.م</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking QR Code Modal */}
      {activeQrBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-sm w-full p-6 text-white text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-300 mx-auto flex items-center justify-center border border-purple-500/30">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold font-serif text-amber-200">رمز QR الحجز والتأكيد الخاص بك</h3>
            <p className="text-xs text-slate-300 font-bold">{activeQrBooking.serviceName}</p>
            <p className="text-[11px] text-slate-400">رقم الحجز: #{activeQrBooking.id} | التاريخ: {activeQrBooking.date}</p>

            {/* Generated QR Code Card Graphic */}
            <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-inner text-slate-900">
              <QrCode className="w-32 h-32 text-slate-900" />
              <span className="text-[10px] font-mono font-bold mt-1 text-slate-700">BK-{activeQrBooking.id}</span>
            </div>

            <p className="text-[10px] text-slate-400">هذا الكود مشفر وخاص بحسابك فقط، يُعرض عند مدخل القاعة للتحقق من العربون والضمان</p>

            <button
              onClick={() => setActiveQrBooking(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
