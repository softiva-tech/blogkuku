# Deploy Never Quit Punjabi (Next.js) on Hostinger

This site is a **Node.js** application, not static PHP/HTML. You need **Hostinger VPS**, **Hostinger Node.js hosting**, or another host that runs **Node 20+** and **MySQL/MariaDB**.

## What you uploaded

- **`app/`** (from `dist/app`): the production server bundle. Upload **everything inside `app`** to your server (e.g. `domains/yoursite.com/public_html` or a subfolder, depending on your panel).

## On the server

1. **Node.js**  
   Use **Node 20 LTS** or newer (matches Next.js 15).

2. **Environment**  
   In the same directory as `server.js`, create `.env` (see `.env.example` in `dist/`):
   - `DATABASE_URL` — MySQL connection string from Hostinger (phpMyAdmin / Databases).
   - `AUTH_SECRET` — long random string (`openssl rand -base64 32`).
   - `NEXTAUTH_URL` — your public site URL, e.g. `https://yourdomain.com` (no trailing slash).

3. **Database**  
   Create an empty MySQL database. In phpMyAdmin, run the SQL files in **`mysql-scripts/`** in order (`01`, `02`, …) **or** use a local machine with Prisma: `npx prisma db push` pointed at the same `DATABASE_URL` (if `db push` works on your setup).

4. **Start the app**  
   From the folder that contains `server.js`:

   ```bash
   node server.js
   ```

   Set `PORT` if your host expects a specific port (e.g. `PORT=3000 node server.js`).  
   Use **PM2**, **Supervisor**, or Hostinger’s process manager to keep it running and restart on reboot.

5. **Reverse proxy**  
   Point your domain’s HTTPS virtual host to `http://127.0.0.1:PORT` (the port `server.js` listens on).

6. **Uploads**  
   Post cover images are stored under `public/uploads/`. Ensure that directory exists and is **writable** by the Node process.

## After schema changes

If you change `prisma/schema.prisma`, rebuild on your computer with `npm run build:dist` and re-upload `dist/app`, or run `npx prisma db push` / apply `mysql-scripts` on the server DB.

## Not supported on plain “shared hosting” without Node

If your plan only serves **PHP** and has **no Node.js**, you cannot run this Next.js app there without switching to VPS/Node hosting.
