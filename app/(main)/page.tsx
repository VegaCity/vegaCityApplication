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
import { ChartByDate } from "@/components/dashboard/ChartByDate";

interface StoreTotals {
  totalOrders: number;
  totalAmount: number;
  totalProducts: number;
  totalMenu: number;
  cashOrders: number;
  otherOrders: number;
}

interface AdminTotals {
  etagCount: number;
  name: string;
  orderCash: number;
  orderCount: number;
  otherOrder: number;
  totalTransactions: number;
  totalTransactionsAmount: number;
}
interface CashierTotals {
  totalTransactions: number;
  totalAmount: number;
  totalEtags: number;
  totalOrders: number;
  cashOrders: number;
  otherOrders: number;
}
const Home = () => {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [adminTotals, setAdminTotals] = useState<AdminTotals>({
    etagCount: 0,
    name: "",
    orderCash: 0,
    orderCount: 0,
    otherOrder: 0,
    totalTransactions: 0,
    totalTransactionsAmount: 0,
  });
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
    return num.toString();
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

        // Fetch analytics data
        const analyticsResponse =
          await AnalyticsServices.getDashboardAnalytics();
        const data = analyticsResponse.data.data[0] || [];
        setAnalyticsData(data);
        console.log(data, "dashboard");

        // Calculate totals based on role
        if (role === "Admin") {
          const adminDashboardData: AdminTotals = {
            etagCount: data.etagCount,
            name: data.name,
            orderCash: data.orderCash,
            orderCount: data.orderCount,
            otherOrder: data.otherOrder,
            totalTransactions: data.totalTransactions,
            totalTransactionsAmount: data.totalTransactionsAmount,
          };

          setAdminTotals(adminDashboardData);
        } else if (role === "Store") {
          const calculatedTotals = data.reduce(
            (acc: StoreTotals, curr: any): StoreTotals => ({
              totalOrders: acc.totalOrders + (Number(curr.orderCount) || 0),
              totalAmount:
                acc.totalAmount +
                (Number(curr.totalAmountFromTransaction) || 0),
              totalProducts:
                acc.totalProducts + (Number(curr.totalProduct) || 0),
              totalMenu: acc.totalMenu + (Number(curr.totalMenu) || 0),
              cashOrders: acc.cashOrders + (Number(curr.orderCashCount) || 0),
              otherOrders:
                acc.otherOrders + (Number(curr.otherOrderCount) || 0),
            }),
            {
              totalOrders: 0,
              totalAmount: 0,
              totalProducts: 0,
              totalMenu: 0,
              cashOrders: 0,
              otherOrders: 0,
            }
          );
          setStoreTotals(calculatedTotals);
        } else if (role === "CashierWeb") {
          const calculatedTotals = data.reduce(
            (acc: CashierTotals, curr: any): CashierTotals => ({
              totalTransactions:
                acc.totalTransactions + (Number(curr.totalTransactions) || 0),
              totalAmount:
                acc.totalAmount +
                (Number(curr.totalAmountFromTransaction) || 0),
              totalEtags: acc.totalEtags + (Number(curr.etagCount) || 0),
              totalOrders: acc.totalOrders + (Number(curr.orderCount) || 0),
              cashOrders: acc.cashOrders + (Number(curr.orderCash) || 0),
              otherOrders: acc.otherOrders + (Number(curr.otherOrder) || 0),
            }),
            {
              totalTransactions: 0,
              totalAmount: 0,
              totalEtags: 0,
              totalOrders: 0,
              cashOrders: 0,
              otherOrders: 0,
            }
          );
          setCashierTotals(calculatedTotals);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndAnalytics();
  }, []);

  const renderAdminDashboard = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between gap-5 mb-5">
        <DashboardCard
          title="Total V-Card"
          count={formatNumber(adminTotals.etagCount)}
          icon={<CreditCardIcon className="text-slate-500" size={50} />}
        />
        <DashboardCard
          title="Total Order Cash"
          count={formatNumber(adminTotals.orderCash)}
          icon={<Wallet className="text-slate-500" size={50} />}
        />
        <DashboardCard
          title="Total Order Count"
          count={formatNumber(adminTotals.orderCount)}
          icon={<Package2 className="text-slate-500" size={50} />}
        />
        <DashboardCard
          title="Order Total Transactions"
          count={formatNumber(adminTotals.totalTransactions)}
          icon={<Store className="text-slate-500" size={50} />}
        />
        <DashboardCard
          title="Order Total Transactions Amount"
          count={formatNumber(adminTotals.totalTransactionsAmount)}
          icon={<Store className="text-slate-500" size={50} />}
        />
        <DashboardCard
          title="Other Orders"
          count={formatNumber(adminTotals.otherOrder)}
          icon={<Tag className="text-slate-500" size={50} />}
        />
      </div>
    </>
  );

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
    return <div>Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {userRole === "Admin" && renderAdminDashboard()}
      {userRole === "Store" && renderStoreDashboard()}
      {userRole === "CashierWeb" && renderCashierDashboard()}
      <AnalyticsChart />
      <TransactionTable />
    </div>
  );
};

export default Home;
