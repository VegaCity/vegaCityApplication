import React from "react";
import { Package } from "@/types/packageType/package";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Tag } from "lucide-react";
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
    <Card className="w-full bg-white rounded shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group">
      <div className="relative aspect-[16/9]  w-full overflow-hidden">
        <Image
          src={validImageUrl}
          alt={pkg.name || "Package Image"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          loading="eager"
        />
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 shadow-sm">
            <Sparkles className="w-4 h-4 mr-1 text-blue-500" />
            {pkg.duration} Day(s)
          </span>
        </div>
      </div>
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 pr-2 transition-colors group-hover:text-blue-600">
            {pkg.name}
          </h3>
        </div>
        <p className="text-sm text-gray-600 min-h-[40px] opacity-80">
          {pkg.description || "This package can't charge when using."}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-blue-700">
              {typeof pkg.price === "number"
                ? formatCurrency(pkg.price)
                : "N/A"}
            </span>
          </div>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-10 px-5 font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Link href={`/user/packages/generate/${pkg.id}`}>Generate</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
