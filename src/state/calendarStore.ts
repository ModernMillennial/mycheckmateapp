import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, CalendarState, CreateEventParams, UpdateEventParams } from '../types/calendar';
import { uuid } from '../utils/uuid';

interface CalendarStore extends CalendarState {
  // State
  _hasHydrated: boolean;

  // Actions
  setHasHydrated: (hydrated: boolean) => void;
  addEvent: (params: CreateEventParams) => void;
  updateEvent: (params: UpdateEventParams) => void;
  deleteEvent: (eventId: string) => void;
  setSelectedDate: (date: Date) => void;
  setViewType: (viewType: CalendarState['viewType']) => void;
  setShowCompleted: (show: boolean) => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventsForDateRange: (startDate: Date, endDate: Date) => CalendarEvent[];
  getEventById: (eventId: string) => CalendarEvent | undefined;
  clearAllEvents: () => void;
}

const defaultColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
];

const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      // Initial state
      events: [],
      selectedDate: new Date(),
      viewType: 'month',
      showCompleted: true,
      _hasHydrated: false,

      // Actions
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      addEvent: (params) => {
        const newEvent: CalendarEvent = {
          id: generateEventId(),
          title: params.title,
          description: params.description || '',
          startDate: params.startDate,
          endDate: params.endDate,
          location: params.location || '',
          allDay: params.allDay || false,
          reminder: params.reminder || false,
          reminderMinutes: params.reminderMinutes || 15,
          color: params.color || defaultColors[Math.floor(Math.random() * defaultColors.length)],
          recurrence: params.recurrence,
          attendees: params.attendees || [],
        };

        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },

      updateEvent: (params) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === params.id
              ? {
                  ...event,
                  ...params,
                  // Ensure dates are Date objects
                  startDate: params.startDate || event.startDate,
                  endDate: params.endDate || event.endDate,
                }
              : event
          ),
        }));
      },

      deleteEvent: (eventId) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== eventId),
        }));
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      setViewType: (viewType) => {
        set({ viewType });
      },

      setShowCompleted: (show) => {
        set({ showCompleted: show });
      },

      getEventsForDate: (date) => {
        const events = get().events;
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        return events.filter((event) => {
          const eventStart = new Date(event.startDate);
          const eventEnd = new Date(event.endDate);
          
          if (event.allDay) {
            eventStart.setHours(0, 0, 0, 0);
            eventEnd.setHours(23, 59, 59, 999);
          }

          return targetDate >= eventStart && targetDate <= eventEnd;
        });
      },

      getEventsForDateRange: (startDate, endDate) => {
        const events = get().events;
        return events.filter((event) => {
          const eventStart = new Date(event.startDate);
          const eventEnd = new Date(event.endDate);
          
          return (
            (eventStart >= startDate && eventStart <= endDate) ||
            (eventEnd >= startDate && eventEnd <= endDate) ||
            (eventStart <= startDate && eventEnd >= endDate)
          );
        });
      },

      getEventById: (eventId) => {
        return get().events.find((event) => event.id === eventId);
      },

      clearAllEvents: () => {
        set({ events: [] });
      },
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects after rehydration
          state.events = state.events.map((event) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
          }));
          state.selectedDate = new Date(state.selectedDate);
          state.setHasHydrated(true);
        }
      },
      partialize: (state) => ({
        events: state.events,
        selectedDate: state.selectedDate,
        viewType: state.viewType,
        showCompleted: state.showCompleted,
      }),
    }
  )
);