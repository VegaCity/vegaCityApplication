"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { useEffect, useState, useMemo } from "react";
import { Loader } from "@/components/loader/Loader";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";
import {
  AdminAnalyticsByMonth,
  AnalyticsPostProps,
  GroupedStaticsAdminByMonth,
} from "@/types/analytics";
import { DateRange } from "react-day-picker";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { AxiosError } from "axios";
import { format, parse } from "date-fns";
import { useAuthUser } from "@/components/hooks/useAuthUser";

const chartConfig = {
  totalAmountWithdrawFromVega: {
    label: "Total Amount Withdraw From Vega",
    color: "hsl(var(--chart-1))",
  },
  totalWithdrawAmoutFromCustomer: {
    label: "Total Withdraw Amount From Customer",
    color: "hsl(var(--chart-2))",
  },
  totalWithdrawAmountFromStoreOwner: {
    label: "Total Withdraw Amount From Store Owner",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

interface ChartByMonthProps {
  params: {
    startDate: Date | null;
    endDate: Date | null;
    saleType: string;
  };
}

export function CashierChartByMonth({ params }: ChartByMonthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [chartAdminAmountOrder, setChartAdminAmountOrder] = useState<
    GroupedStaticsAdminByMonth[]
  >([]);
  const { endDate, startDate, saleType } = params;
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>(
    "totalAmountWithdrawFromVega"
  );

  const chartAmountOrderData = (data: GroupedStaticsAdminByMonth[]) => {
    if (!data || !Array.isArray(data)) {
      console.log("chartAmountOrderData received invalid data:", data);
      return [];
    }
    return data?.map((dateMap) => {
      // Parse the abbreviated month and format it to full month name
      const fullMonthName = format(
        parse(dateMap.name, "MMM", new Date()),
        "MMMM"
      );
      return {
        name: fullMonthName, // "November", "December"
        formattedDate: dateMap.formattedDate, // "Nov", "Dec"
        totalAmountWithdrawFromVega: dateMap.totalAmountWithdrawFromVega,
        totalWithdrawAmoutFromCustomer:
          dateMap.totalWithdrawAmoutFromCustomer,
        totalWithdrawAmountFromStoreOwner:
          dateMap.totalWithdrawAmountFromStoreOwner,
      };
    });
  };

  const groupedData = chartAmountOrderData(chartAdminAmountOrder);

  console.log(groupedData, "groupedData");

  const calculateMonthlyTrends = (data: typeof groupedData) => {
    if (data.length < 2) return []; // Not enough data to calculate trends

    const trends = data.map((current, index) => {
      if (index === 0) return null; // Skip the first month
      const previous = data[index - 1];
      const percentChange = previous.totalAmountWithdrawFromVega
        ? ((current.totalAmountWithdrawFromVega -
            previous.totalAmountWithdrawFromVega) /
            previous.totalAmountWithdrawFromVega) *
          100
        : 0; // Handle division by zero
      const percentChangeWithdrawCustomer =
        previous.totalWithdrawAmoutFromCustomer
          ? ((current.totalWithdrawAmoutFromCustomer -
              previous.totalWithdrawAmoutFromCustomer) /
              previous.totalWithdrawAmoutFromCustomer) *
            100
          : 0; // Handle division by zero
      const percentChangeWithdrawStore =
        previous.totalWithdrawAmountFromStoreOwner
          ? ((current.totalWithdrawAmountFromStoreOwner -
              previous.totalWithdrawAmountFromStoreOwner) /
              previous.totalWithdrawAmountFromStoreOwner) *
            100
          : 0; // Handle division by zero
      return {
        month: current.name,
        percentChange: percentChange.toFixed(2), // Limit to 2 decimal places
        percentChangeWithdrawCustomer: percentChangeWithdrawCustomer.toFixed(2),
        percentChangeWithdrawStore: percentChangeWithdrawStore.toFixed(2),
      };
    });

    return trends.filter(Boolean); // Remove null values
  };

  // Example usage:
  const monthlyTrends = calculateMonthlyTrends(groupedData);
  console.log(monthlyTrends);

  useEffect(() => {
    setIsLoading(true);
    //get api
    const fetchDashboardData = async () => {
      if (!startDate || !endDate) return;

      const chartBodyData: AnalyticsPostProps = {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        saleType: saleType ?? "Package",
        groupBy: "Month",
      };

      console.log(chartBodyData, "chartBodyData");

      try {
        const dashboardData = await AnalyticsServices.getDashboardAnalytics(
          chartBodyData
        );
        const resDashboardData = dashboardData.data.data;
        const resChartAdminAmountOrder = Array.isArray(
          dashboardData.data.data.groupedStaticsAdmin
        )
          ? dashboardData.data.data.groupedStaticsAdmin
          : [];
        console.log(resChartAdminAmountOrder, "resChartAdminAmountOrder");
        setChartAdminAmountOrder(resChartAdminAmountOrder);
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

    fetchDashboardData();
  }, [endDate, saleType]);

  // if (!chartAdminAmountOrder) return <Loader />;
  if (error) return <EmptyDataPage title={error} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart - Stacked</CardTitle>
        <CardDescription>
          Showing total amount for the last 8 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[310px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={groupedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="totalAmountWithdrawFromVega"
              type="natural"
              fill="var(--color-totalAmountWithdrawFromVega)"
              fillOpacity={0.4}
              stroke="var(--color-totalAmountWithdrawFromVega)"
              stackId="a"
            />
            <Area
              dataKey="totalWithdrawAmoutFromCustomer"
              type="natural"
              fill="var(--color-totalWithdrawAmoutFromCustomer)"
              fillOpacity={0.4}
              stroke="var(--color-totalWithdrawAmoutFromCustomer)"
              stackId="a"
            />
            <Area
              dataKey="totalWithdrawAmountFromStoreOwner"
              type="natural"
              fill="var(--color-totalWithdrawAmountFromStoreOwner)"
              fillOpacity={0.4}
              stroke="var(--color-totalWithdrawAmountFromStoreOwner)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {monthlyTrends.map((trend) => (
                <div key={trend?.month} className="text-sm flex flex-row gap-2">
                  Trending Customer Transfer this &nbsp;
                  {trend?.month}: {trend?.percentChange}%{" "}
                  <span>
                    {trend?.percentChange &&
                    Number(trend?.percentChange) > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}{" "}
                  </span>
                  |
                  <span className="flex flex-row gap-2">
                    Trending Customer Withdraw this &nbsp;
                    {trend?.month}: {trend?.percentChangeWithdrawCustomer}%{" "}
                    <span>
                      {trend?.percentChangeWithdrawCustomer &&
                      Number(trend?.percentChangeWithdrawCustomer) > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </span>
                  </span>
                  |
                  <span className="flex flex-row gap-2">
                    Trending Store Withdraw this &nbsp;
                    {trend?.month}: {trend?.percentChangeWithdrawStore}%{" "}
                    <span>
                      {trend?.percentChangeWithdrawStore &&
                      Number(trend?.percentChangeWithdrawStore) > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {startDate && endDate && format(startDate, "MMMM")} -{" "}
              {startDate && endDate && format(endDate, "MMMM")}{" "}
              {startDate && endDate && format(endDate, "yyyy")}{" "}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
