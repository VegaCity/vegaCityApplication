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
import { StoreServices } from "@/components/services/storeServices";
import { Badge } from "@/components/ui/badge";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
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
interface ReportTableProps {
  limit?: number;
  title?: string;
}

interface ReportData {
  id: string;
  issueTypeId: string;
  description: string;
  storeId: string;
  storeName?: string;
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
    defaultValues: {
      solution: report.solution,
      status: report.status.toString(),
    },
  });

  const onSubmit = async (values: any) => {
    try {
      await ReportServices.editReport(report.id, {
        solution: values.solution,
        status: parseInt(values.status),
      });

      toast({
        title: "Success",
        description: "Report updated successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update report",
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="1">Processing</SelectItem>
                      <SelectItem value="2">Done</SelectItem>
                      <SelectItem value="3">Cancel</SelectItem>
                    </SelectContent>
                  </Select>
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

  const fetchStoreName = async (storeId: string) => {
    try {
      const response = await StoreServices.getStoreById(storeId);
      return response.data.data.store.name;
    } catch {
      return "Unknown Store";
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

      const reportData = response.data.data;
      const updatedReports = await Promise.all(
        reportData?.map(async (report: ReportData) => ({
          ...report,
          storeName: await fetchStoreName(report.storeId),
        }))
      );

      setReportList(updatedReports);
      setMetadata(response.data.metadata);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch reports";
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
        <h3 className="text-2xl font-semibold">Reports</h3>
        <div className="text-gray-600">Data is fetching... Please wait...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Reports</h3>
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={() => fetchReports(currentPage)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!reportList.length) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Reports</h3>
        <div className="text-gray-600">No reports found</div>
      </div>
    );
  }

  const filteredReports = limit ? reportList.slice(0, limit) : reportList;

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold">Reports</h3>
      <Table>
        <TableCaption>
          {metadata &&
            `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(
              currentPage * pageSize,
              metadata.total
            )} of ${metadata.total} reports • Page ${metadata.page} of ${
              metadata.totalPage
            }`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">NO</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Store Name</TableHead>
            <TableHead className="hidden md:table-cell w-24">Status</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReports.map((report, i) => {
            const statusInfo = getStatusInfo(report.status);
            return (
              <TableRow key={report.id}>
                <TableCell>{(currentPage - 1) * pageSize + i + 1}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {report.description}
                </TableCell>
                <TableCell>{report.storeName}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(report)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {metadata && (
        <PaginationControls
          metadata={metadata}
          onPageChange={handlePageChange}
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
    </div>
  );
};

const PaginationControls = ({
  metadata,
  onPageChange,
}: {
  metadata: ApiResponse["metadata"];
  onPageChange: (page: number) => void;
}) => {
  const { page, totalPage } = metadata;
  const maxVisiblePages = 5;
  const pages = Array.from(
    { length: Math.min(totalPage, maxVisiblePages) },
    (_, i) => page - 2 + i
  ).filter((p) => p > 0 && p <= totalPage);

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      {page > 1 && (
        <Button variant="outline" onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
      )}
      {pages.map((pageNum) => (
        <Button
          key={pageNum}
          variant={pageNum === page ? "default" : "outline"}
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum}
        </Button>
      ))}
      {page < totalPage && (
        <Button variant="outline" onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      )}
    </div>
  );
};

export default ReportTable;
