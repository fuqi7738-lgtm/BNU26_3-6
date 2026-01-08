
import React from 'react';
import { ACADEMIC_EVENTS } from '../constants';
import { getDatesInWeek, formatDateObj, isWeekendObj } from '../utils/dateUtils';
import DayCell from './DayCell';
import { Course } from '../types';
import { Info } from 'lucide-react';

interface WeeklyCalendarProps {
  weekNum: number;
  notes: Record<string, string>;
  courses: Course[];
  onNoteChange: (date: string, content: string) => void;
  id?: string;
}

const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ weekNum, notes, courses, onNoteChange, id }) => {
  const weekDates = getDatesInWeek(weekNum);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div id={id} className="w-full space-y-4 md:space-y-6">
      <div className="bg-white p-4 md:p-10 rounded-2xl shadow-sm border border-gray-200 text-center">
        <h2 className="text-xl md:text-4xl font-black text-gray-900 tracking-tight">
          第 {weekNum} 周 <span className="text-red-700">计划清单</span>
        </h2>
        <p className="text-gray-500 text-[10px] md:text-base mt-1 md:mt-2 font-medium">
          {formatDateObj(weekDates[0])} — {formatDateObj(weekDates[6])}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        {weekDates.map((date, idx) => {
          const dateStr = formatDateObj(date);
          const dayEvents = ACADEMIC_EVENTS.filter(e => e.date === dateStr);
          const isWknd = isWeekendObj(date);
          const isToday = dateStr === todayStr;
          
          const dayCourses = courses.filter(c => 
            c.weekdays.includes(idx + 1) && 
            weekNum >= c.startWeek && 
            weekNum <= c.endWeek
          );
          
          return (
            <div 
              key={idx} 
              className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 overflow-hidden ${
                isToday ? 'border-red-600 ring-4 ring-red-50' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Date Side Bar */}
                <div className={`p-3 md:p-4 md:w-32 flex flex-row md:flex-col items-center justify-between md:justify-center gap-2 border-b md:border-b-0 md:border-r border-gray-100 ${
                  isToday ? 'bg-red-600 text-white' : isWknd ? 'bg-gray-50 text-gray-500' : 'bg-gray-50 text-gray-800'
                }`}>
                  <div className="text-center">
                    <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-80">星期{WEEK_DAYS[idx]}</div>
                    <div className="text-xl md:text-3xl font-black leading-none">{date.getDate()}</div>
                  </div>
                  <div className="text-[9px] md:text-xs font-medium opacity-70 md:mt-1">
                    {date.getFullYear()}.{(date.getMonth() + 1).toString().padStart(2, '0')}
                  </div>
                </div>

                {/* Content Area - 优化了最小高度 */}
                <div className="flex-1 flex flex-col p-3 md:p-4 min-h-[120px] md:min-h-[150px]">
                  <div className="flex flex-wrap gap-1.5 mb-2 md:mb-3">
                    {dayEvents.map((event, eIdx) => (
                      <div key={eIdx} className="bg-red-50 text-red-700 px-2 md:px-3 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold border border-red-100 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                        {event.title}
                      </div>
                    ))}
                    {dayCourses.map((course) => (
                      <div 
                        key={course.id} 
                        className="px-2 md:px-3 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold border flex items-center gap-1"
                        style={{ 
                          backgroundColor: `${course.color}10`, 
                          color: course.color,
                          borderColor: `${course.color}30` 
                        }}
                      >
                        📚 {course.name}
                      </div>
                    ))}
                  </div>

                  {/* Note Space */}
                  <div className="flex-1">
                    <DayCell
                      day={null}
                      dateStr={dateStr}
                      isToday={false}
                      isWeekend={false}
                      events={[]}
                      courses={[]}
                      note={notes[dateStr] || ''}
                      onNoteChange={(content) => onNoteChange(dateStr, content)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-gray-900 text-white p-4 md:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Info className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-bold">已切换至周计划模式</p>
            <p className="text-[10px] md:text-xs text-gray-400">备注空间已优化，点击即可书写。</p>
          </div>
        </div>
        <div className="text-[9px] md:text-xs text-gray-500 font-medium bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10">
          内容已实时保存
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
