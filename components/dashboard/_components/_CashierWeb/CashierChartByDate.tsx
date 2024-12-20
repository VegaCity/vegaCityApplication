"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { FolderArchive } from "lucide-react";

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
} from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import { Loader } from "@/components/loader/Loader";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";
import {
  CashierAnalyticsByDate,
  AnalyticsPostProps,
  GroupedStaticsAdminByDate,
} from "@/types/analytics";
import { DateRange } from "react-day-picker";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { useAuthUser } from "@/components/hooks/useAuthUser";

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];

const chartConfig = {
  totalAmountOrderFeeCharge: {
    label: "Total Fee Charge Order",
    color: "hsl(var(--chart-1))",
  },
  endDayCheckWalletCashierBalance: {
    label: "End Day Cashier Balance",
    color: "hsl(var(--chart-2))",
  },
  endDayCheckWalletCashierBalanceHistory: {
    label: "End Day Cashier Balance History",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

interface ChartByDateProps {
  params: {
    startDate: Date | null;
    endDate: Date | null;
    saleType: string;
  };
}

export function CashierChartByDate({ params }: ChartByDateProps) {
  const user = useAuthUser();
  const roleName = user.roleName;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const { endDate, saleType, startDate } = params;

  const [dashboardData, setDashboardData] =
    useState<CashierAnalyticsByDate | null>(null);
  const [chartCashierAmountOrder, setChartCashierAmountOrder] = useState<
    GroupedStaticsAdminByDate[]
  >([]);
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>(
    "totalAmountOrderFeeCharge"
  );

  const total = useMemo(
    () => ({
      totalAmountOrderFeeCharge: chartCashierAmountOrder.reduce(
        (acc, curr) => acc + curr.totalAmountOrderFeeCharge,
        0
      ),
      endDayCheckWalletCashierBalance: chartCashierAmountOrder.reduce(
        (acc, curr) => acc + curr.endDayCheckWalletCashierBalance,
        0
      ),
      endDayCheckWalletCashierBalanceHistory: chartCashierAmountOrder.reduce(
        (acc, curr) => acc + curr.endDayCheckWalletCashierBalanceHistory,
        0
      ),
    }),
    [chartCashierAmountOrder]
  );

  useEffect(() => {
    setIsLoading(true);
    //get api
    const fetchDashboardData = async () => {
      if (!startDate || !endDate) return;

      const chartBodyData: AnalyticsPostProps = {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        saleType: saleType ?? "Package",
        groupBy: "Date",
      };

      console.log(chartBodyData, "chartBodyData");

      try {
        const dashboardData = await AnalyticsServices.getDashboardAnalytics(
          chartBodyData
        );
        const resDashboardData = dashboardData.data.data;
        const resChartCashierAmountOrder = Array.isArray(
          dashboardData.data.data.groupedStaticsAdmin
        )
          ? dashboardData.data.data.groupedStaticsAdmin
          : [];
        console.log(resChartCashierAmountOrder, "resChartCashierAmountOrder");
        setChartCashierAmountOrder(resChartCashierAmountOrder);
        setDashboardData(resDashboardData);
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

  const chartAmountOrderData = (data: GroupedStaticsAdminByDate[]) => {
    return data.map((dateMap) => ({
      date: dateMap.date?.split("T", 1)[0], // Extract the date portion only
      totalAmountOrderFeeCharge: dateMap.totalAmountOrderFeeCharge,
      endDayCheckWalletCashierBalance: dateMap.endDayCheckWalletCashierBalance,
      endDayCheckWalletCashierBalanceHistory:
        dateMap.endDayCheckWalletCashierBalanceHistory,
    }));
  };
  console.log(
    chartAmountOrderData(chartCashierAmountOrder),
    "chartAmountOrderData"
  );

  // if (isLoading) return <Loader isLoading={isLoading} />;
  if (error) return <EmptyDataPage title={error} />;

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row md:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total amount for recent months!
          </CardDescription>
        </div>
        <div className="flex flex-col xl:flex-row">
          {[
            "totalAmountOrderFeeCharge",
            "endDayCheckWalletCashierBalance",
            "endDayCheckWalletCashierBalanceHistory",
          ].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-base font-bold leading-none sm:text-xl max-w-20">
                  {total[key as keyof typeof total].toLocaleString()}{" "}
                  <span className="text-sm text-slate-500 font-semibold">
                    VND
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          {chartCashierAmountOrder && chartCashierAmountOrder.length > 0 ? (
            <BarChart
              accessibilityLayer
              data={chartAmountOrderData(chartCashierAmountOrder)}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-full space-x-2"
                    nameKey="totalAmountOrderFeeCharge"
                    labelFormatter={(value: number) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey={activeChart}
                fill={`var(--color-${activeChart})`}
                radius={4}
              />
            </BarChart>
          ) : (
            <div className="w-full h-full flex flex-row items-center justify-center bg-muted/50">
              <p className="text-3xl text-blue-300 font-bold flex flex-row gap-4 items-center justify-center">
                Empty Data <FolderArchive />{" "}
              </p>
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
