export const handleBadgeStatusColor = (status: number): string => {
  switch (status) {
    case 0: // Active
      return "bg-green-400 hover:bg-green-500";
    case 1: // Inactive
      return "bg-slate-400 hover:bg-slate-500";
    case 2: // Ban
      return "bg-red-400 hover:bg-red-500";
    case 3: // PendingVerify
      return "bg-blue-400 hover:bg-blue-500";
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
  }
};

export const handleBadgeStatusColorString = (status: string): string => {
  switch (status) {
    case "Active": // Active
      return "bg-green-400 hover:bg-green-500";
    case "Expired": //Expired
      return "bg-slate-400 hover:bg-slate-500";
    case "Canceled": // Canceled
      return "bg-red-400 hover:bg-red-500";
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
  }
};
