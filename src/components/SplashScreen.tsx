'use client';

import { useEffect, useState } from 'react';
import { Luggage } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    const timer2 = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated circles background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-400/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 -right-10 w-48 h-48 bg-orange-400/20 rounded-full animate-pulse delay-300" />
        <div className="absolute -bottom-10 left-1/4 w-56 h-56 bg-orange-400/25 rounded-full animate-pulse delay-500" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl animate-pulse" />

          {/* Icon container */}
          <div className="relative bg-white rounded-3xl p-6 shadow-2xl animate-bounce-slow">
            <Luggage className="w-16 h-16 text-orange-500" />
          </div>
        </div>

        {/* App name */}
        <h1 className="mt-6 text-3xl font-bold text-white tracking-tight">
          MD-Look
        </h1>
        <p className="mt-2 text-orange-100 text-sm">
          Planeje seus looks de viagem
        </p>

        {/* Loading dots */}
        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
