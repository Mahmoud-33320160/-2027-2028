import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  Trash2, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  LogOut, 
  Sparkles, 
  FileText, 
  User, 
  Clock, 
  X, 
  Plus, 
  ShieldCheck, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  initAuth, 
  googleSignInForGmail, 
  listGmailMessages, 
  sendGmailMessage, 
  deleteGmailMessage, 
  GmailMessage 
} from '../lib/gmail';
import { User as FirebaseUser } from 'firebase/auth';

export const GmailView: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Compose Email States
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Status Alerts
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mandatory Action Confirmation Modals
  const [showSendConfirmModal, setShowSendConfirmModal] = useState<boolean>(false);
  const [msgToDelete, setMsgToDelete] = useState<GmailMessage | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        loadMessages(accessToken, searchQuery);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadMessages = async (authToken: string, query: string = '') => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const fetched = await listGmailMessages(authToken, query);
      setMessages(fetched);
    } catch (err: any) {
      console.error('Error loading Gmail messages:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'فشل تحميل الرسائل من حساب Gmail. يرجى إعادة تسجيل الدخول.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignInForGmail();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        loadMessages(res.accessToken, searchQuery);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'حدث خطأ أثناء تسجيل الدخول بحساب Google'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      loadMessages(token, searchQuery);
    }
  };

  // Pre-fill Template Handler
  const applyTemplate = (templateType: 'booking' | 'receipt' | 'reminder' | 'inquiry') => {
    if (templateType === 'booking') {
      setSubject('تأكيد حجز خدمة للمناسبة - منصة مناسباتي مصر');
      setEmailBody(
        `السلام عليكم ورحمة الله وبركاته،\n\n` +
        `نفيدكم بعد التنسيق بأنه تم تسجيل حجزكم بنجاح عبر منصة "مناسباتي مصر".\n\n` +
        `تفاصيل الحجز:\n` +
        `- قيمة العربون المدفوع (10%): تم السداد وتأكيد الحجز\n` +
        `- المبلغ المتبقي (90%): يُسدد قبل المناسبة بـ 10 أيام\n` +
        `- سياسة الإلغاء والاسترداد: استرداد رسمي مطبق وفق الشروط.\n\n` +
        `مع أطيب التمنيات بمناسبة أسطورية مكللة بالنجاح!\n` +
        `فريق عمل منصة مناسباتي مصر`
      );
    } else if (templateType === 'receipt') {
      setSubject('إيصال سداد عربون الحجز (10%) - مناسباتي مصر');
      setEmailBody(
        `أهلاً وسهلاً بكم،\n\n` +
        `مرفق لكم إيصال الاستلام الإلكتروني المؤكد لسداد العربون بنسبة 10% عبر المنصة.\n\n` +
        `رقم الحجز المرجعي: #MUN-${Math.floor(100000 + Math.random() * 900000)}\n` +
        `حالة الدفع: مدفوع مؤكد (10%)\n\n` +
        `نشكر اختياركم منصة مناسباتي مصر.`
      );
    } else if (templateType === 'reminder') {
      setSubject('تذكير موعد سداد المبلغ المتبقي قبل 10 أيام من المناسبة');
      setEmailBody(
        `مرحباً بكم،\n\n` +
        `نود تذكيركم بقرب موعد حفلكم الميمون، وبرجاء سداد المبلغ المتبقي (90%) قبل المناسبة بـ 10 أيام لتأكيد الجاهزية التامة والتنسيق النهائي مع مقدم الخدمة.\n\n` +
        `شاكرين لكم حسن تعاونكم.`
      );
    } else if (templateType === 'inquiry') {
      setSubject('استفسار خاص بشأن تفاصيل الخدمة - مناسباتي مصر');
      setEmailBody(
        `مرحباً،\n\n` +
        `أرغب بالاستفسار عن توافر المواعيد والخدمات الإضافية المتاحة لديك للمناسبة القادمة.\n\n` +
        `برجاء إفادتي بالتفاصيل المتاحة والأسعار.\n` +
        `تحياتي،`
      );
    }
  };

  // Step 1: Trigger Send Confirmation Modal
  const initiateSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim() || !emailBody.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال البريد الإلكتروني، العنوان، ونش الرسالة بالكامل.' });
      return;
    }
    setShowSendConfirmModal(true);
  };

  // Step 2: Confirm and Execute Send Email
  const confirmAndSendEmail = async () => {
    if (!token) return;
    setIsSending(true);
    setStatusMessage(null);
    try {
      await sendGmailMessage(token, {
        to: recipient,
        subject,
        body: emailBody
      });
      setStatusMessage({ type: 'success', text: 'تم إرسال البريد الإلكتروني عبر Gmail بنجاح!' });
      setIsComposing(false);
      setShowSendConfirmModal(false);
      setRecipient('');
      setSubject('');
      setEmailBody('');
      // Refresh inbox
      loadMessages(token, searchQuery);
    } catch (err: any) {
      console.error('Send Gmail error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'حدث خطأ أثناء إرسال البريد الإلكتروني.'
      });
      setShowSendConfirmModal(false);
    } finally {
      setIsSending(false);
    }
  };

  // Execute Trash Message
  const confirmDeleteMessage = async () => {
    if (!token || !msgToDelete) return;
    try {
      await deleteGmailMessage(token, msgToDelete.id);
      setStatusMessage({ type: 'success', text: 'تم نقل الرسالة إلى سلة المهملات بنجاح.' });
      if (selectedMessage?.id === msgToDelete.id) {
        setSelectedMessage(null);
      }
      setMsgToDelete(null);
      loadMessages(token, searchQuery);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'فشل حذف البريد الإلكتروني.'
      });
      setMsgToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Title & Workspace Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 p-6 sm:p-8 rounded-3xl border border-red-500/30 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs">
              <Mail className="w-4 h-4 text-red-400" />
              <span>ربط رسمي مع Google Workspace Gmail</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-amber-200">
              إدارة بريد الحجوزات والمراسلات (Gmail)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              إرسال واستقبال تأكيدات الحجز، إيصالات الاستلام، وتنبيهات الدفع ومتابعة العملاء مباشرة عبر بريدك الإلكتروني المعتمد في Gmail.
            </p>
          </div>

          {/* Auth State Button */}
          <div>
            {!user ? (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button shadow-xl hover:scale-105 transition-all"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '12px 20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  border: '1px solid #DADCE0'
                }}
              >
                <div className="gsi-material-button-icon" style={{ width: '22px', height: '22px' }}>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span style={{ color: '#1F1F1F', fontWeight: 'bold', fontSize: '14px', fontFamily: 'sans-serif' }}>
                  {isLoggingIn ? 'جاري الاتصال بحساب Gmail...' : 'ربط بريد Gmail مع المنصة'}
                </span>
              </button>
            ) : (
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border border-amber-400/50" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center">
                    {user.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-amber-200 block">{user.displayName || 'مستخدم Gmail'}</span>
                  <span className="text-[10px] text-slate-400 font-mono block dir-ltr">{user.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Unauthenticated Lock State */}
      {!user ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-6 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-serif text-amber-200">الربط مع Gmail مطلوب لاستخدام هذه الخدمة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              قم بتسجيل الدخول بحساب Google لتمكين إرسال تأكيدات الحجوزات، إيصالات الاستلام، وتصفح رسائل البريد الوارد المخصصة لمناسباتك مباشرة.
            </p>
          </div>
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 transition-all"
          >
            <Mail className="w-5 h-5" />
            <span>{isLoggingIn ? 'جاري الاتصال بـ Gmail...' : 'تسجيل الدخول عبر Google Gmail'}</span>
          </button>
        </div>
      ) : (
        /* Gmail Workspace View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Inbox & Search Controls */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Bar: Search & Action Buttons */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-auto flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  placeholder="بحث في بريد الحجوزات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </form>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => token && loadMessages(token, searchQuery)}
                  disabled={isLoading}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                  title="تحديث الرسائل"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
                  <span>تحديث</span>
                </button>

                <button
                  onClick={() => setIsComposing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء بريد جديد</span>
                </button>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] font-bold shrink-0">
                <Filter className="w-3 h-3 text-red-400" /> فلترة سريعة:
              </span>
              <button
                onClick={() => { setSearchQuery(''); token && loadMessages(token, ''); }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all shrink-0 ${
                  searchQuery === '' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => { setSearchQuery('حجز'); token && loadMessages(token, 'حجز'); }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all shrink-0 ${
                  searchQuery === 'حجز' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                الحجوزات
              </button>
              <button
                onClick={() => { setSearchQuery('عربون'); token && loadMessages(token, 'عربون'); }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all shrink-0 ${
                  searchQuery === 'عربون' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                إيصالات العربون
              </button>
            </div>

            {/* Messages List Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl min-h-[400px] space-y-3">
              {isLoading ? (
                <div className="py-20 text-center space-y-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 text-red-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold">جاري تحميل الرسائل من بريد Gmail...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-20 text-center space-y-3 text-slate-500">
                  <Inbox className="w-12 h-12 text-slate-700 mx-auto" />
                  <p className="text-sm font-bold">لا توجد رسائل بريد مطابقة للبحث حالياً</p>
                  <p className="text-xs">جرب الضغط على "إنشاء بريد جديد" لإرسال تأكيد أو إيصال للعميل.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        selectedMessage?.id === msg.id
                          ? 'bg-red-950/40 border-red-500/50 shadow-lg'
                          : msg.isUnread
                          ? 'bg-slate-800/90 border-amber-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300 truncate max-w-[200px] sm:max-w-[300px]">
                          {msg.from}
                        </span>
                        <div className="flex items-center gap-2">
                          {msg.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          )}
                          <span className="text-[10px] text-slate-400 dir-ltr">{msg.date}</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">{msg.subject}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{msg.snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Selected Message Detail OR Compose Pane */}
          <div className="lg:col-span-5">
            {selectedMessage ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-red-400 font-bold uppercase block">تفاصيل الرسالة</span>
                    <h3 className="text-lg font-bold text-amber-200 font-serif leading-snug">
                      {selectedMessage.subject}
                    </h3>
                  </div>
                  <button
                    onClick={() => setMsgToDelete(selectedMessage)}
                    className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-all"
                    title="حذف الرسالة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">المرسل:</span>
                    <span className="font-bold text-white dir-ltr truncate">{selectedMessage.from}</span>
                  </div>
                  {selectedMessage.to && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">المستلم:</span>
                      <span className="font-bold text-slate-300 dir-ltr truncate">{selectedMessage.to}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">التاريخ:</span>
                    <span className="text-slate-400 dir-ltr font-mono">{selectedMessage.date}</span>
                  </div>
                </div>

                {/* Message Body Content */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">محتوى البريد:</span>
                  <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {selectedMessage.bodyText || selectedMessage.snippet}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setRecipient(selectedMessage.from?.match(/<([^>]+)>/)?.[1] || selectedMessage.from || '');
                      setSubject(`رد: ${selectedMessage.subject}`);
                      setEmailBody(`\n\n------------------------\nفي ${selectedMessage.date} كتب ${selectedMessage.from}:\n> ${selectedMessage.snippet}`);
                      setIsComposing(true);
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all"
                  >
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>الرد على هذه الرسالة</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                <FileText className="w-12 h-12 text-slate-700 mx-auto" />
                <h4 className="text-sm font-bold text-amber-200">اختر رسالة لعرض تفاصيلها</h4>
                <p className="text-xs text-slate-400">
                  انقر على أي رسالة من القائمة اليسرى لقراءتها أو الرد عليها مباشرة عبر حساب Gmail المعتمد.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {isComposing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold font-serif text-amber-200">إنشاء بريد جديد - مناسباتي مصر</h3>
              </div>
              <button
                onClick={() => setIsComposing(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector Bar */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 block">نماذج سريعة جاهزة:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => applyTemplate('booking')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl border border-slate-700 text-center transition-all"
                >
                  تأكيد حجز
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('receipt')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold rounded-xl border border-slate-700 text-center transition-all"
                >
                  إيصال عربون
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('reminder')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold rounded-xl border border-slate-700 text-center transition-all"
                >
                  تذكير سداد
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('inquiry')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold rounded-xl border border-slate-700 text-center transition-all"
                >
                  استفسار عام
                </button>
              </div>
            </div>

            <form onSubmit={initiateSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني للمستلم (To):</label>
                <input
                  type="email"
                  required
                  placeholder="client@example.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان البريد (Subject):</label>
                <input
                  type="text"
                  required
                  placeholder="موضوع الرسالة..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نص الرسالة (Body):</label>
                <textarea
                  required
                  rows={6}
                  placeholder="اكتب نص البريد الإلكتروني هنا..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-lg shadow-red-500/20 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>متابعة لمراجعة الإرسال</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY Confirmation Dialog before Sending Email */}
      {showSendConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-200">تأكيد إرسال البريد الإلكتروني</h3>
                <p className="text-[11px] text-slate-400">يرجى التأكد من بيانات المستلم ومحتوى البريد قبل الإرسال الفعلي</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">المستلم:</span>
                <span className="font-bold text-emerald-400 font-mono dir-ltr">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">العنوان:</span>
                <span className="font-bold text-amber-300">{subject}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-4 text-[11px]">
                {emailBody}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSendConfirmModal(false)}
                disabled={isSending}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                تعديل الرسالة
              </button>
              <button
                onClick={confirmAndSendEmail}
                disabled={isSending}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'جاري الإرسال عبر Gmail...' : 'تأكيد وإرسال الآن'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY Confirmation Dialog before Deleting Email */}
      {msgToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-200">تأكيد حذف البريد الإلكتروني</h3>
                <p className="text-[11px] text-slate-400">سيتم نقل الرسالة إلى سلة المهملات بحساب Gmail الخاص بك</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 text-[10px] block">عنوان الرسالة:</span>
              <p className="font-bold text-rose-300">{msgToDelete.subject}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMsgToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteMessage}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
