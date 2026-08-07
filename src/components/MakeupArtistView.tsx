import React, { useState } from 'react';
import { Service, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { Sparkles, Heart, Star, Check, Calendar, Phone, MapPin, Award, Eye } from 'lucide-react';

interface MakeupArtistViewProps {
  services: Service[];
  language: Language;
  onSelectServiceToBook: (service: Service) => void;
}

export const MakeupArtistView: React.FC<MakeupArtistViewProps> = ({
  services,
  language,
  onSelectServiceToBook,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const makeupServices = services.filter((s) => s.category === 'makeup');
  const [selectedArtist, setSelectedArtist] = useState<Service>(makeupServices[0] || services[0]);

  return (
    <div className="space-y-6">
      {/* Glamour Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900 via-rose-950 to-slate-900 border border-rose-500/30 p-8 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>{t('makeupTitle')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif text-amber-100 leading-tight">
            تألقي كالأميرات في ليلة العمر مع أشهر خبيرات التجميل
          </h2>
          <p className="text-sm text-rose-200/80 mt-2">
            {t('makeupSubtitle')}
          </p>
        </div>
      </div>

      {/* Makeup Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Artists */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            خبيرات التجميل المتاحات ({makeupServices.length}):
          </h3>

          {makeupServices.map((artist) => {
            const isSelected = selectedArtist?.id === artist.id;
            return (
              <div
                key={artist.id}
                onClick={() => setSelectedArtist(artist)}
                className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-rose-950/40 border-rose-500 text-white shadow-xl shadow-rose-950/40'
                    : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={artist.imageUrls[0]}
                    alt={artist.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-rose-500/30 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {artist.district}
                      </span>
                      <span className="text-xs font-bold text-rose-400">{artist.price.toLocaleString()} ج.م</span>
                    </div>

                    <h4 className="text-base font-bold text-white truncate mt-1">
                      {language === 'en' ? artist.titleEn : artist.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-amber-300 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {artist.rating} ({artist.reviewsCount} تقييم)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Showcase */}
        {selectedArtist && (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
            {/* Gallery Images */}
            <div className="grid grid-cols-2 gap-3">
              {selectedArtist.imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Portfolio"
                  className="w-full h-48 rounded-2xl object-cover border border-slate-800 hover:scale-[1.02] transition-all"
                />
              ))}
            </div>

            {/* Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-2xl font-bold font-serif text-amber-200">
                  {language === 'en' ? selectedArtist.titleEn : selectedArtist.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{selectedArtist.address}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectServiceToBook(selectedArtist)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2 shrink-0"
              >
                <Calendar className="w-4 h-4" />
                <span>حجز باقة الميكب (عربون 10% = {Math.round(selectedArtist.price * 0.1).toLocaleString()} ج.م)</span>
              </button>
            </div>

            {/* Makeup Packages List */}
            {selectedArtist.makeupPackages && selectedArtist.makeupPackages.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>الباقات والعروض المتاحة:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedArtist.makeupPackages.map((pkg, idx) => (
                    <div key={idx} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{pkg.name}</span>
                        <span className="text-sm font-black text-amber-400">{pkg.price.toLocaleString()} ج.م</span>
                      </div>
                      <p className="text-xs text-slate-300">{pkg.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Checklist */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase">مميزات هذه الخدمة:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                {selectedArtist.features.map((ft, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{ft}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
