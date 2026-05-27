import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
} from "lucide-react";

const donors = [
  {
    name: "Rahul Sharma",
    donations: 12,
    blood: "A+",
    location: "Mumbai",
    lastDonation: "2 weeks ago",
    status: "active",
  },
  {
    name: "Priya Patel",
    donations: 8,
    blood: "B+",
    location: "Delhi",
    lastDonation: "1 month ago",
    status: "active",
  },
  {
    name: "Amit Kumar",
    donations: 15,
    blood: "O+",
    location: "Bangalore",
    lastDonation: "3 weeks ago",
    status: "active",
  },
  {
    name: "Sneha Gupta",
    donations: 5,
    blood: "AB-",
    location: "Chennai",
    lastDonation: "2 months ago",
    status: "inactive",
  },
  {
    name: "Vikram Singh",
    donations: 0,
    blood: "O-",
    location: "Pune",
    lastDonation: "Never",
    status: "pending",
  },
  {
    name: "Anita Desai",
    donations: 20,
    blood: "A-",
    location: "Hyderabad",
    lastDonation: "1 week ago",
    status: "active",
  },
];

export default function DonorsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Donors</h1>
        <p className="text-gray-500 mt-1">Manage registered blood donors</p>
      </div>

      {/* Search + Actions */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex items-center bg-white px-4 py-3 rounded-xl border w-full lg:w-[400px]">
          <Search size={18} className="text-gray-800 mr-2" />
          <input
            type="text"
            placeholder="Search donors..."
            className="outline-none w-full text-sm bg-transparent text-gray-900"
          />
        </div>

        <div className="flex gap-3">
          <button className="p-3 bg-white border rounded-xl hover:bg-gray-50">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-red-700 transition">
            <Plus size={18} /> Add Donor
          </button>
        </div>
      </div>

      {/* Donor Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="p-4 font-medium">Donor</th>
              <th className="p-4 font-medium">Blood Type</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Last Donation</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor, i) => (
              <tr key={i} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 flex items-center gap-3">
                  <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                    {donor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{donor.name}</p>
                    <p className="text-gray-500 text-xs">
                      {donor.donations} donations
                    </p>
                  </div>
                </td>

                <td className="p-4">
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                    {donor.blood}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex gap-3 text-gray-500">
                    <Phone size={16} />
                    <Mail size={16} />
                  </div>
                </td>

                <td className="p-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} /> {donor.location}
                  </div>
                </td>

                <td className="p-4 text-gray-600">{donor.lastDonation}</td>

                <td className="p-4">
                  <StatusBadge status={donor.status} />
                </td>

                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={18} className="text-gray-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "active"
      ? "bg-green-100 text-green-700"
      : status === "inactive"
        ? "bg-gray-200 text-gray-600"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  );
}
