# Repository Instructions

These rules are mandatory for all future work in this repository.

## UI Standards

- Before creating or changing any page, modal, form, or dashboard widget, review `docs/UI_STANDARDS.md` and follow the shared patterns.
- Use `DashboardPageHeader` for dashboard titles and primary actions.
- Place page-level filters in a dedicated filter bar below the header. Do not place structural filters next to the primary CTA unless the view explicitly requires it.
- Use shared inputs and selectors (`Input`, `Select`, `FormField`, `SearchField`) instead of ad-hoc controls.
- Use shared button variants instead of custom color classes when the action matches a standard semantic type.

## Button Semantics

- Primary / add / confirm actions must use the primary button style.
- Cancel / neutral actions must use the neutral or outline style.
- Destructive actions must use the destructive style.
- Success or positive actions should use the success style when needed.
- Avoid mixing the same action type with different colors or hover states across features.

## Layout Standards

- Dashboard pages should use `w-full px-8 py-4` as the outer wrapper.
- Keep vertical spacing consistent with the `sedes` page and shared dashboard sections.
- Prefer shared layout shells for repeated controls, tables, filter rows, and action bars.

## Implementation Discipline

- If a request implies a new UI, check the standards first and reuse existing shared components before adding new ones.
- If a standard is missing, extend the shared component or the standards document instead of inventing a one-off pattern in the feature.