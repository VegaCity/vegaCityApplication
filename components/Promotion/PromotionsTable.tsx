"use client";

import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { PromotionServices } from "@/components/services/Promotion/promotionServices";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { splitDateTime } from "@/lib/utils/dateTimeUtils";
import { handleBadgeStatusColor } from "@/lib/utils/statusUtils";
import {
  handlePromotionStatusFromBe,
  Promotion,
} from "@/types/promotion/Promotion";
import { Minus } from "lucide-react";
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

  const handleDeletePromotion = (promo: GetPromotion) => {
    setDeleteLoading(true);
    if (promo.id) {
      PromotionServices.deletePromotionById(promo.id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Promotion name: ${promo.name}`,
          });
        })
        .catch((err) => {
          setDeleteLoading(false);
          toast({
            title: err.data.messageResponse,
            description: "Some errors have been occurred!",
          });
        });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredPromotions = limit
    ? promotionList.slice(0, limit)
    : promotionList;

  // Function to format max discount as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="mt-5">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Promotions"}</h3>
      {filteredPromotions.length > 0 ? (
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
              <TableHead className="hidden md:table-cell text-white">
                Quantity
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Discount %
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Require Amount
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Status
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                End Date
              </TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromotions.map((promo, i) => (
              <TableRow
                onClick={() =>
                  router.push(`/admin/promotions/detail/${promo.id}`)
                }
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
                    <p className="text-slate-500">{promo.description}</p>
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {promo.maxDiscount ? (
                    <p className="font-bold">
                      {formatCurrency(promo.maxDiscount)}
                    </p>
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
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
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {promo.requireAmount !== null ? (
                    <p className="font-bold">
                      {formatCurrency(promo.requireAmount)}
                    </p>
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={cn(handleBadgeStatusColor(promo.status))}>
                    {handlePromotionStatusFromBe(promo.status)}
                  </Badge>
                </TableCell>
                {/* <TableCell className="hidden md:table-cell">
                  {splitDateTime({ type: "date", dateTime: promo.startDate })}
                </TableCell> */}
                <TableCell className="hidden md:table-cell">
                  {splitDateTime({ type: "date", dateTime: promo.endDate })}
                </TableCell>
                <TableCell
                  onClick={(event) => event.stopPropagation()} //Prvent onClick from TableRow
                >
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
        <div>Data is fetching... Please wait...</div>
      )}
    </div>
  );
};

export default PromotionsTable;
