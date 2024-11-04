export interface Package {
  id: string;
  name: string;
  description: null;
  price: number;
  duration: number;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  imageUrl: null;
  marketZone: null;
  statusCode: number;
  // messageResponse: null;
  // data: null;
}

export interface PackageDetail {
  id: string;
  imageUrl: string | null;
  name: string;
  description: string | null;
  price: number;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  duration: number;
  packageTypeId: string;
  packageType: null;
  orders: [null];
  packageDetails: [
    {
      id: string;
      packageId: string;
      walletTypeId: string;
      startMoney: number;
      crDate: string;
      package: null;
      walletType: null;
    }
  ];
  packageItems: [
    {
      id: string;
      packageId: string;
      crDate: string;
      upsDate: string;
      name: string;
      cccdpassport: string;
      email: string;
      status: string;
      gender: string;
      isAdult: true;
      walletId: string;
      isChanged: boolean;
      phoneNumber: string;
      package: null;
      wallet: null;
      customerMoneyTransfers: [];
      deposits: [];
      orders: [];
      reports: [];
    }
  ];
  packageOrders: [
    {
      id: string;
      orderId: string;
      packageId: string;
      cusName: string;
      cusCccdpassport: string;
      phoneNumber: string;
      cusEmail: string;
      crDate: string;
      upsDate: string;
      status: string; //COMPLETED
      order: null;
      package: null;
    }
  ];
}

export interface PackagePost {
  imageUrl: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  packageTypeId: string;
  walletTypeId: string;
  moneyStart: number;
}

export interface PackagePatch {
  imageUrl: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}
