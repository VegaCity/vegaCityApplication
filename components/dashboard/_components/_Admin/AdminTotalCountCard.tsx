//Total Count for Admin | Cashier Web | Stores

import DashboardCard from "@/components/dashboard/DashboardCard";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";
import {
  AnalyticsPostProps,
  GroupedStaticsAdminByMonth,
} from "@/types/analytics";
import { CreditCardIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { AxiosError } from "axios";
import EmptyDataPage from "@/components/emptyData/emptyData";

// Utility function to group data by month
const groupDataByMonth = (data: GroupedStaticsAdminByMonth[]) => {
  const grouped: Record<string, GroupedStaticsAdminByMonth> = {};
  data.forEach((item) => {
    grouped[item.name] = item;
  });
  return grouped;
};

// Utility function to calculate totals
const calculateTotals = (data: GroupedStaticsAdminByMonth) => {
  return {
    totalOrder: data.totalOrder,
    totalOrderCash: data.totalOrderCash,
    totalOrderFeeCharge: data.totalOrderFeeCharge,
    totalOrderOnlineMethods: data.totalOrderOnlineMethods,
  };
};

interface TotalCountCardProps {
  params: {
    // dateRange?: DateRange | undefined;
    startDate?: Date | null;
    endDate?: Date | null;
    saleType: string;
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

export default function AdminTotalCountCard({ params }: TotalCountCardProps) {
  const { endDate, saleType, startDate } = params;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [adminTotals, setAdminTotals] = useState<GroupedStaticsAdminByMonth[]>(
    []
  );
  const groupedData = groupDataByMonth(adminTotals);

  useEffect(() => {
    if (!startDate || !endDate) return;
    // setIsLoading(true);
    // fetch data from API

    const chartBodyDataByDateByMonth: AnalyticsPostProps = {
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      saleType: saleType ?? "All",
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
        setAdminTotals(resTotalCount);
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
  }, [endDate, saleType]);

  if (error) return <EmptyDataPage title={error} />;

  return (
    <>
      <div className="flex flex-row gap-5 mb-5 w-full">
        {Object.entries(groupedData).map(
          ([month, monthData]) =>
            month === "Nov" && (
              <div className="w-full" key={month}>
                <h2 className="text-xl font-bold mb-4">{month} Summary</h2>
                <div className="flex flex-col md:flex-row justify-between gap-5 mb-5">
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
