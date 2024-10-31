export interface Users {
  id: string;
  fullName: string;
  phoneNumber: string;
  birthday: string | null;
  storeId: string | null;
  crDate: string;
  upsDate: string;
  gender: number;
  cccdPassport: string;
  imageUrl: string | null;
  email: string;
  roleId: string;
  description: string;
  address: string;
  status: number;
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

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}
