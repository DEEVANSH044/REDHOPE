"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { 
  Droplet, AlertTriangle, UserPlus, CheckCircle, 
  Clock, Info 
} from "lucide-react";

// Human-friendly time-ago formatter
function formatTimeAgo(dateString: string) {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const ms = now.getTime() - past.getTime();
    
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    return `${days}d ago`;
  } catch (e) {
    return "";
  }
}

export default function DashboardDetails() {
  const { searchQuery, refreshTrigger, setSelectedRequest, setModalType, triggerRefresh } = useDashboard();
  
  const [activities, setActivities] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState("Verified Hero");

  // Load user data on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload?.role || "user");
        setUserName(payload?.name || "Verified Hero");
      }
    } catch {}
  }, []);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/activities", {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActivities(data.data || []);
      }
    } catch (e) {
      console.error("Failed to load activity logs", e);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch requests (both Pending and Accepted for live tracking)
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/requests?all=true", {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const visible = (data.data || []).filter(
          (r: any) => r.status === "Pending" || r.status === "Accepted"
        );
        setRequests(visible);
      }
    } catch (e) {
      console.error("Failed to load requests", e);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchRequests();
  }, [refreshTrigger]);

  // Accept request handler (donor)
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          status: "Accepted",
          donorName: userName || "Verified Blood Donor",
          donorPhone: "+91 99999 88888" // Safe fallback phone
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerRefresh();
      } else {
        alert(data.message || "Failed to accept request");
      }
    } catch (e) {
      console.error("Accept failed:", e);
    }
  };

  // Complete request handler (patient/admin)
  const handleCompleteRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ status: "Completed" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerRefresh();
      } else {
        alert(data.message || "Failed to complete request");
      }
    } catch (e) {
      console.error("Completion failed:", e);
    }
  };

  // Central search filtering on pending requests
  const filteredRequests = requests.filter((r: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.bloodGroup.toLowerCase().includes(q) ||
      (r.locationName && r.locationName.toLowerCase().includes(q)) ||
      (r.note && r.note.toLowerCase().includes(q)) ||
      r.urgency.toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

      {/* ================= RECENT SYSTEM ACTIVITIES ================= */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[520px]">
        <div className="mb-5 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Recent Network Activity</h3>
          <p className="text-sm text-gray-500">Latest actions and dispatches from the database</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4.5 pr-1">
          {loadingActivities ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="p-4 bg-gray-100 rounded-xl h-10 w-10" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : activities.length === 0 ? (
            <div className="text-center py-16 text-gray-400 border border-dashed rounded-2xl h-full flex flex-col items-center justify-center">
              <Info className="text-gray-300 mb-1" size={28} />
              <p className="text-sm">No activity logs recorded in the system.</p>
            </div>
          ) : (
            activities.slice(0, 10).map((act) => {
              // Custom colors based on activity types
              const isDonation = act.type === "DONATION";
              const isFulfillment = act.type === "FULFILLMENT";
              const isRegistration = act.type === "REGISTRATION";

              const iconBg = isDonation
                ? "bg-red-50 text-red-600 border border-red-100"
                : isFulfillment
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : isRegistration
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-amber-50 text-amber-600 border border-amber-100";

              const IconComp = isDonation
                ? Droplet
                : isFulfillment
                  ? CheckCircle
                  : isRegistration
                    ? UserPlus
                    : AlertTriangle;

              return (
                <div key={act.id} className="flex items-start gap-4 p-1.5 hover:bg-gray-50/50 rounded-xl transition">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg}`}>
                    <IconComp size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm leading-tight">{act.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{act.desc}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap pt-1">
                    {formatTimeAgo(act.createdAt)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= PENDING REQUESTS PANEL ================= */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[520px]">
        <div className="flex justify-between items-center mb-5 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Pending Blood Requests</h3>
            <p className="text-sm text-gray-500">Patients and hospitals awaiting blood dispatches</p>
          </div>
          <span className="bg-red-50 text-red-600 border border-red-100 text-xs px-3 py-1 rounded-full font-bold">
            {requests.length} pending
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loadingRequests ? (
            [1, 2].map((i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-24" />
                      <div className="h-3 bg-gray-100 rounded w-32" />
                    </div>
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full w-14" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="flex gap-3">
                  <div className="h-9 bg-gray-100 rounded flex-1" />
                  <div className="h-9 bg-gray-100 rounded w-24" />
                </div>
              </div>
            ))
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-400 border border-dashed rounded-2xl h-full flex flex-col items-center justify-center">
              <Info className="text-gray-300 mb-1" size={28} />
              <p className="text-sm">
                {searchQuery ? "No pending requests match your search." : "All blood requests are currently fulfilled!"}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isEmergency = req.urgency === "Emergency" || req.urgency === "Critical";
              const isUrgent = req.urgency === "Urgent";
              
              const statusColor = isEmergency
                ? "bg-red-50 text-red-700 border-red-100"
                : isUrgent
                  ? "bg-yellow-50 text-yellow-800 border-yellow-100"
                  : "bg-blue-50 text-blue-700 border-blue-100";

              return (
                <div key={req.id} className="border border-gray-200 rounded-xl p-4.5 hover:border-gray-300 transition-all duration-200 space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border border-red-700">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm leading-tight">
                            {req.quantity} {req.quantity === 1 ? "unit" : "units"} needed
                          </p>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            req.status === "Accepted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{req.locationName || "Location not provided"}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                      {req.urgency}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 font-medium bg-gray-50/50 p-2.5 rounded-lg border">
                    {req.createdAt && (
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-gray-400" /> {formatTimeAgo(req.createdAt)}
                      </span>
                    )}
                    {req.note && (
                      <span className="flex items-center gap-1 italic text-gray-600 max-w-[260px] truncate">
                        <Info size={13} className="text-gray-400 flex-shrink-0" /> "{req.note}"
                      </span>
                    )}
                  </div>

                  {/* Matched Donor Details Card */}
                  {req.status === "Accepted" && (
                    <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-xl flex items-center justify-between font-semibold animate-in zoom-in-95 duration-200">
                      <span>🤝 Assigned Donor: <span className="font-extrabold text-emerald-900">{req.donorName || "Verified Donor"}</span></span>
                      <a href={`tel:${req.donorPhone || "+91 99999 88888"}`} className="font-extrabold text-emerald-700 hover:text-emerald-950 underline transition duration-100 flex items-center gap-1">
                        📞 Call Donor
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2.5 w-full">
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setModalType("view-details");
                      }}
                      className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer text-center"
                    >
                      View Details
                    </button>
                    
                    {userRole === "donor" && req.status === "Pending" && (
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow hover:shadow-md active:scale-95 transition cursor-pointer text-center border-none"
                      >
                        🤝 Accept Request
                      </button>
                    )}

                    {(userRole === "admin" || userRole === "user") && req.status === "Accepted" && (
                      <button
                        onClick={() => handleCompleteRequest(req.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow hover:shadow-md active:scale-95 transition cursor-pointer text-center border-none"
                      >
                        ✔️ Complete Donation
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
