"use client";

import { useState, FormEvent, useEffect } from "react";

type BloodRequest = {
  id: number;
  bloodGroup: string;
  quantity: number;
  urgency: string;
  note: string | null;
  status: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  createdAt: string;
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState("Normal");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      
      const res = await fetch("/api/requests", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await submitRequest(position.coords.latitude, position.coords.longitude);
        },
        async (error) => {
          console.warn("Geolocation denied or failed", error);
          await submitRequest(null, null); // Submit without precise location
        }
      );
    } else {
      await submitRequest(null, null);
    }
  }

  async function submitRequest(latitude: number | null, longitude: number | null) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setMessage("Please log in to submit a request.");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodGroup,
          quantity,
          urgency,
          note,
          latitude,
          longitude,
          locationName: latitude && longitude ? "Current Location" : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Blood request submitted successfully!");
        setRequests((prev) => [data.data, ...prev]);
        setBloodGroup("A+");
        setQuantity(1);
        setUrgency("Normal");
        setNote("");
      } else {
        setMessage(data.message || "Failed to submit request.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Blood Requests</h1>

      {/* Submit Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Submit a Blood Request
        </h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Quantity (units)
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="Normal">Normal</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional info"
              className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="md:col-span-2">
            {message && (
              <p
                className={`text-sm mb-2 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>

      {/* Requests List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Your Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-gray-400">No blood requests submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Blood Group</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Urgency</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((r) => (
                  <tr key={r.id} className="text-gray-700">
                    <td className="px-4 py-3 font-semibold">{r.bloodGroup}</td>
                    <td className="px-4 py-3">{r.quantity} units</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          r.urgency === "Emergency"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {r.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
