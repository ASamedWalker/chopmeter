import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/scanner", "/onboarding"],
    },
    sitemap: "https://chopmeter.me/sitemap.xml",
  };
}
