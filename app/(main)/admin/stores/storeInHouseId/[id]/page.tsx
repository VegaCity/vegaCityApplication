"use client";

import { useEffect, useState } from "react";
import BackButton from "@/components/BackButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { HouseServices } from "@/components/services/houseServices"; // Assuming you have a service for fetching stores
import { useRouter } from "next/navigation";
import { StoreInHouse } from "@/types/storeOwner";
import StoresTable from "@/components/stores/StoresTable";
import StoresPagination from "@/components/stores/StoresPagination";

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
