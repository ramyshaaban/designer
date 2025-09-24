## StayCurrentMD Space Designer

Production-ready scaffold for a medical-education Designer.

### Setup

1. Node 22+, pnpm via corepack.
2. Copy `.env.local` (already created) and review `NEXTAUTH_SECRET`.
3. Install deps: `pnpm install`.
4. Generate DB: `pnpm prisma:migrate`.
5. Seed: `pnpm run db:seed`.
6. Dev: `pnpm dev` then sign in at `/signin` with `admin@demo.test` / `password`.

### Deploy

Vercel (recommended):
- Create a Postgres database (Neon, Supabase, RDS, etc.).
- Set project env vars in Vercel: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
- Push to GitHub and import repo in Vercel. The included `vercel.json` runs `prisma migrate deploy` before build.
- Optionally add `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN` secrets in GitHub to enable the included Actions workflow.

Docker:
- Build: `docker build -t staycurrentmd-space-designer .`
- Run: `docker run -p 3000:3000 -e DATABASE_URL=... -e NEXTAUTH_URL=... -e NEXTAUTH_SECRET=... staycurrentmd-space-designer`

### Key Pages

- `/designer`: Cards CRUD and reorder.
- `/library`: Content & Collections CRUD.
- `/templates`: Browse and apply templates.
- `/preview`: Read-only preview; use `/api/home-layout/publish` to publish.

### Tests

- Unit: `pnpm test` (Vitest)
- E2E: `pnpm e2e` (Playwright)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Deployment ready
# Auto-deploy test
# Deploy with env vars
# Space Designer - Latest Update
