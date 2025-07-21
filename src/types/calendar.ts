export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  allDay: boolean;
  reminder?: boolean; // Whether to show notification reminder
  reminderMinutes?: number; // Minutes before event to show reminder
  color: string; // Color for event display
  recurrence?: RecurrenceRule;
  attendees?: string[]; // Email addresses of attendees
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every X days/weeks/months/years
  endDate?: Date; // When recurrence ends
  count?: number; // Number of occurrences
}

export interface CalendarViewType {
  type: 'month' | 'week' | 'day' | 'agenda';
}

export interface CalendarState {
  events: CalendarEvent[];
  selectedDate: Date;
  viewType: CalendarViewType['type'];
  showCompleted: boolean;
}

export interface CreateEventParams {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  allDay?: boolean;
  reminder?: boolean;
  reminderMinutes?: number;
  color?: string;
  recurrence?: RecurrenceRule;
  attendees?: string[];
}

export interface UpdateEventParams extends Partial<CreateEventParams> {
  id: string;
}