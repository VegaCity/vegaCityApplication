"use client";
import { useEffect, useState } from "react";
import { Package2, Store, Tag, User } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import TransactionTable from "@/components/transactions/TransactionTable";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";
import { AnalyticsAdminDashboard } from "@/types/analytics";

interface Totals {
  totalTransactions: number;
  totalAmount: number;
  totalEtags: number;
  totalOrders: number;
  totalPackages: number;
}

const Home = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsAdminDashboard[]>(
    []
  );
  const [totals, setTotals] = useState<Totals>({
    totalTransactions: 0,
    totalAmount: 0,
    totalEtags: 0,
    totalOrders: 0,
    totalPackages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await AnalyticsServices.getDashboardAnalytics();
        const data = res.data.data || [];
        setAnalyticsData(data);
        const calculatedTotals = data.reduce(
          (acc: Totals, curr: AnalyticsAdminDashboard): Totals => ({
            totalTransactions:
              acc.totalTransactions + (Number(curr.totalTransactions) || 0),
            totalAmount:
              acc.totalAmount + (Number(curr.totalTransactionsAmount) || 0),
            totalEtags: acc.totalEtags + (Number(curr.etagCount) || 0),
            totalOrders: acc.totalOrders + (Number(curr.orderCount) || 0),
            totalPackages: acc.totalPackages + (Number(curr.packageCount) || 0),
          }),
          {
            totalTransactions: 0,
            totalAmount: 0,
            totalEtags: 0,
            totalOrders: 0,
            totalPackages: 0,
          }
        );

        setTotals(calculatedTotals);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [isLoading]);

  // Format number for display
  const formatNumber = (num: number): number | string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}Triệu`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}Ngàn`;
    }
    return num;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-5 mb-5">
        <DashboardCard
          title="Total Transactions"
          count={formatNumber(totals.totalTransactions)}
          icon={<Package2 className="text-slate-500" size={72} />}
        />
        <DashboardCard
          title="Total Amount"
          count={formatNumber(totals.totalAmount)}
          icon={<Store className="text-slate-500" size={72} />}
        />
        <DashboardCard
          title="Total V-Cards"
          count={formatNumber(totals.totalEtags)}
          icon={<Tag className="text-slate-500" size={72} />}
        />
        <DashboardCard
          title="Total Orders"
          count={formatNumber(totals.totalOrders)}
          icon={<User className="text-slate-500" size={72} />}
        />
        <DashboardCard
          title="Total Packages"
          count={formatNumber(totals.totalPackages)}
          icon={<Store className="text-slate-500" size={72} />}
        />
      </div>

      <AnalyticsChart />
      <TransactionTable title="Recent Transactions" limit={5} />
    </div>
  );
};

export default Home;
