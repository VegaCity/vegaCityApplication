"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
  AdminAnalyticsByDate,
  AnalyticsPostProps,
  GroupedStaticsAdminByDate,
} from "@/types/analytics";
import { DateRange } from "react-day-picker";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import { FolderArchive } from "lucide-react";

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
    label: "Total Amount Order Fee Charge",
    color: "hsl(var(--chart-1))",
  },
  totalAmountOrderFeeChargeCash: {
    label: "Total Amount Order Fee Charge Cash",
    color: "hsl(var(--chart-2))",
  },
  totalAmountOrderFeeChargeVirtualMoney: {
    label: "Total Amount Order Fee Charge Virtual Money",
    color: "hsl(var(--chart-3))",
  },
  totalOrderFeeCharge: {
    label: "Total Order Fee Charge",
    color: "hsl(var(--chart-4))",
  },
  totalOrderFeeChargeCash: {
    label: "Total Order Fee Charge Cash",
    color: "hsl(var(--chart-5))",
  },
  totalOrderFeeChargeVirtualMoney: {
    label: "Total Order Fee Charge Virtual Money",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface ChartByDateProps {
  params: {
    startDate: Date | null;
    endDate: Date | null;
    saleType: string;
  };
}

export function AdminChartByDateOther({ params }: ChartByDateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [dashboardData, setDashboardData] =
    useState<AdminAnalyticsByDate | null>(null);
  const [chartAdminAmountOrder, setChartAdminAmountOrder] = useState<
    GroupedStaticsAdminByDate[]
  >([]);
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>(
      "totalAmountOrderFeeCharge"
    );
    const [secondBar, setSecondBar] = useState<keyof typeof chartConfig>(
      "totalAmountOrderFeeCharge"
    );
  const { endDate, saleType, startDate } = params;

  const total = useMemo(
    () => ({
      totalAmountOrderFeeCharge: chartAdminAmountOrder.reduce(
        (acc, curr) => acc + curr.totalAmountOrderFeeCharge,
        0
      ),
      totalAmountOrderFeeChargeCash: chartAdminAmountOrder.reduce(
        (acc, curr) => acc + curr.totalAmountOrderFeeChargeCash,
        0
      ),
      totalAmountOrderFeeChargeVirtualMoney: chartAdminAmountOrder.reduce(
        (acc, curr) => acc + curr.totalAmountOrderFeeChargeVirtualMoney,
        0
      ),
    }),
    [chartAdminAmountOrder]
  );

  useEffect(() => {
    setIsLoading(true);
    //get api
    const fetchDashboardData = async () => {
      if (!startDate || !endDate) return;

      const chartBodyData: AnalyticsPostProps = {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        saleType: saleType ?? "All",
        groupBy: "Date",
      };

      console.log(saleType, "saleType");

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

  // Call second bar
  useEffect(() => {
    if (activeChart === "totalAmountOrderFeeCharge")
      setSecondBar("totalOrderFeeCharge");
    if (activeChart === "totalAmountOrderFeeChargeCash")
      setSecondBar("totalOrderFeeChargeCash");
    if (activeChart === "totalAmountOrderFeeChargeVirtualMoney")
      setSecondBar("totalOrderFeeChargeVirtualMoney");
  }, [activeChart]);
  
  const chartAmountOrderData = (data: GroupedStaticsAdminByDate[]) => {
    return data.map((dateMap) => ({
      date: dateMap.date?.split("T", 1)[0], // Extract the date portion only
      totalAmountOrderFeeCharge: dateMap.totalAmountOrderFeeCharge,
      totalAmountOrderFeeChargeCash: dateMap.totalAmountOrderFeeChargeCash,
      totalAmountOrderFeeChargeVirtualMoney:
        dateMap.totalAmountOrderFeeChargeVirtualMoney,
      totalOrderFeeCharge: dateMap.totalOrderFeeCharge,
      totalOrderFeeChargeCash: dateMap.totalOrderFeeChargeCash,
      totalOrderFeeChargeVirtualMoney: dateMap.totalOrderFeeChargeVirtualMoney,
    }));
  };
  const dashboardAdminData = chartAmountOrderData(chartAdminAmountOrder);
  console.log(dashboardAdminData, "dashboardAdminData");

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
            "totalAmountOrderFeeChargeCash",
            "totalAmountOrderFeeChargeVirtualMoney",
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
          {chartAdminAmountOrder && chartAdminAmountOrder.length > 0 ? (
            <BarChart
              accessibilityLayer
              data={dashboardAdminData}
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
                    // nameKey="totalAmountOrder"
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
              <Bar
                dataKey={secondBar}
                fill={`var(--color-${secondBar})`}
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
