import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ReportServices } from "@/components/services/reportServices";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PencilIcon } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusConfig: { [key: number]: { label: string; className: string } } = {
  0: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  1: {
    label: "Processing",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  2: {
    label: "Done",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  3: {
    label: "Cancel",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
};
interface ReportTableProps {
  limit?: number;
  title?: string;
}

interface ReportData {
  id: string;
  issueTypeId: string;
  description: string;
  solveBy: string;
  creator: string;
  solution: string;
  status: number;
}

interface ApiResponse {
  statusCode: number;
  messageResponse: string;
  data: ReportData[];
  metadata: {
    size: number;
    page: number;
    total: number;
    totalPage: number;
  };
}

interface ApiError {
  StatusCode: number;
  Error: string;
  TimeStamp: string;
}

const EditReportSchema = z.object({
  solution: z
    .string({ required_error: "Solution is required" })
    .trim()
    .min(1, { message: "Solution cannot be empty" }),
  solveBy: z.string(),
  status: z.string(),
});
const ConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Support</DialogTitle>
          <DialogDescription>
            Do you want to help with this report? By confirming, you will be
            assigned to handle this issue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditReportDialog = ({
  report,
  onSuccess,
  open,
  onOpenChange,
}: {
  report: ReportData;
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(EditReportSchema),
    defaultValues: {
      solution: report.solution || "",
      solveBy: "Cashier Web",
      status: report.status?.toString() || "0",
    },
  });

  const onSubmit = async (values: z.infer<typeof EditReportSchema>) => {
    try {
      await ReportServices.editReport(report.id, {
        solution: values.solution,
        status: 2,
        solveBy: values.solveBy,
      });

      toast({
        title: "Success",
        description: "Report updated successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      let errorMessage = "Failed to update report";

      if (error.response?.data) {
        const apiError = error.response.data as ApiError;
        errorMessage = `${apiError.Error}`;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="solution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solution</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="solveBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solve By</FormLabel>
                  <FormControl>
                    <Input readOnly {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const ReportTable = ({ limit, title }: ReportTableProps) => {
  const [reportList, setReportList] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ApiResponse["metadata"] | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { toast } = useToast();

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return {
          label: "Pending",
          className:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
      case 1:
        return {
          label: "Processing",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
      case 2:
        return {
          label: "Done",
          className:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case 3:
        return {
          label: "Cancel",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
      default:
        return {
          label: "Unknown",
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        };
    }
  };

  const fetchReports = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ReportServices.getReports({
        page: page,
        size: pageSize,
      });

      if (!response?.data?.data) {
        throw new Error("No data received from the server");
      }

      setReportList(response.data.data);
      setMetadata(response.data.metadata);
      setCurrentPage(page);
    } catch (error: any) {
      // Handle the specific error format
      let errorMessage = "Failed to fetch reports";

      if (error.response?.data) {
        const apiError = error.response.data as ApiError;
        errorMessage = `${apiError.Error} (Status: ${
          apiError.StatusCode
        }, Time: ${new Date(apiError.TimeStamp).toLocaleString()})`;
      }

      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);
  const handleEditClick = (report: ReportData) => {
    setSelectedReport(report);
    if (report.status === 0) {
      setIsConfirmDialogOpen(true);
    } else {
      setIsEditDialogOpen(true);
    }
  };

  const handleConfirmSupport = async () => {
    if (!selectedReport) return;

    try {
      await ReportServices.editReport(selectedReport.id, {
        status: 1, // Set to Processing
        solveBy: "Cashier Web",
        solution: selectedReport.solution || "",
      });

      await fetchReports(currentPage);
      setIsConfirmDialogOpen(false);
      setIsEditDialogOpen(true);
    } catch (error: any) {
      let errorMessage = "Failed to update report status";
      if (error.response?.data) {
        const apiError = error.response.data as ApiError;
        errorMessage = apiError.Error;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleCancelSupport = () => {
    setIsConfirmDialogOpen(false);
    setSelectedReport(null);
  };
  const handleEdit = (report: ReportData) => {
    setSelectedReport(report);
    setIsEditDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">{title || "Reports"}</h3>
        <div className="text-gray-600">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">{title || "Reports"}</h3>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!reportList?.length) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">{title || "Reports"}</h3>
        <div className="text-gray-600">No reports found</div>
      </div>
    );
  }

  const filteredReports = limit ? reportList.slice(0, limit) : reportList;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title || "Reports Table"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">NO</TableHead>
                <TableHead className="w-1/3">Description</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-1/4">Solution</TableHead>
                <TableHead className="w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report, i) => (
                <TableRow key={report.id}>
                  <TableCell>{(currentPage - 1) * 10 + i + 1}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {report.description}
                  </TableCell>
                  <TableCell>{report.creator}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[report.status]?.className}>
                      {statusConfig[report.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {report.solution}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(report)}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {metadata && metadata.totalPage > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from(
              { length: Math.min(5, metadata.totalPage) },
              (_, i) =>
                i +
                Math.max(1, Math.min(currentPage - 2, metadata.totalPage - 4))
            ).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(metadata.totalPage, p + 1))
              }
              disabled={currentPage === metadata.totalPage}
            >
              Next
            </Button>
          </div>
        )}
        {selectedReport && (
          <ConfirmationDialog
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
            onConfirm={handleConfirmSupport}
            onCancel={handleCancelSupport}
          />
        )}

        {selectedReport && (
          <EditReportDialog
            report={selectedReport}
            onSuccess={() => fetchReports(currentPage)}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ReportTable;
