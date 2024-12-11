"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SaleStore from "@/components/dashboard/_components/SaleStore";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { TopSaleList } from "@/components/dashboard/_components/TopSaleList";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "hsl(var(--chart-1))",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "hsl(var(--chart-2))",
//   },
// } satisfies ChartConfig;

export function TopSale() {
  const [valueTrigger, setValueTrigger] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
    from: new Date(2024, 6, 1), // Note: Month is 0-based
    to: addDays(new Date(2025, 2, 2), 1),
  });

  const handleTriggerValue = (value: string) => {
    setValueTrigger(value);
  };

  //   console.log("Original Date:", selectedDate);
  //   console.log("Selected Date:", format(selectedDate || "", "yyyy-MM-dd"));
  //   console.log("Selected Month:", format(selectedDate || "", "MMMM"));

  return (
    <div>
      {/* Calendar Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Select a Date</h3>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {selectedDate?.from ? (
                selectedDate.to ? (
                  <>
                    {format(selectedDate.from, "LLL dd, y")} -{" "}
                    {format(selectedDate.to, "LLL dd, y")}
                  </>
                ) : (
                  format(selectedDate.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selectedDate?.from}
              selected={selectedDate}
              onSelect={setSelectedDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        {selectedDate && selectedDate.from && selectedDate.to && (
          <div className="mt-4 text-sm">
            <p>
              <strong>Selected Date:</strong>{" "}
              {format(selectedDate.from, "yyyy-MM-dd")} to{" "}
              {format(selectedDate.to, "yyyy-MM-dd")}
            </p>
            <p>
              <strong>Selected Month:</strong>{" "}
              {format(selectedDate.from, "MMM")} -{" "}
              {format(selectedDate.to, "MMM")}
            </p>
          </div>
        )}
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger onClick={() => handleTriggerValue("All")} value="all">
            All
          </TabsTrigger>
          <TabsTrigger
            onClick={() => handleTriggerValue("Product")}
            className="relative"
            value="product"
          >
            <p>Stores Product</p>
            {/* <Badge className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-[0.6rem] bg-gray-400 text-white rounded-full h-4 w-4 flex items-center justify-center">
              3
            </Badge> */}
          </TabsTrigger>
          <TabsTrigger
            onClick={() => handleTriggerValue("Service")}
            className="relative"
            value="service"
          >
            <p>Stores Service</p>
            {/* <Badge className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-[0.6rem] bg-gray-400 text-white rounded-full h-4 w-4 flex items-center justify-center">
              4
            </Badge> */}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <TopSaleList
            params={{ tabsValue: valueTrigger, dateRange: selectedDate }}
          />
        </TabsContent>
        <TabsContent value="product">
          <TopSaleList
            params={{ tabsValue: valueTrigger, dateRange: selectedDate }}
          />
        </TabsContent>
        <TabsContent value="service">
          <TopSaleList
            params={{ tabsValue: valueTrigger, dateRange: selectedDate }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
