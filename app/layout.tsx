import type { Metadata } from "next";
import Script from "next/script";
import { CreditAssistantWidget } from "@/components/landing/CreditAssistantWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plan Nacional Tu 0km | Consulta de acceso a tu 0km en cuotas",
  description:
    "Dejá tus datos una sola vez y un asesor oficial te contacta con opciones de concesionarios autorizados para acceder a tu 0km en cuotas, según tu perfil.",
  metadataBase: new URL("https://www.plannacionaltu0km.online"),
  alternates: { canonical: "https://www.plannacionaltu0km.online" },
  openGraph: {
    title: "Plan Nacional Tu 0km",
    description:
      "Consulta sin costo para evaluar acceso a planes de 0km en cuotas con concesionarios oficiales.",
    url: "https://www.plannacionaltu0km.online",
    siteName: "Plan Nacional Tu 0km",
    type: "website",
    images: [{ url: "/hero-0km.png", width: 1200, height: 630, alt: "Planes de 0km en cuotas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan Nacional Tu 0km",
    description:
      "Consulta sin costo para evaluar acceso a planes de 0km en cuotas con concesionarios oficiales.",
    images: ["/hero-0km.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html lang="es">
      <head>
        <Script
          id="gtag-src"
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17876395056"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'AW-17876395056');
          `}
        </Script>

        {clarityId ? (
          <Script id="clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        ) : null}
      </head>
      <body>
        {children}
        <CreditAssistantWidget />
      </body>
    </html>
  );
}
