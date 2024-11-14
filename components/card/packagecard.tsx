import React from "react";
import { Package } from "@/types/packageType/package";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface PackageCardProps {
  package: Package;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg }) => {
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
    pkg.imageUrl && pkg.imageUrl.startsWith("https")
      ? pkg.imageUrl
      : "/default-image.png";

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-60">
        <Image
          src={validImageUrl}
          alt={pkg.name || "Package Image"}
          fill
          className="object-cover"
          loading="eager"
        />
      </div>
      <CardHeader className="px-4 pt-2">
        <h3 className="text-lg font-semibold">{pkg.name}</h3>
      </CardHeader>
      <div>
        <p className="text-lg font-semibold text-primary ml-4 mb-4">
          {typeof pkg.description}
        </p>
      </div>
      <div className="flex flex-row  items-center ml-8 mb-5">
        <div>
          <p className="text-lg font-semibold text-primary mr-4">
            {typeof pkg.price === "number" ? formatCurrency(pkg.price) : "N/A"}
          </p>
        </div>
        <Link href={`/user/packages/generate/${pkg.id}`}>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all">
            Generate
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default PackageCard;
