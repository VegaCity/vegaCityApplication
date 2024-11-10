import React from "react";
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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Eye, AlertTriangle, CreditCard, Trash } from "lucide-react";
import Link from "next/link";

interface PackageItemType {
  id: string;
  packageId: string;
  cccdpassport: string | null;
  email: string | null;
  gender: string | null;
  name: string | null;
  phoneNumber: string | null;
  rfid: string | null;
  status: string;
  crDate: string;
  updateDate: string;
  walletId: string;
  isChanged: boolean;
  isAdult: boolean | null;
  endDate: string | null;
}

interface PackageItemActionProps {
  packageItem: PackageItemType;
  onLost: (item: PackageItemType) => void;
  onGenerateNewCard: (item: PackageItemType) => void;
  onDelete?: (item: PackageItemType) => void;
}

const PackageItemAction: React.FC<PackageItemActionProps> = ({
  packageItem,
  onLost,
  onGenerateNewCard,
  onDelete,
}) => {
  if (!packageItem) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 w-8 p-0">
          ...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid gap-2">
          <Link href={`/user/package-items/detail/${packageItem.id}`}>
            <Button className="w-full flex items-center justify-start gap-2 bg-blue-500 hover:bg-blue-700">
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </Link>

          {packageItem.status === "Active" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full flex items-center justify-start gap-2 bg-red-500 hover:bg-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Report Lost
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Report Card as Lost</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to report{" "}
                    {packageItem.name || "this card"}'s card as lost? This will
                    block the current card and require issuing a new one.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onLost(packageItem)}>
                    Report Lost
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {packageItem.status === "Blocked" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full flex items-center justify-start gap-2 bg-green-500 hover:bg-green-700">
                  <CreditCard className="h-4 w-4" />
                  Generate New Card
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Generate New Card</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to generate a new card for{" "}
                    {packageItem.name || "this user"}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onGenerateNewCard(packageItem)}
                  >
                    Generate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full flex items-center justify-start gap-2 bg-red-700 hover:bg-red-800">
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Package Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {packageItem.name || "this"}{" "}
                    package item? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(packageItem)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PackageItemAction;
