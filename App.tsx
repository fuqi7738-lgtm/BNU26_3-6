
import React, { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import MonthlyCalendar from './components/MonthlyCalendar';
import { CalendarState, Course } from './types';
import { ChevronLeft, ChevronRight, FileDown, Calendar as CalendarIcon, Info, BookOpen, Plus, Trash2, X, Check } from 'lucide-react';

const COURSE_COLORS = [
  { name: '蓝色', hex: '#3b82f6', bg: '#dbeafe', text: '#1d4ed8' },
  { name: '绿色', hex: '#10b981', bg: '#d1fae5', text: '#047857' },
  { name: '琥珀', hex: '#f59e0b', bg: '#fef3c7', text: '#b45309' },
  { name: '玫瑰', hex: '#f43f5e', bg: '#ffe4e6', text: '#be123c' },
  { name: '紫色', hex: '#8b5cf6', bg: '#ede9fe', text: '#6d28d9' },
  { name: '橙色', hex: '#f97316', bg: '#ffedd5', text: '#c2410c' },
  { name: '青色', hex: '#06b6d4', bg: '#cffafe', text: '#0e7490' },
  { name: '靛蓝', hex: '#6366f1', bg: '#e0e7ff', text: '#4338ca' },
];

const App: React.FC = () => {
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const months = [2, 3, 4, 5]; 
  const year = 2026;

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('bnu-calendar-notes-2026');
    return saved ? JSON.parse(saved) : {};
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('bnu-calendar-courses-2026');
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    return parsed.map((c: any) => {
      if (typeof c.weekday === 'number') {
        return {
          ...c,
          weekdays: [c.weekday],
          weekday: undefined,
          color: c.color || '#3b82f6'
        };
      }
      return { ...c, color: c.color || '#3b82f6' };
    });
  });

  const [isExporting, setIsExporting] = useState(false);
  const [showCourseManager, setShowCourseManager] = useState(false);
  
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: '',
    weekdays: [], 
    startWeek: 1,
    endWeek: 16,
    color: '#3b82f6'
  });

  useEffect(() => {
    localStorage.setItem('bnu-calendar-notes-2026', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('bnu-calendar-courses-2026', JSON.stringify(courses));
  }, [courses]);

  const handleNoteChange = useCallback((date: string, content: string) => {
    setNotes(prev => ({
      ...prev,
      [date]: content
    }));
  }, []);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.weekdays || newCourse.weekdays.length === 0) {
      alert("请输入课程名称并至少选择一个上课时间");
      return;
    }
    
    const course: Course = {
      id: Date.now().toString(),
      name: newCourse.name,
      weekdays: newCourse.weekdays,
      startWeek: newCourse.startWeek || 1,
      endWeek: newCourse.endWeek || 16,
      color: newCourse.color || '#3b82f6'
    };

    setCourses(prev => [...prev, course]);
    setNewCourse({ ...newCourse, name: '', weekdays: [], color: '#3b82f6' });
  };

  const toggleWeekday = (day: number) => {
    setNewCourse(prev => {
      const current = prev.weekdays || [];
      if (current.includes(day)) {
        return { ...prev, weekdays: current.filter(d => d !== day) };
      } else {
        return { ...prev, weekdays: [...current, day].sort() };
      }
    });
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('calendar-view');
    if (!element) return;

    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 4, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('calendar-view');
          if (clonedElement) {
            clonedElement.style.width = '1440px';
            clonedElement.style.maxWidth = 'none';
            clonedElement.style.padding = '40px';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.boxShadow = 'none';

            const noteContainers = clonedElement.querySelectorAll('.overflow-y-auto');
            noteContainers.forEach(div => {
              (div as HTMLElement).style.overflow = 'visible';
              (div as HTMLElement).style.height = 'auto';
              (div as HTMLElement).style.maxHeight = 'none';
            });

            const truncatedElements = clonedElement.querySelectorAll('.truncate');
            truncatedElements.forEach(el => {
              el.classList.remove('truncate');
              (el as HTMLElement).style.whiteSpace = 'normal';
              (el as HTMLElement).style.wordBreak = 'break-word';
              (el as HTMLElement).style.overflow = 'visible';
            });

            const dayCells = clonedElement.querySelectorAll('.min-h-\\[80px\\]');
            dayCells.forEach(cell => {
              (cell as HTMLElement).style.height = 'auto';
              (cell as HTMLElement).style.minHeight = '140px'; 
            });

            const gridContainer = clonedElement.querySelector('.grid');
            if (gridContainer) {
              (gridContainer as HTMLElement).style.gridTemplateColumns = '80px repeat(7, 1fr)';
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        const yOffset = (pdfHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
      }

      pdf.save(`BNU校历_2026年${months[currentMonthIdx] + 1}月.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('PDF导出失败，请检查浏览器权限');
    } finally {
      setIsExporting(false);
    }
  };

  const nextMonth = () => currentMonthIdx < months.length - 1 && setCurrentMonthIdx(currentMonthIdx + 1);
  const prevMonth = () => currentMonthIdx > 0 && setCurrentMonthIdx(currentMonthIdx - 1);

  const WEEK_DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="w-full max-w-7xl mx-auto px-1 md:px-4 py-4 md:py-8 overflow-x-hidden min-h-screen text-gray-900">
      <header className="flex flex-col items-center justify-between mb-4 md:mb-8 gap-4 sticky top-0 bg-gray-50/95 backdrop-blur-sm z-30 py-2 md:py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 md:gap-3 w-full justify-center md:justify-start">
          <div className="bg-red-700 p-1.5 md:p-2.5 rounded-lg shadow-md">
            <CalendarIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-lg md:text-2xl font-extrabold text-gray-900 leading-tight">2026 校历规划</h1>
            <p className="text-gray-500 text-[10px] md:text-sm font-medium">北京师范大学 | Spring 2026</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            <button onClick={prevMonth} disabled={currentMonthIdx === 0} className="p-1 md:p-2 hover:bg-gray-100 disabled:opacity-30 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 md:w-5 h-5" /></button>
            <div className="flex gap-0.5 md:gap-1 px-1">
              {months.map((m, idx) => (
                <button key={m} onClick={() => setCurrentMonthIdx(idx)} className={`px-2 md:px-4 py-1 md:py-1.5 text-[10px] md:text-sm font-bold rounded-lg transition-all duration-200 ${currentMonthIdx === idx ? 'bg-red-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>{m + 1}月</button>
              ))}
            </div>
            <button onClick={nextMonth} disabled={currentMonthIdx === months.length - 1} className="p-1 md:p-2 hover:bg-gray-100 disabled:opacity-30 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 md:w-5 h-5" /></button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCourseManager(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs md:text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>课程管理</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs md:text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-md disabled:opacity-50 active:scale-95"
            >
              {isExporting ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div> : <FileDown className="w-4 h-4" />}
              <span>{isExporting ? '生成PDF中...' : '导出PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      {showCourseManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <BookOpen className="w-5 h-5 text-blue-600" />
                课程管理与导入
              </h3>
              <button onClick={() => setShowCourseManager(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
              <section>
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> 新增课程
                </h4>
                <form onSubmit={handleAddCourse} className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="w-full">
                    <label className="block text-xs font-bold text-gray-500 mb-1">课程名称</label>
                    <input 
                      type="text" 
                      placeholder="例如：量子力学" 
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={newCourse.name}
                      onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">上课时间（可多选）</label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWeekday(day)}
                          className={`flex-1 min-w-[50px] py-2 px-1 text-sm font-bold rounded-lg border transition-all ${
                            newCourse.weekdays?.includes(day)
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'
                          }`}
                        >
                          周{WEEK_DAY_LABELS[day-1]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">标识颜色</label>
                    <div className="flex flex-wrap gap-3">
                      {COURSE_COLORS.map(color => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setNewCourse({...newCourse, color: color.hex})}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${
                            newCourse.color === color.hex ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">起始周</label>
                      <input 
                        type="number" 
                        min="1" max="20" 
                        className="w-full p-2 border rounded-lg outline-none bg-white"
                        value={newCourse.startWeek}
                        onChange={e => setNewCourse({...newCourse, startWeek: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">结束周</label>
                      <input 
                        type="number" 
                        min="1" max="20" 
                        className="w-full p-2 border rounded-lg outline-none bg-white"
                        value={newCourse.endWeek}
                        onChange={e => setNewCourse({...newCourse, endWeek: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-[0.98]">
                    保存课程
                  </button>
                </form>
              </section>

              <section>
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> 我的课程列表 ({courses.length})
                </h4>
                {courses.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl">暂无导入课程</div>
                ) : (
                  <div className="space-y-2">
                    {courses.map(course => (
                      <div key={course.id} className="flex items-center justify-between p-3 bg-white border rounded-xl hover:border-blue-200 transition-colors group shadow-sm">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: course.color }} />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-800 truncate">{course.name}</p>
                            <p className="text-xs text-gray-500">
                              周{course.weekdays.map(d => WEEK_DAY_LABELS[d-1]).join(', ')} | 第 {course.startWeek} - {course.endWeek} 周
                            </p>
                          </div>
                        </div>
                        <button onClick={() => deleteCourse(course.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
            
            <div className="p-4 bg-gray-50 border-t text-center text-xs text-gray-400">
              提示：课程录入后将自动同步至所有对应的日期格子中
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-[10px] md:text-sm shadow-sm">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-bold">个性化设置：</span>
          现在您可以为不同课程设置专属颜色标识。校历事项固定为红色。
        </p>
      </div>

      <main className="w-full relative">
        <MonthlyCalendar
          id="calendar-view"
          year={year}
          month={months[currentMonthIdx]}
          notes={notes}
          courses={courses}
          onNoteChange={handleNoteChange}
        />
      </main>

      <footer className="mt-8 text-center text-gray-400 text-[10px] md:text-sm pb-8">
        &copy; 2026 BNU Academic Planner | 浏览器本地存储已启用
      </footer>

      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border border-gray-200 text-[8px] md:text-xs text-gray-500 font-medium z-40">
        已实时保存
      </div>
    </div>
  );
};

export default App;
