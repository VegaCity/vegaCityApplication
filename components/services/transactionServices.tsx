import { API } from "@/components/services/api";

import { Transaction } from "@/types/paymentFlow/transaction";

interface TrasactionPageSize {
  page?: number;
  size?: number;
}
interface GetPackageItemByIdParams {
  packageOrderId?: string;
  rfId?: string;
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
  getTransactionDrawMoneyById({
    packageOrderId,
    rfId,
  }: GetPackageItemByIdParams) {
    if (packageOrderId) {
      return API.get(
        `/package-item/get-transaction-withdraw?packageOrderId=${packageOrderId}`
      );
    } else if (rfId) {
      return API.get(`/package-item/get-transaction-withdraw?rfId=${rfId}`);
    } else {
      throw new Error("Either 'id' or 'rfId' must be provided.");
    }
  },
};
