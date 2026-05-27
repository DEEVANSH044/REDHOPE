"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, Check, ShieldAlert, AlertTriangle, UserPlus } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

export default function Topbar() {
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("admin");
  const [initials, setInitials] = useState("AD");
  
  // Dashboard context states
  const { searchQuery, setSearchQuery, unreadCount, setUnreadCount, refreshTrigger, triggerRefresh } = useDashboard();
  
  // Local notification list and dropdown state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notifications", {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const notifs = data.data || [];
        setNotifications(notifs);
        const unread = notifs.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error("Failed to load notifications in Topbar", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [refreshTrigger]);

  // Decode JWT on mount
  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64));
          if (decoded && decoded.email) {
            const emailPrefix = decoded.email.split("@")[0];
            const cleanParts = emailPrefix.split(/[\d._-]+/).filter(Boolean);
            const formattedName = cleanParts
              .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ");
            const displayName = decoded.name || formattedName || "User";
            setUserName(displayName);
            setUserRole(decoded.role || "user");

            const words = displayName.split(" ");
            const parsedInitials = words.length > 1 
              ? (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
              : displayName.slice(0, 2).toUpperCase();
            setInitials(parsedInitials || "U");
          }
        }
      }
    } catch (e) {
      console.error("Failed to decode token in Topbar", e);
    }
  }, []);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ action: "read_all" })
      });
      if (res.ok) {
        // Optimistic UI update
        setNotifications((prev: any[]) => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        triggerRefresh();
      }
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  // Mark single as read
  const handleMarkRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ action: "read", notificationId: id })
      });
      if (res.ok) {
        // Update local state
        setNotifications((prev: any[]) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(Math.max(0, unreadCount - 1));
        triggerRefresh();
      }
    } catch (e) {
      console.error("Failed to mark single notification as read", e);
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white px-8 py-5 shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div>
          <h3 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">Dashboard</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 text-sm">Welcome back, <span className="font-semibold text-gray-800">{userName}</span></p>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
              userRole === "admin"
                ? "bg-red-50 text-red-700 border-red-200"
                : userRole === "bloodbank"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : userRole === "ngo"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : userRole === "donor"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
            }`}>
              {userRole === "user" ? "Patient / User" : userRole}
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5">
          {/* Search Bar */}
          <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-xl border w-96 focus-within:ring-2 focus-within:ring-red-200 transition">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search pending requests, hospitals, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none w-full text-gray-700 text-sm bg-transparent"
            />
          </div>

          {/* Notification Menu Container */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2.5 text-gray-500 rounded-xl border transition ${
                isOpen ? "bg-gray-100 border-gray-300" : "bg-white hover:bg-gray-50"
              }`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Premium Alerts Dropdown */}
            {isOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-800">Alert Center</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-0.5 hover:underline"
                    >
                      <Check size={14} /> Clear Unread
                    </button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Bell size={24} className="text-gray-300 mb-1.5" />
                      <p className="text-xs font-medium">No alerts received yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const iconBg = 
                        notif.type === "EMERGENCY" 
                          ? "bg-red-50 text-red-600" 
                          : notif.type === "LOW_STOCK" 
                            ? "bg-yellow-50 text-yellow-700" 
                            : "bg-green-50 text-green-600";

                      const IconComp = 
                        notif.type === "EMERGENCY" 
                          ? ShieldAlert 
                          : notif.type === "LOW_STOCK" 
                            ? AlertTriangle 
                            : UserPlus;

                      return (
                        <div 
                          key={notif.id} 
                          className={`p-3.5 flex items-start gap-3 hover:bg-gray-50/55 transition relative ${
                            !notif.isRead ? "bg-red-50/10" : ""
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg flex-shrink-0 ${iconBg}`}>
                            <IconComp size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h5 className={`text-xs font-bold text-gray-900 truncate ${
                                !notif.isRead ? "font-extrabold" : ""
                              }`}>
                                {notif.title}
                              </h5>
                              {!notif.isRead && (
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                              {notif.desc}
                            </p>
                            <span className="text-[9px] text-gray-400 mt-1 block">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                            </span>
                          </div>
                          
                          {/* Individual read button */}
                          {!notif.isRead && (
                            <button
                              onClick={() => handleMarkRead(notif.id)}
                              title="Mark as Read"
                              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100/50 transition flex-shrink-0"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 text-center bg-gray-50/50 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 font-medium">Showing {notifications.length} alerts</span>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 border border-red-700">
            {initials}
          </div>
        </div>
      </div>
    </div>
  );
}
