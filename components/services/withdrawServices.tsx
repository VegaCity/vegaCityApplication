"use client";

import { API } from "@/components/services/api";

interface WithdrawResponse {
  statusCode: number;
  messageResponse: string;
  data: {
    transactionId: string;
    walletId: string;
  };
}

interface RequestWithdrawMoneyParams {
  amount: number;
}

// Updated to match backend API structure
export const requestWithdrawMoney = async (
  walletId: string,
  params: RequestWithdrawMoneyParams
): Promise<WithdrawResponse> => {
  try {
    const response = await API.post<WithdrawResponse>(
      `/wallet/${walletId}/request-withdraw-money`,
      params
    );
    return response.data;
  } catch (error) {
    console.error("Failed to request money withdrawal:", error);
    throw new Error(
      "Unable to process withdrawal request. Please try again later."
    );
  }
};
export const confirmWithdrawMoney = async (
  walletId: string,
  transactionId: string
) => {
  try {
    const response = await API.patch(
      `/wallet/${walletId}/withdraw-money?transactionId=${transactionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Confirm withdraw money error:", error);
    throw error;
  }
};
