"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ZoneType } from "@/types/zone/zone";
import { ZoneServices } from "@/components/services/zoneServices";
import { HouseTypeId } from "@/types/house";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ZoneDetailPageProps {
  params: {
    id: string;
  };
}

interface GetZone extends ZoneType {
  id: string;
}

const ZoneDetailsPage = ({ params }: ZoneDetailPageProps) => {
  const router = useRouter();
  const [zone, setZone] = useState<GetZone | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchZoneDetails = async () => {
      setIsLoading(true);
      try {
        const response = await ZoneServices.getZoneById(params.id);
        console.log(response.data.data, "Zone Detail Data");
        setZone(response.data.data.zone); // Assuming response.data contains zone info
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchZoneDetails();
  }, [params.id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      {zone ? (
        <>
          <h2 className="text-2xl font-semibold">Zone: {zone.name}</h2>
          <p>
            <strong>ID:</strong> {zone.id}
          </p>
          <p>
            <strong>Location:</strong> {zone.location}
          </p>
          <Button>
            <Link href={`/admin/houses/create/houseZoneId/${zone.id}`}>
              Create House in Zone
            </Link>
          </Button>
          {zone.houses.length > 0 ? (
            <div>
              <h3 className="text-xl mt-4">Houses</h3>
              <ul>
                {zone?.houses.map(
                  (house: HouseTypeId, index) =>
                    house.deflag === false && (
                      <li key={index}>
                        <strong>House {index + 1}:</strong>
                        <Link
                          className="hover:bg-blue-300 hover:text-cyan-50 cursor-pointer transition-colors"
                          href={`/admin/houses/detail/${house.id}`}
                        >
                          {house.houseName}
                        </Link>
                        ({house.location}) <p>Address: {house.address}</p>
                      </li>
                    )
                )}
              </ul>
            </div>
          ) : (
            <h3 className="text-xl mt-4">No houses available.</h3>
          )}
        </>
      ) : (
        <div>No zone details available.</div>
      )}
    </div>
  );
};

export default ZoneDetailsPage;
