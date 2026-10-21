# Architecture

- **Applications:** language-specific implementations live under `apps/`.
  The TypeScript implementation is in `apps/typescript/` and uses Next.js App
  Router, Tailwind CSS, and TanStack Query.
- **TypeScript UI:** routes live in `apps/typescript/src/app/`; reusable UI lives
  in `apps/typescript/src/components/`; feature-specific UI lives in
  `apps/typescript/src/features/`.
- **Shared data:** committed sample files live once in the repository-level
  `data/` folder and are read by each implementation.
- **TypeScript domain logic:** keep financial calculations as pure functions in
  `apps/typescript/src/lib/`.
- **TypeScript tests:** test domain logic in `apps/typescript/tests/unit/`.

Keep data flow one-way in each implementation: shared data → API/domain logic →
features → UI.
