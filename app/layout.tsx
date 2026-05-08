import "./globals.css";
import type { Metadata } from "next";
import FloatingActions from "@/components/landing/FloatingActions";

export const metadata: Metadata = {
  title: {
    default: "GoMotorsCo | Autos, Motos y Financiación",
    template: "%s | GoMotorsCo",
  },
  description:
    "Compra autos, motos y ciclomotores en Bogotá con financiación. Evaluación rápida y asesoría personalizada en GoMotorsCo.",
  keywords: [
    "autos Bogotá",
    "motos Colombia",
    "financiación vehículos",
    "comprar carro Bogotá",
  ],
  openGraph: {
    title: "GoMotorsCo",
    description:
      "Autos, motos y financiación con asesoría personalizada.",
    url: "https://gomotorsco.com.co",
    siteName: "GoMotorsCo",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <FloatingActions whatsappUrl="https://wa.me/115151515" />
      </body>
    </html>
  );
}
