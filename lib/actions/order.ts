"use server";

import { unstable_noStore as noStore, revalidatePath } from "next/cache";
// import { AUCTION_URLS } from "@/config/apis";
// import { IAuctionCreateField, IAuction } from "@/types/auction";

import {
  Result,
  ApiListResponse,
  ApiSingleResponse,
  apiRequest,
  fetchListData,
} from "@/lib/api/api-handler/generic";
import { SearchParams } from "@/types/table";

/////////////////// test ///////////////////
export type IOrder = {
  id: string;
  name: string;
  description: string;
};
export async function getOrders(
  searchParams: SearchParams
): Promise<ApiListResponse<IOrder>> {
  noStore();

  const result = await fetchListData<IOrder>("/orders", searchParams);
  if (!result.success) {
    console.error("Failed to fetch orders:", result.error);
    return { data: [], pageCount: 0, error: result.error };
  }
  return result.data;
}
// post list
// export async function createHouse(data: {}): Promise<Result<void>> {
//   noStore();

//   const result = await apiRequest(() => axiosAuth.post("", data));
//   if (result.success) {
//     revalidatePath("/dashboard/auctions");
//     return { success: true, data: undefined };
//   }
//   return result;
// }
// export async function updateAuctionDetail(
//   params: string,
//   data: IAuctionCreateField
// ): Promise<Result<void>> {
//   noStore();

//   const result = await apiRequest(() =>
//     axiosAuth.put(AUCTION_URLS.UPDATE_AUCTIONS(params), data)
//   );

//   if (result.success) {
//     revalidatePath("/dashboard/auctions");
//     return { success: true, data: undefined };
//   }

//   return result;
// }

// export async function createAuction(data: IAuctionCreateField): Promise<Result<void>> {
//   noStore();

//   const result = await apiRequest(() =>
//     axiosAuth.post(AUCTION_URLS.CREATE_AUCTIONS, data)
//   );

//   if (result.success) {
//     revalidatePath("/dashboard/auctions");
//     return { success: true, data: undefined };
//   }

//   return result;
// }

// export async function getHouses(
//     searchParams: SearchParams
//   ): Promise<Result<ApiListResponse<IHouse>>> {
//     noStore();

//     return await fetchListData("/housetypes", searchParams);
//   }

// export async function getAuctionByID(
//   params: string
// ): Promise<Result<ApiSingleResponse<IAuction>>> {
//   noStore();

//   return fetchSingleData(AUCTION_URLS.GET_AUCTION_BY_ID(params));
// }
