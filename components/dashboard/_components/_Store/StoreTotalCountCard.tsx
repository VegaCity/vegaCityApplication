//Total Count for Admin | Cashier Web | Stores

import DashboardCard from "@/components/dashboard/DashboardCard";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";
import {
  AnalyticsPostProps,
  GroupedStaticsStoreByMonth,
} from "@/types/analytics";
import { CreditCardIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { AxiosError } from "axios";
import EmptyDataPage from "@/components/emptyData/emptyData";

// Utility function to group data by month
const groupDataByMonth = (data: GroupedStaticsStoreByMonth[]) => {
  const grouped: Record<string, GroupedStaticsStoreByMonth> = {};
  data.forEach((item) => {
    grouped[item.name] = item;
  });
  return grouped;
};

// Utility function to calculate totals
const calculateTotals = (data: GroupedStaticsStoreByMonth) => {
  return {
    totalOrder: data.totalOrder,
    totalOrderCash: data.totalOrderCash,
    totalOrderVcard: data.totalOrderVcard,
    totalOrderOnlineMethods: data.totalOrderOnlineMethods,
  };
};

interface TotalCountCardProps {
  params: {
    dateRange?: DateRange | undefined;
  };
}

//Format Title like totalCashOrder -> Total Cash Order
const formatTitle = (str: string) => {
  return str
    .replace(/([A-Z])/g, " $1") // Add space before uppercase letters
    .replace(/^./, (char: string) => char.toUpperCase()); // Capitalize the first letter
};

// Format number for display with Vietnamese currency
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} K`;
  }
  return String(num);
};

export default function StoreTotalCountCard({ params }: TotalCountCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [storeTotals, setStoreTotals] = useState<GroupedStaticsStoreByMonth[]>(
    []
  );
  const groupedData = groupDataByMonth(storeTotals);
  const { dateRange: selectedDate } = params;

  useEffect(() => {
    if (!selectedDate || !selectedDate.from || !selectedDate.to) return;
    // setIsLoading(true);
    // fetch data from API

    const chartBodyDataByDateByMonth: AnalyticsPostProps = {
      startDate: format(selectedDate.from, "yyyy-MM-dd"),
      endDate: format(selectedDate.to, "yyyy-MM-dd"),
      saleType: "Product",
      groupBy: "Month",
    };

    // console.log(topSaleBodyData, "topSaleBodyData");
    const fetchTotalCountData = async () => {
      try {
        const totalCountData = await AnalyticsServices.getDashboardAnalytics(
          chartBodyDataByDateByMonth
        );
        const resTotalCount = Array.isArray(
          totalCountData.data.data.groupedStaticsAdmin
        )
          ? totalCountData.data.data.groupedStaticsAdmin
          : [];
        console.log(resTotalCount, "totalCount");
        setStoreTotals(resTotalCount);
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
    fetchTotalCountData();
  }, [selectedDate]);

  if (error) return <EmptyDataPage title={error} />;

  return (
    <>
      <div className="flex flex-row md:flex-row gap-5 mb-5 w-full">
        {/* <div className="flex flex-col gap-5">hello</div> */}
        {Object.entries(groupedData).map(
          ([month, monthData]) =>
            month === "Nov" && (
              <div className="w-full" key={month}>
                {/* <h2 className="text-xl font-bold mb-4">{month} Summary</h2> */}
                <div className="flex flex-col md:flex-row justify-between gap-5 my-4">
                  {Object.entries(calculateTotals(monthData)).map(
                    ([key, value]) => (
                      <DashboardCard
                        title={formatTitle(key)}
                        count={formatNumber(value)}
                        icon={
                          <CreditCardIcon
                            className="text-slate-500"
                            size={50}
                          />
                        }
                      />
                    )
                  )}
                </div>
              </div>
            )
        )}
      </div>
    </>
  );
}
