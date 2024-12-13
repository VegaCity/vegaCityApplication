export const handleBadgeStatusColor = (status: number): string => {
  switch (status) {
    case 0: // Active
      return "border-green-400 bg-green-100 hover:bg-green-400 text-green-500 hover:text-white";
    case 1: // disable
      return "bg-slate-400 hover:bg-slate-500";
    case 2: // Ban
      return "border-red-400 bg-red-100 hover:bg-red-400 text-red-500 hover:text-white";
    case 3: // PendingVerify
      return "border-blue-400 bg-blue-100 hover:bg-blue-400 text-blue-500 hover:text-white";
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
  }
};

//------------ Store Status Color ----------------
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

//------------ Promotion Status Color ----------------
export const handleBadgePromotionStatusColor = (status: number): string => {
  switch (status) {
    case 0: // Active
      return "border-green-400 bg-green-100 hover:bg-green-400 text-green-500 hover:text-white";
    case 1: // Inactive
      return "bg-slate-400 hover:bg-slate-500";
    case 2: // Expired
      return "border-red-400 bg-red-100 hover:bg-red-400 text-red-500 hover:text-white";
    case 3: // Automation
      return "border-blue-400 bg-blue-100 hover:bg-blue-400 text-blue-500 hover:text-white";
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
  }
};

//------------ Deflag Status Color ----------------
export const handleBadgeDeflagStatusColor = (status: boolean): string => {
  if (status) {
    return "bg-red-400 hover:bg-red-500";
  } else {
    return "bg-green-400 hover:bg-green-500";
  }
};

//------------ Status Color ----------------
export const handleBadgeStatusColorString = (status: string): string => {
  switch (status) {
    case "Active": // Active
      return "border-green-400 bg-green-100 hover:bg-green-400 text-green-500 hover:text-white";
    case "Expired": //Expired
      return "bg-red-500 hover:bg-red-600";
    case "Canceled": // Canceled
      return "bg-slate-400 hover:bg-slate-500";
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
  }
};

//------------ Package Type Status Color ----------------
export const handleBadgePackageTypeColorString = (status: string): string => {
  switch (status) {
    case "ServicePackage": // Service Package
      return "bg-blue-400 hover:bg-blue-500";
    case "SpecificPackage": //Specific Package
      return "bg-badgePurple hover:bg-badgePurple-hover";
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
  }
};

//------------ Role Color ----------------
export const handleBadgeRoleColorString = (role: string): string => {
  switch (role) {
    case "Store":
      return "bg-green-400 hover:bg-green-500"; // Green for Store
    case "CashierWeb":
      return "bg-sky-500 hover:bg-sky-600"; // Yellow for CashierWeb
    case "CashierApp":
      return "bg-blue-400 hover:bg-blue-500"; // Orange for CashierApp
    case "Admin":
      return "bg-red-400 hover:bg-red-500"; // Red for Admin (highest authorization)
    default:
      return "bg-gray-400 hover:bg-gray-500"; // Default color for undefined roles
  }
};
