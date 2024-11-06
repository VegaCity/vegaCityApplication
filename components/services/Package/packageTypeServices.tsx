import { API } from "@/components/services/api";
import {
  PackageTypePost,
  PackageTypePatch,
} from "@/types/packageType/packageType";

interface PackageTypePageSize {
  page?: number;
  size?: number;
}

export const PackageTypeServices = {
  getPackageTypes({ page, size }: PackageTypePageSize) {
    return API.get("/package-types", {
      params: {
        page,
        size,
      },
    });
  },
  getPackageTypeById(id: string) {
    return API.get(`/package-type/${id}`);
  },
  uploadPackageType(packageTypeData: PackageTypePost) {
    return API.post("/package-type", packageTypeData);
  },
  editPackageType(packageTypeId: string, packageTypeData: PackageTypePatch) {
    return API.patch(`/package-type/${packageTypeId}`, packageTypeData);
  },
  deletePackageTypeById(id: string) {
    return API.delete(`/package-type/${id}`);
  },
};
