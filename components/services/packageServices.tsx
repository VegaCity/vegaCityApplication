import { API } from "@/components/services/api"
import { Packages } from "@/types/package";

interface PackagePageSize {
    page?: number,
    size?: number,
}

export const PackageServices = {
    getPackages({page, size}: PackagePageSize){
        return API.get('/packages', {
            params: {
                page,
                size,
            }
        })
    },
    getPackageById(id: String){
        return API.get(`/packages/${id}`);
    },
    uploadPackage(packageData: Packages){
        return API.post('/packages/', packageData);
    },
    editPackage(packageId: String, packageData: Packages){
        const packageEditData = {packageId, packageData};
        return API.patch(`/packages/${packageId}`, packageEditData)
    },
    deletePackageById(id: String){
        return API.delete(`/packages/${id}`);
    },
}