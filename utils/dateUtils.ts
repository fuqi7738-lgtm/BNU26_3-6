
import { SEMESTER_START_DATE } from '../constants';

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay(); // 0 is Sunday
};

export const formatDate = (year: number, month: number, day: number) => {
  const m = (month + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${year}-${m}-${d}`;
};

export const getWeekNumber = (date: Date): number | null => {
  const diffTime = date.getTime() - SEMESTER_START_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return null; // Before semester starts
  
  return Math.floor(diffDays / 7) + 1;
};

export const isWeekend = (year: number, month: number, day: number) => {
  const d = new Date(year, month, day).getDay();
  return d === 0 || d === 6;
};
