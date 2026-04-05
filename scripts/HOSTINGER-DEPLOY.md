# Deploy Never Quit Punjabi (Next.js) on Hostinger

This site is a **Node.js** application, not static PHP/HTML. You need **Hostinger VPS**, **Hostinger Node.js hosting**, or another host that runs **Node 20+**.

The database is **Supabase (PostgreSQL)**. Create a project at [supabase.com](https://supabase.com), then copy the **connection URI** from **Project Settings → Database**.

## What you uploaded

- **`app/`** (from `dist/app`): the production server bundle. Upload **everything inside `app`** to your server (e.g. `domains/yoursite.com/public_html` or a subfolder, depending on your panel).

## On the server

1. **Node.js**  
   Use **Node 20 LTS** or newer (matches Next.js 15).

2. **Environment**  
   In the same directory as `server.js`, create `.env` (see `.env.example` in `dist/`):
   - `DATABASE_URL` — **Supabase PostgreSQL URI** (`postgresql://…` or `postgres://…`). Must **not** be a MySQL URL. Optional alias: `SUPABASE_DATABASE_URL` with the same value.
   - **Build / CI:** Set `DATABASE_URL` for the **build** step if the host runs `next build` (Prisma needs it for `prisma generate` / static analysis).
   - `AUTH_SECRET` — long random string (`openssl rand -base64 32`). Must be available to **both** the Node process and **Edge middleware** (set in the host’s environment / panel).
   - `NEXTAUTH_URL` — site **origin only**, e.g. `https://yourdomain.com` (no path; see Auth.js docs).

3. **Database**  
   On your machine (or CI with network to Supabase), apply the schema once:

   ```bash
   npx prisma db push
   ```

   See `scripts/SUPABASE.md` for details.

4. **Start the app**  
   From the folder that contains `server.js`:

   ```bash
   ./start.sh
   ```

   The bundled `start.sh` sets **`HOSTNAME=0.0.0.0`** (see **503** note below) and loads **`.env`** with Node’s `--env-file` (Node **20+**).  
   If you must call Node directly:

   ```bash
   HOSTNAME=0.0.0.0 PORT=3000 node --env-file=.env server.js
   ```

   **`node server.js` alone does not read `.env`** — variables must be in the process environment or use `--env-file`.

   Set **`PORT`** to the same port your reverse proxy uses (often `3000`).  
   Use **PM2**, **Supervisor**, or Hostinger’s process manager to keep it running and restart on reboot.

5. **Reverse proxy**  
   Point your domain’s HTTPS virtual host to `http://127.0.0.1:PORT` (the port the app listens on). The **`PORT`** in `.env` (or the shell) must match what the proxy targets.

### If you see **503 Service Unavailable**

Usually the proxy cannot reach the Node process, or Node exited.

| Check | What to do |
|--------|------------|
| Process running | In SSH: `ps aux \| grep node` or your panel’s app status. Restart with `./start.sh` or PM2. |
| Crash on boot | Run `./start.sh` in SSH and read the error (missing `DATABASE_URL`, wrong Node version, etc.). |
| **`HOSTNAME` env** | On Linux, `HOSTNAME` is often the server hostname. Next.js binds to that, so **127.0.0.1** proxy fails. Use **`./start.sh`** or `HOSTNAME=0.0.0.0` (see step 4). |
| **Port mismatch** | Proxy must forward to the same **`PORT`** your app uses (default **3000**). |
| **`.env` ignored** | Use `./start.sh` or `node --env-file=.env server.js`. A `.env` file alone is not loaded by `node server.js`. |
| **Git deploy “start command”** | Must run **`node server.js`** or **`./start.sh`** from the directory that contains them, with env vars set in the panel. **`npm start`** from repo root only works if your `package.json` start script matches that layout. |
| **Memory** | Very small VPS may OOM-kill Node; check `dmesg` / host metrics. |

6. **Uploads**  
   Post cover images are stored under `public/uploads/`. Ensure that directory exists and is **writable** by the Node process.

## After schema changes

If you change `prisma/schema.prisma`, run `npx prisma db push` against Supabase, then rebuild with `npm run build:dist` and re-upload `dist/app`.

## Not supported on plain “shared hosting” without Node

If your plan only serves **PHP** and has **no Node.js**, you cannot run this Next.js app there without switching to VPS/Node hosting.
