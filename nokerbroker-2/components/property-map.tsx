"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { PropertyView } from "@/lib/properties";

export function PropertyMap({ properties, token }: { properties: PropertyView[]; token?: string }) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!element.current || !token) return;
    const mapped = properties.filter((property) => Number.isFinite(property.latitude) && Number.isFinite(property.longitude));
    if (!mapped.length) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({ container: element.current, style: "mapbox://styles/mapbox/streets-v12", center: [mapped[0].longitude!, mapped[0].latitude!], zoom: 10 });
    const bounds = new mapboxgl.LngLatBounds();
    mapped.forEach((property) => { const coordinates: [number, number] = [property.longitude!, property.latitude!]; bounds.extend(coordinates); new mapboxgl.Marker({ color: "#f4600f" }).setLngLat(coordinates).setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`<strong>${escapeHtml(property.title)}</strong><br><a href="/buy/${encodeURIComponent(property.slug)}">View listing</a>`)).addTo(map); });
    if (mapped.length > 1) map.fitBounds(bounds, { padding: 48, maxZoom: 13 });
    return () => map.remove();
  }, [properties, token]);
  if (!token) return <p className="map-unavailable">Map search is unavailable while Mapbox is not configured.</p>;
  if (!properties.some((property) => Number.isFinite(property.latitude) && Number.isFinite(property.longitude))) return <p className="map-unavailable">Map locations will appear as listings are geocoded.</p>;
  return <section className="property-map-shell" aria-label="Map of matching properties"><div ref={element} className="property-map" /></section>;
}

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character); }
