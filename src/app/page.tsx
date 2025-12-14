'use client';

import { useState } from 'react';
import { useTripStore } from '@/store/tripStore';
import { TripCard } from '@/components/TripCard';
import { SplashScreen } from '@/components/SplashScreen';
import { Plus, Luggage } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { trips, deleteTrip } = useTripStore();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <div className="min-h-screen bg-gray-50 safe-area-top safe-area-bottom">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Luggage className="w-6 h-6 text-orange-500" />
                <h1 className="text-xl font-bold text-gray-900">MD-Look</h1>
              </div>
              <Link
                href="/nova-viagem"
                className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-lg mx-auto px-4 py-6">
          {trips.length === 0 ? (
            <div className="text-center py-16">
              <Luggage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-600 mb-2">
                Nenhuma viagem ainda
              </h2>
              <p className="text-gray-500 mb-6">
                Comece criando sua primeira viagem e planeje seus looks!
              </p>
              <Link
                href="/nova-viagem"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nova Viagem
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Suas Viagens
              </h2>
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={deleteTrip} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
