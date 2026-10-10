import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  CheckCircle, 
  X, 
  Send,
  MessageCircle,
  Plus
} from 'lucide-react';

interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  date: string;
  category: 'all' | 'passport' | 'privacy' | 'pdf';
  comment: string;
  verified: boolean;
  isUserSubmission?: boolean;
}

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const stored = localStorage.getItem('offlineforge_user_reviews');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'passport' | 'privacy' | 'pdf'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [userCategory, setUserCategory] = useState<'all' | 'passport' | 'privacy' | 'pdf'>('all');
  const [userComment, setUserComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userComment.trim()) return;

    const newReview: Review = {
      id: `user-${Date.now()}`,
      name: userName.trim(),
      role: userRole.trim() || 'Verified User',
      rating: userRating,
      date: 'Just now',
      category: userCategory,
      comment: userComment.trim(),
      verified: true,
      isUserSubmission: true,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);

    try {
      localStorage.setItem('offlineforge_user_reviews', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setIsModalOpen(false);
      setUserName('');
      setUserRole('');
      setUserComment('');
      setUserRating(5);
    }, 1500);
  };

  const filteredReviews = reviews.filter(
    r => activeFilter === 'all' || r.category === activeFilter
  );

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="w-full max-w-full overflow-hidden bg-white dark:bg-[#111317] border-t border-[#E5E7EB] dark:border-slate-800 py-14 sm:py-20 transition-colors">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-slate-700 dark:fill-slate-300 text-slate-700 dark:text-slate-300" />
              <span>Community Feedback</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5322D]" />
              <span className="text-slate-600 dark:text-slate-400 font-semibold">100% Client-Side</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black text-[#111827] dark:text-white tracking-tight">
              User Reviews & <span className="text-[#E5322D]">Feedback</span>
            </h2>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Help us shape OfflineToolkit. Share your thoughts, report how tools worked for you, or suggest improvements.
            </p>
          </div>

          {/* Rating Summary & Write Review Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-white">
                {avgRating ? `${avgRating} / 5.0 (${reviews.length})` : 'Be the first to rate'}
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#E5322D] hover:bg-[#c92420] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Leave a Review</span>
            </button>
          </div>
        </div>

        {/* Filter Pills (Shown only when there are reviews) */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'passport', label: 'Passport & Govt Photos' },
              { id: 'privacy', label: 'Privacy & Security' },
              { id: 'pdf', label: 'PDF & File Compression' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Reviews Grid or Clean Empty State */}
        {reviews.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 dark:bg-[#141518] border border-dashed border-slate-300 dark:border-slate-800 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-700 dark:text-slate-300 shadow-2xs">
              <MessageSquare className="w-6 h-6 text-[#E5322D]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Be the First to Leave a Review
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No reviews yet. Share your experience using our offline file tools and help others discover private processing.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#E5322D] hover:bg-[#c92420] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write the First Review</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between gap-4 bg-white dark:bg-[#141518] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
              >
                <div className="space-y-3">
                  {/* Header: Stars + Verification badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                    
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E5322D] text-white">
                      Verified User
                    </span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-[13px] sm:text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Author footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 shrink-0">
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {rev.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {rev.role}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400 shrink-0">
                    {rev.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Leave a Review Modal ────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#14161a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Share Your Feedback
                  </h3>
                  <p className="text-[11.5px] text-slate-500">
                    Your review appears immediately on the website
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submittedMessage ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Thank You for Your Review!
                </h4>
                <p className="text-xs text-slate-500">
                  Your feedback has been verified and added to the community wall.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                
                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Your Rating:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${star <= userRating ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-black text-slate-900 dark:text-white ml-2">
                      {userRating}.0 / 5.0
                    </span>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300 block">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Himanshu or Priya"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#E5322D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300 block">
                      Your Role or Purpose
                    </label>
                    <input
                      type="text"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      placeholder="e.g. Student, Lawyer, Designer"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#E5322D]"
                    />
                  </div>
                </div>

                {/* Category tag */}
                <div className="space-y-1">
                  <label className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300 block">
                    What did you use most?
                  </label>
                  <select
                    value={userCategory}
                    onChange={(e) => setUserCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#E5322D]"
                  >
                    <option value="passport">Passport Photo & Govt Size Reducer</option>
                    <option value="privacy">Privacy & Offline Security</option>
                    <option value="pdf">PDF Merge, Split & Compress</option>
                    <option value="all">General Multi-Tool Suite</option>
                  </select>
                </div>

                {/* Review Message */}
                <div className="space-y-1">
                  <label className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300 block">
                    Your Review / Experience *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="How did OfflineToolkit help you? (e.g. helped clear exam photo requirements, saved time, zero internet needed...)"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#E5322D] resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#E5322D] hover:bg-[#c92420] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Review</span>
                  </button>

                  <a
                    href={`https://wa.me/919318375856?text=${encodeURIComponent(
                      `Hi Himanshu! Here is my review for OfflineToolkit: "${userComment || 'Great tool!'}" - ${userName || 'User'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                    title="Send directly to developer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send on WhatsApp</span>
                  </a>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
