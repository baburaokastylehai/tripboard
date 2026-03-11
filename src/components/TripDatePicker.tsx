import { useState, useRef } from 'react';
import { format, parse, isValid, isBefore, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TripDatePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const TripDatePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }: TripDatePickerProps) => {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const parsedStart = startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : undefined;
  const parsedEnd = endDate ? parse(endDate, 'yyyy-MM-dd', new Date()) : undefined;

  const validStart = parsedStart && isValid(parsedStart) ? parsedStart : undefined;
  const validEnd = parsedEnd && isValid(parsedEnd) ? parsedEnd : undefined;

  const handleStartSelect = (date: Date | undefined) => {
    if (date) {
      onStartDateChange(format(date, 'yyyy-MM-dd'));
      setStartOpen(false);
      // Auto-open end date picker after selecting start
      setTimeout(() => setEndOpen(true), 200);
    }
  };

  const handleEndSelect = (date: Date | undefined) => {
    if (date) {
      onEndDateChange(format(date, 'yyyy-MM-dd'));
      setEndOpen(false);
    }
  };

  const boxStyle = "flex items-center px-4 py-[14px] rounded-xl font-body text-[14px] outline-none cursor-pointer transition-colors border-[1.5px] border-input bg-card min-w-0 flex-1 hover:border-accent";

  return (
    <div>
      <div className="font-body text-[13px] mt-1 mb-3 text-muted-foreground">when?</div>
      <div className="flex items-center">
        {/* Start date */}
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={boxStyle}>
              <span className={validStart ? 'text-foreground' : 'text-muted-foreground'}>
                {validStart ? format(validStart, 'MMM d, yyyy') : 'start'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={validStart}
              onSelect={handleStartSelect}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Separator */}
        <span className="font-body text-[13px] text-muted-foreground mx-3 shrink-0">to</span>

        {/* End date */}
        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={boxStyle}>
              <span className={validEnd ? 'text-foreground' : 'text-muted-foreground'}>
                {validEnd ? format(validEnd, 'MMM d, yyyy') : 'end'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={validEnd}
              onSelect={handleEndSelect}
              disabled={validStart ? (date) => isBefore(startOfDay(date), startOfDay(validStart)) : undefined}
              defaultMonth={validStart || undefined}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TripDatePicker;
