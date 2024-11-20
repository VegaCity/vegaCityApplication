import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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
  AdminAnalytics,
  CashierAnalytics,
} from "@/types/analytics";
import { AnalyticsServices } from "../services/Dashboard/analyticsServices";
const AnalyticsChart = () => {
  const [analyticsData, setAnalyticsData] = useState<
    StoreAnalytics[] | AdminAnalytics[] | CashierAnalytics[]
  >([]);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserAndAnalytics = async () => {
      setIsLoading(true);
      try {
        // First get user info to determine role
        const userId = localStorage.getItem("userId"); // Assume we store this on login
        const userResponse = await AnalyticsServices.getUserById(
          userId as string
        );
        const role = userResponse.data.data.role.name;
        setUserRole(role);

        // Then fetch appropriate dashboard data based on role
        const analyticsResponse =
          await AnalyticsServices.getDashboardAnalytics();
        setAnalyticsData(analyticsResponse.data.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchUserAndAnalytics();
  }, []);

  const renderStoreCharts = () => (
    <>
      <div className="flex flex-wrap w-full gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
            <CardDescription>Monthly Order Statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%">
                <LineChart data={analyticsData as StoreAnalytics[]}>
                  <Line
                    type="monotone"
                    dataKey="orderCount"
                    stroke="#8884d8"
                    name="Total Orders"
                  />
                  <Line
                    type="monotone"
                    dataKey="orderCashCount"
                    stroke="#82ca9d"
                    name="Cash Orders"
                  />
                  <Line
                    type="monotone"
                    dataKey="otherOrderCount"
                    stroke="#ffc658"
                    name="Other Orders"
                  />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Revenue & Products</CardTitle>
            <CardDescription>Monthly Financial Overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%">
                <LineChart data={analyticsData as StoreAnalytics[]}>
                  <Line
                    type="monotone"
                    dataKey="totalAmountFromTransaction"
                    stroke="#8884d8"
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalProduct"
                    stroke="#82ca9d"
                    name="Products"
                  />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderAdminCharts = () => (
    <>
      <div className="flex flex-wrap w-full gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Transaction Overview</CardTitle>
            <CardDescription>Monthly Transaction Count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%">
                <LineChart data={analyticsData as AdminAnalytics[]}>
                  <Line
                    type="monotone"
                    dataKey="totalTransactions"
                    stroke="#8884d8"
                  />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Orders & Packages</CardTitle>
            <CardDescription>Monthly Overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%">
                <LineChart data={analyticsData as AdminAnalytics[]}>
                  <Line
                    type="monotone"
                    dataKey="orderCount"
                    stroke="#8884d8"
                    name="Orders"
                  />
                  <Line
                    type="monotone"
                    dataKey="packageCount"
                    stroke="#82ca9d"
                    name="Packages"
                  />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderCashierCharts = () => (
    <>
      <div className="flex flex-wrap w-full gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Orders & Transactions</CardTitle>
            <CardDescription>Monthly Overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%">
                <LineChart data={analyticsData as CashierAnalytics[]}>
                  <Line
                    type="monotone"
                    dataKey="totalTransactions"
                    stroke="#8884d8"
                    name="Total Transactions"
                  />
                  <Line
                    type="monotone"
                    dataKey="orderCash"
                    stroke="#82ca9d"
                    name="Cash Orders"
                  />
                  <Line
                    type="monotone"
                    dataKey="otherOrder"
                    stroke="#ffc658"
                    name="Other Orders"
                  />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Revenue & V-Cards</CardTitle>
            <CardDescription>Monthly Financial Overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%">
                <LineChart data={analyticsData as CashierAnalytics[]}>
                  <Line
                    type="monotone"
                    dataKey="totalAmountFromTransaction"
                    stroke="#8884d8"
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="etagCount"
                    stroke="#82ca9d"
                    name="V-Cards"
                  />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {userRole === "Store" && renderStoreCharts()}
      {userRole === "Admin" && renderAdminCharts()}
      {userRole === "CashierWeb" && renderCashierCharts()}
    </div>
  );
};

export default AnalyticsChart;
