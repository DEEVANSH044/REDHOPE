import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar stays fixed */}
        <Sidebar />

        {/* Right side */}
        <div className="flex-1 flex flex-col">
          <Topbar />

          {/* Page content changes here */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}
