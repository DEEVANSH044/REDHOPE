"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white px-10 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-500 rounded-full"></div>
        <span className="font-bold text-gray-800">redhope</span>
      </div>

      <nav className="flex gap-8 text-sm text-gray-600">
        <Link href="/" className="hover:text-red-500">
          Home
        </Link>
        <Link href="/dashboard" className="hover:text-red-500">
          Dashboard
        </Link>

        <Link
          href="/login"
          className="bg-red-500 text-white px-4 py-2 rounded-full text-xs"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
