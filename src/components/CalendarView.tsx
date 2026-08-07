import React, { useState } from 'react';
import { Service, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, ChevronLeft, ChevronRight, MapPin, Sparkles } from 'lucide-react';

interface CalendarViewProps {
  services: Service[];
  language: Language;
  onSelectDateToBook: (service: Service, dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  services,
  language,
  onSelectDateToBook,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Month navigation for August 2026
  const [currentYear] = useState(2026);
  const [currentMonth] = useState(7); // August (0-indexed = 7)

  const daysInMonth = 31; // August has 31 days

  const getFormattedDate = (dayNum: number) => {
    const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    return `${currentYear}-08-${dayStr}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Service Dropdown Selector */}
      <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <CalendarIcon className="w-4 h-4" />
            <span>{t('calendarTitle')}</span>
          </div>
          <h2 className="text-2xl font-black mt-1 font-serif text-amber-100">
            {language === 'en' ? 'Availability Calendar & Direct Date Booking' : 'تقويم التوفر والحجز المباشر المتاح والمحجوز'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('selectDatePrompt')}
          </p>
        </div>

        {/* Service Picker */}
        <div className="w-full md:w-80">
          <label className="block text-xs font-bold text-slate-300 mb-1">اختر القاعة أو الخدمة لمشاهدة تقويمها:</label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
          >
            {services.map((srv) => (
              <option key={srv.id} value={srv.id}>
                {language === 'en' ? srv.titleEn : srv.title} ({srv.governorate === 'cairo' ? 'القاهرة' : srv.governorate === 'giza' ? 'الجيزة' : 'القليوبية'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeService && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
          {/* Active Service Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-3">
              <img
                src={activeService.imageUrls[0]}
                alt={activeService.title}
                className="w-14 h-14 rounded-xl object-cover border border-amber-500/30"
              />
              <div>
                <h3 className="font-bold text-base text-amber-200">
                  {language === 'en' ? activeService.titleEn : activeService.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeService.address}</span>
                </div>
              </div>
            </div>

            {/* Color Legend */}
            <div className="flex items-center gap-4 text-xs font-bold bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-700 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span className="text-emerald-300">متاح للحجز المباشر</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />
                <span className="text-rose-300">تاريخ محجوز مسبقاً</span>
              </div>
            </div>
          </div>

          {/* Month Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-amber-300 font-serif">
              أغسطس {currentYear} (August {currentYear})
            </h3>
            <span className="text-xs text-slate-400">
              انقر على أي يوم باللون الأخضر لبدء طلب الحجز
            </span>
          </div>

          {/* Weekday Grid Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-2">
            <div>السبت</div>
            <div>الأحد</div>
            <div>الاثنين</div>
            <div>الثلاثاء</div>
            <div>الأربعاء</div>
            <div>الخميس</div>
            <div>الجمعة</div>
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset for Saturday starting August 1 2026 */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`blank-${i}`} className="h-20 rounded-2xl bg-slate-950/40 opacity-20 border border-slate-900" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = getFormattedDate(dayNum);
              const isBooked = activeService.bookedDates.includes(dateStr);
              const isAvailable = activeService.availableDates.includes(dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    if (isAvailable) {
                      onSelectDateToBook(activeService, dateStr);
                    }
                  }}
                  className={`h-20 rounded-2xl p-2.5 border transition-all flex flex-col justify-between relative group ${
                    isBooked
                      ? 'bg-rose-950/40 border-rose-600/50 text-rose-300 cursor-not-allowed opacity-90'
                      : isAvailable
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 cursor-pointer hover:scale-105 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20'
                      : 'bg-slate-800/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black">{dayNum}</span>
                    {isBooked ? (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : isAvailable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : null}
                  </div>

                  <div className="text-[10px] font-bold">
                    {isBooked ? (
                      <span className="bg-rose-600/30 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30 block text-center">
                        محجوز
                      </span>
                    ) : isAvailable ? (
                      <span className="bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/30 block text-center">
                        متاح للحجز
                      </span>
                    ) : (
                      <span className="text-slate-500 block text-center">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
