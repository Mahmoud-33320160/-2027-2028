import React, { useState } from 'react';
import { PlaylistItem, MusicCustomRequest, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { Music, Play, Square, Send, Disc, CheckCircle2, Mic2, Heart, Sparkles } from 'lucide-react';

interface MusicViewProps {
  playlists: PlaylistItem[];
  language: Language;
  onRequestCustomMusic: (req: MusicCustomRequest) => void;
}

export const MusicView: React.FC<MusicViewProps> = ({
  playlists,
  language,
  onRequestCustomMusic,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  // Custom song request form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [customSongInput, setCustomSongInput] = useState('');
  const [songList, setSongList] = useState<string[]>([
    'طلي بالأبيض - ماجدة الرومي',
    'مبروك عليا - مصطفى حجاج',
    'يا دبلة الخطوبة - شادية',
  ]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const handlePlayToggle = (pl: PlaylistItem) => {
    if (activePlayingId === pl.id) {
      // Stop
      if (audioObj) {
        audioObj.pause();
        setAudioObj(null);
      }
      setActivePlayingId(null);
    } else {
      // Play new
      if (audioObj) {
        audioObj.pause();
      }
      const newAudio = new Audio(pl.audioSampleUrl);
      newAudio.play().catch((err) => console.log('Audio playback preview:', err));
      setAudioObj(newAudio);
      setActivePlayingId(pl.id);

      newAudio.onended = () => {
        setActivePlayingId(null);
        setAudioObj(null);
      };
    }
  };

  const handleAddSong = () => {
    if (customSongInput.trim()) {
      setSongList([...songList, customSongInput.trim()]);
      setCustomSongInput('');
    }
  };

  const handleRemoveSong = (idx: number) => {
    setSongList(songList.filter((_, i) => i !== idx));
  };

  const handleCustomRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    const newReq: MusicCustomRequest = {
      id: 'mreq-' + Date.now(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      songList,
      specialInstructions: specialInstructions.trim(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onRequestCustomMusic(newReq);
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setClientName('');
      setClientPhone('');
      setSpecialInstructions('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Music Header */}
      <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Music className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>{t('musicTitle')}</span>
          </div>
          <h2 className="text-2xl font-black mt-1 font-serif text-amber-100">
            {language === 'en' ? 'Curated Wedding Playlists & Custom DJ Requests' : 'مكتبة الأغاني الجاهزة والزفة والدي جي للمناسبات'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('musicSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700 text-xs text-amber-300 font-bold shrink-0">
          <Disc className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>متاحة لجميع الحفلات والمناسبات</span>
        </div>
      </div>

      {/* Grid: Playlists & Custom Song Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlists List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Disc className="w-4 h-4 text-amber-400" />
            <span>قوائم التشغيل المجهزة لحفلتك:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {playlists.map((pl) => {
              const isPlaying = activePlayingId === pl.id;

              return (
                <div
                  key={pl.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                    isPlaying
                      ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        {pl.category === 'zaffa'
                          ? 'زفة بلدي'
                          : pl.category === 'bellydance'
                          ? 'رقص شرقي'
                          : pl.category === 'dj_set'
                          ? 'DJ سيت'
                          : pl.category === 'romantic'
                          ? 'سلو رومانسي'
                          : 'دبكة'}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{pl.duration}</span>
                    </div>

                    <h4 className="text-lg font-bold text-white mt-3 font-serif">
                      {language === 'en' ? pl.titleEn : pl.title}
                    </h4>
                    <p className="text-xs text-amber-300 font-medium mt-0.5">{pl.artist}</p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{pl.description}</p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handlePlayToggle(pl)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        isPlaying
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>إيقاف المعاينة</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>استماع للعيّنة الصوتية</span>
                        </>
                      )}
                    </button>

                    {isPlaying && (
                      <span className="text-[11px] text-amber-400 font-bold animate-bounce">
                        جاري التشغيل 🎶
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Song Request Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Mic2 className="w-5 h-5" />
            <span>طلب قائمة أغاني مخصصة من الدي جي</span>
          </div>
          <p className="text-xs text-slate-400">
            اكتب الأغاني والزفة المحددة التي تتمنى سماعها في مناسبتك وسيقوم مزود الموسيقى بتجهيزها لك خصيصاً!
          </p>

          <form onSubmit={handleCustomRequestSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">اسمك الكامل:</label>
              <input
                type="text"
                required
                placeholder="محمد علي"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الهاتف:</label>
              <input
                type="tel"
                required
                placeholder="01012345678"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Song Add */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">إضافة أغنية للقائمة:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="اسم الأغنية + اسم الفنان"
                  value={customSongInput}
                  onChange={(e) => setCustomSongInput(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddSong}
                  className="px-3 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400"
                >
                  إضافة
                </button>
              </div>
            </div>

            {/* Current Song List Pills */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {songList.map((song, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200">
                  <span className="truncate">{i + 1}. {song}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSong(i)}
                    className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">تعليمات خاصة للدي جي:</label>
              <textarea
                rows={2}
                placeholder="مثال: يرجى عدم تشغيل أغاني مهرجانات صاخبة وتخصيص أول نصف ساعة للأغاني الكلاسيكية..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {requestSent ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم إرسال طلب الأغاني لمزود الموسيقى بنجاح!</span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>إرسال طلب قائمة الأغاني المخصصة</span>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
