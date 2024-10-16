"use client";
import { useQuery } from "@tanstack/react-query";
import { SearchParams } from "@/types/table";
import { ApiListResponse } from "../api/api-handler/generic";
import { getOrders, IOrder } from "../actions/order";

export const useGetOrders = (searchTerm: SearchParams) => {
  return useQuery<ApiListResponse<IOrder>>({
    queryKey: ["orders", searchTerm],
    queryFn: () => getOrders(searchTerm),
  });
};
