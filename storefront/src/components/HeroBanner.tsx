import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import banner1 from '@/assets/banners/Gemini_Generated_Image_4ce0xr4ce0xr4ce0.png';
import banner2 from '@/assets/banners/Gemini_Generated_Image_9pi7s99pi7s99pi7.png';
import banner3 from '@/assets/banners/Gemini_Generated_Image_aqnfq3aqnfq3aqnf.png';
import banner4 from '@/assets/banners/Gemini_Generated_Image_le0w0kle0w0kle0w.png';

const banners = [banner1, banner2, banner3, banner4];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl bg-slate-900 shadow-2xl">
      {/* Banner Images */}
      <div className="relative aspect-[16/7] w-full sm:aspect-[18/7]">
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={banner}
              alt={`AMD Gen Z Banner ${idx + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur hover:bg-black/70 transition sm:left-3 sm:p-2"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur hover:bg-black/70 transition sm:right-3 sm:p-2"
        aria-label="Next banner"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-3 sm:gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all sm:h-2 ${
              idx === current
                ? 'w-6 bg-gradient-to-r from-cyan-400 to-purple-500 sm:w-8'
                : 'w-1.5 bg-white/50 hover:bg-white/75 sm:w-2'
            }`}
            aria-label={`Go to banner ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
