import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { SubscriptionPlan, UserSubscription } from '../../../models/SaasModels';
import bcrypt from 'bcryptjs';

// POST /api/setup/super-admin - Créer le profil super admin
export async function POST(request) {
  try {
    await dbConnect();

    // Vérifier si un super admin existe déjà
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      return NextResponse.json({
        success: false,
        message: "Un super administrateur existe déjà"
      }, { status: 400 });
    }

    // Créer le profil super admin Louis Olivier
    const hashedPassword = await bcrypt.hash('Figoro21', 12);
    
    const superAdminData = {
      name: 'Louis Olivier Nkeng Hiag',
      email: 'louiscyrano@gmail.com',
      username: 'louiscyrano',
      password: hashedPassword,
      role: 'super_admin',
      
      profile: {
        firstName: 'Louis Olivier',
        lastName: 'Nkeng Hiag',
        bio: 'Développeur web fullstack et vibecoder depuis 4 ans. Créateur de la plateforme EcomusNext.',
        avatar: 'https://www.gravatar.com/avatar/' + require('crypto').createHash('md5').update('louiscyrano@gmail.com').digest('hex'),
        phone: '+33 6 12 34 56 78',
        
        address: {
          street: '406 square Jacques Prévert',
          city: 'Evry Courcouronnes',
          state: 'Île-de-France',
          postalCode: '91000',
          country: 'France'
        },
        
        professional: {
          title: 'Développeur Web Fullstack',
          company: 'VibeCoder',
          experience: '4 ans',
          skills: [
            'React', 'Next.js', 'Node.js', 'MongoDB', 
            'TypeScript', 'Python', 'AWS', 'Docker',
            'E-commerce', 'SaaS', 'API Development'
          ],
          website: 'https://vibecoder.com',
          linkedin: 'https://linkedin.com/in/louiscyrano',
          github: 'https://github.com/louiscyrano'
        }
      },
      
      permissions: [
        'all_access',
        'manage_users',
        'manage_stores',
        'manage_plans',
        'manage_subscriptions',
        'manage_suppliers',
        'view_analytics',
        'system_settings'
      ],
      
      isEmailVerified: true,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date()
    };

    const superAdmin = await User.create(superAdminData);

    return NextResponse.json({
      success: true,
      data: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role
      },
      message: "Profil super administrateur créé avec succès"
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création super admin:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la création du super administrateur",
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/setup/plans - Créer les plans d'abonnement par défaut
export async function PUT(request) {
  try {
    await dbConnect();

    const defaultPlans = [
      {
        name: 'Starter',
        slug: 'starter',
        description: 'Parfait pour débuter votre activité e-commerce',
        pricing: {
          monthly: 29,
          yearly: 290,
          setup: 0
        },
        features: {
          maxStores: 1,
          maxProducts: 100,
          maxOrders: 500,
          maxStorage: 1024, // 1GB
          maxBandwidth: 10240, // 10GB
          customDomain: false,
          advancedAnalytics: false,
          dropshipping: false,
          aiFeatures: false,
          prioritySupport: false,
          whiteLabel: false
        },
        permissions: ['basic_access', 'manage_own_store'],
        allowedRoles: ['user'],
        isPopular: false,
        isActive: true,
        order: 1
      },
      {
        name: 'Professional',
        slug: 'professional',
        description: 'Pour les entreprises en croissance',
        pricing: {
          monthly: 79,
          yearly: 790,
          setup: 0
        },
        features: {
          maxStores: 3,
          maxProducts: 1000,
          maxOrders: 5000,
          maxStorage: 5120, // 5GB
          maxBandwidth: 51200, // 50GB
          customDomain: true,
          advancedAnalytics: true,
          dropshipping: true,
          aiFeatures: true,
          prioritySupport: false,
          whiteLabel: false
        },
        permissions: ['advanced_access', 'manage_multiple_stores', 'use_dropshipping'],
        allowedRoles: ['user', 'vendor'],
        isPopular: true,
        isActive: true,
        order: 2
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'Solution complète pour les grandes entreprises',
        pricing: {
          monthly: 199,
          yearly: 1990,
          setup: 0
        },
        features: {
          maxStores: 10,
          maxProducts: 10000,
          maxOrders: 50000,
          maxStorage: 20480, // 20GB
          maxBandwidth: 204800, // 200GB
          customDomain: true,
          advancedAnalytics: true,
          dropshipping: true,
          aiFeatures: true,
          prioritySupport: true,
          whiteLabel: true
        },
        permissions: [
          'enterprise_access', 
          'manage_unlimited_stores', 
          'use_all_features',
          'priority_support'
        ],
        allowedRoles: ['user', 'vendor', 'admin'],
        isPopular: false,
        isActive: true,
        order: 3
      },
      {
        name: 'Agency',
        slug: 'agency',
        description: 'Pour les agences gérant plusieurs clients',
        pricing: {
          monthly: 399,
          yearly: 3990,
          setup: 0
        },
        features: {
          maxStores: 50,
          maxProducts: 50000,
          maxOrders: 100000,
          maxStorage: 51200, // 50GB
          maxBandwidth: 512000, // 500GB
          customDomain: true,
          advancedAnalytics: true,
          dropshipping: true,
          aiFeatures: true,
          prioritySupport: true,
          whiteLabel: true
        },
        permissions: [
          'agency_access',
          'manage_client_stores',
          'white_label_access',
          'advanced_reporting'
        ],
        allowedRoles: ['admin'],
        isPopular: false,
        isActive: true,
        order: 4
      }
    ];

    // Supprimer les plans existants et créer les nouveaux
    await SubscriptionPlan.deleteMany({});
    const createdPlans = await SubscriptionPlan.insertMany(defaultPlans);

    return NextResponse.json({
      success: true,
      data: createdPlans,
      message: `${createdPlans.length} plans d'abonnement créés avec succès`
    });

  } catch (error) {
    console.error('Erreur création plans:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la création des plans",
      error: error.message
    }, { status: 500 });
  }
}

