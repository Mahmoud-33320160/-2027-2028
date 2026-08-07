import React, { useState } from 'react';
import { Service, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { MapPin, Navigation, Compass, Star, Users, Phone, Calendar, ExternalLink } from 'lucide-react';

interface GoogleMapsViewProps {
  services: Service[];
  language: Language;
  onSelectServiceToBook: (service: Service) => void;
}

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  services,
  language,
  onSelectServiceToBook,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [selectedService, setSelectedService] = useState<Service | null>(services[0] || null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: 30.0444,
    lng: 31.2357,
    name: 'وسط البلد - القاهرة (موقعك الإفتراضي)',
  });

  // Calculate distance between user location and service location in km
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d * 10) / 10;
  };

  const getEstDurationMinutes = (distanceKm: number) => {
    // Approx 30 km/h average traffic in Greater Cairo
    const minutes = Math.round((distanceKm / 35) * 60) + 10;
    return minutes;
  };

  const distKm = selectedService
    ? calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        selectedService.location.lat,
        selectedService.location.lng
      )
    : 0;

  const durationMin = getEstDurationMinutes(distKm);

  return (
    <div className="space-y-6">
      {/* Title & Location Selector Header */}
      <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>{t('mapTitle')}</span>
          </div>
          <h2 className="text-2xl font-black mt-1 font-serif text-amber-100">
            {language === 'en' ? 'Interactive Google Maps & Route Calculator' : 'تحديد أماكن القاعات والمطاعم والكافيهات وطريق الوصول'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            القاهرة والجيزة والقليوبية - حساب المسافات وزمن الوصول التقديري لحفلتك
          </p>
        </div>

        {/* User Location Preset Switcher */}
        <div className="bg-slate-800/90 p-2 rounded-2xl border border-slate-700 text-xs flex flex-wrap gap-2">
          <span className="text-slate-400 self-center px-1 font-semibold">{t('userLocation')}:</span>
          <button
            onClick={() => setUserLocation({ lat: 30.0444, lng: 31.2357, name: 'وسط البلد - القاهرة' })}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              userLocation.lat === 30.0444 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            القاهرة (وسط البلد)
          </button>
          <button
            onClick={() => setUserLocation({ lat: 29.98, lng: 31.132, name: 'الهرم - الجيزة' })}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              userLocation.lat === 29.98 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            الجيزة (الهرم)
          </button>
          <button
            onClick={() => setUserLocation({ lat: 30.466, lng: 31.185, name: 'بنها - القليوبية' })}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              userLocation.lat === 30.466 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            القليوبية (بنها)
          </button>
        </div>
      </div>

      {/* Main Map Interactive Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Services List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 h-[550px] overflow-y-auto space-y-3">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider px-2">
            القاعات والخدمات على الخريطة ({services.length}):
          </h3>

          {services.map((srv) => {
            const isSelected = selectedService?.id === srv.id;
            const itemDist = calculateDistanceKm(
              userLocation.lat,
              userLocation.lng,
              srv.location.lat,
              srv.location.lng
            );

            return (
              <div
                key={srv.id}
                onClick={() => setSelectedService(srv)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex gap-3 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                }`}
              >
                <img
                  src={srv.imageUrls[0]}
                  alt={srv.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {srv.governorate === 'cairo' ? 'القاهرة' : srv.governorate === 'giza' ? 'الجيزة' : 'القليوبية'}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">{srv.price.toLocaleString()} ج.م</span>
                  </div>

                  <h4 className="text-sm font-bold text-white truncate mt-1">
                    {language === 'en' ? srv.titleEn : srv.title}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Navigation className="w-3 h-3 text-amber-400" />
                      {itemDist} كم
                    </span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {srv.rating}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center/Right: Interactive Simulated Map Stage & Distance Inspector */}
        <div className="lg:col-span-2 space-y-4">
          {/* Simulated Google Map Canvas */}
          <div className="relative w-full h-[380px] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-950 flex flex-col justify-between p-6 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Map Header Overlay */}
            <div className="relative z-10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 text-xs text-white">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="font-bold">Google Maps Engine - القاهرة الكبرى</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                متصل بخريطة الموقع
              </span>
            </div>

            {/* Visual Markers Simulation on Canvas */}
            <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
              <div className="relative w-full h-full border border-slate-800/80 rounded-2xl bg-slate-900/40 backdrop-blur-xs flex items-center justify-center overflow-hidden">
                {/* SVG Route Line connecting user and target */}
                {selectedService && (
                  <svg className="absolute inset-0 w-full h-full text-amber-500/40" xmlns="http://www.w3.org/2000/svg">
                    <line x1="20%" y1="70%" x2="75%" y2="35%" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" />
                  </svg>
                )}

                {/* User Pin */}
                <div className="absolute left-[20%] top-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 border-2 border-white text-white flex items-center justify-center shadow-lg shadow-indigo-500/40">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded-md mt-1 border border-slate-700">
                    موقعك
                  </span>
                </div>

                {/* Venue Pins */}
                {services.map((srv, idx) => {
                  const isSelected = selectedService?.id === srv.id;
                  // Calculate mock positioning coords
                  const posX = 35 + ((idx * 17) % 50);
                  const posY = 20 + ((idx * 23) % 55);

                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      style={{ left: `${posX}%`, top: `${posY}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all pointer-events-auto hover:scale-125 z-20 ${
                        isSelected ? 'scale-125 z-30' : 'opacity-80'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full border-2 text-white shadow-xl ${
                          isSelected
                            ? 'bg-amber-500 border-white shadow-amber-500/50 animate-pulse'
                            : 'bg-rose-600 border-rose-300'
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-100 bg-slate-900/90 px-2 py-0.5 rounded-md mt-1 border border-slate-700 whitespace-nowrap max-w-[120px] truncate">
                        {language === 'en' ? srv.titleEn : srv.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Floating Stats Bar */}
            {selectedService && (
              <div className="relative z-10 bg-slate-900/95 backdrop-blur-md border border-amber-500/30 p-4 rounded-2xl text-xs flex flex-wrap items-center justify-between gap-3 text-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t('calculateRoute')}</span>
                    <span className="font-bold text-white text-sm">
                      {userLocation.name} ⬅️ {selectedService.district} ({selectedService.governorate === 'cairo' ? 'القاهرة' : selectedService.governorate === 'giza' ? 'الجيزة' : 'القليوبية'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    <span className="text-slate-400 font-normal">{t('distance')} </span>
                    <span className="text-amber-400 text-sm">{distKm} كم</span>
                  </div>
                  <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    <span className="text-slate-400 font-normal">{t('duration')} </span>
                    <span className="text-emerald-400 text-sm">{durationMin} دقيقة</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected Venue Details Card */}
          {selectedService && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedService.imageUrls[0]}
                  alt={selectedService.title}
                  className="w-20 h-20 rounded-2xl object-cover border border-amber-500/30 shrink-0"
                />
                <div>
                  <h3 className="text-lg font-bold font-serif text-amber-200">
                    {language === 'en' ? selectedService.titleEn : selectedService.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedService.address}
                  </p>
                  <div className="flex items-center gap-3 text-xs mt-2">
                    <span className="text-emerald-400 font-black text-sm">
                      {selectedService.price.toLocaleString()} ج.م
                    </span>
                    {selectedService.capacity && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        يتسع لـ {selectedService.capacity} ضيف
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectServiceToBook(selectedService)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all shrink-0 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('bookNow')} (عربون 10%)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
