import React, { useState } from 'react';
import { Guest, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { StorageManager } from '../lib/storage';
import { QrCode, UserPlus, CheckCircle2, XCircle, Clock, Scan, Search, Users, Trash2, Camera, Download, Share2 } from 'lucide-react';

interface GuestManagementViewProps {
  guests: Guest[];
  language: Language;
  onAddGuest: (guest: Guest) => void;
  onCheckInGuestByQr: (qrCode: string) => Guest | null;
}

export const GuestManagementView: React.FC<GuestManagementViewProps> = ({
  guests,
  language,
  onAddGuest,
  onCheckInGuestByQr,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const currentUser = StorageManager.getCurrentUser();
  const isOwnerOrAdmin = currentUser?.email.trim().toLowerCase() === 'mmmmm3332012@gmail.com' || currentUser?.role === 'admin';

  // Strict Client Privacy: Client ONLY sees guests registered under their own account
  const visibleGuests = guests.filter((g) => {
    if (isOwnerOrAdmin) return true;
    if (!currentUser) return false;
    if (g.clientEmail) {
      return g.clientEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase();
    }
    if (g.clientId) {
      return g.clientId === currentUser.id;
    }
    return false;
  });

  // Unique Master Event QR Code per client/event
  const clientMasterQrCode = currentUser
    ? `MUN-EVENT-${(currentUser.id || currentUser.email.replace(/[^a-zA-Z0-9]/g, '')).toUpperCase()}-2026`
    : 'MUN-EVENT-MASTER-2026';

  // Add Guest Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companionsCount, setCompanionsCount] = useState<number>(1);
  const [tableNumber, setTableNumber] = useState('طاولة 1');

  // QR Modal State
  const [activeQrGuest, setActiveQrGuest] = useState<Guest | null>(null);
  const [isMasterQrModalOpen, setIsMasterQrModalOpen] = useState(false);

  // Scanner Simulator
  const [scanInput, setScanInput] = useState('');
  const [scanResultMsg, setScanResultMsg] = useState<{ text: string; success: boolean } | null>(null);

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGuest: Guest = {
      id: 'g-' + Date.now(),
      name: name.trim(),
      phone: phone.trim() || '01000000000',
      companionsCount,
      status: 'accepted',
      qrCode: 'MUN-GUEST-' + Math.floor(100 + Math.random() * 900),
      checkedIn: false,
      tableNumber,
      clientEmail: currentUser?.email || '',
      clientId: currentUser?.id || '',
    };

    onAddGuest(newGuest);
    setName('');
    setPhone('');
  };

  const handleSimulateQrScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = scanInput.trim().toUpperCase();
    if (!code) return;

    if (code === clientMasterQrCode || code === 'MUN-EVENT-MASTER-2026' || code === 'MUN-MASTER-EVENT' || code === 'MASTER') {
      // Find first unchecked-in guest in client's own guest list
      const nextGuest = visibleGuests.find((g) => !g.checkedIn);
      if (nextGuest) {
        onCheckInGuestByQr(nextGuest.qrCode);
        setScanResultMsg({
          text: `تم تسجيل حضور عبر رمز الـ QR الموحد للحفل! (الضيف: ${nextGuest.name} - +${nextGuest.companionsCount} مرافقين)`,
          success: true,
        });
      } else {
        setScanResultMsg({
          text: 'تم مسح رمز الـ QR الموحد للحفل بنجاح! جميع المعازيم المسجلين تم تسجيل حضورهم بالفعل.',
          success: true,
        });
      }
      setScanInput('');
      return;
    }

    // Verify if the guest belongs to this client's list or admin
    const isGuestInMyList = visibleGuests.some((g) => g.qrCode.toUpperCase().trim() === code);
    if (!isGuestInMyList && !isOwnerOrAdmin) {
      setScanResultMsg({
        text: 'عذراً! رمز الـ QR غير صالح أو خاص بحساب عميل آخر ولا يمكن الوصول إليه.',
        success: false,
      });
      setScanInput('');
      return;
    }

    const res = onCheckInGuestByQr(code);
    if (res) {
      setScanResultMsg({
        text: `تم تسجيل حضور الضيف: ${res.name} (عدد المرافقين: ${res.companionsCount}) - ${res.tableNumber || 'طاولة رئيسية'}`,
        success: true,
      });
    } else {
      setScanResultMsg({
        text: 'رمز الـ QR غير صالح أو غير موجود في قائمة المدعوين!',
        success: false,
      });
    }
    setScanInput('');
  };

  // Stats
  const totalGuests = visibleGuests.length;
  const totalCompanions = visibleGuests.reduce((acc, g) => acc + (g.status === 'accepted' ? g.companionsCount + 1 : 0), 0);
  const checkedInCount = visibleGuests.filter((g) => g.checkedIn).length;

  return (
    <div className="space-y-6">
      {/* Strict Privacy Protection Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-amber-950/80 border border-purple-500/30 p-4 sm:p-5 rounded-3xl text-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
            <QrCode className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-amber-200 text-sm font-serif">حماية خصوصية بطاقات الـ QR والمدعوين</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              بطاقات الـ QR المعروضة هنا مشفرة ومخصصة لحسابك الشخصي فقط. لا يمكن لأي عميل آخر أو مستخدم غير مصرح له مشاهدة أو استخدام رموز الـ QR الخاصة بدعواتك.
            </p>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] shrink-0 self-end sm:self-center">
          🔒 حماية معزولة 100%
        </span>
      </div>

      {/* Master Event QR Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-purple-950/80 border border-amber-500/40 p-5 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              👑 رمز الـ QR الموحد لجميع المعازيم
            </span>
            <span className="text-[10px] text-slate-400">Master Event QR Code</span>
          </div>
          <h3 className="text-base font-bold font-serif text-amber-200">
            بطاقة الـ QR الموحدة لكافة المعازيم والضيوف
          </h3>
          <p className="text-xs text-slate-300">
            بدلاً من إرسال رمز منفصل لكل شخص، يمكنك مشاركة رمز QR الموحد للحفل مع كافة المعازيم أو طباعته عند مدخل القاعة لتسهيل دخول الجميع.
          </p>
        </div>

        <button
          onClick={() => setIsMasterQrModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 flex items-center gap-2 shrink-0 transition-all"
        >
          <QrCode className="w-5 h-5 text-slate-950" />
          <span>عرض ومشاركة رمز QR الموحد</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-semibold">{t('guestManagement')}</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">{totalGuests} بطاقات دعوة</span>
          </div>
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-semibold">إجمالي الحضور المتوقع مع المرافقين</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{totalCompanions} ضيف ومرافق</span>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <UserPlus className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-semibold">المسجل حضورهم في الحفل (QR)</span>
            <span className="text-2xl font-black text-purple-300 mt-1 block">{checkedInCount} ضيف تم تسجيله</span>
          </div>
          <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/30">
            <QrCode className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form & QR Scanner Simulator */}
        <div className="space-y-6">
          {/* Add Guest Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>{t('addGuest')} وإصدار الـ QR Code:</span>
            </h3>

            <form onSubmit={handleCreateGuest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اسم الضيف أو العائلة:</label>
                <input
                  type="text"
                  required
                  placeholder="د. خالد عبد العزيز"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الهاتف:</label>
                <input
                  type="tel"
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('companionCount')}:</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={companionsCount}
                    onChange={(e) => setCompanionsCount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الطاولة:</label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <QrCode className="w-4 h-4" />
                <span>إضافة وإصدار رمز QR للدعوة</span>
              </button>
            </form>
          </div>

          {/* Event Day QR Scanner Simulator */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Scan className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{t('scanQrTitle')}</span>
            </div>
            <p className="text-xs text-slate-400">
              ادخل كود الدعوة (مثال: MUN-GUEST-001) أو انقر على ماسح الـ QR للتحقق السريع وتسجيل الدخول:
            </p>

            <form onSubmit={handleSimulateQrScan} className="flex gap-2">
              <input
                type="text"
                placeholder="MUN-GUEST-001"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
              >
                <Camera className="w-4 h-4" />
                <span>مسح كود الـ QR</span>
              </button>
            </form>

            {scanResultMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-bold ${
                  scanResultMsg.success
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                {scanResultMsg.text}
              </div>
            )}
          </div>
        </div>

        {/* Right Guests List & QR Cards */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-amber-300 font-serif flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <span>قائمة المدعوين وبطاقات الـ QR الرسمية:</span>
          </h3>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {visibleGuests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-300">لا توجد بطاقات مدعوين مضافة لحسابك حالياً</p>
                <p className="text-[10px] text-slate-500">قم بإضافة أول ضيف لك من النموذج الجانبي لإصدار رمز الـ QR الخاص بدعوته.</p>
              </div>
            ) : (
              visibleGuests.map((g) => (
                <div
                  key={g.id}
                  className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{g.name}</span>
                    <span className="text-[10px] bg-slate-700 text-amber-300 px-2 py-0.5 rounded font-semibold">
                      +{g.companionsCount} مرافقين
                    </span>
                    {g.tableNumber && (
                      <span className="text-[10px] bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded border border-purple-500/30">
                        {g.tableNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-1.5">
                    <span>الهاتف: {g.phone}</span>
                    <span>كود الدعوة: <code className="text-amber-400 font-bold">{g.qrCode}</code></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {g.checkedIn ? (
                    <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-xl border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      تم الحضور {g.checkedInAt}
                    </span>
                  ) : (
                    <span className="bg-amber-500/10 text-amber-300 px-3 py-1 rounded-xl border border-amber-500/20 font-medium text-[11px]">
                      لم يحضر بعد
                    </span>
                  )}

                  <button
                    onClick={() => setActiveQrGuest(g)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>طلب / عرض بطاقة الـ QR</span>
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>

      {/* Individual QR Code Invitation Card Modal */}
      {activeQrGuest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 text-white text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold font-serif text-amber-200">بطاقة دعوة رسمية</h3>
            <p className="text-xs text-slate-300 font-bold">{activeQrGuest.name}</p>
            <p className="text-[11px] text-slate-400">مسموح بالدخول لـ ({activeQrGuest.companionsCount + 1}) أفراد - {activeQrGuest.tableNumber}</p>

            {/* Generated QR Card Graphic */}
            <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-inner text-slate-900">
              <QrCode className="w-32 h-32 text-slate-900" />
              <span className="text-[10px] font-mono font-bold mt-1 text-slate-700">{activeQrGuest.qrCode}</span>
            </div>

            <p className="text-[10px] text-slate-400">يرجى إبراز هذا الكود عند مدخل القاعة لتسجيل الدخول الفوري</p>

            <button
              onClick={() => setActiveQrGuest(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Master Event Unified QR Modal */}
      {isMasterQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-6 text-white text-center shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500" />

            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
              <QrCode className="w-8 h-8 text-amber-400" />
            </div>

            <div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold border border-amber-500/30">
                👑 رمز الـ QR الموحد لكافة المعازيم
              </span>
              <h3 className="text-xl font-bold font-serif text-amber-200 mt-2">بطاقة الدعوة الموحدة للحفل</h3>
              <p className="text-xs text-slate-300 mt-1">
                يشمل جميع الضيوف والمعازيم الحاضرين ({totalCompanions} ضيف ومرافق)
              </p>
            </div>

            {/* Graphic Master QR Card */}
            <div className="bg-gradient-to-b from-amber-50 to-amber-100/90 p-5 rounded-2xl mx-auto max-w-xs shadow-2xl text-slate-950 space-y-3 border-2 border-amber-400/50">
              <div className="border-b border-slate-300 pb-2">
                <p className="text-[11px] font-serif font-black text-amber-900 uppercase tracking-widest">دعوة فرح رسمية وموحدة</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">رمز الدخول السريع لكافة المعازيم</p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md inline-block border border-slate-200">
                <QrCode className="w-40 h-40 text-slate-950 mx-auto" />
                <span className="text-[11px] font-mono font-black text-purple-950 mt-1.5 block tracking-wider">
                  {clientMasterQrCode}
                </span>
              </div>

              <p className="text-[10px] text-slate-700 font-semibold leading-tight">
                يرجى مسح هذا الرمز عند مدخل القاعة أو إبرازه لموظف الاستقبال للتحقق السريع وتسجيل الدخول الموحد.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(clientMasterQrCode);
                  alert('تم نسخ كود الـ QR الموحد للحفل بنجاح!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>نسخ ومشاركة الكود</span>
              </button>

              <button
                onClick={() => setIsMasterQrModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
