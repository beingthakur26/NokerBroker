"use client";

export interface ContactableListing {
  id: string;
  owner?: { name?: string; phone?: string } | null;
}

export interface ContactLinks {
  phone: string | null;
  telHref: string | null;
  whatsappHref: string | null;
}

/**
 * Single seam for revealing owner contact. Today it returns the links
 * immediately (ungated). If contact-gating is introduced later, this is the
 * one place to check "has this buyer got contacts remaining" before revealing.
 */
export function useContactReveal() {
  function handleContactReveal(listing: ContactableListing): ContactLinks {
    const raw = listing.owner?.phone;
    if (!raw) return { phone: null, telHref: null, whatsappHref: null };
    const digits = raw.replace(/\D/g, "");
    return {
      phone: raw,
      telHref: `tel:+${digits}`,
      whatsappHref: `https://wa.me/${digits}`,
    };
  }

  return { handleContactReveal };
}
