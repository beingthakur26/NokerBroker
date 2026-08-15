"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { PropertyView } from "@/lib/properties";

type Props = {
  properties: PropertyView[];
  token?: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
  onVisibleChange?: (ids: string[]) => void;
};

export function PropertyMap({ properties, token, selectedId, onSelect, onVisibleChange }: Props) {
  const element = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const hasFitted = useRef(false);
  const mapped = properties.filter((property) => Number.isFinite(property.latitude) && Number.isFinite(property.longitude));

  useEffect(() => {
    if (!element.current || !token || !mapped.length || mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({ container: element.current, style: "mapbox://styles/mapbox/streets-v12", center: [mapped[0].longitude!, mapped[0].latitude!], zoom: 10 });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [token, mapped]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const notifyVisible = () => {
      const bounds = map.getBounds();
      if (bounds) onVisibleChange?.(mapped.filter((property) => bounds.contains([property.longitude!, property.latitude!])).map((property) => property._id));
    };
    const draw = () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = mapped.map((property) => {
        const marker = new mapboxgl.Marker({ color: property._id === selectedId ? "#b54316" : "#f4600f", scale: property._id === selectedId ? 1.18 : 1 })
          .setLngLat([property.longitude!, property.latitude!])
          .addTo(map);
        marker.getElement().setAttribute("aria-label", `Show ${property.title}`);
        marker.getElement().addEventListener("click", () => onSelect?.(property._id));
        return marker;
      });
      if (!hasFitted.current && mapped.length) {
        hasFitted.current = true;
        if (mapped.length === 1) map.setCenter([mapped[0].longitude!, mapped[0].latitude!]);
        else {
          const bounds = new mapboxgl.LngLatBounds();
          mapped.forEach((property) => bounds.extend([property.longitude!, property.latitude!]));
          map.fitBounds(bounds, { padding: 48, maxZoom: 13 });
        }
      }
      notifyVisible();
    };
    const ready = () => draw();
    if (map.loaded()) ready(); else map.once("load", ready);
    map.on("moveend", notifyVisible);
    return () => { map.off("moveend", notifyVisible); };
  }, [mapped, selectedId, onSelect, onVisibleChange]);

  if (!token) return <p className="map-unavailable">Map search is unavailable while Mapbox is not configured. Locality and property filters still work.</p>;
  if (!mapped.length) return <p className="map-unavailable">Map locations will appear as listings are geocoded. Locality and property filters still work.</p>;
  return <section className="property-map-shell" aria-label="Map of matching properties"><div ref={element} className="property-map" /></section>;
}
