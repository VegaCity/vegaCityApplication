import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IsLoadingProps {
  isLoading?: boolean;
  className?: string;
}

export const Loader = ({ isLoading, className }: IsLoadingProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2
          className={cn("w-8 h-8 animate-spin text-primary", className)}
        />
      </div>
    );
  }
};
