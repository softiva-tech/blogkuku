# Supabase database (PostgreSQL)

1. Create a project at [Supabase](https://supabase.com).
2. **Project Settings → Database → Connection string → URI** (use **Session** or **Transaction** pooler as recommended for your runtime).
3. Set `DATABASE_URL` in `.env` to that URI (starts with `postgresql://` or `postgres://`).
4. Apply the Prisma schema to the remote database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. (Optional) Seed a default admin:

   ```bash
   npm run db:seed
   ```

Schema changes are managed with Prisma (`db push` or `prisma migrate`); the old MySQL `.sql` scripts were removed.
