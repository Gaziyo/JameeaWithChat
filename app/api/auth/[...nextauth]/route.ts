import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { adminAuth } from "@/lib/firebase-admin";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
          prompt: "consent",
        }
      }
    }),
  ],
  pages: {
    signIn: '/signin',
    error: '/signin', // Error page for auth failures
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Create or update Firebase user
          const firebaseToken = await adminAuth.createCustomToken(user.id);
          return true;
        } catch (error) {
          console.error("Error creating Firebase token:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
        // Create a Firebase custom token
        const firebaseToken = await adminAuth.createCustomToken(token.sub!);
        session.firebaseToken = firebaseToken;
      }
      return session;
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };