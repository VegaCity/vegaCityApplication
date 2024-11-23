import { WalletType } from "@/types/walletType/walletType";
import {
  StoreOwner,
  StoreStatusTypeEnum,
  StoreTypeEnum,
} from "@/types/store/storeOwner";

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2,
}

export enum UserStatus {
  Active = 0,
  Disable = 1,
  Ban = 2,
  PendingVerify = 3,
}

//handle User status from number to string
export const handleUserStatusFromBe = (status: number): string => {
  switch (status) {
    case 0:
    case 1:
    case 2:
    case 3:
      return UserStatus[status]; //Returns the enum label as string
    default:
      throw new Error("Invalid UserStatus input"); // Optional: handle invalid input
  }
};

export const handleGenderToBe = (gender: string): number => {
  switch (gender.toLowerCase()) {
    case "Male":
      return Gender.Male; // returns 0
    case "Female":
      return Gender.Female; // returns 1
    case "Other":
      return Gender.Other; // returns 2
    default:
      throw new Error("Invalid gender input"); // Optional: handle invalid input
  }
};

export const handleGenderToFe = (gender: number): string => {
  switch (gender) {
    case 0:
      return "Male"; // returns Male
    case 1:
      return "Female"; // returns Female
    case 2:
      return "Other"; // returns Other
    default:
      throw new Error("Invalid gender input"); // Optional: handle invalid input
  }
};

//Gender
interface UserGender {
  id: number;
  name: string;
}
export const genders: UserGender[] = [
  {
    id: 0,
    name: "Male",
  },
  {
    id: 1,
    name: "Female",
  },
  {
    id: 2,
    name: "Other",
  },
];

//Approve Status
interface AppropveStatusProps {
  value: string;
  name: string;
}

export const approveStatuses: AppropveStatusProps[] = [
  { value: "APPROVED", name: "Approve" },
  { value: "REJECTED", name: "Reject" },
];

export interface UserAccount {
  id: string;
  birthday: string | null;
  storeId: string | null;
  crDate: string;
  upsDate: string;
  gender: Gender | number;
  imageUrl: string | null;
  roleId: string;
  status: UserStatus | number;
  fullName: string;
  phoneNumber: string;
  cccdPassport: string;
  address: string;
  email: string;
  description?: string | null;
  roleName: string;
  registerStoreType: StoreTypeEnum | number | null;
}

export interface UserAccountPost {
  apiKey: string;
  fullName: string;
  phoneNumber: string;
  cccdPassport: string;
  address: string;
  email: string;
  description?: string | null;
  roleName: string;
  registerStoreType?: StoreTypeEnum | number | null;
  imageUrl?: string | null;
}

export interface UserAccountPatch {
  fullName: string;
  phoneNumber: string;
  address: string;
  description?: string | null;
  gender: Gender | number;
  cccdPassport: string;
  imageUrl?: string | null;
}

interface UserStoreMapping extends StoreOwner {
  id: string;
  storeId: string;
  userId: string;
  store: {
    id: string;
    storeType: StoreTypeEnum | number;
    name: string;
    address: string;
    crDate: string;
    upsDate: string;
    deflag: boolean;
    phoneNumber: string;
    shortName: null;
    email: string;
    zoneId: string;
    marketZoneId: string;
    description: null;
    status: StoreStatusTypeEnum | number;
    zone: null;
    menus: [];
    orders: [];
    productCategories: [];
    storeMoneyTransfers: [];
    transactions: [];
    wallets: [];
  };
}

export interface UserAccountGetDetail {
  id: string;
  birthday?: string | null;
  storeId: string;
  crDate: string;
  upsDate: string;
  gender: number;
  imageUrl?: string | null;
  roleId: string;
  status: UserStatus | number;
  fullName: string;
  phoneNumber: string;
  cccdPassport: string;
  address: string;
  email: string;
  description?: string | null;
  roleName: string;
  registerStoreType: StoreTypeEnum | number | null;
  role: {
    id: string;
    name: string;
    deflag: boolean;
  };
  userStoreMappings: UserStoreMapping[];
  wallets: {
    id: string;
    name: string;
    crDate: string;
    upsDate: string;
    balance: number;
    balanceHistory: number;
    balanceStart: number;
    userId: string;
    storeId: string | null;
    walletTypeId: string;
    packageOrderId: null;
    startDate: string | null;
    endDate: string | null;
    deflag: false;
    packageOrder: null;
    store: null;
    user: null;
    walletType: WalletType;
    transactions: [];
  }[];
}

export interface UserAccountDetail {
  id: string;
  fullName: string | null;
  phoneNumber: string;
  birthday: string | null;
  storeId: string | null;
  crDate: string;
  upsDate: string;
  gender: Gender | number;
  cccdPassport: string;
  imageUrl?: string | null;
  marketZoneId: string;
  email: string;
  password: string | null;
  roleId: string;
  description?: string | null;
  isChange: boolean;
  address: string;
  status: UserStatus | number;
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
      name: string | null;
      walletTypeId: string;
      crDate: string;
      upsDate: string;
      balance: number;
      balanceHistory: number;
      balanceStart: number;
      deflag: boolean;
      userId: string;
      storeId: null;
      startDate: null;
      endDate: null;
      packageOrderId: string | null;
      packageOrder: null;
      store: null;
      user: null;
      walletType: null;
      transactions: [];
    }
  ];
}

export interface UserApprove {
  locationZone: string;
  storeType: StoreTypeEnum | number;
  storeName: string;
  storeAddress: string;
  phoneNumber: string;
  storeEmail: string;
  approvalStatus: "APPROVED" | "REJECTED" | string;
}

export interface UserApproveSubmit extends UserApprove {
  id: string;
}

//Resolving closing request to User (store)
export interface UserApproveCloseRequest {
  storeName: string;
  phoneNumber: string;
  status: "APPROVED" | "REJECTED" | string; //wait backend change REJECT TO REJECTED
}
