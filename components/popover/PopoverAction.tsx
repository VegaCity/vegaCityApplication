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
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

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
        <Button variant="outline" className="border-none">
          ...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-30 bg-blue-200 bg-transparent opacity-85">
        {/* <div> */}
        {/* <div className="space-y-2">
            <h4 className="font-medium leading-none">Actions</h4>
            <p className="text-sm text-muted-foreground">
              Select your next actions...
            </p>
          </div> */}
        <div className="flex items-center w-full">
          <div>
            {/* <Label htmlFor="width">Edit</Label> */}
            <Link href={editLink}>
              <Button
                variant={"ghost"}
                className="text-blue-500 hover:text-blue-600 font-bold rounded text-xs"
              >
                <Pencil />
              </Button>
            </Link>
          </div>
          <div>
            {/* <Label htmlFor="maxWidth">Delete</Label> */}
            <AlertDialog>
              <AlertDialogTrigger>
                <Button
                  variant={"ghost"}
                  className="text-red-500 hover:text-red-600 font-bold rounded text-xs"
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
