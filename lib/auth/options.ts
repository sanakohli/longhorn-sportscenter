import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabase/server";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string;
      onboardingCompleted: boolean;
    };
    accessToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      try {
        const { data: existing } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("google_id", account.providerAccountId)
          .single();

        if (existing) {
          await supabaseAdmin
            .from("users")
            .update({
              google_access_token: account.access_token,
              google_refresh_token:
                account.refresh_token ?? undefined,
              name: user.name,
              picture_url: user.image,
              updated_at: new Date().toISOString(),
            })
            .eq("google_id", account.providerAccountId);
        } else {
          await supabaseAdmin.from("users").insert({
            google_id: account.providerAccountId,
            email: user.email,
            name: user.name,
            picture_url: user.image,
            google_access_token: account.access_token,
            google_refresh_token: account.refresh_token,
            onboarding_completed: false,
          });
        }
      } catch (err) {
        console.error("signIn callback error:", err);
        return false;
      }

      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      if (token.email) {
        try {
          const { data: dbUser } = await supabaseAdmin
            .from("users")
            .select("id, onboarding_completed")
            .eq("email", token.email)
            .single();

          if (dbUser) {
            token.userId = dbUser.id;
            token.onboardingCompleted = dbUser.onboarding_completed;
          }
        } catch (err) {
          console.error("jwt callback error:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = (token.userId as string) ?? "";
      session.user.onboardingCompleted =
        (token.onboardingCompleted as boolean) ?? false;
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
