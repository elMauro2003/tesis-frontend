import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "../styles/globals.css";
import { AppProviders } from "@/providers/AppProviders";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UCLV Residencias",
  description: "Portal Inteligente de Gestión Académica y Residencial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-body selection:bg-primary-fixed selection:text-primary">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
