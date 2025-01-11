import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ReportServices } from "@/components/services/reportServices";
import { IssueTypeServices } from "@/components/services/isssueType";
import { ReportPostStore } from "@/types/report/report";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AxiosError, AxiosResponse } from "axios";
import { StoreServices } from "@/components/services/Store/storeServices";
import { useRouter } from "next/navigation";
interface IssueType {
  id: string;
  name: string;
  crDate: string;
  deflag: boolean;
}

interface ReportPageProps {
  onCompleteChange: () => void;
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

interface StoreDataProps {
  name: string;
  email: string;
}

export const ReportPage = ({ onCompleteChange }: ReportPageProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [formData, setFormData] = useState<ReportPostStore>({
    issueTypeId: "",
    description: "",
    creatorStoreId: "",
  });
  const [storeData, setStoreData] = useState<StoreDataProps>({
    name: "",
    email: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchIssueTypes();
  }, []);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIssueTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      issueTypeId: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!formData.issueTypeId || !formData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const storeId = localStorage.getItem("storeId");
      if (!storeId) {
        toast({
          title: "Error",
          description: "Store ID not found",
          variant: "destructive",
        });
        return;
      }

      const reportData = {
        ...formData,
        creatorStoreId: storeId,
      };

      const response = await ReportServices.createReportByStore(reportData);

      toast({
        title: "Success",
        description: "Report created successfully",
      });
      // Navigate to tab list report
      setTimeout(() => {
        onCompleteChange();
      }, 1000);
      setFormData({
        issueTypeId: "",
        description: "",
        creatorStoreId: storeId,
      });
    } catch (error) {
      console.error("Error creating report:", error);
      toast({
        title: "Error",
        description: "Failed to create report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const storeId = localStorage.getItem("storeId");
        if (storeId) {
          setFormData((prev) => ({
            ...prev,
            creatorStoreId: storeId,
          }));
          const storeRes = await StoreServices.getStoreById(storeId);
          const storeData = storeRes.data.data;
          setStoreData({
            name: storeData.store.name,
            email: storeData.store.email,
          });
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          toast({
            title: "Error",
            description:
              error.response?.data.Error ||
              error.response?.data.messageResponse,
          });
          console.log(error);
        }
      }
    };
    fetchStoreData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Create Report</h1>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="issueType"
            className="block text-sm font-medium text-gray-700"
          >
            Issue Type
          </label>
          <Select
            value={formData.issueTypeId}
            onValueChange={handleIssueTypeChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an issue type" />
            </SelectTrigger>
            <SelectContent>
              {issueTypes.map((issueType: IssueType) => (
                <SelectItem key={issueType.id} value={issueType.id}>
                  {issueType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full"
            disabled={isLoading}
          />
        </div>

        <div className="text-right">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="p-4 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
