"use client";

import EmptyDataPage from "@/components/emptyData/emptyData";
import { Loader } from "@/components/loader/Loader";
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { PromotionServices } from "@/components/services/Promotion/promotionServices";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { formatDateTime } from "@/lib/utils/dateTimeUtils";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";
import { handleBadgePromotionStatusColor } from "@/lib/utils/statusUtils";
import {
  handlePromotionStatusFromBe,
  Promotion,
} from "@/types/promotion/Promotion";
import { AxiosError } from "axios";
import { Minus, ArrowUp10, ArrowUp01 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PromotionTableProps {
  limit?: number;
  title?: string;
}

interface GetPromotion extends Promotion {
  id: string;
}

const PromotionsTable = ({ limit, title }: PromotionTableProps) => {
  const router = useRouter();
  const [promotionList, setPromotionList] = useState<GetPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof GetPromotion;
    direction: "asc" | "desc" | string;
  }>();

  const filteredPromotions = limit
    ? promotionList.slice(0, limit)
    : promotionList;

  const handleSort = (key: keyof GetPromotion) => {
    setSortConfig((prevConfig) => {
      if (prevConfig?.key === key) {
        // Toggle the direction if the same column is clicked
        return {
          key,
          direction: prevConfig.direction === "asc" ? "desc" : "asc", //this operator like if true return false if false return true
        };
      }
      // Default to ascending for a new column
      return { key, direction: "asc" };
    });
  };

  const sortedPromotions = [...promotionList].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;

    const aValue =
      key === "startDate" || key === "endDate" ? new Date(a[key]) : a[key];
    const bValue =
      key === "startDate" || key === "endDate" ? new Date(b[key]) : b[key];

    if (aValue === null) return direction === "asc" ? -1 : 1; // Null comes first for ascending.
    if (bValue === null) return direction === "asc" ? 1 : -1; // Null comes last for ascending.
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  console.log(sortedPromotions, "sortedPromotions");

  const handleDeletePromotion = (promo: GetPromotion) => {
    setDeleteLoading(true);
    if (promo.id) {
      PromotionServices.deletePromotionById(promo.id)
        .then((res) => {
          toast({
            title: res.data.messageResponse,
            description: `Promotion name: ${promo.name}`,
          });
        })
        .catch((err) => {
          if (err instanceof AxiosError) {
            toast({
              variant: "destructive",
              title: err?.response?.data.messageResponse,
              description: "This promotion was expired!",
            });
            console.log("Delete error: ", err?.response?.statusText);
          }
        })
        .finally(() => {
          setDeleteLoading(false);
        });
    }
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await PromotionServices.getPromotions({
          page: 1,
          size: 10,
        });

        const promotions = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setPromotionList(promotions);
        console.log(promotions, "promotions");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, [isLoading, deleteLoading]);

  if (isLoading)
    return (
      <div>
        <Loader isLoading={isLoading} />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-5">
      <h3 className="text-2xl mb-4 font-semibold border-l-2 pl-4">
        {title || "Promotions"}
      </h3>
      {sortedPromotions.length > 0 ? (
        <Table>
          <TableCaption>A list of recent promotions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Code</TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Description
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Max Discount
              </TableHead>
              {/* <TableHead className="hidden md:table-cell text-white">
                Quantity
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Discount %
              </TableHead> */}
              <TableHead className="hidden md:table-cell text-white">
                Require Amount
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Status
              </TableHead>
              <TableHead
                onClick={() => handleSort("startDate")}
                className="hidden md:table-cell text-white"
              >
                Start Date
                <span className="ml-1">
                  {sortConfig && sortConfig.direction === "asc" ? (
                    <ArrowUp01 size={15} />
                  ) : (
                    <ArrowUp10 size={15} />
                  )}
                </span>
              </TableHead>
              <TableHead
                onClick={() => handleSort("endDate")}
                className="hidden md:table-cell text-white"
              >
                End Date
                <span className="ml-1">
                  {sortConfig && sortConfig.direction === "asc" ? (
                    <ArrowUp01 size={15} />
                  ) : (
                    <ArrowUp10 size={15} />
                  )}
                </span>
              </TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPromotions.map((promo, i) => (
              <TableRow
                // onClick={() =>
                //   router.push(`/admin/promotions/detail/${promo.id}`)
                // }
                key={promo.id}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>{promo.name}</TableCell>
                <TableCell>
                  <Badge className="bg-slate-500 text-white">
                    {promo.promotionCode}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {promo.description ? (
                    <p className="text-sm text-muted-foreground">
                      {promo.description}
                    </p>
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {promo.maxDiscount ? (
                    <p className="font-bold">
                      {formatVNDCurrencyValue(promo.maxDiscount)}
                    </p>
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                {/* <TableCell className="hidden md:table-cell">
                  {promo.quantity !== null ? promo.quantity : <Minus />}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {promo.discountPercent !== null ? (
                    <p className="font-bold">
                      {`${promo.discountPercent.toFixed(2)}%`}
                    </p>
                  ) : (
                    <Minus />
                  )}
                </TableCell> */}
                <TableCell className="hidden md:table-cell">
                  {promo.requireAmount !== null ? (
                    <p className="font-bold">
                      {formatVNDCurrencyValue(promo.requireAmount)}
                    </p>
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    className={handleBadgePromotionStatusColor(promo.status)}
                  >
                    {handlePromotionStatusFromBe(promo.status)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col items-center justify-center">
                    {formatDateTime({
                      type: "date",
                      dateTime: promo.startDate,
                    })}
                    <Minus />
                    {formatDateTime({
                      type: "time",
                      dateTime: promo.startDate,
                    })}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col items-center justify-center">
                    {formatDateTime({ type: "date", dateTime: promo.endDate })}
                    <Minus />
                    {formatDateTime({ type: "time", dateTime: promo.endDate })}
                  </div>
                </TableCell>
                <TableCell>
                  <PopoverActionTable
                    item={promo}
                    editLink={`/admin/promotions/edit/${promo.id}`}
                    handleDelete={handleDeletePromotion}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyDataPage />
      )}
    </div>
  );
};

export default PromotionsTable;
