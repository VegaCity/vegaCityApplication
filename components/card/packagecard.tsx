import React, { useEffect, useState } from "react";
import { Package } from "@/types/package";
import { PackageServices } from "@/components/services/packageServices";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface PackageCardProps {
  id: string;
}

const PackageCard: React.FC<PackageCardProps> = ({ id }) => {
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const response = await PackageServices.getPackageById(id);
        console.log("Package response:", response);
        if (response.data?.data?.package) {
          setPkg(response.data.data.package);
        } else {
          throw new Error("Package data not found in response");
        }
      } catch (err) {
        console.error("Error fetching package:", err);
        setError("Failed to load package");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  if (loading) {
    return <Card className="p-4 text-center">Loading package {id}...</Card>;
  }

  if (error) {
    return <Card className="p-4 text-red-500 text-center">{error}</Card>;
  }

  if (!pkg) {
    return (
      <Card className="p-4 text-center">No package found for ID: {id}</Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "symbol",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  const validImageUrl =
    pkg.imageUrl && pkg.imageUrl.startsWith("http")
      ? pkg.imageUrl
      : "/default-image.png";
  return (
    <Card className="flex flex-col justify-between overflow-hidden shadow-lg rounded-lg">
      <div className="w-full flex justify-center p-4">
        <div className="w-48 h-48 relative rounded-lg overflow-hidden shadow-sm">
          <Image
            src={validImageUrl}
            alt={pkg.name || "Package Image"}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
        <p className="text-red-600 mb-1 text-lg">
          {typeof pkg.price === "number" ? formatCurrency(pkg.price) : "N/A"}
        </p>
      </CardContent>
      <CardFooter className="p-4">
        <Link href={`/user/packages/generate/${pkg.id}`} className="w-full">
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all">
            Generate
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;
