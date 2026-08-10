# Thikana — NoBroker-Inspired Design, Workflow & Folder Structure

Based on the actual current NoBroker site structure, adapted to your palette and scope. Contact-gating is being built **free-for-now but architected so it can be gated later** without a rebuild — see §4.

---

## 1. What's Copied vs. Deliberately Different

| NoBroker | Thikana | Why |
|---|---|---|
| Multi-city with city switcher | Mumbai only | Matches your PRD scope — don't build multi-city infrastructure for a single-city v1 |
| Buy / Rent / Commercial toggle | Buy only (+ Builder Projects) | Your PRD explicitly scoped out rentals for v1 |
| Buyer/Tenant pays after free contact limit | Free contact, decision deferred | Per your call above — built so gating can be added later without touching the core flow |
| Bolted-on services (packers, cleaning, tuition) | None | Out of scope — pure listings + loan portal is already a full v1 |
| "No brokerage" as one of several messages | "No brokerage" as the single loudest message | You don't have the service bolt-ons diluting it, so it can be the whole brand, not one line in a long nav |
| Card-based listings, image-forward | Same — this pattern is genuinely good and worth keeping | Real estate is a visual product; NoBroker gets this right |

---

## 2. Design System — Unchanged From What's Approved

Still your orange (`#F4600F`) / white system from Steps 1–6: Fraunces display type, Inter body, IBM Plex Mono for every number, the rotated verified-stamp badge, pill-shaped buttons, soft warm shadows. Nothing here changes that — this step is about structure, not visual style.

---

## 3. Sitemap — Adapted From NoBroker's Real Nav

```
/                              Home
/search                        Buy — search & filter (your existing Step 6 page)
/mumbai/[locality]             SEO locality landing pages (not yet built)
/property/[id]                 Property detail (your existing Step 6 page)
/projects                      Builder projects listing (not yet built)
/projects/[id]                 Builder project detail, with unit types (not yet built)
/post-property                 Seller wizard (built)
/emi-calculator                Standalone EMI tool (not yet built as a page — logic exists conceptually from the prototype)
/loans/apply                   Loan application (not yet built — Phase 3)
/compare                       Side-by-side comparison, up to 4 (not yet built — Phase 2)
/login  /signup                Auth (built)
/dashboard/buyer               Favorites, saved searches, inquiries, loan status (not yet built)
/dashboard/seller              Listings + status (built)
/dashboard/builder             Projects, leads, construction updates (not yet built)
/admin                         Approval queue (built)
```

No city switcher, no Rent/Commercial toggle, no services mega-menu — the nav stays to: **Buy · Builder Projects · EMI Calculator · Post Property**. That's deliberately thinner than NoBroker's, which is the point — a focused nav is easier to make feel premium than a busy one.

---

## 4. Key Workflows

### Buyer flow (mirrors NoBroker's core loop, contact ungated for now)
```
Search/filter → Property Detail → Contact Owner (Call/WhatsApp — currently a free, unconditional action)
                                → Apply for Loan (EMI pre-filled from property price)
                                → Save to Favorites (requires login)
```
**Where the future gate would slot in:** wrap the "Contact Owner" click in a single function — e.g. `handleContactReveal(listingId)` — that currently just shows the phone number/WhatsApp link immediately. If you later decide to gate it, that one function becomes the place you check "has this buyer got contacts remaining" before revealing, rather than a scattered rewrite across the detail page. Worth writing it as its own function now even though the logic inside is trivial today.

### Seller flow (built, Steps 4–5)
```
Signup (role: Seller) → Post Property wizard → PENDING → Admin reviews doc → LIVE → appears in Search
```

### Builder flow (not yet built — next step)
```
Signup (role: Builder) → Submit company + RERA ID → Admin verifies → Create Project
  → Add multiple Unit types (1BHK/2BHK/3BHK, different pricing) within one project
  → Buyers browse Project Detail → inquire per unit type
  → Builder dashboard: leads, construction progress updates
```
This is structurally different from the Seller flow — one project has many units, whereas one Seller listing is one property. That one-to-many relationship is the main new modeling work in the next step.

### Admin flow (built, Step 5)
```
Pending queue → View signed ownership doc → Approve (→ LIVE) or Reject (→ REJECTED, with reason in audit log)
```

---

## 5. Full Target Folder Structure

This is the complete map for everything planned — not just what you've built so far — so you can see where each future piece slots in.

```
thikana-web/
  src/
    app/
      page.tsx                          Home
      search/
        page.tsx                        ✅ built
      mumbai/
        [locality]/
          page.tsx                      SEO locality pages
      property/
        [id]/
          page.tsx                      ✅ built
      projects/
        page.tsx                        Builder projects listing
        [id]/
          page.tsx                      Project detail
      post-property/
        page.tsx                        ✅ built
      emi-calculator/
        page.tsx                        Standalone calculator page
      loans/
        apply/
          page.tsx                      Loan application form
      compare/
        page.tsx                        Side-by-side comparison
      (auth)/
        login/page.tsx
        signup/
          page.tsx                      ✅ built
      dashboard/
        buyer/
          page.tsx                      Overview
          favorites/page.tsx
          saved-searches/page.tsx
          inquiries/page.tsx
          loans/page.tsx
        seller/
          page.tsx                      ✅ built
        builder/
          page.tsx                      Projects overview
          leads/page.tsx
          construction-updates/page.tsx
      admin/
        page.tsx                        ✅ built
    components/
      ui/                               Button, VerifiedStamp, Chip ✅ built
      layout/                           Navbar ✅ built, Footer, MobileFilterSheet
      property/                         PropertyCard ✅ built, Gallery, ComparisonTable
      project/                          ProjectCard, UnitTypeTable, ConstructionTimeline
      dashboard/                        StatCard, ListingTable, LeadTable
      loan/                             EmiSlider, AmortizationTable
    lib/
      api-client.ts                     ✅ built
      useSession.ts                     ✅ built
      useContactReveal.ts               the future gating hook described in §4
    styles/
      globals.css                       ✅ built (Tailwind v4 theme tokens)

thikana-api/
  src/
    server.ts  app.ts                   ✅ built
    config/
      db.ts                             ✅ built
      imagekit.ts                       ✅ built
    models/
      User.ts                           ✅ built
      Otp.ts                            ✅ built
      Listing.ts                        ✅ built
      Project.ts                        Builder projects (new)
      Unit.ts                           Unit types within a project (new)
      Favorite.ts                       Phase 2
      Inquiry.ts                        Phase 3 (chat/contact log)
      LoanApplication.ts                Phase 3
      AuditLog.ts                       ✅ built
    controllers/
      auth.controller.ts                ✅ built
      listing.controller.ts             ✅ built
      project.controller.ts             new — next step
      favorite.controller.ts            Phase 2
      loan.controller.ts                Phase 3
    routes/
      auth.routes.ts                    ✅ built
      listing.routes.ts                 ✅ built
      project.routes.ts                 new — next step
      favorite.routes.ts                Phase 2
      loan.routes.ts                    Phase 3
    middleware/
      auth.middleware.ts                ✅ built
      rbac.middleware.ts                ✅ built
      rateLimit.middleware.ts           ✅ built
      upload.middleware.ts              ✅ built
      error.middleware.ts               ✅ built
    validation/
      auth.validation.ts                ✅ built
      listing.validation.ts             ✅ built
      search.validation.ts              ✅ built
      project.validation.ts             new — next step
    utils/
      otp.ts  jwt.ts  imagekitUpload.ts  ✅ built
```

Everything marked ✅ is real, working code from Steps 1–6. Everything else is exactly where it'll land when you get to it — this doubles as your build order checklist.

---

## What's Next

Given the folder map above, the next concrete step is the **Builder Portal** — `Project` and `Unit` models, the RERA verification field on builder signup, and the one-to-many project→units relationship, which is genuinely new modeling territory versus everything you've built so far.

Say the word when you're ready for it.
