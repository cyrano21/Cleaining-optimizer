// ✅ FICHIER : src/pages/api/stores/[slug]/sections.ts
// API REST PATCH pour mettre à jour les sections activées d'un store

import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import Store from "@/models/Store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { sections } = req.body;

  if (!sections || !Array.isArray(sections)) {
    return res.status(400).json({ message: "Sections invalides" });
  }

  try {
    await connectDB();
    const result = await Store.findOneAndUpdate(
      { slug },
      { $set: { sections } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Boutique non trouvée" });
    }

    return res.status(200).json({ message: "Sections mises à jour", sections: result.sections });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur", error });
  }
}
