'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTripStore } from '@/store/tripStore';
import { DayCard } from '@/components/DayCard';
import { EditDayModal } from '@/components/EditDayModal';
import { StoriesViewer } from '@/components/StoriesViewer';
import { TripDay, LookType, WeatherCondition } from '@/types';
import { ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';

export default function ViagemPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const {
    getTrip,
    addLook,
    removeLook,
    updateDayLocation,
    updateDayWeather,
    updateDayTemp,
    updateDayNotes,
  } = useTripStore();

  const [trip, setTrip] = useState(() => getTrip(tripId));
  const [editingDay, setEditingDay] = useState<TripDay | null>(null);
  const [showStories, setShowStories] = useState(false);
  const [storiesStartIndex, setStoriesStartIndex] = useState(0);

  useEffect(() => {
    const currentTrip = getTrip(tripId);
    if (!currentTrip) {
      router.push('/');
      return;
    }
    setTrip(currentTrip);
  }, [tripId, getTrip, router]);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = useTripStore.subscribe(() => {
      setTrip(getTrip(tripId));
    });
    return () => unsubscribe();
  }, [tripId, getTrip]);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  const handleAddLook = (dayId: string, lookType: LookType, imageData: string) => {
    addLook(tripId, dayId, lookType, imageData);
  };

  const handleRemoveLook = (dayId: string, lookType: LookType) => {
    removeLook(tripId, dayId, lookType);
  };

  const handleSaveDay = (updates: {
    location: string;
    weather: WeatherCondition;
    tempMin: number | null;
    tempMax: number | null;
    notes: string;
  }) => {
    if (!editingDay) return;

    updateDayLocation(tripId, editingDay.id, updates.location);
    updateDayWeather(tripId, editingDay.id, updates.weather);
    updateDayTemp(tripId, editingDay.id, updates.tempMin, updates.tempMax);
    updateDayNotes(tripId, editingDay.id, updates.notes);
  };

  return (
    <div className="min-h-screen bg-gray-50 safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 p-1">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{trip.name}</h1>
                <p className="text-xs text-gray-500">
                  {trip.days.length} dias
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setStoriesStartIndex(0);
                setShowStories(true);
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">Ver Looks</span>
            </button>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trip.days.map((day, index) => (
            <DayCard
              key={day.id}
              day={day}
              onAddLook={handleAddLook}
              onRemoveLook={handleRemoveLook}
              onEditDay={setEditingDay}
              onViewLook={() => {
                setStoriesStartIndex(index);
                setShowStories(true);
              }}
            />
          ))}
        </div>
      </main>

      {/* Edit Modal */}
      {editingDay && (
        <EditDayModal
          day={editingDay}
          onSave={handleSaveDay}
          onClose={() => setEditingDay(null)}
        />
      )}

      {/* Stories Viewer */}
      {showStories && (
        <StoriesViewer
          days={trip.days}
          initialDayIndex={storiesStartIndex}
          onClose={() => setShowStories(false)}
        />
      )}
    </div>
  );
}
