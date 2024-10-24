export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2,
}

export enum UserStatus {
  Active = 0,
  Inactive = 1,
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
    case "male":
      return Gender.Male; // returns 0
    case "female":
      return Gender.Female; // returns 1
    case "other":
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

export interface UserAccount {
  fullName: string;
  phoneNumber: string;
  cccdPassport: string;
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
  cccdPassport: string;
  imageUrl?: string | null;
}

export interface UserAccountGet extends UserAccount {
  id: string;
  birthday: string | null;
  storeId: string;
  crDate: string;
  upsDate: string;
  gender: number;
  imageUrl?: string | null;
  roleId: string;
  status: number;
}
