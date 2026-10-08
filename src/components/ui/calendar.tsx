import * as React from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import 'react-day-picker/style.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-2 font-kantumruy select-none bg-white rounded-lg', className)}
      classNames={{
        root: cn(defaultClassNames.root, 'w-fit'),
        months: 'flex flex-col sm:flex-row gap-3',
        month: 'flex flex-col gap-2',
        month_caption: 'flex justify-center pt-1 relative items-center h-8',
        caption_label: 'text-sm font-normal text-slate-800',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          'absolute left-1 h-7 w-7 bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-md p-0 inline-flex items-center justify-center transition-colors cursor-pointer'
        ),
        button_next: cn(
          'absolute right-1 h-7 w-7 bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-md p-0 inline-flex items-center justify-center transition-colors cursor-pointer'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex mb-1',
        weekday: 'text-slate-400 rounded-md w-9 font-normal text-[0.8rem] text-center',
        week: 'flex w-full mt-1',
        day: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
        day_button: cn(
          'h-9 w-9 p-0 font-normal rounded-lg transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none flex items-center justify-center cursor-pointer',
          'text-slate-700'
        ),
        selected: '!bg-blue-600 !text-white hover:!bg-blue-700 font-normal shadow-xs',
        today: 'border border-blue-400 font-normal text-blue-700',
        outside: 'text-slate-300 opacity-50',
        disabled: 'text-slate-300 opacity-40 cursor-not-allowed',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass, ...chevronProps }) => {
          if (orientation === 'left') {
            return <ChevronLeft className={cn('h-4 w-4', chevronClass)} {...chevronProps} />;
          }
          return <ChevronRight className={cn('h-4 w-4', chevronClass)} {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}
