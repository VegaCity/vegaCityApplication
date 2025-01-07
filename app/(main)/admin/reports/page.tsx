"use client";
import BackButton from "@/components/BackButton";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import { useState } from "react";
// import { ReportServices } from "@/components/services/reportService";
// import { Report } from "@/types/report";
import ReportTable from "@/components/reports/ReportTable";

const ReportPage = () => {
  const { user } = useAuthUser();
  const [reports, setReports] = useState<Report[]>([]);

  return (
    <div className="container mx-auto p-4">
      <BackButton link="/" />
      <div className="w-full h-auto">
        <ReportTable />
      </div>
    </div>
  );
};

export default ReportPage;
