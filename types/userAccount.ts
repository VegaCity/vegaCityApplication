export interface UserAccount {
  fullName: string;
  phoneNumber: string;
  cccd: string;
  address: string;
  email: string;
  description: string;
  roleName: string;
}

export interface UserAccountPostPatch extends UserAccount {
  apiKey: "5f728deb-b2c3-4bac-9d9c-41a11e0acccc";
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
