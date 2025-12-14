'use client';

import { useState, useEffect, useCallback } from 'react';
import { TripDay } from '@/types';
import { WeatherIcon } from './WeatherIcon';
import { X, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StoriesViewerProps {
  days: TripDay[];
  initialDayIndex?: number;
  onClose: () => void;
}

export function StoriesViewer({ days, initialDayIndex = 0, onClose }: StoriesViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialDayIndex);
  const [lookType, setLookType] = useState<'day' | 'night'>('day');
  const [progress, setProgress] = useState(0);

  const currentDay = days[currentIndex];
  const currentLook = lookType === 'day' ? currentDay?.dayLook : currentDay?.nightLook;
  const hasNight = currentDay?.nightLook !== null;

  // Verifica se pode navegar
  const canGoPrev = currentIndex > 0 || lookType === 'night';
  const canGoNext = currentIndex < days.length - 1 || (lookType === 'day' && hasNight);

  const goNext = useCallback(() => {
    // Se está no look do dia e tem look da noite, vai para noite
    if (lookType === 'day' && hasNight) {
      setLookType('night');
      setProgress(0);
      return;
    }

    // Vai para o próximo dia
    if (currentIndex < days.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setLookType('day');
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, days.length, hasNight, lookType, onClose]);

  const goPrev = useCallback(() => {
    // Se está no look da noite, volta para o dia
    if (lookType === 'night') {
      setLookType('day');
      setProgress(0);
      return;
    }

    // Vai para o dia anterior
    if (currentIndex > 0) {
      const prevDay = days[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      // Se o dia anterior tem look da noite, mostra ele
      setLookType(prevDay?.nightLook ? 'night' : 'day');
      setProgress(0);
    }
  }, [currentIndex, days, lookType]);

  // Auto progress
  useEffect(() => {
    if (!currentLook) {
      // Se não tem foto, avança com metade do tempo (2.5s) para dar tempo de voltar
      const timer = setTimeout(goNext, 2500);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentLook, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose]);

  const formattedDate = currentDay
    ? format(parseISO(currentDay.date), "EEEE, dd 'de' MMMM", { locale: ptBR })
    : '';

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
        {days.map((day, index) => {
          const hasBothLooks = day.dayLook && day.nightLook;
          const segments = hasBothLooks ? 2 : 1;

          return (
            <div key={day.id} className="flex-1 flex gap-0.5">
              {Array.from({ length: segments }).map((_, segIndex) => {
                const isCurrentDay = index === currentIndex;
                const isCurrentSegment =
                  isCurrentDay &&
                  ((segIndex === 0 && lookType === 'day') ||
                    (segIndex === 1 && lookType === 'night'));
                const isPast =
                  index < currentIndex ||
                  (isCurrentDay && segIndex === 0 && lookType === 'night');

                return (
                  <div
                    key={segIndex}
                    className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-white rounded-full transition-all duration-100"
                      style={{
                        width: isPast ? '100%' : isCurrentSegment ? `${progress}%` : '0%',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 z-20 p-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="text-white font-semibold text-lg capitalize">{formattedDate}</div>
          {currentDay?.location && (
            <div className="text-white/80 text-sm">{currentDay.location}</div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <WeatherIcon condition={currentDay?.weather || 'sunny'} className="w-5 h-5" />
            {(currentDay?.tempMax !== null || currentDay?.tempMin !== null) && (
              <span className="text-white text-sm">
                {currentDay?.tempMax !== null && <span>{currentDay.tempMax}°</span>}
                {currentDay?.tempMin !== null && currentDay?.tempMax !== null && ' / '}
                {currentDay?.tempMin !== null && <span>{currentDay.tempMin}°</span>}
              </span>
            )}
          </div>
          {currentDay?.notes && (
            <div className="mt-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-block">
              <span className="text-white text-sm font-medium">{currentDay.notes}</span>
            </div>
          )}
        </div>
        <button onClick={onClose} className="text-white p-2">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Look type indicator */}
      <div className="absolute top-36 left-0 right-0 z-20 flex justify-center">
        <div className="bg-black/50 rounded-full px-3 py-1 flex items-center gap-2">
          {lookType === 'day' ? (
            <>
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm">Dia</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-blue-300" />
              <span className="text-white text-sm">Noite</span>
            </>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center">
        {currentLook ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentLook.imageData}
            alt={`Look ${lookType === 'day' ? 'do dia' : 'da noite'}`}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-white/50 text-center p-8">
            <p className="text-lg mb-2">Sem foto</p>
            <p className="text-sm">
              {lookType === 'day' ? 'Look do dia' : 'Look da noite'} não cadastrado
            </p>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-4 left-0 right-0 z-20 px-4">
        <div className="flex items-center justify-between">
          {/* Prev button */}
          <button
            onClick={goPrev}
            disabled={!canGoPrev}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              canGoPrev
                ? 'bg-white/20 text-white active:bg-white/30'
                : 'bg-white/5 text-white/30'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Day counter */}
          <div className="bg-black/50 rounded-full px-4 py-2 text-white text-sm">
            Dia {currentIndex + 1} de {days.length}
          </div>

          {/* Next button */}
          <button
            onClick={goNext}
            className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center active:bg-white/30 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
