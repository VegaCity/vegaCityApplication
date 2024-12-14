export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  email: string;
  startDate: string;
  endDate: string;
  totalCashReceive: number;
  totalFinalAmountOrder: number;
  totalQuantityOrder: number;
  totalWithrawCash: number;
  zoneId: string;
  status: string; //Active
  roleName: string;
}

interface User {
  id: string;
  fullName: string | null;
  phoneNumber: number;
  birthday: string | null;
  storeId: string | null;
  crDate: string;
  upsDate: string;
  gender: number;
  cccdPassport: number;
  imageUrl: string | null;
  marketZoneId: string;
  email: string;
  password: string | null;
  roleId: string;
  description: string | null;
  isChange: boolean;
  address: string;
  status: number;
  isChangeInfo: boolean;
  marketZone: null;
  role: null;
  orders: [];
  reports: [];
  transactions: [];
  userRefreshTokens: [];
  userSessions: [null];
  userStoreMappings: [];
  wallets: [];
}

interface Zone {
  id: string;
  marketZoneId: string;
  name: string;
  location: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  marketZone: null;
  packageTypes: [];
  stores: [];
  userSessions: [null];
}

export interface UserSessionDetail extends UserSession {
  user: User;
  zone: Zone;
  qrCode: null;
}

export interface UserSessionPost {
  startDate: string;
  endDate: string;
  zoneId: string;
}
