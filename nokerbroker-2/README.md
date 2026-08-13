This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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
