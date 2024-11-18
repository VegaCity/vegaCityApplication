import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { UseFormReturn } from "react-hook-form";

interface GenerateChildrenVCardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const GenerateChildrenVCardDialog: React.FC<
  GenerateChildrenVCardDialogProps
> = ({ isOpen, onOpenChange, form, onSubmit, isLoading }) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          form.reset({
            quantity: 1,
            packageItemId: localStorage.getItem("packageItemId") || "",
          });
        }
      }}
    >
      <DialogContent className="w-[500px] max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-bold text-center">
            Generate Children VCards
          </DialogTitle>
          <DialogDescription className="text-center">
            Specify how many children VCards you want to generate
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">Quantity</FormLabel>
              <Input
                type="number"
                min="1"
                max="10"
                {...form.register("quantity")}
                className="col-span-3"
                placeholder="Number of children VCards"
              />
            </div>
            <Input type="hidden" {...form.register("packageItemId")} />
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
