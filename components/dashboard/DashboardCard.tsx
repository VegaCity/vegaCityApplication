import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  count: string | number;
  icon: ReactNode;
  prefix?: string;
}

const DashboardCard = ({
  title,
  count,
  icon,
  prefix = "",
}: DashboardCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {prefix}
            {count}
          </p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
