export interface UserAccount {
  fullName: string;
  phoneNumber: string;
  cccd: string;
  address: string;
  email: string;
  description?: string | null;
  roleName: string;
}

export interface UserAccountPostPatch extends UserAccount {
  apiKey: string;
}

export interface UserAccountPost {
  fullName: string;
  phoneNumber: string;
  address: string;
  description?: string | null;
  birthday: string;
  gender: number;
  cccd: string;
  imageUrl: string;
}

export interface UserAccountGet extends UserAccount {
  id: string;
  birthday: string | null;
  storeId: string;
  crDate: string;
  upsDate: string;
  gender: 2;
  imageUrl: string | null;
  roleId: string;
  status: 0;
}
