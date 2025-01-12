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

interface TopStore {
  storeId: string;
  storeName: string;
  storeEmail: string;
  totalTransactions: number;
  totalAmount: number;
}

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
            Total Sales:{" "}
            <strong> {formatVNDCurrencyValue(storeDetails.totalAmount)}</strong>
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
