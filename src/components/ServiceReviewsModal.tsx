import React, { useState } from 'react';
import { Service, ServiceReview, Language } from '../types';
import { StorageManager } from '../lib/storage';
import { Star, X, CheckCircle2, AlertTriangle, MessageSquare, Send, ShieldCheck, UserCheck } from 'lucide-react';

interface ServiceReviewsModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onReviewAdded?: () => void;
}

export const ServiceReviewsModal: React.FC<ServiceReviewsModalProps> = ({
  service,
  isOpen,
  onClose,
  language,
  onReviewAdded,
}) => {
  if (!isOpen || !service) return null;

  const currentUser = StorageManager.getCurrentUser();
  const reviews = StorageManager.getReviewsForService(service.id);
  const { canReview, bookingId, existingReview, reason } = StorageManager.canUserReviewService(
    service.id,
    currentUser?.email,
    currentUser?.phone
  );

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('يرجى كتابة تعليقك أو تقييمك قبل الإرسال.');
      return;
    }

    setSubmitting(true);

    const newReview: ServiceReview = {
      id: `rev-${Date.now()}`,
      serviceId: service.id,
      bookingId: bookingId,
      clientName: currentUser?.name || 'عميل منصة مناسباتي',
      clientEmail: currentUser?.email,
      clientPhone: currentUser?.phone,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    StorageManager.addReview(newReview);
    setSuccessMsg('شكرًا لك! تم إضافة تقييمك بنجاح وتحديث تقييم الخدمة.');
    setComment('');
    setSubmitting(false);

    if (onReviewAdded) {
      onReviewAdded();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full text-white p-6 sm:p-8 shadow-2xl relative my-auto space-y-6 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 border-b border-slate-800 pb-5">
          <img
            src={service.imageUrls[0]}
            alt={service.title}
            className="w-20 h-20 rounded-2xl object-cover border border-amber-500/30 shrink-0"
          />
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              تقييمات العملاء والحجوزات المؤكدة
            </span>
            <h3 className="text-xl font-bold font-serif text-amber-100">{service.title}</h3>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{service.rating} / 5</span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-semibold">{reviews.length} تقييم موثق</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{service.vendorName}</span>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar flex-1">
          {/* Add Review Section (Only if Eligible) */}
          {canReview ? (
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 border border-amber-500/30 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <span>أضف تقييمك للخدمة (حجز مؤكد)</span>
              </div>

              {successMsg ? (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1.5">اختر التقييم بالنجوم:</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-slate-600 hover:scale-110 transition-all focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              (hoverRating || rating) >= star
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="mr-2 text-xs text-amber-300 font-bold">
                        {rating === 5 ? 'ممتاز جداً 🌟' : rating === 4 ? 'جيد جداً 👍' : rating === 3 ? 'متوسط 😐' : rating === 2 ? 'مقبول 👎' : 'سيء ❌'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1.5">تعليقك ورأيك في الخدمة:</label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="اكتب انطباعك عن الخدمة، الجودة، والنظافة وتجربتك الكلية..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال ونشر التقييم الرسمى</span>
                  </button>
                </form>
              )}
            </div>
          ) : existingReview ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>لقد قمت بتقديم تقييمك لهذه الخدمة بالفعل:</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{existingReview.rating} / 5</span>
                </div>
              </div>
              <p className="text-slate-300 italic pt-1">"{existingReview.comment}"</p>
            </div>
          ) : (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-amber-200">التقييم محمي ومتاح للحجوزات الفعلية فقط</p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  {reason || 'لا يمكنك إضافة تقييم إلا بعد إتمام حجز هذه الخدمة عبر المنصة لتأكيد المصداقية.'}
                </p>
              </div>
            </div>
          )}

          {/* List of Reviews */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>آراء المعازيم والعملاء ({reviews.length})</span>
              </h4>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                لا توجد تقييمات مضافة لهذه الخدمة حتى الآن. كن أول من يكتب تقييماً بعد الحجز!
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-xs">
                          {rev.clientName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{rev.clientName}</span>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>عميل حقيقي</span>
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{rev.createdAt}</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300">{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1 pr-10">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
