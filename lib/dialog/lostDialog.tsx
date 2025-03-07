import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackageItemServices } from "@/components/services/Package/packageItemService";
import { useToast } from "@/components/ui/use-toast";

interface PackageItem {
  id: string;
  packageId: string;
  cusCccdpassport: string | null;
  cusEmail: string | null;
  cusName: string | null;
  phoneNumber: string | null;
  rfid: string | null;
  status: string;
}

interface LostPackageItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  packageItem: PackageItem | null;
  onSuccess: () => void;
}

const LostPackageItemDialog = ({
  isOpen,
  onClose,
  packageItem,
  onSuccess,
}: LostPackageItemDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    packageItemId: "",
    cccdpassport: "",
    name: "",
    phoneNumber: "",
    rfid: "",
    email: "",
    reason: "",
  });

  useEffect(() => {
    if (packageItem) {
      setFormData({
        packageItemId: packageItem.id,
        cccdpassport: packageItem.cusCccdpassport || "",
        name: packageItem.cusName || "",
        phoneNumber: packageItem.phoneNumber || "",
        email: packageItem.cusEmail || "",
        rfid: packageItem.rfid || "",
        reason: "",
      });
    }
  }, [packageItem]);

  const handleSubmit = async () => {
    try {
      const response = await PackageItemServices.lostPackageItem({
        fullName: formData.name,
        cccdpassport: formData.cccdpassport,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });

      if (response.status === 200) {
        toast({
          title: "Reported Successfully",
          description: "The VCard has been reported successfully.",
          variant: "default",
        });
        localStorage.setItem(
          "packageItemIdLost",
          response.data.data.packageItemId
        );
        onClose();
        onSuccess();
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error: any) {
      console.error("Error reporting lost VCard:", error);
      toast({
        title: "Report Failed",
        description:
          error.response.data.messageResponse ||
          error.response.data.Error ||
          "Failed to report lost VCard",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-xl font-semibold text-red-500">
            Report Lost VCard
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-500">
            Please confirm the information about the lost item.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-3 py-3">
          <div className="grid grid-cols-3 gap-2">
            {/* <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">ID</Label>
              <Input
                value={formData.packageItemId}
                className="h-8 text-sm bg-gray-50"
                disabled
              />
            </div> */}

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Name</Label>
              <Input
                value={formData.name}
                className="h-8 text-sm bg-gray-50"
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">CCCD/Passport</Label>
              <Input
                value={formData.cccdpassport}
                className="h-8 text-sm bg-gray-50"
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Phone</Label>
              <Input
                value={formData.phoneNumber}
                className="h-8 text-sm bg-gray-50"
                disabled
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Email</Label>
            <Input
              value={formData.email}
              className="h-8 text-sm bg-gray-50"
              disabled
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">
              Reason <span className="text-green-500">(optional)</span>
            </Label>
            <Input
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="h-8 text-sm"
              placeholder="Enter reason for loss"
            />
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="h-8 text-sm bg-red-500 hover:bg-red-600"
          >
            Report Lost
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LostPackageItemDialog;
