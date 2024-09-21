import { API } from "@/components/services/api"
import { Users } from '@/types/user';

interface UserPageSize {
    page?: number,
    size?: number,
}
export const UserServices = {
    
        getUsers({ page, size }: UserPageSize) {
            return API.get('/users', {
                params: {
                    page,
                    size,
                }
            });
        },
        getUserById(userId: string) {
            return API.get(`/user/${userId}`);
        },
        uploadPackage(userData: Users) {
            return API.post('/user/', userData);
        },
        editPackage(userId: string, userData: Users) {
            return API.patch(`/user/${userId}`, userData); 
        },
        deletePackageById(id: string) {
            return API.delete(`/user/${id}`);
        },
    }



