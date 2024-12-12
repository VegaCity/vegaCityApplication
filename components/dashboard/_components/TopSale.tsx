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

interface TopSaleProps {
  params: {
    dateRange?: DateRange | undefined;
  };
}

export function TopSale({ params }: TopSaleProps) {
  const selectedDate: DateRange | undefined = params.dateRange;
  const [valueTrigger, setValueTrigger] = useState<string>("");

  const handleTriggerValue = (value: string) => {
    setValueTrigger(value);
  };

  return (
    <div>
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
