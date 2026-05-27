"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Droplet,
  FileText,
  Calendar,
  Building2,
  Megaphone,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

export default function Sidebar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("user");
  const [initials, setInitials] = useState("U");

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; sameSite=lax;";
    router.push("/login");
  };

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64));
          if (decoded && decoded.email) {
            setUserEmail(decoded.email);
            setUserRole(decoded.role || "user");
            
            // Smart name parser (e.g. deevanshrana011@gmail.com -> Deevanshrana)
            const emailPrefix = decoded.email.split("@")[0];
            const cleanParts = emailPrefix.split(/[\d._-]+/).filter(Boolean);
            const formattedName = cleanParts
              .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ");
            const displayName = decoded.name || formattedName || "User";
            setUserName(displayName);

            // Compute initials
            const words = displayName.split(" ");
            const parsedInitials = words.length > 1 
              ? (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
              : displayName.slice(0, 2).toUpperCase();
            setInitials(parsedInitials || "U");
          }
        }
      }
    } catch (e) {
      console.error("Failed to decode token in Sidebar", e);
    }
  }, []);

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-8 px-1">
          <Image
            src="/blood-donate.png"
            alt="redhope Logo"
            width={36}
            height={36}
            className="object-contain"
          />
          <h1 className="text-2xl font-bold text-red-600 tracking-wide">
            redhope
          </h1>
        </div>

        <nav className="space-y-2">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            href="/dashboard"
            active
          />
          
          {(userRole === "admin" || userRole === "bloodbank" || userRole === "ngo") && (
            <SidebarItem
              icon={<Droplet size={18} />}
              label="Blood Inventory"
              href="/inventory"
            />
          )}

          <SidebarItem
            icon={<FileText size={18} />}
            label="Requests"
            href="/requests"
          />

          {(userRole === "admin" || userRole === "donor" || userRole === "user") && (
            <SidebarItem
              icon={<Calendar size={18} />}
              label="Appointments"
              href="/appointments"
            />
          )}

          <p className="text-xs text-gray-400 mt-6 mb-2">Management</p>

          <SidebarItem
            icon={<Building2 size={18} />}
            label="Blood Banks"
            href="/blood-banks"
          />

          {(userRole === "admin" || userRole === "ngo" || userRole === "bloodbank") && (
            <SidebarItem
              icon={<Megaphone size={18} />}
              label="Campaigns"
              href="/campaigns"
            />
          )}

          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            href="/settings"
          />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition hover:bg-red-50 hover:text-red-600 text-gray-700 font-semibold text-sm border-none bg-transparent justify-start mt-2"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
        <div className="bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-sm truncate max-w-[130px]">{userName}</p>
          <p className="text-xs text-gray-500 truncate max-w-[130px]">{userEmail || "Not logged in"}</p>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, href, active = false }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
        active
          ? "bg-red-50 text-red-600 font-semibold"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
