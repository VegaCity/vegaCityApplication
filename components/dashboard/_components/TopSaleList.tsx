"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SaleStore from "@/components/dashboard/_components/SaleStore";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { Loader } from "@/components/loader/Loader";
import { AxiosError } from "axios";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";
import { TopSaleStores, TopSaleStoresPost } from "@/types/analytics";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface TopSaleListProps {
  params: {
    tabsValue: string;
    dateRange?: DateRange | undefined;
  };
}

export const TopSaleList = React.memo(function TopSaleList({
  params,
}: TopSaleListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [topSaleList, setTopSaleList] = useState<TopSaleStores[] | null>([]);
  const tabsValue: string = params.tabsValue;
  const dateRange: DateRange | undefined = params.dateRange;

  //Body Params
  // let topSaleBodyData: TopSaleStoresPost = {
  //   startDate: "2024-07-01",
  //   endDate: "2025-03-03",
  //   storeType: tabsValue || "All",
  //   groupBy: "Month",
  // };

  // format(dateRange.from, "yyyy-MM-dd"),
  // format(dateRange.from, "yyyy-MM-dd")
  useEffect(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) return;
    // setIsLoading(true);
    // fetch data from API

    const topSaleBodyData: TopSaleStoresPost = {
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
      storeType: tabsValue || "All",
      groupBy: "Month",
    };

    // console.log(topSaleBodyData, "topSaleBodyData");
    const fetchTopSaleData = async () => {
      try {
        const topSaleData = await AnalyticsServices.getTopSaleStoreInMonth(
          topSaleBodyData
        );
        const resTopSale = Array.isArray(topSaleData.data.data.topStores)
          ? topSaleData.data.data.topStores
          : [];
        console.log(resTopSale, "topSale");
        setTopSaleList(resTopSale);
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(
            error.response?.data.messageResponse || error.response?.data.Error
          );
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopSaleData();
  }, [tabsValue, dateRange]);

  // if (isLoading) return <Loader isLoading={isLoading} />;
  if (error) return <EmptyDataPage title={error} />;

  return (
    <div className="mt-4 space-y-8">
      {topSaleList && topSaleList.length > 0 ? (
        topSaleList.map((topStores) =>
          topStores.topStores.map((topStore) => (
            <SaleStore
              key={topStore.storeId}
              maxValueSale={topStore.totalAmount}
              storeEmail={topStore.storeEmail}
              storeName={topStore.storeName}
            />
          ))
        )
      ) : (
        <div>
          <EmptyDataPage />
        </div>
      )}
    </div>
  );
});
