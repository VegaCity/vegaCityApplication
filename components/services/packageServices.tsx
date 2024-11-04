import { API } from "@/components/services/api";
import { PackagePostPatch } from "@/types/packageType/package";

interface PackagePageSize {
  page?: number;
  size?: number;
}

export const PackageServices = {
  getPackages({ page, size }: PackagePageSize) {
    return API.get("/packages", {
      params: {
        page,
        size,
      },
    });
  },
  getPackageById(id: string) {
    return API.get(`/package/${id}`);
  },
  uploadPackage(packageData: PackagePostPatch) {
    return API.post("/package/", packageData);
  },
  editPackage(packageId: string, packageData: PackagePostPatch) {
    return API.patch(`/package/${packageId}`, packageData);
  },
  deletePackageById(id: string) {
    return API.delete(`/package/${id}`);
  },
};
