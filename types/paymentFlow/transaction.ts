export interface Transaction {
  id: string;
  type: TransactionType;
  walletId: string;
  storeId: string | null;
  status: TransactionStatus;
  isIncrease: boolean;
  description: string;
  crDate: string;
  amount: number;
  currency: Currency;
}

export enum TransactionType {
  ChargeMoney = "chargeMoney",
  WithdrawMoney = "withdrawMoney",
}

export enum TransactionStatus {
  Success = "Success",
  Failed = "Failed",
}

export enum Currency {
  VND = "VND",
}
