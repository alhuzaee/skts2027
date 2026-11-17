# Project memory

## Product intent & audience

- Vite + React web application (specific product/domain not yet described).

## Brand personality & voice

- Not yet established; assistant communicates in direct, technical, problem-solving tone.

## Visual design & UX direction

- Tailwind CSS integrated via `@tailwindcss/vite` plugin (not PostCSS config).
- Styling approach is utility-first Tailwind; no custom theme tokens inferred yet.

## Decisions, constraints & rationale

- Build stack: Vite 8 + React (`@vitejs/plugin-react`) + Tailwind (`@tailwindcss/vite`).
- Config is TypeScript: `vite.config.ts`.
- esbuild must be at a version compatible with Vite 8; an older pinned esbuild version previously blocked `node_modules` installation and caused `UNRESOLVED_IMPORT` / `ERR_MODULE_NOT_FOUND` errors for all Vite plugins during deploy.
- Dependencies must be fully installed before build/deploy; missing installs surface as "Module not found, treating it as external dependency" warnings followed by `ERR_MODULE_NOT_FOUND`.
- Deployment environment uses WebContainers (Node 18); WASI experimental warnings are benign.

## Open questions & assumptions

- No explicit product description, target audience, or design system provided yet.
- Assuming the esbuild pin was unintentional and can be floated/updated as needed.
- Unknown whether other packages carry similar version constraints that could resurface.
- No `.bolt/prompt` is currently configured; global instructions may be added later.