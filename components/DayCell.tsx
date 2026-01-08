
import React, { useState, useEffect } from 'react';
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

// Simple helper to adjust color brightness for display
const getCourseStyles = (hex: string = '#3b82f6') => {
  // We assume the hex provided is a strong primary color (like Tailwind 500/600)
  // We'll use the hex for a solid border or icon, but derived light bg for the cell element
  return {
    backgroundColor: `${hex}15`, // ~8% opacity for bg
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
    setTempNote(note);
  }, [note]);

  if (day === null) {
    return <div className="min-h-[80px] md:h-32 bg-gray-50/50 w-full h-full"></div>;
  }

  const handleBlur = () => {
    setIsEditing(false);
    onNoteChange(tempNote);
  };

  return (
    <div 
      className={`min-h-[80px] md:h-32 p-0.5 md:p-1 flex flex-col group transition-colors duration-200 w-full h-full ${
        isToday ? 'bg-blue-50/50' : isWeekend ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-0.5 md:mb-1 gap-0.5">
        <span className={`text-[9px] md:text-sm font-semibold px-1 py-0 rounded shrink-0 ${
          isToday ? 'bg-red-700 text-white' : 'text-gray-600'
        }`}>
          {day}
        </span>
        <div className="flex flex-col gap-0.5 items-end overflow-visible w-full">
          {/* Academic Events (Red) */}
          {events.map((event, idx) => (
            <span 
              key={`event-${idx}`} 
              className="text-[7px] md:text-[9px] px-1 py-0 rounded bg-red-100 text-red-700 font-bold leading-tight text-right w-full break-words border-l-2 border-red-500"
              title={event.title}
            >
              {event.title}
            </span>
          ))}
          {/* Courses (Custom Color) */}
          {courses.map((course) => {
            const styles = getCourseStyles(course.color);
            return (
              <span 
                key={`course-${course.id}`} 
                className="text-[7px] md:text-[9px] px-1 py-0 rounded font-bold leading-tight text-right w-full break-words"
                style={styles}
                title={course.name}
              >
                📚 {course.name}
              </span>
            );
          })}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative cursor-text min-h-[40px]" onClick={() => setIsEditing(true)}>
        {isEditing ? (
          <textarea
            autoFocus
            className="w-full h-full text-[9px] md:text-xs p-0.5 md:p-1 bg-white border border-blue-400 rounded outline-none resize-none z-10"
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            onBlur={handleBlur}
            placeholder="..."
          />
        ) : (
          <div className="text-[9px] md:text-xs text-gray-700 whitespace-pre-wrap break-words leading-tight md:leading-relaxed p-0.5 md:p-1 h-full overflow-y-auto scrollbar-hide">
            {note || (
              <span className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity text-[7px] md:text-xs">
                +
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCell;
