"use client";

import { TrendingUp, TrendingDown, FolderArchive } from "lucide-react";
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
  totalAmountCustomerMoneyTransfer: {
    label: "Total Customer Money Transfer",
    color: "hsl(var(--chart-1))",
  },
  totalAmountCustomerMoneyWithdraw: {
    label: "Total Customer Money Withdraw",
    color: "hsl(var(--chart-2))",
  },
  vegaDepositsAmountFromStore: {
    label: "Vega Deposits Amount From Store",
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

export function AdminChartByMonth({ params }: ChartByMonthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [chartAdminAmountOrder, setChartAdminAmountOrder] = useState<
    GroupedStaticsAdminByMonth[]
  >([]);
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>(
    "totalAmountCustomerMoneyTransfer"
  );
  const { endDate, startDate, saleType } = params;

  const chartAmountOrderData = (data: GroupedStaticsAdminByMonth[]) => {
    return data.map((dateMap) => {
      // Parse the abbreviated month and format it to full month name
      const fullMonthName = format(
        parse(dateMap.name, "MMM", new Date()),
        "MMMM"
      );
      return {
        name: fullMonthName, // "November", "December"
        formattedDate: dateMap.formattedDate, // "Nov", "Dec"
        totalAmountCustomerMoneyTransfer:
          dateMap.totalAmountCustomerMoneyTransfer,
        totalAmountCustomerMoneyWithdraw:
          dateMap.totalAmountCustomerMoneyWithdraw,
        vegaDepositsAmountFromStore: dateMap.vegaDepositsAmountFromStore,
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
      const percentChange = previous.totalAmountCustomerMoneyTransfer
        ? ((current.totalAmountCustomerMoneyTransfer -
            previous.totalAmountCustomerMoneyTransfer) /
            previous.totalAmountCustomerMoneyTransfer) *
          100
        : 0; // Handle division by zero
      const percentChangeWithdraw = previous.totalAmountCustomerMoneyWithdraw
        ? ((current.totalAmountCustomerMoneyWithdraw -
            previous.totalAmountCustomerMoneyWithdraw) /
            previous.totalAmountCustomerMoneyWithdraw) *
          100
        : 0; // Handle division by zero
      return {
        month: current.name,
        percentChange: percentChange.toFixed(2), // Limit to 2 decimal places
        percentChangeWithdraw: percentChangeWithdraw.toFixed(2),
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
        saleType: saleType ?? "All",
        groupBy: "Month",
      };

      console.log(chartBodyData, "chartBodyData");

      try {
        const dashboardData = await AnalyticsServices.getDashboardAnalytics(
          chartBodyData
        );
        const resDashboardData = dashboardData.data.data;
        const resChartAdminAmountOrder = Array.isArray(
          resDashboardData.groupedStaticsAdmin
        )
          ? resDashboardData.groupedStaticsAdmin
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

  // if (isLoading) return <Loader isLoading={isLoading} />;
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
          {groupedData && groupedData.length > 0 ? (
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
                dataKey="vegaDepositsAmountFromStore"
                type="natural"
                fill="var(--color-vegaDepositsAmountFromStore)"
                fillOpacity={0.4}
                stroke="var(--color-vegaDepositsAmountFromStore)"
                stackId="a"
              />
              <Area
                dataKey="totalAmountCustomerMoneyTransfer"
                type="natural"
                fill="var(--color-totalAmountCustomerMoneyTransfer)"
                fillOpacity={0.4}
                stroke="var(--color-totalAmountCustomerMoneyTransfer)"
                stackId="a"
              />
              <Area
                dataKey="totalAmountCustomerMoneyWithdraw"
                type="natural"
                fill="var(--color-totalAmountCustomerMoneyWithdraw)"
                fillOpacity={0.4}
                stroke="var(--color-totalAmountCustomerMoneyWithdraw)"
                stackId="a"
              />
            </AreaChart>
          ) : (
            <div className="w-full h-full flex flex-row items-center justify-center bg-muted/50">
              <p className="text-3xl text-blue-300 font-bold flex flex-row gap-4 items-center justify-center">
                Empty Data <FolderArchive />{" "}
              </p>
            </div>
          )}
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
                    {trend?.month}: {trend?.percentChangeWithdraw}%{" "}
                    <span>
                      {trend?.percentChangeWithdraw &&
                      Number(trend?.percentChangeWithdraw) > 0 ? (
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
