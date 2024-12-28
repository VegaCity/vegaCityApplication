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
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [error, setError] = React.useState<string>("");

  const validateRFID = (value: string): boolean => {
    // Clear previous error
    setError("");

    // Check if empty
    if (!value.trim()) {
      setError("RFID cannot be empty");
      return false;
    }

    // Check if exactly 10 digits
    if (value.length !== 10) {
      setError("RFID must be exactly 10 digits");
      return false;
    }

    // Check if numbers only
    if (!/^\d+$/.test(value)) {
      setError("RFID must contain only numbers (0-9)");
      return false;
    }

    return true;
  };

  const handleRFIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (value === "" || /^\d+$/.test(value)) {
      setRfId(value);
      validateRFID(value);
    }
  };

  const handleSubmit = async () => {
    if (validateRFID(rfId)) {
      await onConfirm(rfId);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update RFID</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          {/* <div className="mb-4">
            <label className="block font-medium mb-2">Package Item ID</label>
            <Input
              className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
              defaultValue={localStorage.getItem("packageItemId") || ""}
              disabled
            />
          </div> */}
          <div className="mb-4">
            <label className="block font-medium mb-2">RFID</label>
            <Input
              className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
              value={rfId}
              onChange={handleRFIDChange}
              placeholder="Enter 10-digit RFID"
              maxLength={10}
              type="text"
              inputMode="numeric"
            />
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isLoading || !!error || !rfId}
          >
            {isLoading ? "Updating..." : "Update"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpdateRFIDAlertDialog;
