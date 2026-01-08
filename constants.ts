
import { AcademicEvent } from './types';

// Based on the provided Beijing Normal University 2025-2026 Second Semester Calendar
export const ACADEMIC_EVENTS: AcademicEvent[] = [
  { date: '2026-03-01', title: '全体学生注册日', type: 'registration' },
  { date: '2026-04-04', title: '清明节放假', type: 'holiday' },
  { date: '2026-04-05', title: '清明节放假', type: 'holiday' },
  { date: '2026-04-06', title: '清明节放假', type: 'holiday' },
  { date: '2026-04-24', title: '全校运动会', type: 'event' },
  { date: '2026-04-25', title: '全校运动会', type: 'event' },
  { date: '2026-05-01', title: '劳动节放假', type: 'holiday' },
  { date: '2026-05-02', title: '劳动节放假', type: 'holiday' },
  { date: '2026-05-03', title: '劳动节放假', type: 'holiday' },
  { date: '2026-05-04', title: '劳动节放假', type: 'holiday' },
  { date: '2026-05-05', title: '劳动节放假', type: 'holiday' },
  { date: '2026-05-09', title: '上班（调休补班）', type: 'event' },
  { date: '2026-06-19', title: '端午节放假', type: 'holiday' },
  { date: '2026-06-20', title: '端午节放假', type: 'holiday' },
  { date: '2026-06-21', title: '端午节放假', type: 'holiday' },
  { date: '2026-06-30', title: '北京校区毕业典礼', type: 'event' },
];

// Week 1 starts on March 2nd, 2026 (Monday) according to the image
export const SEMESTER_START_DATE = new Date(2026, 2, 2); // Mar 2, 2026
