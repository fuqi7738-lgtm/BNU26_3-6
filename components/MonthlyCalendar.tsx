
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
  onDayClick?: (date: string) => void;
  id?: string;
}

const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ year, month, notes, courses, onNoteChange, onDayClick, id }) => {
  const daysCount = getDaysInMonth(year, month);
  let firstDay = getFirstDayOfMonth(year, month); 
  
  // 调整为周一作为一周的第一天 (0是周日)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const days: (number | null)[] = [];
  // 填充月初的空白
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }
  // 填充本月的日期
  for (let i = 1; i <= daysCount; i++) {
    days.push(i);
  }
  
  // 填充到 7 的倍数即可，不再强制 42 (6行)
  while (days.length % 7 !== 0) {
    days.push(null);
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

      <div className="grid grid-cols-[32px_repeat(7,1fr)] md:grid-cols-[60px_repeat(7,1fr)] w-full border-t border-l border-gray-200">
        {/* 表头 */}
        <div className="flex items-center justify-center font-bold text-[9px] md:text-sm bg-gray-50 border-b border-r border-gray-300 h-8 md:h-10 text-gray-400 uppercase tracking-tighter">周</div>
        {WEEK_DAYS.map((day) => (
          <div 
            key={day} 
            className="flex items-center justify-center font-bold text-[10px] md:text-sm bg-gray-50 border-b border-r border-gray-300 h-8 md:h-10 text-gray-700"
          >
            <span className="hidden md:inline">星期</span>{day}
          </div>
        ))}

        {/* 日期行 */}
        {rows.map((week, weekIdx) => {
          // 检查该行是否有本月的有效日期
          const hasValidDays = week.some(d => d !== null);
          const firstValidDay = week.find(d => d !== null);
          let weekNum: number | null = null;
          
          if (hasValidDays && firstValidDay !== undefined && firstValidDay !== null) {
             const dateObj = new Date(year, month, firstValidDay);
             weekNum = getWeekNumber(dateObj);
          }

          return (
            <React.Fragment key={weekIdx}>
              {/* 周次列 */}
              <div className={`flex items-center justify-center font-bold text-[10px] md:text-base border-b border-r border-gray-200 h-24 md:h-36 transition-colors ${
                hasValidDays ? 'text-gray-400 bg-gray-50/50' : 'bg-gray-50/20'
              }`}>
                {weekNum !== null ? weekNum : ""}
              </div>
              
              {week.map((day, dayIdx) => {
                const dateStr = day ? formatDate(year, month, day) : '';
                const dayEvents = ACADEMIC_EVENTS.filter(e => e.date === dateStr);
                const isWknd = day ? isWeekend(year, month, day) : false;
                const isToday = dateStr === todayStr;
                
                const dayCourses = day && weekNum !== null ? courses.filter(c => 
                  c.weekdays.includes(dayIdx + 1) && 
                  weekNum >= c.startWeek && 
                  weekNum <= c.endWeek
                ) : [];
                
                return (
                  <div 
                    key={dayIdx} 
                    className={`border-b border-r border-gray-200 overflow-hidden h-24 md:h-36 transition-all relative ${
                      isToday ? 'ring-2 ring-red-600 ring-inset z-10 shadow-[inset_0_0_8px_rgba(220,38,38,0.15)]' : ''
                    } ${day ? 'cursor-pointer hover:bg-gray-50/80' : ''}`}
                    onClick={() => day && onDayClick && onDayClick(dateStr)}
                  >
                    <DayCell
                      day={day}
                      dateStr={dateStr}
                      isToday={isToday}
                      isWeekend={isWknd}
                      events={dayEvents}
                      courses={dayCourses}
                      note={notes[dateStr] || ''}
                      onNoteChange={(content) => onNoteChange(dateStr, content)}
                    />
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs text-gray-500 border-t pt-4 border-dashed border-gray-200">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded ring-1 ring-red-600 bg-red-50"></div>
          <span className="text-red-700 font-bold underline decoration-red-200">今日高亮 (点击日期跳转周计划)</span>
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
      </div>
    </div>
  );
};

export default MonthlyCalendar;
