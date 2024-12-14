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
  StoreAnalyticsByMonth,
  AnalyticsPostProps,
  GroupedStaticsStoreByMonth,
} from "@/types/analytics";
import { DateRange } from "react-day-picker";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { AxiosError } from "axios";
import { format, parse } from "date-fns";
import { useAuthUser } from "@/components/hooks/useAuthUser";

const chartConfig = {
  storeDepositsFromVcardPayment: {
    label: "Total Store Received",
    color: "hsl(var(--chart-1))",
  },
  totalAmountOrder: {
    label: "Total Order",
    color: "hsl(var(--chart-2))",
  },
  vegaDepositsAmountFromStore: {
    label: "Total Store Paid",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

interface ChartByMonthProps {
  params: {
    dateRange?: DateRange | undefined;
  };
}

export function StoreChartByMonth({ params }: ChartByMonthProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>("");
  const [chartStoreAmountOrder, setChartStoreAmountOrder] = useState<
    GroupedStaticsStoreByMonth[]
  >([]);
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>(
    "storeDepositsFromVcardPayment"
  );
  const { dateRange: selectedDate } = params;

  const chartAmountOrderData = (data: GroupedStaticsStoreByMonth[]) => {
    return data.map((dateMap) => {
      // Parse the abbreviated month and format it to full month name
      const fullMonthName = format(
        parse(dateMap.name, "MMM", new Date()),
        "MMMM"
      );
      return {
        name: fullMonthName, // "November", "December"
        totalAmountOrder: dateMap.totalAmountOrder,
        storeDepositsFromVcardPayment: dateMap.storeDepositsFromVcardPayment,
        vegaDepositsAmountFromStore: dateMap.vegaDepositsAmountFromStore,
      };
    });
  };

  const groupedData = chartAmountOrderData(chartStoreAmountOrder);

  console.log(groupedData, "groupedData");

  const calculateMonthlyTrends = (data: typeof groupedData) => {
    if (data.length < 2) return []; // Not enough data to calculate trends

    const trends = data.map((current, index) => {
      if (index === 0) return null; // Skip the first month
      const previous = data[index - 1];
      const percentChange = previous.totalAmountOrder
        ? ((current.totalAmountOrder - previous.totalAmountOrder) /
            previous.totalAmountOrder) *
          100
        : 0; // Handle division by zero
      return {
        month: current.name,
        percentChange: percentChange.toFixed(2), // Limit to 2 decimal places
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
      if (!selectedDate || !selectedDate.from || !selectedDate.to) return;

      const chartBodyData: AnalyticsPostProps = {
        startDate: format(selectedDate.from, "yyyy-MM-dd"),
        endDate: format(selectedDate.to, "yyyy-MM-dd"),
        saleType: "Product",
        groupBy: "Month",
      };

      console.log(chartBodyData, "chartBodyData");

      try {
        const dashboardData = await AnalyticsServices.getDashboardAnalytics(
          chartBodyData
        );
        const resDashboardData = dashboardData.data.data;
        const resChartStoreAmountOrder = Array.isArray(
          dashboardData.data.data.groupedStaticsAdmin
        )
          ? dashboardData.data.data.groupedStaticsAdmin
          : [];
        console.log(resChartStoreAmountOrder, "resChartStoreAmountOrder");
        setChartStoreAmountOrder(resChartStoreAmountOrder);
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
  }, [selectedDate]);

  if (isLoading) return <Loader isLoading={isLoading} />;
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
            <Area
              dataKey="totalAmountOrder"
              type="natural"
              fill="var(--color-totalAmountOrder)"
              fillOpacity={0.4}
              stroke="var(--color-totalAmountOrder)"
              stackId="a"
            />
            <Area
              dataKey="storeDepositsFromVcardPayment"
              type="natural"
              fill="var(--color-storeDepositsFromVcardPayment)"
              fillOpacity={0.4}
              stroke="var(--color-storeDepositsFromVcardPayment)"
              stackId="a"
            />
            <Area
              dataKey="vegaDepositsAmountFromStore"
              type="natural"
              fill="var(--color-vegaDepositsAmountFromStore)"
              fillOpacity={0.4}
              stroke="var(--color-vegaDepositsAmountFromStore)"
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
                  Trending up this &nbsp;
                  {trend?.month}: {trend?.percentChange}%{" "}
                  <span>
                    {trend?.percentChange &&
                    Number(trend?.percentChange) > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {selectedDate &&
                selectedDate?.from &&
                selectedDate?.to &&
                format(selectedDate?.from, "MMMM")}{" "}
              -{" "}
              {selectedDate &&
                selectedDate?.from &&
                selectedDate?.to &&
                format(selectedDate?.to, "MMMM")}{" "}
              {selectedDate &&
                selectedDate?.from &&
                selectedDate?.to &&
                format(selectedDate?.to, "yyyy")}{" "}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
