# Supabase Email Templates — LVL ONE

## Cómo usarlos

1. Ve a **Supabase Dashboard → Authentication → Email Templates**
2. Por cada template, pega el contenido HTML completo
3. Ajusta `{{ .SiteURL }}` en el template si es necesario según el entorno

## Templates disponibles

| Archivo | Tipo | Variables |
|---------|------|-----------|
| `confirmation.html` | Confirmación de registro | `{{ .ConfirmationURL }}` |
| `magic-link.html` | Magic link (inicio rápido) | `{{ .SiteURL }}`, `{{ .TokenHash }}` |
| `reset-password.html` | Restablecer contraseña | `{{ .ConfirmationURL }}` |
| `invite.html` | Invitación a campaña | `{{ .ConfirmationURL }}` |
| `change-email.html` | Cambio de correo | `{{ .ConfirmationURL }}` |

## Variables disponibles en Supabase

- `{{ .ConfirmationURL }}` — Enlace completo para confirmar la acción
- `{{ .Token }}` — Token de seguridad (si usas flujo manual)
- `{{ .TokenHash }}` — Hash del token (para magic links)
- `{{ .SiteURL }}` — URL base del proyecto
- `{{ .Email }}` — Correo del destinatario (solo en algunos templates)

## Estilo

Diseño oscuro con la paleta de LVL ONE:
- Fondo: `#0F0D0B` (obsidian)
- Tarjeta: `#17120E` (deep ink), borde `rgba(244,231,197,0.10)`
- Texto: `#F4E7C5` (parchment), `#B8AC8A`, `#8A8378`
- CTA: `#D6A84F` (quest gold) con texto `#1A130A`
- Display: Cinzel (serif); Body: Inter (sans-serif)
