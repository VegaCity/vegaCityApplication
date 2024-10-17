export interface UserEtag {
  fullName: string;
  phoneNumber: string;
  cccd: string;
  gender: 0;
  etagTypeId: string;
  startDate: string;
  endDate: string;
}

export interface UserEtagPatch {
  fullname: string;
  phoneNumber: string;
  imageUrl: string;
  gender: 0;
  dateOfBirth: string;
  cccd: string;
}
