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
    <div className="bg-slate-100 hover:bg-slate-200 rounded-lg shadow p-6 flex-1 dark:bg-background dark:border dark:border-blue-500 hover:dark:bg-blue-300 transition-colors duration-100 ">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-muted-foreground dark:text-white">
            {title}
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2 dark:text-white">
            {prefix}
            {count}
          </p>
        </div>
        <div className="text-gray-400 dark:text-blue-200">{icon}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
