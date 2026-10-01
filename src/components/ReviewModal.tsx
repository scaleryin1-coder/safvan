import React, { useState } from 'react';
import { 
  X, 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  Heart, 
  ShieldCheck,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking } from '../types';
import { triggerHaptic, playSound } from '../utils/feedback';
import { JobitAvatar } from './JobitAvatar';

interface ReviewModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (bookingId: string, rating: number, review: string, compliments: string[]) => void;
}

const COMPLIMENT_OPTIONS = [
  { id: 'punctual', label: '⏱️ Super Punctual' },
  { id: 'clean', label: '🧼 Clean & Tidy' },
  { id: 'polite', label: '😊 Polite & Helpful' },
  { id: 'expert', label: '⚡ Expert Skills' },
  { id: 'fair_price', label: '💰 Fair Pricing' },
  { id: 'safety', label: '🛡️ Safety Precautions' }
];

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  1: { text: 'Disappointing', color: 'text-red-500', desc: 'Service fell short of expectations' },
  2: { text: 'Needs Improvement', color: 'text-amber-500', desc: 'Several issues experienced' },
  3: { text: 'Good Service', color: 'text-amber-600', desc: 'Satisfactory standard work' },
  4: { text: 'Very Good!', color: 'text-emerald-600', desc: 'Fast, clean, and professional' },
  5: { text: 'Outstanding & Superb! 🌟', color: 'text-red-600', desc: 'Exceptional work, highly recommended!' }
};

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSubmitReview
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedCompliments, setSelectedCompliments] = useState<string[]>([
    '⏱️ Super Punctual',
    '⚡ Expert Skills'
  ]);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentScore = hoverRating ?? selectedRating;
  const ratingMeta = RATING_LABELS[currentScore] || RATING_LABELS[5];

  const toggleCompliment = (label: string) => {
    triggerHaptic('light');
    setSelectedCompliments((prev) => 
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    playSound('success');
    setIsSubmitting(true);

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {}

    setTimeout(() => {
      onSubmitReview(
        booking.id,
        selectedRating,
        reviewComment.trim() || `${ratingMeta.text} - ${booking.taskTitle}`,
        selectedCompliments
      );
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-stone-200 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-600 text-white p-5 text-center relative select-none">
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="absolute top-3.5 right-3.5 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white text-red-600 mx-auto mb-2 flex items-center justify-center shadow-md border-2 border-white">
            <JobitAvatar isOnline={true} size="md" />
          </div>

          <h2 className="text-base font-black">How was your service?</h2>
          <p className="text-xs text-red-100 mt-0.5">
            Rate <strong className="text-white">{booking.workerName}</strong> for <span className="underline">{booking.taskTitle}</span>
          </p>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Interactive Star Rating */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => {
                    triggerHaptic('medium');
                    setSelectedRating(star);
                  }}
                  className="p-1 hover:scale-125 active:scale-95 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= currentScore
                        ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className={`font-black text-sm ${ratingMeta.color} transition-colors`}>
              {ratingMeta.text}
            </p>
            <p className="text-[11px] text-stone-500 font-semibold">
              {ratingMeta.desc}
            </p>
          </div>

          {/* Quick Compliment Badges */}
          <div>
            <label className="text-[10px] font-black text-stone-700 uppercase tracking-wider block mb-1.5">
              What did you like the most?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMPLIMENT_OPTIONS.map((item) => {
                const isSelected = selectedCompliments.includes(item.label);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleCompliment(item.label)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-full border transition active:scale-95 ${
                      isSelected
                        ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="text-[10px] font-black text-stone-700 uppercase tracking-wider block mb-1">
              Detailed Feedback (Optional)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience to help other neighbors in your area hire with confidence..."
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-red-600 bg-stone-50 text-stone-900"
              />
            </div>
          </div>

          {/* Trust Impact Note */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-900 text-[11px]">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Your rating directly impacts <strong>{booking.workerName}'s</strong> badge and helps top-rated professionals get more local bookings on JOBit!
            </p>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-md shadow-red-200 active:scale-98 transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Verified Review ⭐</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
