import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import Template from "@/models/Template";

// GET /api/templates/admin/[templateId] - Récupérer un template spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  
  const { templateId } = await params;
  
  if (!templateId) {
    return NextResponse.json({ error: 'ID du template manquant' }, { status: 400 });
  }
  
  await connectDB();
  
  try {
    const template = await Template.findById(templateId).lean();
    
    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Erreur lors de la récupération du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du template' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/admin/[templateId] - Mettre à jour un template
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  
  const { templateId } = await params;
  
  if (!templateId) {
    return NextResponse.json({ error: 'ID du template manquant' }, { status: 400 });
  }
  
  await connectDB();
  
  try {
    const body = await req.json();
    
    // Si le slug change, vérifier l'unicité
    if (body.slug) {
      const existingTemplate = await Template.findOne({ 
        slug: body.slug, 
        _id: { $ne: templateId } 
      });
      if (existingTemplate) {
        return NextResponse.json(
          { error: 'Un template avec ce slug existe déjà' },
          { status: 409 }
        );
      }
    }
    
    const template = await Template.findByIdAndUpdate(
      templateId,
      { 
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/admin/[templateId] - Supprimer un template
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  
  const { templateId } = await params;
  
  if (!templateId) {
    return NextResponse.json({ error: 'ID du template manquant' }, { status: 400 });
  }
  
  await connectDB();
  
  try {
    const template = await Template.findByIdAndDelete(templateId);
    
    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Template supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du template' },
      { status: 500 }
    );
  }
}
