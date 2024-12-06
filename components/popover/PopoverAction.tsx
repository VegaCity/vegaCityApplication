"use client";

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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { Pencil, Trash, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface BaseType {
  id: string;
  name?: string;
  zoneName?: string;
  fullName?: string;
}

interface PopoverActionProps<T extends BaseType> {
  item: T;
  editLink: string;
  handleDelete: (item: T) => void;
}

export const PopoverActionTable = <T extends BaseType>({
  item,
  editLink,
  handleDelete,
}: PopoverActionProps<T>) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="border-none">
          <MoreHorizontal />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-30 bg-blue-950 text-text-button space-y-3">
        {/* <div> */}
        {/* <div className="space-y-2">
            <h4 className="font-medium leading-none">Actions</h4>
            <p className="text-sm text-muted-foreground">
              Select your next actions...
            </p>
          </div> */}
        <h3 className="font-medium leading-none">Actions</h3>
        <div className="flex flex-col items-between justify-center w-full">
          <div className="space-x-2">
            <span className="mr-4">
              <Label className="max-w-15" htmlFor="edit">
                Edit
              </Label>
            </span>
            <Link href={editLink}>
              <Button
                variant={"ghost"}
                className="text-blue-500 hover:text-blue-600 font-bold rounded text-xs w-10"
              >
                <Pencil />
              </Button>
            </Link>
          </div>
          <div className="space-x-2">
            <span className="">
              <Label className="max-w-15" htmlFor="delete">
                Delete
              </Label>
            </span>
            <AlertDialog>
              <AlertDialogTrigger>
                <Button
                  variant={"ghost"}
                  className="text-red-500 hover:text-red-600 font-bold rounded text-xs w-10"
                >
                  <Trash />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are sure for delete this -
                    {item.name ?? item.zoneName ?? item.fullName}-?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will deflag in list!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(item)}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {/* </div> */}
      </PopoverContent>
    </Popover>
  );
};
