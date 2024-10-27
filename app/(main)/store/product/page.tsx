"use client";

import React, { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
import { Store } from "@/types/store";
import { StoreServices } from "@/components/services/storeServices";
import { useAuthUser } from "@/components/hooks/useAuthUser";

interface ApiResponse {
  statusCode: number;
  messageResponse: string;
  data: Store;  // Changed from Store[] to Store for single store
}

interface StoreDetailPageProps {
  params: {
    id: string;
  }
}

const StoreDetailPage = ({ params }: StoreDetailPageProps) => {
  const { storeId, loading: userRoleLoading } = useAuthUser();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const storeId: string | null = localStorage.getItem("storeId");
  console.log(storeId, "storeId")



  useEffect(() => {
    const fetchStore = async () => {
      try {
        if(storeId){
          const response = await StoreServices.getStoreById(storeId);
          console.log(response, "responseeeeee")
          const apiResponse = response.data.data.store;
          console.log(apiResponse, "nguu")
          
          if (apiResponse) {
            setStore(apiResponse);
          } else {
            throw new Error("Invalid response format");
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product.:", error);
        setError("Failed to load product details");
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStore();
    }
  }, [storeId]);

  console.log(store, "storeeee")

  // if (userRoleLoading || loading) {
  //   return <div>Loading product details...</div>;
  // }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!store) {
    return <div>product not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/stores" />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{store.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Store Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {store.id}</p>
              <p><span className="font-medium">Address:</span> {store.address}</p>
              <p><span className="font-medium">Phone:</span> {store.phoneNumber}</p>
              {/* <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded ${
                  store.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {store.status}
                </span>
              </p> */}
            </div>
          </div>
          
          {/* Add more store details sections as needed */}
        </div>
      </div>
    </div>
  );
};

export default StoreDetailPage;