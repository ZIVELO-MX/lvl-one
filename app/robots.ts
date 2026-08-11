import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Todo lo privado además está tras el proxy de sesión; esto sólo evita
      // que Googlebot gaste rastreo en URLs que siempre le van a redirigir.
      disallow: [
        "/api/",
        "/dashboard",
        "/characters",
        "/campaigns",
        "/account",
        "/groups",
        "/explore",
        "/profile",
        "/dice",
        "/dm-tools",
        "/combat",
        "/encounter-builder",
        "/setup",
        "/onboarding",
        "/reset",
        "/forgot",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
