import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Check } from "lucide-react";

type FormStatus = "idle" | "error" | "success";

interface FormData {
  type: string;
  title: string;
  description: string;
}

const ReportCard = () => {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState<FormData>({
    type: "",
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (Math.random() > 0.5) {
        throw new Error("500 | Internal server error");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setFormStatus("success");
    } catch (error) {
      setFormStatus("error");
    }
  };

  const resetForm = () => {
    setFormStatus("idle");
    setFormData({
      type: "",
      title: "",
      description: "",
    });
  };

  if (formStatus === "success") {
    return (
      <Card className="flex flex-col justify-between overflow-hidden shadow-lg rounded-lg">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Success!</h2>
        <p className="text-center text-gray-600">
          Your bug report request has been submitted successfully.
        </p>
        <p className="text-sm text-gray-500">
          You can{" "}
          <button className="text-blue-500 hover:underline" onClick={resetForm}>
            click here
          </button>{" "}
          to track the status of your request.
        </p>
      </Card>
    );
  }

  if (formStatus === "error") {
    return (
      <div className="w-full flex justify-center">
        <Card className="w-full max-w-xl max-h-2xl p-6 flex flex-col items-center space-y-4">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold">Failed!</h2>
          <p className="text-center text-gray-600">
            Sorry, it seems your request failed.
          </p>
          <p className="text-sm text-gray-500">
            Error 500 | Internal server error
          </p>
          <Button onClick={resetForm}>TRY AGAIN</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-5xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-center mb-8">
            Report a bug or request a feature
          </h2>

          <div className="flex items-center gap-4 md:w-1/3 mb-8">
            <label className="text-lg text-gray-600 whitespace-nowrap">
              I would like to
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Report a bug</SelectItem>
                <SelectItem value="feature">Request a feature</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mt-4">
            <label className="text-lg text-gray-600">Title</label>
            <Input
              placeholder="Enter a title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg text-gray-600">Description</label>
            <Textarea
              placeholder="Enter a description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end mt-8">
            <Button type="submit" className="w-1/5">
              Submit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ReportCard;
