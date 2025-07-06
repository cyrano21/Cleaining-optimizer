import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectDB } from '../../../../../lib/mongodb';
import Product from '../../../../../models/Product';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions (admin ou vendor)
    if (!['admin', 'vendor'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file');
    const productId = formData.get('productId');
    const modelName = formData.get('name') || 'Modèle 3D';
    const description = formData.get('description') || '';

    if (!file || !productId) {
      return NextResponse.json(
        { error: 'Fichier et ID produit requis' },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Vérifier le format du fichier 3D
    const allowedFormats = ['glb', 'gltf', 'obj', 'fbx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedFormats.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Format de fichier non supporté. Formats acceptés: GLB, GLTF, OBJ, FBX' },
        { status: 400 }
      );
    }

    // Upload vers Cloudinary (raw upload pour les fichiers 3D)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'ecomus/3d-models',
          public_id: `${productId}_${Date.now()}`,
          format: fileExtension
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Créer un thumbnail pour le modèle 3D (image par défaut)
    const thumbnailUrl = `https://res.cloudinary.com/dwens2ze5/image/upload/v1748996742/ecomus/3d-thumbnail.jpg`;

    // Ajouter le modèle 3D au produit
    const newModel = {
      url: uploadResponse.secure_url,
      format: fileExtension,
      size: buffer.length,
      thumbnail: thumbnailUrl,
      name: modelName,
      description: description,
      isActive: true,
      uploadedAt: new Date()
    };

    await Product.findByIdAndUpdate(
      productId,
      { $push: { models3D: newModel } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      model: newModel,
      message: 'Modèle 3D uploadé avec succès'
    });

  } catch (error) {
    console.error('Erreur upload 3D:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du modèle 3D' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
    }

    const product = await Product.findById(productId).select('models3D');
    
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      models3D: product.models3D || [],
      count: product.models3D?.length || 0
    });

  } catch (error) {
    console.error('Erreur récupération modèles 3D:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des modèles 3D' },
      { status: 500 }
    );
  }
}
