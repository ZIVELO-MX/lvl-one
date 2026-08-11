import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Sólo entran las rutas públicas: el resto vive detrás del proxy de sesión y
// para Googlebot no es más que una redirección a /login.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/register`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/login`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
