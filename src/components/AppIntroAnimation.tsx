import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface AppIntroAnimationProps {
  onComplete: () => void;
  minDurationMs?: number;
  isReady?: boolean;
}

export const AppIntroAnimation: React.FC<AppIntroAnimationProps> = ({
  onComplete,
  minDurationMs = 1300,
  isReady = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = 25;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let rawProgress = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));

      if (!isReady && rawProgress > 95) {
        rawProgress = 95;
      }

      setProgress(rawProgress);

      if (elapsed >= minDurationMs && isReady) {
        clearInterval(timer);
        triggerExit();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [minDurationMs, isReady]);

  const triggerExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 select-none transition-opacity duration-400 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading ClubSphere"
    >
      {/* Subtle, soft ambient glow */}
      <div className="absolute w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Center Brand Block */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Clean Logo Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-5 transition-transform duration-500">
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        {/* Clean, Elegant Typography */}
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
          ClubSphere
        </h1>
        <p className="text-xs text-slate-400 font-normal tracking-wide mb-8">
          Campus Activities & Clubs
        </p>

        {/* Minimalist Progress Line */}
        <div className="w-44 h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Subtle Skip button */}
      <button
        onClick={triggerExit}
        className="absolute bottom-8 text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium cursor-pointer"
      >
        Skip
      </button>
    </div>
  );
};
