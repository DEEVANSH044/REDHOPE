"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, Navigation, Filter, AlertCircle } from 'lucide-react';

// Dynamically import map to avoid SSR issues
const Map = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        <div className="text-gray-500 font-medium">Loading Map Data...</div>
      </div>
    </div>
  )
});

// Dummy Data
const DUMMY_DONORS = [
  { id: 1, lat: 28.6139, lng: 77.21, name: 'Rahul Sharma', bloodType: 'O+', distance: '1.2 km' },
  { id: 2, lat: 28.62, lng: 77.20, name: 'Priya Singh', bloodType: 'A-', distance: '2.4 km' },
  { id: 3, lat: 28.60, lng: 77.22, name: 'Amit Kumar', bloodType: 'B+', distance: '0.8 km' },
  { id: 4, lat: 28.63, lng: 77.19, name: 'Neha Gupta', bloodType: 'AB+', distance: '3.1 km' },
];

const DUMMY_HOSPITALS = [
  { id: 1, lat: 28.61, lng: 77.23, name: 'City Central Hospital', type: 'Blood Bank Available' },
  { id: 2, lat: 28.59, lng: 77.20, name: 'Max Super Speciality', type: '24/7 Emergency' },
];

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function LiveMapSection() {
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default New Delhi
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setZoom(14);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error finding location", error);
          setIsLocating(false);
          alert("Could not find your location. Please check permissions.");
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const [realRequests, setRealRequests] = useState<any[]>([]);
  const [realHospitals, setRealHospitals] = useState<any[]>([]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const queryParams = new URLSearchParams({
          q: searchQuery,
          type: 'all',
          bloodGroup: activeFilter === 'All' ? '' : activeFilter
        });
        
        const res = await fetch(`/api/search?${queryParams}`);
        const data = await res.json();
        
        if (data.success) {
          setRealRequests(data.data.requests || []);
          setRealHospitals(data.data.banks || []);
        }
      } catch (error) {
        console.error("Failed to fetch map data", error);
      }
    };
    
    fetchMapData();
  }, [searchQuery, activeFilter]);

  const filteredDonors = activeFilter === 'All' 
    ? DUMMY_DONORS 
    : DUMMY_DONORS.filter(d => d.bloodType === activeFilter);

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Interactive Location Radar</h3>
          <p className="text-sm text-gray-500">Find nearby blood donors, blood banks, and hospitals in real-time</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 font-bold text-xs border border-red-100 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          Live Radar
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-150 overflow-hidden flex flex-col lg:flex-row h-[600px]">
          
          {/* Sidebar */}
          <div className="w-full lg:w-96 border-r border-gray-100 p-6 flex flex-col bg-white z-10">
            
            {/* Search */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors text-sm"
                placeholder="Search locations, hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Locate Me */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 py-3 rounded-xl font-semibold transition-colors mb-6"
            >
              <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Finding you...' : 'Use My Current Location'}
            </button>

            {/* Filters */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Filter by Blood Group</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setActiveFilter(bg)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      activeFilter === bg
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Action */}
            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                  <AlertCircle className="w-5 h-5" />
                  Emergency Case?
                </div>
                <p className="text-red-600/80 text-sm mb-4">
                  Broadcast an urgent blood request to all nearby donors instantly.
                </p>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-[0.98]">
                  Broadcast Request
                </button>
              </div>
            </div>

          </div>

          {/* Map Area */}
          <div className="flex-1 relative bg-gray-100 h-[400px] lg:h-full">
            <Map 
              center={center} 
              zoom={zoom} 
              donors={filteredDonors}
              hospitals={realHospitals.length > 0 ? realHospitals : DUMMY_HOSPITALS}
              bloodRequests={realRequests}
            />
            
            {/* Map Legend Floating */}
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 z-[400]">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Map Legend</h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center bg-white text-[10px] font-bold text-red-600">O+</div>
                  <span className="text-sm font-medium text-gray-700">Available Donor</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md border-2 border-blue-600 flex items-center justify-center bg-white"><div className="w-3 h-3 bg-blue-600 rounded-sm"></div></div>
                  <span className="text-sm font-medium text-gray-700">Hospital / Blood Bank</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
  );
}
