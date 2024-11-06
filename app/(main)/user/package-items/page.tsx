import Link from "next/link";
import BackButton from "@/components/BackButton";

import PackageItemTable from "@/components/package-items/PackageItemTable";

const ETagsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/" />
      </div>
      <PackageItemTable />
    </div>
  );
};

export default ETagsPage;
