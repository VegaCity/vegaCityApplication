"use client";

import BackButton from "@/components/BackButton";
import { Loader } from "@/components/loader/Loader";
import StoreDetail from "@/components/stores/StoreDetail";

interface StoreDetailProps {
  params: { id: string };
}

const StoreDetailPage = ({ params }: StoreDetailProps) => {
  const { id: storeId } = params; // Assuming you're passing the house ID in the params

  if (!storeId) {
    return <Loader />; // Display loading state while fetching data
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/admin/stores" />
      </div>
      {/* <h1>storeId: {storeId}</h1> */}
      {/* Body Container */}
      <div className="max-w-7xl px-10">
        <StoreDetail params={{ id: storeId }} />
      </div>
    </div>
  );
};

export default StoreDetailPage;
