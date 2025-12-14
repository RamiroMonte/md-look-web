import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Trip, TripDay, Look, WeatherCondition, LookType } from '@/types';
import { eachDayOfInterval, parseISO, format } from 'date-fns';

interface TripStore {
  trips: Trip[];

  // Trip actions
  createTrip: (name: string, startDate: string, endDate: string) => string;
  updateTrip: (tripId: string, updates: Partial<Pick<Trip, 'name' | 'startDate' | 'endDate'>>) => void;
  deleteTrip: (tripId: string) => void;
  getTrip: (tripId: string) => Trip | undefined;

  // Day actions
  updateDayLocation: (tripId: string, dayId: string, location: string) => void;
  updateDayWeather: (tripId: string, dayId: string, weather: WeatherCondition) => void;
  updateDayTemp: (tripId: string, dayId: string, tempMin: number | null, tempMax: number | null) => void;
  updateDayNotes: (tripId: string, dayId: string, notes: string) => void;

  // Look actions
  addLook: (tripId: string, dayId: string, lookType: LookType, imageData: string) => void;
  removeLook: (tripId: string, dayId: string, lookType: LookType) => void;
}

function generateDays(startDate: string, endDate: string): TripDay[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const dates = eachDayOfInterval({ start, end });

  return dates.map((date) => ({
    id: uuidv4(),
    date: format(date, 'yyyy-MM-dd'),
    location: '',
    weather: 'sunny' as WeatherCondition,
    tempMin: null,
    tempMax: null,
    dayLook: null,
    nightLook: null,
  }));
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trips: [],

      createTrip: (name, startDate, endDate) => {
        const id = uuidv4();
        const newTrip: Trip = {
          id,
          name,
          startDate,
          endDate,
          createdAt: new Date().toISOString(),
          days: generateDays(startDate, endDate),
        };

        set((state) => ({
          trips: [...state.trips, newTrip],
        }));

        return id;
      },

      updateTrip: (tripId, updates) => {
        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;

            const updatedTrip = { ...trip, ...updates };

            // Regenerate days if dates changed
            if (updates.startDate || updates.endDate) {
              updatedTrip.days = generateDays(
                updates.startDate || trip.startDate,
                updates.endDate || trip.endDate
              );
            }

            return updatedTrip;
          }),
        }));
      },

      deleteTrip: (tripId) => {
        set((state) => ({
          trips: state.trips.filter((trip) => trip.id !== tripId),
        }));
      },

      getTrip: (tripId) => {
        return get().trips.find((trip) => trip.id === tripId);
      },

      updateDayLocation: (tripId, dayId, location) => {
        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;
            return {
              ...trip,
              days: trip.days.map((day) =>
                day.id === dayId ? { ...day, location } : day
              ),
            };
          }),
        }));
      },

      updateDayWeather: (tripId, dayId, weather) => {
        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;
            return {
              ...trip,
              days: trip.days.map((day) =>
                day.id === dayId ? { ...day, weather } : day
              ),
            };
          }),
        }));
      },

      updateDayTemp: (tripId, dayId, tempMin, tempMax) => {
        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;
            return {
              ...trip,
              days: trip.days.map((day) =>
                day.id === dayId ? { ...day, tempMin, tempMax } : day
              ),
            };
          }),
        }));
      },

      updateDayNotes: (tripId, dayId, notes) => {
        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;
            return {
              ...trip,
              days: trip.days.map((day) =>
                day.id === dayId ? { ...day, notes } : day
              ),
            };
          }),
        }));
      },

      addLook: (tripId, dayId, lookType, imageData) => {
        const look: Look = {
          id: uuidv4(),
          imageData,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;
            return {
              ...trip,
              days: trip.days.map((day) => {
                if (day.id !== dayId) return day;
                return {
                  ...day,
                  [lookType === 'day' ? 'dayLook' : 'nightLook']: look,
                };
              }),
            };
          }),
        }));
      },

      removeLook: (tripId, dayId, lookType) => {
        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;
            return {
              ...trip,
              days: trip.days.map((day) => {
                if (day.id !== dayId) return day;
                return {
                  ...day,
                  [lookType === 'day' ? 'dayLook' : 'nightLook']: null,
                };
              }),
            };
          }),
        }));
      },
    }),
    {
      name: 'md-look-storage',
    }
  )
);
