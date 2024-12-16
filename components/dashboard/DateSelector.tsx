import React, { useReducer, useState } from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { SelectSingleEventHandler } from "react-day-picker";

interface DateSelectorProps {
  onDateChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
}

const calendarReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_START_DATE":
      return { ...state, startDate: action.payload, endDate: null };
    case "SET_END_DATE":
      return { ...state, endDate: action.payload };
    default:
      return state;
  }
};

export const DateSelector: React.FC<DateSelectorProps> = ({ onDateChange }) => {
  //   const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 6, 1));
  //   const [endDate, setEndDate] = useState<Date | null>(
  //     addDays(new Date(2025, 2, 2), 1)
  //   );
  const [{ startDate, endDate }, dispatch] = useReducer(calendarReducer, {
    startDate: new Date(2024, 6, 1),
    endDate: addDays(new Date(2025, 2, 2), 1),
  });

  //   const handleDateSelect: SelectSingleEventHandler = (date) => {
  //     if (!date) return;
  //     if (!startDate || (startDate && endDate)) {
  //       // If no start date or both dates are selected, reset with the new start date
  //       setStartDate(date);
  //       setEndDate(null);
  //       onDateChange({ startDate: date, endDate: null }); // Notify parent
  //     } else if (startDate && !endDate) {
  //       // If start date exists but no end date, assign the end date
  //       const newEndDate = date > startDate ? date : startDate; // Ensure startDate is earlier
  //       const newStartDate = date > startDate ? startDate : date;

  //       setStartDate(newStartDate);
  //       setEndDate(newEndDate);
  //       onDateChange({ startDate: newStartDate, endDate: newEndDate }); // Notify parent
  //     }
  //   };

  const handleDateSelect: SelectSingleEventHandler = (day) => {
    if (!day) return;

    if (!startDate || (startDate && endDate)) {
      dispatch({ type: "SET_START_DATE", payload: day });
      onDateChange({ startDate: day, endDate: null });
    } else if (startDate && !endDate) {
      const newEndDate = day > startDate ? day : startDate;
      const newStartDate = day > startDate ? startDate : day;

      dispatch({ type: "SET_START_DATE", payload: newStartDate });
      dispatch({ type: "SET_END_DATE", payload: newEndDate });
      onDateChange({ startDate: newStartDate, endDate: newEndDate });
    }
  };

  return (
    <div className="col-span-12 lg:col-span-4">
      {/* Calendar Section */}
      <div className="flex flex-row w-full items-center justify-end">
        <div className="mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {startDate ? (
                  endDate ? (
                    <>
                      {format(startDate, "LLL dd, y")} -{" "}
                      {format(endDate, "LLL dd, y")}
                    </>
                  ) : (
                    `Start: ${format(startDate, "LLL dd, y")} (Select end date)`
                  )
                ) : (
                  <span>Pick a start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="single" // Single date selection
                selected={endDate || startDate || undefined} // Highlight either start or end date
                onSelect={handleDateSelect} // Handle both start and end selection
                defaultMonth={startDate || new Date()}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
