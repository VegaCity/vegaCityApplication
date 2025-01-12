"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";

interface SaleStoreProps {
  storeName: string;
  storeEmail: string;
  maxValueSale: number;
  onClick: () => void;
}

export default function SaleStore({
  maxValueSale,
  storeEmail,
  storeName,
  onClick,
}: SaleStoreProps) {
  return (
    <div className="flex items-center">
      <Avatar onClick={onClick} className="h-9 w-9">
        <AvatarImage
          src={validImageUrl(
            "https://firebasestorage.googleapis.com/v0/b/vegacity-utility-card.appspot.com/o/images%2FtopSaleStoreAvatar.jpg?alt=media&token=08b61a71-de19-4fc4-9075-dc230222726a"
          )}
          alt="Avatar"
        />
        <AvatarFallback>
          <Skeleton className="h-3 w-3" />
        </AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p
          onClick={onClick}
          className="text-sm font-medium leading-none cursor-pointer"
        >
          {storeName}
        </p>
        <p className="text-sm text-muted-foreground">{storeEmail}</p>
      </div>
      <div className="ml-auto font-medium">
        +{formatVNDCurrencyValue(maxValueSale)}
      </div>
    </div>
  );
}
