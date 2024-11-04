// Interface definitions for Store and related entities
export interface Store {
  id: string;
  storeType: string | null;
  name: string;
  address: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  phoneNumber: string;
  shortName: string | null;
  email: string;
  houseId: string;
  marketZoneId: string;
  description: string | null;
  status: number;
  house: any | null;
  marketZone: any | null;
  disputeReports: any[];
  menus: Menu[];
  orders: any[];
  storeServices: any[];
  transactions: any[];
  users: User[];
  wallets: any[];
}

export interface Menu {
  id: string;
  name: string;
  crDate: string;
  deflag: boolean;
  storeId: string;
  imageUrl: string;
  address: string;
  phoneNumber: string;
  menuJson: any;
  store: Store | null;
  orderDetails: any[];
  productCategories: ProductCategory[];
}

export interface ProductCategory {
  id: string;
  name: string;
  crDate: string;
  upsDate: string;
  productJson: string;
  menuId: string;
  menu: Menu | null;
}

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  birthday: string;
  storeId: string | null;
  crDate: string;
  upsDate: string;
  gender: number;
  cccd: string;
  imageUrl: string;
  marketZoneId: string;
  email: string;
  password: string | null;
  roleId: string;
  description: string;
  isChange: boolean;
  address: string;
  status: number;
  marketZone: any | null;
  role: any | null;
  store: Store | null;
  orders: any[];
  userRefreshTokens: any[];
  wallets: any[];
}

export interface Product {
  Id: string;
  Name: string;
  ProductCategory?: string;
  Price: number;
  ImgUrl: string;
}

// Response type for the API
export interface StoreResponse {
  statusCode: number;
  messageResponse: string;
  data: {
    store: Store;
  };
}

// Helper function to parse menu JSON
export const parseMenuJson = (menuJson: string): Product[] => {
  try {
    return JSON.parse(menuJson);
  } catch (error) {
    console.error("Error parsing menu JSON:", error);
    return [];
  }
};

// Helper function to parse product JSON
export const parseProductJson = (productJson: string): Product[] => {
  try {
    return JSON.parse(productJson);
  } catch (error) {
    console.error("Error parsing product JSON:", error);
    return [];
  }
};
