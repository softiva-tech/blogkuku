# Set up the database in Supabase

## 1. Create or open the project

1. Go to [supabase.com](https://supabase.com) → your project.
2. If the project is **paused**, resume it (free tier projects pause after inactivity).

## 2. Connection string for Prisma

1. **Project Settings** (gear) → **Database**.
2. Under **Connection string**, choose **URI**.
3. Use the **direct** connection to `db.<project-ref>.supabase.co` on port **5432** (best for `prisma db push` / migrations).  
   Paste your **database password** when the dashboard asks; copy the full URI.
4. Put the URI in your app’s **`.env`** as **`DATABASE_URL`**.

**Password in the URL:** special characters must be **URL-encoded** (`@` → `%40`, `#` → `%23`, etc.).

**Example shape:**

```env
DATABASE_URL="postgresql://postgres:ENCODED_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres?sslmode=require"
```

Optional: **`SUPABASE_DATABASE_URL`** with the same value if your host only allows one variable name (see `src/lib/prisma.ts`).

## 3. Apply the Prisma schema (creates tables)

From your project root (with `.env` present):

```bash
npm install
npx prisma generate
npx prisma db push
```

If Prisma says it cannot find `DATABASE_URL`, ensure `.env` is in the **project root** (same folder as `package.json`). This repo loads it via `prisma.config.ts`.

## 4. Seed demo admin and sample content

```bash
npm run db:seed
```

Or schema + seed in one step:

```bash
npm run db:setup
```

Default admin (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`):

- **Email:** `admin@demo.com`
- **Password:** `admin123`

## 5. If connection fails (P1001 / timeout)

- Confirm the Supabase project is **running** (not paused).
- Try another network (home vs office, or disable VPN).
- In Supabase **Database** settings, check **IPv4** / pooler notes if your network only supports IPv4.
- For **serverless** production you may use the **pooler** URI (port **6543**, often with `?pgbouncer=true`); for local `db push`, prefer the **direct** `5432` URI first.

## 6. After setup

Sign in at **`/auth/signin`** with the admin email and password, then open **`/admin`**.

Schema changes are applied with **`prisma db push`** (or **`prisma migrate`** if you add migrations later).
