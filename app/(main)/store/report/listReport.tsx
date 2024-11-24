import React, { useState, useEffect } from "react";
import { ReportServices } from "@/components/services/reportServices";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportData {
  id: string;
  issueType: {
    name: string;
  };
  status: number;
  createdDate: string;
  description: string;
  response?: string;
  upsDate: string | null;
  creator: string;
  creatorStoreId: string; // Added creatorStoreId field
  solution?: string;
}

interface ApiError {
  Error: string;
  StatusCode: number;
  TimeStamp: string;
}

interface Metadata {
  totalPages: number;
  totalElements: number;
  size: number;
  page: number;
}

const ReportList = () => {
  const [reportList, setReportList] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const pageSize = 100;
  const { toast } = useToast();

  // Get storeId from localStorage
  const userStoreId = localStorage.getItem("storeId");

  useEffect(() => {
    if (!userStoreId) {
      setError("Store ID not found. Please login again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Store ID not found. Please login again.",
      });
      return;
    }
    fetchReports(1);
  }, [userStoreId]);

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

      // Filter reports to show only those matching the store ID
      const filteredReports = response.data.data.filter(
        (report: ReportData) => report.creatorStoreId === userStoreId
      );

      setReportList(filteredReports);
      // Adjust metadata to reflect filtered results
      setMetadata({
        ...response.data.metadata,
        totalElements: filteredReports.length,
        totalPages: Math.ceil(filteredReports.length / pageSize),
      });
      setCurrentPage(page);
    } catch (error: any) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (report: ReportData) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Reports List</h1>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Solution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : reportList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No reports found for this store
                </TableCell>
              </TableRow>
            ) : (
              reportList.map((report, index) => (
                <TableRow key={report.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{report.creator}</TableCell>
                  <TableCell>{report.description}</TableCell>

                  <TableCell>{formatDate(report.upsDate ?? "")}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        getStatusInfo(report.status).className
                      }`}
                    >
                      {getStatusInfo(report.status).label}
                    </span>
                  </TableCell>
                  <TableCell>{report.solution}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedReport && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Issue Type</h3>
                <p>{selectedReport.issueType.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Status</h3>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    getStatusInfo(selectedReport.status).className
                  }`}
                >
                  {getStatusInfo(selectedReport.status).label}
                </span>
              </div>
              {selectedReport.response && (
                <div>
                  <h3 className="font-medium">Admin Response</h3>
                  <p className="whitespace-pre-wrap">
                    {selectedReport.response}
                  </p>
                </div>
              )}
              <div>
                <h3 className="font-medium">Created Date</h3>
                <p>{formatDate(selectedReport.createdDate)}</p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default ReportList;
