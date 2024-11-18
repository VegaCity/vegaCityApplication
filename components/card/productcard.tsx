import React from "react";
import { Store } from "@/types/store/store";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store: str }) => {
  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat("vi-VN", {
  //     style: "currency",
  //     currency: "VND",
  //     currencyDisplay: "symbol",
  //   })
  //     .format(amount)
  //     .replace("₫", "đ");
  // };

  return (
    <Card className="flex flex-col justify-between overflow-hidden shadow-lg rounded-lg">
      <div className="w-full flex justify-center p-4">
        <div className="w-88 h-48 relative rounded-lg overflow-hidden shadow-sm"></div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{str.name}</h3>
        {/* <p className="text-red-600 mb-1 text-lg">
          {typeof str.price === "number" ? formatCurrency(str.price) : "N/A"}
        </p> */}
      </CardContent>
      <CardFooter className="p-4">
        <Link href={`/store/${str.id}`} className="w-full">
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all">
            Generate
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default StoreCard;
