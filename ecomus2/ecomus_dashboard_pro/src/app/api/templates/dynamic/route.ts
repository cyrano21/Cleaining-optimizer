// ✅ FICHIER : src/app/api/templates/dynamic/route.ts
// API pour la gestion dynamique des templates et de leurs sections modulaires

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Template from "@/models/Template";
import TemplateSection from "@/models/TemplateSection";
import Store from "@/models/Store";

interface TemplateWithSections {
  _id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  sections: any[];
  features: string[];
  isActive: boolean;
  isPremium: boolean;
  price?: number;
}

// GET - Récupérer tous les templates avec leurs sections
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');
    const storeId = searchParams.get('storeId');
    
    // Construction de la requête
    const query: any = { isActive: true };
    if (category) query.category = category;
    if (isPremium !== null) query.isPremium = isPremium === 'true';

    // Récupération des templates avec leurs sections
    const templates = await Template.find(query)
      .populate({
        path: 'sections',
        model: 'TemplateSection',
        select: 'name description component props isRequired isCustomizable order'
      })
      .select('name category description preview features isActive isPremium price createdAt')
      .sort({ category: 1, name: 1 })
      .lean();

    // Si un storeId est fourni, vérifier quels templates sont compatibles
    let storeCompatibility: any = {};
    if (storeId) {
      const store = await Store.findById(storeId)
        .select('subscription sections customizations')
        .lean();
      
      if (store) {
        templates.forEach(template => {
          const isPremiumTemplate = template.isPremium;
          const hasValidSubscription = store.subscription?.plan !== 'free' || !isPremiumTemplate;
          
          storeCompatibility[template._id] = {
            compatible: hasValidSubscription,
            reason: hasValidSubscription ? null : 'Abonnement premium requis',
            currentSections: store.sections || [],
            templateSections: template.sections?.map((s: any) => s.name) || []
          };
        });
      }
    }

    // Groupement par catégorie pour une meilleure organisation
    const templatesByCategory = templates.reduce((acc: any, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push({
        ...template,
        compatibility: storeCompatibility[template._id] || null
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        templates: templates.map(template => ({
          ...template,
          compatibility: storeCompatibility[template._id] || null
        })),
        templatesByCategory,
        totalTemplates: templates.length,
        categories: Object.keys(templatesByCategory)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des templates:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur lors de la récupération des templates",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau template avec ses sections
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      name,
      category,
      description,
      preview,
      features = [],
      sections = [],
      isPremium = false,
      price = 0
    } = body;

    // Validation des données requises
    if (!name || !category || !description) {
      return NextResponse.json(
        { error: "Nom, catégorie et description sont requis" },
        { status: 400 }
      );
    }

    // Création du template
    const template = new Template({
      name,
      category,
      description,
      preview,
      features,
      isPremium,
      price: isPremium ? price : 0,
      isActive: true
    });

    await template.save();

    // Création des sections associées
    const createdSections = [];
    for (const sectionData of sections) {
      const section = new TemplateSection({
        ...sectionData,
        templateId: template._id
      });
      await section.save();
      createdSections.push(section);
    }

    // Mise à jour du template avec les références des sections
    template.sections = createdSections.map(s => s._id);
    await template.save();

    // Récupération du template complet
    const completeTemplate = await Template.findById(template._id)
      .populate('sections')
      .lean();

    return NextResponse.json({
      success: true,
      message: "Template créé avec succès",
      data: completeTemplate,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Erreur lors de la création du template:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur lors de la création du template",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un template et ses sections
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      templateId,
      name,
      category,
      description,
      preview,
      features,
      sections,
      isPremium,
      price,
      isActive
    } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: "ID du template requis" },
        { status: 400 }
      );
    }

    // Mise à jour du template
    const updateData: any = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (preview) updateData.preview = preview;
    if (features) updateData.features = features;
    if (isPremium !== undefined) updateData.isPremium = isPremium;
    if (price !== undefined) updateData.price = isPremium ? price : 0;
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await Template.findByIdAndUpdate(
      templateId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!template) {
      return NextResponse.json(
        { error: "Template non trouvé" },
        { status: 404 }
      );
    }

    // Mise à jour des sections si fournies
    if (sections && Array.isArray(sections)) {
      // Supprimer les anciennes sections
      await TemplateSection.deleteMany({ templateId });
      
      // Créer les nouvelles sections
      const newSections = [];
      for (const sectionData of sections) {
        const section = new TemplateSection({
          ...sectionData,
          templateId: template._id
        });
        await section.save();
        newSections.push(section._id);
      }
      
      // Mettre à jour les références dans le template
      template.sections = newSections;
      await template.save();
    }

    // Récupération du template mis à jour
    const updatedTemplate = await Template.findById(template._id)
      .populate('sections')
      .lean();

    return NextResponse.json({
      success: true,
      message: "Template mis à jour avec succès",
      data: updatedTemplate,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du template:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur lors de la mise à jour du template",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un template et ses sections
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');

    if (!templateId) {
      return NextResponse.json(
        { error: "ID du template requis" },
        { status: 400 }
      );
    }

    // Vérifier si le template est utilisé par des stores
    const storesUsingTemplate = await Store.countDocuments({ templateId });
    
    if (storesUsingTemplate > 0) {
      return NextResponse.json(
        { 
          error: "Impossible de supprimer le template car il est utilisé par des stores",
          storesCount: storesUsingTemplate
        },
        { status: 409 }
      );
    }

    // Supprimer les sections associées
    await TemplateSection.deleteMany({ templateId });
    
    // Supprimer le template
    const deletedTemplate = await Template.findByIdAndDelete(templateId);

    if (!deletedTemplate) {
      return NextResponse.json(
        { error: "Template non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Template supprimé avec succès",
      data: { deletedTemplateId: templateId },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur lors de la suppression du template:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur lors de la suppression du template",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

