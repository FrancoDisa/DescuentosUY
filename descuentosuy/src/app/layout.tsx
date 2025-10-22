import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "DescuentosUY";
const siteTagline = "Mapa colaborativo para encontrar descuentos en Montevideo";
const siteUrl = "https://descuentosuy.vercel.app";
const siteDescription =
  "Descubre y compara las mejores promociones activas en Montevideo con información actualizada de locales, sucursales y horarios.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteTitle} | Descuentos en Montevideo`,
    template: `%s | ${siteTitle}`,
  },
  description: `${siteTagline}. ${siteDescription}`,
  keywords: [
    "descuentos",
    "Montevideo",
    "Uruguay",
    "promociones",
    "DescuentosUY",
  ],
  openGraph: {
    title: `${siteTitle} | Descuentos en Montevideo`,
    description: `${siteTagline}. ${siteDescription}`,
    url: siteUrl,
    siteName: siteTitle,
    locale: "es_UY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteTitle} | Descuentos en Montevideo`,
    description: `${siteTagline}. ${siteDescription}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
