import { Loader2 } from "lucide-react";

interface IsLoadingProps {
  isLoading: boolean;
}

export const Loader = ({ isLoading }: IsLoadingProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
};
