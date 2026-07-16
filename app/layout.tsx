import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const base = new URL(host ? `${protocol}://${host}` : "http://localhost:3000");
  const socialImage = new URL("/og.png", base).toString();
  return {
    metadataBase: base,
    title: "NESM 2026 Badminton Draw",
    description: "Official knockout draw ledger for the NESM 2026 Badminton Championship.",
    openGraph: {
      title: "NESM 2026 Badminton Championship",
      description: "Official Knockout Draw Ledger · Seven championship categories",
      type: "website",
      images: [{ url: socialImage, width: 1734, height: 907, alt: "NESM 2026 Official Knockout Draw Ledger" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "NESM 2026 Badminton Championship",
      description: "Official Knockout Draw Ledger",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
