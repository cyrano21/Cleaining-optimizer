import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb"; // utilise ton connecteur MongoDB existant

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
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("stores").findOneAndUpdate(
      { slug },
      { $set: { sections } },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ message: "Boutique non trouvée" });
    }

    return res.status(200).json({ message: "Sections mises à jour", sections: result.value.sections });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur", error });
  }
}
