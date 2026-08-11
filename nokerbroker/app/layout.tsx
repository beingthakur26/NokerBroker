import type { Metadata, Viewport } from "next";
import { Fraunces, Sora, IBM_Plex_Mono } from "next/font/google";
import "./global.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toast";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plexmono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "NokerBroker — Real estate without brokers",
    template: "%s · NokerBroker",
  },
  description:
    "Mumbai's zero-brokerage marketplace. Search verified flats and new projects, and message owners or builders directly on WhatsApp. No broker fee, ever.",
  applicationName: "NokerBroker",
  keywords: [
    "NokerBroker",
    "buy flat Mumbai",
    "no brokerage",
    "direct owner",
    "RERA verified projects",
  ],
  openGraph: {
    title: "NokerBroker — Real estate without brokers",
    description:
      "Search verified flats and new projects, and message owners or builders directly on WhatsApp. No broker fee, ever.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4600f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sora.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
