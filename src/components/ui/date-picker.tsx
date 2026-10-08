import * as React from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  formatReportDateKh,
  parseReportDateKh,
} from '../../utils/khmerDate';

export interface DatePickerProps {
  /** Current date value as Khmer formatted string or ISO */
  value?: string;
  /** Direct Date object value if preferred */
  selectedDate?: Date;
  /** Callback triggered when a new date is selected */
  onChange?: (formattedKh: string, date: Date) => void;
  /** Optional placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom button class name */
  className?: string;
  /** Tooltip / title attribute */
  title?: string;
}

export function DatePicker({
  value,
  selectedDate: propSelectedDate,
  onChange,
  placeholder = 'ជ្រើសរើសកាលបរិច្ឆេទ (Select date)',
  disabled = false,
  className,
  title = 'កាលបរិច្ឆេទរបាយការណ៍ - ចុចដើម្បីជ្រើសរើសពីប្រតិទិន',
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Derive active date from prop or string value
  const parsedDate = React.useMemo(() => {
    if (propSelectedDate) return propSelectedDate;
    if (value) return parseReportDateKh(value);
    return undefined;
  }, [propSelectedDate, value]);

  const [date, setDate] = React.useState<Date | undefined>(parsedDate);

  // Keep internal date in sync with external value
  React.useEffect(() => {
    setDate(parsedDate);
  }, [parsedDate]);

  const handleSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    setDate(newDate);
    const khmerString = formatReportDateKh(newDate);
    if (onChange) {
      onChange(khmerString, newDate);
    }
    setOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    handleSelect(today);
  };

  const handleSelectYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    handleSelect(yesterday);
  };

  const displayText = value || (date ? formatReportDateKh(date) : '');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          title={title}
          className={cn(
            'w-80 sm:w-96 md:w-[420px] max-w-full justify-between text-left font-normal',
            'bg-white hover:bg-blue-50/30 focus:bg-white',
            'border-slate-300 hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100',
            'rounded-lg px-3 py-1.5 h-auto text-xs sm:text-sm text-slate-800 shadow-2xs transition-all',
            !displayText && 'text-slate-400 font-normal',
            open && 'border-blue-600 ring-2 ring-blue-100',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{displayText || placeholder}</span>
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
              open && 'rotate-180 text-blue-600'
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto p-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden font-kantumruy"
      >
        <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2 text-xs">
          <span className="font-normal text-slate-700 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>ជ្រើសកាលបរិច្ឆេទ</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSelectToday}
              className="px-2 py-0.5 rounded text-[11px] font-normal bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
            >
              ថ្ងៃនេះ
            </button>
            <button
              type="button"
              onClick={handleSelectYesterday}
              className="px-2 py-0.5 rounded text-[11px] font-normal bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ម្សិលមិញ
            </button>
          </div>
        </div>

        <div className="p-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            defaultMonth={date || new Date()}
          />
        </div>

        {displayText && (
          <div className="px-3 py-2 bg-blue-50/50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="text-slate-500">បានជ្រើសរើស៖</span>
            <span className="font-normal text-blue-700 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              {displayText}
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
