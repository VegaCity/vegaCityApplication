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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AnalyticsPostProps,
  GroupedStaticsAdminByMonth,
  CashierAnalyticsByMonth,
} from "@/types/analytics";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { AxiosError } from "axios";
import { format, parse } from "date-fns";
import { DateRange } from "react-day-picker";
import { Loader } from "@/components/loader/Loader";

const chartConfig = {
  totalAmountCustomerMoneyWithdraw: {
    label: "Money Withdraw",
    color: "hsl(var(--chart-1))",
  },
  totalAmountCustomerMoneyTransfer: {
    label: "Money Transfer",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface CashierPieGraphProps {
  params: {
    dateRange?: DateRange | undefined;
    saleType: string;
  };
}

export function CashierPieGraph({ params }: CashierPieGraphProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [chartCashierAmountOrder, setChartCashierAmountOrder] = useState<
    GroupedStaticsAdminByMonth[]
  >([]);
  const { dateRange: selectedDate, saleType } = params;

  console.log(chartCashierAmountOrder, "groupedData");

  const chartAmountOrderData = (data: GroupedStaticsAdminByMonth[]) => {
    if (data === undefined) return;
    return data.map((dateMap) => {
      // Parse the abbreviated month and format it to full month name
      const fullMonthName = format(
        parse(dateMap.name, "MMM", new Date()),
        "MMMM"
      );
      return {
        name: fullMonthName, // "November", "December"
        totalAmountCashOrder: dateMap.totalAmountCashOrder,
        totalAmountOrderOnlineMethod: dateMap.totalAmountOrderOnlineMethod,
      };
    });
  };

  console.log(chartAmountOrderData(chartCashierAmountOrder), "gropppp");
  const groupedDate = chartAmountOrderData(chartCashierAmountOrder);

  const chartData = [
    {
      key: "totalAmountCashOrder",
      value: 100, // Total customer money transfer
      fill: "hsl(var(--chart-1))",
    },
    {
      key: "totalAmountOrderOnlineMethod",
      value: 200, // Total customer money withdraw
      fill: "hsl(var(--chart-2))",
    },
  ];

  // const gropedData = () => {
  //   chartCashierAmountOrder?.groupedStaticsAdmin.map((data) => ({
  //     return {
  //       name: data.name,
  //       totalAmountOrder: data.totalAmountOrder,
  //       totalAmountOrderOnlineMethod: data.totalAmountOrderOnlineMethod,
  //     }
  //   }));
  // };

  const total = useMemo(
    () => ({
      totalAmountCashOrder: chartCashierAmountOrder.reduce(
        (acc, curr) => acc + curr.totalAmountCashOrder,
        0
      ),
      totalAmountOrderOnlineMethod: chartCashierAmountOrder.reduce(
        (acc, curr) => acc + curr.totalAmountOrderOnlineMethod,
        0
      ),
    }),
    [chartCashierAmountOrder]
  );

  useEffect(() => {
    setIsLoading(true);
    //get api
    const fetchDashboardData = async () => {
      if (!selectedDate || !selectedDate.from || !selectedDate.to) return;

      const chartBodyData: AnalyticsPostProps = {
        startDate: format(selectedDate.from, "yyyy-MM-dd"),
        endDate: format(selectedDate.to, "yyyy-MM-dd"),
        saleType: saleType ?? "Package",
        groupBy: "Month",
      };

      console.log(chartBodyData, "chartBodyData");

      try {
        const dashboardData = await AnalyticsServices.getDashboardAnalytics(
          chartBodyData
        );
        const resDashboardData = dashboardData.data.data.groupedStaticsAdmin;
        // const resChartCashierAmountOrder = Array.isArray(
        //   resDashboardData.groupedStaticsAdmin
        // )
        //   ? resDashboardData.groupedStaticsAdmin
        //   : [];
        console.log(resDashboardData, "resChartCashierAmountOrder");
        setChartCashierAmountOrder(resDashboardData);
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
  }, [selectedDate, saleType]);

  // if (isLoading) return <Loader isLoading={isLoading} />;
  if (error) return <EmptyDataPage title={error} />;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Donut Chart</CardTitle>
        <CardDescription>
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
            <ChartLegend content={<ChartLegendContent />} />
            <Pie
              data={groupedDate}
              dataKey="name"
              nameKey="totalAmountCashOrder"
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
                          1
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
