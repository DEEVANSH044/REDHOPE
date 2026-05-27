"use client";

import { useState, useEffect } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import BloodInventory from "@/components/dashboard/BloodInventory";
import DashboardModals from "@/components/dashboard/DashboardModals";
import LiveMapSection from "@/components/LiveMap";
import DashboardDetails from "@/components/dashboard/DashboardDetails";
import { useDashboard } from "@/context/DashboardContext";
import { 
  Info, MapPin, Calendar, Users, Clock, Heart, 
  Phone, ShieldAlert, CheckCircle2, 
  Send, Search, Building2, Activity, Check, Plus
} from "lucide-react";

export default function DashboardPage() {
  const { modalType, setModalType, selectedRequest, triggerRefresh } = useDashboard();
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload?.role || "user");
        setUserName(payload?.name || "User");
      }
    } catch {}
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <div className="flex-1 p-6 space-y-6">
        
        {/* Dynamic Role-specific Info Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-red-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="space-y-2 relative z-10 text-center md:text-left flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
              Welcome Back, {userName}!
            </h2>
            <p className="text-white/80 max-w-xl text-sm leading-relaxed">
              {userRole === "admin" && "Administrative System Console: Auditing active blood banks, inventory thresholds, regional dispatches, and secure coordination nodes."}
              {userRole === "bloodbank" && "Blood Bank Management Dashboard: Keep storage levels accurate. Fulfill pending hospital requests and accept donation boxes."}
              {userRole === "ngo" && "NGO Central Coordination Command: Active alerts broadcasting, blood drives planning, volunteer network matching, and institutional dispatches."}
              {userRole === "donor" && "Blood Donor Portal: Thank you for your active heroism. Check below for matching emergency requirements in your neighborhood."}
              {userRole === "user" && "Emergency Care Portal: Need immediate dispatches? Create a new request to notify compatible local donors instantly."}
            </p>
          </div>
          
          {/* Balanced Glowing Droplet Logo Icon */}
          <div className="flex-shrink-0 relative z-10 bg-white/10 p-5 rounded-full border border-white/20 shadow-inner flex items-center justify-center animate-pulse mr-4">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-white fill-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
        </div>

        {/* Global Statistics Indicators */}
        <StatsCards />
        
        {/* Dynamic section: only bloodbank, admin, or NGO see direct inventory status bars on landing */}
        {(userRole === "admin" || userRole === "bloodbank" || userRole === "ngo") && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            <BloodInventory />
          </div>
        )}
        
        {/* Interactive Location Hub Map */}
        <LiveMapSection />
        
        {/* System activity log and requests coordination tab boards */}
        {userRole === "ngo" ? (
          <NGOCoordinationConsole />
        ) : (
          <DashboardDetails />
        )}
        
        {/* Central Dashboard Modal overlay */}
        <DashboardModals
          isOpen={modalType !== null}
          type={modalType}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            triggerRefresh();
            setModalType(null);
          }}
          selectedRequest={selectedRequest}
        />
      </div>
    </div>
  );
}

/* ========================================================================= */
/* PREMIUM NGO TABS COORDINATION CONSOLE                                     */
/* ========================================================================= */

type NGOTab = "emergency" | "camps" | "volunteers" | "partnerships" | "analytics";

function NGOCoordinationConsole() {
  const [activeTab, setActiveTab] = useState<NGOTab>("emergency");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const tabsList = [
    { id: "emergency" as NGOTab, label: "🚑 Emergency Dispatch Center", count: null },
    { id: "camps" as NGOTab, label: "📢 Donation Camps Coordinator", count: null },
    { id: "volunteers" as NGOTab, label: "🙋‍♂️ Volunteer & Rare Network", count: "Rare" },
    { id: "partnerships" as NGOTab, label: "🏥 Institutional Partnerships", count: "Shortages" },
    { id: "analytics" as NGOTab, label: "📊 Advanced Impact Insights", count: null },
  ];

  return (
    <div className="space-y-6 mt-8">
      {/* Dynamic Floating Toast System Alerts */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-gray-900 border border-gray-800 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <span className="p-1 bg-red-650 text-white rounded-lg flex items-center justify-center">
            <ShieldAlert size={16} />
          </span>
          <span className="text-xs font-bold font-sans tracking-wide">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-gray-400 hover:text-white text-xs ml-3 font-bold border-none bg-transparent cursor-pointer">✕</button>
        </div>
      )}

      {/* Dynamic Tab Navigation bar */}
      <div className="flex flex-wrap border border-gray-200 bg-white p-2.5 rounded-2xl shadow-sm gap-2">
        {tabsList.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border-none ${
              activeTab === tab.id
                ? "bg-red-600 text-white shadow shadow-red-200"
                : "text-gray-600 hover:bg-gray-50 bg-transparent"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-red-50 text-red-600"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Render selected workspace console viewport */}
      <div className="transition duration-300">
        {activeTab === "emergency" && <NGOEmergencyCoordinationDesk triggerToast={triggerToast} />}
        {activeTab === "camps" && <NGOCampManagementDesk triggerToast={triggerToast} />}
        {activeTab === "volunteers" && <NGOVolunteerNetworkDesk triggerToast={triggerToast} />}
        {activeTab === "partnerships" && <NGOHospitalPartnershipsDesk triggerToast={triggerToast} />}
        {activeTab === "analytics" && <NGOImpactAnalyticsDesk />}
      </div>
    </div>
  );
}

/* ========================== TAB 1: EMERGENCY DESK ========================= */

// Compatibility utility helper matching donors
function getCompatibleDonorsCount(patientGroup: string, allDonors: any[]) {
  if (!patientGroup) return 0;
  const compatibility: Record<string, string[]> = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
  };
  const allowed = compatibility[patientGroup.toUpperCase().trim()] || [];
  return allDonors.filter(d => allowed.includes(d.bloodGroup.toUpperCase().trim())).length;
}

function NGOEmergencyCoordinationDesk({ triggerToast }: { triggerToast: (msg: string) => void }) {
  const { setModalType, refreshTrigger } = useDashboard();
  const [requests, setRequests] = useState<any[]>([]);
  const [allDonors, setAllDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReqForDonors, setSelectedReqForDonors] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch dispatches
      const res = await fetch("/api/requests?all=true", {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const sorted = (data.data || []).sort((a: any, b: any) => {
          const aPriority = a.urgency === "Emergency" || a.urgency === "Critical" ? 2 : a.urgency === "Urgent" ? 1 : 0;
          const bPriority = b.urgency === "Emergency" || b.urgency === "Critical" ? 2 : b.urgency === "Urgent" ? 1 : 0;
          return bPriority - aPriority;
        });
        setRequests(sorted);
      }

      // Fetch donors
      const donorsRes = await fetch("/api/donors", {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const donorsData = await donorsRes.json();
      if (donorsRes.ok && donorsData.success) {
        setAllDonors(donorsData.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleBroadcastAlert = (title: string, desc: string) => {
    triggerToast(`Broadcast successfully dispatched: "${title}" (${desc.slice(0, 30)}...)`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Real-time Emergency Ticker Banner */}
      <div className="col-span-full bg-red-50 border border-red-200 text-red-900 rounded-2xl p-4.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center p-2.5 bg-red-600 text-white rounded-xl shadow-md shadow-red-200 animate-pulse">
            <ShieldAlert size={18} />
          </span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-red-800">NGO Broadcast Dispatch Monitor</h4>
            <p className="text-xs font-semibold text-red-700/80 mt-0.5">System status online. {requests.filter(r => r.urgency === "Emergency" || r.urgency === "Critical").length} active regional critical crises flagged.</p>
          </div>
        </div>
        <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">LIVE SECURE FEED</span>
      </div>

      {/* Coordination Hub requests queue */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[580px]">
        <div className="flex justify-between items-center mb-5 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">🚑 Central Emergency Registry</h3>
            <p className="text-xs text-gray-500">Live priority dispatch mapping matrix linking local donors</p>
          </div>
          <button
            onClick={() => setModalType("new-request")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:shadow-md transition active:scale-95 cursor-pointer border-none flex items-center gap-1.5"
          >
            <Plus size={14} /> Raise Dispatch Alert
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="border p-4.5 rounded-2xl animate-pulse space-y-3">
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))
          ) : requests.length === 0 ? (
            <div className="text-center py-24 text-gray-400 border border-dashed rounded-3xl h-full flex flex-col items-center justify-center">
              <Info size={32} className="text-gray-300 mb-2" />
              <p className="text-sm font-medium">All regional requests are currently solved!</p>
            </div>
          ) : (
            requests.map(req => {
              const isEmerg = req.urgency === "Emergency" || req.urgency === "Critical";
              const isUrg = req.urgency === "Urgent";
              const statusColor = isEmerg
                ? "bg-red-50 text-red-700 border-red-150"
                : isUrg
                  ? "bg-yellow-50 text-yellow-800 border-yellow-150"
                  : "bg-blue-50 text-blue-700 border-blue-150";

              const compatibleCount = getCompatibleDonorsCount(req.bloodGroup, allDonors);

              return (
                <div key={req.id} className="border border-gray-200 p-4.5 rounded-2xl hover:border-gray-300 hover:shadow-md transition space-y-3 bg-white relative">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-600 text-white w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm border border-red-700">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-gray-900 text-sm">{req.quantity} units requested</h4>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                            req.status === "Accepted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : req.status === "Completed"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" /> {req.locationName || "Hospital Location Not Specified"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                      {req.urgency}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex gap-4 text-gray-500">
                      <span className="flex items-center gap-1 font-medium"><Clock size={12} /> {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                      {req.note && <span className="flex items-center gap-1 italic text-gray-650 max-w-[200px] truncate"><Info size={12} /> "{req.note}"</span>}
                    </div>
                    
                    <button
                      onClick={() => setSelectedReqForDonors(selectedReqForDonors?.id === req.id ? null : req)}
                      className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1 cursor-pointer border-none bg-transparent"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>🟢 {compatibleCount} Donors Available</span>
                    </button>
                  </div>

                  {/* Expandable Compatible Donors Drawer */}
                  {selectedReqForDonors?.id === req.id && (
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <h5 className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center justify-between">
                        <span>Compatible Match List:</span>
                        <span>{req.bloodGroup} Recipients matching</span>
                      </h5>
                      <div className="space-y-1.5 divide-y divide-emerald-50 max-h-32 overflow-y-auto">
                        {allDonors.filter(d => getCompatibleDonorsCount(req.bloodGroup, [d]) > 0).length === 0 ? (
                          <p className="text-[11px] text-gray-500 italic py-1">No local donors registered in network matching group {req.bloodGroup}.</p>
                        ) : (
                          allDonors.filter(d => getCompatibleDonorsCount(req.bloodGroup, [d]) > 0).map((donor, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] py-1.5 first:pt-0">
                              <span className="font-bold text-gray-800">{donor.name} ({donor.bloodGroup}) • <span className="text-gray-500 text-[10px]">{donor.city}</span></span>
                              <a href={`tel:${donor.phone}`} className="text-red-700 hover:underline flex items-center gap-1 text-[10px] font-extrabold">
                                <Phone size={10} /> Call {donor.phone}
                              </a>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {req.status === "Accepted" && (
                    <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs p-3 rounded-xl flex items-center justify-between font-semibold">
                      <span>🤝 Handled by Coordinator: <span className="font-extrabold">{req.donorName || "Verified Donor"}</span></span>
                      <a href={`tel:${req.donorPhone}`} className="underline hover:text-emerald-950 transition font-black flex items-center gap-1">
                        <Phone size={12} /> {req.donorPhone}
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Regional Alerts broadcaster form panel */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[580px]">
        <div className="mb-5 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
            <Send size={18} className="text-red-600" /> Regional Broadcaster
          </h3>
          <p className="text-xs text-gray-500">Instantly notify matching donor coordinate nodes</p>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          <NGOAlertForm onBroadcast={handleBroadcastAlert} />
        </div>
      </div>
    </div>
  );
}

/* ========================== TAB 2: CAMPS DESK ========================= */

function NGOCampManagementDesk({ triggerToast }: { triggerToast: (msg: string) => void }) {
  const { setModalType, refreshTrigger } = useDashboard();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedUnits, setLoggedUnits] = useState<Record<number, number>>({
    999: 45,
    998: 32
  });
  const [activeLogId, setActiveLogId] = useState<number | null>(null);
  const [logVal, setLogVal] = useState(15);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (res.ok && data.success) {
        setCampaigns(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [refreshTrigger]);

  const handleLogUnits = (campId: number) => {
    setLoggedUnits(prev => ({ ...prev, [campId]: logVal }));
    setActiveLogId(null);
    triggerToast(`Collected units logged: ${logVal} units added to history!`);
  };

  const totalCollectedUnits = Object.values(loggedUnits).reduce((sum, v) => sum + v, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Camp statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5.5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Planned Camps</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{campaigns.length} Active Drives</h3>
          </div>
          <div className="bg-red-50 p-3.5 rounded-2xl text-red-600 border border-red-100">
            <Calendar size={24} />
          </div>
        </div>
        <div className="bg-white p-5.5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Coordinated Donors</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1">165 Registered</h3>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 border border-emerald-100">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-white p-5.5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Units Collected</span>
            <h3 className="text-2xl font-black text-red-600 mt-1">{totalCollectedUnits} Units</h3>
          </div>
          <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600 border border-blue-100">
            <Heart size={24} className="fill-blue-100 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming campaigns lists */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-5 flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5"><Calendar size={18} className="text-red-600" /> Planned Blood Drives</h3>
              <p className="text-xs text-gray-500">Regional calendar of registered NGO campaigns</p>
            </div>
            <button
              onClick={() => setModalType("launch-campaign")}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow hover:shadow-md transition active:scale-95 cursor-pointer border-none flex items-center gap-1"
            >
              <Plus size={12} /> Launch Drive
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {loading ? (
              <div className="h-6 w-full bg-gray-50 animate-pulse rounded" />
            ) : campaigns.length === 0 ? (
              <div className="text-center py-20 text-gray-400 border border-dashed rounded-2xl h-full flex flex-col items-center justify-center">
                <Info size={24} className="text-gray-300 mb-1" />
                <p className="text-xs font-medium">No drives launched yet.</p>
              </div>
            ) : (
              campaigns.map(camp => (
                <div key={camp.id} className="border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50/50 transition">
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-gray-900 text-sm">{camp.title}</h5>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={11} /> {camp.location}
                    </p>
                    <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded border border-red-100 inline-block mt-1">
                      NGO: {camp.organizer}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                      🗓️ {camp.date}
                    </span>
                    <button
                      onClick={() => {
                        setActiveLogId(camp.id);
                        setLogVal(25);
                      }}
                      className="text-[10px] font-extrabold text-red-650 hover:underline border-none bg-transparent cursor-pointer"
                    >
                      ✏️ Log Units
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed drives lists */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[450px]">
          <div className="mb-5 flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5"><CheckCircle2 size={18} className="text-emerald-600" /> Completed Drive History</h3>
            <p className="text-xs text-gray-500">Historical donation logging archive</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {activeLogId && (
              <div className="border border-red-200 bg-red-50/20 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-150">
                <h5 className="text-xs font-black text-red-800">Log Collected Units for Camp:</h5>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={logVal}
                    onChange={(e) => setLogVal(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs w-24 outline-none focus:border-red-500"
                  />
                  <button
                    onClick={() => handleLogUnits(activeLogId)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer"
                  >
                    Confirm Units
                  </button>
                  <button
                    onClick={() => setActiveLogId(null)}
                    className="text-gray-500 text-xs font-bold hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Static Mega Campaign Drives */}
            <div className="border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50/50 transition">
              <div className="space-y-1">
                <h5 className="font-extrabold text-gray-900 text-sm">Mega Spring Donation Drive</h5>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={11} /> Community Center, Sector 15
                </p>
                <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded border border-emerald-100 inline-block">
                  Status: Completed & Audited
                </span>
              </div>
              <span className="text-xs font-bold text-gray-800 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                🩸 {loggedUnits[999] || 45} Units Coordinated
              </span>
            </div>

            <div className="border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50/50 transition">
              <div className="space-y-1">
                <h5 className="font-extrabold text-gray-900 text-sm">World Health Day Campaign</h5>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={11} /> Metro Park, Delhi
                </p>
                <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded border border-emerald-100 inline-block">
                  Status: Completed & Audited
                </span>
              </div>
              <span className="text-xs font-bold text-gray-800 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                🩸 {loggedUnits[998] || 32} Units Coordinated
              </span>
            </div>

            {/* Render newly logged campaigns */}
            {campaigns.filter(c => loggedUnits[c.id]).map(camp => (
              <div key={camp.id} className="border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50/50 transition">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-gray-900 text-sm">{camp.title}</h5>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={11} /> {camp.location}
                  </p>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded border border-emerald-100 inline-block">
                    Status: Completed / Units Saved
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-800 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                  🩸 {loggedUnits[camp.id]} Units Coordinated
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================== TAB 3: VOLUNTEERS ========================= */

const mockVolunteers = [
  { name: "Aarav Sharma", email: "aarav@redhope.org", phone: "+91 98765 11111", active: true, role: "Logistics Lead" },
  { name: "Aditi Rao", email: "aditi.r@redhope.org", phone: "+91 98765 22222", active: true, role: "Coordinations Specialist" },
  { name: "Vikram Singh", email: "vikram.s@redhope.org", phone: "+91 98765 33333", active: false, role: "Outreach Lead" },
  { name: "Neha Patel", email: "neha.p@redhope.org", phone: "+91 98765 44444", active: true, role: "Inventory Officer" },
];

function NGOVolunteerNetworkDesk({ triggerToast }: { triggerToast: (msg: string) => void }) {
  const [filterActive, setFilterActive] = useState<"all" | "online" | "offline">("all");
  const [rareQuery, setRareQuery] = useState("");

  const filteredVolunteers = mockVolunteers.filter(vol => {
    if (filterActive === "online") return vol.active;
    if (filterActive === "offline") return !vol.active;
    return true;
  });

  const handleBroadcastRareAlert = (group: string) => {
    triggerToast(`🚨 System Alert: Rare Blood Emergency notification broadcasted for group "${group}"!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Volunteer active roster */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[560px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5"><Users size={18} className="text-red-600" /> Volunteer Coordinator Roster</h3>
            <p className="text-xs text-gray-500">Secure network nodes coordinating active operations</p>
          </div>
          
          <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50 text-[10px] font-bold">
            {["all", "online", "offline"].map(status => (
              <button
                key={status}
                onClick={() => setFilterActive(status as any)}
                className={`px-2.5 py-1 rounded cursor-pointer border-none uppercase ${
                  filterActive === status ? "bg-white text-red-600 shadow-sm" : "text-gray-550 bg-transparent"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {filteredVolunteers.map((vol, idx) => (
            <div key={idx} className="border border-gray-200 p-4 rounded-2xl flex items-center justify-between hover:bg-gray-50/50 transition">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 text-red-700 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-red-100">
                  {vol.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-gray-900 text-sm">{vol.name}</h5>
                    <span className={`h-2.5 w-2.5 rounded-full ${vol.active ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-[10px] text-gray-400 bg-gray-100 border px-1.5 py-0.5 rounded font-black">{vol.role}</span>
                  </div>
                  <p className="text-xs text-gray-500">{vol.email}</p>
                </div>
              </div>
              <a href={`tel:${vol.phone}`} className="border border-gray-200 px-3.5 py-1.5 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                <Phone size={12} /> {vol.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Rare blood group spotlight and Timeline */}
      <div className="space-y-6">
        
        {/* Rare blood group Spotlight */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[300px]">
          <div className="mb-4 flex-shrink-0">
            <h3 className="text-sm font-black text-[#DC2626] flex items-center gap-1.5 uppercase tracking-wide">🩸 Rare Donor Spotlight</h3>
            <p className="text-xs text-gray-500">Direct coordinate dial center for rare groups</p>
            <div className="relative flex items-center mt-2.5">
              <Search size={12} className="absolute left-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Group (O-, AB-, A-)..."
                value={rareQuery}
                onChange={(e) => setRareQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 outline-none text-xs focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {[
              { name: "Rahul Mehta", group: "O-", city: "Delhi", phone: "+91 98765 00000" },
              { name: "Meera Deshmukh", group: "AB-", city: "Mumbai", phone: "+91 98765 00011" },
              { name: "Armaan Malik", group: "A-", city: "Bangalore", phone: "+91 98765 00022" }
            ].filter(d => d.group.toLowerCase().includes(rareQuery.toLowerCase())).map((donor, idx) => (
              <div key={idx} className="border border-red-100 bg-red-50/15 p-3 rounded-2xl flex justify-between items-center">
                <div className="space-y-0.5">
                  <h5 className="font-extrabold text-gray-900 text-xs">{donor.name}</h5>
                  <p className="text-[10px] text-gray-550">{donor.city} • Active Node</p>
                  <button
                    onClick={() => handleBroadcastRareAlert(donor.group)}
                    className="text-[9px] font-black text-red-700 hover:underline bg-transparent border-none cursor-pointer flex items-center gap-0.5"
                  >
                    🚨 Alert {donor.group}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`tel:${donor.phone}`} className="p-2 bg-white rounded-lg border text-red-700 flex items-center justify-center">
                    <Phone size={12} />
                  </a>
                  <span className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow border border-red-700">
                    {donor.group}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Timeline */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[235px]">
          <h3 className="text-xs font-black text-gray-900 flex items-center gap-1 uppercase tracking-wide mb-3">
            <Activity size={14} className="text-red-650" /> Coordinator Logs
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-[11px] font-semibold text-gray-600">
            <div className="flex gap-2.5 items-start">
              <span className="p-1 bg-green-50 rounded text-green-700"><Check size={10} /></span>
              <div>
                <p className="text-gray-900">Aarav Sharma set up camp Sect. 15</p>
                <span className="text-[9px] text-gray-400">10 mins ago</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="p-1 bg-red-50 rounded text-red-700"><ShieldAlert size={10} /></span>
              <div>
                <p className="text-gray-900">Broadcaster sent alert for O- emergency</p>
                <span className="text-[9px] text-gray-400">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ========================== TAB 4: PARTNERSHIPS ========================= */

function NGOHospitalPartnershipsDesk({ triggerToast }: { triggerToast: (msg: string) => void }) {
  const [activeShortages, setActiveShortages] = useState([
    { hospital: "City General Hospital, Mumbai", shortage: "O- Blood Shortage", urgency: "Critical", id: 1 },
    { hospital: "Fortis Healthcare, Bangalore", shortage: "A+ Units Depleted", urgency: "Urgent", id: 2 },
    { hospital: "Max Clinic, Delhi", shortage: "B- Emergency Storage Low", urgency: "Emergency", id: 3 },
  ]);
  const [dispatchLogs, setDispatchLogs] = useState([
    { title: "O- Dispatch Complete", desc: "3 units of O- blood routed to City General Hospital.", time: "Logged just now", id: 101 },
    { title: "A+ Supply Replenished", desc: "5 units of A+ blood inventory routed to Fortis Healthcare.", time: "Logged 2 hours ago", id: 102 }
  ]);

  const [tgtHosp, setTgtHosp] = useState("City General Hospital, Mumbai");
  const [dispGroup, setDispGroup] = useState("O-");
  const [dispQty, setDispQty] = useState(3);
  const [dispBank, setDispBank] = useState("Delhi Central Blood Center");

  const handleRouteDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add Dispatch Log
    const newLog = {
      title: `${dispGroup} Dispatch Success`,
      desc: `${dispQty} units of ${dispGroup} routed from ${dispBank} to ${tgtHosp}.`,
      time: "Logged just now",
      id: Date.now()
    };
    setDispatchLogs(prev => [newLog, ...prev]);

    // Resolve shortage if matches hospital name
    setActiveShortages(prev => prev.filter(s => !s.hospital.toLowerCase().includes(tgtHosp.split(",")[0].toLowerCase())));

    triggerToast(`Emergency Dispatch successful: ${dispQty} units of ${dispGroup} dispatched to ${tgtHosp}!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Partnership status table */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[560px]">
        <div className="mb-5 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5"><Building2 size={18} className="text-red-600" /> Hospital Shortages Monitoring</h3>
          <p className="text-xs text-gray-500">Live indicators of medical storage shortages</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeShortages.length === 0 ? (
            <div className="text-center py-24 text-gray-400 border border-dashed rounded-3xl h-full flex flex-col items-center justify-center">
              <CheckCircle2 size={32} className="text-green-500 mb-2" />
              <p className="text-sm font-medium">All hospital node supplies are stabilized!</p>
            </div>
          ) : (
            activeShortages.map(short => (
              <div key={short.id} className="border border-gray-200 p-4.5 rounded-2xl flex items-center justify-between gap-4 hover:border-gray-300 transition bg-white">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5"><Building2 size={14} className="text-gray-400" /> {short.hospital}</h5>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    Shortage alert: <span className="font-bold text-gray-800">{short.shortage}</span>
                  </p>
                </div>
                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                  short.urgency === "Emergency" || short.urgency === "Critical"
                    ? "bg-red-50 text-red-700 border border-red-150 animate-pulse"
                    : "bg-yellow-50 text-yellow-800 border border-yellow-150"
                }`}>
                  {short.urgency}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Direct Dispatch and logs */}
      <div className="space-y-6">
        
        {/* Route Dispatch Form */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[300px]">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1"><Send size={12} className="text-red-650" /> Route Dispatch</h4>
          <form onSubmit={handleRouteDispatch} className="space-y-3 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Target Hospital</label>
                <select
                  value={tgtHosp}
                  onChange={(e) => setTgtHosp(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:border-red-500"
                >
                  <option value="City General Hospital, Mumbai">City General Hospital</option>
                  <option value="Fortis Healthcare, Bangalore">Fortis Healthcare</option>
                  <option value="Max Clinic, Delhi">Max Clinic</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Source Blood Bank</label>
                <select
                  value={dispBank}
                  onChange={(e) => setDispBank(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:border-red-500"
                >
                  <option value="Delhi Central Blood Center">Delhi Central Blood Center</option>
                  <option value="Mumbai Rotary Blood Bank">Mumbai Rotary Blood Bank</option>
                  <option value="Bangalore Red Cross Node">Bangalore Red Cross Node</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Blood Group</label>
                <select
                  value={dispGroup}
                  onChange={(e) => setDispGroup(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:border-red-500"
                >
                  {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dispQty}
                  onChange={(e) => setDispQty(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#DC2626] hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold border-none transition cursor-pointer flex items-center justify-center gap-1"
            >
              <Check size={12} /> Dispatch Emergency Stock
            </button>
          </form>
        </div>

        {/* Dispatch Log */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[235px]">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-1"><Clock size={12} /> Dispatch Logs</h4>
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {dispatchLogs.map((log) => (
              <div key={log.id} className="border border-gray-100 p-3.5 rounded-xl space-y-1.5 bg-gray-50/20">
                <div className="flex justify-between items-center">
                  <h5 className="font-extrabold text-gray-900 text-xs">{log.title}</h5>
                  <span className="text-[8px] bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold px-1.5 py-0.5 rounded">Routed</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">{log.desc}</p>
                <span className="text-[8px] text-gray-400 block">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ========================== TAB 5: ANALYTICS ========================= */

function NGOImpactAnalyticsDesk() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Real-time stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5.5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coordinated Units</span>
          <h3 className="text-3xl font-black text-gray-900 mt-1">1,320 Units</h3>
          <p className="text-[10px] text-emerald-650 font-bold mt-1 flex items-center gap-0.5"><Check size={10} /> +14% vs last quarter</p>
        </div>
        <div className="bg-white p-5.5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lives Saved</span>
          <h3 className="text-3xl font-black text-red-600 mt-1">3,960 Lives</h3>
          <p className="text-[10px] text-emerald-650 font-bold mt-1">1 dispatch saves 3 lives</p>
        </div>
        <div className="bg-white p-5.5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requests Solved</span>
          <h3 className="text-3xl font-black text-gray-900 mt-1">380 Solved</h3>
          <p className="text-[10px] text-emerald-650 font-bold mt-1">98.2% fulfillment rate</p>
        </div>
        <div className="bg-white p-5.5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coordinated Nodes</span>
          <h3 className="text-3xl font-black text-gray-900 mt-1">18 Nodes</h3>
          <p className="text-[10px] text-gray-400 font-medium mt-1">Delhi, Mumbai, Bangalore</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly progress collection charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[340px]">
          <div className="mb-6 flex-shrink-0">
            <h3 className="text-base font-black text-gray-900 uppercase tracking-wide">Monthly Donation Coordinated Trends</h3>
            <p className="text-xs text-gray-500">Collected blood units mapped across calendar year</p>
          </div>

          <div className="flex-1 grid grid-cols-6 items-end gap-5 pt-4">
            <AnalyticsBar month="Jan" value={80} units="240 units" />
            <AnalyticsBar month="Feb" value={65} units="195 units" />
            <AnalyticsBar month="Mar" value={95} units="285 units" />
            <AnalyticsBar month="Apr" value={85} units="255 units" />
            <AnalyticsBar month="May" value={100} units="300 units" />
            <AnalyticsBar month="Jun" value={75} units="225 units" />
          </div>
        </div>

        {/* Blood Group Distribution Ring Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[340px]">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Heart size={14} className="text-red-650" /> Supply Registry Share</h3>
          <p className="text-[11px] text-gray-500 mb-4">Current share percentages of major blood groups</p>
          
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {[
              { group: "A+", share: 38, color: "bg-red-500 text-red-700 bg-red-100" },
              { group: "O+", share: 29, color: "bg-red-600 text-red-800 bg-red-100" },
              { group: "B+", share: 18, color: "bg-red-700 text-red-900 bg-red-100" },
              { group: "Rare (O-, AB-)", share: 15, color: "bg-gray-900 text-white bg-gray-200" }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-gray-700">
                  <span>Group: {item.group}</span>
                  <span>{item.share}% share</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${item.group === "Rare (O-, AB-)" ? "bg-gray-900" : "bg-red-600"}`} style={{ width: `${item.share}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function AnalyticsBar({ month, value, units }: { month: string, value: number, units: string }) {
  return (
    <div className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
      <span className="text-[9px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-1.5 py-0.5 rounded mb-1 whitespace-nowrap">
        {units}
      </span>
      <div 
        className="w-full bg-red-100 border border-red-200 hover:bg-red-600 transition-all rounded-t-xl" 
        style={{ height: `${value}%` }}
      />
      <span className="text-xs font-extrabold text-gray-600 mt-1">{month}</span>
    </div>
  );
}

function NGOAlertForm({ onBroadcast }: { onBroadcast: (title: string, desc: string) => void }) {
  const { triggerRefresh } = useDashboard();
  const [type, setType] = useState("EMERGENCY");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    if (!title.trim() || !desc.trim()) {
      setMsg("Title and description are required.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ action: "create", type, title: title.trim(), desc: desc.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onBroadcast(title.trim(), desc.trim());
        setMsg("Broadcast dispatched successfully!");
        setTitle("");
        setDesc("");
        triggerRefresh();
      } else {
        setMsg(data.message || "Failed to dispatch alert.");
      }
    } catch {
      setMsg("Failed to connect to alert API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleBroadcast} className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Severity</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none bg-white text-gray-700 text-xs focus:border-red-500 transition font-medium"
        >
          <option value="EMERGENCY">🚨 Emergency Drive</option>
          <option value="LOW_STOCK">⚠️ Low Stock Warning</option>
          <option value="REGISTRATION">📢 General Announcement</option>
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Alert Header</label>
        <input
          type="text"
          placeholder="e.g. Critical O- Drive at City Hall"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none text-gray-800 text-xs focus:border-red-500 transition"
          required
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Context Details</label>
        <textarea
          rows={5}
          placeholder="e.g. 5 units of O- blood are needed urgently..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none text-gray-800 text-xs focus:border-red-500 transition resize-none"
          required
        />
      </div>

      {msg && (
        <p className={`text-xs font-semibold ${msg.includes("successfully") ? "text-green-600" : "text-[#DC2626]"}`}>
          {msg}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#DC2626] hover:bg-red-700 text-white py-3.5 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Send size={12} /> {loading ? "Dispatching..." : "⚡ Dispatch Broadcast"}
      </button>
    </form>
  );
}
