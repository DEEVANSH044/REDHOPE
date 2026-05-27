"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { 
  Droplet, UserCheck, HeartHandshake, Hourglass, Plus, 
  Search, UserPlus, Calendar, Bell, Building2
} from "lucide-react";
import Link from "next/link";

export default function StatsCards() {
  const { setModalType, refreshTrigger } = useDashboard();
  const [loading, setLoading] = useState(true);
  
  // Decoded user profile
  const [userRole, setUserRole] = useState("user");
  
  // Dynamic system-wide overview stats
  const [stats, setStats] = useState({
    totalStock: 215,
    totalDonors: 5,
    activeRequests: 3,
    totalFulfilled: 9,
    donorsGrowth: "+12% this month",
    requestsGrowth: "-4% this week",
    stockStatus: "Good",
    fulfillmentRate: "75%"
  });

  // Decode JWT on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload?.role || "user");
      }
    } catch {}
  }, []);

  // Fetch stats dynamically
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": token ? `Bearer ${token}` : "" };

      // Fetch dynamic stats from database
      const res = await fetch("/api/dashboard/stats", { headers });
      const result = await res.json();
      if (res.ok && result.success) {
        setStats(result.data);
      }
    } catch (e) {
      console.error("Failed to load dynamic stats cards", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger, userRole]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* OVERVIEW HEADER & DYNAMIC PORTAL ACTIONS                                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 pb-3 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Overview
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Monitor real-time blood inventory and network activities
          </p>
        </div>

        {/* Dynamic Action Controls per Role */}
        <div className="flex flex-wrap gap-2.5 mt-4 lg:mt-0">
          
          {/* Patient/User Actions */}
          {userRole === "user" && (
            <>
              <button
                onClick={() => setModalType("new-request")}
                className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition border-none cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} /> Request Blood Now
              </button>
              <button
                onClick={() => setModalType("find-blood")}
                className="bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Search size={14} className="text-gray-500" /> Search Directory
              </button>
              <Link
                href="/blood-banks"
                className="bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer no-underline"
              >
                <Building2 size={14} className="text-gray-500" /> Blood Banks
              </Link>
            </>
          )}

          {/* Donor Actions */}
          {userRole === "donor" && (
            <>
              <Link
                href="/appointments"
                className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition no-underline flex items-center gap-1.5"
              >
                <Calendar size={14} /> Schedule Donation Visit
              </Link>
              <button
                onClick={() => setModalType("find-blood")}
                className="bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Search size={14} className="text-gray-500" /> Search Directory
              </button>
            </>
          )}

          {/* Admin/NGO Actions */}
          {(userRole === "admin" || userRole === "bloodbank" || userRole === "ngo") && (
            <>
              <button
                onClick={() => setModalType("new-request")}
                className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition border-none cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} /> Create Dispatch
              </button>
              <button
                onClick={() => setModalType("register-donor")}
                className="bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={14} className="text-gray-500" /> Register Donor
              </button>
              <button
                onClick={() => setModalType("find-blood")}
                className="bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Search size={14} className="text-gray-500" /> Find Blood
              </button>
              <button
                onClick={() => setModalType("send-alert")}
                className="bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Bell size={14} className="text-gray-500" /> Send Alert
              </button>
            </>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SYSTEM-WIDE OVERVIEW STATS GRID                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardItem 
          title="Total Blood Stock" 
          value={`${stats.totalStock} Units`} 
          change={`Status: ${stats.stockStatus}`} 
          icon={<Droplet size={20} />} 
          bg="bg-red-50 text-red-650 border-red-100" 
          loading={loading} 
          isPendingOrActive={false} 
        />
        <StatCardItem 
          title="Registered Donors" 
          value={stats.totalDonors.toLocaleString()} 
          change={stats.donorsGrowth} 
          icon={<UserCheck size={20} />} 
          bg="bg-emerald-50 text-emerald-650 border-emerald-100" 
          loading={loading} 
          isPendingOrActive={false} 
        />
        <StatCardItem 
          title="Pending Requests" 
          value={stats.activeRequests.toLocaleString()} 
          change={stats.requestsGrowth} 
          icon={<Hourglass size={20} />} 
          bg="bg-amber-50 text-amber-650 border-amber-100" 
          loading={loading} 
          isPendingOrActive={true} 
        />
        <StatCardItem 
          title="Fulfillment Rate" 
          value={stats.fulfillmentRate} 
          change={`Fulfilled: ${stats.totalFulfilled} requests`} 
          icon={<HeartHandshake size={20} />} 
          bg="bg-blue-50 text-blue-650 border-blue-100" 
          loading={loading} 
          isPendingOrActive={false} 
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  bg: string;
  loading: boolean;
  isPendingOrActive: boolean;
}

function StatCardItem({ title, value, change, icon, bg, loading, isPendingOrActive }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex items-center justify-between">
      <div className="space-y-1 min-w-0">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider truncate">{title}</p>
        
        {loading ? (
          <div className="h-8 w-28 bg-gray-150 rounded-lg animate-pulse mt-1" />
        ) : (
          <h3 className="text-xl font-black text-gray-900 tracking-tight mt-0.5 truncate">{value}</h3>
        )}

        {loading ? (
          <div className="h-4 w-36 bg-gray-50 rounded animate-pulse mt-1" />
        ) : (
          <p className={`text-[10px] font-bold ${isPendingOrActive ? "text-amber-500" : "text-emerald-600"} truncate`}>
            {change}
          </p>
        )}
      </div>
      
      <div className={`p-3 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}>
        {icon}
      </div>
    </div>
  );
}
