import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ChopMeter - Track Your Electricity",
    short_name: "ChopMeter",
    description:
      "No more meter dey chop my money! Track your prepaid electricity meter in real-time.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0E1A",
    theme_color: "#0A0E1A",
    orientation: "portrait",
    categories: ["utilities", "finance"],
    icons: [
      {
        src: "/icons/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
