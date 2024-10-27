import { API } from "@/components/services/api";

import { Transaction } from "@/types/transaction";

interface TrasactionPageSize {
  page?: number;
  size?: number;
}

export const TransactionServices = {
  getTransactions({ page, size }: TrasactionPageSize) {
    return API.get("/transactions", {
      params: {
        page,
        size,
      },
    });
  },
};
