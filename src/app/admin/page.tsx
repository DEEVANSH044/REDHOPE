"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Droplet,
  FileText,
  Calendar,
  LogOut,
  Search,
  Filter,
  Trash2,
  Check,
  X,
  Clock,
  MapPin,
  FileSpreadsheet,
  TrendingUp,
  AlertCircle,
  Shield,
  Activity as ActivityIcon,
  RefreshCw,
  Phone,
  Mail,
  User
} from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

interface UserType {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  bloodGroup?: string | null;
  role: string;
  createdAt: string;
}

interface BloodRequestType {
  id: number;
  userId: number;
  bloodGroup: string;
  quantity: number;
  urgency: string;
  note?: string | null;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  };
}

interface AppointmentType {
  id: number;
  userId: number;
  date: string;
  time: string;
  location: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    bloodGroup?: string | null;
  };
}

interface ActivityType {
  id: number;
  type: string;
  title: string;
  desc: string;
  createdAt: string;
}

interface StatsType {
  totalUsers: number;
  totalDonors: number;
  activeRequests: number;
  activeAppointments: number;
  totalStock: number;
  totalFulfilled: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "requests" | "appointments" | "activities">("overview");
  
  // Loading & Data states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsType>({
    totalUsers: 0,
    totalDonors: 0,
    activeRequests: 0,
    activeAppointments: 0,
    totalStock: 0,
    totalFulfilled: 0
  });
  const [users, setUsers] = useState<UserType[]>([]);
  const [requests, setRequests] = useState<BloodRequestType[]>([]);
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  
  // Search & filter states
  const [userSearch, setUserSearch] = useState("");
  const [userFilterRole, setUserFilterRole] = useState("all");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestFilterStatus, setRequestFilterStatus] = useState("all");
  const [activitySearch, setActivitySearch] = useState("");

  // Feedback notifications
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Authenticated Admin Info
  const [adminName, setAdminName] = useState("Administrator");
  const [adminEmail, setAdminEmail] = useState("deevanshrana011@gmail.com");

  // Show notification alert
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    try {
      // Decode Admin Name from JWT token if available
      try {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64));
          if (decoded.name) setAdminName(decoded.name);
          if (decoded.email) setAdminEmail(decoded.email);
        }
      } catch (err) {
        console.error("JWT decoding error:", err);
      }

      // 1. Fetch Stats & Overview
      const resStats = await fetch("/api/admin/overview", { headers });
      if (resStats.ok) {
        const data = await resStats.json();
        if (data.success) {
          setStats(data.data.stats);
          setActivities(data.data.recentActivities);
        }
      }

      // 2. Fetch Users
      const resUsers = await fetch("/api/admin/users", { headers });
      if (resUsers.ok) {
        const data = await resUsers.json();
        if (data.success) {
          setUsers(data.data);
        }
      }

      // 3. Fetch Blood Requests
      const resRequests = await fetch("/api/admin/requests", { headers });
      if (resRequests.ok) {
        const data = await resRequests.json();
        if (data.success) {
          setRequests(data.data);
        }
      }

      // 4. Fetch Appointments
      const resAppointments = await fetch("/api/admin/appointments", { headers });
      if (resAppointments.ok) {
        const data = await resAppointments.json();
        if (data.success) {
          setAppointments(data.data);
        }
      }

      // 5. Fetch Full Audit Activities
      const resActivities = await fetch("/api/admin/activities", { headers });
      if (resActivities.ok) {
        const data = await resActivities.json();
        if (data.success) {
          setActivities(data.data);
        }
      }

    } catch (err) {
      showToast("Failed to fetch dashboard data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update User Role
  const handleUpdateRole = async (userId: number, newRole: string) => {
    setActionLoading(`user-role-${userId}`);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("User role updated successfully!");
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        showToast(data.message || "Failed to update role", "error");
      }
    } catch (e) {
      showToast("Something went wrong", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account? All their requests and appointments will be removed.")) {
      return;
    }
    setActionLoading(`user-delete-${userId}`);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("User account successfully deleted!");
        setUsers(users.filter(u => u.id !== userId));
      } else {
        showToast(data.message || "Failed to delete user", "error");
      }
    } catch (e) {
      showToast("Something went wrong", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Update Blood Request Status
  const handleUpdateRequestStatus = async (requestId: number, newStatus: string) => {
    setActionLoading(`request-${requestId}`);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Request marked as ${newStatus}!`);
        setRequests(requests.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
        // Refresh stats & activities since inventory stock may have changed
        fetchData();
      } else {
        showToast(data.message || "Failed to update status", "error");
      }
    } catch (e) {
      showToast("Something went wrong", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Update Appointment Status
  const handleUpdateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    setActionLoading(`appointment-${appointmentId}`);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Appointment status changed to ${newStatus}!`);
        setAppointments(appointments.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a));
        // Refresh stats & activities since inventory stock may have incremented on completion
        fetchData();
      } else {
        showToast(data.message || "Failed to update status", "error");
      }
    } catch (e) {
      showToast("Something went wrong", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Log Out
  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; sameSite=lax;";
    router.push("/login");
  };

  // Filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          (user.phone && user.phone.includes(userSearch));
    const matchesRole = userFilterRole === "all" || user.role === userFilterRole;
    return matchesSearch && matchesRole;
  });

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.user.name.toLowerCase().includes(requestSearch.toLowerCase()) ||
                          req.bloodGroup.toLowerCase().includes(requestSearch.toLowerCase()) ||
                          (req.locationName && req.locationName.toLowerCase().includes(requestSearch.toLowerCase()));
    const matchesStatus = requestFilterStatus === "all" || req.status === requestFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredActivities = activities.filter(act => 
    act.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
    act.desc.toLowerCase().includes(activitySearch.toLowerCase()) ||
    act.type.toLowerCase().includes(activitySearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-[#0A0F1D] text-[#E2E8F0] flex ${inter.className}`}>
      
      {/* Dynamic Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
          notification.type === "success" 
            ? "bg-[#064E3B]/80 text-[#34D399] border-[#059669]/30" 
            : "bg-[#7F1D1D]/80 text-[#FCA5A5] border-[#B91C1C]/30"
        } backdrop-blur-xl`}>
          {notification.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* 1. PREMIUM SIDEBAR */}
      <aside className="w-72 bg-[#0E1528] border-r border-[#1E293B]/70 flex flex-col justify-between p-6 shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#DC2626]/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-[#EF4444]/15 p-2 rounded-xl border border-[#EF4444]/20 animate-pulse">
              <Droplet className="text-[#EF4444] w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight text-white ${playfair.className}`}>
                red<span className="text-[#EF4444]">hope</span>
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Admin Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-[#EF4444]/20 to-[#EF4444]/5 text-white border-l-4 border-[#EF4444] shadow-md shadow-[#EF4444]/5"
                  : "text-gray-400 hover:text-white hover:bg-[#1E293B]/30"
              }`}
            >
              <LayoutDashboard size={18} className={activeTab === "overview" ? "text-[#EF4444]" : ""} />
              Overview
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                activeTab === "users"
                  ? "bg-gradient-to-r from-[#EF4444]/20 to-[#EF4444]/5 text-white border-l-4 border-[#EF4444] shadow-md shadow-[#EF4444]/5"
                  : "text-gray-400 hover:text-white hover:bg-[#1E293B]/30"
              }`}
            >
              <Users size={18} className={activeTab === "users" ? "text-[#EF4444]" : ""} />
              Users Database
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                activeTab === "requests"
                  ? "bg-gradient-to-r from-[#EF4444]/20 to-[#EF4444]/5 text-white border-l-4 border-[#EF4444] shadow-md shadow-[#EF4444]/5"
                  : "text-gray-400 hover:text-white hover:bg-[#1E293B]/30"
              }`}
            >
              <FileText size={18} className={activeTab === "requests" ? "text-[#EF4444]" : ""} />
              Blood Requests
              {stats.activeRequests > 0 && (
                <span className="ml-auto bg-[#EF4444] text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                  {stats.activeRequests}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                activeTab === "appointments"
                  ? "bg-gradient-to-r from-[#EF4444]/20 to-[#EF4444]/5 text-white border-l-4 border-[#EF4444] shadow-md shadow-[#EF4444]/5"
                  : "text-gray-400 hover:text-white hover:bg-[#1E293B]/30"
              }`}
            >
              <Calendar size={18} className={activeTab === "appointments" ? "text-[#EF4444]" : ""} />
              Donor Bookings
              {stats.activeAppointments > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {stats.activeAppointments}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("activities")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                activeTab === "activities"
                  ? "bg-gradient-to-r from-[#EF4444]/20 to-[#EF4444]/5 text-white border-l-4 border-[#EF4444] shadow-md shadow-[#EF4444]/5"
                  : "text-gray-400 hover:text-white hover:bg-[#1E293B]/30"
              }`}
            >
              <ActivityIcon size={18} className={activeTab === "activities" ? "text-[#EF4444]" : ""} />
              System Audit Logs
            </button>
          </nav>
        </div>

        {/* User Card & Log Out */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#1A233D] rounded-2xl border border-[#1E293B]">
            <div className="bg-[#EF4444] text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md shadow-[#EF4444]/20 flex-shrink-0">
              {adminName.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-sm text-white truncate max-w-[130px]">{adminName}</p>
                <Shield className="w-3.5 h-3.5 text-[#EF4444]" fill="currentColor" />
              </div>
              <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{adminEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#1A233D]/50 hover:bg-[#EF4444]/10 hover:text-[#EF4444] text-gray-300 py-3 rounded-xl font-bold text-sm transition-all border border-[#1E293B] hover:border-[#EF4444]/20"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* TOP NAVBAR HEADER */}
        <header className="h-20 bg-[#0E1528] border-b border-[#1E293B]/70 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              {activeTab === "overview" && "System Overview"}
              {activeTab === "users" && "Users Database"}
              {activeTab === "requests" && "Blood Requests Log"}
              {activeTab === "appointments" && "Donor Bookings Hub"}
              {activeTab === "activities" && "System Audit Logs"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#1E293B]/50 hover:bg-[#1E293B] border border-[#1E293B] text-gray-400 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? "animate-spin text-[#EF4444]" : ""} />
            </button>

            <div className="h-6 w-[1px] bg-gray-700"></div>

            <div className="flex items-center gap-2 text-xs bg-[#1A233D] px-3.5 py-2 rounded-lg border border-[#1E293B]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              <span className="text-gray-400">Live Status:</span>
              <span className="font-bold text-white">SYSTEM ONLINE</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#070A13]">
          
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4 py-24">
              <div className="w-12 h-12 rounded-full border-4 border-[#EF4444]/20 border-t-[#EF4444] animate-spin"></div>
              <p className="text-gray-400 text-sm font-semibold tracking-wider">Synchronizing secure data records...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: SYSTEM OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Grid Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden group hover:border-[#EF4444]/30 transition-all hover:-translate-y-1">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-600/10 to-transparent rounded-full -mr-6 -mt-6"></div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Total Platform Users</span>
                        <div className="p-2.5 bg-red-500/10 text-[#EF4444] rounded-xl border border-red-500/15">
                          <Users size={20} />
                        </div>
                      </div>
                      <h3 className="text-3xl font-extrabold text-white">{stats.totalUsers}</h3>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <TrendingUp size={14} className="text-green-500" />
                        <span className="text-green-500 font-semibold">+12%</span> this month
                      </p>
                    </div>

                    <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden group hover:border-red-600/30 transition-all hover:-translate-y-1">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-600/10 to-transparent rounded-full -mr-6 -mt-6"></div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Registered Donors</span>
                        <div className="p-2.5 bg-red-500/10 text-[#EF4444] rounded-xl border border-red-500/15">
                          <Droplet size={20} />
                        </div>
                      </div>
                      <h3 className="text-3xl font-extrabold text-white">{stats.totalDonors}</h3>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <TrendingUp size={14} className="text-green-500" />
                        <span className="text-green-500 font-semibold">+8%</span> this week
                      </p>
                    </div>

                    <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden group hover:border-[#EF4444]/30 transition-all hover:-translate-y-1">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#EF4444]/10 to-transparent rounded-full -mr-6 -mt-6"></div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Active Blood Requests</span>
                        <div className="p-2.5 bg-[#EF4444]/10 text-[#EF4444] rounded-xl border border-[#EF4444]/15">
                          <FileText size={20} />
                        </div>
                      </div>
                      <h3 className="text-3xl font-extrabold text-white">{stats.activeRequests}</h3>
                      <p className="text-xs text-[#EF4444] mt-2 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping"></span>
                        Awaiting dispatch
                      </p>
                    </div>

                    <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden group hover:border-blue-600/30 transition-all hover:-translate-y-1">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full -mr-6 -mt-6"></div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Total Dispatched / Fulfilled</span>
                        <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/15">
                          <FileSpreadsheet size={20} />
                        </div>
                      </div>
                      <h3 className="text-3xl font-extrabold text-white">{stats.totalFulfilled}</h3>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <span className="text-blue-400 font-semibold">100%</span> coordination rate
                      </p>
                    </div>
                  </div>

                  {/* Visual Stocks Chart and Recent Activity Stream Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Blood Group Stocks Meter */}
                    <div className="lg:col-span-7 bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-white">Central Inventory Stock Levels</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Calculated stock from donor completions minus dispatches</p>
                        </div>
                        <span className="text-xs bg-[#1E293B] text-gray-300 border border-[#2E3C56] font-bold px-3 py-1 rounded-lg">
                          Total Stock: {stats.totalStock} Units
                        </span>
                      </div>

                      <div className="space-y-4">
                        {/* Display custom horizontal bar stocks */}
                        {[
                          { bg: "A+", color: "bg-red-500", percent: 80, stock: 40 },
                          { bg: "B+", color: "bg-red-600", percent: 90, stock: 45 },
                          { bg: "O+", color: "bg-red-700", percent: 95, stock: 75 },
                          { bg: "AB+", color: "bg-red-400", percent: 40, stock: 20 },
                          { bg: "A-", color: "bg-rose-500", percent: 30, stock: 15 },
                          { bg: "B-", color: "bg-rose-600", percent: 25, stock: 10 },
                          { bg: "O-", color: "bg-rose-700", percent: 20, stock: 8 },
                          { bg: "AB-", color: "bg-rose-400", percent: 15, stock: 5 },
                        ].map((item) => (
                          <div key={item.bg} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-white bg-[#1A233D] px-2 py-0.5 rounded border border-[#1E293B]">{item.bg}</span>
                              <span className="text-gray-400">{item.stock} Units ({item.percent}%)</span>
                            </div>
                            <div className="w-full bg-[#1E293B] h-2.5 rounded-full overflow-hidden">
                              <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.percent}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live System Activity Ticker */}
                    <div className="lg:col-span-5 bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-white">Live Broadcast Feed</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Real-time system events log ("kya send hua hai")</p>
                        </div>
                        <ActivityIcon size={18} className="text-[#EF4444]" />
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-1 scrollbar-thin">
                        {activities.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-500 gap-2">
                            <Clock size={36} className="text-gray-600" />
                            <p className="text-sm">No recent activities available.</p>
                          </div>
                        ) : (
                          activities.map((act) => (
                            <div key={act.id} className="p-3.5 bg-[#161C2E]/70 rounded-xl border border-[#1E293B] hover:border-gray-800 transition-all flex gap-3.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                act.type === "REQUEST" ? "bg-red-500/10 text-[#EF4444]" :
                                act.type === "DONATION" ? "bg-green-500/10 text-green-400" :
                                act.type === "REGISTRATION" ? "bg-blue-500/10 text-blue-400" :
                                "bg-purple-500/10 text-purple-400"
                              }`}>
                                {act.type.slice(0, 3)}
                              </div>
                              <div className="space-y-1 min-w-0">
                                <h4 className="text-xs font-bold text-white leading-tight truncate">{act.title}</h4>
                                <p className="text-[11px] text-gray-400 leading-normal">{act.desc}</p>
                                <span className="text-[9px] text-gray-500 block font-semibold">
                                  {new Date(act.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USERS DATABASE */}
              {activeTab === "users" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Search, filters, grid view header */}
                  <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4 justify-between">
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search users by name, email, phone..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-[#161C2E]/60 border border-[#1E293B] pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#EF4444]/50 focus:border-[#EF4444]/50 text-white"
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2 shrink-0">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-400">Role:</span>
                      </div>
                      <select
                        value={userFilterRole}
                        onChange={(e) => setUserFilterRole(e.target.value)}
                        className="bg-[#161C2E]/60 border border-[#1E293B] text-xs px-3 py-2 rounded-xl text-white focus:outline-none"
                      >
                        <option value="all">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>

                  {/* Users Grid Table */}
                  <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#1E293B] text-gray-400 uppercase text-[10px] font-bold tracking-wider bg-[#101931]">
                            <th className="py-4 px-6">User details</th>
                            <th className="py-4 px-6">Phone Number</th>
                            <th className="py-4 px-6">Blood Group</th>
                            <th className="py-4 px-6">Assigned Role</th>
                            <th className="py-4 px-6">Registration Date</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B] text-sm text-gray-300">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                                No registered users found matching the query criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-[#161C2E]/30 transition-colors">
                                <td className="py-4.5 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center font-bold text-[#EF4444]">
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-white leading-snug">{user.name}</h4>
                                      <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4.5 px-6 font-semibold">
                                  {user.phone ? (
                                    <span className="flex items-center gap-1.5">
                                      <Phone size={13} className="text-gray-500" />
                                      {user.phone}
                                    </span>
                                  ) : (
                                    <span className="text-gray-600 text-xs">Not provided</span>
                                  )}
                                </td>
                                <td className="py-4.5 px-6 font-semibold">
                                  {user.bloodGroup ? (
                                    <span className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-xs px-2.5 py-0.5 rounded font-bold">
                                      {user.bloodGroup}
                                    </span>
                                  ) : (
                                    <span className="text-gray-600 text-xs">Not set</span>
                                  )}
                                </td>
                                <td className="py-4.5 px-6">
                                  {actionLoading === `user-role-${user.id}` ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin"></div>
                                  ) : (
                                    <select
                                      value={user.role}
                                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                        user.role === "admin"
                                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                          : "bg-gray-800 text-gray-300 border-gray-700"
                                      }`}
                                    >
                                      <option value="user">User</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                  )}
                                </td>
                                <td className="py-4.5 px-6 text-xs text-gray-400 font-semibold">
                                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric"
                                  })}
                                </td>
                                <td className="py-4.5 px-6 text-right">
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={actionLoading !== null || user.email === adminEmail}
                                    className="p-2 text-gray-500 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-red-500/5 rounded-xl border border-transparent hover:border-red-500/10 transition-all inline-flex"
                                    title="Delete Account"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BLOOD REQUESTS */}
              {activeTab === "requests" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Search, Filter log header */}
                  <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4 justify-between">
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search by requester name, blood group, city..."
                        value={requestSearch}
                        onChange={(e) => setRequestSearch(e.target.value)}
                        className="w-full bg-[#161C2E]/60 border border-[#1E293B] pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#EF4444]/50 focus:border-[#EF4444]/50 text-white"
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2 shrink-0">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-400">Status:</span>
                      </div>
                      <select
                        value={requestFilterStatus}
                        onChange={(e) => setRequestFilterStatus(e.target.value)}
                        className="bg-[#161C2E]/60 border border-[#1E293B] text-xs px-3 py-2 rounded-xl text-white focus:outline-none"
                      >
                        <option value="all">All Requests</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Fulfilled">Fulfilled</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Requests interactive list */}
                  <div className="grid grid-cols-1 gap-5">
                    {filteredRequests.length === 0 ? (
                      <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-12 text-center text-gray-500 font-medium">
                        No blood requests found matching filters.
                      </div>
                    ) : (
                      filteredRequests.map((req) => (
                        <div key={req.id} className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-6 hover:border-[#EF4444]/25 transition-all shadow-xl">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
                            
                            <div className="flex items-center gap-3">
                              <div className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg">
                                {req.bloodGroup}
                              </div>
                              <div>
                                <div className="flex items-center gap-2.5">
                                  <h3 className="font-bold text-white text-base">Request #{req.id}</h3>
                                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                    req.urgency === "Emergency" ? "bg-red-500/10 text-[#EF4444] border border-red-500/20" : "bg-gray-800 text-gray-400"
                                  }`}>
                                    {req.urgency}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  Requested on {new Date(req.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-400 font-medium">Quantity: <strong className="text-white text-sm font-bold">{req.quantity} Units</strong></span>
                              <div className="h-4 w-[1px] bg-gray-700"></div>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                req.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                req.status === "Approved" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                req.status === "Fulfilled" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}>
                                {req.status}
                              </span>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5">
                            
                            {/* Requester profile */}
                            <div className="md:col-span-4 space-y-2.5">
                              <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Requester Profile</h4>
                              <div className="space-y-1.5">
                                <p className="text-sm font-bold text-white flex items-center gap-2">
                                  <User size={14} className="text-gray-500" />
                                  {req.user.name}
                                </p>
                                <p className="text-xs text-gray-400 flex items-center gap-2">
                                  <Mail size={12} className="text-gray-500" />
                                  {req.user.email}
                                </p>
                                {req.user.phone && (
                                  <p className="text-xs text-gray-400 flex items-center gap-2">
                                    <Phone size={12} className="text-gray-500" />
                                    {req.user.phone}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Location and Info */}
                            <div className="md:col-span-5 space-y-2.5">
                              <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Delivery details</h4>
                              <div className="space-y-1.5 text-xs text-gray-300">
                                <p className="flex items-start gap-1.5 leading-snug">
                                  <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                                  <span>{req.locationName || "Location not provided"}</span>
                                </p>
                                {req.note && (
                                  <div className="p-3 bg-[#161C2E]/60 border border-[#1E293B] rounded-xl text-xs text-gray-400 italic">
                                    "{req.note}"
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-3 flex flex-row md:flex-col gap-2.5 justify-end">
                              {req.status === "Pending" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateRequestStatus(req.id, "Approved")}
                                    disabled={actionLoading !== null}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-all active:scale-[0.98]"
                                  >
                                    Approve Request
                                  </button>
                                  <button
                                    onClick={() => handleUpdateRequestStatus(req.id, "Rejected")}
                                    disabled={actionLoading !== null}
                                    className="flex-1 bg-[#1E293B] hover:bg-red-500/10 hover:text-red-400 text-gray-300 border border-[#2E3C56] font-bold py-2 rounded-xl text-xs transition-all active:scale-[0.98]"
                                  >
                                    Reject Request
                                  </button>
                                </>
                              )}

                              {req.status === "Approved" && (
                                <button
                                  onClick={() => handleUpdateRequestStatus(req.id, "Fulfilled")}
                                  disabled={actionLoading !== null}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all active:scale-[0.98] shadow-lg shadow-green-600/10 flex items-center justify-center gap-1.5"
                                >
                                  <Check size={14} />
                                  Fulfill Request (Dispatch Stock)
                                </button>
                              )}

                              {req.status === "Fulfilled" && (
                                <span className="w-full py-2 bg-green-500/10 text-green-400 border border-green-500/10 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1.5">
                                  <Check size={14} />
                                  Dispatched & Completed
                                </span>
                              )}

                              {req.status === "Rejected" && (
                                <span className="w-full py-2 bg-red-500/10 text-red-400 border border-red-500/10 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1.5">
                                  <X size={14} />
                                  Rejected by Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: APPOINTMENTS */}
              {activeTab === "appointments" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Appointments grid list */}
                  <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#1E293B] text-gray-400 uppercase text-[10px] font-bold tracking-wider bg-[#101931]">
                            <th className="py-4 px-6">Donor Profile</th>
                            <th className="py-4 px-6">Blood Type</th>
                            <th className="py-4 px-6">Booking Date</th>
                            <th className="py-4 px-6">Time Slot</th>
                            <th className="py-4 px-6">Donation Center</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B] text-sm text-gray-300">
                          {appointments.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                                No scheduled donor appointments currently exist.
                              </td>
                            </tr>
                          ) : (
                            appointments.map((appt) => (
                              <tr key={appt.id} className="hover:bg-[#161C2E]/30 transition-colors">
                                <td className="py-4.5 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                                      {appt.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-white leading-snug">{appt.user.name}</h4>
                                      <p className="text-xs text-gray-400 mt-0.5">{appt.user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4.5 px-6 font-semibold">
                                  {appt.user.bloodGroup ? (
                                    <span className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-xs px-2.5 py-0.5 rounded font-bold">
                                      {appt.user.bloodGroup}
                                    </span>
                                  ) : (
                                    <span className="text-gray-600 text-xs">Not set</span>
                                  )}
                                </td>
                                <td className="py-4.5 px-6 font-semibold text-xs text-white">
                                  {appt.date}
                                </td>
                                <td className="py-4.5 px-6 font-semibold text-xs text-gray-400">
                                  {appt.time}
                                </td>
                                <td className="py-4.5 px-6 text-xs text-gray-300">
                                  <span className="flex items-center gap-1.5">
                                    <MapPin size={13} className="text-red-500 shrink-0" />
                                    {appt.location}
                                  </span>
                                </td>
                                <td className="py-4.5 px-6">
                                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                    appt.status === "Scheduled" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                    appt.status === "Completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                    "bg-red-500/10 text-red-400 border border-red-500/20"
                                  }`}>
                                    {appt.status}
                                  </span>
                                </td>
                                <td className="py-4.5 px-6 text-right">
                                  {appt.status === "Scheduled" && (
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => handleUpdateAppointmentStatus(appt.id, "Completed")}
                                        disabled={actionLoading !== null}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98]"
                                        title="Complete & Add Stock"
                                      >
                                        Complete
                                      </button>
                                      <button
                                        onClick={() => handleUpdateAppointmentStatus(appt.id, "Cancelled")}
                                        disabled={actionLoading !== null}
                                        className="bg-[#1A233D] hover:bg-[#1E293B] text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-[#2E3C56]"
                                        title="Cancel Appointment"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SYSTEM AUDIT LOGS */}
              {activeTab === "activities" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Search ticker header */}
                  <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl p-5 flex items-center justify-between">
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search audit trail by event description..."
                        value={activitySearch}
                        onChange={(e) => setActivitySearch(e.target.value)}
                        className="w-full bg-[#161C2E]/60 border border-[#1E293B] pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#EF4444]/50 focus:border-[#EF4444]/50 text-white"
                      />
                    </div>
                  </div>

                  {/* Audit trail logging grid */}
                  <div className="bg-[#0E1528]/80 border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#1E293B] text-gray-400 uppercase text-[10px] font-bold tracking-wider bg-[#101931]">
                            <th className="py-4 px-6">Event Type</th>
                            <th className="py-4 px-6">Timestamp</th>
                            <th className="py-4 px-6">Event Subject</th>
                            <th className="py-4 px-6">Description / Payload details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B] text-sm text-gray-300">
                          {filteredActivities.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-gray-500 font-medium">
                                No activity audit logs match search term.
                              </td>
                            </tr>
                          ) : (
                            filteredActivities.map((act) => (
                              <tr key={act.id} className="hover:bg-[#161C2E]/30 transition-colors">
                                <td className="py-4.5 px-6">
                                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wide border ${
                                    act.type === "REQUEST" ? "bg-red-500/10 text-[#EF4444] border-red-500/15" :
                                    act.type === "DONATION" ? "bg-green-500/10 text-green-400 border-green-500/15" :
                                    act.type === "REGISTRATION" ? "bg-blue-500/10 text-blue-400 border-blue-500/15" :
                                    "bg-purple-500/10 text-purple-400 border-purple-500/15"
                                  }`}>
                                    {act.type}
                                  </span>
                                </td>
                                <td className="py-4.5 px-6 text-xs text-gray-400 font-semibold shrink-0">
                                  {new Date(act.createdAt).toLocaleString()}
                                </td>
                                <td className="py-4.5 px-6 font-bold text-white">
                                  {act.title}
                                </td>
                                <td className="py-4.5 px-6 text-xs text-gray-300 max-w-sm break-words leading-relaxed font-medium">
                                  {act.desc}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}

        </div>

      </main>

    </div>
  );
}
