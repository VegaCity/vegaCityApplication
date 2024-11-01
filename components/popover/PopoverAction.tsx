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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EtagType } from "@/types/etagtype";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

interface GetEtagType extends EtagType {
  id: string;
}

interface PopoverActionProps {
  etag: GetEtagType;
  handleDelete: (etag: GetEtagType) => void;
}

export const PopoverActionTable: React.FC<PopoverActionProps> = ({
  etag,
  handleDelete,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">...</Button>
      </PopoverTrigger>
      <PopoverContent className="w-40">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Actions</h4>
            <p className="text-sm text-muted-foreground">
              Select your next actions...
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Edit</Label>
              <Link href={`/admin/etagtypes/edit/${etag.id}`}>
                <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded text-xs mr-2">
                  <Pencil />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Delete</Label>
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button
                    variant={"destructive"}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold rounded text-xs"
                  >
                    <Trash />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are sure for delete this -{etag.name}- Etag Type?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will deflag Etag in
                      your Etag list!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(etag)}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
