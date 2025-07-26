// Configuration d'authentification NextAuth pour Dashboard2
import { NextAuthOptions } from "next-auth";
import type { User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Dashboard2 - Tentative de connexion:", credentials?.email);
        // Ajouter un délai pour éviter les problèmes de concurrence
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Identifiants manquants");
          throw new Error("Veuillez entrer votre email et mot de passe");
        }

        try {
          // Authentification directe avec la base de données (évite la boucle récursive)
          const { connectDB } = await import('@/lib/mongodb');
          const User = (await import('@/models/User')).default;
          const bcrypt = await import('bcryptjs');
          
          console.log("🔗 Authentification directe avec la base de données");
          
          // Connexion à la base de données
          await connectDB();
          console.log("✅ Connexion à la base de données réussie");
          
          // Rechercher l'utilisateur par email
          const user = await User.findOne({ email: credentials.email }).select('+password');
          
          if (!user) {
            console.log("❌ Utilisateur non trouvé:", credentials.email);
            throw new Error("Identifiants incorrects");
          }
          
          // Vérifier si l'utilisateur est actif
          if (!user.isActive) {
            console.log("❌ Compte utilisateur désactivé:", credentials.email);
            throw new Error("Ce compte a été désactivé");
          }
          
          console.log("✅ Utilisateur trouvé:", user.email);
          
          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.log("❌ Mot de passe invalide pour:", credentials.email);
            throw new Error("Identifiants incorrects");
          }
          
          console.log("✅ Authentification réussie pour:", user.email);
          
          // Préparer les données utilisateur
          const userData = {
            success: true,
            user: {
              id: user._id.toString(),
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              role: user.role,
              storeId: user.storeId,
              avatar: user.avatar
            }
          };
          
          if (userData.user) {
            console.log("✅ Connexion réussie via Dashboard2 pour:", userData.user.email);
            return {
              id: userData.user.id,
              email: userData.user.email,
              name: userData.user.name,
              role: userData.user.role,
              storeId: userData.user.storeId,
            };
          }

          return null;
        } catch (error) {
          console.error("❌ Erreur lors de l'authentification Dashboard2:", error);
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
        token.id = user.id;
        token.role = (user as User & { role: string; storeId?: string; accessToken?: string }).role;
        token.storeId = (user as User & { role: string; storeId?: string; accessToken?: string }).storeId;
        token.accessToken = (user as User & { role: string; storeId?: string; accessToken?: string }).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as User & { role: string; storeId?: string }).id = token.id as string;
        (session.user as User & { role: string; storeId?: string }).role = token.role as string;
        (session.user as User & { role: string; storeId?: string }).storeId = token.storeId as string;
        (session as Session & { accessToken?: string }).accessToken = token.accessToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Après connexion réussie, rediriger vers le dashboard
      if (url === baseUrl || url === '/') {
        return `${baseUrl}/dashboard`;
      }
      
      // Si l'URL est relative, construire l'URL complète
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Si l'URL est de la même origine, la permettre
      if (new URL(url).origin === baseUrl) return url;
      
      // Par défaut, rediriger vers le dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
