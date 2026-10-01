import type { Metadata } from "next";
import { Geist, Outfit } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Notify",
  description: "One calm place for coursework, notes, and due dates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${outfit.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
