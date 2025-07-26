import { connectDB } from '../lib/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';

/**
 * Script d'initialisation des utilisateurs de test
 * 
 * Ce script crée ou met à jour les utilisateurs de test dans la base de données.
 * À exécuter avec: npx ts-node -r tsconfig-paths/register scripts/init-test-users.ts
 */
async function main() {
  try {
    console.log('🚀 Connexion à la base de données...');
    await connectDB();
    console.log('✅ Connexion à la base de données réussie');

    const testUsers = [
      {
        firstName: "Admin",
        lastName: "System",
        email: "admin@ecomus.com",
        password: "admin123",
        role: "admin",
        isActive: true,
        isVerified: true
      },
      {
        firstName: "Vendor",
        lastName: "Test",
        email: "vendor@ecomus.com",
        password: "vendor123",
        role: "vendor",
        isActive: true,
        isVerified: true,
        vendor: {
          businessName: "Test Store",
          businessType: "Retail",
          description: "A test vendor account",
          isVerified: true
        }
      },
      {
        firstName: "User",
        lastName: "Test",
        email: "user@ecomus.com",
        password: "user123",
        role: "customer",
        isActive: true,
        isVerified: true
      },
      {
        firstName: "Vendor",
        lastName: "One",
        email: "vendor1@ecomus.com",
        password: "vendor123",
        role: "vendor",
        isActive: true,
        isVerified: true,
        vendor: {
          businessName: "Store One",
          businessType: "Retail",
          description: "The first test store",
          isVerified: true
        }
      },
      {
        firstName: "Client",
        lastName: "Test",
        email: "client@ecomus.com",
        password: "client123",
        role: "customer",
        isActive: true,
        isVerified: true
      }
    ];

    for (const userData of testUsers) {
      const { email, password } = userData;
      const hashedPassword = await bcrypt.hash(password, 12);
        // Rechercher l'utilisateur par email
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        // Mettre à jour l'utilisateur existant
        console.log(`Mise à jour de l'utilisateur: ${email}`);
          // Utilisons une approche qui n'implique pas de suppressions de propriétés
        const updatedUserData = { ...userData };
        // Ne pas inclure l'email dans les champs à mettre à jour
        
        await User.findOneAndUpdate(
          { email }, 
          { 
            firstName: updatedUserData.firstName,
            lastName: updatedUserData.lastName,
            role: updatedUserData.role,
            isActive: updatedUserData.isActive,
            isVerified: updatedUserData.isVerified,
            password: hashedPassword,
            updatedAt: new Date(),
            ...(updatedUserData.vendor ? { vendor: updatedUserData.vendor } : {})
          }
        );
      } else {
        // Créer un nouvel utilisateur
        console.log(`Création de l'utilisateur: ${email}`);
        await User.create({
          ...userData,
          password: hashedPassword
        });
      }
    }
    
    console.log('✅ Utilisateurs de test créés ou mis à jour avec succès');
    
    // Vérification
    const usersCount = await User.countDocuments();
    console.log(`📊 Nombre total d'utilisateurs dans la base de données: ${usersCount}`);
    
    const adminCount = await User.countDocuments({ role: 'admin' });
    const vendorCount = await User.countDocuments({ role: 'vendor' });
    const customerCount = await User.countDocuments({ role: 'customer' });
    
    console.log(`📊 Admins: ${adminCount}, Vendeurs: ${vendorCount}, Clients: ${customerCount}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des utilisateurs:', error);
    process.exit(1);
  } finally {
    // Fermeture de la connexion
    process.exit(0);
  }
}

main();
