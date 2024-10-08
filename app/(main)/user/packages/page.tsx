"use client";

import React, { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
import { PackageServices } from "@/components/services/packageServices";
import { Package } from "@/types/package";
import PackageCard from "@/components/card/packagecard";

const PackagesPage = () => {
  const { userRole, loading } = useUserRole();
  const [packageIds, setPackageIds] = useState<string[]>([]);

  interface Package_Id extends Package {
    id: string;
  }

  useEffect(() => {
    const fetchPackageIds = async () => {
      try {
        const response = await PackageServices.getPackages({
          page: 1,
          size: 10,
        });
        const ids = response.data.items.map((pkg: Package_Id) => pkg.id);
        setPackageIds(ids);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };

    fetchPackageIds();
  }, []);

  const handlePackageAction = (id: string) => {
    console.log("Action for package:", id);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (userRole && userRole.name !== "CashierWeb") {
    return <div>You are denied access to this page!</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {packageIds.length > 0 ? (
          packageIds.map((packageId) => (
            <PackageCard key={packageId} id={packageId} />
          ))
        ) : (
          <div>No packages available</div>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;
