import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      blocked: boolean;
      writerApproved: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    blocked?: boolean;
    writerApproved?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    blocked?: boolean;
    writerApproved?: boolean;
  }
}
