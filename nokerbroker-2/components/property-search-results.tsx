"use client";

import { useMemo, useState } from "react";
import { PropertyCard } from "@/components/property-card";
import { PropertyMap } from "@/components/property-map";
import type { PropertyView } from "@/lib/properties";

export function PropertySearchResults({ properties, token }: { properties: PropertyView[]; token?: string }) {
  const [visibleIds, setVisibleIds] = useState<string[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const visible = useMemo(() => visibleIds === null ? properties : properties.filter((property) => visibleIds.includes(property._id)), [properties, visibleIds]);
  return <>
    <PropertyMap properties={properties} token={token} selectedId={selectedId} onSelect={setSelectedId} onVisibleChange={setVisibleIds} />
    <div className="buy-meta"><span>{visible.length} listing{visible.length === 1 ? "" : "s"} in this map area</span></div>
    {visible.length ? <div className="prop-grid">{visible.map((property, index) => <div key={property.slug} className={selectedId === property._id ? "rounded-[var(--radius-noker)] outline outline-2 outline-orange" : undefined} onMouseEnter={() => setSelectedId(property._id)}><PropertyCard property={property} detailsHref={`/buy/${property.slug}`} imagePriority={index < 3} /></div>)}</div> : <div className="empty-state"><h2>No matching listings in this map area</h2><p>Move or zoom out on the map, or clear a filter to widen your search.</p></div>}
  </>;
}
