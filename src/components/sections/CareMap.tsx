import { useEffect, useRef, useCallback } from "react";
import { CareResult } from "@/hooks/useCareFinder";
import { escapeHtml } from "@/lib/format";

const BROWSER_KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
const TRACKING_ID = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];

interface CareMapProps {
  results: CareResult[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

// Minimal subset of the Google Maps JS API used here (@types/google.maps is not installed).
interface LatLngLiteral { lat: number; lng: number }
interface GMap {
  setCenter(c: LatLngLiteral): void;
  setZoom(z: number): void;
  fitBounds(b: GLatLngBounds, padding?: number): void;
}
interface GLatLngBounds { extend(p: LatLngLiteral): void }
interface GMarker {
  setMap(map: GMap | null): void;
  addListener(event: string, handler: () => void): void;
}
interface GInfoWindow { open(map: GMap | null, anchor: GMarker): void }
interface GMapsNamespace {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => GMap;
  LatLngBounds: new () => GLatLngBounds;
  Marker: new (opts: Record<string, unknown>) => GMarker;
  InfoWindow: new (opts: { content: string }) => GInfoWindow;
}
type MapsWindow = Window & {
  __civicCareInitMap?: () => void;
  google?: { maps: GMapsNamespace };
};

let mapsScriptLoaded = false;
let mapsScriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMaps(): Promise<void> {
  if (mapsScriptLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    loadCallbacks.push(resolve);
    if (mapsScriptLoading) return;
    mapsScriptLoading = true;
    (window as MapsWindow).__civicCareInitMap = () => {
      mapsScriptLoaded = true;
      mapsScriptLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&loading=async&callback=__civicCareInitMap&channel=${TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);
  });
}

export default function CareMap({ results, selectedId, onSelect }: CareMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<GMap | null>(null);
  const markersRef = useRef<GMarker[]>([]);

  const initMap = useCallback(async () => {
    await loadGoogleMaps();
    const google = (window as MapsWindow).google;
    if (!mapRef.current || !google) return;

    const gmaps = google.maps;
    const center = results.length > 0
      ? { lat: results[0].lat, lng: results[0].lng }
      : { lat: 39.8283, lng: -98.5795 };

    if (!mapInstance.current) {
      mapInstance.current = new gmaps.Map(mapRef.current, {
        center,
        zoom: results.length > 0 ? 12 : 4,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        clickableIcons: false,
      });
    } else {
      mapInstance.current.setCenter(center);
      mapInstance.current.setZoom(results.length > 0 ? 12 : 4);
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new gmaps.LatLngBounds();

    results.forEach((result) => {
      const marker = new gmaps.Marker({
        position: { lat: result.lat, lng: result.lng },
        map: mapInstance.current,
        title: result.name,
        zIndex: selectedId === result.id ? 1000 : undefined,
      });

      const infoWindow = new gmaps.InfoWindow({
        content: `<div style="max-width:200px;font-family:system-ui"><strong>${escapeHtml(result.name)}</strong><br/><span style="font-size:12px;color:#666">${escapeHtml(result.address)}</span>${result.rating ? `<br/><span style="font-size:12px">Rating ${escapeHtml(result.rating)} / 5</span>` : ""}</div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance.current, marker);
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
      className="w-full h-[350px] rounded-lg border border-border overflow-hidden"
      role="region"
      aria-label="Map of care results"
    />
  );
}
