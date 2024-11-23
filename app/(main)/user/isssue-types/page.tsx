import Link from "next/link";
import BackButton from "@/components/BackButton";

import IssueTypeTable from "@/components/issueType/IssueTypeTable";

const IssueTypesPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/" />
      </div>
      <IssueTypeTable />
    </div>
  );
};

export default IssueTypesPage;
