"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, List, DollarSign } from "lucide-react";
import ReportPage from "./createReport";
import ReportList from "./listReport";
import RequestWithdrawPage from "@/app/(main)/store/report/withdrawRequest";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("list");
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleCompleteChange = () => {
    setActiveTab("list");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">Reports Management</h1>
        <p className="text-gray-500">Create and manage your reports</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        defaultValue="list"
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list" className="space-x-2">
              <List className="h-4 w-4" />
              <span>Reports List</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Report</span>
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Request Withdraw</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Action Button - Optional */}
          <div className="hidden sm:block">
            <TabsList>
              <TabsTrigger value="create" asChild>
                <Button variant="outline" size="sm" className="space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Report</span>
                </Button>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="list" className="m-0">
          <ReportList />
        </TabsContent>

        <TabsContent value="create" className="m-0">
          <ReportPage onCompleteChange={handleCompleteChange} />
        </TabsContent>

        <TabsContent value="withdraw" className="m-0">
          <RequestWithdrawPage onCompleteChange={handleCompleteChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
