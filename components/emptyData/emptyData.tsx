import React from "react";
import { FolderSearch } from "lucide-react";

interface EmptyDataPageProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

const EmptyDataPage: React.FC<EmptyDataPageProps> = ({
  title = "No Data Available",
  description = "There is currently no data to display.",
  actionLabel = "Add New Item",
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6 text-center">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <FolderSearch className="w-36 h-36 p-2 text-gray-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyDataPage;
