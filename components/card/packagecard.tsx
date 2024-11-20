import React from "react";
import { Package } from "@/types/packageType/package";
import { Card, CardContent } from "@/components/ui/card";
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

  const validImageUrl = pkg.imageUrl?.startsWith("https")
    ? pkg.imageUrl
    : "/default-image.png";

  return (
    <Card className="w-full bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={validImageUrl}
          alt={pkg.name || "Package Image"}
          fill
          className="object-cover"
          loading="eager"
        />
      </div>

      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-medium text-gray-900 pr-2">
            {pkg.name}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
            New
          </span>
        </div>

        <p className="text-sm text-gray-500 min-h-[40px]">
          {pkg.description || "This package can't charge when using."}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-blue-600">
              {typeof pkg.price === "number"
                ? formatCurrency(pkg.price)
                : "N/A"}
            </span>
          </div>

          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-9 px-4"
          >
            <Link href={`/user/packages/generate/${pkg.id}`}>Generate</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
