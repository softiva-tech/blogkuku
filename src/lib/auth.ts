import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAuthSecret } from "@/lib/auth-secret";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/signin" },
  providers: [
    Credentials({
      id: "impersonate",
      name: "Impersonate",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const { prisma } = await import("@/lib/prisma");
        const token = credentials?.token;
        if (!token || typeof token !== "string") return null;

        const record = await prisma.impersonationToken.findUnique({
          where: { token },
          include: { user: true },
        });
        if (!record || record.expiresAt < new Date()) return null;
        const { user } = record;
        if (user.blocked) return null;

        await prisma.impersonationToken.delete({ where: { id: record.id } });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          blocked: user.blocked,
          writerApproved: user.writerApproved,
        };
      },
    }),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { prisma } = await import("@/lib/prisma");
        const bcrypt = (await import("bcryptjs")).default;
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password || typeof email !== "string") return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.blocked) return null;
        const ok = await bcrypt.compare(String(password), user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          blocked: user.blocked,
          writerApproved: user.writerApproved,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const id = user.id?.toString();
        token.id = id;
        token.sub = id;
        token.role = user.role;
        token.blocked = Boolean(
          (user as { blocked?: boolean }).blocked,
        );
        token.writerApproved = Boolean(
          (user as { writerApproved?: boolean }).writerApproved,
        );
      } else if (!token.id && token.sub) {
        // After cookie decode, Auth.js keeps `sub`; mirror to `id` for session callback.
        token.id = token.sub as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      const userId = (token.id ?? token.sub) as string | undefined;
      if (!userId) return session;

      try {
        const u = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            email: true,
            name: true,
            role: true,
            blocked: true,
            writerApproved: true,
          },
        });
        if (u) {
          session.user.id = userId;
          session.user.email = u.email;
          session.user.name = u.name;
          session.user.role = u.role;
          session.user.blocked = u.blocked;
          session.user.writerApproved = u.writerApproved;
          return session;
        }
      } catch (e) {
        console.error("[auth] session DB refresh failed:", e);
      }

      // Fallback so JWT sessions still work (admin link + /admin middleware) if DB hiccups.
      session.user.id = userId;
      session.user.email =
        (token.email as string | undefined) ?? session.user.email ?? "";
      session.user.name =
        (token.name as string | undefined) ?? session.user.name ?? null;
      session.user.role = String(token.role ?? "USER");
      session.user.blocked = Boolean(token.blocked);
      session.user.writerApproved = Boolean(token.writerApproved);
      return session;
    },
  },
});
