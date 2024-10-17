import { Suspense, useEffect } from "react";
import { notFound } from "next/navigation";
import HouseDetailsPage from "./page";
import { HouseType, StoreHouseType } from "@/types/house";
import { HouseServices } from "@/components/services/houseServices";
import StoresTable from "@/components/stores/StoresTable";
import StoresPagination from "@/components/stores/StoresPagination";

export default async function HouseDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
  house: StoreHouseType;
}) {
  const { id: houseId } = params;
  console.log(houseId, "house Id");
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        {children}
        <StoresTable params={{ id: houseId }} />
        <StoresPagination />
      </div>
    </Suspense>
  );
}
