"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Shop } from "@/lib/types";
import { USER_LOCATION } from "@/lib/mockData";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  shops: Shop[];
};

export default function ShopMap({ shops }: Props) {
  useEffect(() => {
    L.Marker.prototype.options.icon = markerIcon;
  }, []);

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl bg-paper-dim shadow-card">
      <MapContainer
        center={[USER_LOCATION.latitude, USER_LOCATION.longitude]}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.latitude, shop.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <strong>{shop.name}</strong>
              <br />
              {shop.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
