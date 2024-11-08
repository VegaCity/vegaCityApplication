"use client";

import BackButton from "@/components/BackButton";
import StoreDetail from "@/components/stores/StoreDetail";

interface StoreDetailProps {
  params: { id: string };
}

const UserDetailPage = ({ params }: StoreDetailProps) => {
  const { id: storeId } = params; // Assuming you're passing the house ID in the params

  if (!storeId) {
    return <div>Loading...</div>; // Display loading state while fetching data
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/admin/stores" />
      </div>
      {/* <h1>StoreId: {storeId}</h1> */}
      <StoreDetail params={{ id: storeId }} />
    </div>
  );
};

export default UserDetailPage;
