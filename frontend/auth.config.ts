import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { User } from "@/lib/data";
import newRequest from "./app/api/newRequest";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 1. Session stays in a signed JWT cookie (no DB needed at first)
  session: { strategy: "jwt" },

  // 2. One provider that POSTs to your FastAPI / Django / Flask endpoint
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        // 👉 hit your Python auth endpoint
        try {
          console.log("Credentials:", credentials); // Debug credentials

          // Convert credentials to form data format for FastAPI
          const formData = new URLSearchParams();
          formData.append("username", credentials.email); // FastAPI OAuth2 uses username field
          formData.append("password", credentials.password);

          const res = await newRequest().post(
            "/auth/login",
            formData.toString(),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          if (res.status !== 200) return null;
          const user = res.data;
          if (!user || !user.id || !user.email || !user.accessToken)
            return null;

          // whatever object you return becomes `session.user`
          return {
            id: user.id,
            name: user.name || user.full_name || "",
            email: user.email,
            accessToken: user.accessToken, // handy for later fetches
          };
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],

  // 3. Callbacks let you customise the JWT + session payload
  callbacks: {
    async jwt({ token, user }) {
      // first sign‑in ⇒ move accessToken onto JWT
      if (user) token.accessToken = (user as any).accessToken;
      return token;
    },
    async session({ session, token }) {
      // expose token fields in `session`
      if (session.user) {
        session.user.id = token.sub!;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
});
