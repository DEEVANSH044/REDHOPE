"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Plus, Minus, Info } from "lucide-react";

interface BloodStock {
  id: number;
  bloodGroup: string;
  stock: number;
  total: number;
}

export default function BloodInventory() {
  const { refreshTrigger, triggerRefresh } = useDashboard();
  const [inventory, setInventory] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin role from token
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload?.role === "admin");
      }
    } catch {}
  }, []);

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/inventory", {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInventory(data.data || []);
      }
    } catch (e) {
      console.error("Failed to load inventory in BloodInventory component", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [refreshTrigger]);

  // Adjust stock API call
  const handleAdjustStock = async (bloodGroup: string, action: "increment" | "decrement") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ bloodGroup, action, value: 1 })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerRefresh(); // Sync whole dashboard
      } else {
        alert(data.message || "Failed to adjust stock");
      }
    } catch (e) {
      console.error("Failed to adjust stock", e);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xl font-bold text-gray-900">Blood Bank Inventory</h3>
        {isAdmin && (
          <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-100">
            Admin Controls Enabled
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-6">Current stock by blood group (Real-time DB levels)</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="border border-gray-100 p-4 rounded-xl space-y-3 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-6 w-8 bg-gray-100 rounded" />
                <div className="h-5 w-14 bg-gray-100 rounded-full" />
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-2xl text-gray-400">
          <Info className="mx-auto text-gray-300 mb-1" size={24} />
          <p className="text-sm">No blood inventory levels found. Please seed the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {inventory.map((item) => {
            const percent = item.total > 0 ? (item.stock / item.total) * 100 : 0;
            
            // Compute dynamic status
            let status: "Good" | "Adequate" | "Low" | "Critical" = "Good";
            if (percent < 15) status = "Critical";
            else if (percent < 30) status = "Low";
            else if (percent < 60) status = "Adequate";

            // Colors mapping
            const statusColor =
              status === "Good"
                ? "bg-green-50 text-green-700 border-green-100"
                : status === "Low"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                  : status === "Critical"
                    ? "bg-red-50 text-red-700 border-red-100"
                    : "bg-blue-50 text-blue-700 border-blue-100";

            const progressColor =
              status === "Good"
                ? "bg-green-500"
                : status === "Low"
                  ? "bg-yellow-500"
                  : status === "Critical"
                    ? "bg-red-500"
                    : "bg-blue-500";

            return (
              <div key={item.id} className="border border-gray-200 p-4.5 rounded-xl hover:border-gray-300 transition relative group">
                <div className="flex justify-between items-center mb-2.5">
                  <h4 className="text-lg font-bold text-gray-900">{item.bloodGroup}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                    {status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 h-2.5 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`${progressColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-gray-500">
                    {item.stock} / {item.total} units
                  </p>
                  
                  {/* Admin adjustment buttons */}
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAdjustStock(item.bloodGroup, "decrement")}
                        disabled={item.stock <= 0}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded border border-gray-150 transition disabled:opacity-30 cursor-pointer"
                        title="Reduce Stock"
                      >
                        <Minus size={12} />
                      </button>
                      <button
                        onClick={() => handleAdjustStock(item.bloodGroup, "increment")}
                        disabled={item.stock >= item.total}
                        className="p-1 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded border border-gray-150 transition disabled:opacity-30 cursor-pointer"
                        title="Add Stock"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
