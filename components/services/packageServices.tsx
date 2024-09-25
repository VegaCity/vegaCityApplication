import { API } from "@/components/services/api";
import { Packages } from "@/types/package";

interface PackagePageSize {
    page?: number;
    size?: number;
}

export const PackageServices = {
    getPackages({ page, size }: PackagePageSize) {
        return API.get('/packages', {
            params: {
                page,
                size,
            }
        });
    },
    getPackageById(id: string) {
        return API.get(`/package/${id}`);
    },
    uploadPackage(packageData: Packages) {
        return API.post('/package/', packageData);
    },
    editPackage(packageId: string, packageData: Packages) {
        return API.patch(`/package/${packageId}`, packageData); 
    },
    deletePackageById(id: string) {
        return API.delete(`/package/${id}`);
    },
};
