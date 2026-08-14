"use client";

import { useEffect, useId, useState } from "react";
import { MapPin } from "lucide-react";

type Suggestion = { label: string; locality: string; latitude: number; longitude: number };

export function LocalityAutocomplete({ value, onChange, onSelect, id, placeholder }: { value: string; onChange: (value: string) => void; onSelect?: (suggestion: Suggestion) => void; id?: string; placeholder?: string }) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (value.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => { try { const response = await fetch(`/api/locations?q=${encodeURIComponent(value)}`, { signal: controller.signal }); if (response.ok) setSuggestions((await response.json()).suggestions ?? []); } catch (error) { if ((error as Error).name !== "AbortError") setSuggestions([]); } }, 180);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [value]);
  const visible = value.trim().length >= 2 ? suggestions : [];
  return <div className="locality-autocomplete"><input id={inputId} role="combobox" value={value} onChange={(event) => { onChange(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 120)} placeholder={placeholder} autoComplete="off" aria-autocomplete="list" aria-expanded={open && visible.length > 0} aria-controls={`${inputId}-suggestions`} />
    {open && visible.length > 0 && <ul id={`${inputId}-suggestions`} className="locality-suggestions" role="listbox">{visible.map((suggestion) => <li key={`${suggestion.label}-${suggestion.latitude}`} role="option" aria-selected={false}><button type="button" onMouseDown={(event) => { event.preventDefault(); onChange(suggestion.locality); onSelect?.(suggestion); setOpen(false); }}><MapPin size={15} /><span>{suggestion.label}</span></button></li>)}</ul>}
  </div>;
}
