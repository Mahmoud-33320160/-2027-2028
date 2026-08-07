import React from 'react';
import { UserRole, Language, UserProfile } from '../types';
import { getTranslation } from '../lib/translations';
import { Sparkles, Globe, UserCheck, Store, ShieldCheck, Heart, LogOut, User, Crown, PhoneCall } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  pendingVendorAppsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  currentUser,
  onLogout,
  pendingVendorAppsCount = 0,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const cleanEmail = currentUser?.email.trim().toLowerCase() || '';
  const isOwner =
    currentUser?.role === 'admin' ||
    cleanEmail === 'mmmmm3332012@gmail.com' ||
    cleanEmail === 'mmm3332012@gmail.com';
  const isVendor = currentUser?.role === 'vendor' || isOwner;

  const [hasSeenBadge, setHasSeenBadge] = React.useState(false);

  React.useEffect(() => {
    if (currentRole === 'admin') {
      setHasSeenBadge(true);
    }
  }, [currentRole]);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-amber-500/20 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Heart className="w-6 h-6 text-amber-400 fill-amber-400/20 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400 bg-clip-text text-transparent font-serif tracking-wide">
                {t('appName')}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                مصر
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t('appTagline')}
            </p>
          </div>
        </div>

        {/* Right Action Controls: Current User Info + Role Switcher + Language + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current User Badge */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-slate-950 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs">
              {isOwner ? (
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              ) : isVendor ? (
                <Store className="w-4 h-4 text-purple-400 shrink-0" />
              ) : currentUser?.role === 'support' ? (
                <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0" />
              ) : (
                <User className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-white font-bold max-w-[120px] sm:max-w-none truncate">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-amber-300 font-bold">
                  {isOwner ? 'المالك الوحيد' : isVendor ? 'مقدم خدمة معتمد' : currentUser?.role === 'support' ? 'ممثل خدمة العملاء' : 'عميل'}
                </span>
              </div>
            </div>
          )}

          {/* Role selector buttons (Visible based on permissions) */}
          <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 flex items-center text-xs">
            <button
              onClick={() => onRoleChange('client')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all font-medium ${
                currentRole === 'client'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="واجهة العميل"
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden md:inline">عميل</span>
            </button>

            {(isVendor || isOwner) && (
              <button
                onClick={() => onRoleChange('vendor')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all font-medium ${
                  currentRole === 'vendor'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="واجهة مقدم الخدمة"
              >
                <Store className="w-4 h-4" />
                <span className="hidden md:inline">مقدم خدمة</span>
              </button>
            )}

            {currentUser?.role === 'support' && (
              <button
                onClick={() => onRoleChange('support')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all font-medium ${
                  currentRole === 'support'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="لوحة خدمة العملاء"
              >
                <PhoneCall className="w-4 h-4 text-cyan-300" />
                <span className="hidden md:inline">خدمة العملاء</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => {
                  onRoleChange('admin');
                  setHasSeenBadge(true);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all font-medium relative ${
                  currentRole === 'admin'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="لوحة تحكم المالك"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span className="hidden md:inline">المالك</span>
                {!hasSeenBadge && pendingVendorAppsCount > 0 && currentRole !== 'admin' && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-md">
                    {pendingVendorAppsCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Language Toggle Button */}
          <button
            onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
            title={t('language')}
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

