# NokerBroker

NokerBroker is a Mumbai-focused, zero-brokerage real-estate marketplace. Buyers can search active owner listings and verified builder projects, save favourites, send direct enquiries, estimate EMIs, and apply for a home loan. Owners publish their own properties; builders must pass an admin-reviewed verification before projects can go live.

## Product workflow

1. A visitor searches active properties by locality, budget, BHK, and sort order.
2. A buyer signs in with WhatsApp OTP, email/password (for existing accounts), or Google, then saves listings and sends enquiries directly to the owner or builder.
3. A property owner verifies WhatsApp, uploads ownership evidence, and publishes a property. Listings are public only while `ACTIVE`.
4. A builder submits a company name, MahaRERA number, and supporting documents. An administrator reviews the application in **Admin → Builder reviews**. Only verified builders can publish projects.
5. New listings create in-app alerts for matching saved searches. Loan and builder-review updates also create in-app notifications.

## Technology

- **Framework:** Next.js 16, React 19, TypeScript
- **Database:** MongoDB Atlas with Mongoose
- **Authentication:** Auth.js / NextAuth, WhatsApp OTP through MSG91, optional Google OAuth
- **Media:** ImageKit
- **UI:** Tailwind CSS, Base UI, Lucide, Recharts
- **Validation:** Zod

## Repository structure

```text
app/            Pages, layouts, and HTTP route handlers
components/     Reusable UI and client-side workflow controls
lib/            Authentication, database, validation, rate limits, serializers, helpers
models/         Mongoose models
hooks/          Reusable client hooks
scripts/        Seed data and admin/database maintenance scripts
styles/         Shared design tokens
```

## Local setup

1. Install Node.js 20+ and create a MongoDB Atlas database.
2. Copy the required values into `.env.local` (do not commit this file).
3. Install dependencies: `npm install`.
4. Start development: `npm run dev`.
5. Verify before deployment: `npm run lint` and `npm run build`.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `AUTH_SECRET` | Auth.js signing secret |
| `AUTH_URL` | Canonical application URL |
| `MSG91_AUTH_KEY` | MSG91 API key |
| `MSG91_WHATSAPP_TEMPLATE_ID` | Approved MSG91 WhatsApp OTP template |
| `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` | ImageKit credentials |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google login |
| `ADMIN_EMAILS` | Comma-separated bootstrap admin emails |

## Operations

- Promote an existing user: `npm run admin:grant -- person@example.com`
- Revoke an administrator: `npm run admin:revoke -- person@example.com`
- Repair the legacy Google-account WhatsApp index: `npm run db:fix-user-indexes`
- Seed development data: inspect `scripts/seed.ts` first, then run it only against a non-production database.

## Security and deployment notes

- Public queries only return `ACTIVE` properties and `LIVE` projects.
- Builder verification is deliberately manual: an administrator approves or denies each submission.
- OTP and listing-creation limits are in-process protections. Production multi-instance deployments should replace them with a shared rate-limit store such as Redis/Upstash.
- Add the deployment runtime IP to MongoDB Atlas Network Access. Do not use an unrestricted Atlas network rule in production.
- No payment provider, live MahaRERA registry integration, map search, or outbound email/WhatsApp saved-search delivery is configured yet; these require provider accounts and product decisions.

---

## Legacy bootstrap notes

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

The project uses local CSS design tokens and does not depend on build-time Google Font downloads.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
## Admin access

Promote an existing account through MongoDB without opening the database manually:

```bash
npm run admin:grant -- person@example.com
```

The user must sign out and sign back in, then can open `/admin`. To remove access:

```bash
npm run admin:revoke -- person@example.com
```

`ADMIN_EMAILS` in `.env.local` remains an optional bootstrap allowlist for the first administrator. Keep it limited to trusted emails.

## Google sign-in repair

If Google sign-in reports `E11000 ... whatsappNumber ... null`, run this once after pulling the project update:

```bash
npm run db:fix-user-indexes
```

It replaces the legacy index with a unique sparse index, allowing Google users to add their WhatsApp number later in Profile.

If Atlas reports that it cannot connect to any servers, open **MongoDB Atlas → Network Access** and add the current computer's public IP address, then confirm the cluster is running. For development only, `0.0.0.0/0` can be used temporarily; do not leave that rule enabled in production.
