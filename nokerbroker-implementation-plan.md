# NokerBroker — Mumbai Real Estate Marketplace
## Full Product & Engineering Implementation Plan

This plan takes your PRD + your prototype's visual language and turns them into a NoBroker-style product, but re-architected around your actual requirement: **one account, no role checklist at signup, capability unlocked by what the user does.**

---

## 1. The Core Design Decision: Capability-Based, Not Role-Based

NoBroker technically also does this (you don't pick "buyer/seller/builder" at signup) — the fix is to stop thinking of Buyer/Seller/Builder as **account types** and start thinking of them as **things an account can do**.

| Old model (PRD v1) | New model (this plan) |
|---|---|
| Pick role at signup: Buyer / Seller / Builder | Sign up once as a **User**. No role picker. |
| Builder is a separate account type from day 1 | "List a New Project" is an action any user can start. First time they do it, they hit a one-time **Builder Verification** step (RERA number + company docs) — in context, not at signup. |
| Buyer dashboard, Seller dashboard, Builder dashboard are 3 separate surfaces | One **"My Space"** dashboard with sections that light up based on activity: My Listings, My Projects, Favorites, Inquiries, and Loan Applications. A user who's never sold anything just doesn't see "My Listings" populated — but the tab is always there, one click away. |
| Admin verifies "Builder accounts" | RERA number and company documents are captured once, then an administrator explicitly approves or denies the builder profile. A user can be a normal buyer and have projects live using the same account after approval. |

This is exactly how NoBroker, Housing.com and MagicBricks actually work under the hood, and it matches what you described almost word-for-word ("no buyer/seller/builder checklist... you can login as user and on platform you can buy any property or list your property or list a new project").

### Verification, not roles, is what protects trust
Instead of gating by role, gate by **action**:
- Listing a resale flat → requires ownership doc upload (already in your PRD), then goes **live immediately** — no admin approval queue. Admin can still flag/pull a listing after the fact if it's reported or looks fraudulent, but publishing isn't blocked on a human.
- Listing a new project → requires RERA number + builder company documents. An administrator must approve the builder profile before the first project can go live; returning approved builders reuse the profile.
- Applying for a loan → requires PAN + basic KYC fields, not a role.
- Everything else (browsing, EMI calculator, favoriting, inquiring) → open to any logged-in user, EMI calculator open to guests too (per your PRD).

---

## 2. Feature Additions on Top of Your PRD

Your PRD covers the NoBroker basics well. Here's what's missing that NoBroker (or any serious v2) would have — I'd fold these into the phases below rather than v1 day one:

1. **Booking / Token Amount flow** — deliberately deferred from v1. Do not collect token payments or offer booking until a later release with the required payment, cancellation, and legal workflows.
2. **Compare properties** (up to 3–4) — in your PRD's buyer experience, worth building early since it's cheap once you have the property data model.
3. **Saved search + alerts** — "notify me when a 2BHK under 1.2Cr appears in Andheri West." Big retention driver for NoBroker-style platforms.
4. **Verified Trust Score / badge** — beyond just RERA-verified builders: verified WhatsApp number, verified ownership doc, response rate — shown as small trust signals on listing cards (your prototype already has a `.stamp` verified-seal component — reuse it here).
5. **Boost / Featured Listing** — answers your PRD's open question #2 (monetization). Individual sellers pay to boost a listing for 7 days; builders get a subscription tier for featured project placement. This is your primary revenue lever alongside loan lead-gen.
6. **WhatsApp click-to-chat** — your prototype already has a `--whatsapp` color token, so build this in from Phase 1 — it's the #1 contact method Indian users expect over in-app chat.
7. **Locality landing pages** (`/localities/andheri-west`) — SEO-critical, and your prototype's locality tiles already point at this.
8. **Fraud guardrails** — WhatsApp OTP mandatory before *any* listing goes live (not just loan applications), duplicate-image detection flag for admin, rate-limit on listing creation per new account.
9. **Admin access provisioning** — an administrator can promote or revoke an existing account through a protected admin-users screen or a MongoDB-backed CLI command. This is an internal capability only: public sign-up must never offer an admin role.

---

## 3. Information Architecture / Route Map

```
PUBLIC (guest-accessible)
  /                              Home
  /buy                           Search results (resale + ready listings, filterable)
  /buy/[propertySlug]            Property detail
  /projects                      New project listings (builder projects, browsable)
  /projects/[projectSlug]        Project detail (units, construction gallery, floor plans)
  /localities/[localitySlug]     Locality landing page (SEO)
  /emi-calculator                EMI calculator (usable without login)
  /login
  /signup
  /forgot-password
  /verify-otp

AUTHENTICATED (any logged-in user — no role gate)
  /list-property                 Wizard: list a resale property
  /list-project                  Wizard: list a builder project (triggers verification if first time)
  /compare                       Side-by-side compare (?ids=a,b,c)
  /loans/apply                   Loan application flow
  /loans/apply/[step]
  /loans/eligibility              Quick eligibility checker

  /dashboard                     "My Space" — overview
  /dashboard/listings            My resale listings (create/edit/pause/delete, analytics)
  /dashboard/listings/[id]/edit
  /dashboard/listings/[id]/analytics
  /dashboard/projects            My builder projects (only populated if verified)
  /dashboard/projects/[id]/units
  /dashboard/projects/[id]/updates       construction progress gallery uploads
  /dashboard/favorites
  /dashboard/inquiries                   received (on my listings/projects)
  /dashboard/inquiries/sent              sent (my enquiries to others)
  /dashboard/loans                       my loan applications + status tracker
  /dashboard/saved-searches
  /dashboard/notifications
  /dashboard/profile
  /dashboard/verification                one-time builder RERA/company verification

INTERNAL
  /admin
  /admin/listings                moderate resale listings (flag/remove post-publish, no pre-approval)
  /admin/projects                moderate projects (flag/remove post-publish, no pre-approval)
  /admin/builders                RERA/company profiles (post-publish moderation only, not a verification queue)
  /admin/users
  /admin/loans                   lead routing to partner banks/NBFCs
  /admin/moderation              flagged content/images
  /admin/analytics
```

---

## 4. Navbar Spec (matches your description exactly)

**Logged out:** `Logo | Buy · New Projects · Sell · Loans | [Login] [Sign up]`

**Logged in:** `Logo | Buy · New Projects · Sell · Loans | 🔔 notifications · ♥ favorites · [Avatar ▾ "Priya"]`

Avatar dropdown menu:
```
My Space (dashboard overview)
My Listings
My Projects              (hidden or shown as "+ List a Project" if not yet verified)
Bookings
Loan Applications
Saved Searches
Settings
Log out
```

"Sell" in the top nav and "+ List a Project" both go through the same entry point pattern: clicking either just opens the relevant wizard for a logged-in user, or `/login?next=/list-property` for a guest. No role selection screen ever appears.

---

## 5. Data Model (Mongoose schemas — MongoDB)

Login identity is now **email or WhatsApp number**, and OTP is delivered over WhatsApp (not SMS) — reflected in `User.whatsappNumber` / `whatsappVerified` below.

```ts
// models/User.ts
import { Schema, model, models, Types } from "mongoose";

const UserSchema = new Schema({
  name:              { type: String, required: true },
  email:             { type: String, required: true, unique: true },
  whatsappNumber:    { type: String, required: true, unique: true }, // e.g. +919820012345 — login + OTP channel
  passwordHash:      { type: String },
  whatsappVerified:  { type: Boolean, default: false },
  emailVerified:     { type: Boolean, default: false },
  avatarUrl:         { type: String },
  city:              { type: String },
  locality:          { type: String },
  role:              { type: String, enum: ["USER", "ADMIN"], default: "USER" },
}, { timestamps: true });

export default models.User || model("User", UserSchema);
```

```ts
// models/BuilderProfile.ts
// One-time verification, tied to the user but representing a legal entity —
// this is what unlocks "list a project", not a role on the User document.
const BuilderProfileSchema = new Schema({
  userId:        { type: Types.ObjectId, ref: "User", required: true, unique: true },
  companyName:   { type: String, required: true },
  reraNumber:    { type: String, required: true, unique: true },
  status:        { type: String, enum: ["VERIFIED", "FLAGGED", "REJECTED"], default: "VERIFIED" },
    // set to VERIFIED on submit if RERA format check passes; FLAGGED only via post-publish moderation
  documentUrls:  [{ type: String }],   // ImageKit URLs
  verifiedAt:    { type: Date },
}, { timestamps: true });
```

```ts
// models/Property.ts
const PropertyImageSchema = new Schema({
  url:   { type: String, required: true },  // ImageKit URL
  order: { type: Number, default: 0 },
}, { _id: false });

const PropertySchema = new Schema({
  ownerId:          { type: Types.ObjectId, ref: "User", required: true },
  type:             { type: String, enum: ["FLAT", "VILLA", "PLOT", "COMMERCIAL"], required: true },
  title:            { type: String, required: true },
  slug:             { type: String, required: true, unique: true },
  locality:         { type: String, required: true },
  pinCode:          { type: String, required: true },
  zone:             { type: String },   // e.g. Western Suburbs, South Mumbai
  price:            { type: Number, required: true },
  areaSqft:         { type: Number, required: true },
  bhk:              { type: Number },
  floor:            { type: String },
  furnishing:       { type: String, enum: ["UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"] },
  ageOfProperty:    { type: String },
  amenities:        [{ type: String }],
  images:           [PropertyImageSchema],
  videoUrl:         { type: String },
  ownershipDocUrl:  { type: String, required: true }, // ImageKit URL, never shown publicly
  status:           { type: String, enum: ["LIVE", "PAUSED", "REJECTED", "FLAGGED"], default: "LIVE" },
    // LIVE as soon as doc is uploaded — no pre-approval. FLAGGED/REJECTED only via post-publish moderation.
  viewCount:        { type: Number, default: 0 },
  boostedUntil:     { type: Date },
}, { timestamps: true });

PropertySchema.index({ locality: 1, price: 1, bhk: 1, type: 1 });
```

```ts
// models/Project.ts
const ProjectUnitSchema = new Schema({
  unitType:     { type: String, required: true },   // "1BHK" "2BHK" "3BHK"
  priceFrom:    { type: Number, required: true },
  priceTo:      { type: Number, required: true },
  areaSqft:     { type: Number, required: true },
  floorPlanUrl: { type: String },
}, { _id: true });

const ProjectUpdateSchema = new Schema({    // dated construction gallery
  month:     { type: Date, required: true },
  imageUrls: [{ type: String }],
  note:      { type: String },
}, { _id: true });

const ProjectSchema = new Schema({
  builderId:           { type: Types.ObjectId, ref: "User", required: true },
  name:                { type: String, required: true },
  slug:                { type: String, required: true, unique: true },
  locality:            { type: String, required: true },
  pinCode:             { type: String, required: true },
  constructionStatus:  { type: String, enum: ["PRE_LAUNCH", "UNDER_CONSTRUCTION", "READY_TO_MOVE"] },
  progressPct:         { type: Number, default: 0 },
  possessionDate:      { type: Date },
  brochureUrl:         { type: String },
  amenities:           [{ type: String }],
  status:              { type: String, enum: ["LIVE", "PAUSED", "REJECTED", "FLAGGED"], default: "LIVE" },
    // live immediately once builder profile is verified (format-check, not admin queue)
  units:               [ProjectUnitSchema],
  updates:             [ProjectUpdateSchema],
}, { timestamps: true });
```

```ts
// models/Favorite.ts
const FavoriteSchema = new Schema({
  userId:     { type: Types.ObjectId, ref: "User", required: true },
  propertyId: { type: Types.ObjectId, ref: "Property" },
  projectId:  { type: Types.ObjectId, ref: "Project" },
}, { timestamps: true });

FavoriteSchema.index({ userId: 1, propertyId: 1, projectId: 1 }, { unique: true });
```

```ts
// models/Inquiry.ts
const InquirySchema = new Schema({
  senderId:    { type: Types.ObjectId, ref: "User", required: true },
  propertyId:  { type: Types.ObjectId, ref: "Property" },
  projectId:   { type: Types.ObjectId, ref: "Project" },
  message:     { type: String, required: true },
  contactMode: { type: String, enum: ["CALL", "CHAT", "WHATSAPP", "BOTH"], default: "WHATSAPP" },
  status:      { type: String, enum: ["OPEN", "RESPONDED", "CLOSED"], default: "OPEN" },
}, { timestamps: true });
```

```ts
// models/LoanApplication.ts
const LoanApplicationSchema = new Schema({
  userId:         { type: Types.ObjectId, ref: "User", required: true },
  propertyId:     { type: Types.ObjectId, ref: "Property" },
  loanAmount:     { type: Number, required: true },
  tenureYears:    { type: Number, required: true },
  interestRate:   { type: Number, required: true },
  monthlyIncome:  { type: Number, required: true },
  employmentType: { type: String, required: true },
  existingLoans:  { type: Number, default: 0 },
  panNumber:      { type: String, required: true },
  documents:      [{ type: String }],  // ImageKit URLs
  status: {
    type: String,
    enum: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED"],
    default: "SUBMITTED",
  },
}, { timestamps: true });
```

```ts
// models/SavedSearch.ts
const SavedSearchSchema = new Schema({
  userId:   { type: Types.ObjectId, ref: "User", required: true },
  filters:  { type: Schema.Types.Mixed, required: true }, // { locality, budgetMin, budgetMax, bhk, type }
  alertsOn: { type: Boolean, default: true },
}, { timestamps: true });
```

```ts
// models/Notification.ts
const NotificationSchema = new Schema({
  userId:  { type: Types.ObjectId, ref: "User", required: true },
  type:    { type: String, enum: ["LISTING_LIVE", "NEW_INQUIRY", "LOAN_STATUS", "SAVED_SEARCH_MATCH", "BOOKING_UPDATE"] },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });
```

---

## 6. Tech Stack

Chosen for one thing: **you can build and ship this solo/small-team without juggling 4 languages.**

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Full-stack in one codebase — pages + API routes together, great for this |
| Styling | **Tailwind CSS** + your prototype's color tokens as a custom theme | Fast to build, matches your prototype's design system directly |
| UI components | **shadcn/ui** | Unstyled primitives you skin with your colors — avoids the "generic template" look |
| DB / ODM | **MongoDB + Mongoose** | Schema above maps directly; use **MongoDB Atlas** for hosted DB |
| Auth | **Auth.js (NextAuth)** — Credentials (email/pass) + custom WhatsApp-OTP provider + Google | Login by email or WhatsApp number, OTP delivered on WhatsApp |
| OTP delivery | **MSG91 WhatsApp API** (or Meta WhatsApp Cloud API/Gupshup) | OTP sent as a WhatsApp message, not SMS |
| Image/file storage | **ImageKit** (real-time image optimization/transformation + CDN) | Matches your PRD's image + auto-compression requirement |
| Email | **Resend** | |
| Maps | **Mapbox** (or Google Maps if budget allows) | For locality/map search |
| Charts | **Recharts** | EMI amortization graph |
| State/data fetching | **TanStack Query** + React Server Components where possible | |
| Deployment | **Vercel** (app) + **MongoDB Atlas** (DB) | Zero-ops to start |

---

## 7. Folder Structure

```
nokerbroker/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                        # Home
│   │   ├── buy/
│   │   │   ├── page.tsx                    # Search results
│   │   │   └── [propertySlug]/page.tsx     # Property detail
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [projectSlug]/page.tsx
│   │   ├── localities/[localitySlug]/page.tsx
│   │   ├── emi-calculator/page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── verify-otp/page.tsx
│   │
│   ├── (authenticated)/
│   │   ├── list-property/
│   │   │   ├── page.tsx
│   │   │   └── steps/[step]/page.tsx       # multi-step wizard
│   │   ├── list-project/
│   │   │   └── steps/[step]/page.tsx
│   │   ├── compare/page.tsx
│   │   ├── loans/
│   │   │   ├── apply/[step]/page.tsx
│   │   │   └── eligibility/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx                  # "My Space" shell + sidebar
│   │       ├── page.tsx                    # overview
│   │       ├── listings/
│   │       │   ├── page.tsx
│   │       │   └── [id]/edit/page.tsx
│   │       ├── projects/
│   │       │   ├── page.tsx
│   │       │   └── [id]/units/page.tsx
│   │       │   └── [id]/updates/page.tsx
│   │       ├── favorites/page.tsx
│   │       ├── inquiries/
│   │       │   ├── page.tsx                # received
│   │       │   └── sent/page.tsx
│   │       ├── bookings/page.tsx
│   │       ├── loans/page.tsx
│   │       ├── saved-searches/page.tsx
│   │       ├── notifications/page.tsx
│   │       ├── profile/page.tsx
│   │       └── verification/page.tsx       # builder RERA verification
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── listings/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── builders/page.tsx
│   │   ├── users/page.tsx
│   │   ├── loans/page.tsx
│   │   └── analytics/page.tsx
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── otp/send/route.ts                # sends OTP via WhatsApp
│   │   ├── otp/verify/route.ts
│   │   ├── properties/route.ts
│   │   ├── properties/[id]/route.ts
│   │   ├── projects/route.ts
│   │   ├── projects/[id]/units/route.ts
│   │   ├── inquiries/route.ts
│   │   ├── favorites/route.ts
│   │   ├── bookings/route.ts
│   │   ├── loans/route.ts
│   │   ├── upload/route.ts                 # ImageKit signed upload
│   │   └── admin/**                        # admin-only, guarded
│   │
│   ├── layout.tsx                          # root layout, fonts, navbar/footer
│   └── globals.css                         # Tailwind + your color tokens
│
├── components/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── property-card.tsx
│   ├── project-card.tsx
│   ├── search-bar.tsx
│   ├── filters-panel.tsx
│   ├── emi-calculator-widget.tsx
│   ├── verified-stamp.tsx
│   ├── booking-status-tracker.tsx
│   └── ui/                                 # shadcn primitives
│
├── lib/
│   ├── mongodb.ts                          # cached Mongoose connection
│   ├── auth.ts
│   ├── imagekit.ts
│   ├── razorpay.ts
│   ├── whatsapp-otp.ts                     # MSG91 WhatsApp OTP send/verify
│   ├── emi.ts                              # EMI math, reusable server+client
│   └── validation/                         # zod schemas per form
│
├── models/                                 # Mongoose schemas (section 5)
│   ├── User.ts
│   ├── BuilderProfile.ts
│   ├── Property.ts
│   ├── Project.ts
│   ├── Favorite.ts
│   ├── Inquiry.ts
│   ├── Booking.ts
│   ├── LoanApplication.ts
│   ├── SavedSearch.ts
│   └── Notification.ts
├── scripts/
│   └── seed.ts
│
├── public/
├── styles/
│   └── theme.css                           # :root tokens lifted from your prototype
├── .env.example
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 8. Step-by-Step Build Commands

### Phase 0 — Project scaffold

```bash
# 1. Create the app
npx create-next-app@latest nokerbroker --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
cd nokerbroker

# 2. Core dependencies
npm install mongoose next-auth@beta zod \
  @tanstack/react-query recharts imagekit imagekitio-next razorpay resend axios

# 3. shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input select dialog dropdown-menu avatar \
  card tabs badge slider table toast

# 4. MongoDB Atlas
# create a free cluster at https://www.mongodb.com/cloud/atlas, grab the connection string,
# put it in MONGODB_URI in .env — no migration step, Mongoose schemas are applied at runtime.
mkdir -p models scripts

# 5. Git
git init && git add -A && git commit -m "chore: project scaffold"
```

### Phase 0 — Theme tokens (copy straight from your prototype)

Create `styles/theme.css`:
```css
:root{
  --bg:#FFFFFF; --bg-warm:#FFF8F3; --bg-deep:#FFEFE3;
  --ink:#241A14; --ink-soft:#7A6A5F; --ink-faint:#B4A398;
  --orange:#F4600F; --orange-deep:#C94A0A; --orange-pale:#FFE3D1; --orange-glow:#FF8A4C;
  --verified:#0F6E5C; --verified-bg:#E6F3EF;
  --whatsapp:#25D366;
  --border:#F0E1D3;
  --radius:20px; --radius-sm:12px;
}
```
Then map these into `tailwind.config.ts` under `theme.extend.colors` so you can use `bg-orange`, `text-ink-soft`, etc. as Tailwind utility classes — same palette, no design drift from your prototype. (If you want a different accent than orange, this is the only file you touch — everything else references the token names, not hex values.)

### Phase 0 — Environment variables

`.env.example`:
```
MONGODB_URI=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MSG91_AUTH_KEY=                   # WhatsApp OTP send/verify
MSG91_WHATSAPP_TEMPLATE_ID=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RESEND_API_KEY=
MAPBOX_TOKEN=
```

---

## 9. Phased Roadmap

**Phase 1 — Foundation (2–3 weeks)**
Auth (email/password + WhatsApp-number OTP + Google), navbar/footer shell, Home page, `/buy` search + filters, property detail page, seeded demo data. EMI calculator (guest-usable, standalone). No listing creation yet.

**Phase 2 — Selling (2 weeks)**
`/list-property` wizard (type → location → price/area/BHK → images via ImageKit → amenities → ownership doc upload) → **live immediately** on submit, no approval queue. Admin panel: post-publish moderation only (flag/remove on report or suspicion). Dashboard: My Listings (edit/pause/delete, view/inquiry counts).

**Phase 3 — Builder projects (2–3 weeks)**
`/dashboard/verification` collects RERA and company documents. An administrator reviews the submission and must approve it before the account can publish a new-construction project. `/list-project` wizard, units, construction-update gallery, and public `/projects` + `/projects/[slug]`. Booking and token payments are deferred beyond v1.

**Phase 4 — Loans (1–2 weeks)**
`/loans/apply` multi-step form pre-filled from EMI calculator or property price, document upload, `/dashboard/loans` status tracker (Submitted → Under Review → Approved/Rejected → Disbursed). Admin: lead routing to partner banks/NBFCs.

**Phase 5 — Engagement (1–2 weeks)**
Favorites, Compare (up to 4), Inquiries (sent + received) with WhatsApp/call CTAs, Saved Searches + email/SMS alerts, Notifications center.

**Phase 6 — Discovery polish (2 weeks)**
Locality landing pages, Mapbox map search, "similar properties" recommendations, verified trust-score badges on cards.

**Phase 7 — Monetization + hardening (1–2 weeks)**
Boosted/featured listings (payment), builder subscription tiers, admin analytics dashboard, rate-limiting on listing creation, image dedup flagging, load testing, 99.5% uptime checks per your NFRs.

### Admin-access operations (available from Phase 1)

Admins are ordinary user accounts with a `role: "ADMIN"` field in MongoDB; this is deliberately separate from buyer/seller/builder capabilities. To avoid exposing privilege escalation in the public product, create an account normally and then use either of these internal-only paths:

```bash
# In the app directory, with MONGODB_URI set in .env.local
npm run admin:grant -- person@example.com
npm run admin:revoke -- person@example.com
```

The command updates the existing user document directly in MongoDB. The user must sign out and sign back in for their session to pick up the new role. A guarded `/admin/users` screen can provide the same promote/revoke action for an existing administrator. `ADMIN_EMAILS` may be used only as a tightly controlled bootstrap allowlist for the very first admin.

---

## 11. Deferred monetization release (post-v1)

**Do not build this in the current version.** Featured/boosted listing payments and builder subscriptions are deferred until the marketplace has stable moderation, support, and payment policies.

When authorized for a later release, implement the work in this order:

1. Add `Payment`, `ListingBoost`, and `BuilderSubscription` models with immutable provider payment IDs, webhook events, invoice references, expiry dates, and audit fields.
2. Integrate a payment provider using server-created orders and verified webhooks; never activate a boost or subscription from a client callback.
3. Define cancellation, refund, tax/GST, invoice, chargeback, and support workflows before exposing checkout.
4. Add seven-day individual listing boosts with transparent placement labels, expiry notifications, and admin reversal controls.
5. Add builder subscription tiers only after quotas, project limits, renewal policy, and failed-payment handling are approved.

The default v1 remains free owner listings, admin-verified builder projects, and loan-lead routing.

---

## 10. Notes on Your Open Questions (from the PRD)

- **In-house vs third-party loan routing:** build the `LoanApplication` model so it's routing-agnostic — Phase 4 ships with "routed to internal loan team" (simplest), Phase 7+ swaps in real bank/NBFC API integration without a schema change.
- **Builder monetization — paid subscription vs free+lead-fee:** the `BuilderProfile` + `Project.boostedUntil` fields support both: free listing, paid boost, or a subscription tier gate on how many active projects a builder can have live — pick later, schema doesn't need to change.
- **Seller fraud prevention:** ownership-doc upload + WhatsApp OTP + (Phase 7) image-dedup flag is the practical v1 answer; full ownership-registry verification is out of scope like your PRD already says.
- **Commission vs listing/lead-fee model:** given the "zero brokerage" positioning your prototype already leans into, lead-fee (loans) + boost/subscription (listings) is the more consistent model — a transaction commission cuts against the "zero brokerage" trust pitch.
