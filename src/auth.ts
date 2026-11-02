
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify } from "argon2";
import { z } from "zod";
import type { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { checkRateLimit, resetRateLimit } from "@/lib/security/rate-limit";

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        let loginLimit;

        try {
          loginLimit = await checkRateLimit({
            scope: "login",
            identifier: email,
            limit: 10,
            windowSeconds: 900,
          });
        } catch (error) {
          console.error("Login rate limiter unavailable:", error);
          return null;
        }

        if (!loginLimit.allowed) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordValid = await verify(
          user.passwordHash,
          password
        );

        if (!passwordValid) {
          return null;
        }
        try {
          await resetRateLimit("login", email);
        } catch (error) {
          console.error("Login rate-limit reset failed:", error);
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
      }

      if (typeof token.id !== "string" || typeof token.sessionVersion !== "number") {
        return null;
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: { sessionVersion: true, role: true },
      });

      if (
        !currentUser ||
        currentUser.sessionVersion !== token.sessionVersion
      ) {
        return null;
      }

      token.role = currentUser.role;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }

      return session;
    },
  },


  pages: {
    signIn: "/login",
  },
});
