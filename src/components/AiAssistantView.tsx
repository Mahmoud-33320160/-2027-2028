import React, { useState } from 'react';
import { Governorate, EventType, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { Sparkles, Bot, DollarSign, Users, MapPin, CheckCircle2, ArrowLeft, Loader2, PieChart } from 'lucide-react';

interface AiAssistantViewProps {
  language: Language;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ language }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [budget, setBudget] = useState<number>(50000);
  const [guestCount, setGuestCount] = useState<number>(200);
  const [governorate, setGovernorate] = useState<Governorate>('cairo');
  const [eventType, setEventType] = useState<EventType>('wedding');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    recommendation: string;
    suggestedPackage?: {
      hallBudget: number;
      makeupBudget: number;
      photoBudget: number;
      musicBudget: number;
    };
  } | null>(null);

  const handleGetRecommendation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          guestCount,
          governorate,
          eventType,
          language,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to get AI recommendation:', err);
      setResult({
        recommendation:
          language === 'en'
            ? 'Based on your parameters, allocate ~55% of budget for the hall, 15% for bridal makeup, 18% for cinema/photography, and 12% for DJ/Music. Settle 10% deposit now to secure your date!'
            : 'بناءً على الميزانية المحددة، ننصح بتخصيص 55% للقاعة والبوفيه، 15% للميكب آرتيست والتجميل، 18% للسيشن والفيديو السينمائي، و12% للدي جي والموسيقى. ادفع 10% عربون الآن وسدد باقي المبلغ قبل المناسبة بـ 10 أيام.',
        suggestedPackage: {
          hallBudget: Math.round(budget * 0.55),
          makeupBudget: Math.round(budget * 0.15),
          photoBudget: Math.round(budget * 0.18),
          musicBudget: Math.round(budget * 0.12),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border border-purple-500/30 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t('aiAssistantTitle')} (Gemini AI Engine)</span>
          </div>
          <h2 className="text-3xl font-black font-serif text-amber-100 leading-tight">
            مستشارك الذكي لحساب ميزانية المناسبة واختيار الخدمات المثالية
          </h2>
          <p className="text-xs text-purple-200/80 mt-2">
            {t('aiAssistantSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span>بيانات المناسبة والتحليل:</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('budgetInputLabel')}</span>
            </label>
            <input
              type="number"
              step="5000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              القيمة الحالية: {budget.toLocaleString()} {t('egp')}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('guestsInputLabel')}</span>
            </label>
            <input
              type="number"
              step="10"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>المحافظة المطلوبة:</span>
            </label>
            <select
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value as Governorate)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="cairo">{t('govCairo')}</option>
              <option value="giza">{t('govGiza')}</option>
              <option value="qalyubia">{t('govQalyubia')}</option>
            </select>
          </div>

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
            </select>
          </div>

          <button
            onClick={handleGetRecommendation}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('aiLoading')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t('getAiRecommendation')}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Recommendations */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
          {!result && !isLoading && (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl">
              <Bot className="w-16 h-16 text-purple-400/50 mb-3 animate-pulse" />
              <h4 className="text-lg font-bold text-slate-300">في انتظار مدخلاتك لإنشاء التوصية الذكية</h4>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                اضغط على زر "الحصول على اقتراحات المساعد الذكي" ليقوم نموذج Gemini بتوزيع ميزانيتك واقتراح الخطة الكاملة.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-8 space-y-3">
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
              <p className="text-sm font-bold text-slate-200">جاري تحليل أفضل القاعات والخدمات بواسطة Gemini...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-6 animate-fadeIn">
              {/* Package Budget Breakdown Card */}
              {result.suggestedPackage && (
                <div className="bg-slate-800/90 rounded-2xl p-5 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <PieChart className="w-4 h-4" />
                    <span>توزيع الميزانية المقترح بواسطة الذكاء الاصطناعي:</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">القاعة والبوفيه (55%)</span>
                      <span className="font-bold text-amber-300 text-sm">{result.suggestedPackage.hallBudget.toLocaleString()} ج.م</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">الميكب آرتيست (15%)</span>
                      <span className="font-bold text-rose-300 text-sm">{result.suggestedPackage.makeupBudget.toLocaleString()} ج.م</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">التصوير والسيشن (18%)</span>
                      <span className="font-bold text-indigo-300 text-sm">{result.suggestedPackage.photoBudget.toLocaleString()} ج.م</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">الدي جي والزفة (12%)</span>
                      <span className="font-bold text-emerald-300 text-sm">{result.suggestedPackage.musicBudget.toLocaleString()} ج.م</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Gemini Text Analysis */}
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-purple-500/30 space-y-2">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>التوصية المخصصة من Gemini AI:</span>
                </h4>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-medium pt-2">
                  {result.recommendation}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
