import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Cookies configured for cross-origin iframe / preview environments.
  // - SameSite=None + Secure: allows cookies in third-party iframes (preview
  //   runs inside an iframe on a different origin; the gateway terminates HTTPS).
  // - Custom names: if the browser holds stale cookies from a previous broken
  //   session, the new names ensure a fresh session is used (no redirect loop
  //   from old SameSite=Lax cookies that the browser refuses to send).
  cookies: {
    sessionToken: {
      name: "creativo-session",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: "creativo-callback",
      options: {
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: "creativo-csrf",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: "creativo-pkce",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-request",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.toLowerCase().trim();
        const user = await db.user.findUnique({
          where: { email },
          include: { profile: true },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        if (user.status === "banned") {
          throw new Error("Your account has been banned. Please contact support.");
        }
        if (user.status === "suspended") {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        await db.securityLog.create({
          data: {
            userId: user.id,
            event: "login_success",
            metadata: JSON.stringify({ email: user.email }),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.profile?.role ?? "FREE_USER",
          plan: user.profile?.plan ?? "FREE",
          status: user.status,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
        token.status = (user as any).status;
      }
      // Refresh role/plan on sign-in triggers
      if (trigger === "signIn" || trigger === "update") {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          include: { profile: true },
        });
        if (dbUser) {
          token.role = dbUser.profile?.role ?? "FREE_USER";
          token.plan = dbUser.profile?.plan ?? "FREE";
          token.status = dbUser.status;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.image = dbUser.image ?? dbUser.profile?.avatarUrl;
        }
      }
      if (trigger === "update" && session) {
        // Allow client-side session update
        if (session.role) token.role = session.role;
        if (session.plan) token.plan = session.plan;
        if (session.name) token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).plan = token.plan;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const userId = (message.token as any)?.id as string | undefined;
      if (userId) {
        await db.securityLog.create({
          data: { userId, event: "logout" },
        }).catch(() => {});
      }
    },
  },
};

// Type augmentation for next-auth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      plan: string;
      status: string;
    };
  }
  interface User {
    role?: string;
    plan?: string;
    status?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    plan?: string;
    status?: string;
  }
}
