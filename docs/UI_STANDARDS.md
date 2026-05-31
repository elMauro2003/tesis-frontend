# UI Standards — Frontend

Este documento fija las normas obligatorias para la construcción de vistas en el frontend. Está basado en la vista de `sedes` y en los componentes compartidos existentes. Cualquier nueva implementación UI debe seguir estas reglas.

## Objetivos

- Unificar la apariencia y el comportamiento de la cabecera de cada pestaña (título, descripción, search, acción primaria).
- Estandarizar márgenes y paddings para que las vistas se vean consistentes.
- Forzar el uso de componentes compartidos para campos (Input, Select, SearchField, FormField).
- Mantener uniformidad en modales y botones.

## Regla 1 — Cabecera compartida

- Usar siempre `DashboardPageHeader` (src/components/shared/DashboardPageHeader.tsx) para la parte superior que incluye:
  - `title`, `description`, `topBadge` (opcional), `searchValue`, `onSearchChange`, `actionLabel`, `onAction`, `actionIcon`.
  - Si la vista requiere un control de búsqueda especial (ej. sugerencias), pasar `searchComponent` para reemplazar el input por defecto.
  - Uso recomendado: la cabecera debe colocarse dentro de un contenedor con `w-full px-8 py-4`.
  - No usar `extraAction` para filtros estructurales; ese espacio es solo para acciones accesorias o controles puntuales.

## Regla 2 — Márgenes y paddings

- Todas las páginas del dashboard deben usar el contenedor principal:

```tsx
<div className="w-full px-8 py-4">
  <DashboardPageHeader ... />
  {/* resto de la vista */}
</div>
```

- Las secciones internas deben usar `space-y-6` y los paneles principales `rounded-xl` y `shadow-[0_4px_20px_rgba(0,0,0,0.02)]` como en `sedes`.
- Los filtros de página deben vivir en `DashboardFiltersBar` (`src/components/shared/DashboardFiltersBar.tsx`) debajo de la cabecera.
- Los filtros deben mantenerse agrupados por intención:
  - Izquierda: filtros de contexto o alcance, por ejemplo sede, facultad, edificio.
  - Derecha: filtros de estado, segmentados o acciones de refinamiento.

## Regla 3 — Campos compartidos

- Usar `Input` y `Select` desde `src/components/ui/` para campos base.
- Para campos de formulario con label usar `FormField` (`src/components/shared/FormField.tsx`).
- Para búsquedas, usar el componente `SearchField` (`src/components/shared/SearchField.tsx`) o pasar un `searchComponent` a `DashboardPageHeader` cuando se necesiten comportamientos especiales.

## Regla 4 — Botones y acciones

- El CTA principal debe usar `Button` con `variant="default"`, `primary`, `confirm` o `add`.
- Acciones neutrales deben usar `variant="outline"`, `neutral` o `cancel`.
- Acciones destructivas deben usar `variant="destructive"` o `danger`.
- Acciones positivas pueden usar `variant="success"`.
- No escribir colores sueltos para botones de acción si el caso ya está cubierto por un variante compartida.
- Estados visuales de referencia:
  - Primario: fondo azul, texto blanco, hover azul más oscuro.
  - Neutral: fondo claro, texto oscuro, hover con fondo de superficie más alta y texto azul oscuro.
  - Destructivo: fondo rojo, texto blanco, hover rojo más oscuro.
  - Énfasis suave/ghost: fondo transparente o de superficie, texto neutro, hover de superficie.

## Regla 5 — Paginación y listas

- Las tablas deben mostrar estados `loading`, `empty` y `error` usando las mismas clases utilitarias que `sedes`.
- La paginación debe integrar `page`, `page_size` y usar enlaces devueltos por la API (`next`/`previous`) cuando estén disponibles.

## Checklist para PRs de UI

Antes de pedir revisión, asegúrate de:

- [ ] Usar `DashboardPageHeader` con `w-full px-8 py-4` wrapper.
- [ ] Usar `SearchField` o `searchComponent` para búsquedas.
- [ ] Reutilizar `Input`, `Select`, `FormField` y `Button` del repositorio.
- [ ] Añadir pruebas visuales (screenshots) si hay cambios de layout.

## Dónde documentar excepciones

Si una vista necesita salirse de las reglas, documentar la justificación breve en el PR y actualizar este archivo.
