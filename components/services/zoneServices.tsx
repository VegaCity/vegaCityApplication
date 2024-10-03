import { API } from "@/components/services/api";
import { ZoneType } from "@/types/zone";

interface ZonePageSize {
    page?: number;
    size?: number;
}

export const ZoneServices = {
    getZones({ page, size }: ZonePageSize) {
        return API.get('/zones', {
            params: {
                page,
                size,
            }
        });
    },
    getZoneById(id: string) {
        return API.get(`/zone/${id}`);
    },
    uploadZone(zoneData: ZoneType) {
        return API.post('/zone/', zoneData);
    },
    editZone(zoneId: string, zoneData: ZoneType) {
        return API.patch(`/zone/${zoneId}`, zoneData); 
    },
    deleteZoneById(id: string) {
        return API.delete(`/zone/${id}`);
    },
};
