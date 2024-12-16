"use client";

import { useState, useEffect, useMemo } from "react";
import { User2 } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AnalyticsPostProps, AdminAnalyticsByMonth } from "@/types/analytics";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { AxiosError } from "axios";
import { format, parse } from "date-fns";
import { DateRange } from "react-day-picker";
import { Loader } from "@/components/loader/Loader";

const chartConfig = {
  vcardsCurrentActive: {
    label: "V-Cards Current Active",
    color: "hsl(var(--chart-1))",
  },
  usersCurrentActive: {
    label: "Users Current Active",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface AdminPieGraphProps {
  params: {
    startDate: Date | null;
    endDate: Date | null;
    saleType: string;
  };
}

export function AdminPieGraph({ params }: AdminPieGraphProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [chartAdminCountUser, setChartAdminCountUser] =
    useState<AdminAnalyticsByMonth | null>(null);
  const { endDate, startDate, saleType } = params;

  const chartData = [
    {
      key: "vcardsCurrentActive",
      value: chartAdminCountUser?.vcardsCurrentActive || 0, // Total customer money transfer
      fill: "hsl(var(--chart-1))",
    },
    {
      key: "usersCurrentActive",
      value: chartAdminCountUser?.usersCurrentActive || 0, // Total customer money withdraw
      fill: "hsl(var(--chart-2))",
    },
  ];

  const totalAmount = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartAdminCountUser]);

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
        // const resChartAdminAmountOrder = Array.isArray(
        //   dashboardData.data.data.groupedStaticsAdmin
        // )
        //   ? dashboardData.data.data.groupedStaticsAdmin
        //   : [];
        console.log(resDashboardData, "resChartAdminAmountOrder");
        setChartAdminCountUser(resDashboardData);
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
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Donut Chart</CardTitle>
        <CardDescription>
          {startDate && endDate && format(startDate, "MMMM")} -{" "}
          {startDate && endDate && format(endDate, "MMMM")}{" "}
          {startDate && endDate && format(endDate, "yyyy")}{" "}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[360px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="key"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalAmount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Customers
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Customers accessed recent months <User2 className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total transactions for the last 8 months
        </div>
      </CardFooter>
    </Card>
  );
}
