# TypeScript app

Finanzuhu's TypeScript web app. The app uses Next.js, Tailwind CSS, TanStack
Query, and Vitest; it reads the shared sample data from the repository's root
`data/` directory.

From the repository root:

```bash
npm --prefix apps/typescript install
npm --prefix apps/typescript run dev
npm --prefix apps/typescript test
npm --prefix apps/typescript run lint
npm --prefix apps/typescript run build
```

The development server is available at http://localhost:3000. The app contains
an Overview (`/`) and Transactions (`/transactions`) screen.
