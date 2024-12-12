import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  StoreAnalytics,
  AdminAnalyticsByMonth,
  CashierAnalytics,
  AnalyticsPostProps,
} from "@/types/analytics";
import { AnalyticsServices } from "../services/Dashboard/analyticsServices";
import SaleStore from "@/components/dashboard/_components/SaleStore";

import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Package,
  Trophy,
  ShoppingCart,
  LucideIcon,
} from "lucide-react";
import { ChartByDate } from "@/components/dashboard/_components/ChartByDate";
import { TopSale } from "@/components/dashboard/_components/TopSale";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}
const formatLargeNumber = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry, index) => {
          const value =
            entry.dataKey.includes("Amount") ||
            entry.dataKey.includes("Revenue")
              ? formatCurrency(entry.value)
              : formatLargeNumber(entry.value);
          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${value}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

interface ChartCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const ChartCard = ({
  title,
  description,
  icon: Icon,
  children,
}: ChartCardProps) => (
  <Card className="flex-1 min-w-[450px] hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {description}
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

interface ChartLineConfig {
  dataKey: string;
  stroke: string;
  name: string;
}

interface ChartProps {
  data: any[];
  lines: ChartLineConfig[];
}

interface AnalyticsChartProps {
  params: {
    dateRange: DateRange | undefined;
  };
}

const Chart = ({ data, lines }: ChartProps) => {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#666" }}
            tickLine={{ stroke: "#666" }}
          />
          <YAxis tick={{ fill: "#666" }} tickLine={{ stroke: "#666" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            onMouseEnter={(e) => setHoveredLine(e.dataKey as string)}
            onMouseLeave={() => setHoveredLine(null)}
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              {...line}
              strokeWidth={hoveredLine === line.dataKey ? 3 : 2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              className={
                hoveredLine && hoveredLine !== line.dataKey ? "opacity-30" : ""
              }
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const AnalyticsChart = ({ params }: AnalyticsChartProps) => {
  const selectedDate: DateRange | undefined = params.dateRange;
  const [analyticsData, setAnalyticsData] = useState<
    StoreAnalytics[] | AdminAnalyticsByMonth[] | CashierAnalytics[]
  >([]);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  console.log(selectedDate, "AnalyticsChartProps");

  useEffect(() => {
    const fetchUserAndAnalytics = async () => {
      setIsLoading(true);
      try {
        if (!selectedDate || !selectedDate.from || !selectedDate.to) return;

        const chartBodyData: AnalyticsPostProps = {
          startDate: format(selectedDate.from, "yyyy-MM-dd"),
          endDate: format(selectedDate.to, "yyyy-MM-dd"),
          saleType: "All",
          groupBy: "Date",
        };

        const userId = localStorage.getItem("userId");
        const userResponse = await AnalyticsServices.getUserById(
          userId as string
        );
        const role = userResponse.data.data.role.name;
        setUserRole(role);

        const analyticsResponse = await AnalyticsServices.getDashboardAnalytics(
          chartBodyData
        );
        setAnalyticsData(analyticsResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndAnalytics();
  }, []);

  const renderStoreCharts = () => (
    <div className="flex flex-wrap w-full gap-6">
      <ChartCard
        title="Orders Overview"
        description="Monthly Order Statistics"
        icon={ShoppingCart}
      >
        <Chart
          data={analyticsData as StoreAnalytics[]}
          lines={[
            { dataKey: "orderCount", stroke: "#8884d8", name: "Total Orders" },
            {
              dataKey: "orderCashCount",
              stroke: "#82ca9d",
              name: "Cash Orders",
            },
            {
              dataKey: "otherOrderCount",
              stroke: "#ffc658",
              name: "Other Orders",
            },
          ]}
        />
      </ChartCard>

      <ChartCard
        title="Revenue & Products"
        description="Monthly Financial Overview"
        icon={DollarSign}
      >
        <Chart
          data={analyticsData as StoreAnalytics[]}
          lines={[
            {
              dataKey: "totalAmountFromTransaction",
              stroke: "#8884d8",
              name: "Revenue",
            },
            { dataKey: "totalProduct", stroke: "#82ca9d", name: "Products" },
          ]}
        />
      </ChartCard>
    </div>
  );

  const renderAdminCharts = () => (
    <div className="flex flex-wrap w-full gap-6">
      {/* <ChartCard
        title="Orders & V-Cards"
        description="Monthly Overview"
        icon={Package}
      >
        <Chart
          data={analyticsData as AdminAnalytics[]}
          lines={[
            {
              dataKey: "orderCash",
              stroke: "#8884d8",
              name: "Orders with Cash",
            },
            { dataKey: "orderCount", stroke: "#82ca9d", name: "Orders" },
            { dataKey: "etagCount", stroke: "#825555", name: "V-Cards " },
          ]}
        />
      </ChartCard> */}

      {/* <Chart /> */}
      {/* <ChartCard
        title="Chart By Date"
        description="Date Monthly Overview"
        icon={Package}
      > */}
      <div className="grid grid-cols-12 gap-3 w-full">
        {/* Left column */}
        <div className="col-span-8">
          <ChartByDate params={{ dateRange: selectedDate }} />
        </div>

        {/* Right column */}
        <div className="col-span-4">
          <ChartCard
            title="Top Sale Stores"
            description="Top Stores in Month"
            icon={Trophy}
          >
            <TopSale params={{ dateRange: selectedDate }} />
          </ChartCard>
        </div>
      </div>

      {/* Chart by Month
      <ChartCard
        title="Total Transactions"
        description="Monthly Overview"
        icon={Package}
      >
        <Chart
          data={analyticsData as AdminAnalyticsByMonth[]}
          lines={[
            {
              dataKey: "orderCash",
              stroke: "#8884d8",
              name: "Orders with Cash",
            },
            {
              dataKey: "totalTransactions",
              stroke: "#82ca9d",
              name: "Total Transactions",
            },
            { dataKey: "orderCount", stroke: "#825555", name: "Orders" },
            {
              dataKey: "totalTransactionsAmount",
              stroke: "#822555",
              name: "Total Revenue",
            },
          ]}
        />
      </ChartCard> */}
    </div>
  );

  const renderCashierCharts = () => (
    <div className="flex flex-wrap w-full gap-6">
      <ChartCard
        title="Orders & Transactions"
        description="Monthly Overview"
        icon={ShoppingCart}
      >
        <Chart
          data={analyticsData as CashierAnalytics[]}
          lines={[
            {
              dataKey: "totalTransactions",
              stroke: "#8884d8",
              name: "Total Transactions",
            },
            { dataKey: "orderCash", stroke: "#82ca9d", name: "Cash Orders" },
            { dataKey: "otherOrder", stroke: "#ffc658", name: "Other Orders" },
          ]}
        />
      </ChartCard>

      <ChartCard
        title="Revenue & V-Cards"
        description="Monthly Financial Overview"
        icon={CreditCard}
      >
        <Chart
          data={analyticsData as CashierAnalytics[]}
          lines={[
            {
              dataKey: "totalAmountFromTransaction",
              stroke: "#8884d8",
              name: "Revenue",
            },
            { dataKey: "etagCount", stroke: "#82ca9d", name: "V-Cards" },
          ]}
        />
      </ChartCard>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {userRole === "Store" && renderStoreCharts()}
      {userRole === "Admin" && renderAdminCharts()}
      {userRole === "CashierWeb" && renderCashierCharts()}
    </div>
  );
};

export default AnalyticsChart;
