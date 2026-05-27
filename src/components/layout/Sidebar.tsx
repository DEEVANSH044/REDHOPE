"use client";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6">
      <h2 className="text-gray-700 font-semibold text-lg mb-6">Dashboard</h2>

      <ul className="space-y-4 text-gray-600">
        <li>
          <Link
            href="/dashboard"
            className="block px-3 py-2 rounded hover:bg-red-100 hover:text-red-600"
          >
            Overview
          </Link>
        </li>

        <li>
          <Link
            href="/inventory"
            className="block px-3 py-2 rounded hover:bg-red-100 hover:text-red-600"
          >
            Blood Inventory
          </Link>
        </li>



        <li>
          <Link
            href="/requests"
            className="block px-3 py-2 rounded hover:bg-red-100 hover:text-red-600"
          >
            Requests
          </Link>
        </li>

        <li>
          <Link
            href="/appointments"
            className="block px-3 py-2 rounded hover:bg-red-100 hover:text-red-600"
          >
            Appointments
          </Link>
        </li>

        <li>
          <Link
            href="/blood-banks"
            className="block px-3 py-2 rounded hover:bg-red-100 hover:text-red-600"
          >
            Blood Banks
          </Link>
        </li>

        <li>
          <Link
            href="/campaigns"
            className="block px-3 py-2 rounded hover:bg-red-100 hover:text-red-600"
          >
            Campaigns
          </Link>
        </li>

        <li>
          <Link
            href="/settings"
            className="block px-3 py-2 rounded hover:bg-red-100 hover:text-red-600"
          >
            Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
}
