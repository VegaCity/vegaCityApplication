"use client";
import React, { useCallback, useState } from "react";
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
  ArrowDownToLine,
  Loader2,
  Store,
  User,
  Wallet,
} from "lucide-react";

type PackageItemDetail = {
  id: string;
  packageId: string;
  name: string;
  phoneNumber: string;
  cccdpassport: string;
  type?: "CUSTOMER" | "STORE";
};

interface WalletInfo {
  id: string;
  balance: number;
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
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState("");
  const [pendingTransactionId, setPendingTransactionId] = useState("");

  const validateWithdrawAmount = useCallback(
    (amount: number): string | null => {
      if (isNaN(amount) || amount <= 0) {
        return "Money must be a positive number";
      }
      if (amount < MIN_WITHDRAWAL) {
        return `Money must be at least ${MIN_WITHDRAWAL.toLocaleString(
          FORMAT_LOCALE
        )} VND`;
      }
      if (!walletInfo?.balance || amount > walletInfo.balance) {
        return "Money must be less than or equal to your balance";
      }
      if (amount % 10000 !== 0) {
        return "Money must be a multiple of 10,000 VND";
      }
      return null;
    },
    [walletInfo?.balance]
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
    async (packageItemCode: string) => {
      try {
        setIsLoading(true);
        setError("");
        // Add type parameter to the API call based on active tab
        const response = await API.get(
          `/package-item/?id=${packageItemCode}&type=${activeTab.toUpperCase()}`
        );

        if (response.data?.statusCode === 200) {
          const data = response.data.data;

          if (data) {
            if (data.wallet) {
              setWalletInfo({
                id: data.walletId,
                balance: data.wallet.balance,
              });
            }

            setPackageItemDetails({
              id: data.id,
              packageId: data.packageId,
              name: data.name,
              phoneNumber: data.phoneNumber,
              cccdpassport: data.cccdpassport,
              type: activeTab.toUpperCase() as "CUSTOMER" | "STORE",
            });
          } else {
            throw new Error("Package-Item data structure is missing.");
          }
        } else {
          throw new Error(
            response.data?.messageResponse ||
              "Không tìm thấy thông tin Package-Item"
          );
        }
      } catch (err) {
        console.error("Error fetching package item info:", err);
        setError("Đã có lỗi xảy ra. Vui lòng kiểm tra lại.");
        setWalletInfo(null);
        setPackageItemDetails(null);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab]
  );

  const handlePackageItemChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const id = e.target.value;
      setPackageItemCode(id);
      if (id) fetchPackageItemInfo(id);
    },
    [fetchPackageItemInfo]
  );

  const handleRequestWithdraw = useCallback(async () => {
    if (!walletInfo?.id) return;

    const amount = parseInt(withdrawAmount.replace(/,/g, ""));
    const validationError = validateWithdrawAmount(amount);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsWithdrawing(true);
      setError("");

      const response = await API.post(
        `/wallet/${walletInfo.id}/request-withdraw-money`,
        {
          amount,
          type: activeTab.toUpperCase(),
        }
      );

      if (
        response.data.statusCode === 200 &&
        response.data.data?.transactionId
      ) {
        setPendingTransactionId(response.data.data.transactionId);
        setShowConfirmDialog(true);
      } else {
        throw new Error(
          response.data.messageResponse || "Không thể tạo yêu cầu rút tiền"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setIsWithdrawing(false);
    }
  }, [walletInfo?.id, withdrawAmount, validateWithdrawAmount, activeTab]);

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
        toast({
          title: "Success",
          description: "Withdrawal successfully processed.",
        });
        setTimeout(() => window.location.reload(), 2500);
      } else {
        throw new Error(
          response.data.messageResponse || "Cannot process withdrawal"
        );
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
  }, [walletInfo?.id, pendingTransactionId, toast, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPackageItemCode("");
    setWalletInfo(null);
    setPackageItemDetails(null);
    setWithdrawAmount("");
    setError("");
  };

  const renderWithdrawForm = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label
          htmlFor="etag-input"
          className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
        >
          <span>Package Item Id</span>
          {error && <AlertCircle className="w-4 h-4 text-red-500" />}
        </label>
        <Input
          id="etag-input"
          type="text"
          value={packageItemCode}
          onChange={handlePackageItemChange}
          placeholder="xxxxxxxxxxxx"
          className="w-full h-14 px-5 text-lg rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          disabled={isLoading}
        />
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
                {activeTab === "customer"
                  ? "Customer Information"
                  : "Store Information"}
              </p>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Name:{" "}
                  <span className="font-semibold text-gray-900">
                    {packageItemDetails.name}
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
                    {packageItemDetails.cccdpassport}
                  </span>
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-blue-100">
              <p className="text-base font-medium text-gray-700">
                Available Balance
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold text-gray-900">
                  {walletInfo.balance.toLocaleString(FORMAT_LOCALE)}
                </p>
                <span className="text-xl font-semibold text-gray-600">VND</span>
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
                <ArrowDownToLine className="w-5 h-5" />
                <span>Withdraw Funds</span>
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
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
          onValueChange={handleTabChange}
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

          <TabsContent value="store">{renderWithdrawForm()}</TabsContent>
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
                    {packageItemDetails.name}
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
                    {packageItemDetails.cccdpassport}
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
