import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PackageItem } from "@/types/packageitem";
import { Input } from "@/components/ui/input";

interface UpdateRFIDAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (rfId: string) => Promise<void>;
  isLoading: boolean;
  packageItem: PackageItem | null;
}

export const UpdateRFIDAlertDialog: React.FC<UpdateRFIDAlertDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
  packageItem,
}) => {
  const [rfId, setRfId] = React.useState("");

  const handleSubmit = async () => {
    await onConfirm(rfId);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update RFID</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Package Item ID</label>
            <Input
              className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
              defaultValue={localStorage.getItem("packageItemId") || ""}
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">RFID</label>
            <Input
              className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
              value={rfId}
              onChange={(e) => setRfId(e.target.value)}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
