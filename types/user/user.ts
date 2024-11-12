export interface Users {
  id: string;
  fullName: string;
  phoneNumber: string;
  birthday?: string | null;
  storeId?: string | null;
  crDate: string;
  upsDate: string;
  gender: number;
  cccdPassport: string;
  imageUrl?: string | null;
  email: string;
  roleId: string;
  description?: string;
  address: string;
  status: number;
}

export interface GetUserById {
  id: string;
  fullName?: string | null;
  phoneNumber: string;
  birthday?: string | null;
  storeId?: string | null;
  crDate: string;
  upsDate: string;
  gender: number;
  cccdPassport: string;
  imageUrl?: string | null;
  marketZoneId: string;
  email: string;
  password?: string | null;
  roleId: string;
  description?: string | null;
  isChange: boolean;
  address: string;
  status: 0;
  marketZone: null;
  role: {
    id: string;
    name: string;
    deflag: boolean;
    users: [null];
  };
  orders: [];
  reports: [];
  transactions: [];
  userRefreshTokens: [];
  userSessions: [];
  userStoreMappings: [];
  wallets: [
    {
      id: string;
      walletTypeId: string;
      crDate: string;
      upsDate: string;
      balance: 0;
      balanceHistory: 0;
      deflag: boolean;
      userId: string;
      storeId: null;
      startDate: null;
      endDate: null;
      store: null;
      user: null;
      walletType: null;
      deposits: [];
      packageItems: [];
      transactions: [];
    }
  ];
}

export interface UserProfileFormData {
  fullName: string;
  address: string;
  description: string | null;
  phoneNumber: string;
  birthday: string | null;
  gender: number;
  cccdPassport: string;
  imageUrl: string | null;
}

export interface UserPatch {
  fullName: string;
  address: string;
  description: string;
  phoneNumber: string;
  birthday: string;
  gender: number;
  cccdPassport: string;
  imageUrl: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}
