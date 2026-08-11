// lib/auth.ts
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { verifyWhatsappOtp } from "@/lib/whatsapp-otp";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

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
        const user = await User.findOne({ email: credentials.email });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),

    CredentialsProvider({
      id: "whatsapp-otp",
      name: "WhatsApp OTP",
      credentials: {
        whatsappNumber: { label: "WhatsApp number", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.whatsappNumber || !credentials?.otp) return null;
        const isValid = await verifyWhatsappOtp(credentials.whatsappNumber, credentials.otp);
        if (!isValid) return null;

        await dbConnect();
        let user = await User.findOne({ whatsappNumber: credentials.whatsappNumber });
        if (!user) {
          user = await User.create({
            whatsappNumber: credentials.whatsappNumber,
            whatsappVerified: true,
            name: "New User",
            email: `${credentials.whatsappNumber}@placeholder.nokerbroker.in`,
          });
        } else if (!user.whatsappVerified) {
          user.whatsappVerified = true;
          await user.save();
        }
        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
};