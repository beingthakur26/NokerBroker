"use client";

import { useEffect, useState } from "react";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "BUYER" | "SELLER" | "BUILDER" | "ADMIN";
  verified: boolean;
  companyName: string;
  reraId: string;
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
