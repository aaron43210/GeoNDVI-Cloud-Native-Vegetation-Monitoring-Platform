import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-draw";
import type { PolygonGeoJSON } from "../types";

interface Props {
  onAoiChange: (geometry: PolygonGeoJSON | null) => void;
  tileUrl: string | null;
  opacity: number;
}

/**
 * MapView Component
 * 
 * Job: Renders the interactive Leaflet map, basemaps, Earth Engine overlay, and drawing tools.
 *      Notifies the parent component when an Area of Interest (AOI) is drawn.
 * 
 * Inputs (Props):
 *  - onAoiChange: Callback function triggered when a user draws, edits, or deletes a polygon. Passes the GeoJSON or null.
 *  - tileUrl: The URL format string for Earth Engine map tiles (e.g., 'https://.../{z}/{x}/{y}').
 *  - opacity: A number between 0 and 1 defining the transparency of the Earth Engine overlay.
 * 
 * Output:
 *  - Returns a React JSX Element containing the map container div.
 */
export default function MapView({ onAoiChange, tileUrl, opacity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawnRef = useRef<L.FeatureGroup | null>(null);
  const overlayRef = useRef<L.TileLayer | null>(null);
  const aoiCbRef = useRef(onAoiChange);
  aoiCbRef.current = onAoiChange;

  // ---- init map once ----
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, { center: [20, 0], zoom: 3 });
    mapRef.current = map;

    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    });
    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Tiles © Esri" }
    );
    osm.addTo(map);
    L.control.layers({ OpenStreetMap: osm, Satellite: satellite }).addTo(map);

    const drawn = new L.FeatureGroup().addTo(map);
    drawnRef.current = drawn;

    const drawControl = new L.Control.Draw({
      position: "topleft",
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: false, // avoids a known leaflet-draw bug
          shapeOptions: { color: "#059669" },
        },
        rectangle: false,
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: { featureGroup: drawn },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e: any) => {
      drawn.clearLayers(); // single AOI only
      drawn.addLayer(e.layer);
      aoiCbRef.current(e.layer.toGeoJSON().geometry as PolygonGeoJSON);
    });
    map.on(L.Draw.Event.EDITED, () => {
      const layer = drawn.getLayers()[0] as L.Polygon | undefined;
      if (layer) aoiCbRef.current(layer.toGeoJSON().geometry as PolygonGeoJSON);
    });
    map.on(L.Draw.Event.DELETED, () => {
      if (drawn.getLayers().length === 0) aoiCbRef.current(null);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      drawnRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  // ---- swap the GEE overlay when tileUrl changes ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }
    if (tileUrl) {
      overlayRef.current = L.tileLayer(tileUrl, { opacity, maxZoom: 20, zIndex: 10 }).addTo(map);
      const drawn = drawnRef.current;
      if (drawn && drawn.getLayers().length) {
        map.fitBounds(drawn.getBounds(), { padding: [30, 30] });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileUrl]);

  // ---- opacity slider ----
  useEffect(() => {
    overlayRef.current?.setOpacity(opacity);
  }, [opacity]);

  return <div ref={containerRef} className="h-full w-full" />;
}
