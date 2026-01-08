
import React, { useState, useEffect, useCallback } from 'react';
import { AcademicEvent, Course } from '../types';

interface DayCellProps {
  day: number | null;
  dateStr: string;
  isToday: boolean;
  isWeekend: boolean;
  events: AcademicEvent[];
  courses: Course[];
  note: string;
  onNoteChange: (content: string) => void;
}

const getCourseStyles = (hex: string = '#3b82f6') => {
  return {
    backgroundColor: `${hex}15`,
    color: hex,
    borderLeft: `2px solid ${hex}`
  };
};

const DayCell: React.FC<DayCellProps> = ({ 
  day, 
  dateStr, 
  isToday, 
  isWeekend, 
  events, 
  courses,
  note, 
  onNoteChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempNote, setTempNote] = useState(note);

  useEffect(() => {
    setTempNote(prev => prev !== note ? note : prev);
  }, [note]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (tempNote !== note) {
      onNoteChange(tempNote);
    }
  }, [tempNote, note, onNoteChange]);

  // Weekly view "Big Note" mode: triggered when day is null
  if (day === null && dateStr) {
    return (
      <div className="w-full h-full flex flex-col" onClick={(e) => {
        e.stopPropagation();
        if (!isEditing) setIsEditing(true);
      }}>
        {isEditing ? (
          <textarea
            autoFocus
            className="w-full h-full min-h-[80px] md:min-h-[100px] text-xs md:text-sm p-3 bg-white border-2 border-blue-500 rounded-xl outline-none resize-none transition-all shadow-inner"
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            onBlur={handleBlur}
            placeholder="记录今日详细计划..."
          />
        ) : (
          <div className="w-full h-full min-h-[80px] md:min-h-[100px] text-xs md:text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed p-2 md:p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-text border border-transparent">
            {note || (
              <span className="text-gray-300 italic flex items-center gap-2">
                点击此处开始记录...
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (day === null) {
    return <div className="h-full w-full bg-gray-50/30"></div>;
  }

  return (
    <div 
      className={`h-full p-1 md:p-1.5 flex flex-col group transition-colors duration-200 w-full overflow-hidden ${
        isToday ? 'bg-red-50/30' : isWeekend ? 'bg-gray-50' : 'bg-white'
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1 gap-1 flex-shrink-0">
        <span className={`text-[10px] md:text-sm font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
          isToday ? 'bg-red-600 text-white shadow-md transform scale-105' : 'text-gray-600'
        }`}>
          {day}
        </span>
        <div className="flex flex-col gap-0.5 items-end overflow-visible w-full">
          {events.map((event, idx) => (
            <span 
              key={`event-${idx}`} 
              className="text-[7px] md:text-[9px] px-1 py-0 rounded bg-red-100 text-red-700 font-bold leading-tight text-right w-full truncate md:whitespace-normal border-l-2 border-red-500"
              title={event.title}
            >
              {event.title}
            </span>
          ))}
          {courses.map((course) => {
            const styles = getCourseStyles(course.color);
            return (
              <span 
                key={`course-${course.id}`} 
                className="text-[7px] md:text-[9px] px-1 py-0 rounded font-bold leading-tight text-right w-full truncate md:whitespace-normal"
                style={styles}
                title={course.name}
              >
                📚 {course.name}
              </span>
            );
          })}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative cursor-text mt-1" onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}>
        {isEditing ? (
          <textarea
            autoFocus
            className="absolute inset-0 w-full h-full text-[9px] md:text-xs p-1 bg-white border border-blue-400 rounded outline-none resize-none z-10 shadow-sm"
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            onBlur={handleBlur}
            placeholder="..."
          />
        ) : (
          <div className="text-[9px] md:text-xs text-gray-500 whitespace-pre-wrap break-words leading-tight md:leading-relaxed p-0.5 h-full overflow-y-auto scrollbar-hide">
            {note || (
              <span className="text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity text-[7px] md:text-xs">
                ✍️ 记点什么
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCell;
