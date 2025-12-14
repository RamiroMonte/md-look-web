'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTripStore } from '@/store/tripStore';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format, addDays } from 'date-fns';

export default function NovaViagemPage() {
  const router = useRouter();
  const { createTrip } = useTripStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Digite o nome da viagem');
      return;
    }

    if (startDate > endDate) {
      alert('A data de inicio deve ser antes da data de fim');
      return;
    }

    const tripId = createTrip(name.trim(), startDate, endDate);
    router.push(`/viagem/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Nova Viagem</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Viagem
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ferias Cancun 2024"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Preview */}
          {startDate && endDate && startDate <= endDate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-700">
                Sua viagem tera{' '}
                <strong>
                  {Math.ceil(
                    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1}{' '}
                  dias
                </strong>{' '}
                para planejar looks.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-4 rounded-lg font-medium text-lg hover:bg-orange-600 transition-colors"
          >
            Criar Viagem
          </button>
        </form>
      </main>
    </div>
  );
}
