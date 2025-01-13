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
  StoreAnalyticsByMonth,
  StoreAnalyticsByDate,
  CashierAnalyticsByDate,
  CashierAnalyticsByMonth,
} from "@/types/analytics";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/loader/Loader";
import AdminTotalCountCard from "@/components/dashboard/_components/_Admin/AdminTotalCountCard";
import CashierTotalCountCard from "@/components/dashboard/_components/_CashierWeb/CashierTotalCountCard";
import StoreTotalCountCard from "@/components/dashboard/_components/_Store/StoreTotalCountCard";
import WalletCard from "@/components/wallet/WalletCard";
import PageContainer from "@/components/page-container";
import { DateSelector } from "@/components/dashboard/DateSelector";
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
  // const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
  //   from: new Date(2024, 6, 1), // Note: Month is 0-based
  //   to: addDays(new Date(2025, 2, 2), 1),
  // });
  const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 6, 1));
  const [endDate, setEndDate] = useState<Date | null>(
    addDays(new Date(2025, 2, 2), 1)
  );
  const handleDateChange = (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    console.log("Selected Date Range:", range);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    // Update parent state or perform actions
  };

  //First render sale type
  const [userRole, setUserRole] = useState<string>("");
  let getDefaultSaleType: any = () => {}; //call in useEffect
  const defaultSaleType = getDefaultSaleType();
  const [selectedType, setSelectedType] = useState<string>("");
  console.log(selectedType, "saleType"); // "All"

  //--------------------- Admin Section ------------------------
  const [adminAnalyticsDataByMonth, setAdminAnalyticsDataByMonth] =
    useState<AdminAnalyticsByMonth | null>(null);
  const [adminAnalyticsDataByDate, setAdminAnalyticsDataByDate] =
    useState<AdminAnalyticsByDate | null>(null);

  //--------------------- Store Section ------------------------
  const [storeAnalyticsDataByMonth, setStoreAnalyticsDataByMonth] =
    useState<StoreAnalyticsByMonth | null>(null);
  const [storeAnalyticsDataByDate, setStoreAnalyticsDataByDate] =
    useState<StoreAnalyticsByDate | null>(null);

  //--------------------- Cashier Web Section ------------------------
  const [cashierAnalyticsDataByMonth, setCashierAnalyticsDataByMonth] =
    useState<CashierAnalyticsByMonth | null>(null);
  const [cashierAnalyticsDataByDate, setCashierAnalyticsDataByDate] =
    useState<CashierAnalyticsByDate | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleChangeType = (value: string) => {
    setSelectedType(value);
    console.log("Selected value:", value); // Logs the selected value
  };

  const renderAdminDashboard = () => {
    return (
      <div className="flex flex-col md:flex-row justify-between gap-5 mb-5">
        <AdminTotalCountCard
          key={"admin"}
          params={{
            saleType: selectedType,
            startDate,
            endDate,
          }}
        />
      </div>
    );
  };

  const renderStoreDashboard = () => (
    <div className="flex flex-col md:flex-row justify-between gap-5 mb-5">
      <StoreTotalCountCard key={"store"} params={{ startDate, endDate }} />
    </div>
  );

  const renderCashierDashboard = () => (
    <div className="flex flex-col md:flex-row justify-between gap-5 mb-5">
      <CashierTotalCountCard
        key={"cashierWeb"}
        params={{
          saleType: selectedType,
          startDate,
          endDate,
        }}
      />
    </div>
  );

  useEffect(() => {
    const fetchUserAndAnalytics = async () => {
      setIsLoading(true);
      try {
        // Get user role first
        const userId = localStorage.getItem("userId");
        // If store role get storeType
        const type = localStorage.getItem("storeType");
        if (!type) return;
        const storeType = parseInt(type);

        const userResponse = await AnalyticsServices.getUserById(
          userId as string
        );
        const role = userResponse.data.data.role.name;
        setUserRole(role);
        // console.log(role, "role");
        const roleName = localStorage.setItem("roleName", role);
        if (role === "Admin") {
          if (!startDate || !endDate) return;

          const chartBodyDataByDate: AnalyticsPostProps = {
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
            saleType: "All",
            groupBy: "Date",
          };
          const adminAnalyticsRes =
            await AnalyticsServices.getDashboardAnalytics(chartBodyDataByDate);
          setAdminAnalyticsDataByDate(adminAnalyticsRes.data.data);
        } else if (role === "Store") {
          if (!startDate || !endDate) return;
          if (storeType === 1) {
            const chartBodyDataByDateProduct: AnalyticsPostProps = {
              startDate: format(startDate, "yyyy-MM-dd"),
              endDate: format(endDate, "yyyy-MM-dd"),
              saleType: "Product",
              groupBy: "Date",
            };
            const storeAnalyticsRes =
              await AnalyticsServices.getDashboardAnalytics(
                chartBodyDataByDateProduct
              );
            setStoreAnalyticsDataByDate(storeAnalyticsRes.data.data);
          } else if (storeType === 2) {
            const chartBodyDataByDateService: AnalyticsPostProps = {
              startDate: format(startDate, "yyyy-MM-dd"),
              endDate: format(endDate, "yyyy-MM-dd"),
              saleType: "Service",
              groupBy: "Date",
            };
            const storeAnalyticsRes =
              await AnalyticsServices.getDashboardAnalytics(
                chartBodyDataByDateService
              );
            setStoreAnalyticsDataByDate(storeAnalyticsRes.data.data);
          }
        } else if (role === "CashierWeb") {
          if (!startDate || !endDate) return;
          const chartBodyDataByDate: AnalyticsPostProps = {
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
            saleType: "Package",
            groupBy: "Date",
          };
          const cashierAnalyticsRes =
            await AnalyticsServices.getDashboardAnalytics(chartBodyDataByDate);
          setCashierAnalyticsDataByDate(cashierAnalyticsRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndAnalytics();
  }, []);

  //First render sale Type
  useEffect(() => {
    getDefaultSaleType = () => {
      return userRole === "Admin" ? "All" : "Package";
    };

    setSelectedType(getDefaultSaleType());
  }, [userRole]); // Runs whenever userRole changes

  if (isLoading) {
    return (
      <div>
        <Loader isLoading={isLoading} />
      </div>
    );
  }

  return (
    // <PageContainer scrollable>
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-4">
        {/* Placeholder for start div */}
        <div className="col-span-12 lg:col-span-8">
          {/* Display wallet Card here */}
          <WalletCard
            balance={
              storeAnalyticsDataByDate?.storeBalance ||
              adminAnalyticsDataByDate?.adminBalance ||
              cashierAnalyticsDataByDate?.cashierWebBalance ||
              0
            }
            balanceHistory={
              storeAnalyticsDataByDate?.storeBalanceHistory ||
              adminAnalyticsDataByDate?.adminBalanceHistory ||
              cashierAnalyticsDataByDate?.cashierWebBalanceHistory ||
              0
            }
            // vCards={storeAnalyticsDataByDate?.totalVcards}
          />
        </div>
        {/* <div className="col-span-12 md:col-span-6 lg:col-span-4"></div> */}

        {/* <div className="col-span-4 md:col-span-4 lg:col-span-2"></div> */}
        <div className="col-span-12 lg:col-span-4">
          {/* Calendar Section */}
          <div className="flex flex-row w-full items-center justify-end">
            <div className="mb-6">
              {/* <Popover>
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
              </Popover> */}
              {/* {selectedDate?.from && selectedDate.to ? (
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
              ) : null} */}
              <DateSelector onDateChange={handleDateChange} />
            </div>
          </div>
          {userRole !== "Store" && (
            <div className="flex flex-row w-full items-center justify-end">
              <Select
                defaultValue={selectedType}
                onValueChange={handleChangeType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sale Type</SelectLabel>
                    {userRole === "Admin" && (
                      <>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Package">Package</SelectItem>
                        <SelectItem value="PackageItem Charge">
                          PackageItem Charge
                        </SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Service">Service</SelectItem>
                        <SelectItem value="FeeChargeCreate">Other</SelectItem>
                      </>
                    )}
                    {userRole === "CashierWeb" && (
                      <>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Package">Package</SelectItem>
                        <SelectItem value="PackageItem Charge">
                          PackageItem Charge
                        </SelectItem>
                        <SelectItem value="FeeChargeCreate">Other</SelectItem>
                      </>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      {userRole === "Admin" && renderAdminDashboard()}
      {userRole === "Store" && renderStoreDashboard()}
      {userRole === "CashierWeb" && renderCashierDashboard()}

      <AnalyticsChart
        params={{
          saleType: selectedType,
          startDate: startDate,
          endDate: endDate,
        }}
      />
      <TransactionTable />
    </div>
    // </PageContainer>
  );
};

export default Home;
