"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HouseType } from "@/types/house";
import { HouseServices } from "@/components/services/houseServices";
import { AxiosError } from "axios";
import StoresTable from "@/components/stores/StoresTable";
import StoresPagination from "@/components/stores/StoresPagination";

interface HouseDetailsPageProps {
  params: { id: string };
}

export default function HouseDetailsPage({ params }: HouseDetailsPageProps) {
  const houseId = params.id;
  const [house, setHouse] = useState<HouseType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHouseDetails = async () => {
      setIsLoading(true);
      try {
        const response = await HouseServices.getHouseById(houseId);
        console.log(response.data.data, "Zone Detail Data");
        setHouse(response.data.data.house); // Assuming response.data contains zone info
      } catch (err) {
        setError(
          err instanceof AxiosError ? err.message : "Unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouseDetails();
  }, [houseId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!houseId) {
    return (
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="p-6">
            <p className="text-center text-red-500">House not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{house?.houseName}</CardTitle>
        </CardHeader>
        <CardContent>
          {house && (
            <div className="space-y-2">
              {Object.entries(house).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b py-2">
                  <span className="font-medium">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span>
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value) // Use JSON.stringify to display the object
                      : key.includes("Date")
                      ? new Date(value as string).toLocaleString()
                      : typeof value === "boolean"
                      ? value
                        ? "Yes"
                        : "No"
                      : (value as string)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
