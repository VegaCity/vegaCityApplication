"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { PromotionServices } from "@/components/services/Promotion/promotionServices";
import { Promotion } from "@/types/promotion/Promotion";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { Minus } from "lucide-react";
import { splitDateTime } from "@/lib/utils/dateTimeUtils";
import { cn } from "@/lib/utils";
import { handleBadgeStatusColor } from "@/lib/utils/statusUtils";
import { handleUserStatusFromBe } from "@/types/userAccount";
import { Badge } from "@/components/ui/badge";

interface PromotionTableProps {
  limit?: number;
  title?: string;
}

interface GetPromotion extends Promotion {
  id: string;
}

const PromotionsTable = ({ limit, title }: PromotionTableProps) => {
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
              <TableHead>NO</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Max Discount
              </TableHead>
              <TableHead className="hidden md:table-cell">Quantity</TableHead>
              <TableHead className="hidden md:table-cell">Discount %</TableHead>
              <TableHead className="hidden md:table-cell">
                Require Amount
              </TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Start Date</TableHead>
              <TableHead className="hidden md:table-cell">End Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromotions.map((promo, i) => (
              <TableRow key={promo.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{promo.name}</TableCell>
                <TableCell>{promo.promotionCode}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {promo.description ? promo.description : <Minus />}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {promo.maxDiscount ? (
                    formatCurrency(promo.maxDiscount)
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {promo.quantity !== null ? promo.quantity : <Minus />}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {promo.discountPercent !== null ? (
                    `${promo.discountPercent.toFixed(2)}%`
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {promo.requireAmount !== null ? (
                    promo.requireAmount
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={cn(handleBadgeStatusColor(promo.status))}>
                    {handleUserStatusFromBe(promo.status)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {splitDateTime({ type: "date", dateTime: promo.startDate })}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {splitDateTime({ type: "date", dateTime: promo.endDate })}
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
        <div>Data is fetching... Please wait...</div>
      )}
    </div>
  );
};

export default PromotionsTable;
