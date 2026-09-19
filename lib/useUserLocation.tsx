"use client";

import { useCallback, useEffect, useState, createContext, useContext, ReactNode } from "react";
import {
  FALLBACK_LOCATION,
  type UserLocation,
} from "@/lib/mockData";

export type LocationStatus = "loading" | "granted" | "denied" | "unsupported";

export function resolveUserLocation(
  status: LocationStatus,
  location: UserLocation | null,
): UserLocation | null {
  if (status === "loading") {
    return null;
  }
  if (status === "granted" && location) {
    return location;
  }
  return FALLBACK_LOCATION;
}

type LocationContextType = {
  location: UserLocation | null;
  status: LocationStatus;
  refresh: () => void;
  placeName: string | null;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>("loading");
  const [placeName, setPlaceName] = useState<string | null>(null);

  const fetchPlaceName = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        setPlaceName(data.display_name?.split(',')[0] || null);
      }
    } catch {
      // fallback if reverse geocoding fails
      setPlaceName(null);
    }
  };

  const refresh = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocation(null);
      setStatus("unsupported");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const acc = position.coords.accuracy;
        setLocation({
          latitude: lat,
          longitude: lon,
          accuracy: acc,
        });
        setStatus("granted");
        void fetchPlaceName(lat, lon);
      },
      () => {
        setLocation(null);
        setStatus("denied");
        void fetchPlaceName(FALLBACK_LOCATION.latitude, FALLBACK_LOCATION.longitude);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      void fetchPlaceName(FALLBACK_LOCATION.latitude, FALLBACK_LOCATION.longitude);
    }
    refresh();
  }, [refresh]);

  return (
    <LocationContext.Provider value={{ location, status, refresh, placeName }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useUserLocation must be used within a UserLocationProvider");
  }
  return context;
}
