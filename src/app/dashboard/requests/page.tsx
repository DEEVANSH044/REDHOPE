"use client";

import { Search, MapPin, Clock, Phone } from "lucide-react";
import { useState } from "react";

type Priority = "Critical" | "Urgent" | "Normal";
type Status = "Pending" | "Fulfilled";

const requestsData = [
  {
    blood: "O-",
    units: "3 units needed",
    hospital: "City General Hospital",
    location: "Mumbai",
    time: "30 mins ago",
    phone: "+91 98765 43210",
    priority: "Critical" as Priority,
    status: "Pending" as Status,
  },
  {
    blood: "B+",
    units: "2 units needed",
    hospital: "Apollo Hospital",
    location: "Delhi",
    time: "2 hours ago",
    phone: "+91 87654 32109",
    priority: "Urgent" as Priority,
    status: "Pending" as Status,
  },
  {
    blood: "A+",
    units: "1 unit needed",
    hospital: "Max Healthcare",
    location: "Pune",
    time: "5 hours ago",
    phone: "+91 76543 21098",
    priority: "Normal" as Priority,
    status: "Pending" as Status,
  },
  {
    blood: "AB+",
    units: "2 units needed",
    hospital: "Fortis Hospital",
    location: "Bangalore",
    time: "1 day ago",
    phone: "+91 65432 10987",
    priority: "Urgent" as Priority,
    status: "Fulfilled" as Status,
  },
  {
    blood: "O+",
    units: "1 unit needed",
    hospital: "AIIMS",
    location: "Delhi",
    time: "2 days ago",
    phone: "+91 54321 09876",
    priority: "Normal" as Priority,
    status: "Fulfilled" as Status,
  },
];

export default function RequestsPage() {
  const [filter, setFilter] = useState<"All" | "Pending" | "Fulfilled">("All");

  const filteredRequests =
    filter === "All"
      ? requestsData
      : requestsData.filter((r) => r.status === filter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
        <p className="text-gray-500 mt-1">Manage blood donation requests</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex items-center bg-white px-4 py-3 rounded-xl border w-full lg:w-[420px]">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search requests..."
            className="outline-none w-full text-sm text-black bg-transparent"
          />
        </div>

        <div className="flex gap-3 items-center">
          {/* Tabs */}
          <div className="flex bg-white border rounded-xl overflow-hidden">
            {["All", "Pending", "Fulfilled"].map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setFilter(tab as "All" | "Pending" | "Fulfilled")
                }
                className={`px-4 py-2 text-sm font-medium ${
                  filter === tab
                    ? "bg-red-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-red-700 transition">
            + New Request
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-6">
        {filteredRequests.map((req, index) => (
          <div
            key={index}
            className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4"
          >
            {/* Top Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg">
                  {req.blood}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {req.units}
                    </h3>
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-gray-600">{req.hospital}</p>
                </div>
              </div>

              {/* Right Info */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {req.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {req.time}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {req.phone}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              {req.status !== "Fulfilled" && (
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                  Fulfill Request
                </button>
              )}

              <button className="border px-4 py-2 rounded-lg text-black text-sm hover:bg-gray-50">
                View Details
              </button>

              <button className="border px-4 py-2 rounded-lg text-black text-sm hover:bg-gray-50">
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- BADGES ---------------- */

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles =
    priority === "Critical"
      ? "bg-red-100 text-red-600"
      : priority === "Urgent"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-blue-100 text-blue-600";

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${styles}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles =
    status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${styles}`}>
      {status}
    </span>
  );
}
