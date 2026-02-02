import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
}

export default function CountdownTimer({ targetDate, label = "Drop ends in" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-orange-500/50 bg-gradient-to-r from-orange-950/50 to-red-950/50 px-4 py-2.5 backdrop-blur">
      <Clock className="h-5 w-5 text-orange-400 animate-pulse" />
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-orange-300 uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-1.5 font-display font-bold text-white">
          <span className="text-sm">{String(timeLeft.days).padStart(2, '0')}d</span>
          <span className="text-orange-400">:</span>
          <span className="text-sm">{String(timeLeft.hours).padStart(2, '0')}h</span>
          <span className="text-orange-400">:</span>
          <span className="text-sm">{String(timeLeft.minutes).padStart(2, '0')}m</span>
          <span className="text-orange-400">:</span>
          <span className="text-sm">{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
      </div>
    </div>
  );
}
