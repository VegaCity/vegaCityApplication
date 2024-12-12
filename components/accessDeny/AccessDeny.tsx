"use client";
import { AlertCircle } from "lucide-react"; // Icon from ShadCN UI
import { cn } from "@/lib/utils"; // Utility for conditional classes (if needed)
import { useRouter } from "next/navigation";

const AccessDenied = ({ error }: { error: string }) => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-6">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-sm">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-500">
            <AlertCircle size={24} />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Access Denied!</h2>
        <p className="mt-2 text-sm text-gray-600">{error}</p>

        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors"
        >
          Click to Return
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
