# LVL ONE — D&D 5e en Español

Crea personajes, aprende las reglas y juega con tu grupo — sin manuales de 600 páginas.

**Beta pública** · Next.js 16 · Supabase · TypeScript · [Discord](https://discord.gg/nwQ8pPVc6f)

---

## Features

- **Creador de personajes** — wizard paso a paso: raza, clase, trasfondo, habilidades y hechizos
- **Grimorio** — fichas de personaje completas con subida de nivel hasta nivel 10
- **Scriptorium** — 15 módulos de aprendizaje de reglas desde cero
- **Enciclopedia** — razas, clases, hechizos y equipo
- **Glosario** — términos de D&D 5e en español
- **Grupos y social** — partidas, logros y sistema de XP
- **Dados** — lanzador integrado
- **DM Tools** — constructor de encuentros y herramientas de DM
- **Campañas** — gestión de NPCs, misiones, locaciones y facciones

## Stack

- **Framework:** Next.js 16 (App Router)
- **Base de datos / Auth:** Supabase (PostgreSQL + Row Level Security)
- **Estilos:** CSS custom (design system `lo-*`, curvas de animación Emil Kowalski)
- **Lenguaje:** TypeScript strict
- **Testing:** Vitest (unitarios) + Playwright (E2E)

## Estructura de rutas

```
app/
├── (marketing)/     # Landing pública
├── (app)/
│   ├── dashboard/
│   ├── characters/  # Creador + fichas + level up
│   ├── learn/       # Módulos de aprendizaje
│   ├── encyclopedia/
│   ├── glossary/
│   ├── groups/
│   ├── campaigns/
│   ├── dice/
│   ├── dm-tools/
│   └── encounter-builder/
├── (print)/         # Hoja de personaje imprimible (PDF)
└── api/             # Routes: characters, campaigns, xp, progress, social
```

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

# 3. Aplicar migraciones
npx supabase db push --linked

# 4. Levantar dev server
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Migraciones

Las migraciones viven en `supabase/migrations/` y se aplican en orden:

| Archivo | Descripción |
|---|---|
| `001_initial.sql` | Schema base: usuarios, personajes, progreso, campañas |
| `002_world_lore_notes.sql` | World lore y notas de campaña |
| `003_invite_code_unique.sql` | Unicidad de códigos de invitación |
| `004_social_features.sql` | Grupos, logros, XP y features sociales |
| `005_check_character_limit.sql` | Trigger DB para límite de 2 personajes en plan free |

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
