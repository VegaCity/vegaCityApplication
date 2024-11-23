"use client";
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
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react";
import { IssueTypeServices } from "../services/isssueType";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IssueType {
  id: string;
  name: string;
  crDate: string;
}

interface ApiResponse {
  statusCode: number;
  messageResponse: string;
  data: IssueType[];
  metaData: {
    size: number;
    page: number;
    total: number;
    totalPage: number;
  };
}

interface IssueTypePageProps {
  limit?: number;
  title?: string;
}

const IssueTypeTable = ({ limit, title }: IssueTypePageProps) => {
  const [issueList, setIssueList] = useState<IssueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ApiResponse["metaData"] | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [newIssueName, setNewIssueName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const pageSize = 10;
  const { toast } = useToast();

  const fetchIssueTypes = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await IssueTypeServices.getIssueTypes({
        page: page,
        size: pageSize,
      });
      if (!response?.data) {
        throw new Error("No data received from the server");
      }
      setIssueList(response.data.data);
      setMetadata(response.data.metaData);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch issue types";
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

  const handleCreateIssueType = async () => {
    try {
      if (!newIssueName.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Issue type name cannot be empty",
        });
        return;
      }

      await IssueTypeServices.createIssueType({ name: newIssueName });
      toast({
        title: "Success",
        description: "Issue type created successfully",
      });
      setNewIssueName("");
      fetchIssueTypes(currentPage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create issue type";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleDeleteIssueType = async () => {
    if (!deleteId) return;

    try {
      await IssueTypeServices.deleteIssueType(deleteId);
      toast({
        title: "Success",
        description: "Issue type deleted successfully",
      });
      fetchIssueTypes(currentPage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete issue type";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setDeleteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchIssueTypes(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">{title || "Issue Types"}</h3>
        <div className="text-gray-600">Loading issue types...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">{title || "Issue Types"}</h3>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const filteredIssues = limit ? issueList.slice(0, limit) : issueList;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold">{title || "Issue Types"}</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-sky-600 text-white">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Issue Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Issue Type</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newIssueName}
                onChange={(e) => setNewIssueName(e.target.value)}
                placeholder="Enter issue type name"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateIssueType}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>
          {metadata &&
            `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(
              currentPage * pageSize,
              metadata.total
            )} of ${metadata.total} issues • Page ${metadata.page} of ${
              metadata.totalPage
            }`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">NO</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Create Date</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredIssues.map((issue, i) => (
            <TableRow key={issue.id}>
              <TableCell>{(currentPage - 1) * pageSize + i + 1}</TableCell>
              <TableCell>{issue.name}</TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDate(issue.crDate)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteId(issue.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected issue type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIssueType}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {metadata && metadata.totalPage > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          {metadata.page > 1 && (
            <Button
              variant="outline"
              onClick={() => handlePageChange(metadata.page - 1)}
            >
              Previous
            </Button>
          )}
          {Array.from(
            { length: Math.min(metadata.totalPage, 5) },
            (_, i) => metadata.page - 2 + i
          )
            .filter((p) => p > 0 && p <= metadata.totalPage)
            .map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === metadata.page ? "default" : "outline"}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          {metadata.page < metadata.totalPage && (
            <Button
              variant="outline"
              onClick={() => handlePageChange(metadata.page + 1)}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueTypeTable;
