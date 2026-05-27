"use client";

import { useEffect, useState, FormEvent } from "react";

const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  bloodGroup: string | null;
  role: string;
  createdAt: string;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        const user = data.data as UserProfile;
        setProfile(user);
        setName(user.name);
        setPhone(user.phone || "");
        setBloodGroup(user.bloodGroup || "");
      }
    } catch {
      console.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchProfile();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, phone, bloodGroup }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        setMessage(data?.message ?? "Failed to update profile");
        return;
      }

      setMessage("Profile updated successfully!");
      const user = data.data as UserProfile;
      setProfile(user);
      setName(user.name);
      setPhone(user.phone || "");
      setBloodGroup(user.bloodGroup || "");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      {/* Profile Info */}
      {profile && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Your Profile
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-700">Email:</span>{" "}
              {profile.email}
            </div>
            <div>
              <span className="font-medium text-gray-700">Role:</span>{" "}
              <span className="capitalize">{profile.role}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Member since:</span>{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Update Profile
        </h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">-- Select --</option>
              {BLOOD_GROUPS.filter(Boolean).map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
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
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
