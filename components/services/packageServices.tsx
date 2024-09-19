import { API } from "@/components/services/api"
import { Package } from "@/types/package";

export const PackageServices = {
    getPackage(){
        return API.get('/packages')
    },
    getPackageById(id: String){
        return API.get(`/packages/${id}`);
    },
    uploadPackage(packageData: Package){
        return API.post('/packages/', packageData);
    },
    editPackage(packageId: String, packageData: Package){
        const packageEditData = {packageId, packageData};
        return API.patch(`/packages/${packageId}`, packageEditData)
    },
    deletePackageById(id: String){
        return API.delete(`/packages/${id}`);
    },
}