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
  AdminAnalyticsByDate,
  StoreAnalyticsByDate,
  CashierAnalytics,
  AnalyticsPostProps,
} from "@/types/analytics";

import { AnalyticsServices } from "../services/Dashboard/analyticsServices";
import { AdminChartByDate } from "@/components/dashboard/_components/_Admin/AdminChartByDate";
import { CashierChartByDate } from "@/components/dashboard/_components/_CashierWeb/CashierChartByDate";
import { StoreChartByDate } from "@/components/dashboard/_components/_Store/StoreChartByDate";
import { TopSale } from "@/components/dashboard/_components/_Admin/TopSale";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  ShoppingCart,
  DollarSign,
  Trophy,
  CreditCard,
  LucideIcon,
} from "lucide-react";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";
import { StoreChartByMonth } from "@/components/dashboard/_components/_Store/StoreChartByMonth";
import { AdminChartByMonth } from "@/components/dashboard/_components/_Admin/AdminChartByMonth";
import { CashierChartByMonth } from "@/components/dashboard/_components/_CashierWeb/CashierChartByMonth";
import { AdminPieGraph } from "@/components/dashboard/_components/_Admin/AdminPieGraph";
import { AdminChartByDateAll } from "@/components/dashboard/_components/_Admin/AdminChartByDateAll";

interface ChartLine {
  dataKey: string;
  stroke: string;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
}

interface ChartProps {
  data: any[];
  lines: ChartLine[];
}

interface ChartCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

interface AnalyticsChartProps {
  params: {
    startDate: Date | null;
    endDate: Date | null;
    saleType: string;
  };
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  icon: Icon,
  children,
}) => (
  <Card className="flex-1 min-w-full hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div>
        <CardTitle className="text-xl font-bold flex items-center gap-2 my-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription className="my-2 text-sm text-gray-500">
          {description}
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// const Chart: React.FC<ChartProps> = ({ data, lines }) => {
//   const [hoveredLine, setHoveredLine] = useState<string | null>(null);

//   return (
//     <div className="h-[300px]">
//       <ResponsiveContainer width="100%">
//         <LineChart
//           data={data}
//           margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
//           <XAxis dataKey="name" tick={{ fill: "#666" }} />
//           <YAxis tick={{ fill: "#666" }} />
//           <Tooltip content={<CustomTooltip />} />
//           <Legend
//             onMouseEnter={(e) => setHoveredLine(e.dataKey)}
//             onMouseLeave={() => setHoveredLine(null)}
//           />
//           {lines.map((line) => (
//             <Line
//               key={line.dataKey}
//               type="monotone"
//               {...line}
//               strokeWidth={hoveredLine === line.dataKey ? 3 : 2}
//               className={
//                 hoveredLine && hoveredLine !== line.dataKey ? "opacity-30" : ""
//               }
//             />
//           ))}
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ params }) => {
  const { startDate, endDate, saleType } = params;
  const user = useAuthUser();
  const userRole = user.roleName;
  console.log(userRole, "userRole");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const renderCharts = () => {
    if (userRole === "Admin") {
      return (
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 md:col-span-8">
            {userRole && userRole === "Admin" && saleType === "All" ? (
              <AdminChartByDateAll params={{ saleType, startDate, endDate }} />
            ) : (
              <AdminChartByDate params={{ saleType, startDate, endDate }} />
            )}
          </div>
          <div className="col-span-4 xl:col-span-4 hidden lg:table-cell">
            <ChartCard
              title="Top Sale Stores"
              description="Top 5 Stores in Month"
              icon={Trophy}
            >
              <TopSale params={{ startDate, endDate }} />
            </ChartCard>
          </div>
          <div className="col-span-4 md:col-span-8">
            <AdminChartByMonth params={{ saleType, startDate, endDate }} />
          </div>
          <div className="col-span-4 md:col-span-4">
            <AdminPieGraph params={{ saleType, startDate, endDate }} />
          </div>
        </div>
      );
    } else if (userRole === "Store") {
      return (
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 md:col-span-6">
            <StoreChartByDate params={{ startDate, endDate }} />
          </div>
          <div className="col-span-4 md:col-span-6">
            <StoreChartByMonth params={{ startDate, endDate }} />
          </div>
        </div>
      );
    } else if (userRole === "CashierWeb") {
      return (
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 md:col-span-6">
            <CashierChartByDate params={{ saleType, startDate, endDate }} />
          </div>

          <div className="col-span-4 md:col-span-6">
            <CashierChartByMonth params={{ saleType, startDate, endDate }} />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        renderCharts()
      )}
    </div>
  );
};

export default AnalyticsChart;
