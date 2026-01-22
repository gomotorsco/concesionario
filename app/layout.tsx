import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL = "https://www.plannacionaltu0km.online";
const ADS_ID = "AW-17876395056";

// Opcional (Microsoft Clarity)
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "";

export const metadata: Metadata = {
  title: "Plan Nacional Tu 0km | Consulta de acceso a tu 0km en cuotas",
  description:
    "Dejá tus datos una sola vez y un asesor oficial te contacta con opciones de concesionarios autorizados para acceder a tu 0km en cuotas, según tu perfil.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Plan Nacional Tu 0km",
    description:
      "Consulta sin costo para evaluar acceso a planes de 0km en cuotas con concesionarios oficiales.",
    url: SITE_URL,
    siteName: "Plan Nacional Tu 0km",
    type: "website",
    images: [
      {
        url: "/hero-0km.png",
        width: 1200,
        height: 630,
        alt: "Planes de 0km en cuotas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan Nacional Tu 0km",
    description:
      "Consulta sin costo para evaluar acceso a planes de 0km en cuotas con concesionarios oficiales.",
    images: ["/hero-0km.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Google tag (gtag.js) - Google Ads */}
        <Script
          id="gtag-src"
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;

            gtag('js', new Date());
            gtag('config', '${ADS_ID}');

            // Page view automático (Google + tracking interno)
            (function () {
              try {
                var page_location = window.location.href;
                var page_path = window.location.pathname + window.location.search;
                var page_title = document.title || "Landing";

                // Google event page_view (útil para consistencia)
                if (typeof window.gtag === "function") {
                  window.gtag("event", "page_view", {
                    page_location: page_location,
                    page_path: page_path,
                    page_title: page_title,
                    origin: "landing",
                  });
                }

                // Tracking interno: /api/events
                // Usa sendBeacon si está disponible (más confiable al navegar)
                var payload = JSON.stringify({
                  type: "page_view",
                  origin: "landing",
                  meta: {
                    page_location: page_location,
                    page_path: page_path,
                    page_title: page_title,
                    referrer: document.referrer || null,
                    ua: navigator.userAgent || null,
                    lang: navigator.language || null,
                  },
                });

                if (navigator.sendBeacon) {
                  var blob = new Blob([payload], { type: "application/json" });
                  navigator.sendBeacon("/api/events", blob);
                } else {
                  fetch("/api/events", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: payload,
                    keepalive: true,
                  }).catch(function () {});
                }
              } catch (e) {}
            })();
          `}
        </Script>

        {/* Microsoft Clarity (opcional) */}
        {CLARITY_ID ? (
          <Script id="clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `}
          </Script>
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
