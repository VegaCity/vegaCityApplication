"use client";

import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
import ServiceStoresPagination from "@/components/servicestores/ServiceStorePagination";
import ServiceStoresTable from "@/components/servicestores/ServiceStoreTable";
import Link from "next/link";

const ServiceStorePage = () => {
  const { userRole, loading } = useUserRole();
  console.log(userRole?.name, "userRole");

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/" />

        <Link href="/admin/serviceStores/create">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Service Store
          </button>
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Service Stores</h1>
      <ServiceStoresTable />
      <ServiceStoresPagination />
    </div>
  );
};

export default ServiceStorePage;
