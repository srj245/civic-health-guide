import { useEffect, useRef, useCallback } from "react";
import { CareResult } from "@/hooks/useCareFinder";

const GOOGLE_MAPS_API_KEY = "AIzaSyD2BOWaKp7Bl72egN5Bf_HQWsI-Uz38X1Y";

interface CareMapProps {
  results: CareResult[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

let mapsScriptLoaded = false;
let mapsScriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMaps(): Promise<void> {
  if (mapsScriptLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    if (mapsScriptLoading) {
      loadCallbacks.push(resolve);
      return;
    }
    mapsScriptLoading = true;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => {
      mapsScriptLoaded = true;
      mapsScriptLoading = false;
      resolve();
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

export default function CareMap({ results, selectedId, onSelect }: CareMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const initMap = useCallback(async () => {
    await loadGoogleMaps();
    if (!mapRef.current) return;

    const center = results.length > 0
      ? { lat: results[0].lat, lng: results[0].lng }
      : { lat: 39.8283, lng: -98.5795 }; // US center

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: results.length > 0 ? 12 : 4,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      });
    } else {
      mapInstance.current.setCenter(center);
      mapInstance.current.setZoom(results.length > 0 ? 12 : 4);
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    results.forEach((result) => {
      const marker = new google.maps.Marker({
        position: { lat: result.lat, lng: result.lng },
        map: mapInstance.current!,
        title: result.name,
        animation: selectedId === result.id ? google.maps.Animation.BOUNCE : undefined,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="max-width:200px;font-family:system-ui"><strong>${result.name}</strong><br/><span style="font-size:12px;color:#666">${result.address}</span>${result.rating ? `<br/><span style="font-size:12px">⭐ ${result.rating}</span>` : ""}</div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance.current!, marker);
        onSelect?.(result.id);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: result.lat, lng: result.lng });
    });

    if (results.length > 1) {
      mapInstance.current.fitBounds(bounds, 50);
    }
  }, [results, selectedId, onSelect]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[350px] rounded-xl border border-border overflow-hidden"
    />
  );
}
