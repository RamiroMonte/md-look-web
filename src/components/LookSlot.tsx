'use client';

import { Camera, X, Sun, Moon } from 'lucide-react';
import { Look, LookType } from '@/types';

interface LookSlotProps {
  look: Look | null;
  lookType: LookType;
  onCapture: () => void;
  onRemove: () => void;
  onView?: () => void;
}

export function LookSlot({ look, lookType, onCapture, onRemove, onView }: LookSlotProps) {
  if (look) {
    return (
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 group">
        <button onClick={onView} className="w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={look.imageData}
            alt={`Look ${lookType === 'day' ? 'do dia' : 'da noite'}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
        <div className="absolute bottom-1 left-1 bg-black/50 text-white rounded-full p-1 pointer-events-none">
          {lookType === 'day' ? (
            <Sun className="w-3 h-3" />
          ) : (
            <Moon className="w-3 h-3" />
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onCapture}
      className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors bg-gray-50"
    >
      <Camera className="w-6 h-6" />
      <span className="text-[10px] font-medium">
        {lookType === 'day' ? 'DIA' : 'NOITE'}
      </span>
    </button>
  );
}
