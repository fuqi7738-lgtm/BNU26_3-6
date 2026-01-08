
import React from 'react';
import { ACADEMIC_EVENTS } from '../constants';
import { getDaysInMonth, getFirstDayOfMonth, formatDate, getWeekNumber, isWeekend } from '../utils/dateUtils';
import DayCell from './DayCell';
import { AcademicEvent, Course } from '../types';

interface MonthlyCalendarProps {
  year: number;
  month: number;
  notes: Record<string, string>;
  courses: Course[];
  onNoteChange: (date: string, content: string) => void;
  id?: string;
}

const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ year, month, notes, courses, onNoteChange, id }) => {
  const daysCount = getDaysInMonth(year, month);
  let firstDay = getFirstDayOfMonth(year, month); 
  
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const days: (number | null)[] = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysCount; i++) {
    days.push(i);
  }

  const rows: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div id={id} className="bg-white p-1 md:p-6 rounded-xl shadow-lg border border-gray-200 w-full overflow-hidden">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800 tracking-tight">
          {year}年 {month + 1}月
        </h2>
        <p className="text-gray-400 text-[10px] md:text-sm mt-0.5 md:mt-1 italic">北京师范大学 2025-2026学年 第二学期</p>
      </div>

      <div className="grid grid-cols-8 md:grid-cols-[60px_repeat(7,1fr)] w-full border-t border-l border-gray-200">
        <div className="flex items-center justify-center font-bold text-[10px] md:text-sm bg-gray-100 border-b border-r border-gray-300 h-8 md:h-10 text-gray-700">周</div>
        {WEEK_DAYS.map((day, idx) => (
          <div 
            key={day} 
            className="flex items-center justify-center font-bold text-[10px] md:text-sm bg-gray-100 border-b border-r border-gray-300 h-8 md:h-10 text-gray-700"
          >
            <span className="hidden md:inline">星期</span>{day}
          </div>
        ))}

        {rows.map((week, weekIdx) => {
          const firstValidDay = week.find(d => d !== null);
          let weekNum: number | null = null;
          if (firstValidDay !== null && firstValidDay !== undefined) {
             const dateObj = new Date(year, month, firstValidDay);
             weekNum = getWeekNumber(dateObj);
          }

          return (
            <React.Fragment key={weekIdx}>
              <div className="flex items-center justify-center font-bold text-[10px] md:text-base text-gray-400 bg-gray-50 border-b border-r border-gray-200 min-h-[80px] md:h-32">
                {weekNum !== null ? weekNum : "-"}
              </div>
              
              {week.map((day, dayIdx) => {
                const dateStr = day ? formatDate(year, month, day) : '';
                const dayEvents = ACADEMIC_EVENTS.filter(e => e.date === dateStr);
                const isWknd = day ? isWeekend(year, month, day) : false;
                
                // Updated Filter: Check if course weekdays includes current day of week
                const dayCourses = day && weekNum !== null ? courses.filter(c => 
                  c.weekdays.includes(dayIdx + 1) && 
                  weekNum >= c.startWeek && 
                  weekNum <= c.endWeek
                ) : [];
                
                return (
                  <div key={dayIdx} className="border-b border-r border-gray-200 overflow-hidden">
                    <DayCell
                      day={day}
                      dateStr={dateStr}
                      isToday={dateStr === todayStr}
                      isWeekend={isWknd}
                      events={dayEvents}
                      courses={dayCourses}
                      note={notes[dateStr] || ''}
                      onNoteChange={(content) => onNoteChange(dateStr, content)}
                    />
                  </div>
                );
              })}
              
              {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                 <div key={`empty-${i}`} className="min-h-[80px] md:h-32 bg-gray-50/50 border-b border-r border-gray-200"></div>
              ))}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs text-gray-500 border-t pt-4 border-dashed border-gray-200">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded bg-blue-100 border border-blue-200"></div>
          <span>今日</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded bg-gray-50 border border-gray-200"></div>
          <span>周末</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded bg-red-100"></div>
          <span className="text-red-600 font-semibold">校历事项</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded bg-blue-100"></div>
          <span className="text-blue-700 font-semibold">课程安排</span>
        </div>
        <div className="ml-auto italic opacity-70">
          点击编辑内容，数据自动保存
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendar;
