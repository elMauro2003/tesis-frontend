<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ui-design-rules -->

# DESIGN SYSTEM & ARCHITECTURE: "The Academic Curator"

**CRITICAL:** You must follow the design guidelines specified in `docs/DESIGN.md` and the structural patterns in `docs/FRONTEND_ARCHITECTURE.md` for ALL code you generate.

## Design Rules
*   **No 1px solid borders.** Use structural boundaries like background shifts or whitespace, or `.border-ghost` (only if strictly necessary for accessibility).
*   **Colors:** Only use the predefined CSS variables. Example: `--color-primary` (Blue 700) para acciones o elementos seleccionados, `--color-primary-selected` (Blue 50) para fondos destacados/hover, y `--color-primary-dark` (Blue 900) para títulos. Evita códigos hex directos o colores por defecto de Tailwind en los diseños finales.
*   **Typography:** Use `--font-display` (Manrope) for headlines, and `--font-body` (Inter) for data/body. Maintain "High-End Editorial" aesthetics.
*   **Shadows:** Use the custom shadow `--shadow-ambient` or `--shadow-primary-btn`. Never use raw `shadow-md` without ensuring it fits the theme.
*   **Spacing:** Follow the mathematical rhythm: `spacing-8` (outer), `spacing-6` (inter-component), `spacing-5` (internal).
*   **Components & Interactive states:** Look at `src/styles/globals.css` utilities before creating ad-hoc styles. ALL ACTIONABLE items (buttons, rows, icons) MUST use standard semantic tags or explicitly have `cursor-pointer`.

## Architectural Guidelines
*   **Feature-Sliced Design:** Group domain logic inside `src/features/...` (e.g. `src/features/students/components`). Dumb/agnostic UI goes to `src/components/ui`.
*   **Composición sobre Herencia:** Always prefer building components using the children "Slot" / Compound pattern instead of massive monolithic components with 50 boolean props.
*   **Shared Components & Shadcn:** Always harness `shadcn` components if available under `src/components/ui/` customized heavily by our CSS variables (`globals.css`). Do NOT use plain vanilla unstyled elements if a customized base component exists.
*   **TypeScript & Data Logic:** 0 tolerance for `any`. Favor explicit typings (Entities vs DTOs) and separate Network states from global UI states. Don't throw `useEffect` to fetch data if we can use React Query or Server Components.

When generating React components, ensure that layout layers like `bg-surface-container-lowest`, `rounded-xl`, `border-ghost` and composable Shadcn UI structures are strictly respected to maintain absolute consistency across the whole system.
<!-- END:ui-design-rules -->
