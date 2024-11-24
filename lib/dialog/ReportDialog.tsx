import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosResponse } from "axios";
import { IssueTypeServices } from "@/components/services/isssueType";
import { ReportServices } from "@/components/services/reportServices";
const reportSchema = z.object({
  issueTypeId: z.string().min(1, "Please select an issue type"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ReportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
};

interface IssueType {
  id: string;
  name: string;
  crDate: string;
  deflag: boolean;
}
interface IssueTypeResponse {
  data: IssueType[];
  messageResponse: string;
  statusCode: number;
  metaData: {
    size: number;
    page: number;
    total: number;
    totalPage: number;
  };
  parentName: null;
  qrCode: null;
}
const ReportDialog = ({ isOpen, onClose, packageId }: ReportDialogProps) => {
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      issueTypeId: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const response: AxiosResponse<IssueTypeResponse> =
          await IssueTypeServices.getIssueTypes({
            page: 1,
            size: 100,
          });

        // Kiểm tra status code từ response
        if (response.status !== 200) {
          throw new Error("Failed to fetch issue types");
        }

        // Kiểm tra status code từ data API
        if (response.data.statusCode !== 200) {
          throw new Error(
            response.data.messageResponse || "Failed to fetch issue types"
          );
        }

        // Validate dữ liệu
        if (!Array.isArray(response.data.data)) {
          throw new Error("Invalid data format received");
        }

        // Validate từng item trong mảng
        const validIssueTypes = response.data.data.filter(
          (item): item is IssueType => {
            return (
              typeof item === "object" &&
              item !== null &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.crDate === "string" &&
              typeof item.deflag === "boolean"
            );
          }
        );

        setIssueTypes(validIssueTypes);

        // Log warning nếu có issue types không hợp lệ
        if (validIssueTypes.length !== response.data.data.length) {
          console.warn(
            "Some issue types were filtered out due to invalid data format",
            response.data.data
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching issue types";

        console.error("Error fetching issue types:", error);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setIssueTypes([]);
      }
    };

    if (isOpen) {
      fetchIssueTypes();
    }
  }, [isOpen, toast]);

  const onSubmit = async (values: z.infer<typeof reportSchema>) => {
    try {
      setIsLoading(true);
      const reportData = {
        creatorPackageOrderId: packageId,
        issueTypeId: values.issueTypeId,
        description: values.description,
      };

      await ReportServices.createReportByUser(reportData);

      toast({
        title: "Success",
        description: "Report submitted successfully , Please wait for response",
      });

      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Report</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="issueTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an issue type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {issueTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the issue..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
