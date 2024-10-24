"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// import data from "@/data/analytics";
import { useEffect, useState } from "react";
import { AnalyticsAdminDashboard } from "@/types/analytics";
import { AnalyticsServices } from "@/components/services/Dashboard/analyticsServices";

const AnalyticsChart = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsAdminDashboard[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      // fetch data from API
      setIsLoading(true);
      try {
        const res = await AnalyticsServices.getAdminDashboardAnalytics();
        const analyticsRes = res.data.data ? res.data.data : [];
        setAnalyticsData(analyticsRes);
        console.log(analyticsRes, "analyticsRes");
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    };
    fetchAdminDashboard();
  }, [isLoading]);
  return (
    <>
      <div className="flex flex-wrap w-full gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Analytics Total Transactions For This Year</CardTitle>
            <CardDescription>Views Per Month</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart width={1100} height={300} data={analyticsData}>
                  <Line
                    type="monotone"
                    dataKey="totalTransactions"
                    stroke="#8884d8"
                  />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              Analytics Total Transactions Amount For This Year
            </CardTitle>
            <CardDescription>Views Per Month</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart width={1100} height={300} data={analyticsData}>
                  <Line
                    type="monotone"
                    dataKey="totalTransactionsAmount"
                    stroke="#8884d8"
                  />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap w-full gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Analytics Etag For This Year</CardTitle>
            <CardDescription>Views Per Month</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart width={1100} height={300} data={analyticsData}>
                  <Line type="monotone" dataKey="etagCount" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Analytics Order For This Year</CardTitle>
            <CardDescription>Views Per Month</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart width={1100} height={300} data={analyticsData}>
                  <Line type="monotone" dataKey="orderCount" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AnalyticsChart;
