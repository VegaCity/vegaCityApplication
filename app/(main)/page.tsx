"use client";

import { useEffect, useState } from "react";
import {
  Package2,
  Store,
  Tag,
  User,
  Wallet,
  ShoppingCart,
  CreditCard,
  CreditCardIcon,
  Currency,
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import TransactionTable from "@/components/transactions/TransactionTable";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";
import { ChartByDate } from "@/components/dashboard/_components/ChartByDate";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  AdminAnalyticsByDate,
  AdminAnalyticsByMonth,
  AnalyticsPostProps,
  GroupedStaticsAdminByMonth,
} from "@/types/analytics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Loader } from "@/components/loader/Loader";
import TotalCountCard from "@/components/dashboard/_components/_Admin/TotalCountCard";

interface StoreTotals {
  totalOrders: number;
  totalAmount: number;
  totalProducts: number;
  totalMenu: number;
  cashOrders: number;
  otherOrders: number;
}

// interface AdminStatics {
//   month: string;
//   year: number;
//   date: string;
//   formattedDate: string;
//   totalOrder: number;
//   totalAmountOrder: number;
//   totalOrderCash: number;
//   totalAmountCashOrder: number;
//   totalOrderOnlineMethods: number;
//   totalAmountOrderOnlineMethod: number;
//   totalOrderFeeCharge: number;
//   totalAmountOrderFeeCharge: number;
//   endDayCheckWalletCashierBalance: number;
//   endDayCheckWalletCashierBalanceHistory: number;
//   vegaDepositsAmountFromStore: number;
//   totalAmountCustomerMoneyWithdraw: number;
//   totalAmountCustomerMoneyTransfer: number;
// }

interface CashierTotals {
  totalTransactions: number;
  totalAmount: number;
  totalEtags: number;
  totalOrders: number;
  cashOrders: number;
  otherOrders: number;
}
const Home = () => {
  // Select Calendar
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
    from: new Date(2024, 6, 1), // Note: Month is 0-based
    to: addDays(new Date(2025, 2, 2), 1),
  });

  if (!selectedDate || !selectedDate.from || !selectedDate.to)
    return <div>error</div>;

  // const chartBodyDataByDate: AnalyticsPostProps = {
  //   startDate: format(selectedDate.from, "yyyy-MM-dd"),
  //   endDate: format(selectedDate.to, "yyyy-MM-dd"),
  //   saleType: "All",
  //   groupBy: "Date",
  // };

  const [userRole, setUserRole] = useState<string>("");

  //--------------------- Admin Section ------------------------
  const [analyticsDataByMonth, setAnalyticsDataByMonth] =
    useState<AdminAnalyticsByMonth | null>(null);
  const [analyticsDataByDate, setAnalyticsDataByDate] =
    useState<AdminAnalyticsByDate | null>(null);
  // const [adminTotals, setAdminTotals] = useState<GroupedStaticsAdminByMonth[]>(
  //   []
  // );

  const [storeTotals, setStoreTotals] = useState<StoreTotals>({
    totalOrders: 0,
    totalAmount: 0,
    totalProducts: 0,
    totalMenu: 0,
    cashOrders: 0,
    otherOrders: 0,
  });
  const [cashierTotals, setCashierTotals] = useState<CashierTotals>({
    totalTransactions: 0,
    totalAmount: 0,
    totalEtags: 0,
    totalOrders: 0,
    cashOrders: 0,
    otherOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Format number for display with Vietnamese currency
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)} M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)} K`;
    }
    return String(num);
  };

  //Format Title like totalCashOrder -> Total Cash Order
  const formatTitle = (str: string) => {
    return str
      .replace(/([A-Z])/g, " $1") // Add space before uppercase letters
      .replace(/^./, (char: string) => char.toUpperCase()); // Capitalize the first letter
  };

  useEffect(() => {
    const fetchUserAndAnalytics = async () => {
      setIsLoading(true);
      try {
        // Get user role first
        const userId = localStorage.getItem("userId");
        const userResponse = await AnalyticsServices.getUserById(
          userId as string
        );
        const role = userResponse.data.data.role.name;
        setUserRole(role);

        if (role === "Admin") {
          // const adminDashboardData: AdminStatics = {
          //   etagCount: data.etagCount,
          //   name: data.name,
          //   orderCash: data.orderCash,
          //   orderCount: data.orderCount,
          //   otherOrder: data.otherOrder,
          //   totalTransactions: data.totalTransactions,
          //   totalTransactionsAmount: data.totalTransactionsAmount,
          // };
        } else if (role === "Store") {
          // const calculatedTotals = data.reduce(
          //   (acc: StoreTotals, curr: any): StoreTotals => ({
          //     totalOrders: acc.totalOrders + (Number(curr.orderCount) || 0),
          //     totalAmount:
          //       acc.totalAmount +
          //       (Number(curr.totalAmountFromTransaction) || 0),
          //     totalProducts:
          //       acc.totalProducts + (Number(curr.totalProduct) || 0),
          //     totalMenu: acc.totalMenu + (Number(curr.totalMenu) || 0),
          //     cashOrders: acc.cashOrders + (Number(curr.orderCashCount) || 0),
          //     otherOrders:
          //       acc.otherOrders + (Number(curr.otherOrderCount) || 0),
          //   }),
          //   {
          //     totalOrders: 0,
          //     totalAmount: 0,
          //     totalProducts: 0,
          //     totalMenu: 0,
          //     cashOrders: 0,
          //     otherOrders: 0,
          //   }
          // );
          // setStoreTotals(calculatedTotals);
        } else if (role === "CashierWeb") {
          // const calculatedTotals = data.reduce(
          //   (acc: CashierTotals, curr: any): CashierTotals => ({
          //     totalTransactions:
          //       acc.totalTransactions + (Number(curr.totalTransactions) || 0),
          //     totalAmount:
          //       acc.totalAmount +
          //       (Number(curr.totalAmountFromTransaction) || 0),
          //     totalEtags: acc.totalEtags + (Number(curr.etagCount) || 0),
          //     totalOrders: acc.totalOrders + (Number(curr.orderCount) || 0),
          //     cashOrders: acc.cashOrders + (Number(curr.orderCash) || 0),
          //     otherOrders: acc.otherOrders + (Number(curr.otherOrder) || 0),
          //   }),
          //   {
          //     totalTransactions: 0,
          //     totalAmount: 0,
          //     totalEtags: 0,
          //     totalOrders: 0,
          //     cashOrders: 0,
          //     otherOrders: 0,
          //   }
          // );
          // setCashierTotals(calculatedTotals);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndAnalytics();
  }, []);

  const renderAdminDashboard = () => {
    return (
      <TotalCountCard key={"admin"} params={{ dateRange: selectedDate }} />
    );
  };

  const renderStoreDashboard = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between gap-5 mb-5">
        <DashboardCard
          title="Total Orders"
          count={formatNumber(storeTotals.totalOrders)}
          icon={<ShoppingCart className="text-slate-500" size={50} />}
        />
        <DashboardCard
          title="Total Revenue"
          count={formatNumber(storeTotals.totalAmount)}
          icon={<Wallet className="text-slate-500" size={50} />}
        />
        <DashboardCard
          title="Total Products"
          count={formatNumber(storeTotals.totalProducts)}
          icon={<Package2 className="text-slate-500" size={50} />}
        />
        <DashboardCard
          title="Order Cash"
          count={formatNumber(storeTotals.cashOrders)}
          icon={<Store className="text-slate-500" size={50} />}
        />
        <DashboardCard
          title="Other Orders"
          count={formatNumber(storeTotals.otherOrders)}
          icon={<Tag className="text-slate-500" size={50} />}
        />
      </div>
    </>
  );

  const renderCashierDashboard = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between gap-5 mb-5">
        <DashboardCard
          title="Total Transactions"
          count={formatNumber(cashierTotals.totalTransactions)}
          icon={<Package2 className="text-slate-500" size={72} />}
        />
        <DashboardCard
          title="Total Revenue"
          count={formatNumber(cashierTotals.totalAmount)}
          icon={<Wallet className="text-slate-500" size={72} />}
        />
        <DashboardCard
          title="Total V-Cards"
          count={formatNumber(cashierTotals.totalEtags)}
          icon={<Tag className="text-slate-500" size={72} />}
        />
        <DashboardCard
          title="Orders Cash"
          count={formatNumber(cashierTotals.cashOrders)}
          icon={<Store className="text-slate-500" size={72} />}
        />
        <DashboardCard
          title="Orders Other"
          count={formatNumber(cashierTotals.otherOrders)}
          icon={<CreditCard className="text-slate-500" size={72} />}
        />
      </div>
    </>
  );
  if (isLoading) {
    return (
      <div>
        <Loader isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Select a Date</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {selectedDate?.from ? (
                selectedDate.to ? (
                  <>
                    {format(selectedDate.from, "LLL dd, y")} -{" "}
                    {format(selectedDate.to, "LLL dd, y")}
                  </>
                ) : (
                  format(selectedDate.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selectedDate?.from || new Date()}
              selected={selectedDate || undefined} // Ensure `undefined` if no date selected
              onSelect={setSelectedDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        {selectedDate?.from && selectedDate.to ? (
          <div className="mt-4 text-sm">
            <p>
              <strong>Selected Date:</strong>{" "}
              {format(selectedDate.from, "yyyy-MM-dd")} to{" "}
              {format(selectedDate.to, "yyyy-MM-dd")}
            </p>
            <p>
              <strong>Selected Month:</strong>{" "}
              {format(selectedDate.from, "MMM")} -{" "}
              {format(selectedDate.to, "MMM")}
            </p>
          </div>
        ) : null}
      </div>

      {userRole === "Admin" && renderAdminDashboard()}
      {userRole === "Store" && renderStoreDashboard()}
      {userRole === "CashierWeb" && renderCashierDashboard()}

      <AnalyticsChart params={{ dateRange: selectedDate }} />
      <TransactionTable />
    </div>
  );
};

export default Home;
