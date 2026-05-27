"use client";

import { useState } from "react";

type Campaign = {
  id: number;
  title: string;
  date: string;
  location: string;
  organizer: string;
  description: string;
  targetDonors: number;
  registeredDonors: number;
  createdAt: string;
};

const DUMMY_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    title: "City Blood Drive 2026",
    date: "2026-05-15",
    location: "Mumbai Central Park",
    organizer: "Red Cross Society",
    description: "Annual blood donation drive to support local hospitals and emergency services.",
    targetDonors: 200,
    registeredDonors: 145,
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: 2,
    title: "Corporate Blood Donation Day",
    date: "2026-05-20",
    location: "Tech Park Conference Center",
    organizer: "TechCorp India",
    description: "Company-wide blood donation initiative for community welfare.",
    targetDonors: 150,
    registeredDonors: 98,
    createdAt: "2026-05-05T14:30:00Z",
  },
  {
    id: 3,
    title: "Youth Blood Donation Camp",
    date: "2026-05-25",
    location: "Delhi University Campus",
    organizer: "Youth Blood Network",
    description: "Special campaign targeting young donors aged 18-25 years.",
    targetDonors: 300,
    registeredDonors: 187,
    createdAt: "2026-05-08T09:15:00Z",
  },
  {
    id: 4,
    title: "Emergency Blood Reserve Drive",
    date: "2026-06-01",
    location: "Apollo Hospital, Bangalore",
    organizer: "Apollo Healthcare",
    description: "Critical blood reserve building for monsoon season emergencies.",
    targetDonors: 250,
    registeredDonors: 203,
    createdAt: "2026-05-10T11:45:00Z",
  },
  {
    id: 5,
    title: "Community Health Fair",
    date: "2026-06-05",
    location: "Chennai Marina Beach",
    organizer: "Health Ministry",
    description: "Multi-purpose health camp including blood donation services.",
    targetDonors: 400,
    registeredDonors: 267,
    createdAt: "2026-05-12T16:20:00Z",
  },
  {
    id: 6,
    title: "Rare Blood Type Collection",
    date: "2026-06-10",
    location: "Pune Medical College",
    organizer: "Rare Blood Foundation",
    description: "Specialized drive for rare blood types (AB-, O-, etc.)",
    targetDonors: 100,
    registeredDonors: 67,
    createdAt: "2026-05-15T13:10:00Z",
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DUMMY_CAMPAIGNS);
  const [registeredCampaigns, setRegisteredCampaigns] = useState<Set<number>>(new Set());

  const handleRegister = (campaignId: number) => {
    setRegisteredCampaigns(prev => new Set([...prev, campaignId]));
    // Update the registered count
    setCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, registeredDonors: campaign.registeredDonors + 1 }
          : campaign
      )
    );
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Campaigns</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Blood Donation Campaigns
        </h2>

        {campaigns.length === 0 ? (
          <p className="text-gray-400">No campaigns available at the moment.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="border rounded-lg p-4 hover:shadow-md transition bg-gray-50"
              >
                <h3 className="font-semibold text-gray-800 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{c.description}</p>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>
                    <span className="font-medium">Date:</span> {new Date(c.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {c.location}
                  </p>
                  <p>
                    <span className="font-medium">Organizer:</span>{" "}
                    {c.organizer}
                  </p>
                  <p>
                    <span className="font-medium">Progress:</span>{" "}
                    {c.registeredDonors}/{c.targetDonors} donors
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(c.registeredDonors / c.targetDonors) * 100}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => handleRegister(c.id)}
                  disabled={registeredCampaigns.has(c.id)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                    registeredCampaigns.has(c.id)
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {registeredCampaigns.has(c.id) ? "Registered ✓" : "Register"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
