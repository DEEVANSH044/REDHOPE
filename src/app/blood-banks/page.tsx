"use client";

import { useState } from "react";

type BloodInventory = {
  "A+": number;
  "A-": number;
  "B+": number;
  "B-": number;
  "AB+": number;
  "AB-": number;
  "O+": number;
  "O-": number;
};

type BloodBank = {
  id: number;
  name: string;
  location: string;
  contact: string;
  inventory: BloodInventory;
  lastUpdated: string;
};

const DUMMY_BLOOD_BANKS: BloodBank[] = [
  {
    id: 1,
    name: "City Central Blood Bank",
    location: "Mumbai, Maharashtra",
    contact: "+91 98765 43210",
    inventory: {
      "A+": 45,
      "A-": 12,
      "B+": 38,
      "B-": 8,
      "AB+": 15,
      "AB-": 3,
      "O+": 52,
      "O-": 18,
    },
    lastUpdated: "2026-05-09T08:30:00Z",
  },
  {
    id: 2,
    name: "Apollo Blood Center",
    location: "Delhi, NCR",
    contact: "+91 87654 32109",
    inventory: {
      "A+": 67,
      "A-": 23,
      "B+": 41,
      "B-": 14,
      "AB+": 28,
      "AB-": 7,
      "O+": 89,
      "O-": 31,
    },
    lastUpdated: "2026-05-09T07:15:00Z",
  },
  {
    id: 3,
    name: "Max Healthcare Blood Bank",
    location: "Bangalore, Karnataka",
    contact: "+91 76543 21098",
    inventory: {
      "A+": 34,
      "A-": 9,
      "B+": 29,
      "B-": 11,
      "AB+": 12,
      "AB-": 4,
      "O+": 43,
      "O-": 15,
    },
    lastUpdated: "2026-05-08T16:45:00Z",
  },
  {
    id: 4,
    name: "Fortis Blood Services",
    location: "Chennai, Tamil Nadu",
    contact: "+91 65432 10987",
    inventory: {
      "A+": 56,
      "A-": 19,
      "B+": 47,
      "B-": 13,
      "AB+": 22,
      "AB-": 6,
      "O+": 71,
      "O-": 25,
    },
    lastUpdated: "2026-05-09T09:20:00Z",
  },
  {
    id: 5,
    name: "AIIMS Blood Bank",
    location: "Pune, Maharashtra",
    contact: "+91 54321 09876",
    inventory: {
      "A+": 78,
      "A-": 27,
      "B+": 53,
      "B-": 16,
      "AB+": 31,
      "AB-": 9,
      "O+": 94,
      "O-": 33,
    },
    lastUpdated: "2026-05-09T10:00:00Z",
  },
  {
    id: 6,
    name: "Medanta Blood Center",
    location: "Gurgaon, Haryana",
    contact: "+91 43210 98765",
    inventory: {
      "A+": 42,
      "A-": 15,
      "B+": 35,
      "B-": 10,
      "AB+": 18,
      "AB-": 5,
      "O+": 58,
      "O-": 20,
    },
    lastUpdated: "2026-05-08T14:30:00Z",
  },
];

export default function BloodBanksPage() {
  const [bloodBanks] = useState<BloodBank[]>(DUMMY_BLOOD_BANKS);

  const getTotalUnits = (inventory: BloodInventory): number => {
    return Object.values(inventory).reduce((sum, units) => sum + units, 0);
  };

  const getStatusColor = (units: number): string => {
    if (units >= 50) return "text-green-600 bg-green-100";
    if (units >= 20) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Blood Banks</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Blood Bank Directory
        </h2>

        {bloodBanks.length === 0 ? (
          <p className="text-gray-400">No blood banks listed yet.</p>
        ) : (
          <div className="space-y-6">
            {bloodBanks.map((bank) => (
              <div key={bank.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{bank.name}</h3>
                    <p className="text-sm text-gray-600">{bank.location}</p>
                    <p className="text-sm text-gray-600">{bank.contact}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Last Updated: {new Date(bank.lastUpdated).toLocaleString()}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      Total: {getTotalUnits(bank.inventory)} units
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                  {Object.entries(bank.inventory).map(([group, units]) => (
                    <div
                      key={group}
                      className={`p-2 rounded text-center ${getStatusColor(units)}`}
                    >
                      <div className="font-semibold">{group}</div>
                      <div className="text-sm">{units} units</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
