"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ModalType = "new-request" | "register-donor" | "find-blood" | "send-alert" | "view-details" | "launch-campaign" | null;

interface DashboardContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  modalType: ModalType;
  setModalType: (type: ModalType) => void;
  selectedRequest: any;
  setSelectedRequest: (request: any) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <DashboardContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        modalType,
        setModalType,
        selectedRequest,
        setSelectedRequest,
        refreshTrigger,
        triggerRefresh,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    // Return a safe fallback object to prevent crashing when rendered outside DashboardProvider (e.g. standalone pages)
    return {
      searchQuery: "",
      setSearchQuery: () => {},
      modalType: null,
      setModalType: () => {},
      selectedRequest: null,
      setSelectedRequest: () => {},
      refreshTrigger: 0,
      triggerRefresh: () => {},
      unreadCount: 0,
      setUnreadCount: () => {},
    };
  }
  return context;
}
