import { API } from "@/components/services/api";
import { PackagePatch, PackagePost } from "@/types/packageType/package";

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
  uploadPackage(packageData: PackagePost) {
    return API.post("/package/", packageData);
  },
  editPackage(packageId: string, packageData: PackagePatch) {
    return API.patch(`/package/${packageId}`, packageData);
  },
  deletePackageById(id: string) {
    return API.delete(`/package/${id}`);
  },
};
