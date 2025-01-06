"use client";

import React, { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
import { PackageServices } from "@/components/services/Package/packageServices";
import { Package } from "@/types/packageType/package";
import PackageCard from "@/components/card/packagecard";
import { Loader } from "@/components/loader/Loader";
import EmptyDataPage from "@/components/emptyData/emptyData";

interface ApiResponse {
  statusCode: number;
  messageResponse: string;
  data: Package[];
  metaData: {
    size: number;
    page: number;
    total: number;
    totalPage: number;
  };
}

const PackagesPage = () => {
  const { userRole, loading: userRoleLoading } = useUserRole();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await PackageServices.getPackages({
          page: 1,
          size: 10,
        });
        const apiResponse = response.data as ApiResponse;
        if (apiResponse.statusCode === 200 && Array.isArray(apiResponse.data)) {
          // Filter out packages where deflag is true
          const filteredPackages = apiResponse.data.filter(
            (pkg) => !pkg.deflag
          );
          setPackages(filteredPackages);
        } else {
          throw new Error("Invalid response format");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching packages:", error);
        setError("Failed to load packages");
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (userRoleLoading || loading) {
    return <Loader />;
  }

  if (error) {
    return <EmptyDataPage title={error} />;
  }

  if (userRole && userRole.name !== "CashierWeb") {
    return <div>You are denied access to this page!</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {packages?.length > 0 ? (
          packages.map((pkg) => <PackageCard key={pkg.id} package={pkg} />)
        ) : (
          <div>No packages available</div>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;
