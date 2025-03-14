// MapComponent.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon not showing correctly

const customIcon = new L.Icon({
  iconUrl: "/node_modules/leaflet/dist/images/marker-icon.png",
  iconRetinaUrl: "https://parspng.com/wp-content/uploads/2023/03/GPSpng.parspng.com_.png",
  shadowUrl: "/node_modules/leaflet/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapComponentProps {
  coordinates: [number, number] | { type: string; coordinates: [number, number] };
}

const MapComponent: React.FC<MapComponentProps> = ({ coordinates }) => {
  const position: [number, number] = Array.isArray(coordinates)
    ? [coordinates[1], coordinates[0]] // Swap to [latitude, longitude]
    : [coordinates.coordinates[1], coordinates.coordinates[0]]; // Handle nested coordinates


  return (
    <div className="h-[400px] w-full">
      <MapContainer
        center={position}
        zoom={13}
        className="h-full w-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={customIcon}>
          <Popup>
            📍 Coordinates: {position[0]}, {position[1]}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
