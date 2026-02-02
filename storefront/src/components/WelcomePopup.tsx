import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import popupBanner from '@/assets/banners/pop-up-banner.png';

const POPUP_STORAGE_KEY = 'amd_genz_popup_dismissed';
const POPUP_EXPIRY_HOURS = 24; // Show popup again after 24 hours

export default function WelcomePopup() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { isAuthenticated } = useCustomerAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownForThisSession, setHasShownForThisSession] = useState(false);

  // Show popup on first visit or after 24 hours
  useEffect(() => {
    // Don't show if already shown in this session
    if (hasShownForThisSession) return;

    // Check if popup was dismissed recently
    const dismissedAt = localStorage.getItem(POPUP_STORAGE_KEY);
    
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceDismissed = (currentTime - dismissedTime) / (1000 * 60 * 60);
      
      // Don't show if dismissed within the expiry period
      if (hoursSinceDismissed < POPUP_EXPIRY_HOURS) {
        console.log('Popup dismissed recently, not showing');
        return;
      }
    }
    
    console.log('Showing popup in 1.5s...');
    // Show popup after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasShownForThisSession(true);
      console.log('Popup is now visible');
    }, 1500);

    return () => clearTimeout(timer);
  }, [hasShownForThisSession]);

  // Show popup when user logs in
  useEffect(() => {
    if (isAuthenticated && !hasShownForThisSession) {
      console.log('User logged in, showing welcome popup');
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShownForThisSession(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasShownForThisSession]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(POPUP_STORAGE_KEY, new Date().toISOString());
  };

  const handleShopNow = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={handleClose}
      />
      
      {/* Popup Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative max-w-3xl w-full bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-xl shadow-2xl shadow-cyan-500/20 overflow-hidden pointer-events-auto animate-scaleIn border-2 border-cyan-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/70 p-2 text-white backdrop-blur-md transition-all duration-200 hover:bg-black hover:scale-110 hover:rotate-90"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Banner Image */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <img
              src={popupBanner}
              alt="Welcome Banner"
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative px-6 sm:px-8 pb-6 -mt-16 z-10">
            <div className="text-center">
              {/* Icon Badge */}
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/30">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  New Drop Alert
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                WELCOME TO
              </h2>
              <h3 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient">
                  AMD° GEN Z
                </span>
              </h3>

              {/* Description */}
              <p className="text-white/90 text-sm sm:text-base max-w-xl mx-auto mb-4 leading-relaxed">
                Exclusive drops for Gen Z. Find your vibe, express your identity.
                <span className="block mt-1 text-cyan-400 font-semibold text-xs">
                  Limited edition collections • Niche targeting • Fresh styles
                </span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mb-4">
                <Link
                  to={`/store/${storeSlug}/collections`}
                  onClick={handleShopNow}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 hover:scale-105 transition-all duration-300"
                >
                  Explore Collections
                </Link>
                
                <Link
                  to={`/store/${storeSlug}/products`}
                  onClick={handleShopNow}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full border-2 border-white/30 text-white font-bold text-sm uppercase tracking-wide hover:bg-white/10 hover:border-cyan-400 transition-all duration-300"
                >
                  Shop All
                </Link>
              </div>

              {/* Promo Code */}
              <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                <p className="text-[10px] text-cyan-400 uppercase font-semibold tracking-widest mb-1">
                  First-Time Discount
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-black text-white">WELCOME10</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('WELCOME10');
                    }}
                    className="px-2.5 py-0.5 rounded-md bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition"
                  >
                    COPY
                  </button>
                </div>
                <p className="text-[10px] text-white/60 mt-1">Use at checkout for 10% off your first order</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
}
