'use client';

import Link from 'next/link';
import { Trip } from '@/types';
import { formatDateFull } from '@/lib/utils';
import { Calendar, MapPin, Trash2, ChevronRight } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  onDelete: (tripId: string) => void;
}

export function TripCard({ trip, onDelete }: TripCardProps) {
  const daysCount = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;
  const looksCount = trip.days.filter(d => d.dayLook || d.nightLook).length;
  const firstLocation = trip.days.find(d => d.location)?.location;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Deseja excluir esta viagem?')) {
      onDelete(trip.id);
    }
  };

  return (
    <Link href={`/viagem/${trip.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-lg">{trip.name}</h3>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>
              {formatDateFull(trip.startDate)} - {formatDateFull(trip.endDate)}
            </span>
          </div>

          {firstLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>{firstLocation}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
            <span className="text-gray-500">
              {daysCount} dias • {looksCount} looks
            </span>
            <ChevronRight className="w-5 h-5 text-orange-500" />
          </div>
        </div>
      </div>
    </Link>
  );
}
