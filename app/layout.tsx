import type { Metadata } from "next";
import { Cinzel, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-var",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lvlone.app"),
  title: {
    default: "LVL ONE — D&D 5e en español, sin manuales",
    template: "%s | LVL ONE",
  },
  description:
    "Crea personajes D&D 5e, aprende las reglas y juega con tu grupo — todo en español, diseñado para principiantes. Sin manuales de 600 páginas.",
  keywords: ["D&D 5e español", "Dungeons and Dragons", "principiantes", "crear personaje", "character creator", "D&D en español"],
  authors: [{ name: "ZIVELO" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://lvlone.app",
    siteName: "LVL ONE",
    title: "LVL ONE — D&D 5e en español, sin manuales",
    description:
      "Crea personajes D&D 5e, aprende las reglas y juega con tu grupo — todo en español, sin manuales de 600 páginas.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LVL ONE — D&D 5e en español",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LVL ONE — D&D 5e en español, sin manuales",
    description:
      "Crea personajes D&D 5e, aprende las reglas y juega con tu grupo — todo en español.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
