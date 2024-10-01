import { API } from "@/components/services/api";
import { ETag } from "@/types/etag";

interface ETagPageSize {
    page?: number,
    size?: number,
}

export const ETagServices = {
    getETagTypes({ page, size }: ETagPageSize) {
        return API.get('/etags', {
            params: {
                page,
                size,
            }
        });
    },
    getETagTypeById(id: string) {
        return API.get(`/etag/${id}`);
    },
    uploadEtagType(etagData: ETag) {
        return API.post('/etag/', etagData);
    },
    editEtagType(id: string, etagData: ETag) {
        return API.patch(`/etag/${id}`, etagData); 
    },
    deleteEtagTypeById(id: string) {
        return API.delete(`/etag/${id}`);
    },
}
