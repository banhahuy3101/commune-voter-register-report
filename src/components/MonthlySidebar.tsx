import React, { useState, useMemo } from 'react';
import {
  MonthlyRecord,
  formatKhmerNumber,
  calculateDistrictTotal,
  toKhmerDigits,
  KHMER_MONTH_NAMES,
  getDaysInMonth,
} from '../types/sheet';
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  FileSpreadsheet,
  Sparkles,
  X,
  Calendar,
  RefreshCw,
  Search,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';

interface MonthlySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  months: MonthlyRecord[];
  activeMonthId: string;
  onSelectMonth: (monthId: string) => void;
  onCreateMonth: (
    monthName: string,
    reportDate: string,
    copyCurrentData: boolean,
    createGoogleSheet: boolean
  ) => void;
  onDeleteMonth: (monthId: string) => void;
  onDuplicateMonth: (monthId: string) => void;
  isCreatingSheet?: boolean;
}

export const MonthlySidebar: React.FC<MonthlySidebarProps> = ({
  isOpen,
  onToggle,
  months,
  activeMonthId,
  onSelectMonth,
  onCreateMonth,
  onDeleteMonth,
  onDuplicateMonth,
  isCreatingSheet = false,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(7);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [namingStyle, setNamingStyle] = useState<'month_only' | 'exact_date' | 'custom'>('month_only');
  const [newMonthName, setNewMonthName] = useState('');
  const [newReportDate, setNewReportDate] = useState('');
  const [copyCurrent, setCopyCurrent] = useState(true);
  const [createSheetSameTime, setCreateSheetSameTime] = useState(true);

  // Helper to recompute labels from day, month, year
  const applyDateComponents = (d: number, m: number, y: number, style = namingStyle) => {
    setSelectedDay(d);
    setSelectedMonth(m);
    setSelectedYear(y);

    const khmerD = toKhmerDigits(d);
    const khmerMonthName = KHMER_MONTH_NAMES[m - 1] || 'តុលា';
    const khmerY = toKhmerDigits(y);

    const generatedReportDate = `ប្រចាំថ្ងៃទី ${khmerD} ខែ ${khmerMonthName} ឆ្នាំ ${khmerY}`;
    setNewReportDate(generatedReportDate);

    if (style === 'month_only') {
      setNewMonthName(`ខែ${khmerMonthName} ឆ្នាំ${khmerY}`);
    } else if (style === 'exact_date') {
      setNewMonthName(`ថ្ងៃទី ${khmerD} ខែ${khmerMonthName} ឆ្នាំ${khmerY}`);
    }
  };

  const handleOpenCreate = () => {
    const today = new Date();
    const currentY = today.getFullYear() || 2026;
    let targetM = today.getMonth() + 2;
    let targetY = currentY;
    if (targetM > 12) {
      targetM = 1;
      targetY += 1;
    }
    const targetD = 7;
    setSelectedDay(targetD);
    setSelectedMonth(targetM);
    setSelectedYear(targetY);
    setNamingStyle('month_only');
    applyDateComponents(targetD, targetM, targetY, 'month_only');
    setCopyCurrent(true);
    setIsCreateModalOpen(true);
  };

  const handleDayChange = (d: number) => {
    applyDateComponents(d, selectedMonth, selectedYear);
  };

  const handleMonthChange = (m: number) => {
    const maxDays = getDaysInMonth(selectedYear, m);
    const validDay = Math.min(selectedDay, maxDays);
    applyDateComponents(validDay, m, selectedYear);
  };

  const handleYearChange = (y: number) => {
    const maxDays = getDaysInMonth(y, selectedMonth);
    const validDay = Math.min(selectedDay, maxDays);
    applyDateComponents(validDay, selectedMonth, y);
  };

  const handleNativeDateChange = (dateStr: string) => {
    if (!dateStr) return;
    const [yStr, mStr, dStr] = dateStr.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const d = parseInt(dStr, 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      applyDateComponents(d, m, y);
    }
  };

  const handleNamingStyleChange = (style: 'month_only' | 'exact_date' | 'custom') => {
    setNamingStyle(style);
    const khmerD = toKhmerDigits(selectedDay);
    const khmerMonthName = KHMER_MONTH_NAMES[selectedMonth - 1] || 'តុលា';
    const khmerY = toKhmerDigits(selectedYear);

    if (style === 'month_only') {
      setNewMonthName(`ខែ${khmerMonthName} ឆ្នាំ${khmerY}`);
    } else if (style === 'exact_date') {
      setNewMonthName(`ថ្ងៃទី ${khmerD} ខែ${khmerMonthName} ឆ្នាំ${khmerY}`);
    }
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonthName.trim()) return;
    onCreateMonth(
      newMonthName.trim(),
      newReportDate.trim() ||
      `ប្រចាំថ្ងៃទី ${toKhmerDigits(selectedDay)} ខែ ${KHMER_MONTH_NAMES[selectedMonth - 1]} ឆ្នាំ ${toKhmerDigits(selectedYear)}`,
      copyCurrent,
      createSheetSameTime
    );
    setIsCreateModalOpen(false);
  };

  // Filter months by search query
  const filteredMonths = useMemo(() => {
    if (!searchQuery.trim()) return months;
    const q = searchQuery.trim().toLowerCase();
    return months.filter(
      (m) =>
        m.monthName.toLowerCase().includes(q) ||
        (m.reportDateKh && m.reportDateKh.toLowerCase().includes(q))
    );
  }, [months, searchQuery]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Left Sidebar Drawer */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[65px] left-0 h-screen lg:h-[calc(100vh-65px)] z-40 bg-white border-r border-slate-200/90 shadow-xl lg:shadow-none flex flex-col transition-all duration-300 ease-in-out font-kantumruy ${isOpen ? 'w-84 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-18'
          }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          {isOpen ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl text-white shadow-md shadow-blue-500/20 shrink-0">
                <CalendarDays className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-normal font-moul tracking-wide text-amber-300 truncate">
                    បញ្ជីប្រចាំខែ
                  </h2>
                  <span className="text-[10px] bg-blue-500/20 text-blue-200 border border-blue-400/30 px-1.5 py-0.2 rounded-full font-normal">
                    {formatKhmerNumber(months.length)}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-300 truncate font-normal">
                  ស្រុកជើងព្រៃ • កំណត់ត្រាប្រចាំខែ
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center py-0.5">
              <div className="p-1.5 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg text-white shadow-xs">
                <CalendarDays className="w-4.5 h-4.5" />
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={onToggle}
            title={isOpen ? 'បង្រួម Menu (Collapse)' : 'ពង្រីក Menu (Expand)'}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            {isOpen ? (
              <ChevronLeft className="w-4.5 h-4.5" />
            ) : (
              <ChevronRight className="w-4.5 h-4.5" />
            )}
          </button>
        </div>

        {/* Sidebar Body (Expanded) */}
        {isOpen ? (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60">
            {/* Top Action & Search Section */}
            <div className="p-3 bg-white border-b border-slate-200/80 space-y-2 shrink-0">
              {/* Create New Month Button */}
              <button
                onClick={handleOpenCreate}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-normal shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
                <span>+ បង្កើត / រក្សាទុកខែថ្មី</span>
              </button>

              {/* Quick Search / Filter Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ស្វែងរកខែ ឬកាលបរិច្ឆេទ..."
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-normal text-slate-800 placeholder:text-slate-400 transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Saved Months */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
              <div className="flex items-center justify-between text-[11px] font-normal text-slate-500 uppercase tracking-wider px-1">
                <span>កំណត់ត្រា ({formatKhmerNumber(filteredMonths.length)} ខែ):</span>
                {searchQuery && (
                  <span className="text-[10px] text-blue-600 font-normal">
                    តម្រងសកម្ម
                  </span>
                )}
              </div>

              {filteredMonths.length === 0 ? (
                <div className="p-6 text-center text-slate-400 space-y-2 bg-white rounded-xl border border-dashed border-slate-200">
                  <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-normal text-slate-600">
                    រកមិនឃើញកំណត់ត្រា
                  </p>
                  <p className="text-[11px] text-slate-400 font-normal">
                    សូមសាកល្បងស្វែងរកពាក្យផ្សេង
                  </p>
                </div>
              ) : (
                filteredMonths.map((m) => {
                  const isActive = m.id === activeMonthId;
                  const total = calculateDistrictTotal(m.communes);

                  return (
                    <div
                      key={m.id}
                      onClick={() => onSelectMonth(m.id)}
                      className={`relative rounded-xl p-3 border transition-all duration-200 cursor-pointer overflow-hidden ${isActive
                        ? 'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/30 border-blue-400 shadow-xs ring-2 ring-blue-500/15 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-gradient-to-b before:from-blue-600 before:to-indigo-600 before:rounded-r-full'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/50'
                        }`}
                    >
                      {/* Top Row: Month Name & Active Badge */}
                      <div className="flex items-start justify-between gap-1.5 pl-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4
                              className={`text-xs md:text-sm font-normal font-moul truncate ${isActive ? 'text-blue-950' : 'text-slate-800'
                                }`}
                            >
                              {m.monthName}
                            </h4>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-normal bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                </span>
                                <span>កំពុងប្រើ</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 font-normal flex items-center gap-1 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-600/70 shrink-0" />
                            <span className="truncate">{m.reportDateKh}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats summary Badges */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100/90 flex items-center justify-between gap-2 text-[11px] pl-1">
                        <div className="bg-slate-100/90 border border-slate-200/60 rounded-md px-2 py-0.5 text-slate-700 flex items-center gap-1 text-[10.5px]">
                          <span className="text-slate-500 font-normal">បញ្ជី២០២៦:</span>
                          <span className="font-normal text-slate-900">
                            {formatKhmerNumber(total.list2026Total)}
                          </span>
                        </div>
                        <div className="bg-blue-50/90 border border-blue-200/60 rounded-md px-2 py-0.5 text-blue-700 flex items-center gap-1 text-[10.5px]">
                          <span className="text-blue-500 font-normal">CPP:</span>
                          <span className="font-normal text-blue-800">
                            {formatKhmerNumber(total.list2026Cpp)}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-2 pt-1.5 flex items-center justify-between gap-1 text-[11px] pl-1">
                        <div className="flex items-center gap-1">
                          {m.spreadsheetUrl ? (
                            <a
                              href={m.spreadsheetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[10px] font-normal text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300/80 transition-colors shadow-2xs"
                              title="បើក Google Sheet នេះក្នុងផ្ទាំងថ្មី"
                            >
                              <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                              <span>បើក Sheet</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          ) : m.spreadsheetId ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-normal text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                              title="បានភ្ជាប់ Google Sheet"
                            >
                              <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-600" />
                              <span>ភ្ជាប់ Sheet</span>
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onDuplicateMonth(m.id)}
                            title="ចម្លងទិន្នន័យខែនេះទៅខែថ្មី (Duplicate)"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {months.length > 1 && (
                            <button
                              onClick={() => onDeleteMonth(m.id)}
                              title="លុបខែនេះ (Delete Month)"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Bottom Tip */}
            <div className="p-3 bg-white border-t border-slate-200/80 text-[11px] text-slate-500 shrink-0">
              <div className="flex items-center gap-1.5 text-slate-700 font-normal">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>រក្សាទុកស្វ័យប្រវត្តិតាមខែ</span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500 leading-relaxed font-normal">
                រាល់ទិន្នន័យត្រូវបានរក្សាទុកដាច់ដោយឡែកក្នុង Firestore & Google Sheets។
              </p>
            </div>
          </div>
        ) : (
          /* Collapsed Mini Rail */
          <div className="flex-1 flex flex-col items-center py-3.5 space-y-3 bg-slate-50/80">
            {/* Create Action */}
            <button
              onClick={handleOpenCreate}
              title="បង្កើត / រក្សាទុកខែថ្មី"
              className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer group"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            </button>

            <div className="w-8 border-b border-slate-200" />

            {/* Months Mini Stack */}
            <div className="flex-1 overflow-y-auto space-y-2 flex flex-col items-center custom-scrollbar w-full px-1">
              {months.map((m) => {
                const isActive = m.id === activeMonthId;
                // Extract month abbreviation or number
                const cleanLabel = m.monthName.replace(/ខែ|ឆ្នាំ.*/g, '').trim() || m.monthName.slice(0, 3);

                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectMonth(m.id)}
                    title={`${m.monthName}\n${m.reportDateKh}`}
                    className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-normal text-[10px] transition-all cursor-pointer relative ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400 scale-105'
                      : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-300'
                      }`}
                  >
                    <span className="truncate max-w-[36px]">{cleanLabel}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-300 absolute -top-0.5 -right-0.5 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* Modal: Create / Save New Record */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-kantumruy">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl text-white shadow-md shadow-blue-500/20">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-normal font-moul tracking-wide text-amber-300">
                    បង្កើត / រក្សាទុកកំណត់ត្រាថ្មី
                  </h3>
                  <div className="text-xs text-slate-300 font-normal">
                    ស្រុកជើងព្រៃ • កំណត់តាម ថ្ងៃ, ខែ, ឆ្នាំ (Day, Month, Year)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleConfirmCreate} className="p-5 space-y-4 overflow-y-auto custom-scrollbar font-normal">
              {/* Day, Month, Year Primary Selectors */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-3 font-normal">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>ជ្រើសរើស កាលបរិច្ឆេទ (ថ្ងៃ, ខែ, ឆ្នាំ)</span>
                  </span>
                  {/* Native Date Picker sync */}
                  <label className="flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 cursor-pointer font-normal bg-blue-100/70 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors">
                    <span>ប្រតិទិន</span>
                    <input
                      type="date"
                      value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`}
                      onChange={(e) => handleNativeDateChange(e.target.value)}
                      className="w-4 h-4 opacity-0 absolute pointer-events-auto cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Day (ថ្ងៃ) */}
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 mb-1">
                      ថ្ងៃ (Day):
                    </label>
                    <select
                      value={selectedDay}
                      onChange={(e) => handleDayChange(parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs md:text-sm font-normal text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                    >
                      {Array.from(
                        { length: getDaysInMonth(selectedYear, selectedMonth) },
                        (_, i) => i + 1
                      ).map((d) => (
                        <option key={d} value={d}>
                          ថ្ងៃទី {toKhmerDigits(d)} ({d})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month (ខែ) */}
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 mb-1">
                      ខែ (Month):
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs md:text-sm font-normal text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                    >
                      {KHMER_MONTH_NAMES.map((name, idx) => (
                        <option key={name} value={idx + 1}>
                          ខែ{name} ({idx + 1 < 10 ? `0${idx + 1}` : idx + 1})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year (ឆ្នាំ) */}
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 mb-1">
                      ឆ្នាំ (Year):
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs md:text-sm font-normal text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                    >
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                        <option key={y} value={y}>
                          ឆ្នាំ {toKhmerDigits(y)} ({y})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 font-normal">
                  <span className="text-[10px] font-normal text-slate-500 mr-1">
                    រហ័ស៖
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      applyDateComponents(today.getDate(), today.getMonth() + 1, today.getFullYear());
                    }}
                    className="px-2 py-0.5 text-[11px] font-normal bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    ថ្ងៃនេះ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const yest = new Date();
                      yest.setDate(yest.getDate() - 1);
                      applyDateComponents(yest.getDate(), yest.getMonth() + 1, yest.getFullYear());
                    }}
                    className="px-2 py-0.5 text-[11px] font-normal bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    ម្សិលមិញ
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDateComponents(7, selectedMonth, selectedYear)}
                    className="px-2 py-0.5 text-[11px] font-normal bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    ថ្ងៃទី ០៧
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDateComponents(15, selectedMonth, selectedYear)}
                    className="px-2 py-0.5 text-[11px] font-normal bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    ថ្ងៃទី ១៥
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const lastDay = getDaysInMonth(selectedYear, selectedMonth);
                      applyDateComponents(lastDay, selectedMonth, selectedYear);
                    }}
                    className="px-2 py-0.5 text-[11px] font-normal bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    ចុងខែ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      let nextM = selectedMonth + 1;
                      let nextY = selectedYear;
                      if (nextM > 12) {
                        nextM = 1;
                        nextY += 1;
                      }
                      const maxD = getDaysInMonth(nextY, nextM);
                      applyDateComponents(Math.min(selectedDay, maxD), nextM, nextY);
                    }}
                    className="px-2 py-0.5 text-[11px] font-normal bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    ខែបន្ទាប់
                  </button>
                </div>
              </div>

              {/* Record Name Format Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-normal text-slate-700">
                    ឈ្មោះក្នុងបញ្ជី (Record Name):
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleNamingStyleChange('month_only')}
                      className={`px-2 py-0.5 rounded-md font-normal transition-colors cursor-pointer ${namingStyle === 'month_only'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      តាមខែ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNamingStyleChange('exact_date')}
                      className={`px-2 py-0.5 rounded-md font-normal transition-colors cursor-pointer ${namingStyle === 'exact_date'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      តាមថ្ងៃខែឆ្នាំ
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={newMonthName}
                  onChange={(e) => {
                    setNewMonthName(e.target.value);
                    setNamingStyle('custom');
                  }}
                  placeholder="ឧ. ខែតុលា ឆ្នាំ២០២៦ ឬ ថ្ងៃទី ០៧ ខែតុលា ឆ្នាំ២០២៦"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-normal text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs outline-none"
                />
              </div>

              {/* Report Date Label (កាលបរិច្ឆេទរបាយការណ៍) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-normal text-slate-700">
                    កាលបរិច្ឆេទរបាយការណ៍ (Report Date Label):
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      applyDateComponents(selectedDay, selectedMonth, selectedYear)
                    }
                    title="បង្កើតកាលបរិច្ឆេទឡើងវិញតាម ថ្ងៃ ខែ ឆ្នាំ"
                    className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-normal"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>ស្វ័យប្រវត្តឡើងវិញ</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newReportDate}
                  onChange={(e) => setNewReportDate(e.target.value)}
                  placeholder="ឧ. ប្រចាំថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-normal text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs outline-none"
                />
              </div>

              {/* Live Preview Card */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1.5 font-normal">
                <div className="text-[11px] font-normal text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>គំរូក្បាលតារាង និងលិខិតផ្លូវការ (Preview):</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 space-y-1 shadow-2xs">
                  <div className="font-moul text-[11px] font-normal text-slate-900 leading-relaxed text-center">
                    របាយការណ៍បូកសរុបលទ្ធផលការពិនិត្យបញ្ជីឈ្មោះ និងការចុះឈ្មោះបោះឆ្នោត ឆ្នាំ{toKhmerDigits(selectedYear)}
                  </div>
                  <div className="text-[11px] font-normal text-blue-700 text-center">
                    {newReportDate}
                  </div>
                  <div className="text-[10px] text-slate-500 text-right italic pt-0.5 font-normal">
                    ទីតាំង/កាលបរិច្ឆេទ៖ ជើងព្រៃ {newReportDate.replace('ប្រចាំ', '').trim()}
                  </div>
                </div>
              </div>

              {/* Create Google Sheet simultaneously option */}
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 font-normal">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createSheetSameTime}
                    onChange={(e) => setCreateSheetSameTime(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-normal text-emerald-950 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      បង្កើត Google Sheet ដំណាលគ្នា (Create Sheet at same time)
                    </span>
                    <span className="text-[11px] text-emerald-800 block mt-0.5 leading-relaxed font-normal">
                      ប្រព័ន្ធនឹងបង្កើតឯកសារ Google Sheet ផ្លូវការថ្មីមួយក្នុង Google Drive ដោយស្វ័យប្រវត្តិតាមទម្រង់ស្រុកជើងព្រៃ ព្រមទាំងភ្ជាប់រូបមន្ត និងទិន្នន័យឃុំទាំង១០ ស្របពេលបង្កើតកំណត់ត្រានេះភ្លាមៗ។
                    </span>
                  </div>
                </label>
              </div>

              {/* Copy option */}
              <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 font-normal">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={copyCurrent}
                    onChange={(e) => setCopyCurrent(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-normal text-blue-900 block">
                      ចម្លងទិន្នន័យខែបច្ចុប្បន្នជាគោល (Base on Current Month)
                    </span>
                    <span className="text-[11px] text-blue-700 block mt-0.5 leading-relaxed font-normal">
                      ទិន្នន័យចំនួនបញ្ជីឆ្នាំ២០២៥ និងទិន្នន័យបច្ចុប្បន្ននឹងត្រូវបានចម្លង ដើម្បីបន្តការងារដោយងាយស្រួល។
                    </span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreatingSheet}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-normal hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSheet}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-normal shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {createSheetSameTime ? (
                    <>
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>{isCreatingSheet ? 'កំពុងបង្កើត...' : 'យល់ព្រមបង្កើតកំណត់ត្រា & Sheet'}</span>
                    </>
                  ) : (
                    <span>យល់ព្រមបង្កើតកំណត់ត្រា</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
