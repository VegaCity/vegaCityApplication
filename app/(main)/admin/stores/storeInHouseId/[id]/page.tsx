"use client";

import BackButton from "@/components/BackButton";
import StoresPagination from "@/components/stores/StoresPagination";
import StoresTable from "@/components/stores/StoresTable";

interface StoreListPageByHouseIdProps {
  params: { id: string };
}

const StoreListPageByHouseId = ({ params }: StoreListPageByHouseIdProps) => {
  const { id: houseId } = params; // Assuming you're passing the house ID in the params

  if (!houseId) {
    return <div>Loading...</div>; // Display loading state while fetching data
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/" />
      </div>
      <h1>HouseId: {houseId}</h1>
      <StoresTable params={{ id: houseId }} />
      <StoresPagination />
    </div>
  );
};

export default StoreListPageByHouseId;
