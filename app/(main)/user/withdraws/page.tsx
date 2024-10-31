"use client";
import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowDownToLine, Loader2, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { API } from "@/components/services/api";
import { useToast } from "@/components/ui/use-toast";
import { WithdrawMoneyProps } from "@/types/withdraw";

interface EtagDetails {
  id: string;
  etagId: string;
  fullName: string;
  phoneNumber: string;
  cccdPassport: string;
  birthday: string;
  createAt: string;
  updateAt: string;
}
interface WalletInfo {
  id: string;
  balance: number;
}

const ETAG_CODE_PATTERN = /^VGC[0-9]{16,19}$/;
const MIN_WITHDRAWAL = 50000;
const FORMAT_LOCALE = "vi-VN";

const WithdrawMoney = () => {
  const onSuccess = () => {};
  const { toast } = useToast();
  const [etagCode, setEtagCode] = useState("");
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [etagDetails, setEtagDetails] = useState<EtagDetails | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState("");
  const [pendingTransactionId, setPendingTransactionId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateEtagCode = useCallback((code: string): boolean => {
    return ETAG_CODE_PATTERN.test(code);
  }, []);

  const validateWithdrawAmount = useCallback(
    (amount: number): string | null => {
      if (isNaN(amount) || amount <= 0) {
        return "Số tiền rút phải lớn hơn 0";
      }
      if (amount < MIN_WITHDRAWAL) {
        return `Số tiền rút tối thiểu là ${MIN_WITHDRAWAL.toLocaleString(
          FORMAT_LOCALE
        )} VND`;
      }
      if (!walletInfo?.balance || amount > walletInfo.balance) {
        return "Số tiền rút không được vượt quá số dư hiện tại";
      }
      if (amount % 1000 !== 0) {
        return "Số tiền rút phải là bội số của 1,000 VND";
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

  const fetchEtagInfo = useCallback(
    async (code: string) => {
      if (!validateEtagCode(code)) {
        setError("Mã E-tag không hợp lệ. Vui lòng kiểm tra lại.");
        setWalletInfo(null);
        setEtagDetails(null);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const response = await API.get("/etag", { params: { etagCode: code } });
        if (response.data.statusCode === 200 && response.data.data) {
          const { data } = response.data;
          // Update wallet info
          setWalletInfo({
            id: data.etag.wallet.id,
            balance: data.etag.wallet.balance,
          });
          const details = data.etag.etagDetails[0];
          setEtagDetails({
            id: details.id,
            etagId: details.etagId,
            fullName: details.fullName,
            phoneNumber: details.phoneNumber,
            cccdPassport: details.cccdPassport,
            birthday: details.birthday,
            createAt: details.createAt,
            updateAt: details.updateAt,
          });
        } else {
          throw new Error("Không tìm thấy thông tin E-tag");
        }
      } catch (err) {
        setError("Đã có lỗi xảy ra .Vui lòng kiểm tra lại.");
        setWalletInfo(null);
        setEtagDetails(null);
      } finally {
        setIsLoading(false);
      }
    },
    [validateEtagCode]
  );

  const handleEtagChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const code = e.target.value.toUpperCase();
      setEtagCode(code);
      if (code.length >= 6) {
        fetchEtagInfo(code);
      } else {
        setWalletInfo(null);
        setEtagDetails(null);
      }
    },
    [fetchEtagInfo]
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
  }, [walletInfo?.id, withdrawAmount, validateWithdrawAmount]);

  const handleConfirmWithdraw = useCallback(async () => {
    if (!walletInfo?.id || !pendingTransactionId) return;

    try {
      setIsWithdrawing(true);
      setError("");

      const response = await API.patch(
        `/wallet/${walletInfo.id}/withdraw-money?transactionId=${pendingTransactionId}`
      );

      if (response.data.statusCode === 200) {
        setShowConfirmDialog(false);
        toast({
          title: "Thành công",
          description: "Rút tiền thành công!",
        });
        onSuccess?.();
        setTimeout(() => window.location.reload(), 2500);
      } else {
        throw new Error(
          response.data.messageResponse || "Không thể thực hiện giao dịch"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Đã có lỗi xảy ra",
      });
    } finally {
      setIsWithdrawing(false);
    }
  }, [walletInfo?.id, pendingTransactionId, onSuccess, toast]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <Wallet className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Withdraw Money</h1>
          </div>
          <p className="text-base text-center text-gray-600">
            Enter your E-tag code to access your wallet and withdraw funds
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label
              htmlFor="etag-input"
              className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
            >
              <span>E-tag Code</span>
              {error && <AlertCircle className="w-4 h-4 text-red-500" />}
            </label>
            <Input
              id="etag-input"
              type="text"
              value={etagCode}
              onChange={handleEtagChange}
              placeholder="VGCxxxxxxxxxx"
              className="w-full h-14 px-5 text-lg rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              disabled={isLoading}
            />
          </div>

          {(error || successMessage) && (
            <Alert
              variant={successMessage ? "default" : "destructive"}
              className="rounded-xl border-2 border-blue-200"
            >
              <AlertDescription className="text-base">
                {successMessage || error}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : walletInfo && etagDetails ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl space-y-4">
                <div className="space-y-2">
                  <p className=" font-medium text-gray-700 text-center text-lg">
                    Customer Information
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Name:{" "}
                      <span className="font-semibold text-gray-900">
                        {etagDetails.fullName}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone:{" "}
                      <span className="font-semibold text-gray-900">
                        {etagDetails.phoneNumber}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      ID/Passport:{" "}
                      <span className="font-semibold text-gray-900">
                        {etagDetails.cccdPassport}
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
                    <span className="text-xl font-semibold text-gray-600">
                      VND
                    </span>
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
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-lg rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Confirm Withdrawal
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-6">
            {etagDetails && (
              <div className="text-left space-y-2 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Customer:{" "}
                  <span className="font-semibold text-gray-900">
                    {etagDetails.fullName}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Phone:{" "}
                  <span className="font-semibold text-gray-900">
                    {etagDetails.phoneNumber}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  ID/Passport:{" "}
                  <span className="font-semibold text-gray-900">
                    {etagDetails.cccdPassport}
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
