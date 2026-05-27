# LVL ONE — D&D 5e en Español

Crea personajes, aprende las reglas y juega con tu grupo — sin manuales de 600 páginas.

**Beta pública** · Next.js 16 · Supabase · TypeScript

---

## Stack

- **Framework:** Next.js 16 (App Router)
- **Base de datos / Auth:** Supabase (PostgreSQL + Row Level Security)
- **Estilos:** CSS custom (design system `lo-*`)
- **Lenguaje:** TypeScript strict

## Requisitos

- Node.js 20+
- Una cuenta en [Supabase](https://supabase.com) con el proyecto configurado

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 3. Levantar dev server
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role (**privada**) |

## Comandos

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run test       # Tests unitarios (Vitest)
npm run test:e2e   # Tests E2E (Playwright)
```

## Deploy

La forma más rápida es con [Vercel](https://vercel.com):

1. Importa el repositorio en Vercel
2. Añade las variables de entorno en Settings → Environment Variables
3. Deploy automático en cada push a `main`

---

LVL ONE es un producto no oficial. D&D 5e es propiedad de Wizards of the Coast LLC.
