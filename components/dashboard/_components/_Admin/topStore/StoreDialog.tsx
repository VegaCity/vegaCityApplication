import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";
import { TopStore } from "@/types/analytics";

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
            {storeDetails.storeName} - {storeDetails.storeEmail}
          </DialogTitle>
          <DialogDescription>Top Store In Month</DialogDescription>
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
