import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/landing/CookieBanner";

export const metadata: Metadata = {
  title: "Concesionario",
  description: "Vehículos y financiación",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="es">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
