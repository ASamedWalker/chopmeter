import type { Metadata, Viewport } from "next";
import Script from "next/script";
import InstallPrompt from "@/components/InstallPrompt";
import UpdatePrompt from "@/components/UpdatePrompt";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const siteUrl = "https://chopmeter.me";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ChopMeter - Track Your Prepaid Electricity Usage in Ghana",
    template: "%s | ChopMeter",
  },
  description:
    "Free app to track prepaid electricity meter readings, monitor daily energy usage, and manage your spending. Works offline. Built for Ghana, Nigeria, and Africa.",
  keywords: [
    "prepaid electricity tracker",
    "meter reading app",
    "electricity usage Ghana",
    "ECG prepaid meter",
    "energy savings Ghana",
    "utility tariff Ghana",
    "electricity bill tracker",
    "prepaid meter app",
    "energy monitoring Africa",
    "electricity cost calculator",
    "Ghana power consumption",
    "PURC tariff",
    "electricity budget",
    "smart meter tracker",
  ],
  authors: [{ name: "ChopMeter" }],
  creator: "ChopMeter",
  publisher: "ChopMeter",
  applicationName: "ChopMeter",
  category: "utilities",
  classification: "Energy & Utilities",
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: siteUrl,
    siteName: "ChopMeter",
    title: "ChopMeter - Track Your Prepaid Electricity Usage",
    description:
      "Stop guessing where your electricity goes. Scan your prepaid meter, track daily usage, and save money on energy. Free, offline, no signup.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChopMeter - Prepaid Electricity Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChopMeter - Track Your Prepaid Electricity",
    description:
      "Free app to scan your prepaid meter, track energy usage, and manage electricity spending. Built for Ghana & Africa.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ChopMeter",
  },
  other: {
    "geo.region": "GH",
    "geo.country": "Ghana",
    "content-language": "en-GH",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0E1A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "ChopMeter",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              description:
                "Free app to track prepaid electricity meter readings, monitor daily energy usage, and manage spending. Built for Ghana and Africa.",
              url: "https://chopmeter.me",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "GHS",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1",
              },
              author: {
                "@type": "Organization",
                name: "ChopMeter",
                url: "https://chopmeter.me",
              },
              areaServed: {
                "@type": "Country",
                name: "Ghana",
              },
            }),
          }}
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
        <link rel="shortcut icon" href="/icons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","vvsu7kn5nz");`}
        </Script>
        <SmoothScroll />
        <InstallPrompt />
        <UpdatePrompt />
        {children}
      </body>
    </html>
  );
}
