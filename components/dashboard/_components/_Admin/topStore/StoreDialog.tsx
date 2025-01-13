import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";
import { TopStore } from "@/types/analytics";
import { Trophy } from "lucide-react";

interface StoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeDetails: TopStore;
}

const StoreDialog: React.FC<StoreDialogProps> = ({
  isOpen,
  onClose,
  storeDetails,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Top Store Details
            <div className="flex justity-between items-center gap-2 mt-3">
              <Avatar className="h-4 w-4 my-2">
                <AvatarImage
                  src={validImageUrl(
                    "https://firebasestorage.googleapis.com/v0/b/vegacity-utility-card.appspot.com/o/images%2FtopSaleStoreAvatar.jpg?alt=media&token=08b61a71-de19-4fc4-9075-dc230222726a"
                  )}
                  alt="Avatar"
                />
                <AvatarFallback>
                  <Skeleton className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <p>
                {storeDetails.storeName} - {storeDetails.storeEmail}{" "}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            <div className="flex justify-start items-center gap-2 mt-2">
              <Trophy className="w-4 h-4" />
              <p>Top Store In Month</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>
            Number of Transactions:{" "}
            <strong> {storeDetails.totalTransactions}</strong>
          </p>
          <p>
            Total Sales:{" "}
            <strong> {formatVNDCurrencyValue(storeDetails.totalAmount)}</strong>
          </p>
          <p>
            QR Transactions Amount:{" "}
            <strong>
              {" "}
              {formatVNDCurrencyValue(storeDetails.totalQRAmount)}
            </strong>
          </p>
          <p>
            Others Transactions:{" "}
            <strong>
              {" "}
              {formatVNDCurrencyValue(storeDetails.totalOthersAmount)}
            </strong>
          </p>
          <p>
            Transactions Amount to Vega:{" "}
            <strong>
              {" "}
              {formatVNDCurrencyValue(storeDetails.amountTransferdToVega)}
            </strong>
          </p>
        </div>
        <DialogFooter>
          <Button variant={"ghost"} onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoreDialog;
