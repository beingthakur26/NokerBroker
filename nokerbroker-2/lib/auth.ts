// lib/auth.ts
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { verifyWhatsappOtp } from "@/lib/whatsapp-otp";
import { normalizeIndianNumber } from "@/lib/phone";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { isAdminEmail } from "@/lib/admin";

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
        const email = String(credentials.email);
        const password = String(credentials.password);
        const user = await User.findOne({ email });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        if (isAdminEmail(email) && user.role !== "ADMIN") {
          user.role = "ADMIN";
          await user.save();
        }
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
        const whatsappNumber = normalizeIndianNumber(rawNumber);
        const isValid = await verifyWhatsappOtp(whatsappNumber, rawOtp);
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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
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