import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Language,
  Service,
  Booking,
  TaskItem,
  BudgetItem,
  Guest,
  PlaylistItem,
  MusicCustomRequest,
  PromoCode,
  Governorate,
  ServiceCategory,
  UserProfile,
  VendorApplication,
  VendorApplicationStatus,
} from './types';
import { StorageManager } from './lib/storage';
import { getTranslation } from './lib/translations';

// Components
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { BookingModal } from './components/BookingModal';
import { GoogleMapsView } from './components/GoogleMapsView';
import { CalendarView } from './components/CalendarView';
import { MakeupArtistView } from './components/MakeupArtistView';
import { MusicView } from './components/MusicView';
import { AiAssistantView } from './components/AiAssistantView';
import { DashboardAndBudgetView } from './components/DashboardAndBudgetView';
import { GuestManagementView } from './components/GuestManagementView';
import { BookingsHistoryView } from './components/BookingsHistoryView';
import { GoogleDriveView } from './components/GoogleDriveView';
import { GoogleTasksView } from './components/GoogleTasksView';
import { GmailView } from './components/GmailView';
import { VendorApplicationView } from './components/VendorApplicationView';
import { VendorPanel } from './components/VendorPanel';
import { AdminPanel } from './components/AdminPanel';

// Icons
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Sparkles,
  Music,
  CheckSquare,
  Users,
  CreditCard,
  Building2,
  Camera,
  Paintbrush,
  Utensils,
  Disc,
  HeartHandshake,
  Coffee,
  Star,
  SlidersHorizontal,
  Plus,
  ShieldCheck,
  Store,
  HardDrive,
  Mail,
} from 'lucide-react';

export function App() {
  // App Authentication & User States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => StorageManager.getCurrentUser());
  const [users, setUsers] = useState<UserProfile[]>(() => StorageManager.getUsers());
  const [role, setRole] = useState<UserRole>(() => {
    const user = StorageManager.getCurrentUser();
    return user ? user.role : 'client';
  });
  const [language, setLanguage] = useState<Language>('ar');

  // Client Tab Switcher
  type TabType =
    | 'search'
    | 'maps'
    | 'calendar'
    | 'makeup'
    | 'music'
    | 'ai_assistant'
    | 'dashboard'
    | 'guests'
    | 'bookings'
    | 'google_drive'
    | 'google_tasks'
    | 'gmail'
    | 'become_vendor';
  const [activeTab, setActiveTab] = useState<TabType>('search');

  // Data States from StorageManager
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [vendorApplications, setVendorApplications] = useState<VendorApplication[]>([]);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(100000);

  // Active Booking Modal
  const [selectedServiceToBook, setSelectedServiceToBook] = useState<Service | null>(null);

  // Load Initial Data on Mount
  useEffect(() => {
    setServices(StorageManager.getServices());
    setBookings(StorageManager.getBookings());
    setTasks(StorageManager.getTasks());
    setBudget(StorageManager.getBudget());
    setGuests(StorageManager.getGuests());
    setPlaylists(StorageManager.getPlaylists());
    setPromoCodes(StorageManager.getPromoCodes());
    setUsers(StorageManager.getUsers());
    setVendorApplications(StorageManager.getVendorApplications());
  }, []);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Auth & User Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setRole(user.role);
    setUsers(StorageManager.getUsers());
  };

  const handleLogout = () => {
    StorageManager.logout();
    setCurrentUser(null);
    setRole('client');
  };

  const handleRoleChange = (requestedRole: UserRole) => {
    const cleanEmail = currentUser?.email.trim().toLowerCase() || '';
    const isOwnerUser =
      currentUser?.role === 'admin' ||
      cleanEmail === 'mmmmm3332012@gmail.com' ||
      cleanEmail === 'mmm3332012@gmail.com';
    const isVendorUser = currentUser?.role === 'vendor' || isOwnerUser;

    const isSupportUser = currentUser?.role === 'support' || isOwnerUser;

    if (requestedRole === 'admin' && !isOwnerUser) {
      if (isSupportUser) {
        setRole('support');
        return;
      }
      setRole('client');
      return;
    }
    if (requestedRole === 'support' && !isSupportUser) {
      setRole('client');
      return;
    }
    if (requestedRole === 'vendor' && !isVendorUser) {
      setRole('client');
      return;
    }
    setRole(requestedRole);
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    const updatedUsers = StorageManager.updateUserRole(userId, newRole);
    setUsers(updatedUsers);
    const updatedCurrent = StorageManager.getCurrentUser();
    if (updatedCurrent) {
      setCurrentUser(updatedCurrent);
    }
  };

  const handleUpdateVendorApplicationStatus = (
    appId: string,
    status: VendorApplicationStatus,
    rejectionReason?: string
  ) => {
    const updated = StorageManager.updateVendorApplicationStatus(appId, status, rejectionReason);
    setVendorApplications(updated);
    setUsers(StorageManager.getUsers());
    const updatedCurrent = StorageManager.getCurrentUser();
    if (updatedCurrent) {
      setCurrentUser(updatedCurrent);
    }
  };

  // Handlers
  const handleConfirmBooking = (newBooking: Booking) => {
    StorageManager.addBooking(newBooking);
    setBookings(StorageManager.getBookings());
    setServices(StorageManager.getServices()); // Re-fetch updated services available dates
    setSelectedServiceToBook(null);
    setActiveTab('bookings');
  };

  const handleCancelBooking = (bookingId: string) => {
    StorageManager.cancelBooking(bookingId);
    setBookings(StorageManager.getBookings());
  };

  const handleUpdateBookingStatus = (bookingId: string, status: Booking['status']) => {
    StorageManager.updateBookingStatus(bookingId, status);
    setBookings(StorageManager.getBookings());
  };

  const handleAddService = (newService: Service) => {
    StorageManager.addService(newService);
    setServices(StorageManager.getServices());
  };

  const handleUpdateService = (updatedService: Service) => {
    StorageManager.updateService(updatedService);
    setServices(StorageManager.getServices());
  };

  const handleDeleteService = (serviceId: string) => {
    StorageManager.deleteService(serviceId);
    setServices(StorageManager.getServices());
  };

  const handleAddUser = (newUser: UserProfile) => {
    StorageManager.addUser(newUser);
    setUsers(StorageManager.getUsers());
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    StorageManager.updateUser(updatedUser);
    setUsers(StorageManager.getUsers());
  };

  const handleDeleteUser = (userId: string) => {
    StorageManager.deleteUser(userId);
    setUsers(StorageManager.getUsers());
  };

  const handleDeleteBooking = (bookingId: string) => {
    StorageManager.deleteBooking(bookingId);
    setBookings(StorageManager.getBookings());
  };

  const handleDeletePromoCode = (promoId: string) => {
    const updatedPromos = StorageManager.getPromoCodes().filter((p) => p.id !== promoId);
    localStorage.setItem('munasabati_promos', JSON.stringify(updatedPromos));
    setPromoCodes(updatedPromos);
  };

  const handleUpdateTasks = (updatedTasks: TaskItem[]) => {
    StorageManager.saveTasks(updatedTasks);
    setTasks(updatedTasks);
  };

  const handleUpdateBudget = (updatedBudget: BudgetItem[]) => {
    StorageManager.saveBudget(updatedBudget);
    setBudget(updatedBudget);
  };

  const handleAddGuest = (newGuest: Guest) => {
    StorageManager.addGuest(newGuest);
    setGuests(StorageManager.getGuests());
  };

  const handleCheckInGuestByQr = (qrCode: string) => {
    const res = StorageManager.checkInGuestByQr(qrCode);
    if (res) {
      setGuests(StorageManager.getGuests());
    }
    return res;
  };

  const handleAddPromoCode = (promo: PromoCode) => {
    StorageManager.addPromoCode(promo);
    setPromoCodes(StorageManager.getPromoCodes());
  };

  const handleRequestCustomMusic = (req: MusicCustomRequest) => {
    StorageManager.addMusicRequest(req);
  };

  // Filtered Services List
  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGov = selectedGovernorate === 'all' || srv.governorate === selectedGovernorate;
    const matchesCat = selectedCategory === 'all' || srv.category === selectedCategory;
    const matchesPrice = srv.price <= maxPrice;

    return matchesSearch && matchesGov && matchesCat && matchesPrice;
  });

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pb-20"
    >
      {/* Mandatory Registration / Login Screen for unauthenticated users */}
      {!currentUser && (
        <AuthScreen onLoginSuccess={handleLoginSuccess} language={language} />
      )}

      {/* Navbar with Role & Language Switchers */}
      <Navbar
        currentRole={role}
        onRoleChange={handleRoleChange}
        language={language}
        onLanguageChange={setLanguage}
        currentUser={currentUser}
        onLogout={handleLogout}
        pendingVendorAppsCount={vendorApplications.filter((a) => a.status === 'pending').length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Tabs Bar for Client View */}
        {role === 'client' && (
          <nav className="bg-slate-900/90 border border-amber-500/20 p-2 rounded-2xl shadow-xl flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'search'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{t('tabSearch')}</span>
            </button>

            <button
              onClick={() => setActiveTab('maps')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'maps'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{t('tabMaps')}</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>{t('tabCalendar')}</span>
            </button>

            <button
              onClick={() => setActiveTab('makeup')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'makeup'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <span>{t('tabMakeup')}</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'music'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Music className="w-4 h-4 text-amber-400" />
              <span>{t('tabMusic')}</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_assistant')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'ai_assistant'
                  ? 'bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-purple-500/20 font-black'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{t('tabAiAssistant')}</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>{t('tabDashboard')}</span>
            </button>

            <button
              onClick={() => setActiveTab('guests')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'guests'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('tabGuests')}</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>
                {t('tabBookings')} ({currentUser ? (role === 'admin' || currentUser.email.toLowerCase() === 'mmmmm3332012@gmail.com' ? bookings.length : bookings.filter((b) => (b.clientEmail && b.clientEmail.toLowerCase() === currentUser.email.toLowerCase()) || (b.clientPhone && currentUser.phone && b.clientPhone === currentUser.phone)).length) : 0})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('become_vendor')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'become_vendor'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-purple-500/20 font-black'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Store className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>{t('tabBecomeVendor')}</span>
            </button>
          </nav>
        )}

        {/* CLIENT ROLE VIEWS */}
        {role === 'client' && (
          <>
            {/* View 1: Service Search & Filters */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                {/* Hero Banner */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-amber-500/20 p-8 text-white shadow-2xl">
                  <div className="relative z-10 max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>احجز مناسبتك كاملة في مكان واحد بعربون 10% فقط</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black font-serif text-amber-100 leading-tight">
                      منصتك الأولى لتنظيم الزفاف، الخطوبة، وحجوزات الكافيهات والمطاعم
                    </h2>
                    <p className="text-xs text-slate-300">
                      القاهرة، الجيزة، والقليوبية - قاعات أفراح، مصورين، ديكور، دي جي، كاترينج، وميكب آرتيست مع إرفاق بطاقة الرقم القومي للضمان.
                    </p>
                  </div>
                </div>

                {/* Filter Controls Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
                      <input
                        type="text"
                        placeholder="ابحث باسم القاعة، المصور، أو المنطقة (المعادي، الهرم، بنها)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl pr-11 pl-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Governorate Filter */}
                    <div className="w-full sm:w-48">
                      <select
                        value={selectedGovernorate}
                        onChange={(e) => setSelectedGovernorate(e.target.value as Governorate | 'all')}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="all">{t('allGovernorates')}</option>
                        <option value="cairo">{t('govCairo')}</option>
                        <option value="giza">{t('govGiza')}</option>
                        <option value="qalyubia">{t('govQalyubia')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        selectedCategory === 'all'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {t('allCategories')}
                    </button>

                    <button
                      onClick={() => setSelectedCategory('hall')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        selectedCategory === 'hall'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{t('catHalls')}</span>
                    </button>

                    <button
                      onClick={() => setSelectedCategory('photographer')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        selectedCategory === 'photographer'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t('catPhotographers')}</span>
                    </button>

                    <button
                      onClick={() => setSelectedCategory('decor')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        selectedCategory === 'decor'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Paintbrush className="w-3.5 h-3.5" />
                      <span>{t('catDecor')}</span>
                    </button>

                    <button
                      onClick={() => setSelectedCategory('catering')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        selectedCategory === 'catering'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{t('catCatering')}</span>
                    </button>

                    <button
                      onClick={() => setSelectedCategory('music')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        selectedCategory === 'music'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Disc className="w-3.5 h-3.5" />
                      <span>{t('catMusic')}</span>
                    </button>

                    <button
                      onClick={() => setSelectedCategory('makeup')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        selectedCategory === 'makeup'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>{t('catMakeup')}</span>
                    </button>

                    <button
                      onClick={() => setSelectedCategory('cafe_restaurant')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        selectedCategory === 'cafe_restaurant'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>{t('catCafeRestaurant')}</span>
                    </button>
                  </div>
                </div>

                {/* Services Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-all group"
                    >
                      <div>
                        {/* Image */}
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={service.imageUrls[0]}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[10px] font-bold text-amber-300">
                            {service.governorate === 'cairo' ? 'القاهرة' : service.governorate === 'giza' ? 'الجيزة' : 'القليوبية'} ({service.district})
                          </div>
                          <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 font-black px-3 py-1 rounded-xl text-xs shadow-lg">
                            عربون 10% = {Math.round(service.price * 0.1).toLocaleString()} ج.م
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-semibold">{service.vendorName}</span>
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{service.rating}</span>
                              <span className="text-slate-500 text-[10px]">({service.reviewsCount})</span>
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-white font-serif">
                            {language === 'en' ? service.titleEn : service.title}
                          </h3>

                          <p className="text-xs text-slate-300 line-clamp-2">
                            {language === 'en' ? service.descriptionEn : service.description}
                          </p>

                          <div className="pt-2 flex items-baseline justify-between border-t border-slate-800">
                            <span className="text-xs text-slate-400">{t('price')}:</span>
                            <span className="text-xl font-black text-amber-400">
                              {service.price.toLocaleString()} {t('egp')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="p-5 pt-0">
                        <button
                          onClick={() => setSelectedServiceToBook(service)}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <CalendarIcon className="w-4 h-4" />
                          <span>{t('bookNow')} (دفع عربون 10%)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View 2: Maps View */}
            {activeTab === 'maps' && (
              <GoogleMapsView
                services={services}
                language={language}
                onSelectServiceToBook={setSelectedServiceToBook}
              />
            )}

            {/* View 3: Calendar View */}
            {activeTab === 'calendar' && (
              <CalendarView
                services={services}
                language={language}
                onSelectDateToBook={(service, dateStr) => setSelectedServiceToBook(service)}
              />
            )}

            {/* View 4: Makeup Artist View */}
            {activeTab === 'makeup' && (
              <MakeupArtistView
                services={services}
                language={language}
                onSelectServiceToBook={setSelectedServiceToBook}
              />
            )}

            {/* View 5: Music View */}
            {activeTab === 'music' && (
              <MusicView
                playlists={playlists}
                language={language}
                onRequestCustomMusic={handleRequestCustomMusic}
              />
            )}

            {/* View 6: AI Assistant View */}
            {activeTab === 'ai_assistant' && <AiAssistantView language={language} />}

            {/* View 7: Dashboard View */}
            {activeTab === 'dashboard' && (
              <DashboardAndBudgetView
                tasks={tasks}
                budget={budget}
                language={language}
                onUpdateTasks={handleUpdateTasks}
                onUpdateBudget={handleUpdateBudget}
              />
            )}

            {/* View 8: Guest Management View */}
            {activeTab === 'guests' && (
              <GuestManagementView
                guests={guests}
                language={language}
                onAddGuest={handleAddGuest}
                onCheckInGuestByQr={handleCheckInGuestByQr}
              />
            )}

            {/* View 9: Bookings History View */}
            {activeTab === 'bookings' && (
              <BookingsHistoryView
                bookings={bookings}
                language={language}
                onCancelBooking={handleCancelBooking}
              />
            )}

            {/* View 10: Google Drive Documents View */}
            {activeTab === 'google_drive' && <GoogleDriveView />}

            {/* View 11: Google Tasks Sync View */}
            {activeTab === 'google_tasks' && <GoogleTasksView />}

            {/* View 12: Gmail Email Workspace View */}
            {activeTab === 'gmail' && <GmailView />}

            {/* View 13: Vendor Application View */}
            {activeTab === 'become_vendor' && (
              <VendorApplicationView
                currentUser={currentUser}
                onApplicationSubmitted={() => setVendorApplications(StorageManager.getVendorApplications())}
                onSwitchToVendorRole={() => {
                  setRole('vendor');
                  StorageManager.setRole('vendor');
                  if (currentUser) {
                    const updatedUser = { ...currentUser, role: 'vendor' as UserRole };
                    setCurrentUser(updatedUser);
                    StorageManager.setCurrentUser(updatedUser);
                  }
                }}
                language={language}
              />
            )}
          </>
        )}

        {/* VENDOR ROLE VIEW */}
        {role === 'vendor' && (
          <VendorPanel
            services={services}
            bookings={bookings}
            promoCodes={promoCodes}
            language={language}
            onAddService={handleAddService}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onAddPromoCode={handleAddPromoCode}
          />
        )}

        {/* ADMIN & CUSTOMER SUPPORT ROLE VIEW */}
        {(role === 'admin' || role === 'support') && (
          <AdminPanel
            bookings={bookings}
            services={services}
            promoCodes={promoCodes}
            users={users}
            vendorApplications={vendorApplications}
            onAddPromoCode={handleAddPromoCode}
            onDeletePromoCode={handleDeletePromoCode}
            onAddService={handleAddService}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onUpdateUserRole={handleUpdateUserRole}
            onUpdateVendorApplicationStatus={handleUpdateVendorApplicationStatus}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onDeleteBooking={handleDeleteBooking}
            language={language}
          />
        )}
      </main>

      {/* Booking Modal with National ID Attachment & Deposit Calculation */}
      {selectedServiceToBook && (
        <BookingModal
          service={selectedServiceToBook}
          language={language}
          onClose={() => setSelectedServiceToBook(null)}
          onConfirmBooking={handleConfirmBooking}
        />
      )}
    </div>
  );
}

export default App;
