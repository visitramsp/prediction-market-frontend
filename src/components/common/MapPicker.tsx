"use client";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  useMap,
} from "react-leaflet";
import { useState, useEffect, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Position = { lat: number; lng: number };

type LocationData = {
  lat: number;
  lng: number;
  address: string;
  display_name?: string;
};

function MapResizeHandler({ setMap }: { setMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    setMap(map);
    setTimeout(() => map.invalidateSize(), 400);
  }, [map, setMap]);
  return null;
}

export default function MapPicker({
  onSelect,
  height = "420px",
}: {
  onSelect: (data: LocationData) => void; // ← Updated type
  height?: string;
}) {
  const [position, setPosition] = useState<Position | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Suggestions
  const fetchSuggestions = useCallback(async (searchText: string) => {
    if (searchText.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=8`,
      );
      const data = await res.json();
      setSuggestions(data || []);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce Search
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (query.length >= 3) {
      timeoutRef.current = setTimeout(() => fetchSuggestions(query), 500);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, fetchSuggestions]);

  // Reverse Geocoding - Get Address from Lat/Lng
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      );
      const data = await res.json();
      return data?.display_name || "Address not found";
    } catch (error) {
      console.error("Reverse Geocoding Error:", error);
      return "Could not fetch address";
    }
  };

  // Select from Search Suggestion
  const selectLocation = async (item: any) => {
    const newPos = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
    const address =
      item.display_name || (await fetchAddress(newPos.lat, newPos.lng));

    const locationData: LocationData = {
      lat: newPos.lat,
      lng: newPos.lng,
      address,
      display_name: item.display_name,
    };

    setPosition(newPos);
    setQuery(item.display_name);
    setSuggestions([]);
    onSelect(locationData); // ← Sending full data

    if (map) {
      map.flyTo([newPos.lat, newPos.lng], 16, { duration: 1.5 });
    }
  };

  // Click on Map
  function LocationMarker() {
    useMapEvents({
      async click(e) {
        const newPos = e.latlng as Position;
        setPosition(newPos);

        const address = await fetchAddress(newPos.lat, newPos.lng);

        const locationData: LocationData = {
          lat: newPos.lat,
          lng: newPos.lng,
          address,
        };

        onSelect(locationData); // ← Sending full data
      },
    });

    return position ? <Marker position={position} icon={defaultIcon} /> : null;
  }

  return (
    <div className="w-full font-sans">
      {/* Search Bar */}
      <div className="relative z-[1000] mb-4">
        <input
          type="text"
          placeholder="Search location (e.g. Lucknow, India)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 bg-[#1A233D] border border-[#2A3A5F] text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-500"
        />

        {/* Suggestions */}
        {(loading || suggestions.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A233D] border border-[#2A3A5F] rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-[1100]">
            {loading && <div className="p-4 text-slate-400">Searching...</div>}
            {suggestions.map((item, i) => (
              <button
                key={i}
                onClick={() => selectLocation(item)}
                className="w-full text-left px-4 py-3 hover:bg-[#212B45] border-b border-[#2A3A5F] last:border-none flex items-start gap-3 text-white"
              >
                <span>📍</span>
                <span className="text-sm truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div
        className="relative rounded-2xl overflow-hidden border border-[#2A3A5F] shadow-inner"
        style={{ height }}
      >
        <MapContainer
          center={[26.8467, 80.9462]} // Default: Lucknow
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LocationMarker />
          <MapResizeHandler setMap={setMap} />
        </MapContainer>
      </div>
    </div>
  );
}
