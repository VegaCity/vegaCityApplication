import React from "react";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { vi } from "date-fns/locale";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  className?: string;
}

const DateRangePicker = ({
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerProps) => {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                  {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale: vi })
              )
            ) : (
              <span>Choose Range Date Picker</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            locale={vi}
            footer={
              <div className="flex justify-end gap-2 pt-4 border-t px-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDateRangeChange(undefined)}
                >
                  Xóa
                </Button>
                {dateRange?.from && !dateRange?.to && (
                  <Button
                    size="sm"
                    onClick={() =>
                      onDateRangeChange({
                        from: dateRange.from,
                        to: dateRange.from,
                      })
                    }
                  >
                    Chọn ngày
                  </Button>
                )}
              </div>
            }
          />
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const today = new Date();
                  onDateRangeChange({
                    from: today,
                    to: today,
                  });
                }}
              >
                Hôm nay
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const today = new Date();
                  const yesterday = new Date();
                  yesterday.setDate(today.getDate() - 1);
                  onDateRangeChange({
                    from: yesterday,
                    to: yesterday,
                  });
                }}
              >
                Hôm qua
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const today = new Date();
                  const weekStart = new Date();
                  weekStart.setDate(today.getDate() - 7);
                  onDateRangeChange({
                    from: weekStart,
                    to: today,
                  });
                }}
              >
                7 ngày qua
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const today = new Date();
                  const monthStart = new Date();
                  monthStart.setDate(today.getDate() - 30);
                  onDateRangeChange({
                    from: monthStart,
                    to: today,
                  });
                }}
              >
                30 ngày qua
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
