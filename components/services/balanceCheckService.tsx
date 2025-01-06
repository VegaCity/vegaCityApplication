import { API } from "@/components/services/api";

import { BalanceCheckType } from "@/types/balanceCheck";

interface BalanceCheckPageSize {
  page?: number;
  size?: number;
}

export const BalanceCheckServices = {
  getBalanceChecks({ page, size }: BalanceCheckPageSize) {
    return API.get("/wallet/end-day-check", {
      params: {
        page,
        size,
      },
    });
  },
};
