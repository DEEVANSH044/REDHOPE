import { Search, Filter, Plus } from "lucide-react";

const bloodData = [
  {
    type: "A+",
    stock: 45,
    total: 100,
    status: "Adequate",
    updated: "2 hours ago",
  },
  { type: "A-", stock: 12, total: 50, status: "Low", updated: "3 hours ago" },
  { type: "B+", stock: 67, total: 100, status: "Good", updated: "1 hour ago" },
  {
    type: "B-",
    stock: 8,
    total: 50,
    status: "Critical",
    updated: "30 mins ago",
  },
  {
    type: "AB+",
    stock: 23,
    total: 50,
    status: "Adequate",
    updated: "4 hours ago",
  },
  {
    type: "AB-",
    stock: 5,
    total: 30,
    status: "Critical",
    updated: "1 hour ago",
  },
  { type: "O+", stock: 89, total: 120, status: "Good", updated: "2 hours ago" },
  { type: "O-", stock: 15, total: 60, status: "Low", updated: "5 hours ago" },
];

interface BloodCardProps {
  type: string;
  stock: number;
  total: number;
  status: string;
  updated: string;
}

export default function BloodInventoryPage() {
  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Blood Inventory</h1>
        <p className="text-gray-500 mt-1">Manage blood stock levels</p>
      </div>

      {/* Search + Actions */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex items-center bg-white px-4 py-3 rounded-xl border w-full lg:w-[400px]">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search blood type..."
            className="outline-none w-full text-sm bg-transparent"
          />
        </div>

        <div className="flex gap-3">
          <button className="p-3 bg-white border rounded-xl hover:bg-gray-50">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-red-700 transition">
            <Plus size={18} /> Add Stock
          </button>
        </div>
      </div>

      {/* Blood Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {bloodData.map((blood) => (
          <BloodCard key={blood.type} {...blood} />
        ))}
      </div>
    </div>
  );
}

function BloodCard({ type, stock, total, status, updated }: BloodCardProps) {
  const percent = (stock / total) * 100;

  const statusColor =
    status === "Critical"
      ? "bg-red-100 text-red-600"
      : status === "Low"
        ? "bg-yellow-100 text-yellow-700"
        : status === "Good"
          ? "bg-green-100 text-green-700"
          : "bg-blue-100 text-blue-700";

  const barColor =
    status === "Critical"
      ? "bg-red-500"
      : status === "Low"
        ? "bg-yellow-500"
        : status === "Good"
          ? "bg-green-500"
          : "bg-blue-500";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-red-600 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg">
          {type}
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor}`}
        >
          {status}
        </span>
      </div>

      <div className="text-3xl font-bold text-gray-900">
        {stock}{" "}
        <span className="text-lg text-gray-500 font-medium">
          / {total} units
        </span>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
        <div
          className={`h-2 rounded-full ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 mt-3">Updated {updated}</p>
    </div>
  );
}
