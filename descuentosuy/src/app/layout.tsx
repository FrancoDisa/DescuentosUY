import type { Metadata } from "next";
import { Inter, Poppins, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
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
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${geistMono.variable} antialiased font-sans text-foreground`}
      >
        <div className="min-h-screen flex flex-col bg-background">
          <SiteHeader />
          <main className="flex-1 pt-20">{children}</main>
          <SiteFooter />
        </div>
        <Toaster richColors />
      </body>
    </html>
  );
}
