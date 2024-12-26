"use client";
import React, { useCallback, useState, useEffect } from "react";
import { API } from "@/components/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertCircle,
  ArrowDownFromLine,
  Loader2,
  Store,
  User,
  Wallet,
  PiggyBank,
  AlertTriangle,
} from "lucide-react";
import { StoreServices } from "@/components/services/Store/storeServices";
// import { StoreDetail } from "@/types/store/store";
import { Wallet as WalletType } from "@/types/packageitem";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AxiosError } from "axios";
type PackageItemDetail = {
  id: string;
  packageId: string;
  cusName: string;
  phoneNumber: string;
  cusCccdpassport: string;
  type?: "CUSTOMER" | "STORE";
};

interface WalletInfo {
  id: string;
  balance: number;
  balanceHistory: number;
  balanceStart: number;
  walletTypeId: string;
}
interface StoreDetail_FixToDeploy {
  id: string;
  name: string;
  address: string;
  shortName: string;
  wallets: WalletType[];
  email: string;
  phoneNumber: string;
  status: number;
  storeType: number;
  amountCanWithdraw: number;
  amountTransferred: number;
  amoutWithdrawed: number;
}

const MIN_WITHDRAWAL = 50000;
const FORMAT_LOCALE = "vi-VN";

const WithdrawMoney = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("customer");
  const [packageItemCode, setPackageItemCode] = useState("");
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [packageItemDetails, setPackageItemDetails] =
    useState<PackageItemDetail | null>(null);
  const [storeDetails, setStoreDetails] =
    useState<StoreDetail_FixToDeploy | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState("");
  const [pendingTransactionId, setPendingTransactionId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [vcardData, setVcardData] = useState<any>(null);
  const handleStoreTabChange = () => {
    setActiveTab("store");
    setPackageItemCode("");
    setStoreName("");
    setStorePhone("");
    setWalletInfo(null);
    setPackageItemDetails(null);
    setWithdrawAmount("");
    setError("");
  };
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreName(e.target.value);
  };

  const handleStorePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStorePhone(e.target.value);
  };
  const handleFindStoreWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(""); // Clear previous errors

      const response = await StoreServices.getWalletForStore(
        storeName,
        storePhone
      );

      const storeData = response.data.data.storeTrack;
      const amountData = response.data.data; // Lấy trực tiếp từ data

      if (!storeData) {
        throw new Error("Can not find store.");
      }

      // Check if store has wallets
      if (!storeData.wallets || storeData.wallets.length === 0) {
        throw new Error("Store has no wallets.");
      }

      const wallet = storeData.wallets[0];

      // Set wallet information
      setWalletInfo({
        id: wallet.id,
        balance: wallet.balance,
        balanceHistory: wallet.balanceHistory,
        balanceStart: wallet.balanceStart,
        walletTypeId: wallet.walletTypeId,
      });

      // Set store details with amount fields from amountData
      setStoreDetails({
        id: storeData.id,
        name: storeData.name,
        address: storeData.address,
        shortName: storeData.shortName,
        email: storeData.email,
        phoneNumber: storeData.phoneNumber,
        status: storeData.status,
        storeType: storeData.storeType,
        amountCanWithdraw: amountData.amountCanWithdraw || 0,
        amountTransferred: amountData.amountTransfered || 0, // Note the spelling 'Transfered' from API
        amoutWithdrawed: amountData.amoutWithdrawed || 0,
        wallets: storeData.wallets,
      });

      // If store status is 3, automatically trigger final settlement
      if (storeData.status === 3) {
        try {
          setIsSettling(true);
          const settlementResponse = await StoreServices.finalSettlement(
            storeData.id
          );

          if (settlementResponse.data?.statusCode === 200) {
            const settlementAmount =
              settlementResponse.data.data?.amountCanWithdraw || 0;

            // Update store details with new settlement amount
            setStoreDetails((prev) =>
              prev
                ? {
                    ...prev,
                    amountCanWithdraw: settlementAmount,
                  }
                : null
            );
          }
        } catch (settlementErr) {
          console.error("Error in automatic final settlement:", settlementErr);
          toast({
            variant: "destructive",
            title: "Warning",
            description:
              "Store is blocked but final settlement calculation failed. Please try calculating manually.",
          });
        } finally {
          setIsSettling(false);
        }
      }
    } catch (err: any) {
      if (err instanceof AxiosError) {
        console.error("Error finding store wallet:", err.message);

        // Check if the error response has a structured format
        if (err.response && err.response.data) {
          const errorData = err.response.data;
          const errorMessage = errorData.Error || "Not found!"; // Fallback to generic message

          // Set error with only the error message
          setError(errorMessage);
        } else {
          // Fallback to previous error handling
          setError(err ? err.response?.data.Error : "Not found!");
        }
      }

      setWalletInfo(null);
      setStoreDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [storeName, storePhone, toast]);
  // Optionally, log the updated state (using useEffect or other methods)
  useEffect(() => {
    if (walletInfo) {
      console.log(walletInfo, "walletInfo updated");
    }
    if (storeDetails) {
      console.log(storeDetails, "storeDetails updated");
    }
  }, [walletInfo, storeDetails]);
  const handleFinalSettlement = async () => {
    if (!storeDetails) return;

    try {
      setIsSettling(true);
      setError("");

      const response = await StoreServices.finalSettlement(storeDetails.id);

      if (response.data?.statusCode === 200) {
        // Extract the settlement amount from the response
        const settlementAmount = response.data.data?.amountCanWithdraw || 0;

        // Update store details with new settlement amount
        setStoreDetails((prev) =>
          prev
            ? {
                ...prev,
                amountCanWithdraw: settlementAmount,
              }
            : null
        );
      } else {
        throw new Error(
          response.data?.messageResponse || "Failed to process final settlement"
        );
      }
    } catch (err) {
      console.error("Error processing final settlement:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during final settlement. Please try again."
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to calculate final settlement amount",
      });
    } finally {
      setIsSettling(false);
    }
  };
  const validateWithdrawAmount = useCallback(
    (amount: number, balance: number | null): string | null => {
      console.log("Validating amount:", amount);
      console.log("Balance:", balance);
      console.log("Active tab:", activeTab);

      // Kiểm tra cơ bản cho cả customer và store
      if (isNaN(amount) || amount <= 0) {
        return "Money must be a positive number";
      }

      // Kiểm tra số dư
      if (balance !== null && amount > balance) {
        return "Withdrawal amount cannot exceed available balance";
      }

      if (activeTab === "customer") {
        // Check if customer can withdraw
        if (vcardData?.balanceCanWithdraw === 0) {
          return "You cannot withdraw at this time. Available withdrawal amount is 0";
        }

        // Điều kiện riêng cho customer
        if (amount < MIN_WITHDRAWAL) {
          return `Money must be at least ${MIN_WITHDRAWAL.toLocaleString(
            FORMAT_LOCALE
          )} VND`;
        }

        if (amount % 10000 !== 0) {
          return "Amount must be a multiple of 10,000 VND";
        }
      } else if (activeTab === "store") {
        // Check if store can withdraw
        if (storeDetails?.amountCanWithdraw === 0) {
          return "You cannot withdraw at this time. Available withdrawal amount is 0";
        }

        // Điều kiện riêng cho store
        if (storeDetails?.status === 3) {
          // Nếu store bị block, chỉ được rút số tiền final settlement
          if (amount > (storeDetails?.amountCanWithdraw || 0)) {
            return "Cannot withdraw more than final settlement amount";
          }
        } else {
          // Store đang hoạt động bình thường
          const availableBalance = storeDetails?.wallets[0]?.balance || 0;
          if (amount > availableBalance) {
            return "Cannot withdraw more than available balance";
          }
        }
      }

      return null;
    },
    [activeTab, storeDetails, vcardData]
  );
  const formatAmount = (value: string): string => {
    return value ? parseInt(value).toLocaleString(FORMAT_LOCALE) : "";
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setWithdrawAmount(value);
    setError("");
  };
  const fetchPackageItemInfo = useCallback(
    async (searchValue: string) => {
      try {
        setIsLoading(true);
        setError("");

        // Validate input format
        const isRfid = /^\d{10}$/.test(searchValue);
        const isGuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            searchValue
          );

        if (!isRfid && !isGuid) {
          throw new Error("Invalid ID. Please enter GUID or RFID (10 numbers)");
        }

        // Use different API endpoints based on active tab
        let response;
        if (activeTab === "customer") {
          // Use the new getVcardWithDrawMoneyById endpoint for customers
          response = await API.get(
            `/package-item/get-vcard-withdraw?${
              isRfid ? "rfId" : "id"
            }=${searchValue}`
          );
        } else {
          // Keep existing endpoint for stores
          response = await API.get(
            `/package-item/?${
              isRfid ? "rfId" : "id"
            }=${searchValue}&type=${activeTab.toUpperCase()}`
          );
        }

        console.log("Full API Response:", response);

        if (response.data.statusCode !== 200) {
          throw new Error(response.data.messageResponse);
        }

        const data = response.data.data;

        if (!data) {
          throw new Error("Can not find package item.");
        }

        if (activeTab === "customer") {
          // Set wallet info using the new API response format
          setWalletInfo({
            id: data.walletId || "",
            balance: data.balanceAtPresent || 0,
            balanceHistory: data.balanceNeedToUseBeforeWithdraw || 0,
            balanceStart: 0, // Set appropriate default or get from API if available
            walletTypeId: data.walletTypeId || "", // Set appropriate default or get from API if available
          });

          // Set package item details
          setPackageItemDetails({
            id: data.id || "",
            packageId: "", // Set if available in API response
            cusName: data.name || "",
            phoneNumber: data.phone || "",
            cusCccdpassport: data.cccdPassport || "",
            type: "CUSTOMER",
          });
        } else {
          // Existing store logic
          if (!data.wallets || data.wallets.length === 0) {
            throw new Error("Can not find wallet.");
          }

          const wallet = data.wallets[0];
          setWalletInfo({
            id: wallet.id,
            balance: wallet.balance || 0,
            balanceHistory: wallet.balanceHistory || 0,
            balanceStart: wallet.balanceStart || 0,
            walletTypeId: wallet.walletTypeId,
          });

          setPackageItemDetails({
            id: data.id,
            packageId: data.packageId,
            cusName: data.cusName,
            phoneNumber: data.phoneNumber,
            cusCccdpassport: data.cusCccdpassport,
            type: "STORE",
          });
        }

        setVcardData(response.data.data);
      } catch (err) {
        if (err instanceof AxiosError) {
          console.error("Fetch Package Item Error:", err.message);

          const messageResponse =
            err.response?.data.messageError || err.response?.data.Error;

          console.log("MessageResponse:", messageResponse);
          setError(messageResponse);
          setWalletInfo(null);
          setPackageItemDetails(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab]
  );

  const handlePackageItemChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchValue = e.target.value;

      // Xử lý trường hợp URL từ mã QR
      let finalValue = searchValue;
      try {
        // Kiểm tra nếu có chứa 'etagEdit/'
        if (searchValue.includes("etagEdit/")) {
          // Split theo 'etagEdit/' và lấy phần tử cuối
          finalValue = searchValue.split("etagEdit/")[1];
        } else if (searchValue.startsWith("http")) {
          // Xử lý trường hợp URL đầy đủ
          const url = new URL(searchValue);
          const pathSegments = url.pathname.split("/");
          finalValue = pathSegments[pathSegments.length - 1];
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
        finalValue = searchValue;
      }

      setPackageItemCode(finalValue);
      if (finalValue) fetchPackageItemInfo(finalValue);
    },
    [fetchPackageItemInfo]
  );

  const handleRequestWithdraw = useCallback(async () => {
    console.log("Handle withdraw called");
    console.log("Active tab:", activeTab);
    console.log("Wallet info:", walletInfo);
    console.log("Store details:", storeDetails);

    if (!walletInfo?.id) {
      console.log("No wallet ID found");
      return;
    }

    const amount = parseInt(withdrawAmount.replace(/,/g, ""));
    console.log("Amount to withdraw:", amount);

    const validationError = validateWithdrawAmount(
      amount,
      activeTab === "customer"
        ? walletInfo.balance
        : storeDetails?.wallets[0]?.balance || null
    );

    if (validationError) {
      console.log("Validation error:", validationError);
      setError(validationError);
      return;
    }

    try {
      setIsWithdrawing(true);
      setError("");

      console.log("Sending withdrawal request...");
      console.log("Request payload:", {
        walletId: walletInfo.id,
        amount,
        type: activeTab.toUpperCase(),
      });

      const response = await API.post(
        `/wallet/${walletInfo.id}/request-withdraw-money`,
        {
          amount,
          type: activeTab.toUpperCase(),
        }
      );
      console.log("Withdrawal response:", response);

      if (
        response.data.statusCode === 200 &&
        response.data.data?.transactionId
      ) {
        setPendingTransactionId(response.data.data.transactionId);
        setShowConfirmDialog(true);
      } else {
        throw new Error(
          response.data.Error ||
            response.data.messageResponse ||
            "Không thể tạo yêu cầu rút tiền"
        );
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      if (err instanceof Error && "response" in err) {
        const errorResponse = (err as any).response?.data;
        setError(
          errorResponse?.Error ||
            errorResponse?.messageResponse ||
            err.message ||
            "Not found!"
        );
      } else {
        setError(err instanceof Error ? err.message : "Not found!");
      }
    } finally {
      setIsWithdrawing(false);
    }
  }, [
    walletInfo?.id,
    withdrawAmount,
    validateWithdrawAmount,
    activeTab,
    storeDetails,
  ]);

  const handleConfirmWithdraw = useCallback(async () => {
    if (!walletInfo?.id || !pendingTransactionId) return;

    try {
      setIsWithdrawing(true);
      setError("");

      const response = await API.patch(
        `/wallet/${
          walletInfo.id
        }/withdraw-money?transactionId=${pendingTransactionId}&type=${activeTab.toUpperCase()}`
      );

      if (response.data.statusCode === 200) {
        setShowConfirmDialog(false);
        setWithdrawAmount("");
        toast({
          title: "Success",
          description: "Withdrawal successfully processed.",
        });

        // Refresh data based on active tab
        if (activeTab === "customer") {
          fetchPackageItemInfo(packageItemCode);
        } else {
          // For store tab, refresh store wallet info
          handleFindStoreWallet();
        }
      } else {
        throw new Error(response.data.Error || "Cannot process withdrawal");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setIsWithdrawing(false);
    }
  }, [
    walletInfo?.id,
    pendingTransactionId,
    toast,
    activeTab,
    handleFindStoreWallet,
  ]);

  const renderWithdrawForm = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label
          htmlFor="package-item-input"
          className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
        >
          <span>Package Item ID/RFID</span>
          {error && <AlertCircle className="w-4 h-4 text-red-500" />}
        </label>
        <Input
          id="package-item-input"
          type="text"
          value={packageItemCode}
          onChange={handlePackageItemChange}
          placeholder="Nhập ID (GUID) hoặc RFID (10 numbers)"
          className="w-full h-14 px-5 text-lg rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          disabled={isLoading}
        />
        <p className="text-sm text-gray-500">
          Enter a GUID or RFID format ID consisting of 10 digits
        </p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="rounded-xl border-2 border-red-200"
        >
          <AlertDescription className="text-base">{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : walletInfo && packageItemDetails ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl space-y-4">
            <div className="space-y-2">
              <p className="font-medium text-gray-700 text-center text-lg">
                Customer Information
              </p>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Name:{" "}
                  <span className="font-semibold text-gray-900">
                    {packageItemDetails.cusName}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Phone:{" "}
                  <span className="font-semibold text-gray-900">
                    {packageItemDetails.phoneNumber}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  ID/Passport:{" "}
                  <span className="font-semibold text-gray-900">
                    {packageItemDetails.cusCccdpassport}
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-100 space-y-4 w-full">
              <div className="flex items-end justify-between w-full">
                <p className="text-sm font-normal text-gray-700">
                  Available Balance
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-xl font-bold text-gray-900">
                    {walletInfo.balance.toLocaleString(FORMAT_LOCALE)}
                  </p>
                  <span className="text-xs font-semibold text-gray-600">
                    VND
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between w-full">
                <p className="text-sm font-normal text-gray-700">
                  Balance Can Withdraw
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-xl font-bold text-emerald-600">
                    {vcardData?.balanceCanWithdraw.toLocaleString(
                      FORMAT_LOCALE
                    )}
                  </p>
                  <span className="text-xs font-semibold text-gray-600">
                    VND
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between w-full max-w-full">
                <p className="text-sm font-normal text-gray-700">
                  Balance Need To Use Before Withdraw
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-xl font-bold text-orange-600">
                    {vcardData?.balanceNeedToUseBeforeWithdraw.toLocaleString(
                      FORMAT_LOCALE
                    )}
                  </p>
                  <span className="text-xs font-semibold text-gray-600">
                    VND
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="amount-input"
              className="text-sm font-semibold text-gray-700"
            >
              Withdrawal Amount (VND)
            </label>
            <Input
              id="amount-input"
              type="text"
              value={formatAmount(withdrawAmount)}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full h-14 px-5 text-lg rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right"
            />
          </div>

          <Button
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-xl flex items-center justify-center space-x-2"
            onClick={handleRequestWithdraw}
            disabled={!withdrawAmount || isWithdrawing}
          >
            {isWithdrawing ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <>
                <ArrowDownFromLine className="w-5 h-5" />
                <span>Withdraw Funds</span>
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );

  const renderStoreTab = () => {
    return (
      <div className="space-y-6">
        {/* <div className="space-y-3">
          <label
            htmlFor="store-name"
            className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
          >
            <span>Store Name</span>
            {error && <AlertCircle className="w-4 h-4 text-red-500" />}
          </label>
          <Input
            id="store-name"
            type="text"
            value={storeName}
            onChange={handleStoreNameChange}
            placeholder="Store Name"
            className="w-full h-14 px-5 text-lg rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            disabled={isLoading}
          />
        </div> */}

        <div className="space-y-3">
          <label
            htmlFor="store-phone"
            className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
          >
            <span>Store Phone</span>
            {error && <AlertCircle className="w-4 h-4 text-red-500" />}
          </label>
          <Input
            id="store-phone"
            type="text"
            value={storePhone}
            onChange={handleStorePhoneChange}
            placeholder="Store Phone"
            className="w-full h-14 px-5 text-lg rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            disabled={isLoading}
          />
        </div>

        <Button
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-xl flex items-center justify-center space-x-2"
          onClick={handleFindStoreWallet}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Store className="w-5 h-5" />
              <span>Find Store</span>
            </>
          )}
        </Button>

        {error && (
          <Alert
            variant="destructive"
            className="rounded-xl border-2 border-red-200"
          >
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          walletInfo &&
          storeDetails && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl space-y-4">
                <div className="space-y-2">
                  <p className="font-medium text-gray-700 text-center text-lg">
                    Store Information
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Name:{" "}
                      <span className="font-semibold text-gray-900">
                        {storeDetails.name}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone:{" "}
                      <span className="font-semibold text-gray-900">
                        {storeDetails.phoneNumber}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Address:{" "}
                      <span className="font-semibold text-gray-900">
                        {storeDetails.address}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-100">
                  <div className="space-y-4">
                    {storeDetails.status === 3 ? (
                      <>
                        <Alert className="bg-yellow-50 border-yellow-200">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800">
                            This store has been blocked. Only the final
                            settlement amount can be withdrawn.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-4 w-full">
                          <div className="flex items-end justify-between w-full">
                            <p className="text-sm font-normal text-gray-700">
                              Final Settlement Amount
                            </p>
                            <div className="flex items-baseline space-x-2">
                              <p className="text-xl font-bold text-emerald-600">
                                {storeDetails.amountCanWithdraw.toLocaleString(
                                  FORMAT_LOCALE
                                )}
                              </p>
                              <span className="text-xs font-semibold text-gray-600">
                                VND
                              </span>
                            </div>
                          </div>

                          <div className="flex items-end justify-between w-full">
                            <p className="text-sm font-normal text-gray-700">
                              Total Amount Transferred
                            </p>
                            <div className="flex items-baseline space-x-2">
                              <p className="text-xl font-bold text-blue-600">
                                {storeDetails.amountTransferred.toLocaleString(
                                  FORMAT_LOCALE
                                )}
                              </p>
                              <span className="text-xs font-semibold text-gray-600">
                                VND
                              </span>
                            </div>
                          </div>

                          <div className="flex items-end justify-between w-full max-w-full">
                            <p className="text-sm font-normal text-gray-700">
                              Amount Withdrawn
                            </p>
                            <div className="flex items-baseline space-x-2">
                              <p className="text-xl font-bold text-blue-600">
                                {storeDetails.amoutWithdrawed.toLocaleString(
                                  FORMAT_LOCALE
                                )}
                              </p>
                              <span className="text-xs font-semibold text-gray-600">
                                VND
                              </span>
                            </div>
                          </div>

                          <div className="flex items-end justify-between w-full max-w-full">
                            <p className="text-sm font-normal text-gray-700">
                              Amount Can Withdraw
                            </p>
                            <div className="flex items-baseline space-x-2">
                              <p className="text-xl font-bold text-orange-600">
                                {storeDetails.amountCanWithdraw.toLocaleString(
                                  FORMAT_LOCALE
                                )}
                              </p>
                              <span className="text-xs font-semibold text-gray-600">
                                VND
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="pt-2 space-y-4 w-full">
                        <div className="flex items-end justify-between w-full">
                          <p className="text-sm font-normal text-gray-700">
                            Available Balance
                          </p>
                          <div className="flex items-baseline space-x-2">
                            <p className="text-xl font-bold text-gray-900">
                              {walletInfo.balance.toLocaleString(FORMAT_LOCALE)}
                            </p>
                            <span className="text-xs font-semibold text-gray-600">
                              VND
                            </span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between w-full">
                          <p className="text-sm font-normal text-gray-700">
                            Total Amount Transferred
                          </p>
                          <div className="flex items-baseline space-x-2">
                            <p className="text-xl font-bold text-blue-600">
                              {storeDetails.amountTransferred.toLocaleString(
                                FORMAT_LOCALE
                              )}
                            </p>
                            <span className="text-xs font-semibold text-gray-600">
                              VND
                            </span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between w-full max-w-full">
                          <p className="text-sm font-normal text-gray-700">
                            Amount Withdrawn
                          </p>
                          <div className="flex items-baseline space-x-2">
                            <p className="text-xl font-bold text-blue-600">
                              {storeDetails.amoutWithdrawed.toLocaleString(
                                FORMAT_LOCALE
                              )}
                            </p>
                            <span className="text-xs font-semibold text-gray-600">
                              VND
                            </span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between w-full max-w-full">
                          <p className="text-sm font-normal text-gray-700">
                            Amount Can Withdraw
                          </p>
                          <div className="flex items-baseline space-x-2">
                            <p className="text-xl font-bold text-orange-600">
                              {storeDetails.amountCanWithdraw.toLocaleString(
                                FORMAT_LOCALE
                              )}
                            </p>
                            <span className="text-xs font-semibold text-gray-600">
                              VND
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Show withdrawal form only if store is not blocked or has settlement amount */}
              {(storeDetails.status !== 3 ||
                storeDetails.amountCanWithdraw > 0) && (
                <>
                  {storeDetails.amountCanWithdraw === 0 ? (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        You cannot withdraw at this time. Available withdrawal
                        amount is 0.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <label
                          htmlFor="amount-input"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Withdrawal Amount (VND)
                        </label>
                        <Input
                          id="amount-input"
                          type="text"
                          value={formatAmount(withdrawAmount)}
                          onChange={handleAmountChange}
                          placeholder="0"
                          className="w-full h-14 px-5 text-lg rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right"
                          disabled={isSettling}
                        />
                      </div>

                      <Button
                        className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-xl flex items-center justify-center space-x-2"
                        onClick={handleRequestWithdraw}
                        disabled={
                          !withdrawAmount || isWithdrawing || isSettling
                        }
                      >
                        {isWithdrawing ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <>
                            <ArrowDownFromLine className="w-5 h-5" />
                            <span>Withdraw Funds</span>
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          )
        )}
      </div>
    );
  };
  return (
    <div className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-xl rounded-2xl shadow-lg p-8 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <Wallet className="w-8 h-8 text-blue-600" />

            <h1 className="text-3xl font-bold text-gray-900">Withdraw Money</h1>
          </div>
          <p className="text-base text-center text-gray-600">
            Select your account type and enter your ID to withdraw funds
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (value === "store") {
              handleStoreTabChange();
            } else {
              setActiveTab(value);
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger
              value="customer"
              className="flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Customer</span>
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center space-x-2">
              <Store className="w-4 h-4" />
              <span>Store</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer">{renderWithdrawForm()}</TabsContent>

          <TabsContent value="store">{renderStoreTab()}</TabsContent>
        </Tabs>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-lg rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Confirm Withdrawal
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-6">
            {packageItemDetails && (
              <div className="text-left space-y-2 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {activeTab === "customer" ? "Customer" : "Store"}:{" "}
                  <span className="font-semibold text-gray-900">
                    {packageItemDetails.cusName}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Phone:{" "}
                  <span className="font-semibold text-gray-900">
                    {packageItemDetails.phoneNumber}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  ID/Passport:{" "}
                  <span className="font-semibold text-gray-900">
                    {packageItemDetails.cusCccdpassport}
                  </span>
                </p>
              </div>
            )}
            {storeDetails && (
              <div className="text-left space-y-2 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Store:{" "}
                  <span className="font-semibold text-gray-900">
                    {storeDetails.name}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Phone:{" "}
                  <span className="font-semibold text-gray-900">
                    {storeDetails.shortName}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Address:{" "}
                  <span className="font-semibold text-gray-900">
                    {storeDetails.address}
                  </span>
                </p>
              </div>
            )}
            <p className="text-gray-600 text-lg">
              Please confirm that you want to withdraw:
            </p>
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-3xl font-bold text-blue-900">
                {parseInt(withdrawAmount).toLocaleString(FORMAT_LOCALE)} VND
              </p>
            </div>
          </div>
          <DialogFooter className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 h-12 text-base font-medium rounded-xl"
              disabled={isWithdrawing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmWithdraw}
              className="flex-1 h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 rounded-xl"
              disabled={isWithdrawing}
            >
              {isWithdrawing && (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              )}
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawMoney;
