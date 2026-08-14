// lib/auth.ts
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { verifyWhatsappOtp } from "@/lib/whatsapp-otp";
import { isValidIndianNumber, normalizeIndianNumber, toMsg91Mobile } from "@/lib/phone";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { isAdminEmail } from "@/lib/admin";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";

function buildProviders(): Provider[] {
  const providers: Provider[] = [
    CredentialsProvider({
      id: "email-password",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await dbConnect();
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);
        if (!(await consumeRateLimit(`signin:${email}`, 10, 15 * 60_000))) return null;
        const user = await User.findOne({ email });
        if (!user?.passwordHash || !user.emailVerified) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        if (isAdminEmail(email) && user.role !== "ADMIN") {
          user.role = "ADMIN";
          await user.save();
        }
        await createNotification(user._id.toString(), "SECURITY_EVENT", "A password sign-in to your account was successful.", "/dashboard/profile");
        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role ?? "USER" };
      },
    }),

    CredentialsProvider({
      id: "whatsapp-otp",
      name: "WhatsApp OTP",
      credentials: {
        whatsappNumber: { label: "WhatsApp number", type: "text" },
        otp: { label: "OTP", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.whatsappNumber || !credentials?.otp) return null;
        const rawNumber = String(credentials.whatsappNumber);
        const rawOtp = String(credentials.otp);
        const rawName = String(credentials.name ?? "");
        if (!isValidIndianNumber(rawNumber) || !/^\d{4,6}$/.test(rawOtp)) return null;
        const whatsappNumber = normalizeIndianNumber(rawNumber);
        const isValid = await verifyWhatsappOtp(toMsg91Mobile(whatsappNumber), rawOtp);
        if (!isValid) return null;

        await dbConnect();
        let user = await User.findOne({ whatsappNumber });
        if (!user) {
          user = await User.create({
            whatsappNumber,
            whatsappVerified: true,
            name: rawName.trim() || "New User",
            email: `${whatsappNumber.replace(/\D/g, "")}@placeholder.nokerbroker.in`,
          });
        } else {
          if (!user.whatsappVerified) user.whatsappVerified = true;
          if (rawName.trim()) user.name = rawName.trim();
          await user.save();
        }
        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role ?? "USER" };
      },
    }),
  ];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  return providers;
}

export const authOptions: NextAuthConfig = {
  providers: buildProviders(),
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // OAuth providers supply their own user IDs. All application models,
        // however, reference the MongoDB User _id, so resolve (or create) the
        // local account before storing the ID in the session JWT.
        if (!user.email) {
          throw new Error("The sign-in provider did not return an email address.");
        }
        await dbConnect();
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          dbUser = await User.create({
            name: user.name?.trim() || user.email.split("@")[0],
            email: user.email,
            // This branch is reached only after a successful Google OAuth sign-in.
            emailVerified: true,
            avatarUrl: user.image ?? undefined,
          });
        } else if (isAdminEmail(dbUser.email) && dbUser.role !== "ADMIN") {
          dbUser.role = "ADMIN";
          await dbUser.save();
        }

        token.id = dbUser._id.toString();
        token.role = dbUser.role ?? "USER";
      } else if (token.id) {
        // Roles can be granted or revoked by an administrator after a user has
        // already signed in. Refresh from MongoDB so a stale JWT cannot block
        // a newly promoted admin (or retain revoked access).
        try {
          await dbConnect();
          const dbUser = await User.findById(token.id, "role").lean();
          if (dbUser) token.role = dbUser.role ?? "USER";
        } catch (error) {
          // Preserve the existing session claim during a transient DB outage.
          // Protected pages still require the role that was previously issued.
          console.error("[auth] Failed to refresh user role:", error);
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
};

export const { handlers, auth } = NextAuth(authOptions);
