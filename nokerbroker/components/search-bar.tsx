"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const [locality, setLocality] = useState("");
  const [budget, setBudget] = useState("Any budget");
  const [bhk, setBhk] = useState("Any");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (locality.trim()) params.set("locality", locality.trim());
    if (budget !== "Any budget") params.set("budget", budget);
    if (bhk !== "Any") params.set("bhk", bhk);
    router.push(`/buy?${params.toString()}`);
  }

  return (
    <form className="search-card" aria-label="Search properties" onSubmit={handleSubmit}>
      <div className="search-field">
        <label htmlFor="locality">Locality</label>
        <input id="locality" value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="Andheri West, Powai…" />
      </div>
      <div className="search-field">
        <label htmlFor="budget">Budget</label>
        <select id="budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option>Any budget</option>
          <option>Under ₹50 L</option>
          <option>₹50 L – ₹1 Cr</option>
          <option>₹1 Cr – ₹2 Cr</option>
          <option>₹2 Cr+</option>
        </select>
      </div>
      <div className="search-field">
        <label htmlFor="bhk">BHK</label>
        <select id="bhk" value={bhk} onChange={(e) => setBhk(e.target.value)}>
          <option>Any</option>
          <option>1 RK</option>
          <option>1 BHK</option>
          <option>2 BHK</option>
          <option>3 BHK</option>
          <option>4 BHK+</option>
        </select>
      </div>
      <button className="search-go" type="submit">Search</button>
    </form>
  );
}
