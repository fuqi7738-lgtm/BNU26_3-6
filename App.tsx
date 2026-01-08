
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import MonthlyCalendar from './components/MonthlyCalendar';
import WeeklyCalendar from './components/WeeklyCalendar';
import { Course } from './types';
import { getWeekNumber } from './utils/dateUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileDown, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Plus, 
  Trash2, 
  X, 
  LayoutGrid, 
  List,
  Hash
} from 'lucide-react';

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
  const months = useMemo(() => [2, 3, 4, 5], []); // Mar, Apr, May, Jun
  const year = 2026;
  const maxWeeks = 18; 

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const [currentWeekNum, setCurrentWeekNum] = useState(1);
  
  useEffect(() => {
    const now = new Date();
    const week = getWeekNumber(now);
    if (week && week >= 1 && week <= maxWeeks) {
      setCurrentWeekNum(week);
    }
  }, [maxWeeks]);

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('bnu-calendar-notes-2026');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('bnu-calendar-courses-2026');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map((c: any) => ({
        ...c,
        color: c.color || '#3b82f6'
      })) : [];
    } catch (e) {
      return [];
    }
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
    setNotes(prev => {
      if (prev[date] === content) return prev;
      return { ...prev, [date]: content };
    });
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

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('calendar-view');
    if (!element) return;

    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const canvas = await html2canvas(element, {
        scale: 2.2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('calendar-view');
          if (clonedElement) {
            const exportWidth = 2400;
            clonedElement.style.width = `${exportWidth}px`; 
            clonedElement.style.padding = '60px';
            clonedElement.style.boxShadow = 'none';

            // 1. 页眉布局调整：月份标题居中，副标题左对齐
            const headerTitle = clonedElement.querySelector('h2');
            const subHeader = clonedElement.querySelector('p.text-gray-400') || clonedElement.querySelector('p.text-gray-500');
            
            const headerContainer = headerTitle?.parentElement;
            if (headerContainer) {
                // 容器设为左对齐，以便副标题左对齐
                headerContainer.style.textAlign = 'left';
                headerContainer.style.marginBottom = '50px';
                headerContainer.style.width = '100%';
            }

            if (headerTitle) {
                headerTitle.style.fontSize = '72px';
                headerTitle.style.fontWeight = '900';
                headerTitle.style.marginBottom = '20px';
                headerTitle.style.display = 'block';
                headerTitle.style.textAlign = 'center'; // 月份居中
                headerTitle.style.width = '100%';
            }
            if (subHeader) {
                (subHeader as HTMLElement).style.fontSize = '32px';
                (subHeader as HTMLElement).style.display = 'block';
                (subHeader as HTMLElement).style.marginTop = '0';
                (subHeader as HTMLElement).style.textAlign = 'left'; // 副标题靠左
                (subHeader as HTMLElement).style.color = '#6b7280';
            }

            // 2. 表格布局：第一列（周次）设为窄列 (70px)
            const gridContainers = clonedElement.querySelectorAll('.grid-cols-\\[32px_repeat\\(7\\,1fr\\)\\]');
            gridContainers.forEach(grid => {
              (grid as HTMLElement).style.gridTemplateColumns = '70px repeat(7, 1fr)';
            });

            // 3. 表头行（星期列）行高自适应
            const headerRowCells = clonedElement.querySelectorAll('.h-8.md\\:h-10');
            headerRowCells.forEach(cell => {
              (cell as HTMLElement).style.height = 'auto';
              (cell as HTMLElement).style.minHeight = '70px';
              (cell as HTMLElement).style.display = 'flex';
              (cell as HTMLElement).style.alignItems = 'center';
              (cell as HTMLElement).style.justifyContent = 'center';
            });

            // 4. 动态计算行高
            const targetTotalHeight = exportWidth * 0.707;
            const cells = clonedElement.querySelectorAll('.md\\:h-36, .h-24');
            const rowCount = Math.max(cells.length / 8, 1);
            const calculatedRowHeight = (targetTotalHeight - 450) / rowCount; 
            
            cells.forEach(el => {
              (el as HTMLElement).style.height = 'auto';
              (el as HTMLElement).style.minHeight = `${Math.max(calculatedRowHeight, 300)}px`;
            });

            // 5. 文字优化：行高适当减小防止溢出
            clonedElement.querySelectorAll('.text-\\[7px\\], .text-\\[9px\\], .text-\\[10px\\], .text-xs, .text-gray-500').forEach(el => {
              (el as HTMLElement).style.fontSize = '24px';
              (el as HTMLElement).style.lineHeight = '1.25';
              (el as HTMLElement).style.fontWeight = '500';
            });
            
            clonedElement.querySelectorAll('.text-sm, .md\\:text-base').forEach(el => {
              (el as HTMLElement).style.fontSize = '30px';
            });

            // 6. 增强色块
            clonedElement.querySelectorAll('.rounded-full, [style*="background-color"]').forEach(el => {
              const htmlEl = el as HTMLElement;
              const bgColor = htmlEl.style.backgroundColor;
              if (bgColor && (bgColor.includes('0.1') || bgColor.includes('15%'))) {
                htmlEl.style.backgroundColor = bgColor.replace(/0\.1\d*/, '0.35').replace(/15%/, '35%');
                htmlEl.style.border = '2px solid rgba(0,0,0,0.1)';
              }
            });

            // 7. 处理溢出
            clonedElement.querySelectorAll('.overflow-y-auto, .scrollbar-hide').forEach(div => {
              (div as HTMLElement).style.overflow = 'visible';
              (div as HTMLElement).style.height = 'auto';
            });
            clonedElement.querySelectorAll('.truncate').forEach(el => {
              el.classList.remove('truncate');
              (el as HTMLElement).style.whiteSpace = 'pre-wrap';
              (el as HTMLElement).style.wordBreak = 'break-all';
              (el as HTMLElement).style.display = 'block';
            });
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
      const canvasRatio = canvas.width / canvas.height;
      
      const marginMm = 4;
      const availableWidth = pdfWidth - (marginMm * 2);
      const availableHeight = pdfHeight - (marginMm * 2);

      let finalWidth, finalHeight;
      const availableRatio = availableWidth / availableHeight;

      if (canvasRatio > availableRatio) {
        finalWidth = availableWidth;
        finalHeight = availableWidth / canvasRatio;
      } else {
        finalHeight = availableHeight;
        finalWidth = availableHeight * canvasRatio;
      }

      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      const suffix = viewMode === 'month' ? `-${months[currentMonthIdx] + 1}月` : `-第${currentWeekNum}周`;
      pdf.save(`BNU-2026-校历${suffix}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const switchToWeekView = (week?: number) => {
    if (week) {
      setCurrentWeekNum(week);
    } else {
      const todayWeek = getWeekNumber(new Date());
      if (todayWeek && todayWeek >= 1 && todayWeek <= maxWeeks) {
        setCurrentWeekNum(todayWeek);
      }
    }
    setViewMode('week');
  };

  const nextWeek = () => setCurrentWeekNum(prev => Math.min(prev + 1, maxWeeks));
  const prevWeek = () => setCurrentWeekNum(prev => Math.max(prev - 1, 1));

  const handleDayJump = (date: string) => {
    const d = new Date(date);
    const week = getWeekNumber(d);
    if (week) {
      setCurrentWeekNum(week);
      setViewMode('week');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 mb-6 md:mb-10">
        <div className="flex items-center gap-2 md:gap-3">
          <CalendarIcon className="w-6 h-6 md:w-10 md:h-10 text-red-700 shrink-0" />
          <div>
            <h1 className="text-xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
              2026 <span className="text-red-700">校历规划</span>
            </h1>
            <p className="text-[10px] md:text-base text-gray-500 mt-0.5 md:mt-2 font-medium">北师大 · 25-26学年第二学期</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => setShowCourseManager(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white text-gray-700 px-3 md:px-5 py-2 rounded-xl border border-gray-200 text-xs md:text-base font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="whitespace-nowrap">课程管理</span>
          </button>
          
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-red-700 text-white px-3 md:px-5 py-2 rounded-xl text-xs md:text-base font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-100 disabled:opacity-50`}
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span className="whitespace-nowrap">导出 PDF</span>
          </button>
        </div>
      </header>

      <div className="bg-white p-3 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setViewMode('month')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-xs md:text-base font-bold transition-all ${
              viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            月视图
          </button>
          <button 
            onClick={() => switchToWeekView()}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-xs md:text-base font-bold transition-all ${
              viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            周视图
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
          {viewMode === 'month' ? (
            <div className="flex items-center bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-hide">
              {months.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => setCurrentMonthIdx(idx)}
                  className={`flex-none px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                    currentMonthIdx === idx 
                      ? 'bg-white text-red-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {m + 1}月
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <button 
                  onClick={prevWeek}
                  className="p-2 md:p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="text-lg md:text-2xl font-black text-gray-900 min-w-[80px] md:min-w-[100px] text-center">
                  第 {currentWeekNum} 周
                </div>
                <button 
                  onClick={nextWeek}
                  className="p-2 md:p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all text-gray-700"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 md:px-3 md:py-1.5">
                <Hash className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
                <select 
                  value={currentWeekNum}
                  onChange={(e) => setCurrentWeekNum(parseInt(e.target.value))}
                  className="bg-transparent text-xs md:text-sm font-bold text-gray-700 outline-none cursor-pointer"
                >
                  {Array.from({length: maxWeeks}, (_, i) => i + 1).map(w => (
                    <option key={w} value={w}>第 {w} 周</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div id="calendar-view" className="relative">
        {viewMode === 'month' ? (
          <MonthlyCalendar 
            year={year} 
            month={months[currentMonthIdx]} 
            notes={notes}
            courses={courses}
            onNoteChange={handleNoteChange}
            onDayClick={handleDayJump}
          />
        ) : (
          <WeeklyCalendar 
            weekNum={currentWeekNum} 
            notes={notes}
            courses={courses}
            onNoteChange={handleNoteChange}
          />
        )}
      </div>

      {showCourseManager && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                课程管理
              </h3>
              <button onClick={() => setShowCourseManager(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8">
              <form onSubmit={handleAddCourse} className="bg-blue-50/50 p-4 md:p-6 rounded-2xl border border-blue-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">课程名称</label>
                    <input 
                      type="text" 
                      value={newCourse.name}
                      onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                      placeholder="例如: 高等数学"
                      className="w-full px-3 py-2 text-sm md:text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">课程颜色</label>
                    <div className="flex flex-wrap gap-2">
                      {COURSE_COLORS.map(color => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setNewCourse({...newCourse, color: color.hex})}
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 transition-all ${newCourse.color === color.hex ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">上课时间</label>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {['一', '二', '三', '四', '五', '六', '日'].map((day, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const current = newCourse.weekdays || [];
                          if (current.includes(i + 1)) {
                            setNewCourse({ ...newCourse, weekdays: current.filter(d => d !== i + 1) });
                          } else {
                            setNewCourse({ ...newCourse, weekdays: [...current, i + 1].sort() });
                          }
                        }}
                        className={`w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm rounded-xl font-bold transition-all border ${
                          newCourse.weekdays?.includes(i + 1) 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">起始周</label>
                    <input 
                      type="number" 
                      min="1" max="18"
                      value={newCourse.startWeek}
                      onChange={e => setNewCourse({...newCourse, startWeek: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 text-sm md:text-base rounded-xl border border-gray-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">结束周</label>
                    <input 
                      type="number" 
                      min="1" max="18"
                      value={newCourse.endWeek}
                      onChange={e => setNewCourse({...newCourse, endWeek: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 text-sm md:text-base rounded-xl border border-gray-200 outline-none"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2.5 md:py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm md:text-base shadow-lg shadow-blue-100"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  添加课程
                </button>
              </form>
              <div className="space-y-4">
                <h4 className="text-base md:text-lg font-bold text-gray-800">已添加课程 ({courses.length})</h4>
                {courses.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-xs md:text-sm">暂无课程</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {courses.map(course => (
                      <div key={course.id} className="flex items-center justify-between p-3 md:p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: course.color }} />
                          <div>
                            <div className="font-bold text-gray-900 text-sm md:text-base">{course.name}</div>
                            <div className="text-[10px] md:text-xs text-gray-500">周 {course.weekdays.join(', ')} · {course.startWeek}-{course.endWeek} 周</div>
                          </div>
                        </div>
                        <button onClick={() => deleteCourse(course.id)} className="p-2 text-gray-300 hover:text-red-600 transition-all">
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 md:p-6 bg-gray-50 border-t">
              <button onClick={() => setShowCourseManager(false)} className="w-full bg-gray-900 text-white font-bold py-2.5 md:py-3 rounded-xl hover:bg-black transition-all">完成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
