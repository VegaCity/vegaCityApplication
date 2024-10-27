"use client";
import React, { useEffect, useState } from "react";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import BackButton from "@/components/BackButton";
// import { ReportServices } from "@/components/services/reportService";
// import { Report } from "@/types/report";
import ReportCard from "@/components/card/reportcard";
import ReportTable from "@/components/reports/ReportTable";

const ReportPage = () => {
  const { user } = useAuthUser();
  const [reports, setReports] = useState<Report[]>([]);

  // useEffect(() => {
  //   if (user) {
  //     ReportServices.getReportsByUser(user.id).then((res) => {
  //       setReports(res.data);
  //     });
  //   }
  // }, [user]);

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
