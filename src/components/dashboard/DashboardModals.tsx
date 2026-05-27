"use client";

import { useState, useEffect } from "react";
import { 
  X, Search, User, MapPin, Phone, 
  Clock, Info, ShieldAlert, CheckCircle2 
} from "lucide-react";

interface DashboardModalsProps {
  isOpen: boolean;
  type: "new-request" | "register-donor" | "find-blood" | "send-alert" | "view-details" | "launch-campaign" | null;
  onClose: () => void;
  onSuccess: () => void;
  selectedRequest?: any; // Used for "view-details"
}

export default function DashboardModals({
  isOpen,
  type,
  onClose,
  onSuccess,
  selectedRequest
}: DashboardModalsProps) {
  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto transition-opacity duration-300">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {type === "new-request" && <>🩸 New Blood Request</>}
            {type === "register-donor" && <>👤 Register New Donor</>}
            {type === "find-blood" && <>🔍 Real-time Search Directory</>}
            {type === "send-alert" && <>🔔 Broadcast System Alert</>}
            {type === "view-details" && <>📋 Blood Request Details</>}
            {type === "launch-campaign" && <>📢 Launch Blood Drive Campaign</>}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {type === "new-request" && <NewRequestForm onSuccess={onSuccess} onClose={onClose} />}
          {type === "register-donor" && <RegisterDonorForm onSuccess={onSuccess} onClose={onClose} />}
          {type === "find-blood" && <FindBloodDirectory />}
          {type === "send-alert" && <SendAlertForm onSuccess={onSuccess} onClose={onClose} />}
          {type === "view-details" && <RequestDetailsView request={selectedRequest} onSuccess={onSuccess} onClose={onClose} />}
          {type === "launch-campaign" && <LaunchCampaignForm onSuccess={onSuccess} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 1. NEW REQUEST FORM                                                       */
/* ========================================================================= */
function NewRequestForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState("Normal");
  const [locationName, setLocationName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!locationName.trim()) {
      setErrorMsg("Hospital name/location is required");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          bloodGroup,
          quantity: Number(quantity),
          urgency,
          locationName,
          note: note.trim() || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create request");
      }

      setSuccessMsg("Blood request submitted and matching donors notified!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-100 flex items-start gap-2">
          <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 text-sm p-3.5 rounded-xl border border-green-100 flex items-start gap-2">
          <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Blood Group</label>
          <select 
            value={bloodGroup} 
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none bg-white text-gray-800 text-sm focus:border-red-500 transition"
          >
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Units Needed (450ml)</label>
          <input 
            type="number" 
            min={1} 
            max={10}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Urgency Level</label>
        <div className="grid grid-cols-3 gap-2">
          {["Normal", "Urgent", "Emergency"].map(level => {
            const isSelected = urgency === level;
            return (
              <button
                type="button"
                key={level}
                onClick={() => setUrgency(level)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${
                  isSelected 
                    ? level === "Emergency"
                      ? "bg-red-50 border-red-500 text-red-700 font-semibold"
                      : level === "Urgent"
                        ? "bg-yellow-50 border-yellow-500 text-yellow-800 font-semibold"
                        : "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                {level === "Emergency" && "🚨 "}
                {level === "Urgent" && "⚡ "}
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hospital Name & City</label>
        <input 
          type="text"
          placeholder="e.g. City General Hospital, Mumbai"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Special Notes / Contact Details</label>
        <textarea
          rows={3}
          placeholder="e.g. Patient is in ICU, contact relative at +91 XXXXX XXXXX"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition resize-none"
        />
      </div>

      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm shadow-sm hover:shadow transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}

/* ========================================================================= */
/* 2. REGISTER DONOR FORM                                                     */
/* ========================================================================= */
function RegisterDonorForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim() || !phone.trim() || !city.trim()) {
      setErrorMsg("Please fill out all required fields");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/donors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          name: name.trim(),
          bloodGroup,
          phone: phone.trim(),
          city: city.trim(),
          lastDonationDate: lastDonationDate || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to register donor");
      }

      setSuccessMsg("Donor registered successfully! Alert systems updated.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-100 flex items-start gap-2">
          <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 text-sm p-3.5 rounded-xl border border-green-100 flex items-start gap-2">
          <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Donor Full Name</label>
        <div className="relative flex items-center">
          <User className="absolute left-3.5 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="e.g. Priya Patel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Blood Group</label>
          <select 
            value={bloodGroup} 
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none bg-white text-gray-800 text-sm focus:border-red-500 transition"
          >
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
          <div className="relative flex items-center">
            <Phone className="absolute left-3.5 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="+91 XXXXX XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">City</label>
          <div className="relative flex items-center">
            <MapPin className="absolute left-3.5 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="e.g. Pune"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Last Donation Date</label>
          <input 
            type="date"
            value={lastDonationDate}
            onChange={(e) => setLastDonationDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition bg-white"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm shadow-sm hover:shadow transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Donor"}
        </button>
      </div>
    </form>
  );
}

/* ========================================================================= */
/* 3. FIND BLOOD DIRECTORY                                                   */
/* ========================================================================= */
function FindBloodDirectory() {
  const [activeTab, setActiveTab] = useState<"donors" | "banks">("donors");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [city, setCity] = useState("");
  const [donors, setDonors] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const triggerSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Query donors API
      const donorsRes = await fetch(`/api/donors?bloodGroup=${encodeURIComponent(bloodGroup)}&city=${encodeURIComponent(city)}`, {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const donorsData = await donorsRes.json();
      if (donorsRes.ok) {
        setDonors(donorsData.data || []);
      }

      // Query blood banks API
      const banksRes = await fetch("/api/blood-banks", {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const banksData = await banksRes.json();
      if (banksRes.ok) {
        // Filter blood banks in-memory
        let filteredBanks = banksData.data || [];
        if (city) {
          filteredBanks = filteredBanks.filter((b: any) => 
            b.location.toLowerCase().includes(city.toLowerCase()) || 
            b.name.toLowerCase().includes(city.toLowerCase())
          );
        }
        if (bloodGroup) {
          filteredBanks = filteredBanks.filter((b: any) => 
            !b.availableGroups || b.availableGroups.toLowerCase().includes(bloodGroup.toLowerCase())
          );
        }
        setBanks(filteredBanks);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    triggerSearch();
  }, [bloodGroup]); // Auto search when blood group changes

  return (
    <div className="space-y-4">
      {/* Search Filters */}
      <div className="bg-gray-50 border p-4 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search Filters</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-2 outline-none bg-white text-gray-700 text-sm focus:border-red-500 transition"
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">City Name</label>
            <input
              type="text"
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-2 outline-none text-gray-700 text-sm focus:border-red-500 transition"
            />
          </div>
        </div>
        <button
          onClick={triggerSearch}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1 shadow-sm transition"
        >
          <Search size={16} /> Search Directory
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("donors")}
          className={`flex-1 pb-2.5 text-sm font-bold border-b-2 transition ${
            activeTab === "donors" ? "border-red-600 text-red-600" : "border-transparent text-gray-400"
          }`}
        >
          🙋‍♂️ Donors ({loading ? "..." : donors.length})
        </button>
        <button
          onClick={() => setActiveTab("banks")}
          className={`flex-1 pb-2.5 text-sm font-bold border-b-2 transition ${
            activeTab === "banks" ? "border-red-600 text-red-600" : "border-transparent text-gray-400"
          }`}
        >
          🏦 Blood Banks ({loading ? "..." : banks.length})
        </button>
      </div>

      {/* Dynamic Results */}
      <div className="max-h-60 overflow-y-auto space-y-2 pt-1 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2 text-gray-400">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></span>
            <span className="text-sm">Retrieving database matches...</span>
          </div>
        ) : activeTab === "donors" ? (
          donors.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed rounded-xl">
              <Info className="mx-auto text-gray-300 mb-1" size={24} />
              <p className="text-sm">No donors match this criteria.</p>
            </div>
          ) : (
            donors.map((donor) => (
              <div key={donor.id} className="border p-3.5 rounded-xl flex items-center justify-between hover:bg-gray-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{donor.name}</h5>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} /> {donor.city}
                      {donor.lastDonationDate && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Clock size={12} /> Last: {donor.lastDonationDate}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <a 
                  href={`tel:${donor.phone}`}
                  className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Phone size={14} /> Call
                </a>
              </div>
            ))
          )
        ) : banks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border border-dashed rounded-xl">
            <Info className="mx-auto text-gray-300 mb-1" size={24} />
            <p className="text-sm">No blood banks match this criteria.</p>
          </div>
        ) : (
          banks.map((bank) => (
            <div key={bank.id} className="border p-3.5 rounded-xl hover:bg-gray-50/50 transition">
              <div className="flex justify-between items-start mb-1">
                <h5 className="font-bold text-gray-900 text-sm">{bank.name}</h5>
                <a 
                  href={`tel:${bank.contact}`}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs font-bold"
                >
                  <Phone size={12} /> {bank.contact}
                </a>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <MapPin size={12} /> {bank.location}
              </p>
              {bank.availableGroups && (
                <div className="flex flex-wrap gap-1">
                  {bank.availableGroups.split(",").map((g: string) => (
                    <span key={g} className="bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {g.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 4. SEND ALERT FORM                                                       */
/* ========================================================================= */
function SendAlertForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [type, setType] = useState("EMERGENCY");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!title.trim() || !desc.trim()) {
      setErrorMsg("Title and Description are required");
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
        body: JSON.stringify({
          action: "create",
          type,
          title: title.trim(),
          desc: desc.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send alert");
      }

      setSuccessMsg("Alert broadcasted successfully across the system!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-100 flex items-start gap-2">
          <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 text-sm p-3.5 rounded-xl border border-green-100 flex items-start gap-2">
          <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Alert Severity/Type</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none bg-white text-gray-800 text-sm focus:border-red-500 transition"
        >
          <option value="EMERGENCY">🚨 EMERGENCY (Critical priority)</option>
          <option value="LOW_STOCK">⚠️ LOW STOCK WARNING (Inventory warning)</option>
          <option value="REGISTRATION">📢 GENERAL ANNOUNCEMENT (Information alert)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Alert Title</label>
        <input 
          type="text"
          placeholder="e.g. Critical O- Need at City Hospital"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description / Details</label>
        <textarea
          rows={4}
          placeholder="e.g. 3 units of O- blood are needed immediately for a patient in emergency room. Contact blood team now."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition resize-none"
          required
        />
      </div>

      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm shadow-sm hover:shadow transition disabled:opacity-50"
        >
          {loading ? "Broadcasting..." : "Broadcast Alert"}
        </button>
      </div>
    </form>
  );
}

/* ========================================================================= */
/* 5. REQUEST DETAILS VIEW                                                   */
/* ========================================================================= */
function RequestDetailsView({ 
  request, 
  onSuccess, 
  onClose 
}: { 
  request: any; 
  onSuccess: () => void; 
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload?.role === "admin");
      }
    } catch {}
  }, []);

  if (!request) {
    return (
      <div className="text-center py-6 text-gray-400">
        <Info className="mx-auto text-gray-300 mb-1" size={24} />
        <p className="text-sm">No blood request selected.</p>
      </div>
    );
  }

  const handleFulfill = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/requests/fulfill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ requestId: request.id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fulfill request");
      }

      setSuccessMsg("Blood request successfully fulfilled! Inventory stock updated.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during fulfillment");
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = 
    request.urgency === "Emergency" || request.urgency === "Critical"
      ? "bg-red-100 text-red-700 font-bold border border-red-200"
      : request.urgency === "Urgent"
        ? "bg-yellow-100 text-yellow-800 font-semibold border border-yellow-200"
        : "bg-blue-100 text-blue-700 font-medium border border-blue-200";

  return (
    <div className="space-y-5">
      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-100 flex items-start gap-2 animate-shake">
          <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 text-sm p-3.5 rounded-xl border border-green-100 flex items-start gap-2">
          <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Stats Card */}
      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 text-white w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl shadow-sm border border-red-700">
            {request.bloodGroup}
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">{request.quantity} {request.quantity === 1 ? "unit" : "units"} needed</h4>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5 flex items-center gap-1">
              Status: 
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                request.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
              }`}>
                {request.status}
              </span>
            </p>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full ${urgencyColors}`}>
          {request.urgency === "Emergency" || request.urgency === "Critical" ? "🚨 Emergency" : request.urgency}
        </span>
      </div>

      {/* Detail Fields */}
      <div className="space-y-3.5">
        <div className="flex items-start gap-3 text-sm">
          <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="font-semibold text-gray-800">Hospital & Location</p>
            <p className="text-gray-600 mt-0.5">{request.locationName || "No location name provided"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <Clock className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="font-semibold text-gray-800">Date Posted</p>
            <p className="text-gray-600 mt-0.5">
              {request.createdAt ? new Date(request.createdAt).toLocaleString("en-IN", { 
                day: "numeric", 
                month: "short", 
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }) : "Unknown Date"}
            </p>
          </div>
        </div>

        {request.note && (
          <div className="flex items-start gap-3 text-sm border-t pt-3 border-gray-100">
            <Info className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="font-semibold text-gray-800">Patient Note / Context</p>
              <p className="text-gray-600 mt-1 italic bg-amber-50/50 p-3 rounded-lg border border-amber-50">
                "{request.note}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex gap-3 pt-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition"
        >
          Close
        </button>

        {request.status === "Pending" && (
          <button
            onClick={handleFulfill}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm shadow-sm hover:shadow transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading ? "Fulfilling..." : <>🤝 Fulfill Request</>}
          </button>
        )}
      </div>
      
      {!isAdmin && request.status === "Pending" && (
        <p className="text-[10px] text-center text-gray-400">
          * Note: You are logged in as a normal user. Fulfilling blood stock dispatches is restricted to Administrator accounts.
        </p>
      )}
    </div>
  );
}

/* ========================================================================= */
/* 6. LAUNCH CAMPAIGN FORM                                                   */
/* ========================================================================= */
function LaunchCampaignForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!title.trim() || !date.trim() || !location.trim()) {
      setErrorMsg("Title, date, and location are required");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          title: title.trim(),
          date,
          location: location.trim(),
          organizer: organizer.trim() || "redhope NGO Partner"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to launch campaign");
      }

      setSuccessMsg("Blood drive campaign launched successfully! System logs updated.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-100 flex items-start gap-2">
          <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 text-sm p-3.5 rounded-xl border border-green-100 flex items-start gap-2">
          <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Campaign Title / Name</label>
        <input 
          type="text"
          placeholder="e.g. Mega Summer Blood Drive"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Drive Date</label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Organizer / NGO Name</label>
          <input 
            type="text"
            placeholder="e.g. Red Cross Chapter"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Venue / Venue Address</label>
        <div className="relative flex items-center">
          <MapPin className="absolute left-3.5 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="e.g. Community Center, Sector 15"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-gray-800 text-sm focus:border-red-500 transition"
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm shadow-sm hover:shadow transition disabled:opacity-50"
        >
          {loading ? "Launching..." : "Launch Campaign"}
        </button>
      </div>
    </form>
  );
}
