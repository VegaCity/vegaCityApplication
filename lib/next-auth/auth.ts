import axios from "axios";
import NextAuth, { NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { apiRequest } from "../api/api-handler/generic";

interface UserJWT extends JWT {
  id: string;
  email: string;
  roleName: string;
  roleId: number;
  accessToken: string;
  refreshToken: string;
  emailVerified: Date | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authOptions: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const result = await apiRequest<{ payload: any }>(() =>
            axios.post(`${API_URL}/authentications/login`, {
              email: credentials.email,
              password: credentials.password,
            })
          );

          if (result.success) {
            const { payload } = result.data;
            return { ...payload, ...payload.tokens };
          }
        } catch (error) {
          return null;
        }

      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token as UserJWT;
      if (token) {
        const { id, email, roleName, roleId, accessToken, refreshToken } = token;
        Object.assign(session.user, { id, email, roleName, roleId, accessToken, refreshToken });
      }
      return session;
    },
  },
  pages: { signIn: "/signin" },
  secret: process.env.NEXTAUTH_SECRET!,
};

export const { handlers, auth, signIn, signOut, unstable_update: update } = NextAuth(authOptions);