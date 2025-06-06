import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Drizzle Encryption Demo",
  description:
    "A complete example demonstrating how to implement automatic field-level encryption and decryption with Drizzle ORM using AES-256-GCM encryption.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Drizzle Encryption Demo",
    description:
      "A complete example demonstrating how to implement automatic field-level encryption and decryption with Drizzle ORM using AES-256-GCM encryption.",
    url: "https://drizzle-encryption-demo.vercel.app",
    siteName: "Drizzle Encryption Demo",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Drizzle Encryption Demo - Automatic field-level encryption with Drizzle ORM",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drizzle Encryption Demo",
    description:
      "A complete example demonstrating how to implement automatic field-level encryption and decryption with Drizzle ORM using AES-256-GCM encryption.",
    images: ["/og.png"],
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
