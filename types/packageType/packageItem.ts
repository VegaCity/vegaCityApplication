export interface PackageItem {
  id: string;
  packageId: string;
  name: string;
  cccdPassport: string;
  email: string;
  status: string; //Active
  gender: string;
  isAdult: true;
  walletId: string;
  crDate: string;
  upsDate: string;
  marketZone: null;
  statusCode: number;
  //   messageResponse: null;
  //   data: null;
}

export interface PackageItemDetail {
  id: string;
  packageId: string;
  crDate: string;
  upsDate: string;
  name: string | null;
  cccdpassport: string | null;
  email: string | null;
  status: string | null; //Active
  gender: string | null;
  isAdult: boolean;
  walletId: string | null;
  isChanged: boolean;
  phoneNumber: string | null;
  package: null;
  RFID?: string | null;
  wallet: {
    id: string;
    walletTypeId: string;
    crDate: string;
    upsDate: string;
    balance: 250000;
    balanceHistory: 250000;
    deflag: boolean;
    userId: string | null;
    storeId: string | null;
    startDate: string | null;
    endDate: string | null;
    store: null;
    user: null;
    walletType: null;
    deposits: [];
    packageItems: [null];
    transactions: [
      {
        id: string;
        type: string | null; //ChargeMoney
        walletId: string | null;
        userId: string | null;
        despositId: string | null;
        storeId: string | null;
        status: string; //Success
        isIncrease: boolean;
        description: string | null;
        crDate: string;
        upsDate: string;
        amount: number;
        currency: string; //VND
        store: null;
        user: null;
        wallet: null;
        customerMoneyTransfers: [];
        storeMoneyTransfers: [];
      }
    ];
  };
  customerMoneyTransfers: [];
  deposits: [
    {
      id: string;
      paymentType: string | null;
      name: string | null;
      isIncrease: boolean | null;
      amount: number | null;
      crDate: string | null;
      upsDate: string | null;
      packageItemId: string | null;
      walletId: string | null;
      orderId: string | null;
      order: null;
      packageItem: null;
      wallet: null;
    }
  ];
  orders: [
    {
      id: string;
      paymentType: string; //Cash
      name: string;
      totalAmount: 20000;
      crDate: string;
      upsDate: string;
      status: string; //COMPLETED
      invoiceId: string;
      storeId: string | null;
      packageItemId: string | null;
      packageId: string | null;
      userId: string;
      saleType: string; //PackageItem Charge
      package: null;
      packageItem: null;
      store: null;
      user: null;
      deposits: [];
      orderDetails: [];
      packageOrders: [];
      promotionOrders: [];
    }
  ];
  reports: [];
}

export interface PackageItemActive {
  name: string;
  cccdpassport: string;
  phoneNumber: string;
  email: string;
  gender: string;
  isAdult: boolean;
}

export interface PackageItemChargeMoney {
  cccdPassport: string;
  chargeAmount: number;
  paymentType: string;
  packageItemId: string;
  promoCode: string;
}

export interface PackageItemPayment {
  productId: string;
  quantity: number;
  note: string;
  price: number;
}

export interface PackageItemPost {
  packageId: string;
}

export interface PackageItemPatch {
  name: string;
  gender: string;
}
