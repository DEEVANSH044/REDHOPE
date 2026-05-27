"use client";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon Generators
const createUserIcon = () => {
  return L.divIcon({
    html: `<div class="w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse"><div class="w-3 h-3 bg-white rounded-full"></div></div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createDonorIcon = (bloodType: string) => {
  return L.divIcon({
    html: `<div class="w-10 h-10 bg-white rounded-full border-2 border-red-600 shadow-md flex items-center justify-center font-bold text-red-600 text-sm hover:scale-110 transition-transform">${bloodType}</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createHospitalIcon = () => {
  return L.divIcon({
    html: `<div class="w-10 h-10 bg-white rounded-lg border-2 border-blue-600 shadow-md flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createRequestIcon = (urgency: string) => {
  const borderColor = urgency === 'Emergency' ? 'border-red-600' : 'border-orange-500';
  const textColor = urgency === 'Emergency' ? 'text-red-600' : 'text-orange-500';
  return L.divIcon({
    html: `<div class="w-10 h-10 bg-white rounded-full border-2 ${borderColor} shadow-lg flex items-center justify-center ${urgency === 'Emergency' ? 'animate-bounce' : ''}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to handle map center movement
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

interface MapProps {
  center: [number, number];
  zoom: number;
  donors: any[];
  hospitals: any[];
  bloodRequests: any[];
}

export default function MapComponent({ center, zoom, donors, hospitals, bloodRequests }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MapController center={center} zoom={zoom} />
      
      {/* User Location */}
      <Marker position={center} icon={createUserIcon()}>
        <Popup className="rounded-xl">
          <div className="text-center font-semibold text-gray-900">Your Location</div>
        </Popup>
      </Marker>

      {/* Donors */}
      {donors.map((donor) => (
        <Marker key={donor.id} position={[donor.lat, donor.lng]} icon={createDonorIcon(donor.bloodType)}>
          <Popup className="rounded-xl min-w-[200px]">
            <div className="p-1">
              <div className="font-bold text-gray-900 text-lg mb-1">{donor.name}</div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-xs font-bold">{donor.bloodType}</span>
                <span className="text-sm text-gray-500">{donor.distance} away</span>
              </div>
              <button className="w-full bg-red-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-700 transition-colors">
                Request Blood
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Hospitals */}
      {hospitals.map((hospital) => (
        hospital.lat && hospital.lng && (
          <Marker key={`h-${hospital.id}`} position={[hospital.lat, hospital.lng]} icon={createHospitalIcon()}>
            <Popup className="rounded-xl min-w-[200px]">
              <div className="p-1">
                <div className="font-bold text-gray-900 text-lg mb-1">{hospital.name}</div>
                <div className="text-sm text-gray-500 mb-3">{hospital.type || hospital.contact}</div>
                <button className="w-full border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        )
      ))}

      {/* Patient Blood Requests */}
      {bloodRequests.map((request) => (
        request.latitude && request.longitude && (
          <Marker key={`req-${request.id}`} position={[request.latitude, request.longitude]} icon={createRequestIcon(request.urgency)}>
            <Popup className="rounded-xl min-w-[200px]">
              <div className="p-1">
                <div className="font-bold text-gray-900 text-lg mb-1">Blood Request</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-xs font-bold">{request.bloodGroup}</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${request.urgency === 'Emergency' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{request.urgency}</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">Quantity: {request.quantity} units</div>
                <button className="w-full bg-red-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-700 transition-colors">
                  Fulfill Request
                </button>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}
