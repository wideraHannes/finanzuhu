# Architecture

- **Stack:** Next.js App Router, TypeScript, Tailwind CSS, TanStack Query.
- **UI:** routes live in `src/app/`; reusable UI lives in `src/components/`; feature-specific UI lives in `src/features/`.
- **Data:** API routes in `src/app/api/` read the committed files in `data/`.
- **Domain logic:** keep financial calculations as pure functions in `src/lib/`.
- **Tests:** test domain logic in `tests/unit/`.

Keep data flow one-way: data files → API/domain logic → features → UI.
