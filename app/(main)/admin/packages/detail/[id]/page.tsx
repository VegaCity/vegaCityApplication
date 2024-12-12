"use client";

import BackButton from "@/components/BackButton";
import PackageDetail from "@/components/packages/PackageDetail";
import UserDetail from "@/components/users/UserDetail";

interface PackageDetailProps {
  params: { id: string };
}

const PackageDetailPage = ({ params }: PackageDetailProps) => {
  const { id: packageId } = params;

  if (!packageId) {
    return <div>Loading...</div>; // Display loading state while fetching data
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back to Packages" link="/admin/packages" />
      </div>
      {/* <h1>packageId: {packageId}</h1> */}
      {/* Body Container */}
      <div className="max-w-7xl px-10">
        <PackageDetail params={{ id: packageId }} />
      </div>
    </div>
  );
};

export default PackageDetailPage;
