
export interface AcademicEvent {
  date: string; // YYYY-MM-DD
  title: string;
  type: 'holiday' | 'exam' | 'event' | 'registration';
}

export interface DayNote {
  date: string;
  content: string;
}

export interface CalendarState {
  month: number;
  year: number;
}

export interface Course {
  id: string;
  name: string;
  weekdays: number[]; // Array of 1-7 (Mon-Sun)
  startWeek: number;
  endWeek: number;
  color?: string; // Hex color code
  location?: string;
}
