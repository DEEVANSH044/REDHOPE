import BloodInventory from "@/components/dashboard/BloodInventory";

export default function InventoryPage() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Blood Inventory</h1>
      <BloodInventory />
    </div>
  );
}
