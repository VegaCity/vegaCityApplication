import { API } from "@/components/services/api";

import { HouseType, HouseTypePatch } from "@/types/house";

interface HousePageSize {
  page?: number;
  size?: number;
}

export const HouseServices = {
  getHouses({ page, size }: HousePageSize) {
    return API.get("/houses", {
      params: {
        page,
        size,
      },
    });
  },
  getHouseById(id: string) {
    return API.get(`/house/${id}`);
  },
  uploadHouse(houseData: HouseType) {
    return API.post("/house/", houseData);
  },
  editHouse(houseId: string, houseData: HouseTypePatch) {
    return API.patch(`/house/${houseId}`, houseData);
  },
  deleteHouseById(id: string) {
    return API.delete(`/house/${id}`);
  },
};
