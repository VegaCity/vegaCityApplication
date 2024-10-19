export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2,
}

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
  imageUrl?: string | null;
}

export interface UserAccountGet extends UserAccount {
  id: string;
  birthday: string | null;
  storeId: string;
  crDate: string;
  upsDate: string;
  gender: 2;
  imageUrl?: string | null;
  roleId: string;
  status: 0;
}
