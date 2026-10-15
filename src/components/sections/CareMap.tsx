import { useEffect, useRef, useCallback, useState } from "react";
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
interface GMapStyle {
  featureType?: string;
  elementType?: string;
  stylers: Record<string, string | number>[];
}
interface GMapOptions {
  center: LatLngLiteral;
  zoom: number;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  streetViewControl?: boolean;
  mapTypeControl?: boolean;
  fullscreenControl?: boolean;
  clickableIcons?: boolean;
  /** Needs Maps JS >= 3.57; older loaders ignore it, so `styles` is kept as a fallback. */
  colorScheme?: "LIGHT" | "DARK" | "FOLLOW_SYSTEM";
  backgroundColor?: string;
  styles?: GMapStyle[];
}
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
  Map: new (el: HTMLElement, opts: GMapOptions) => GMap;
  LatLngBounds: new () => GLatLngBounds;
  Marker: new (opts: Record<string, unknown>) => GMarker;
  InfoWindow: new (opts: { content: string }) => GInfoWindow;
}
type MapsWindow = Window & {
  __civicCareInitMap?: () => void;
  google?: { maps: GMapsNamespace };
};

// Fallback styling for loaders that predate `colorScheme`. Matches the site's sky (#01061a).
const MAP_DARK_STYLES: GMapStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0b1230" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9fb0d8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#01061a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050a1f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2347" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a2347" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];

const DARK_BG = "#01061a";
const LIGHT_BG = "#fbfcff";

function isLightTheme() {
  return document.documentElement.classList.contains("light");
}

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
  const [light, setLight] = useState(() => (typeof document !== "undefined" ? isLightTheme() : false));

  // Rebuild the map when the theme toggle flips html.class.
  useEffect(() => {
    const observer = new MutationObserver(() => setLight(isLightTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Drop the current map so the next init builds one with the new scheme.
  useEffect(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    mapInstance.current = null;
    if (mapRef.current) mapRef.current.innerHTML = "";
  }, [light]);

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
        colorScheme: light ? "LIGHT" : "DARK",
        backgroundColor: light ? LIGHT_BG : DARK_BG,
        styles: light ? undefined : MAP_DARK_STYLES,
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
        content: `<div style="max-width:200px;font-family:system-ui;color:#111"><strong style="color:#111">${escapeHtml(result.name)}</strong><br/><span style="font-size:12px;color:#111">${escapeHtml(result.address)}</span>${result.rating ? `<br/><span style="font-size:12px;color:#111">Rating ${escapeHtml(result.rating)} / 5</span>` : ""}</div>`,
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
  }, [results, selectedId, onSelect, light]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  return (
    <div
      ref={mapRef}
      className="h-[320px] w-full overflow-hidden rounded-md border border-border sm:h-[380px]"
      style={{ backgroundColor: light ? LIGHT_BG : DARK_BG }}
      role="region"
      aria-label="Map of care results"
    />
  );
}
