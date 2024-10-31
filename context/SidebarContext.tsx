"use client";

import React, { useState, useContext, ReactNode } from "react";

// Define the SidebarContext type
type SidebarContextType = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be use into Sidebar Provider");
  }
  return context;
};

export const SiderbarProviderCustom = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, setState] = useState<"expanded" | "collapsed">("collapsed");
  const [open, setOpen] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const isMobile = window.innerWidth <= 768;

  const toggleSidebar = () => {
    setState((prev) => (prev === "expanded" ? "collapsed" : "expanded"));
  };

  const contextValue: SidebarContextType = {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};
