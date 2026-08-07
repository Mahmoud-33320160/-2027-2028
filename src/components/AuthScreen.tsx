import React, { useState } from 'react';
import { UserProfile, Language, Governorate } from '../types';
import { StorageManager } from '../lib/storage';
import {
  ShieldCheck,
  UserCheck,
  Store,
  Heart,
  Lock,
  Mail,
  Phone,
  User,
  Key,
  Sparkles,
  CheckCircle2,
  Globe,
  X,
  Crown,
  Edit3,
  PhoneCall,
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  language: Language;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');

  // Register Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [governorate, setGovernorate] = useState<Governorate>('cairo');
  const [errorMsg, setErrorMsg] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Google Sign-In Custom Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('user.client@gmail.com');
  const [googleUsername, setGoogleUsername] = useState('عميل منصة مناسباتي');
  const [googlePassword, setGooglePassword] = useState('123456');
  const [googlePhone, setGooglePhone] = useState('010' + Math.floor(10000000 + Math.random() * 90000000));
  const [googleGovernorate, setGoogleGovernorate] = useState<Governorate>('cairo');

  const isOwnerEmail = (eStr: string) => {
    const clean = eStr.trim().toLowerCase();
    return clean === 'mmm3332012@gmail.com' || clean === 'mmmmm3332012@gmail.com';
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg('يرجى ملء جميع البيانات المطلوبة لإنشاء الحساب');
      return;
    }

    const existingUsers = StorageManager.getUsers();
    const isDup = existingUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (isDup) {
      setErrorMsg('هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.');
      return;
    }

    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      role: isOwnerEmail(email) ? 'admin' : 'client',
      governorate,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const savedUser = StorageManager.registerUser(newUser);
    onLoginSuccess(savedUser);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const users = StorageManager.getUsers();
    const cleanLogEmail = loginEmail.trim().toLowerCase();
    
    // Check if logging in as owner directly
    if (isOwnerEmail(cleanLogEmail)) {
      const owner = users.find((u) => isOwnerEmail(u.email)) || {
        id: 'usr-owner-1',
        name: 'المالك الوحيد والمدير العام',
        email: 'mmm3332012@gmail.com',
        phone: '01012345678',
        role: 'admin' as const,
        password: 'admin',
        createdAt: new Date().toISOString().split('T')[0],
      };

      const enteredPass = loginPassword.trim();
      const validPass = owner.password ? owner.password.trim() : 'admin';

      if (enteredPass && enteredPass !== validPass && enteredPass !== 'admin') {
        setErrorMsg('كلمة السر غير صحيحة لحساب المالك (كلمة السر الافتراضية هي: admin)');
        return;
      }

      StorageManager.setCurrentUser(owner);
      onLoginSuccess(owner);
      return;
    }

    const found = users.find(
      (u) =>
        u.email.trim().toLowerCase() === cleanLogEmail &&
        (!u.password || u.password.trim() === loginPassword.trim())
    );

    if (found) {
      StorageManager.setCurrentUser(found);
      onLoginSuccess(found);
    } else {
      setErrorMsg('البريد الإلكتروني أو كلمة السر غير صحيحة');
    }
  };

  const handleQuickOwnerLogin = () => {
    const ownerUser: UserProfile = {
      id: 'usr-owner-1',
      name: 'المالك الوحيد والمدير العام',
      email: 'mmm3332012@gmail.com',
      phone: '01012345678',
      role: 'admin',
      password: 'admin',
      createdAt: new Date().toISOString().split('T')[0],
    };
    StorageManager.setCurrentUser(ownerUser);
    onLoginSuccess(ownerUser);
  };

  const handleQuickSupportLogin = () => {
    const users = StorageManager.getUsers();
    const supportUser = users.find((u) => u.role === 'support') || {
      id: 'usr-support-1',
      name: 'سارة أحمد (ممثلة خدمة العملاء 1)',
      email: 'cs1@munasabati.com',
      phone: '01001110001',
      role: 'support' as const,
      password: '123',
      governorate: 'cairo' as const,
      createdAt: '2026-04-01',
    };
    StorageManager.setCurrentUser(supportUser);
    onLoginSuccess(supportUser);
  };

  const handleConfirmGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      alert('يرجى كتابة عنوان بريد Google / Gmail صحيح');
      return;
    }

    const cleanEmail = googleEmail.trim().toLowerCase();
    const existingUsers = StorageManager.getUsers();
    let foundUser = existingUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      foundUser = {
        id: 'usr-google-' + Date.now(),
        name: googleUsername.trim() || googleEmail.split('@')[0],
        email: cleanEmail,
        phone: googlePhone.trim() || '01000000000',
        password: googlePassword.trim() || '123456',
        role: isOwnerEmail(cleanEmail) ? 'admin' : 'client',
        governorate: googleGovernorate,
        createdAt: new Date().toISOString().split('T')[0],
      };
      StorageManager.registerUser(foundUser);
    } else {
      // Update display name & password if modified by user
      foundUser.name = googleUsername.trim() || foundUser.name;
      foundUser.phone = googlePhone.trim() || foundUser.phone;
      foundUser.password = googlePassword.trim() || foundUser.password || '123456';
      foundUser.governorate = googleGovernorate || foundUser.governorate;
      StorageManager.setCurrentUser(foundUser);
    }

    setShowGoogleModal(false);
    onLoginSuccess(foundUser);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-rose-500/5 to-transparent pointer-events-none" />

      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl my-auto">
        {/* Top Branding Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-xl shadow-amber-500/20 mb-1">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Heart className="w-8 h-8 text-amber-400 fill-amber-400/20 animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400 bg-clip-text text-transparent font-serif">
            منصة المناسبات والأفراح في مصر
          </h1>
          <p className="text-xs text-slate-300">
            تطبيق حجز قاعات الأفراح والمناسبات والمصوريين والميكب آرتيست والخدمات الكاملة
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200 font-bold flex items-center gap-2 text-right">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              نظام الحسابات: جميع التسجيلات الجديدة تكون كـ <strong className="text-white font-black underline">عميل فقط</strong>. وللتحول إلى مقدم خدمة، يتعين عليك تقديم طلب انضمام من داخل التطبيق، ويتم تحويل حسابك بعد موافقة المالك الوحيد.
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-6 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>إنشاء حساب جديد (عميل)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>الاسم الثلاثي أو اسم المستخدم:</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: أحمد محمود العروس"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>رقم الهاتف (واتساب):</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">المحافظة التابع لها:</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value as Governorate)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="cairo">القاهرة</option>
                  <option value="giza">الجيزة</option>
                  <option value="qalyubia">القليوبية</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>البريد الإلكتروني:</span>
              </label>
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>كلمة السر للحساب:</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>تسجيل الحساب والدخول كـ عميل</span>
            </button>
          </form>
        )}

        {/* TAB 2: LOGIN FORM */}
        {activeTab === 'login' && (
          <div className="space-y-4 text-xs">
            {/* Info Card for Owner Credentials */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-right space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>حساب المالك الوحيد للمنصة (Super Admin):</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-0.5 dir-ltr font-mono">
                <div>البريد: <span className="text-amber-200 font-bold">mmm3332012@gmail.com</span></div>
                <div>كلمة السر: <span className="text-amber-200 font-bold">admin</span> (أو اضغط زر الدخول المباشر بالأسفل)</div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">كلمة السر:</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                تسجيل الدخول للحساب
              </button>
            </form>

            {/* OWNER & SUPPORT DIRECT LOGIN ACCESS */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={handleQuickOwnerLogin}
                className="w-full p-3 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-500/50 rounded-2xl text-amber-200 font-bold text-xs flex items-center justify-between transition-all shadow-md group"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                  <div className="text-right">
                    <span className="block font-black text-amber-300">الدخول المباشر كـ المالك الوحيد (Super Admin) 👑</span>
                    <span className="text-[10px] text-slate-400 dir-ltr font-mono">mmm3332012@gmail.com</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg group-hover:scale-105 transition-all">
                  دخول المالك الآن
                </span>
              </button>

              <button
                type="button"
                onClick={handleQuickSupportLogin}
                className="w-full p-3 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 hover:border-cyan-400 border border-cyan-500/50 rounded-2xl text-cyan-200 font-bold text-xs flex items-center justify-between transition-all shadow-md group"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-cyan-400" />
                  <div className="text-right">
                    <span className="block font-black text-cyan-300">الدخول كـ ممثل خدمة العملاء (5 حسابات) 🎧</span>
                    <span className="text-[10px] text-slate-400 dir-ltr font-mono">cs1@munasabati.com (كلمة السر: 123)</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-cyan-500 text-slate-950 text-[10px] font-black rounded-lg group-hover:scale-105 transition-all">
                  دخول خدمة العملاء
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Google Auth Divider & Button */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="relative text-center">
            <span className="bg-slate-900 px-3 text-[11px] text-slate-400 font-bold relative z-10">
              أو التسجيل السريع بـ Google / Gmail:
            </span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md hover:border-amber-500/50"
          >
            <Globe className="w-4 h-4 text-rose-400" />
            <span>تسجيل الدخول والتسجيل بـ Google (تعديل اسم المستخدم) 🌐</span>
          </button>
        </div>
      </div>

      {/* GOOGLE SIGN-IN MODAL WITH EDITABLE USERNAME */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-amber-300">التسجيل والتأكيد بـ حساب Google / Gmail</h3>
                <p className="text-[11px] text-slate-400">يمكنك تعديل اسم المستخدم الخاص بك قبل إتمام التسجيل</p>
              </div>
            </div>

            <form onSubmit={handleConfirmGoogleLogin} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>عنوان بريد Google (Gmail):</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-amber-300 font-bold mb-1 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>اسم المستخدم (اسمك المعروض على التطبيق):</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="أدخل اسمك المعروض بالكامل"
                  value={googleUsername}
                  onChange={(e) => setGoogleUsername(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-amber-500/60 rounded-xl px-3.5 py-2.5 text-white font-black focus:outline-none focus:border-amber-400 text-sm"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  💡 يمكنك تعديل وتحديد أي اسم ثلاثي تفضله هنا.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>كلمة السر للحساب (لتسجيل الدخول مستقبلاً):</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={googlePassword}
                  onChange={(e) => setGooglePassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المحافظة:</label>
                  <select
                    value={googleGovernorate}
                    onChange={(e) => setGoogleGovernorate(e.target.value as Governorate)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                  >
                    <option value="cairo">القاهرة</option>
                    <option value="giza">الجيزة</option>
                    <option value="qalyubia">القليوبية</option>
                  </select>
                </div>
              </div>

              {isOwnerEmail(googleEmail) && (
                <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-200 font-bold text-xs flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>تم التعرف على بريد المالك الوحيد والمدير العام للمنصة تلقائياً! 👑</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد التسجيل بـ Google 🚀</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
