import React, { useState } from 'react';
import {
  MonthlyRecord,
  formatKhmerNumber,
  calculateDistrictTotal,
} from '../types/sheet';
import {
  CalendarDays,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  Clock,
  FileSpreadsheet,
  Layers,
  Sparkles,
  X,
  Calendar,
} from 'lucide-react';

interface MonthlySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  months: MonthlyRecord[];
  activeMonthId: string;
  onSelectMonth: (monthId: string) => void;
  onCreateMonth: (monthName: string, reportDate: string, copyCurrentData: boolean) => void;
  onDeleteMonth: (monthId: string) => void;
  onDuplicateMonth: (monthId: string) => void;
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
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMonthName, setNewMonthName] = useState('');
  const [newReportDate, setNewReportDate] = useState('');
  const [copyCurrent, setCopyCurrent] = useState(true);

  // Month suggestion presets
  const monthSuggestions = [
    { name: 'ខែតុលា ឆ្នាំ២០២៦', date: 'ប្រចាំថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦' },
    { name: 'ខែវិច្ឆិកា ឆ្នាំ២០២៦', date: 'ប្រចាំថ្ងៃទី ៧ ខែ វិច្ឆិកា ឆ្នាំ ២០២៦' },
    { name: 'ខែធ្នូ ឆ្នាំ២០២៦', date: 'ប្រចាំថ្ងៃទី ៧ ខែ ធ្នូ ឆ្នាំ ២០២៦' },
    { name: 'ខែមករា ឆ្នាំ២០២៧', date: 'ប្រចាំថ្ងៃទី ៧ ខែ មករា ឆ្នាំ ២០២៧' },
  ];

  const handleOpenCreate = () => {
    // Generate a smart next month suggestion
    const nextMonthIndex = (months.length % 12) + 1;
    const khmerMonthNames = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    const defaultName = `ខែ${khmerMonthNames[(nextMonthIndex + 8) % 12]} ឆ្នាំ២០២៦`;
    setNewMonthName(defaultName);
    setNewReportDate(`ប្រចាំថ្ងៃទី ៧ ${defaultName}`);
    setCopyCurrent(true);
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonthName.trim()) return;
    onCreateMonth(
      newMonthName.trim(),
      newReportDate.trim() || `ប្រចាំថ្ងៃទី ៧ ${newMonthName.trim()}`,
      copyCurrent
    );
    setIsCreateModalOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-2xs transition-opacity"
        />
      )}

      {/* Left Sidebar Drawer */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[65px] left-0 h-screen lg:h-[calc(100vh-65px)] z-40 bg-white border-r border-slate-200 shadow-lg lg:shadow-none flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'w-80 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          {isOpen ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold font-moul tracking-wide text-amber-300 truncate">
                    បញ្ជីប្រចាំខែ
                  </h2>
                  <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded-full font-bold">
                    {formatKhmerNumber(months.length)} ខែ
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  ស្រុកជើងព្រៃ • រក្សាទុកតាមខែ
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center py-1">
              <CalendarDays className="w-5 h-5 text-amber-300" />
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={onToggle}
            title={isOpen ? 'បង្រួម Menu (Collapse)' : 'ពង្រីក Menu (Expand)'}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer shrink-0"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Sidebar Body */}
        {isOpen ? (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
            {/* Create New Month Button */}
            <div className="p-3 bg-white border-b border-slate-200 shrink-0">
              <button
                onClick={handleOpenCreate}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>+ បង្កើត / រក្សាទុកខែថ្មី</span>
              </button>
            </div>

            {/* List of Saved Months */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                ខែដែលបានរក្សាទុក (Saved Months):
              </div>

              {months.map((m) => {
                const isActive = m.id === activeMonthId;
                const total = calculateDistrictTotal(m.communes);

                return (
                  <div
                    key={m.id}
                    className={`relative rounded-xl p-3 border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                    onClick={() => onSelectMonth(m.id)}
                  >
                    {/* Top Row: Month Name & Active Badge */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className={`text-xs md:text-sm font-bold font-moul truncate ${
                              isActive ? 'text-blue-900' : 'text-slate-800'
                            }`}
                          >
                            {m.monthName}
                          </h4>
                          {isActive && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                              <Check className="w-2.5 h-2.5" /> កំពុងប្រើ
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{m.reportDateKh}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats summary */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="text-slate-500">
                        បញ្ជី២០២៦៖{' '}
                        <span className="font-bold text-slate-800">
                          {formatKhmerNumber(total.list2026Total)}
                        </span>
                      </div>
                      <div className="text-blue-700 font-semibold">
                        បក្ស CPP៖{' '}
                        <span className="font-bold">
                          {formatKhmerNumber(total.list2026Cpp)}
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-2 pt-1.5 flex items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center gap-1">
                        {m.spreadsheetId && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                            title="បានភ្ជាប់ Google Sheet"
                          >
                            <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-600" />
                            Sheet
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onDuplicateMonth(m.id)}
                          title="ចម្លងទិន្នន័យខែនេះទៅខែថ្មី (Duplicate)"
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {months.length > 1 && (
                          <button
                            onClick={() => onDeleteMonth(m.id)}
                            title="លុបខែនេះ (Delete Month)"
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar Bottom Tip */}
            <div className="p-3 bg-slate-100/80 border-t border-slate-200 text-[11px] text-slate-500 shrink-0">
              <div className="flex items-center gap-1 text-slate-700 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>រក្សាទុកស្វ័យប្រវត្តិតាមខែ</span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500 leading-normal">
                រាល់ការផ្លាស់ប្តូរ និងការបញ្ចូលទិន្នន័យត្រូវបានរក្សាទុកដាច់ដោយឡែកក្នុងខែនីមួយៗ។
              </p>
            </div>
          </div>
        ) : (
          /* Collapsed Mini Rail */
          <div className="flex-1 flex flex-col items-center py-4 space-y-4 bg-slate-50">
            <button
              onClick={handleOpenCreate}
              title="បង្កើតខែថ្មី"
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>

            <div className="w-8 border-b border-slate-200" />

            <div className="flex flex-col items-center space-y-2">
              {months.map((m) => {
                const isActive = m.id === activeMonthId;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectMonth(m.id)}
                    title={`${m.monthName} (${m.reportDateKh})`}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs scale-105'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {m.monthName.slice(2, 5) || 'ខែ'}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* Modal: Create / Save New Month */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-moul tracking-wide text-amber-300">
                    បង្កើត / រក្សាទុកខែថ្មី
                  </h3>
                  <div className="text-xs text-slate-300">
                    ស្រុកជើងព្រៃ • បញ្ជីរបាយការណ៍ប្រចាំខែ
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ឈ្មោះខែ (Month Name):
                </label>
                <input
                  type="text"
                  required
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                  placeholder="ឧ. ខែវិច្ឆិកា ឆ្នាំ២០២៦"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* Suggestions */}
              <div>
                <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                  ជ្រើសរើសឈ្មោះគំរូរហ័ស (Quick Suggestions):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {monthSuggestions.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setNewMonthName(s.name);
                        setNewReportDate(s.date);
                      }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  កាលបរិច្ឆេទរបាយការណ៍ (Report Date Label):
                </label>
                <input
                  type="text"
                  required
                  value={newReportDate}
                  onChange={(e) => setNewReportDate(e.target.value)}
                  placeholder="ឧ. ប្រចាំថ្ងៃទី ៧ ខែ វិច្ឆិកា ឆ្នាំ ២០២៦"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* Copy option */}
              <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={copyCurrent}
                    onChange={(e) => setCopyCurrent(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-blue-900 block">
                      ចម្លងទិន្នន័យខែបច្ចុប្បន្នជាគោល (Base on Current Month)
                    </span>
                    <span className="text-[11px] text-blue-700 block mt-0.5 leading-relaxed">
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
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  យល់ព្រមបង្កើត
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
