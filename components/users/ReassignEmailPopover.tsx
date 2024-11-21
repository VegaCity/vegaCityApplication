import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { UserServices } from "@/components/services/User/userServices"; // Adjust the import based on your project structure
import {
  UserReAssignEmailValues,
  userReAssignEmailFormSchema,
} from "@/lib/validation";

interface ReassignEmailPopoverProps {
  userId: string;
}

export const ReassignEmailPopover: React.FC<ReassignEmailPopoverProps> = ({
  userId,
}) => {
  const { toast } = useToast();
  const form = useForm<UserReAssignEmailValues>({
    resolver: zodResolver(userReAssignEmailFormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: UserReAssignEmailValues) => {
    try {
      await UserServices.userReassignEmail(userId, data.email); // API call with userId and email
      toast({
        title: "Email re-assigned successfully!",
        description: `New email: ${data.email}`,
      });
    } catch (error) {
      toast({
        title: "Failed to re-assign email",
        description: "Please try again.",
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="font-bold" variant="outline">
          Re-assign Email
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-64">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter new email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full mt-2 bg-blue-500 hover:bg-blue-600"
            >
              Confirm
            </Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};
