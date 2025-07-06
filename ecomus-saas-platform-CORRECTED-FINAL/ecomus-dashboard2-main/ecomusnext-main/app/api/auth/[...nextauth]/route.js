import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import User from "../../../../models/User";
import { connectDB } from "../../../../lib/mongodb";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Tentative de connexion:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Identifiants manquants");
          return null;
        }

        try {
          await connectDB();

          const user = await User.findOne({ email: credentials.email }).select('+password');
          if (!user) {
            console.log("❌ Utilisateur non trouvé:", credentials.email);
            return null;
          }

          const isPasswordValid = await user.matchPassword(
            credentials.password
          );
          if (!isPasswordValid) {
            console.log("❌ Mot de passe invalide pour:", credentials.email);
            return null;
          }

          console.log("✅ Connexion réussie pour:", user.email);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            storeId: user.storeId?.toString(),
          };
        } catch (error) {
          console.error("❌ Erreur lors de l'authentification:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.storeId = user.storeId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.storeId = token.storeId;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
