import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    // Trouver toutes les boutiques qui n'ont pas les champs logo/banner
    const storesToUpdate = await Store.find({
      $or: [
        { logo: { $exists: false } },
        { banner: { $exists: false } },
        { logo: null },
        { banner: null },
        { logo: "" },
        { banner: "" }
      ]
    });

    console.log(`🔧 Trouvé ${storesToUpdate.length} boutique(s) à mettre à jour`);

    const updateResults = [];

    for (const store of storesToUpdate) {
      const updateFields: any = {};
      
      if (!store.logo) {
        updateFields.logo = "/images/store-logo.svg";
      }
      
      if (!store.banner) {
        updateFields.banner = "/images/store-cover.svg";
      }

      if (Object.keys(updateFields).length > 0) {
        const updated = await Store.findByIdAndUpdate(
          store._id,
          updateFields,
          { new: true }
        );

        updateResults.push({
          id: store._id.toString(),
          name: store.name,
          fieldsUpdated: Object.keys(updateFields),
          newValues: updateFields
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updateResults.length} boutique(s) mise(s) à jour`,
      results: updateResults
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des boutiques:', error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
