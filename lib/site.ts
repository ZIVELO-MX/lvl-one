/**
 * Única fuente del dominio público. Antes estaba escrito a mano en el layout,
 * el sitemap y robots.txt, y los tres apuntaban a un dominio que no resuelve:
 * canonical, OG y sitemap enviaban a Google a la nada.
 *
 * Orden de preferencia:
 *   1. NEXT_PUBLIC_SITE_URL — ponlo cuando haya dominio propio.
 *   2. El dominio de producción que Vercel inyecta solo en cada despliegue.
 *   3. localhost, para que en desarrollo las URLs absolutas sigan siendo válidas.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
