"use client";

import { useState, useEffect, FormEvent } from "react";
import { 
  Calendar, CheckCircle2, 
  AlertTriangle, ShieldAlert, Users, 
  Building2, Plus, X, Activity, Check, Info
} from "lucide-react";

type Appointment = {
  id: number;
  date: string;
  time: string;
  location: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
  user?: {
    name: string;
    email: string;
    bloodGroup?: string;
  };
};

type BloodBank = {
  id: number;
  name: string;
  location: string;
};

export default function AppointmentsPage() {
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState("Verified Hero");
  
  // Roster lists
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking form states
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingLocation, setBookingLocation] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<Appointment | null>(null);

  // Load user details
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

  // Fetch appointments and centers
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const isAdminView = userRole === "admin" || userRole === "bloodbank" || userRole === "ngo";
      const endpoint = isAdminView ? "/api/admin/appointments" : "/api/appointments";
      
      const res = await fetch(endpoint, {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/blood-banks", {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBloodBanks(data.data || []);
        if (data.data?.length > 0) {
          setBookingLocation(data.data[0].name);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchCenters();
  }, [userRole]);

  // Book an appointment (Donor/User Side)
  const handleBookAppointment = async (e: FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !bookingLocation) return;
    setBookingLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          date: bookingDate,
          time: bookingTime,
          location: bookingLocation
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const createdAppt = data.data;
        setSuccessModal(createdAppt);
        setBookingDate("");
        setBookingTime("");
        fetchAppointments();
      } else {
        alert(data.message || "Failed to book appointment.");
      }
    } catch {
      alert("Error connecting to server.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Manage Status (Admin/Bloodbank Side)
  const handleUpdateStatus = async (apptId: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/appointments/${apptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchAppointments();
      } else {
        alert(data.message || "Failed to update appointment status.");
      }
    } catch {
      alert("Error connecting to server.");
    }
  };

  const isAdminOrBank = userRole === "admin" || userRole === "bloodbank" || userRole === "ngo";

  return (
    <div className="flex-1 space-y-6">
      
      {/* Dynamic Floating Success Ticket Popup */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white text-center relative">
              <span className="p-3 bg-white/10 rounded-full border border-white/20 inline-flex items-center justify-center mb-3">
                <CheckCircle2 size={32} className="text-white fill-white/10" />
              </span>
              <h3 className="text-xl font-bold tracking-tight">Booking Confirmed!</h3>
              <p className="text-xs text-white/80 mt-1">Donation appointment registered in database</p>
              <button 
                onClick={() => setSuccessModal(null)}
                className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-semibold">
              <div className="border border-gray-100 bg-gray-50/50 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">DONATION CENTER</span>
                  <span className="text-gray-900 font-bold">{successModal.location}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">DATE</span>
                  <span className="text-gray-900 font-bold">{successModal.date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">TIME SLOT</span>
                  <span className="text-gray-900 font-bold">{successModal.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TICKET STATUS</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-black border border-emerald-100 uppercase">{successModal.status}</span>
                </div>
              </div>

              {/* Simulated SMS Broadcast message */}
              <div className="bg-blue-50 border border-blue-150 p-3.5 rounded-xl text-blue-900 leading-normal flex items-start gap-2.5">
                <span className="p-1.5 bg-blue-600 text-white rounded-lg flex items-center justify-center mt-0.5"><Check size={12} /></span>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-blue-800">SMS Confirmation Routed</h4>
                  <p className="text-[10px] mt-0.5 text-blue-700">Broadcast sent: "redhope ticket RD-#{successModal.id} confirmed for {userName} at {successModal.location}."</p>
                </div>
              </div>

              <button
                onClick={() => setSuccessModal(null)}
                className="w-full bg-[#DC2626] hover:bg-red-700 text-white py-3 rounded-xl text-xs font-black shadow transition border-none cursor-pointer"
              >
                Close Ticket & Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            🩸 Appointments Scheduling Portal
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {isAdminOrBank 
              ? "Central hospital coordination node: Auditing and processing booked donor dispatches." 
              : "Pre-book hospital visits to secure streamlined donor routing and efficient healthcare dispatches."
            }
          </p>
        </div>
        
        {isAdminOrBank && (
          <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold text-xs shadow-sm">
            <span className="p-1.5 bg-red-600 text-white rounded-lg flex items-center justify-center animate-pulse"><Activity size={12} /></span>
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider text-red-800">Live Capacity Tracker</p>
              <p className="text-[10px] text-red-700 mt-0.5">Daily Limit: {appointments.filter(a => a.status === "Confirmed").length} / 25 slots reserved</p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. DONOR / USER HUB VIEWPORT                                               */}
      {/* ========================================================================= */}
      {!isAdminOrBank ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Scheduling and Explanations Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Booking explanation Card */}
            <div className="bg-red-50 border border-red-200 p-5 rounded-3xl flex items-start gap-4 relative overflow-hidden">
              <span className="p-3 bg-red-600 text-white rounded-2xl shadow-md flex items-center justify-center flex-shrink-0">
                <Info size={20} />
              </span>
              <div className="space-y-1 z-10 relative">
                <h4 className="text-sm font-black text-red-900 uppercase tracking-wide">Why Pre-Book Blood Donation Visits?</h4>
                <p className="text-xs text-red-800 leading-relaxed font-semibold">
                  Donors can pre-book blood donation visits to reduce waiting time and help hospitals manage blood availability efficiently. Pre-booking establishes a secure operational dispatch grid linking donor blood groups to medical shortages.
                </p>
              </div>
            </div>

            {/* Appointment Booking Calendar-style Form */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
              <div className="mb-5">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5"><Calendar size={16} className="text-red-650" /> Schedule A Visit</h3>
                <p className="text-xs text-gray-655 font-medium">Select a nearby blood bank and choose your preferred slot</p>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">Choose Blood Bank / Hospital</label>
                    <select
                      value={bookingLocation}
                      onChange={(e) => setBookingLocation(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none bg-white text-gray-800 text-xs focus:border-red-500 font-semibold"
                      required
                    >
                      {bloodBanks.length === 0 ? (
                        <option value="Delhi central blood center">Delhi Central Blood Center</option>
                      ) : (
                        bloodBanks.map(bank => (
                          <option key={bank.id} value={bank.name}>{bank.name} - {bank.location}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">Select Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2 outline-none text-gray-800 text-xs focus:border-red-500 font-semibold bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">Select Time Slot</label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2 outline-none text-gray-800 text-xs focus:border-red-500 font-semibold bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-[#DC2626] hover:bg-red-700 text-white py-3 rounded-xl text-xs font-black shadow transition disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> {bookingLoading ? "Registering Appointment..." : "Confirm & Book Donation Slot"}
                </button>
              </form>
            </div>

            {/* Roster of User's Appointment History */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[320px]">
              <div className="mb-4 flex-shrink-0 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Your Appointment Registry</h3>
                  <p className="text-xs text-gray-600">History logs of scheduled blood bank visits</p>
                </div>
                <span className="bg-red-50 text-red-700 text-xs font-bold border border-red-200 px-3 py-0.5 rounded-full">{appointments.length} Appointments</span>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {loading ? (
                  <div className="h-6 bg-gray-50 animate-pulse rounded w-full" />
                ) : appointments.length === 0 ? (
                  <div className="text-center py-16 text-gray-600 border border-dashed border-gray-300 rounded-2xl h-full flex flex-col items-center justify-center">
                    <Info size={28} className="text-gray-500 mb-1.5" />
                    <p className="text-xs font-semibold text-gray-700">You have no booked appointments yet. Choose a center to schedule one!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="px-4 py-2.5">Scheduled Center</th>
                          <th className="px-4 py-2.5">Date</th>
                          <th className="px-4 py-2.5">Time Slot</th>
                          <th className="px-4 py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 font-semibold text-gray-800">
                        {appointments.map((appt) => {
                          const isPend = appt.status === "Pending";
                          const isConf = appt.status === "Confirmed";
                          const isComp = appt.status === "Completed";
                          const badge = isPend 
                            ? "bg-amber-50 text-amber-700 border-amber-100" 
                            : isConf 
                              ? "bg-green-50 text-green-700 border-green-100" 
                              : isComp 
                                ? "bg-blue-50 text-blue-700 border-blue-100" 
                                : "bg-gray-100 text-gray-600 border-gray-200";

                          return (
                            <tr key={appt.id} className="hover:bg-gray-50/50 transition">
                              <td className="px-4 py-3 flex items-center gap-2"><Building2 size={12} className="text-gray-450" /> {appt.location}</td>
                              <td className="px-4 py-3">🗓️ {appt.date}</td>
                              <td className="px-4 py-3">🕒 {appt.time}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`text-[8px] px-2 py-0.5 rounded border uppercase tracking-wider font-extrabold ${badge}`}>{appt.status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Reminders & Confirmation card details */}
          <div className="space-y-6">
            
            {/* Donation Reminders Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-500" /> Donation Reminders
              </h4>
              
              <div className="space-y-3 text-xs font-semibold text-gray-600">
                <div className="flex gap-2.5 items-start">
                  <span className="p-1 bg-red-50 text-red-650 rounded-lg"><Check size={10} /></span>
                  <div>
                    <p className="text-gray-900">Hydration Grid</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Drink at least 500ml of pure water preceding your visit.</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <span className="p-1 bg-red-50 text-red-650 rounded-lg"><Check size={10} /></span>
                  <div>
                    <p className="text-gray-900">Healthy Intake</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Eat a protein-rich meal. Avoid fatty foods or heavy items.</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <span className="p-1 bg-red-50 text-red-650 rounded-lg"><Check size={10} /></span>
                  <div>
                    <p className="text-gray-900">Identification Credentials</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Bring a valid government ID or your RaktSetu donor profile.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email/SMS Confirmation mock UI */}
            {appointments.length > 0 && (
              <div className="bg-gray-900 text-white p-6 rounded-3xl border border-gray-800 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-white/10 pb-3 flex-shrink-0">
                  <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">SMS Confirmation System</span>
                  <span className="text-[9px] bg-white/10 text-white px-2 py-0.5 rounded font-bold">DIGITAL TOKEN</span>
                </div>

                <div className="space-y-3.5 text-xs font-semibold text-white/90">
                  <div className="space-y-1">
                    <p className="text-white/50 text-[10px]">TICKET NODE ID</p>
                    <p className="font-mono tracking-widest text-sm text-red-500">RD-09418{appointments[0].id.toString().slice(-4)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <p className="text-white/50 text-[10px]">DONOR VISITOR</p>
                      <p className="truncate">{userName}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px]">VISIT DATE</p>
                      <p>{appointments[0].date}</p>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-white/15 pt-3 space-y-2">
                    <p className="text-white/40 text-[9px] uppercase">SMS Broadcast Message</p>
                    <p className="bg-white/5 p-3 rounded-xl border border-white/10 text-[10px] leading-relaxed text-gray-300 font-mono">
                      "RaktSetu donation confirmation: Visit booked at {appointments[0].location} on {appointments[0].date} at {appointments[0].time}. Bring ID."
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        
        // =========================================================================
        // 2. ADMINISTRATIVE / BLOOD BANK ROSTER VIEWPORT                            
        // =========================================================================
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users size={20} className="text-red-650" /> Administrative Visit Roster
              </h3>
              <p className="text-xs text-gray-600 font-medium">Process booked visits and log completed blood dispatches</p>
            </div>
            
            <span className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-1 rounded-full font-bold">
              {appointments.length} Total Bookings
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="h-10 bg-gray-50 animate-pulse rounded w-full" />
            ) : appointments.length === 0 ? (
              <div className="text-center py-24 text-gray-400 border border-dashed rounded-3xl h-full flex flex-col items-center justify-center">
                <ShieldAlert size={36} className="text-gray-300 mb-2 animate-bounce" />
                <p className="text-sm font-medium">No donation appointments booked in active registry.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-black tracking-wider">
                    <tr className="border-b border-gray-150">
                      <th className="px-4 py-3">Donor Name</th>
                      <th className="px-4 py-3">Blood Group</th>
                      <th className="px-4 py-3">Scheduled Center</th>
                      <th className="px-4 py-3">Visit Date</th>
                      <th className="px-4 py-3">Time Slot</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions / Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 font-semibold text-gray-700">
                    {appointments.map((appt) => {
                      const isPend = appt.status === "Pending";
                      const isConf = appt.status === "Confirmed";
                      const isComp = appt.status === "Completed";
                      const isCanc = appt.status === "Cancelled";

                      const badge = isPend 
                        ? "bg-amber-50 text-amber-700 border-amber-100" 
                        : isConf 
                          ? "bg-green-50 text-green-700 border-green-100" 
                          : isComp 
                            ? "bg-blue-50 text-blue-700 border-blue-100" 
                            : "bg-gray-100 text-gray-600 border-gray-200";

                      return (
                        <tr key={appt.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-4 py-4.5">
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-gray-900 text-sm">{appt.user?.name || "Verified Hero"}</p>
                              <p className="text-[10px] text-gray-500">{appt.user?.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4.5">
                            <span className="bg-red-600 text-white px-2.5 py-1 rounded-lg font-black text-xs border border-red-700 shadow-sm">
                              {appt.user?.bloodGroup || "O+"}
                            </span>
                          </td>
                          <td className="px-4 py-4.5 flex items-center gap-1.5 pt-6"><Building2 size={12} className="text-gray-400" /> {appt.location}</td>
                          <td className="px-4 py-4.5">🗓️ {appt.date}</td>
                          <td className="px-4 py-4.5">🕒 {appt.time}</td>
                          <td className="px-4 py-4.5">
                            <span className={`text-[8px] px-2 py-0.5 rounded border uppercase tracking-wider font-black ${badge}`}>{appt.status}</span>
                          </td>
                          <td className="px-4 py-4.5 text-right space-x-1.5">
                            {isPend && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, "Confirmed")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold border-none transition active:scale-95 cursor-pointer shadow flex-inline items-center gap-0.5"
                              >
                                <Check size={10} /> Approve
                              </button>
                            )}
                            {(isPend || isConf) && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, "Completed")}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold border-none transition active:scale-95 cursor-pointer shadow flex-inline items-center gap-0.5"
                                >
                                  🩸 Complete Donation
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, "Cancelled")}
                                  className="bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 px-2 py-1.5 rounded-lg text-[10px] font-bold transition active:scale-95 cursor-pointer"
                                >
                                  ✕ Cancel
                                </button>
                              </>
                            )}
                            {isComp && (
                              <span className="text-[10px] text-emerald-600 font-extrabold flex items-center justify-end gap-1"><CheckCircle2 size={12} /> Stock Added</span>
                            )}
                            {isCanc && (
                              <span className="text-[10px] text-gray-400 italic">No Action Taken</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
