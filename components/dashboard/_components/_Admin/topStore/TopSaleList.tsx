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
import SaleStore from "@/components/dashboard/_components/_Admin/topStore/SaleStore";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { Loader } from "@/components/loader/Loader";
import { AxiosError } from "axios";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";
import { TopSaleStores, TopSaleStoresPost, TopStore } from "@/types/analytics";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import StoreDialog from "@/components/dashboard/_components/_Admin/topStore/StoreDialog";

interface TopSaleListProps {
  params: {
    tabsValue: string;
    startDate: Date | null;
    endDate: Date | null;
  };
}

export const TopSaleList = React.memo(function TopSaleList({
  params,
}: TopSaleListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [topSaleList, setTopSaleList] = useState<TopSaleStores[]>([]);
  const [selectedStore, setSelectedStore] = useState<TopStore | null>(null);
  // const { endDate, tabsValue, startDate } = params; //fixed to demo
  const { tabsValue } = params;
  const startDate = "2024-07-01";
  const endDate = "2025-03-03";

  // format(dateRange.from, "yyyy-MM-dd"),
  // format(dateRange.from, "yyyy-MM-dd")
  useEffect(() => {
    if (!startDate || !endDate) return;
    // setIsLoading(true);
    // fetch data from API

    // const topSaleBodyData: TopSaleStoresPost = {
    //   startDate: format(startDate, "yyyy-MM-dd"),
    //   endDate: format(endDate, "yyyy-MM-dd"),
    //   storeType: tabsValue || "All",
    //   groupBy: "Month",
    // };

    const topSaleBodyData: TopSaleStoresPost = {
      startDate: startDate,
      endDate: endDate,
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
  }, [tabsValue, endDate]);

  // if (isLoading) return <Loader isLoading={isLoading} />;
  if (error) return <EmptyDataPage title={error} />;

  const sortChartAdminAmountOrder = (topStores: TopStore[]) => {
    // Sort by `totalAmount` and pick the top 5 stores
    return topStores
      .sort((a, b) => b.totalAmount - a.totalAmount) // Descending order
      .slice(0, 5);
  };

  const sortedAndLimitedTopStores = topSaleList
    .flatMap((topStoresGroup) =>
      sortChartAdminAmountOrder(topStoresGroup.topStores)
    )
    .slice(0, 5);

  const handleClickStoreDetail = (data: TopStore) => {
    setSelectedStore(data);
  };

  return (
    <div className="mt-6 space-y-10">
      {sortedAndLimitedTopStores.length > 0 ? (
        sortedAndLimitedTopStores.map((topStore, index) => (
          <>
            <SaleStore
              key={topStore.storeId || `${index}-${topStore.storeName}`} // Use a fallback key if `storeId` is missing
              maxValueSale={topStore.totalAmount}
              storeEmail={topStore.storeEmail}
              storeName={topStore.storeName}
              onClick={() => handleClickStoreDetail(topStore)}
            />
          </>
        ))
      ) : (
        <div>
          <EmptyDataPage />
        </div>
      )}

      {/* Top Store Detail */}
      {selectedStore && (
        <StoreDialog
          isOpen={!!selectedStore} //True value if store exist
          onClose={() => setSelectedStore(null)}
          storeDetails={selectedStore}
        />
      )}
    </div>
  );
});
