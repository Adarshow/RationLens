"use client";

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Shop } from "@/lib/types";
import { FALLBACK_LOCATION, type UserLocation } from "@/lib/mockData";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const youIcon = L.divIcon({
  className: "rationlens-you-marker",
  html: '<span class="rationlens-you-dot"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Recenter({ location }: { location: UserLocation }) {
  const map = useMap();
  useEffect(() => {
    map.setView([location.latitude, location.longitude]);
  }, [location.latitude, location.longitude, map]);
  return null;
}

type Props = {
  shops: Shop[];
  userLocation: UserLocation | null;
  showUserMarker?: boolean;
};

export default function ShopMap({
  shops,
  userLocation,
  showUserMarker = false,
}: Props) {
  useEffect(() => {
    L.Marker.prototype.options.icon = markerIcon;
  }, []);

  const centerLocation = userLocation ?? FALLBACK_LOCATION;

  return (
    <div className="h-[280px] w-full overflow-hidden rounded-2xl bg-paper-dim shadow-card md:h-[420px] lg:h-[520px]">
      <MapContainer
        center={[centerLocation.latitude, centerLocation.longitude]}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <Recenter location={centerLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showUserMarker ? (
          <Marker
            position={[centerLocation.latitude, centerLocation.longitude]}
            icon={youIcon}
          >
            <Popup>You are here</Popup>
          </Marker>
        ) : null}
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
