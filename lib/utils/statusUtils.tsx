export const handleBadgeStatusColor = (status: number): string => {
  switch (status) {
    case 0: // Active
      return "bg-green-400 hover:bg-green-500";
    case 1: // disable
      return "bg-slate-400 hover:bg-slate-500";
    case 2: // Ban
      return "bg-red-400 hover:bg-red-500";
    case 3: // PendingVerify
      return "bg-blue-400 hover:bg-blue-500";
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
  }
};

export const handleBadgeStoreStatusColor = (status: number): string => {
  switch (status) {
    case 0: // open
      return "bg-green-400 hover:bg-green-500";
    case 1: // closed
      return "bg-slate-400 hover:bg-slate-500";
    case 2: // InActive
      return "bg-slate-400 hover:bg-slate-500";
    case 3: // Blocked
      return "bg-red-400 hover:bg-red-500";
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
  }
};

export const handleBadgePromotionStatusColor = (status: number): string => {
  switch (status) {
    case 0: // Active
      return "bg-green-400 hover:bg-green-500";
    case 1: // Inactive
      return "bg-slate-400 hover:bg-slate-500";
    case 2: // Expired
      return "bg-red-500 hover:bg-red-600";
    case 3: // Automation
      return "bg-blue-400 hover:bg-blue-500";
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
  }
};

export const handleBedageWalletStatusColor = (status: boolean): string => {
  if (status) {
    return "bg-red-400 hover:bg-red-500";
  } else {
    return "bg-green-400 hover:bg-green-500";
  }
};

export const handleBadgeStatusColorString = (status: string): string => {
  switch (status) {
    case "Active": // Active
      return "bg-green-400 hover:bg-green-500";
    case "Expired": //Expired
      return "bg-red-500 hover:bg-red-600";
    case "Canceled": // Canceled
      return "bg-slate-400 hover:bg-slate-500";
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
  }
};
