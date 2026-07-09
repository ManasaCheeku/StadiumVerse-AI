import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
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
    color: "bg-green-500",
  },
  {
    name: "Food Court",
    position: [40.8141, -74.0738],
    description: "Food & Drinks",
    color: "bg-orange-500",
  },
  {
    name: "Medical Centre",
    position: [40.8131, -74.0739],
    description: "Emergency Medical Support",
    color: "bg-red-500",
  },
  {
    name: "Parking P2",
    position: [40.8128, -74.0750],
    description: "620 Available Slots",
    color: "bg-sky-500",
  },
  {
    name: "Washroom",
    position: [40.8138, -74.0740],
    description: "Nearest Washroom",
    color: "bg-violet-500",
  },
];

export default function StadiumMap() {
  return (
    <section
      aria-labelledby="stadium-map"
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            id="stadium-map"
            className="text-4xl font-bold text-white"
          >
            🗺 Stadium Navigation
          </h2>

          <p className="text-slate-400">
            Navigate to gates, parking, food courts and emergency facilities.
          </p>
        </div>

        <span className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Live Navigation
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 shadow-2xl">
        <MapContainer
          center={[40.8136, -74.0745]}
          zoom={17}
          scrollWheelZoom
          zoomControl={false}
          className="h-[600px] w-full"
        >
          <ZoomControl position="bottomright" />

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
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">
                    {location.name}
                  </h3>

                  <p>{location.description}</p>

                  <button className="rounded-lg bg-sky-600 px-3 py-2 text-white hover:bg-sky-500">
                    Navigate Here
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {locations.map((item) => (
          <div
            key={item.name}
            className="rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${item.color}`} />

              <span className="font-semibold text-white">
                {item.name}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}