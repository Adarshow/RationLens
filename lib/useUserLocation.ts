"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FALLBACK_LOCATION,
  type UserLocation,
} from "@/lib/mockData";

export type LocationStatus = "loading" | "granted" | "denied" | "unsupported";

export function resolveUserLocation(
  status: LocationStatus,
  location: UserLocation | null,
): UserLocation {
  if (status === "granted" && location) {
    return location;
  }
  return FALLBACK_LOCATION;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>("loading");

  const refresh = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocation(null);
      setStatus("unsupported");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("granted");
      },
      () => {
        setLocation(null);
        setStatus("denied");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60_000,
      },
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, status, refresh };
}
