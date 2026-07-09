import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const stadiumIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
});

const locations = [
  {
    name: "Gate E12",
    position: [40.8136, -74.0745],
    description: "Recommended Entry Gate",
  },
  {
    name: "Food Court",
    position: [40.8141, -74.0738],
    description: "Food & Drinks",
  },
  {
    name: "Medical Centre",
    position: [40.8131, -74.0739],
    description: "Emergency Medical Support",
  },
  {
    name: "Parking P2",
    position: [40.8128, -74.0750],
    description: "620 Available Slots",
  },
  {
    name: "Washroom",
    position: [40.8138, -74.0740],
    description: "Nearest Washroom",
  },
];

export default function StadiumMap() {
  return (
    <MapContainer
      center={[40.8136, -74.0745]}
      zoom={17}
      scrollWheelZoom
      className="h-[600px] w-full rounded-3xl"
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((location) => (
        <Marker
          key={location.name}
          position={location.position as [number, number]}
          icon={stadiumIcon}
        >
          <Popup>
            <strong>{location.name}</strong>
            <br />
            {location.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}